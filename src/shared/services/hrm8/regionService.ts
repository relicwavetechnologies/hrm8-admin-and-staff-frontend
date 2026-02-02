/**
 * Region Service
 * API service for region management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface Region {
  id: string;
  name: string;
  code: string;
  country: string;
  stateProvince?: string;
  city?: string;
  boundaries?: Record<string, unknown>;
  ownerType: 'HRM8' | 'LICENSEE';
  licenseeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  licensee?: {
    id: string;
    name: string;
    legalEntityName: string;
    email: string;
  } | null;
}

class RegionService {
  async getAll(filters?: {
    ownerType?: string;
    licenseeId?: string;
    isActive?: boolean;
    country?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.ownerType) queryParams.append('ownerType', filters.ownerType);
    if (filters?.licenseeId) queryParams.append('licenseeId', filters.licenseeId);
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.country) queryParams.append('country', filters.country);

    const query = queryParams.toString();
    return apiClient.get<{ regions: Region[] }>(`/api/hrm8/regions${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ region: Region }>(`/api/hrm8/regions/${id}`);
  }

  async create(data: {
    name: string;
    code: string;
    country: string;
    stateProvince?: string;
    city?: string;
    boundaries?: Record<string, unknown>;
    ownerType?: 'HRM8' | 'LICENSEE';
    licenseeId?: string;
  }) {
    return apiClient.post<{ region: Region }>('/api/hrm8/regions', data);
  }

  async update(id: string, data: Partial<Region>) {
    return apiClient.put<{ region: Region }>(`/api/hrm8/regions/${id}`, data);
  }

  async delete(id: string) {
    return apiClient.delete(`/api/hrm8/regions/${id}`);
  }

  async assignLicensee(regionId: string, licenseeId: string) {
    return apiClient.post<{ region: Region }>(`/api/hrm8/regions/${regionId}/assign-licensee`, { licenseeId });
  }

  async unassignLicensee(regionId: string) {
    return apiClient.post<{ region: Region }>(`/api/hrm8/regions/${regionId}/unassign-licensee`);
  }

  /**
   * Get transfer impact analysis - counts of entities that will be transferred
   */
  async getTransferImpact(regionId: string) {
    return apiClient.get<{
      companies: number;
      jobs: number;
      consultants: number;
      openInvoices: number;
      opportunities: number;
    }>(`/api/hrm8/regions/${regionId}/transfer-impact`);
  }

  /**
   * Transfer region ownership to a new licensee
   */
  async transferOwnership(regionId: string, data: {
    targetLicenseeId: string;
    auditNote?: string;
  }) {
    return apiClient.post<{ region: Region; transferredCounts: Record<string, number> }>(
      `/api/hrm8/regions/${regionId}/transfer-ownership`,
      data
    );
  }
}

export const regionService = new RegionService();



