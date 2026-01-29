import type { SalesActivity, ActivityType } from '@/shared/types/salesActivity';

const STORAGE_KEY = 'staffing_crm_sales_activities';

function initializeMockData(): SalesActivity[] {
  return [
    {
      id: 'act-1',
      salesAgentId: 'sa-1',
      salesAgentName: 'Michael Reynolds',
      employerId: 'employer-1',
      employerName: 'TechCorp Solutions',
      opportunityId: 'opp-1',
      activityType: 'meeting',
      subject: 'Product Demo - ATS Platform',
      description: 'Demonstrated AI-powered candidate matching and automated screening features',
      outcome: 'successful',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-2',
      salesAgentId: 'sa-2',
      salesAgentName: 'Jessica Chen',
      employerId: 'employer-2',
      employerName: 'Global Industries Inc',
      opportunityId: 'opp-2',
      activityType: 'call',
      subject: 'Discovery Call - Hiring Needs',
      description: 'Discussed Q2 hiring plans and RPO requirements',
      outcome: 'follow-up-needed',
      scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-3',
      salesAgentId: 'sa-2',
      salesAgentName: 'Jessica Chen',
      employerId: 'employer-4',
      employerName: 'StartUp Ventures',
      opportunityId: 'opp-3',
      activityType: 'email',
      subject: 'HRMS Proposal Follow-up',
      description: 'Sent detailed pricing breakdown and ROI analysis',
      outcome: 'successful',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getAllActivities(): SalesActivity[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockData = initializeMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(stored);
}

export function getActivityById(id: string): SalesActivity | undefined {
  return getAllActivities().find(act => act.id === id);
}

export function createActivity(activity: Omit<SalesActivity, 'id' | 'createdAt' | 'updatedAt'>): SalesActivity {
  const activities = getAllActivities();
  const newActivity: SalesActivity = {
    ...activity,
    id: `act-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  activities.push(newActivity);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  return newActivity;
}

export function updateActivity(id: string, updates: Partial<SalesActivity>): SalesActivity | null {
  const activities = getAllActivities();
  const index = activities.findIndex(act => act.id === id);
  if (index === -1) return null;
  
  activities[index] = {
    ...activities[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  return activities[index];
}

export function deleteActivity(id: string): boolean {
  const activities = getAllActivities();
  const filtered = activities.filter(act => act.id !== id);
  if (filtered.length === activities.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getActivitiesBySalesAgent(agentId: string): SalesActivity[] {
  return getAllActivities().filter(act => act.salesAgentId === agentId);
}

export function getActivitiesByOpportunity(opportunityId: string): SalesActivity[] {
  return getAllActivities().filter(act => act.opportunityId === opportunityId);
}

export function getActivitiesByEmployer(employerId: string): SalesActivity[] {
  return getAllActivities().filter(act => act.employerId === employerId);
}

export function getActivitiesByType(type: ActivityType): SalesActivity[] {
  return getAllActivities().filter(act => act.activityType === type);
}

export function getUpcomingActivities(): SalesActivity[] {
  const now = new Date();
  return getAllActivities()
    .filter(act => act.scheduledAt && !act.completedAt && new Date(act.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
}

export function getRecentActivities(limit: number = 10): SalesActivity[] {
  return getAllActivities()
    .filter(act => act.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, limit);
}

export function getActivityStats() {
  const activities = getAllActivities();
  const completed = activities.filter(a => a.completedAt);
  
  return {
    total: activities.length,
    completed: completed.length,
    upcoming: getUpcomingActivities().length,
    successful: completed.filter(a => a.outcome === 'successful').length,
    unsuccessful: completed.filter(a => a.outcome === 'unsuccessful').length,
    followUpNeeded: completed.filter(a => a.outcome === 'follow-up-needed').length,
    byType: {
      calls: activities.filter(a => a.activityType === 'call').length,
      emails: activities.filter(a => a.activityType === 'email').length,
      meetings: activities.filter(a => a.activityType === 'meeting').length,
      demos: activities.filter(a => a.activityType === 'demo').length,
    },
  };
}
