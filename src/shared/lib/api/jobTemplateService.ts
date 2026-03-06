/**
 * Job Template API Service
 * Handles all job template-related API calls
 */

import { apiClient } from '../api';
import { CreateJobRequest } from './jobService';

export interface JobTemplate {
  id: string;
  companyId: string;
  createdBy: string;
  name: string;
  description?: string;
  category: string;
  isShared: boolean;
  sourceJobId?: string;
  jobData: CreateJobRequest; // All job data stored as JSON
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  isShared?: boolean;
  jobData: CreateJobRequest; // All job data
}

export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

export interface GetTemplatesFilters {
  category?: string;
  search?: string;
}

class JobTemplateService {
  /**
   * Create template from existing job
   */
  async createFromJob(jobId: string, name: string, description?: string, category?: string) {
    return apiClient.post<JobTemplate>(`/api/job-templates/from-job/${jobId}`, {
      name,
      description,
      category,
    });
  }

  /**
   * Create template from scratch
   */
  async createTemplate(data: CreateTemplateRequest) {
    return apiClient.post<JobTemplate>('/api/job-templates', data);
  }

  /**
   * Get all templates for the company
   */
  async getTemplates(filters?: GetTemplatesFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/job-templates${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<JobTemplate[]>(endpoint);
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string) {
    return apiClient.get<JobTemplate>(`/api/job-templates/${id}`);
  }

  /**
   * Get template data formatted for job creation
   */
  async getTemplateJobData(id: string) {
    return apiClient.get<CreateJobRequest>(`/api/job-templates/${id}/job-data`);
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest) {
    return apiClient.put<JobTemplate>(`/api/job-templates/${id}`, data);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string) {
    return apiClient.delete(`/api/job-templates/${id}`);
  }

  /**
   * Record template usage (increment usage count)
   */
  async recordUsage(id: string) {
    return apiClient.post<JobTemplate>(`/api/job-templates/${id}/use`);
  }
}

export const jobTemplateService = new JobTemplateService();
