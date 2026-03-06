/**
 * Staff Management Service
 * API service for HRM8 admin staff management (Consultants, Sales Agents, etc.)
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'SUSPENDED';
  regionId?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  industryExpertise?: string[];
  resumeUrl?: string;
  paymentMethod?: Record<string, unknown>;
  taxInformation?: Record<string, unknown>;
  availability: 'AVAILABLE' | 'AT_CAPACITY' | 'UNAVAILABLE';
  maxEmployers: number;
  currentEmployers: number;
  maxJobs: number;
  currentJobs: number;
  commissionStructure?: string;
  defaultCommissionRate?: number;
  defaultCurrency?: string;
  payoutCurrency?: string | null;
  payoutCurrencyConfirmedAt?: string | null;
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

export interface StaffEmailProvisioningInfo {
  success: boolean;
  provider?: 'google' | 'microsoft';
  email?: string;
  providerUserId?: string;
  tempPassword?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface StaffCreateResponse {
  consultant: StaffMember;
  emailProvisioning?: StaffEmailProvisioningInfo;
}

export interface StaffOverviewData {
  summary: {
    total_staff: number;
    active_staff: number;
    suspended_staff: number;
    on_leave_staff: number;
    inactive_staff: number;
    total_revenue: number;
    total_placements: number;
    avg_success_rate: number;
    avg_utilization_percent: number;
  };
  role_distribution: Array<{ role: string; count: number }>;
  status_distribution: Array<{ status: string; count: number }>;
  capacity_distribution: {
    under_utilized: number;
    optimal: number;
    near_capacity: number;
    over_capacity: number;
  };
  top_performers: Array<{
    id: string;
    name: string;
    role: string;
    total_revenue: number;
    total_placements: number;
    success_rate: number;
  }>;
  workload_alerts: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    current_jobs: number;
    max_jobs: number;
    utilization_percent: number;
  }>;
  recently_joined: Array<{
    id: string;
    name: string;
    role: string;
    created_at: string;
  }>;
}

class StaffService {
  async getAll(filters?: {
    regionId?: string;
    role?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.status) queryParams.append('status', filters.status);

    const query = queryParams.toString();
    return apiClient.get<{ consultants: StaffMember[] }>(`/api/hrm8/consultants${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ consultant: StaffMember }>(`/api/hrm8/consultants/${id}`);
  }

  async getOverview(filters?: { regionId?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);
    const query = queryParams.toString();

    return apiClient.get<StaffOverviewData>(`/api/hrm8/consultants/overview${query ? `?${query}` : ''}`);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photo?: string;
    role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
    regionId?: string;
    defaultCommissionRate?: number;
    defaultCurrency?: string;
  }) {
    return apiClient.post<StaffCreateResponse>('/api/hrm8/consultants', data);
  }

  async update(id: string, data: Partial<StaffMember>) {
    return apiClient.put<{ consultant: StaffMember }>(`/api/hrm8/consultants/${id}`, data);
  }

  async assignRegion(consultantId: string, regionId: string) {
    return apiClient.post<{ consultant: StaffMember }>(`/api/hrm8/consultants/${consultantId}/assign-region`, { regionId });
  }

  async suspend(id: string) {
    return apiClient.post(`/api/hrm8/consultants/${id}/suspend`);
  }

  async reactivate(id: string) {
    return apiClient.post(`/api/hrm8/consultants/${id}/reactivate`);
  }

  async delete(id: string) {
    return apiClient.delete(`/api/hrm8/consultants/${id}`);
  }


  async generateEmail(data: {
    firstName: string;
    lastName: string;
    consultantId?: string;
  }) {
    return apiClient.post<{ email: string }>('/api/hrm8/consultants/generate-email', data);
  }

  async reassignJobs(id: string, targetConsultantId: string) {
    return apiClient.post<{ count: number }>(`/api/hrm8/consultants/${id}/reassign-jobs`, { targetConsultantId });
  }

  async getPendingTasks(id: string) {
    return apiClient.get<{
      jobs: { id: string; title: string; companyName: string; status: string }[];
      leads: { id: string; companyName: string; status: string }[];
      conversionRequests: { id: string; companyName: string; status: string }[];
      pendingCommissions: { id: string; amount: number; status: string }[];
      totalCount: number;
    }>(`/api/hrm8/consultants/${id}/pending-tasks`);
  }

  async getReassignmentOptions(id: string) {
    return apiClient.get<{
      consultants: { id: string; firstName: string; lastName: string; email: string }[];
    }>(`/api/hrm8/consultants/${id}/reassignment-options`);
  }

  async changeRoleWithTasks(
    id: string,
    role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360',
    taskAction: 'REASSIGN' | 'TERMINATE' | 'KEEP',
    targetConsultantId?: string
  ) {
    return apiClient.put<{ taskResult?: any }>(`/api/hrm8/consultants/${id}/change-role`, {
      role,
      taskAction,
      targetConsultantId
    });
  }
}

export const staffService = new StaffService();
