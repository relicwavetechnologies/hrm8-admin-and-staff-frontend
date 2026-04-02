/**
 * Regional Revenue Service
 * API service for revenue tracking
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RegionalRevenue {
  id: string;
  region_id: string;
  region_name?: string;
  licensee_id?: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  licensee_share: number;
  hrm8_share: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyRevenueBreakdownRow {
  id: string;
  name: string;
  region_id: string;
  billing_currency: string;
  job_revenue: number;
  subscription_revenue: number;
  total_revenue: number;
  licensee_share: number;
  hrm8_share: number;
  normalized_job_revenue: number;
  normalized_subscription_revenue: number;
  normalized_total_revenue: number;
  normalized_licensee_share: number;
  normalized_hrm8_share: number;
  reporting_currency: string;
  active_jobs: number;
  last_payment_at?: string | null;
}

export interface CompanyRevenueBreakdownResponse {
  companies: CompanyRevenueBreakdownRow[];
  totals: {
    total_revenue: number;
    hrm8_share: number;
    licensee_share: number;
  };
  reporting_currency: string;
}

class RevenueService {
  async getAll(filters?: {
    region_id?: string;
    licensee_id?: string;
    status?: string;
    period_start?: string;
    period_end?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.region_id) queryParams.append('region_id', filters.region_id);
    if (filters?.licensee_id) queryParams.append('licensee_id', filters.licensee_id);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.period_start) queryParams.append('period_start', filters.period_start);
    if (filters?.period_end) queryParams.append('period_end', filters.period_end);

    const query = queryParams.toString();
    return apiClient.get<{ revenues: RegionalRevenue[] }>(`/api/hrm8/revenue${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}`);
  }

  async create(data: {
    region_id: string;
    licensee_id?: string;
    period_start: string;
    period_end: string;
    total_revenue: number;
    licensee_share: number;
    hrm8_share: number;
  }) {
    return apiClient.post<{ revenue: RegionalRevenue }>('/api/hrm8/revenue', data);
  }

  async confirm(id: string) {
    return apiClient.put<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}/confirm`);
  }

  async markAsPaid(id: string) {
    return apiClient.put<{ revenue: RegionalRevenue }>(`/api/hrm8/revenue/${id}/pay`);
  }

  async getCompanyRevenueBreakdown(filters?: { regionId?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);

    const query = queryParams.toString();
    return apiClient.get<CompanyRevenueBreakdownResponse>(`/api/hrm8/revenue/companies${query ? `?${query}` : ''}`);
  }
}


export const revenueService = new RevenueService();
