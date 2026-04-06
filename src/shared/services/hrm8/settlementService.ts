/**
 * Settlement Service
 * API service for settlement management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface BeneficiaryStatus {
  status: 'READY' | 'INCOMPLETE' | 'PENDING_VERIFICATION' | 'RESTRICTED';
  label: string;
  description: string;
  missingFields: string[];
}

export interface AirwallexBeneficiaryFieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface AirwallexBeneficiaryField {
  key: string;
  path: string;
  label: string;
  required: boolean;
  enabled: boolean;
  inputType: 'INPUT' | 'SELECT' | 'RADIO' | 'TRANSFER_METHOD' | 'HIDDEN';
  placeholder?: string;
  description?: string;
  pattern?: string;
  valueType?: string;
  refresh?: boolean;
  defaultValue?: string | null;
  options?: AirwallexBeneficiaryFieldOption[];
}

export interface Settlement {
  id: string;
  licensee_id: string;
  licensee_name?: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  licensee_share: number;
  hrm8_share: number;
  reporting_currency?: string;
  source_currency_breakdown?: Array<{
    currency: string;
    grossAmount: number;
    refundAmount: number;
    netAmount: number;
    count: number;
  }>;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED';
  payment_date?: string;
  payment_reference?: string;
  provider_transfer_id?: string | null;
  transfer_initiated_at?: string | null;
  transfer_completed_at?: string | null;
  transfer_failed_reason?: string | null;
  beneficiary_status?: BeneficiaryStatus | null;
  generated_at: string;
  licensee?: {
    id: string;
    name: string;
    email: string;
    revenue_share_percentage?: number;
  };
}

export interface SettlementPayoutSetup {
  settlementId: string;
  amount: number;
  currency: string;
  beneficiaryId: string | null;
  beneficiaryStatus: BeneficiaryStatus;
  paymentDetails: Record<string, unknown>;
  requirements: {
    source: 'AIRWALLEX_FORM_SCHEMA' | 'AIRWALLEX_API_SCHEMA' | 'FALLBACK';
    condition: {
      accountCurrency: string;
      bankCountryCode: string;
      entityType: 'COMPANY' | 'PERSONAL';
      transferMethod: 'LOCAL' | 'SWIFT';
      localClearingSystem?: string;
      countryCode?: string;
    };
    fields: AirwallexBeneficiaryField[];
  };
}

export interface SettlementPayoutResult {
  settlementId: string;
  status: string;
  paymentDate: string | null;
  paymentReference: string | null;
  transferId: string | null;
  transferInitiatedAt: string | null;
  transferCompletedAt: string | null;
  failedReason: string | null;
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
    regionId?: string;
    status?: string;
    period_start?: string;
    period_end?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.licensee_id) queryParams.append('licensee_id', filters.licensee_id);
    if (filters?.regionId) queryParams.append('regionId', filters.regionId);
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

  async getPayoutSetup(
    id: string,
    params?: {
      bankCountryCode?: string;
      transferMethod?: 'LOCAL' | 'SWIFT';
      localClearingSystem?: string;
    }
  ) {
    const search = new URLSearchParams();
    if (params?.bankCountryCode) search.set('bankCountryCode', params.bankCountryCode);
    if (params?.transferMethod) search.set('transferMethod', params.transferMethod);
    if (params?.localClearingSystem) search.set('localClearingSystem', params.localClearingSystem);
    const query = search.toString();
    return apiClient.get<{ setup: SettlementPayoutSetup }>(
      `/api/hrm8/finance/settlements/${id}/payout-setup${query ? `?${query}` : ''}`
    );
  }

  /**
   * Calculate/Generate settlement for a period
   */
  async calculate(data: {
    licensee_id: string;
    period_start: string;
    period_end: string;
    commit?: boolean;
  }) {
    return apiClient.post<{ settlement: Settlement; committed?: boolean }>('/api/hrm8/finance/settlements/calculate', data);
  }

  /**
   * Legacy manual completion path.
   * Real payout execution should use executePayout().
   */
  async markAsPaid(id: string, data: {
    payment_date: string;
    payment_reference: string;
  }) {
    return apiClient.put<{ settlement: Settlement }>(`/api/hrm8/finance/settlements/${id}/pay`, data);
  }

  async executePayout(id: string, data?: { paymentDetails?: Record<string, unknown> }) {
    return apiClient.post<{ payout: SettlementPayoutResult }>(`/api/hrm8/finance/settlements/${id}/execute`, data || {});
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
