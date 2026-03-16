import { apiClient } from '../apiClient';

export interface RatingCriterion {
  id: string;
  name: string;
  description?: string;
  weight: number;
  threshold?: number;
}

export interface CreateInterviewConfigRequest {
  enabled: boolean;
  autoSchedule?: boolean;
  requireBeforeProgression?: boolean;
  requireAllInterviewers?: boolean;
  interviewFormat?: 'LIVE_VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL';
  defaultDuration?: number;
  requiresInterviewer?: boolean;
  autoScheduleWindowDays?: number;
  availableTimeSlots?: string[];
  bufferTimeMinutes?: number;
  calendarIntegration?: string;
  autoRescheduleOnNoShow?: boolean;
  autoRescheduleOnCancel?: boolean;
  useCustomCriteria?: boolean;
  ratingCriteria?: RatingCriterion[];
  passThreshold?: number;
  scoringMethod?: 'AVERAGE' | 'WEIGHTED' | 'CONSENSUS';
  autoMoveOnPass?: boolean;
  passCriteria?: 'SCORE_THRESHOLD' | 'RECOMMENDATION' | 'RATING_CRITERIA' | 'COMBINATION';
  nextRoundOnPassId?: string;
  autoRejectOnFail?: boolean;
  failCriteria?: 'SCORE_BELOW_THRESHOLD' | 'RECOMMENDATION_NO' | 'RATING_CRITERIA_FAIL' | 'COMBINATION';
  rejectRoundId?: string;
  requiresManualReview?: boolean;
  templateId?: string;
  questions?: any[];
  agenda?: string;
  assignedInterviewerIds?: string[];
}

export interface InterviewConfiguration {
  id?: string;
  jobRoundId: string;
  enabled: boolean;
  autoSchedule: boolean;
  requireBeforeProgression?: boolean;
  requireAllInterviewers?: boolean;
  interviewFormat: 'LIVE_VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL';
  defaultDuration?: number;
  requiresInterviewer?: boolean;
  autoScheduleWindowDays?: number;
  availableTimeSlots?: string[];
  bufferTimeMinutes?: number;
  calendarIntegration?: string;
  autoRescheduleOnNoShow?: boolean;
  autoRescheduleOnCancel?: boolean;
  useCustomCriteria?: boolean;
  ratingCriteria?: RatingCriterion[];
  passThreshold?: number;
  scoringMethod?: 'AVERAGE' | 'WEIGHTED' | 'CONSENSUS';
  autoMoveOnPass?: boolean;
  passCriteria?: 'SCORE_THRESHOLD' | 'RECOMMENDATION' | 'RATING_CRITERIA' | 'COMBINATION';
  nextRoundOnPassId?: string;
  autoRejectOnFail?: boolean;
  failCriteria?: 'SCORE_BELOW_THRESHOLD' | 'RECOMMENDATION_NO' | 'RATING_CRITERIA_FAIL' | 'COMBINATION';
  rejectRoundId?: string;
  requiresManualReview?: boolean;
  templateId?: string;
  questions?: any[];
  agenda?: string;
  assignedInterviewerIds?: string[];
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  applicationId?: string;
  interviewerIds: string[];
  interviewerNames: string[];
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel' | 'VIDEO' | 'LIVE_VIDEO' | 'PHONE' | 'IN_PERSON' | 'TECHNICAL' | 'PANEL';
  round: number;
  scheduledDate: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'IN_PROGRESS';
  notes?: string;
  feedback?: any[];
  interviewFeedbacks?: any[];
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
}

class InterviewService {
  async getInterviews(filters?: any) {
    // Construct query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<Interview[]>(`/api/interviews?${params.toString()}`);
  }

  async getInterview(id: string) {
    return apiClient.get<Interview>(`/api/interviews/${id}`);
  }

  async updateStatus(id: string, status: string, notes?: string) {
    return apiClient.put<Interview>(`/api/interviews/${id}/status`, { status, notes });
  }

  async addFeedback(id: string, feedback: any) {
    return apiClient.post<Interview>(`/api/interviews/${id}/feedback`, feedback);
  }

  async rescheduleInterview(id: string, newDate: Date | string, reason?: string) {
    return apiClient.post<Interview>(`/api/interviews/${id}/reschedule`, { newDate, reason });
  }

  async cancelInterview(id: string, reason: string) {
    return apiClient.post<Interview>(`/api/interviews/${id}/cancel`, { reason });
  }

  async markAsNoShow(id: string, reason: string) {
    return apiClient.post<Interview>(`/api/interviews/${id}/no-show`, { reason });
  }

  async getInterviewConfig(jobId: string, roundId: string) {
    return apiClient.get<any>(`/api/jobs/${jobId}/rounds/${roundId}/interview-config`);
  }

  async configureInterview(jobId: string, roundId: string, config: any) {
    return apiClient.post<any>(`/api/jobs/${jobId}/rounds/${roundId}/interview-config`, config);
  }
}

export const interviewService = new InterviewService();
