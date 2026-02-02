/**
 * Job Allocation Service
 * API service for job allocation management
 */

import { apiClient } from '@/shared/lib/apiClient';
import { JobPipelineStatus } from '@/types/job';

export interface JobForAllocation {
  id: string;
  title: string;
  location: string;
  companyId: string;
  companyName?: string;
  regionId?: string;
  category?: string;
  status: string;
  createdAt: string;
  assignmentMode?: 'AUTO' | 'MANUAL';
  assignmentSource?: string;
  assignedConsultantId?: string;
  assignedConsultantName?: string;
}

export type UnassignedJob = JobForAllocation; // Alias for backward compatibility

export interface ConsultantForAssignment {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  availability: string;
  regionId?: string;
  currentJobs: number;
  maxJobs: number;
  industryExpertise?: string[];
  languages?: string[];
}

export interface JobAssignmentInfo {
  job: {
    id: string;
    title: string;
    assignedConsultantId?: string;
    assignmentSource?: string;
    assignmentMode?: 'AUTO' | 'MANUAL';
    regionId?: string;
  };
  consultants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  pipeline?: JobPipelineStatus;
}

class JobAllocationService {
  async assignConsultant(jobId: string, consultantId: string, assignmentSource?: string) {
    return apiClient.post(`/api/hrm8/jobs/${jobId}/assign-consultant`, {
      consultantId,
      assignmentSource
    });
  }

  async assignRegion(jobId: string, regionId: string) {
    return apiClient.post(`/api/hrm8/jobs/${jobId}/assign-region`, { regionId });
  }

  async unassign(jobId: string) {
    return apiClient.post(`/api/hrm8/jobs/${jobId}/unassign`);
  }

  async getJobConsultants(jobId: string) {
    return apiClient.get<{ consultants: Array<{ id: string; firstName: string; lastName: string; email: string }> }>(
      `/api/hrm8/jobs/${jobId}/consultants`
    );
  }

  async getJobsForAllocation(filters?: {
    regionId?: string;
    companyId?: string;
    assignmentStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'ALL';
    consultantId?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.regionId && filters.regionId !== 'all') queryParams.append('regionId', filters.regionId);
    if (filters?.companyId) queryParams.append('companyId', filters.companyId);
    if (filters?.assignmentStatus) queryParams.append('assignmentStatus', filters.assignmentStatus);
    if (filters?.consultantId && filters.consultantId !== 'all') queryParams.append('consultantId', filters.consultantId);
    if (filters?.search) queryParams.append('search', filters.search);

    const query = queryParams.toString();
    return apiClient.get<{ jobs: JobForAllocation[] }>(
      `/api/hrm8/jobs/allocation${query ? `?${query}` : ''}`
    );
  }

  // Alias for backward compatibility
  async getUnassignedJobs(filters?: { regionId?: string; companyId?: string }) {
    return this.getJobsForAllocation({ ...filters, assignmentStatus: 'UNASSIGNED' });
  }

  async getAssignmentInfo(jobId: string) {
    return apiClient.get<JobAssignmentInfo>(`/api/hrm8/jobs/${jobId}/assignment-info`);
  }

  async autoAssign(jobId: string) {
    return apiClient.post<{ consultantId?: string; job: any; consultants: any[] }>(
      `/api/hrm8/jobs/${jobId}/auto-assign`
    );
  }

  async getConsultantsForAssignment(filters: {
    regionId: string;
    role?: string;
    availability?: string;
    industry?: string;
    language?: string;
    search?: string;
  }) {
    console.debug('[jobAllocationService] getConsultantsForAssignment', filters);
    const queryParams = new URLSearchParams();
    queryParams.append('regionId', filters.regionId);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.availability) queryParams.append('availability', filters.availability);
    if (filters.industry) queryParams.append('industry', filters.industry);
    if (filters.language) queryParams.append('language', filters.language);
    if (filters.search) queryParams.append('search', filters.search);

    return apiClient.get<{ consultants: ConsultantForAssignment[] }>(
      `/api/hrm8/consultants/for-assignment?${queryParams.toString()}`
    );
  }
}

export const jobAllocationService = new JobAllocationService();
