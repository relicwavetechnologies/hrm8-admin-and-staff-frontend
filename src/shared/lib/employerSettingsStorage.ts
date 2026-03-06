import { EmployerSettings, NotificationSettings } from "@/shared/types/employerCRM";
import { createActivity } from "@/shared/lib/employerCRMStorage";

const STORAGE_KEY = 'employer_settings';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailOnJobPosted: true,
  emailOnInvoiceDue: true,
  emailOnSubscriptionChange: true,
  emailOnLowBalance: false,
};

export function getEmployerSettings(employerId: string): EmployerSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  let settings = all.find((s: EmployerSettings) => s.employerId === employerId);
  
  if (!settings) {
    settings = {
      employerId,
      tags: [],
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    all.push(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  
  return settings;
}

export function updateAccountManager(
  employerId: string,
  managerId: string | undefined,
  managerName: string | undefined
): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex((s: EmployerSettings) => s.employerId === employerId);
  
  if (index === -1) {
    const newSettings: EmployerSettings = {
      employerId,
      accountManagerId: managerId,
      accountManagerName: managerName,
      tags: [],
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
  } else {
    all[index].accountManagerId = managerId;
    all[index].accountManagerName = managerName;
    all[index].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Log activity
  const action = managerName 
    ? `Account manager assigned: ${managerName}`
    : 'Account manager unassigned';
  createActivity(employerId, 'account-updated', action);
  
  return true;
}

export function updatePrimaryRecruiter(
  employerId: string,
  recruiterId: string | undefined,
  recruiterName: string | undefined
): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex((s: EmployerSettings) => s.employerId === employerId);
  
  if (index === -1) {
    const newSettings: EmployerSettings = {
      employerId,
      primaryRecruiterId: recruiterId,
      primaryRecruiterName: recruiterName,
      tags: [],
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
  } else {
    all[index].primaryRecruiterId = recruiterId;
    all[index].primaryRecruiterName = recruiterName;
    all[index].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Log activity
  const action = recruiterName 
    ? `Primary recruiter assigned: ${recruiterName}`
    : 'Primary recruiter unassigned';
  createActivity(employerId, 'account-updated', action);
  
  return true;
}

export function updateTerritory(
  employerId: string,
  territory: string | undefined,
  region: string | undefined
): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex((s: EmployerSettings) => s.employerId === employerId);
  
  if (index === -1) {
    const newSettings: EmployerSettings = {
      employerId,
      territory,
      region,
      tags: [],
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
  } else {
    all[index].territory = territory;
    all[index].region = region;
    all[index].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Log activity
  createActivity(
    employerId,
    'account-updated',
    `Territory updated: ${territory || 'Unassigned'}${region ? ` - ${region}` : ''}`
  );
  
  return true;
}

export function updateTags(employerId: string, tags: string[]): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex((s: EmployerSettings) => s.employerId === employerId);
  
  if (index === -1) {
    const newSettings: EmployerSettings = {
      employerId,
      tags,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
  } else {
    all[index].tags = tags;
    all[index].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Log activity
  createActivity(employerId, 'account-updated', 'Tags updated');
  
  return true;
}

export function updateNotificationSettings(
  employerId: string,
  settings: NotificationSettings
): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  const index = all.findIndex((s: EmployerSettings) => s.employerId === employerId);
  
  if (index === -1) {
    const newSettings: EmployerSettings = {
      employerId,
      tags: [],
      notificationSettings: settings,
      updatedAt: new Date().toISOString(),
    };
    all.push(newSettings);
  } else {
    all[index].notificationSettings = settings;
    all[index].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  return true;
}
