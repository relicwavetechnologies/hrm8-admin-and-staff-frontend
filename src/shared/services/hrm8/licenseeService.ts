/**
 * Regional Licensee Service
 * API service for regional licensee management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RegionalLicensee {
  id: string;
  name: string;
  legalEntityName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  agreementStartDate: string;
  agreementEndDate?: string;
  revenueSharePercent: number;
  exclusivity: boolean;
  contractFileUrl?: string;
  managerContact: string;
  financeContact?: string;
  complianceContact?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicenseeData {
  name: string;
  legalEntityName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  agreementStartDate: string;
  agreementEndDate?: string;
  revenueSharePercent: number;
  exclusivity?: boolean;
  contractFileUrl?: string;
  managerContact: string;
  financeContact?: string;
  complianceContact?: string;
  password?: string;
}

class LicenseeService {
  async getAll(filters?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);

    const query = queryParams.toString();
    return apiClient.get<{ licensees: RegionalLicensee[] }>(`/api/hrm8/licensees${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ licensee: RegionalLicensee }>(`/api/hrm8/licensees/${id}`);
  }

  async create(data: CreateLicenseeData) {
    return apiClient.post<{ licensee: RegionalLicensee }>('/api/hrm8/licensees', data);
  }

  async update(id: string, data: Partial<RegionalLicensee>) {
    return apiClient.put<{ licensee: RegionalLicensee }>(`/api/hrm8/licensees/${id}`, data);
  }

  async suspend(id: string, notes?: string) {
    return apiClient.post<{ jobsPaused: number; regionsAffected: number }>(`/api/hrm8/licensees/${id}/suspend`, { notes });
  }

  async reactivate(id: string, notes?: string) {
    return apiClient.post<{ jobsResumed: number }>(`/api/hrm8/licensees/${id}/reactivate`, { notes });
  }

  async terminate(id: string, notes?: string) {
    return apiClient.post<{ regionsUnassigned: number; finalSettlement?: { amount: number } }>(`/api/hrm8/licensees/${id}/terminate`, { notes });
  }

  async getImpactPreview(id: string) {
    return apiClient.get<{
      regions: number;
      activeJobs: number;
      consultants: number;
      pendingRevenue: number;
    }>(`/api/hrm8/licensees/${id}/impact-preview`);
  }
}

export const licenseeService = new LicenseeService();



