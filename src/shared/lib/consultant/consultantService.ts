/**
 * Consultant Service
 * API service for consultant self-service operations
 */

import { apiClient } from '../api';
import { JobPipelineStage, JobPipelineStatus } from '@/shared/types/job';

export interface ConsultantProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
  status: string;
  regionId?: string;
  regionName?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  industryExpertise?: string[];
  resumeUrl?: string;
  linkedinUrl?: string; // New field
  paymentMethod?: Record<string, unknown>;
  taxInformation?: Record<string, unknown>;
  availability: 'AVAILABLE' | 'AT_CAPACITY' | 'UNAVAILABLE';
  maxEmployers: number;
  currentEmployers: number;
  maxJobs: number;
  currentJobs: number;
  commissionStructure?: string;
  defaultCommissionRate?: number;
  totalCommissionsPaid: number;
  pendingCommissions: number;
  totalPlacements: number;
  totalRevenue: number;
  successRate: number;
  averageDaysToFill?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
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
}

export const consultantService = new ConsultantService();



