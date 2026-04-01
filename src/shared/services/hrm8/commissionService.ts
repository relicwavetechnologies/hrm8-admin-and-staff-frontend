/**
 * Commission Service
 * API service for commission management
 */

import { apiClient } from '@/shared/lib/apiClient';
import { ConversionIntentSnapshot } from '../leadConversionService';

export interface Commission {
  id: string;
  consultantId: string;
  consultant_id?: string;
  regionId: string;
  region_id?: string;
  jobId?: string;
  job_id?: string;
  subscriptionId?: string;
  subscription_id?: string;
  amount: number;
  currency: string | null;
  type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
  rate?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'DISPUTED' | 'CLAWBACK';
  confirmedAt?: string | null;
  confirmed_at?: string | null;
  paidAt?: string | null;
  paid_at?: string | null;
  paymentReference?: string | null;
  payment_reference?: string | null;
  description?: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
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
    jobId?: string | null;
    subscriptionId?: string | null;
    type: string;
    amount: number;
    currency: string | null;
    status: string;
    description?: string | null;
    createdAt?: string | null;
    confirmedAt?: string | null;
    paidAt?: string | null;
    consultant?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      regionId?: string | null;
    } | null;
    linkedJob?: {
      id: string;
      title?: string | null;
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
      id: string;
      name?: string | null;
      planType?: string | null;
      basePrice?: number | null;
      currency?: string | null;
      billingCycle?: string | null;
      createdAt?: string | null;
    } | null;
  };
  companyContext: {
    id: string;
    name: string;
    website?: string | null;
    billing_currency?: string | null;
    pricing_peg?: string | null;
    created_at?: string | null;
  } | null;
  conversionContext: {
    request: {
      id: string;
      status: string;
      company_name: string;
      email: string;
      phone?: string | null;
      website?: string | null;
      country?: string | null;
      city?: string | null;
      region_id?: string | null;
      created_at?: string | null;
      reviewed_at?: string | null;
      converted_at?: string | null;
      agent_notes?: string | null;
      intent_snapshot?: ConversionIntentSnapshot | null;
    } | null;
    leadMilestones: {
      lead_created_at?: string | null;
      lead_confirmed_at?: string | null;
      lead_status?: string | null;
      lead_source?: string | null;
    };
    conversionMilestones: {
      request_submitted_at?: string | null;
      reviewed_at?: string | null;
      converted_at?: string | null;
    };
  };
  commercialEvidence: {
    firstJobEvidence: {
      job_id: string;
      posted_at: string | null;
      setup_type: string | null;
      management_type: string | null;
      service_package: string | null;
      hiring_mode: string | null;
      payment_status: string | null;
    } | null;
    subscriptionAtFirstJob: {
      subscription_id: string;
      plan_type: string;
      name: string;
      base_price: number;
      currency: string;
      billing_cycle: string;
      created_at: string;
      matchStrategy: 'before_or_equal' | 'after_fallback';
    } | null;
    firstPaymentEvidence: {
      source: 'SUBSCRIPTION_BILL' | 'MANAGED_WALLET';
      amount: number;
      currency: string | null;
      paid_at: string;
      reference_id: string | null;
    } | null;
    commissionReadiness: {
      eligible: boolean;
      reason: string;
      existing_commission_id?: string;
      existing_commission_status?: string;
    };
  };
  dataCompleteness: {
    preApprovalComplete: boolean;
    postPaymentAvailable: boolean;
  };
}

const normalizeCommission = (raw: any): Commission => ({
  id: raw.id,
  consultantId: raw.consultantId ?? raw.consultant_id ?? '',
  consultant_id: raw.consultantId ?? raw.consultant_id ?? '',
  regionId: raw.regionId ?? raw.region_id ?? '',
  region_id: raw.regionId ?? raw.region_id ?? '',
  jobId: raw.jobId ?? raw.job_id ?? undefined,
  job_id: raw.jobId ?? raw.job_id ?? undefined,
  subscriptionId: raw.subscriptionId ?? raw.subscription_id ?? undefined,
  subscription_id: raw.subscriptionId ?? raw.subscription_id ?? undefined,
  amount: Number(raw.amount ?? 0),
  currency: raw.currency ?? null,
  type: raw.type,
  rate: raw.rate ?? undefined,
  status: raw.status,
  confirmedAt: raw.confirmedAt ?? raw.confirmed_at ?? null,
  confirmed_at: raw.confirmedAt ?? raw.confirmed_at ?? null,
  paidAt: raw.paidAt ?? raw.paid_at ?? null,
  paid_at: raw.paidAt ?? raw.paid_at ?? null,
  paymentReference: raw.paymentReference ?? raw.payment_reference ?? null,
  payment_reference: raw.paymentReference ?? raw.payment_reference ?? null,
  description: raw.description ?? null,
  createdAt: raw.createdAt ?? raw.created_at ?? '',
  created_at: raw.createdAt ?? raw.created_at ?? '',
  updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
  updated_at: raw.updatedAt ?? raw.updated_at ?? undefined,
  payoutCurrency: raw.payoutCurrency ?? raw.payout_currency ?? undefined,
  payoutAmount: raw.payoutAmount != null ? Number(raw.payoutAmount) : (raw.payout_amount != null ? Number(raw.payout_amount) : undefined),
  fxRate: raw.fxRate != null ? Number(raw.fxRate) : (raw.fx_rate != null ? Number(raw.fx_rate) : undefined),
  fxRateLockedAt: raw.fxRateLockedAt ?? raw.fx_rate_locked_at ?? undefined,
  fxSource: raw.fxSource ?? raw.fx_source ?? undefined,
  fxQuoteId: raw.fxQuoteId ?? raw.fx_quote_id ?? null,
  fxQuoteValidUntil: raw.fxQuoteValidUntil ?? raw.fx_quote_valid_until ?? null,
});

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
    const response = await apiClient.get<{ commissions: any[] }>(`/api/hrm8/commissions${query ? `?${query}` : ''}`);

    if (!response.success) {
      return response;
    }

    return {
      ...response,
      data: {
        commissions: (response.data?.commissions || []).map(normalizeCommission),
      },
    };
  }

  async getById(id: string) {
    const response = await apiClient.get<any>(`/api/hrm8/commissions/${id}`);
    if (!response.success) {
      return response;
    }
    const rawCommission = response.data?.commission || response.data;
    return {
      ...response,
      data: {
        commission: normalizeCommission(rawCommission),
      },
    };
  }

  async getReviewContext(id: string) {
    const response = await apiClient.get<any>(`/api/hrm8/commissions/${id}/review-context`);
    if (!response.success) {
      return response;
    }

    return {
      ...response,
      data: (response.data?.context || response.data) as CommissionReviewContext,
    };
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

  async dispute(id: string, reason: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/dispute`, { reason });
  }

  async resolveDispute(id: string, resolution: 'VALID' | 'INVALID', notes?: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/resolve`, { resolution, notes });
  }

  async clawback(id: string, reason: string) {
    return apiClient.put<{ commission: Commission }>(`/api/hrm8/commissions/${id}/clawback`, { reason });
  }
}

export const commissionService = new CommissionService();
