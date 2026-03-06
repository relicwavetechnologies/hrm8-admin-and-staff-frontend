/**
 * Settlement Service
 * API service for settlement management
 */

import { apiClient } from '../api';

export interface Settlement {
  id: string;
  licensee_id: string;
  licensee_name?: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  licensee_share: number;
  hrm8_share: number;
  status: 'PENDING' | 'PAID';
  payment_date?: string;
  payment_reference?: string;
  generated_at: string;
  licensee?: {
    id: string;
    name: string;
    email: string;
    revenue_share_percentage?: number;
  };
}

export interface SettlementStats {
  total_pending: number;
  total_paid: number;
  pending_count: number;
  paid_count: number;
  current_period_revenue: number;
}

class SettlementService {
  /**
   * Get all settlements with filters
   */
  async getAll(filters?: {
    licensee_id?: string;
    status?: string;
    period_start?: string;
    period_end?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.licensee_id) queryParams.append('licensee_id', filters.licensee_id);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.period_start) queryParams.append('period_start', filters.period_start);
    if (filters?.period_end) queryParams.append('period_end', filters.period_end);

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
    licensee_id: string;
    period_start: string;
    period_end: string;
  }) {
    return apiClient.post<{ settlement: Settlement }>('/api/hrm8/finance/settlements/calculate', data);
  }

  /**
   * Mark settlement as paid
   */
  async markAsPaid(id: string, data: {
    payment_date: string;
    payment_reference: string;
  }) {
    return apiClient.put<{ settlement: Settlement }>(`/api/hrm8/finance/settlements/${id}/pay`, data);
  }

  /**
   * Get settlement statistics
   */
  async getStats(licensee_id?: string) {
    const queryParams = new URLSearchParams();
    if (licensee_id) queryParams.append('licensee_id', licensee_id);

    const query = queryParams.toString();
    return apiClient.get<{ stats: SettlementStats }>(`/api/hrm8/finance/settlements/stats${query ? `?${query}` : ''}`);
  }
}

export const settlementService = new SettlementService();
