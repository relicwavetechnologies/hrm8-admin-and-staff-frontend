/**
 * Video Interview Service
 * Handles video interview API calls
 */

import { apiClient } from './api';
import { InterviewFeedback } from '../types/interview';

export interface VideoInterview {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  interviewerIds: string[];
  recordingUrl?: string;
  transcript?: Record<string, unknown>;
  feedback?: InterviewFeedback[];
  interviewFeedbacks?: InterviewFeedback[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields from backend
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
  };
  application?: {
    id: string;
    candidateName: string;
    jobTitle: string;
  };
}

export interface CreateVideoInterviewRequest {
  applicationId: string;
  scheduledDate: string; // ISO string
  duration: number;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  interviewerIds: string[];
  notes?: string;
}

export interface VideoInterviewFilters {
  jobId?: string;
  candidateId?: string;
  interviewerId?: string;
  status?: VideoInterview['status'];
  startDate?: string;
  endDate?: string;
}

class VideoInterviewService {
  /**
   * Get all video interviews with optional filters
   */
  async getInterviews(filters?: VideoInterviewFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.jobId) queryParams.append('jobId', filters.jobId);
    if (filters?.candidateId) queryParams.append('candidateId', filters.candidateId);
    if (filters?.interviewerId) queryParams.append('interviewerId', filters.interviewerId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/api/video-interviews${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<{ interviews: VideoInterview[] }>(endpoint);
  }

  /**
   * Get interviews for a specific job
   */
  async getJobInterviews(jobId: string) {
    return apiClient.get<{ interviews: VideoInterview[] }>(`/api/video-interviews/job/${jobId}`);
  }

  /**
   * Get a single interview by ID
   */
  async getInterview(id: string) {
    return apiClient.get<{ interview: VideoInterview }>(`/api/video-interviews/${id}`);
  }

  /**
   * Create a new video interview
   */
  async createInterview(data: CreateVideoInterviewRequest) {
    return apiClient.post<{ interview: VideoInterview; message: string }>(
      '/api/video-interviews',
      data
    );
  }

  /**
   * Update interview status
   */
  async updateStatus(id: string, status: VideoInterview['status']) {
    return apiClient.patch<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/status`,
      { status }
    );
  }

  /**
   * Check progression status
   */
  async getProgressionStatus(id: string) {
    return apiClient.get<{
      canProgress: boolean;
      missingInterviewers: string[];
      submittedCount: number;
      totalCount: number;
      requiresAllInterviewers: boolean;
    }>(`/api/video-interviews/${id}/progression-status`);
  }

  /**
   * Add feedback to an interview
   */
  async addFeedback(id: string, feedback: {
    overallRating?: number;
    notes?: string;
    interviewerId?: string;
    interviewerName?: string;
    interviewerEmail?: string;
  }) {
    return apiClient.post<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/feedback`,
      feedback
    );
  }

  /**
   * Update an existing interview
   */
  async updateInterview(id: string, data: Partial<CreateVideoInterviewRequest & { status?: VideoInterview['status'] }>) {
    return apiClient.put<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}`,
      data
    );
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(id: string) {
    return apiClient.put<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/cancel`,
      {}
    );
  }

  /**
   * Delete an interview
   */
  async deleteInterview(id: string) {
    return apiClient.delete<{ message: string }>(`/api/video-interviews/${id}`);
  }

  /**
   * Generate AI-suggested interview times
   */
  async generateAISuggestions(data: {
    jobId: string;
    candidateIds: string[];
    preferredDuration?: number;
    preferredTimeSlots?: string[];
    preferredDays?: string[];
    timezone?: string;
    startDate?: string;
    endDate?: string;
    avoidTimes?: string[];
  }) {
    return apiClient.post<{
      suggestions: Array<{
        candidateId: string;
        applicationId: string;
        suggestedDate: string;
        alternativeDates: string[];
        reasoning?: string;
        confidence?: number;
      }>;
      generatedAt: string;
      jobInfo: {
        title: string;
        location: string;
        urgency?: string;
      };
    }>('/api/video-interviews/auto-schedule', data);
  }

  /**
   * Finalize and save interviews from AI suggestions
   */
  async finalizeInterviews(suggestions: Array<{
    applicationId: string;
    candidateId: string;
    jobId: string;
    scheduledDate: string;
    duration?: number;
    type?: 'VIDEO' | 'PHONE' | 'IN_PERSON';
    interviewerIds?: string[];
    notes?: string;
  }>) {
    return apiClient.post<{
      interviews: VideoInterview[];
      count: number;
      message: string;
    }>('/api/video-interviews/finalize', { suggestions });
  }

  /**
   * Get calendar events for a job
   */
  async getJobCalendarEvents(jobId: string, startDate: string, endDate: string) {
    return apiClient.get<{
      events: Array<{
        id: string;
        title: string;
        start: string;
        end: string;
        meetingLink?: string;
        status: string;
        type: string;
        candidateId: string;
        candidateName: string;
        candidateEmail: string;
        applicationId: string;
        calendarEventId?: string;
      }>;
    }>(`/api/video-interviews/job/${jobId}/calendar?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const videoInterviewService = new VideoInterviewService();

