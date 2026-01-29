import type { BackgroundCheck } from './backgroundCheck';

export interface SLAConfiguration {
  id: string;
  name: string;
  status: BackgroundCheck['status'];
  targetDays: number;
  warningThresholdPercent: number; // e.g., 80 means warn at 80% of target
  criticalThresholdPercent: number; // e.g., 100 means critical at 100% of target
  businessDaysOnly: boolean;
  enabled: boolean;
  notifyAtWarning: boolean;
  notifyAtCritical: boolean;
  notifyAtBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SLAStatus {
  checkId: string;
  candidateName: string;
  status: BackgroundCheck['status'];
  slaConfig?: SLAConfiguration;
  startDate: string;
  targetDate: string;
  daysElapsed: number;
  daysRemaining: number;
  percentComplete: number;
  slaStatus: 'on-track' | 'warning' | 'critical' | 'breached';
  breached: boolean;
  breachedDate?: string;
}

export const DEFAULT_SLA_CONFIGS: Omit<SLAConfiguration, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Pending Consent',
    status: 'pending-consent',
    targetDays: 3,
    warningThresholdPercent: 70,
    criticalThresholdPercent: 90,
    businessDaysOnly: true,
    enabled: true,
    notifyAtWarning: true,
    notifyAtCritical: true,
    notifyAtBreached: true,
  },
  {
    name: 'In Progress',
    status: 'in-progress',
    targetDays: 7,
    warningThresholdPercent: 70,
    criticalThresholdPercent: 90,
    businessDaysOnly: true,
    enabled: true,
    notifyAtWarning: true,
    notifyAtCritical: true,
    notifyAtBreached: true,
  },
  {
    name: 'Issues Found - Requires Review',
    status: 'issues-found',
    targetDays: 2,
    warningThresholdPercent: 50,
    criticalThresholdPercent: 80,
    businessDaysOnly: true,
    enabled: true,
    notifyAtWarning: true,
    notifyAtCritical: true,
    notifyAtBreached: true,
  },
];
