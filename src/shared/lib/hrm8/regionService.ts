/**
 * Region Service
 * API service for region management
 */

import { apiClient } from '../api';

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
    // Transform camelCase to snake_case for API
    const apiData = {
      name: data.name,
      code: data.code,
      country: data.country,
      state_province: data.stateProvince,
      city: data.city,
      boundaries: data.boundaries,
      owner_type: data.ownerType,
      licensee_id: data.licenseeId,
    };
    return apiClient.post<{ region: Region }>('/api/hrm8/regions', apiData);
  }

  async update(id: string, data: Partial<Region>) {
    // Transform camelCase to snake_case for API
    const apiData: Record<string, any> = {};
    if (data.name !== undefined) apiData.name = data.name;
    if (data.code !== undefined) apiData.code = data.code;
    if (data.country !== undefined) apiData.country = data.country;
    if (data.stateProvince !== undefined) apiData.state_province = data.stateProvince;
    if (data.city !== undefined) apiData.city = data.city;
    if (data.boundaries !== undefined) apiData.boundaries = data.boundaries;
    if (data.ownerType !== undefined) apiData.owner_type = data.ownerType;
    if (data.licenseeId !== undefined) apiData.licensee_id = data.licenseeId;
    if (data.isActive !== undefined) apiData.is_active = data.isActive;

    return apiClient.put<{ region: Region }>(`/api/hrm8/regions/${id}`, apiData);
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
      `/api/hrm8/regions/${regionId}/transfer`,
      data
    );
  }
}

export const regionService = new RegionService();



