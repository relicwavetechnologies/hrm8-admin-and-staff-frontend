import type { ConsultantSettings } from '@/shared/types/consultantCRM';
import { createActivity } from './consultantCRMStorage';

const STORAGE_KEY = 'consultant_settings';

const DEFAULT_SETTINGS: Omit<ConsultantSettings, 'consultantId' | 'updatedAt'> = {
  maxEmployers: 10,
  maxJobs: 15,
  autoAssign: false,
  commissionStructure: 'percentage',
  defaultCommissionRate: 15,
  emailNotifications: true,
  smsNotifications: false,
  notifyOnAssignment: true,
  notifyOnCommission: true,
  notifyOnPerformanceAlert: true,
  canViewAllCandidates: false,
  canViewAllEmployers: false,
  canManageOwnJobs: true,
  restrictedAccess: false,
  tags: [],
};

export function getConsultantSettings(consultantId: string): ConsultantSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all: ConsultantSettings[] = stored ? JSON.parse(stored) : [];
  
  const existing = all.find(s => s.consultantId === consultantId);
  if (existing) return existing;
  
  // Create default settings
  const newSettings: ConsultantSettings = {
    ...DEFAULT_SETTINGS,
    consultantId,
    updatedAt: new Date().toISOString(),
  };
  
  all.push(newSettings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  return newSettings;
}

export function updateConsultantSettings(
  consultantId: string,
  updates: Partial<ConsultantSettings>
): ConsultantSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all: ConsultantSettings[] = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex(s => s.consultantId === consultantId);
  
  if (index === -1) {
    const newSettings: ConsultantSettings = {
      ...DEFAULT_SETTINGS,
      ...updates,
      consultantId,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newSettings;
  }
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  createActivity(
    consultantId,
    'profile-updated',
    'Settings updated',
    { fields: Object.keys(updates) }
  );
  
  return all[index];
}

export function updateCapacitySettings(
  consultantId: string,
  maxEmployers: number,
  maxJobs: number,
  autoAssign: boolean
): boolean {
  updateConsultantSettings(consultantId, {
    maxEmployers,
    maxJobs,
    autoAssign,
  });
  return true;
}

export function updateCommissionSettings(
  consultantId: string,
  structure: ConsultantSettings['commissionStructure'],
  rate?: number,
  customRates?: Record<string, number>
): boolean {
  updateConsultantSettings(consultantId, {
    commissionStructure: structure,
    defaultCommissionRate: rate,
    customCommissionRates: customRates,
  });
  return true;
}

export function updateNotificationSettings(
  consultantId: string,
  settings: Partial<Pick<
    ConsultantSettings,
    'emailNotifications' | 'smsNotifications' | 'notifyOnAssignment' | 'notifyOnCommission' | 'notifyOnPerformanceAlert'
  >>
): boolean {
  updateConsultantSettings(consultantId, settings);
  return true;
}

export function updateAccessSettings(
  consultantId: string,
  settings: Partial<Pick<
    ConsultantSettings,
    'canViewAllCandidates' | 'canViewAllEmployers' | 'canManageOwnJobs' | 'restrictedAccess'
  >>
): boolean {
  updateConsultantSettings(consultantId, settings);
  return true;
}

export function updateTags(consultantId: string, tags: string[]): boolean {
  updateConsultantSettings(consultantId, { tags });
  return true;
}
