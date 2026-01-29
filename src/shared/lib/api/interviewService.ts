/**
 * Interview Service - Frontend API client
 */

import { apiClient } from '../api';

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

export interface RatingCriterion {
  id: string;
  name: string;
  description?: string;
  weight: number; // Percentage (0-100)
  threshold?: number; // 1-5 rating threshold
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
  applicationId: string;
  candidateId: string;
  candidate?: Candidate;
  jobId: string;
  jobRoundId?: string;
  jobRound?: {
    id: string;
    name: string;
    job?: {
      id: string;
      title: string;
    };
  };
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL' | 'TECHNICAL';
  interviewerIds?: string[];
  isAutoScheduled?: boolean;
  rescheduledFrom?: string;
  rescheduledAt?: string;
  rescheduledBy?: string;
  cancellationReason?: string;
  noShowReason?: string;
  overallScore?: number;
  recommendation?: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  ratingCriteriaScores?: any;
  recordingUrl?: string;
  transcript?: any;
  feedback?: any;
  interviewFeedbacks?: Array<{
    id: string;
    interviewer_name: string;
    overall_rating: number;
    notes: string;
    createdAt: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class InterviewService {
  /**
   * Get interview configuration for a job round
   */
  async getInterviewConfig(jobId: string, roundId: string) {
    return apiClient.get<{ config: InterviewConfiguration | null }>(
      `/api/jobs/${jobId}/rounds/${roundId}/interview-config`
    );
  }

  /**
   * Configure interview for a job round
   */
  async configureInterview(jobId: string, roundId: string, config: CreateInterviewConfigRequest) {
    return apiClient.post<{ message: string }>(
      `/api/jobs/${jobId}/rounds/${roundId}/interview-config`,
      config
    );
  }

  /**
   * Get all interviews (with optional filters)
   */
  async getInterviews(filters?: {
    jobId?: string;
    jobRoundId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.jobRoundId) params.append('jobRoundId', filters.jobRoundId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return apiClient.get<{ interviews: Interview[] }>(
      `/api/interviews${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get interview by ID
   */
  async getInterview(id: string) {
    return apiClient.get<{ interview: Interview }>(`/api/interviews/${id}`);
  }

  /**
   * Get calendar events (FullCalendar format)
   */
  async getCalendarEvents(filters?: {
    jobId?: string;
    jobRoundId?: string;
    status?: string;
    start?: string;
    end?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.jobRoundId) params.append('jobRoundId', filters.jobRoundId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start) params.append('start', filters.start);
    if (filters?.end) params.append('end', filters.end);

    const query = params.toString();
    return apiClient.get<any[]>(`/api/interviews/calendar/events${query ? `?${query}` : ''}`);
  }

  /**
   * Reschedule interview
   */
  async rescheduleInterview(id: string, newScheduledDate: string, reason?: string) {
    return apiClient.put<{ interview: Interview; message: string }>(
      `/api/interviews/${id}/reschedule`,
      { newScheduledDate, reason }
    );
  }

  /**
   * Cancel interview
   */
  async cancelInterview(id: string, reason: string) {
    return apiClient.put<{ interview: Interview; message: string }>(
      `/api/interviews/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Mark interview as no-show
   */
  async markAsNoShow(id: string, reason?: string) {
    return apiClient.put<{ interview: Interview; message: string }>(
      `/api/interviews/${id}/no-show`,
      { reason }
    );
  }

  /**
   * Update interview status
   */
  async updateStatus(id: string, status: 'IN_PROGRESS' | 'COMPLETED') {
    return apiClient.put<{ interview: Interview; message: string }>(
      `/api/interviews/${id}/status`,
      { status }
    );
  }

  /**
   * Add feedback to interview
   */
  async addFeedback(id: string, feedback: {
    overallRating?: number;
    notes?: string;
  }) {
    return apiClient.post<{ message: string }>(
      `/api/interviews/${id}/feedback`,
      feedback
    );
  }
}

export const interviewService = new InterviewService();
