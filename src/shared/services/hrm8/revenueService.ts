/**
 * Regional Revenue Service
 * API service for revenue tracking
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RegionalRevenue {
  id: string;
  regionId: string;
  regionName?: string;
  licenseeId?: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  licenseeShare: number;
  hrm8Share: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

class RevenueService {
  async getAll(filters?: {
    regionId?: string;
    licenseeId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);
    if (filters?.licenseeId) queryParams.append('licenseeId', filters.licenseeId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.periodStart) queryParams.append('periodStart', filters.periodStart);
    if (filters?.periodEnd) queryParams.append('periodEnd', filters.periodEnd);

    const query = queryParams.toString();
    return apiClient.get<{ revenues: RegionalRevenue[] }>(`/api/hrm8/revenue${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}`);
  }

  async create(data: {
    regionId: string;
    licenseeId?: string;
    periodStart: string;
    periodEnd: string;
    totalRevenue: number;
    licenseeShare: number;
    hrm8Share: number;
  }) {
    return apiClient.post<{ revenue: RegionalRevenue }>('/api/hrm8/revenue', data);
  }

  async confirm(id: string) {
    return apiClient.put<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}/confirm`);
  }

  async markAsPaid(id: string) {
    return apiClient.put<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}/pay`);
  }

  async getCompanyRevenueBreakdown() {
    return apiClient.get<{ companies: any[] }>('/api/hrm8/revenue/companies');
  }
}


export const revenueService = new RevenueService();



