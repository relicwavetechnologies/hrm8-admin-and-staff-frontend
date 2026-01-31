import type { EscalationRule, EscalationEvent } from '@/shared/types/escalation';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';

const RULES_KEY = 'hrm8_escalation_rules';
const EVENTS_KEY = 'hrm8_escalation_events';

// Default escalation rules
const DEFAULT_RULES: Omit<EscalationRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Consent Not Received - 5 Days',
    description: 'Escalate when consent has not been received for 5 days',
    status: 'pending-consent',
    daysThreshold: 5,
    escalateTo: ['manager-1'],
    escalateToNames: ['Hiring Manager'],
    notifyOriginalInitiator: true,
    priority: 'high',
    enabled: true,
    createdBy: 'system',
  },
  {
    name: 'In Progress - 14 Days',
    description: 'Escalate when check has been in progress for 14 days',
    status: 'in-progress',
    daysThreshold: 14,
    escalateTo: ['manager-1', 'hr-director'],
    escalateToNames: ['Hiring Manager', 'HR Director'],
    notifyOriginalInitiator: true,
    priority: 'medium',
    enabled: true,
    createdBy: 'system',
  },
  {
    name: 'Issues Found - Not Reviewed - 3 Days',
    description: 'Escalate when issues have not been reviewed for 3 days',
    status: 'issues-found',
    daysThreshold: 3,
    escalateTo: ['hr-director'],
    escalateToNames: ['HR Director'],
    notifyOriginalInitiator: true,
    priority: 'critical',
    enabled: true,
    createdBy: 'system',
  },
];

function initializeRules() {
  const existing = localStorage.getItem(RULES_KEY);
  if (!existing) {
    const rules = DEFAULT_RULES.map((rule, index) => ({
      ...rule,
      id: `rule-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  }
}

export function getEscalationRules(): EscalationRule[] {
  initializeRules();
  const data = localStorage.getItem(RULES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEscalationRule(rule: EscalationRule): void {
  const rules = getEscalationRules();
  const index = rules.findIndex(r => r.id === rule.id);

  if (index !== -1) {
    rules[index] = { ...rule, updatedAt: new Date().toISOString() };
  } else {
    rules.push(rule);
  }

  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function deleteEscalationRule(ruleId: string): void {
  const rules = getEscalationRules().filter(r => r.id !== ruleId);
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

function getEscalationEvents(): EscalationEvent[] {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEscalationEvent(event: EscalationEvent): void {
  const events = getEscalationEvents();
  events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getCheckEscalations(checkId: string): EscalationEvent[] {
  return getEscalationEvents().filter(e => e.checkId === checkId);
}

export function acknowledgeEscalation(eventId: string, userId: string, _userName: string): void {
  const events = getEscalationEvents();
  const index = events.findIndex(e => e.id === eventId);

  if (index !== -1) {
    events[index].acknowledged = true;
    events[index].acknowledgedBy = userId;
    events[index].acknowledgedAt = new Date().toISOString();
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
}

export function resolveEscalation(eventId: string, userId: string, _userName: string, notes?: string): void {
  const events = getEscalationEvents();
  const index = events.findIndex(e => e.id === eventId);

  if (index !== -1) {
    events[index].resolved = true;
    events[index].resolvedBy = userId;
    events[index].resolvedAt = new Date().toISOString();
    if (notes) events[index].notes = notes;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
}

export function processEscalations(): void {
  const rules = getEscalationRules().filter(r => r.enabled);
  const checks = getBackgroundChecks();
  const now = new Date();

  rules.forEach(rule => {
    const eligibleChecks = checks.filter(check => {
      if (check.status !== rule.status) return false;

      const statusDate = new Date(check.initiatedDate);
      const daysPending = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPending < rule.daysThreshold) return false;

      // Check if already escalated recently
      const recentEscalations = getCheckEscalations(check.id).filter(e => {
        const escalatedDate = new Date(e.escalatedAt);
        const hoursSince = (now.getTime() - escalatedDate.getTime()) / (1000 * 60 * 60);
        return hoursSince < 24; // Don't escalate more than once per day
      });

      return recentEscalations.length === 0;
    });

    eligibleChecks.forEach(check => {
      triggerEscalation(rule, check);
    });
  });
}

function triggerEscalation(rule: EscalationRule, check: BackgroundCheck): void {
  const now = new Date();
  const statusDate = new Date(check.initiatedDate);
  const daysPending = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));

  const event: EscalationEvent = {
    id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ruleId: rule.id,
    ruleName: rule.name,
    checkId: check.id,
    candidateName: check.candidateName,
    status: check.status,
    daysPending,
    escalatedTo: rule.escalateTo,
    escalatedAt: now.toISOString(),
    acknowledged: false,
    resolved: false,
  };

  saveEscalationEvent(event);

  // Send notifications to escalation targets
  rule.escalateTo.forEach(userId => {
    createNotification({
      userId,
      category: 'system',
      type: 'warning',
      priority: rule.priority,
      title: `Background Check Escalation: ${rule.name}`,
      message: `${check.candidateName}'s background check has been ${check.status} for ${daysPending} days. Immediate attention required.`,
      link: `/background-checks/${check.id}`,
      read: false,
      archived: false,
      metadata: {
        entityType: 'background-check',
        entityId: check.id,
        escalationId: event.id,
        ruleId: rule.id,
      }
    });
  });

  // Notify original initiator if configured
  if (rule.notifyOriginalInitiator) {
    createNotification({
      userId: check.initiatedBy,
      category: 'system',
      type: 'info',
      priority: 'medium',
      title: `Background Check Escalated`,
      message: `${check.candidateName}'s background check has been escalated to management due to ${daysPending} days in ${check.status} status.`,
      link: `/background-checks/${check.id}`,
      read: false,
      archived: false,
      metadata: {
        entityType: 'background-check',
        entityId: check.id,
        escalationId: event.id,
      }
    });
  }
}

export function getEscalationStats() {
  const events = getEscalationEvents();
  const last30Days = events.filter(e => {
    const date = new Date(e.escalatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  return {
    totalEscalations: events.length,
    escalationsLast30Days: last30Days.length,
    activeEscalations: events.filter(e => !e.resolved).length,
    acknowledgedNotResolved: events.filter(e => e.acknowledged && !e.resolved).length,
    averageResolutionTime: calculateAverageResolutionTime(events.filter(e => e.resolved)),
  };
}

function calculateAverageResolutionTime(resolvedEvents: EscalationEvent[]): number {
  if (resolvedEvents.length === 0) return 0;

  const totalHours = resolvedEvents.reduce((sum, event) => {
    const escalated = new Date(event.escalatedAt).getTime();
    const resolved = new Date(event.resolvedAt!).getTime();
    return sum + (resolved - escalated) / (1000 * 60 * 60);
  }, 0);

  return Math.round(totalHours / resolvedEvents.length);
}
