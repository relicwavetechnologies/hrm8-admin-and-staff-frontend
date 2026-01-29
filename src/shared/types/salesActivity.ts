export type ActivityType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow-up' | 'other';
export type ActivityOutcome = 'successful' | 'unsuccessful' | 'follow-up-needed';

export interface SalesActivity {
  id: string;
  salesAgentId: string;
  salesAgentName: string;
  employerId?: string;
  employerName?: string;
  opportunityId?: string;
  
  activityType: ActivityType;
  subject: string;
  description?: string;
  outcome?: ActivityOutcome;
  
  scheduledAt?: string;
  completedAt?: string;
  duration?: number; // minutes
  
  createdAt: string;
  updatedAt: string;
}
