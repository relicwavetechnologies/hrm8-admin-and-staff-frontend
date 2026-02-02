/**
 * Settlement Service
 * API service for settlement management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface Settlement {
  id: string;
  licenseeId: string;
  licenseeName?: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  licenseeShare: number;
  hrm8Share: number;
  status: 'PENDING' | 'PAID';
  paymentDate?: string;
  reference?: string;
  generatedAt: string;
  licensee?: {
    id: string;
    name: string;
    email: string;
    revenueSharePercentage?: number;
  };
}

export interface SettlementStats {
  totalPending: number;
  totalPaid: number;
  pendingCount: number;
  paidCount: number;
  currentPeriodRevenue: number;
}

class SettlementService {
  /**
   * Get all settlements with filters
   */
  async getAll(filters?: {
    licenseeId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.licenseeId) queryParams.append('licenseeId', filters.licenseeId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.periodStart) queryParams.append('periodStart', filters.periodStart);
    if (filters?.periodEnd) queryParams.append('periodEnd', filters.periodEnd);

    const query = queryParams.toString();
    return apiClient.get<{ settlements: Settlement[] }>(`/api/hrm8/finance/settlements${query ? `?${query}` : ''}`);
  }

  /**
   * Get settlement by ID
   */
  async getById(id: string) {
    return apiClient.get<{ settlement: Settlement }>(`/api/hrm8/finance/settlements/${id}`);
  }

  /**
   * Calculate/Generate settlement for a period
   */
  async calculate(data: {
    licenseeId: string;
    periodStart: string;
    periodEnd: string;
  }) {
    return apiClient.post<{ settlement: Settlement }>('/api/hrm8/finance/settlements/calculate', data);
  }

  /**
   * Mark settlement as paid
   */
  async markAsPaid(id: string, data: {
    paymentDate: string;
    reference: string;
  }) {
    return apiClient.put<{ settlement: Settlement }>(`/api/hrm8/finance/settlements/${id}/pay`, data);
  }

  /**
   * Get settlement statistics
   */
  async getStats(licenseeId?: string) {
    const queryParams = new URLSearchParams();
    if (licenseeId) queryParams.append('licenseeId', licenseeId);

    const query = queryParams.toString();
    return apiClient.get<{ stats: SettlementStats }>(`/api/hrm8/finance/settlements/stats${query ? `?${query}` : ''}`);
  }
}

export const settlementService = new SettlementService();
