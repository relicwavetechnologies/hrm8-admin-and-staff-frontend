import type { SLAConfiguration, SLAStatus } from '@/shared/types/sla';
import { DEFAULT_SLA_CONFIGS } from '@/shared/types/sla';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';

const SLA_CONFIG_KEY = 'hrm8_sla_configurations';
const SLA_NOTIFICATIONS_KEY = 'hrm8_sla_notifications_sent';

function initializeSLAConfigs() {
  const existing = localStorage.getItem(SLA_CONFIG_KEY);
  if (!existing) {
    const configs = (DEFAULT_SLA_CONFIGS as any[]).map((config, index) => ({
      ...config,
      id: `sla-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(SLA_CONFIG_KEY, JSON.stringify(configs));
  }
}

export function getSLAConfigurations(): SLAConfiguration[] {
  initializeSLAConfigs();
  const data = localStorage.getItem(SLA_CONFIG_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSLAConfiguration(config: SLAConfiguration): void {
  const configs = getSLAConfigurations();
  const index = configs.findIndex(c => c.id === config.id);
  
  if (index !== -1) {
    configs[index] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    configs.push(config);
  }
  
  localStorage.setItem(SLA_CONFIG_KEY, JSON.stringify(configs));
}

export function getSLAForStatus(status: BackgroundCheck['status']): SLAConfiguration | undefined {
  return getSLAConfigurations().find(c => c.status === status && c.enabled);
}

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

export function calculateSLAStatus(check: BackgroundCheck): SLAStatus | null {
  const slaConfig = getSLAForStatus(check.status);
  if (!slaConfig) return null;
  
  const now = new Date();
  const startDate = new Date(check.initiatedDate);
  
  const daysElapsed = slaConfig.businessDaysOnly
    ? calculateBusinessDays(startDate, now)
    : Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const targetDate = slaConfig.businessDaysOnly
    ? addBusinessDays(startDate, slaConfig.targetDays)
    : new Date(startDate.getTime() + slaConfig.targetDays * 24 * 60 * 60 * 1000);
  
  const daysRemaining = slaConfig.businessDaysOnly
    ? calculateBusinessDays(now, targetDate)
    : Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const percentComplete = (daysElapsed / slaConfig.targetDays) * 100;
  
  let slaStatus: SLAStatus['slaStatus'] = 'on-track';
  let breached = false;
  let breachedDate: string | undefined;
  
  if (percentComplete >= slaConfig.criticalThresholdPercent) {
    slaStatus = 'critical';
  } else if (percentComplete >= slaConfig.warningThresholdPercent) {
    slaStatus = 'warning';
  }
  
  if (daysElapsed > slaConfig.targetDays) {
    slaStatus = 'breached';
    breached = true;
    breachedDate = targetDate.toISOString();
  }
  
  return {
    checkId: check.id,
    candidateName: check.candidateName,
    status: check.status,
    slaConfig,
    startDate: startDate.toISOString(),
    targetDate: targetDate.toISOString(),
    daysElapsed,
    daysRemaining,
    percentComplete: Math.min(percentComplete, 150), // Cap at 150%
    slaStatus,
    breached,
    breachedDate,
  };
}

export function getAllSLAStatuses(): SLAStatus[] {
  const checks = getBackgroundChecks().filter(c => 
    c.status !== 'completed' && c.status !== 'cancelled'
  );
  
  return checks
    .map(check => calculateSLAStatus(check))
    .filter(sla => sla !== null) as SLAStatus[];
}

export function getBreachedSLAs(): SLAStatus[] {
  return getAllSLAStatuses().filter(sla => sla.breached);
}

export function getCriticalSLAs(): SLAStatus[] {
  return getAllSLAStatuses().filter(sla => sla.slaStatus === 'critical' && !sla.breached);
}

// Track which notifications have been sent to avoid duplicates
function getNotificationsSent(): Record<string, string[]> {
  const data = localStorage.getItem(SLA_NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : {};
}

function markNotificationSent(checkId: string, type: 'warning' | 'critical' | 'breached'): void {
  const sent = getNotificationsSent();
  if (!sent[checkId]) {
    sent[checkId] = [];
  }
  if (!sent[checkId].includes(type)) {
    sent[checkId].push(type);
  }
  localStorage.setItem(SLA_NOTIFICATIONS_KEY, JSON.stringify(sent));
}

function wasNotificationSent(checkId: string, type: 'warning' | 'critical' | 'breached'): boolean {
  const sent = getNotificationsSent();
  return sent[checkId]?.includes(type) || false;
}

export function processSLANotifications(): void {
  const slaStatuses = getAllSLAStatuses();
  
  slaStatuses.forEach(sla => {
    const check = getBackgroundChecks().find(c => c.id === sla.checkId);
    if (!check || !sla.slaConfig) return;
    
    // Breached notification
    if (sla.breached && sla.slaConfig.notifyAtBreached && !wasNotificationSent(sla.checkId, 'breached')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'error',
        priority: 'critical',
        title: `SLA Breached: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} has exceeded the ${sla.slaConfig.targetDays} day SLA for ${sla.status} status.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'breached',
        }
      });
      markNotificationSent(sla.checkId, 'breached');
    }
    
    // Critical notification
    else if (sla.slaStatus === 'critical' && sla.slaConfig.notifyAtCritical && !wasNotificationSent(sla.checkId, 'critical')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'warning',
        priority: 'high',
        title: `SLA Critical: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} is approaching SLA breach (${Math.round(sla.percentComplete)}% complete). ${sla.daysRemaining} days remaining.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'critical',
        }
      });
      markNotificationSent(sla.checkId, 'critical');
    }
    
    // Warning notification
    else if (sla.slaStatus === 'warning' && sla.slaConfig.notifyAtWarning && !wasNotificationSent(sla.checkId, 'warning')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'info',
        priority: 'medium',
        title: `SLA Warning: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} is ${Math.round(sla.percentComplete)}% through its SLA target. ${sla.daysRemaining} days remaining.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'warning',
        }
      });
      markNotificationSent(sla.checkId, 'warning');
    }
  });
}

export function getSLAStats() {
  const allSLAs = getAllSLAStatuses();
  
  return {
    total: allSLAs.length,
    onTrack: allSLAs.filter(s => s.slaStatus === 'on-track').length,
    warning: allSLAs.filter(s => s.slaStatus === 'warning').length,
    critical: allSLAs.filter(s => s.slaStatus === 'critical').length,
    breached: allSLAs.filter(s => s.breached).length,
    averagePercentComplete: Math.round(
      allSLAs.reduce((sum, s) => sum + s.percentComplete, 0) / allSLAs.length
    ),
  };
}
