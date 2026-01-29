import { AssessmentType, AssessmentProvider } from './assessment';

export type ScheduledAssessmentStatus = 'scheduled' | 'sent' | 'cancelled' | 'failed';

export interface ScheduledAssessment {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId?: string;
  jobTitle?: string;
  assessmentType: AssessmentType;
  provider: AssessmentProvider;
  passThreshold: number;
  expiryDays: number;
  customInstructions?: string;
  scheduledDate: string; // ISO string
  scheduledTime: string; // HH:mm format
  timezone: string;
  status: ScheduledAssessmentStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  sentAt?: string;
  cancelledAt?: string;
  failureReason?: string;
  cost: number;
}
