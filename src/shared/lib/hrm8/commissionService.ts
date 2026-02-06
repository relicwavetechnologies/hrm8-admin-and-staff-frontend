/**
 * Commission Service
 * API service for commission management
 */

import { apiClient } from '../api';

export interface Commission {
  id: string;
  consultant_id: string;
  region_id: string;
  job_id?: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
  rate?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  confirmed_at?: string;
  paid_at?: string;
  payment_reference?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

class CommissionService {
  async getAll(filters?: {
    consultant_id?: string;
    region_id?: string;
    job_id?: string;
    company_id?: string;
    status?: string;
    commission_type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.consultant_id) queryParams.append('consultant_id', filters.consultant_id);
    if (filters?.region_id) queryParams.append('region_id', filters.region_id);
    if (filters?.job_id) queryParams.append('job_id', filters.job_id);
    if (filters?.company_id) queryParams.append('company_id', filters.company_id);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.commission_type) queryParams.append('commission_type', filters.commission_type);

    const query = queryParams.toString();
    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ commission: Commission }>(`/api/hrm8/commissions/${id}`);
  }

  async create(data: {
    consultant_id: string;
    region_id: string;
    job_id?: string;
    company_id?: string;
    amount: number;
    currency?: string;
    commission_type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
    rate?: number;
    description?: string;
  }) {
    return apiClient.post<{ commission: Commission }>('/api/hrm8/commissions', {
      consultantId: data.consultant_id,
      regionId: data.region_id,
      jobId: data.job_id,
      companyId: data.company_id,
      amount: data.amount,
      currency: data.currency,
      commissionType: data.commission_type,
      rate: data.rate,
      description: data.description,
    });
  }

  async confirm(id: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/confirm`);
  }

  async markAsPaid(id: string, paymentReference?: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/pay`, { 
      payment_reference: paymentReference || `PMT-${Date.now()}` 
    });
  }

  async processPayments(commissionIds: string[], paymentReference: string) {
    return apiClient.post<{ processed: number; total: number; errors: string[] }>(
      '/api/hrm8/commissions/pay',
      { commission_ids: commissionIds, payment_reference: paymentReference }
    );
  }

  async getRegional(regionId: string, status?: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('region_id', regionId);
    if (status) queryParams.append('status', status);

    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions/regional?${queryParams.toString()}`);
  }
}

export const commissionService = new CommissionService();

