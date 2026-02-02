/**
 * Commission Service
 * API service for commission management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface Commission {
  id: string;
  consultantId: string;
  regionId: string;
  jobId?: string;
  companyId?: string;
  amount: number;
  currency: string;
  type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
  commissionType?: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM'; // Backward compatibility
  rate?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  confirmedAt?: string;
  paidAt?: string;
  paidTo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class CommissionService {
  async getAll(filters?: {
    consultantId?: string;
    regionId?: string;
    jobId?: string;
    companyId?: string;
    status?: string;
    commissionType?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.consultantId) queryParams.append('consultantId', filters.consultantId);
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);
    if (filters?.jobId) queryParams.append('jobId', filters.jobId);
    if (filters?.companyId) queryParams.append('companyId', filters.companyId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.commissionType) queryParams.append('commissionType', filters.commissionType);

    const query = queryParams.toString();
    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ commission: Commission }>(`/api/hrm8/commissions/${id}`);
  }

  async create(data: {
    consultantId: string;
    regionId: string;
    jobId?: string;
    companyId?: string;
    amount: number;
    currency?: string;
    commissionType: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
    rate?: number;
    description?: string;
  }) {
    return apiClient.post<{ commission: Commission }>('/api/hrm8/commissions', data);
  }

  async confirm(id: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/confirm`);
  }

  async markAsPaid(id: string, paymentReference?: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/pay`, { 
      paymentReference: paymentReference || `PMT-${Date.now()}` 
    });
  }

  async processPayments(commissionIds: string[], paymentReference: string) {
    return apiClient.post<{ processed: number; total: number; errors: string[] }>(
      '/api/hrm8/commissions/pay',
      { commissionIds, paymentReference }
    );
  }

  async getRegional(regionId: string, status?: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('regionId', regionId);
    if (status) queryParams.append('status', status);

    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions/regional?${queryParams.toString()}`);
  }
}

export const commissionService = new CommissionService();



