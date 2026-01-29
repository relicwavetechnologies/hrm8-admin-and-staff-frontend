/**
 * Job API Service
 * Handles all job-related API calls
 */

import { apiClient } from '../api';
import { Job } from '@/shared/types/job';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'VISITOR';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD' | 'FILLED' | 'CANCELLED' | 'TEMPLATE';
export type HiringMode = 'SELF_MANAGED' | 'SHORTLISTING' | 'FULL_SERVICE' | 'EXECUTIVE_SEARCH';
export type WorkArrangement = 'ON_SITE' | 'REMOTE' | 'HYBRID';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'CASUAL';

export interface CreateJobRequest {
  title: string;
  description: string;
  jobSummary?: string;
  hiringMode: HiringMode;
  location: string;
  department?: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  numberOfVacancies?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryDescription?: string;
  category?: string;
  promotionalTags?: string[];
  featured?: boolean;
  stealth?: boolean;
  visibility?: string;
  expiryDate?: string;
  videoInterviewingEnabled?: boolean;
  assignmentMode?: 'AUTO' | 'MANUAL';
  regionId?: string;
  servicePackage?: string;
  requirements?: string[];
  responsibilities?: string[];
  tag_ids?: string[];
  category_id?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobStatus;
  closeDate?: string;
  assignedConsultantId?: string | null;
  screening_enabled?: boolean;
  automated_screening_enabled?: boolean;
  screening_criteria?: any;
  pre_interview_questionnaire_enabled?: boolean;
  requirements?: string[];
  responsibilities?: string[];
  hiringTeam?: any[];
  postingDate?: string;
  expiryDate?: string;
  servicePackage?: string;
}

export interface GetJobsFilters {
  status?: JobStatus;
  department?: string;
  location?: string;
  hiringMode?: HiringMode;
  includeArchived?: boolean; // If true, includes archived jobs. If false/undefined, excludes them
  onlyArchived?: boolean; // If true, returns only archived jobs
  page?: number; // Page number for pagination
  limit?: number; // Number of items per page
}

class JobService {
  /**
   * Create a new job
   */
  async createJob(data: CreateJobRequest) {
    return apiClient.post<Job>('/api/jobs', data);
  }

  /**
   * Get all jobs for the company
   */
  async getJobs(filters?: GetJobsFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.department) queryParams.append('department', filters.department);
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.hiringMode) queryParams.append('hiringMode', filters.hiringMode);
    if (filters?.includeArchived !== undefined) queryParams.append('includeArchived', filters.includeArchived.toString());
    if (filters?.onlyArchived) queryParams.append('onlyArchived', 'true');
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/jobs${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<{ jobs: Job[], total: number, page: number, limit: number }>(endpoint);
  }

  /**
   * Get job by ID
   */
  async getJobById(id: string) {
    return apiClient.get<Job>(`/api/jobs/${id}`);
  }

  /**
   * Update job
   */
  async updateJob(id: string, data: UpdateJobRequest) {
    return apiClient.put<Job>(`/api/jobs/${id}`, data);
  }

  /**
   * Delete job
   */
  async deleteJob(id: string) {
    return apiClient.delete(`/api/jobs/${id}`);
  }

  /**
   * Bulk delete jobs
   */
  async bulkDeleteJobs(jobIds: string[]) {
    return apiClient.post<{ deletedCount: number; message: string }>('/api/jobs/bulk-delete', { jobIds });
  }

  /**
   * Publish job (change status from DRAFT to OPEN)
   */
  async publishJob(id: string) {
    return apiClient.post<Job>(`/api/jobs/${id}/publish`);
  }

  /**
   * Save job as draft
   */
  async saveDraft(id: string, data: UpdateJobRequest) {
    return apiClient.post<Job>(`/api/jobs/${id}/save-draft`, data);
  }

  /**
   * Save job as template
   */
  async saveTemplate(id: string | null, data: CreateJobRequest) {
    const endpoint = id ? `/api/jobs/${id}/save-template` : `/api/jobs/new/save-template`;
    return apiClient.post<Job>(endpoint, data);
  }

  /**
   * Archive a job
   */
  async archiveJob(id: string) {
    return apiClient.post<Job>(`/api/jobs/${id}/archive`);
  }

  /**
   * Unarchive a job
   */
  async unarchiveJob(id: string) {
    return apiClient.post<Job>(`/api/jobs/${id}/unarchive`);
  }

  /**
   * Bulk archive jobs
   */
  async bulkArchiveJobs(jobIds: string[]) {
    return apiClient.post<{ archivedCount: number; message: string }>('/api/jobs/bulk-archive', { jobIds });
  }

  /**
   * Bulk unarchive jobs
   */
  async bulkUnarchiveJobs(jobIds: string[]) {
    return apiClient.post<{ unarchivedCount: number; message: string }>('/api/jobs/bulk-unarchive', { jobIds });
  }

  /**
   * Submit and activate job (after review step)
   */
  async submitAndActivate(id: string, paymentId?: string) {
    return apiClient.post<Job>(`/api/jobs/${id}/submit`, { paymentId });
  }

  /**
   * Update job alerts configuration
   */
  async updateAlerts(id: string, alertsConfig: {
    newApplicants?: boolean;
    inactivity?: boolean;
    deadlines?: boolean;
    inactivityDays?: number;
  }) {
    return apiClient.put<Job>(`/api/jobs/${id}/alerts`, alertsConfig);
  }

  /**
   * Save job as template (post-launch)
   */
  async saveAsTemplate(id: string, templateName: string, templateDescription?: string) {
    return apiClient.post<{ job: Job; templateId: string }>(`/api/jobs/${id}/save-as-template`, {
      templateName,
      templateDescription,
    });
  }
}

export const jobService = new JobService();

