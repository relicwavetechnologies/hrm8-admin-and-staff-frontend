import { apiClient } from '../apiClient';

export interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewerIds: string[];
  interviewerNames: string[];
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel';
  round: number;
  scheduledDate: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  notes?: string;
  feedback?: any[];
  createdAt: string;
  updatedAt: string;
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

  async rescheduleInterview(id: string, newDate: Date, reason: string) {
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