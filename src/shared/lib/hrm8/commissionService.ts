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
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'DISPUTED';
  confirmed_at?: string;
  paid_at?: string;
  payment_reference?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  payoutCurrency?: string;
  payoutAmount?: number;
  fxRate?: number;
  fxRateLockedAt?: string;
  fxSource?: string;
  fxQuoteId?: string | null;
  fxQuoteValidUntil?: string | null;
}

export interface CommissionReviewContext {
  commission: {
    id: string;
    consultantId: string;
    regionId: string;
    type: string;
    amount: number;
    currency?: string | null;
    status: string;
    description?: string | null;
    createdAt?: string;
    confirmedAt?: string | null;
    paidAt?: string | null;
    linkedJob?: {
      id?: string;
      title?: string;
      setupType?: string | null;
      managementType?: string | null;
      servicePackage?: string | null;
      hiringMode?: string | null;
      paymentStatus?: string | null;
      paymentAmount?: number | null;
      paymentCurrency?: string | null;
      postedAt?: string | null;
    } | null;
    linkedSubscription?: {
      id?: string;
      name?: string;
      planType?: string;
      basePrice?: number;
      currency?: string | null;
      billingCycle?: string;
      createdAt?: string;
    } | null;
  };
  companyContext?: {
    id?: string;
    name?: string;
    website?: string | null;
    billing_currency?: string | null;
    pricing_peg?: string | null;
    created_at?: string | null;
  } | null;
  conversionContext?: {
    request?: {
      id?: string;
      status?: string;
      company_name?: string;
      email?: string;
      phone?: string | null;
      website?: string | null;
      country?: string;
      city?: string | null;
      created_at?: string;
      reviewed_at?: string | null;
      converted_at?: string | null;
      intent_snapshot?: Record<string, unknown> | null;
    } | null;
    leadMilestones?: {
      lead_created_at?: string | null;
      lead_confirmed_at?: string | null;
      lead_status?: string | null;
      lead_source?: string | null;
    };
    conversionMilestones?: {
      request_submitted_at?: string | null;
      reviewed_at?: string | null;
      converted_at?: string | null;
    };
  };
  commercialEvidence?: {
    firstJobEvidence?: {
      job_id?: string;
      posted_at?: string | null;
      setup_type?: string | null;
      management_type?: string | null;
      service_package?: string | null;
      hiring_mode?: string | null;
      payment_status?: string | null;
    } | null;
    subscriptionAtFirstJob?: {
      subscription_id?: string;
      plan_type?: string;
      name?: string;
      base_price?: number;
      currency?: string | null;
      billing_cycle?: string;
      created_at?: string;
      matchStrategy?: string;
    } | null;
    firstPaymentEvidence?: {
      source?: string;
      amount?: number;
      currency?: string | null;
      paid_at?: string;
      reference_id?: string | null;
    } | null;
    commissionReadiness?: {
      eligible?: boolean;
      reason?: string;
      existing_commission_id?: string;
      existing_commission_status?: string;
    };
  };
  dataCompleteness?: {
    preApprovalComplete?: boolean;
    postPaymentAvailable?: boolean;
  };
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
    if (filters?.consultant_id) queryParams.append('consultantId', filters.consultant_id);
    if (filters?.region_id) queryParams.append('regionId', filters.region_id);
    if (filters?.job_id) queryParams.append('job_id', filters.job_id);
    if (filters?.company_id) queryParams.append('company_id', filters.company_id);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.commission_type) queryParams.append('commissionType', filters.commission_type);

    const query = queryParams.toString();
    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return apiClient.get<{ commission: Commission }>(`/api/hrm8/commissions/${id}`);
  }

  async getReviewContext(id: string) {
    return apiClient.get<{ context: CommissionReviewContext }>(`/api/hrm8/commissions/${id}/review-context`);
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
    queryParams.append('regionId', regionId);
    if (status) queryParams.append('status', status);

    return apiClient.get<{ commissions: Commission[] }>(`/api/hrm8/commissions/regional?${queryParams.toString()}`);
  }
}

export const commissionService = new CommissionService();
