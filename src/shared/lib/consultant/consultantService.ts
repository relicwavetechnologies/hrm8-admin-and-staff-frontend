/**
 * Consultant Service
 * API service for consultant self-service operations
 */

import { apiClient } from '../api';
import { JobPipelineStage, JobPipelineStatus } from '@/shared/types/job';

export interface ConsultantProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  photo?: string;
  role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
  status: string;
  region_id?: string;
  region_name?: string;
  address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  industry_expertise?: string[];
  resume_url?: string;
  linkedin_url?: string;
  payment_method?: Record<string, unknown>;
  tax_information?: Record<string, unknown>;
  availability: 'AVAILABLE' | 'AT_CAPACITY' | 'UNAVAILABLE';
  max_employers: number;
  current_employers: number;
  max_jobs: number;
  current_jobs: number;
  commission_structure?: string;
  default_commission_rate?: number;
  total_commissions_paid: number;
  pending_commissions: number;
  total_placements: number;
  total_revenue: number;
  success_rate: number;
  average_days_to_fill?: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

class ConsultantService {
  async getProfile() {
    return apiClient.get<{ consultant: ConsultantProfile }>('/api/consultant/profile');
  }

  async updateProfile(data: Partial<ConsultantProfile>) {
    return apiClient.put<{ consultant: ConsultantProfile }>('/api/consultant/profile', data);
  }

  async getJobs(filters?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    const query = queryParams.toString();
    return apiClient.get<{ jobs: any[] }>(`/api/consultant/jobs${query ? `?${query}` : ''}`);
  }

  async getJobDetails(jobId: string) {
    return apiClient.get<{
      job: any;
      pipeline: any;
      team: any[];
      employer: any;
    }>(`/api/consultant/jobs/${jobId}`);
  }

  async submitShortlist(jobId: string, candidateIds: string[], notes?: string) {
    return apiClient.post(`/api/consultant/jobs/${jobId}/shortlist`, { candidateIds, notes });
  }

  async flagJob(jobId: string, issueType: string, description: string, severity: string) {
    return apiClient.post(`/api/consultant/jobs/${jobId}/flag`, { issueType, description, severity });
  }

  async logJobActivity(jobId: string, activityType: string, notes: string) {
    return apiClient.post(`/api/consultant/jobs/${jobId}/log`, { activityType, notes });
  }

  async getCommissions(filters?: { status?: string; commissionType?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.commissionType) queryParams.append('commissionType', filters.commissionType);

    const query = queryParams.toString();
    return apiClient.get<{ commissions: any[] }>(`/api/consultant/commissions${query ? `?${query}` : ''}`);
  }

  async getPerformance() {
    return apiClient.get<{
      metrics: {
        totalPlacements: number;
        totalRevenue: number;
        successRate: number;
        averageDaysToFill?: number;
        pendingCommissions: number;
        totalCommissionsPaid: number;
      }
    }>('/api/consultant/performance');
  }

  async getJobPipeline(jobId: string) {
    return apiClient.get<{ pipeline: JobPipelineStatus }>(`/api/consultant/jobs/${jobId}/pipeline`);
  }

  async updateJobPipeline(jobId: string, payload: { stage: JobPipelineStage; progress?: number; note?: string | null }) {
    return apiClient.patch<{ pipeline: JobPipelineStatus }>(`/api/consultant/jobs/${jobId}/pipeline`, payload);
  }

  async getDashboardAnalytics() {
    return apiClient.get<{
      targets: {
        monthlyRevenue: number;
        monthlyPlacements: number;
      };
      activeJobs: Array<{
        id: string;
        title: string;
        company: string;
        postedAt: string;
        activeCandidates: number;
      }>;
      pipeline: Array<{
        stage: string;
        count: number;
      }>;
      recentCommissions: Array<{
        id: string;
        amount: number;
        status: string;
        description: string;
        date: string;
        jobTitle?: string;
      }>;
      trends: Array<{
        name: string;
        revenue: number;
        placements: number;
        paid: number;
        pending: number;
      }>;
    }>('/api/consultant/analytics/dashboard');
  }

  // Messaging/Conversations
  async getConversations() {
    return apiClient.get<any>('/api/consultant/conversations');
  }

  async getMessages(conversationId: string) {
    return apiClient.get<any>(`/api/consultant/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string) {
    return apiClient.post<any>(`/api/consultant/conversations/${conversationId}/messages`, {
      content,
    });
  }

  async markMessagesRead(conversationId: string) {
    return apiClient.patch<any>(`/api/consultant/conversations/${conversationId}/read`, {});
  }
}

export const consultantService = new ConsultantService();



