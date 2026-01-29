export interface EmailPreference {
  workflowId: string;
  employeeEmail: string;
  preferences: {
    welcomeEmails: boolean;
    taskReminders: boolean;
    documentRequests: boolean;
    statusUpdates: boolean;
    generalAnnouncements: boolean;
  };
  unsubscribedAt?: Date;
  isFullyUnsubscribed: boolean;
  updatedAt: Date;
}

const STORAGE_KEY = "email_preferences";

export function getEmailPreferences(): EmailPreference[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const prefs = JSON.parse(saved);
    return prefs.map((p: any) => ({
      ...p,
      unsubscribedAt: p.unsubscribedAt ? new Date(p.unsubscribedAt) : undefined,
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error("Error loading email preferences:", error);
    return [];
  }
}

export function getPreferenceByWorkflowId(workflowId: string): EmailPreference | null {
  const prefs = getEmailPreferences();
  return prefs.find(p => p.workflowId === workflowId) || null;
}

export function getPreferenceByEmail(email: string): EmailPreference | null {
  const prefs = getEmailPreferences();
  return prefs.find(p => p.employeeEmail === email) || null;
}

export function createOrUpdatePreference(
  workflowId: string,
  employeeEmail: string,
  preferences: Partial<EmailPreference['preferences']>
): EmailPreference {
  const allPrefs = getEmailPreferences();
  const existingIndex = allPrefs.findIndex(p => p.workflowId === workflowId);

  const updatedPreference: EmailPreference = existingIndex >= 0
    ? {
        ...allPrefs[existingIndex],
        preferences: {
          ...allPrefs[existingIndex].preferences,
          ...preferences,
        },
        updatedAt: new Date(),
      }
    : {
        workflowId,
        employeeEmail,
        preferences: {
          welcomeEmails: preferences.welcomeEmails ?? true,
          taskReminders: preferences.taskReminders ?? true,
          documentRequests: preferences.documentRequests ?? true,
          statusUpdates: preferences.statusUpdates ?? true,
          generalAnnouncements: preferences.generalAnnouncements ?? true,
        },
        isFullyUnsubscribed: false,
        updatedAt: new Date(),
      };

  if (existingIndex >= 0) {
    allPrefs[existingIndex] = updatedPreference;
  } else {
    allPrefs.push(updatedPreference);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
  return updatedPreference;
}

export function unsubscribeFromAll(workflowId: string, employeeEmail: string): void {
  const allPrefs = getEmailPreferences();
  const existingIndex = allPrefs.findIndex(p => p.workflowId === workflowId);

  const unsubscribedPreference: EmailPreference = {
    workflowId,
    employeeEmail,
    preferences: {
      welcomeEmails: false,
      taskReminders: false,
      documentRequests: false,
      statusUpdates: false,
      generalAnnouncements: false,
    },
    isFullyUnsubscribed: true,
    unsubscribedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existingIndex >= 0) {
    allPrefs[existingIndex] = unsubscribedPreference;
  } else {
    allPrefs.push(unsubscribedPreference);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
}

export function resubscribe(workflowId: string): void {
  const allPrefs = getEmailPreferences();
  const pref = allPrefs.find(p => p.workflowId === workflowId);
  
  if (pref) {
    pref.isFullyUnsubscribed = false;
    pref.unsubscribedAt = undefined;
    pref.preferences = {
      welcomeEmails: true,
      taskReminders: true,
      documentRequests: true,
      statusUpdates: true,
      generalAnnouncements: true,
    };
    pref.updatedAt = new Date();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
  }
}

export function canSendEmailType(workflowId: string, emailType: string): boolean {
  const pref = getPreferenceByWorkflowId(workflowId);
  
  if (!pref) return true; // No preferences set, allow all
  if (pref.isFullyUnsubscribed) return false;

  // Map email types to preference keys
  const typeMap: Record<string, keyof EmailPreference['preferences']> = {
    'welcome': 'welcomeEmails',
    'Welcome Email': 'welcomeEmails',
    'task_reminder': 'taskReminders',
    'Task Reminder': 'taskReminders',
    'document_request': 'documentRequests',
    'Document Request': 'documentRequests',
    'status_update': 'statusUpdates',
    'Status Update': 'statusUpdates',
    'announcement': 'generalAnnouncements',
    'General Announcement': 'generalAnnouncements',
  };

  const prefKey = typeMap[emailType];
  if (!prefKey) return true; // Unknown type, allow by default

  return pref.preferences[prefKey];
}

export function getUnsubscribeStats() {
  const prefs = getEmailPreferences();
  const totalWithPrefs = prefs.length;
  const fullyUnsubscribed = prefs.filter(p => p.isFullyUnsubscribed).length;
  const partiallyUnsubscribed = prefs.filter(p => 
    !p.isFullyUnsubscribed && 
    Object.values(p.preferences).some(v => !v)
  ).length;

  return {
    totalWithPrefs,
    fullyUnsubscribed,
    partiallyUnsubscribed,
    subscribed: totalWithPrefs - fullyUnsubscribed - partiallyUnsubscribed,
  };
}
