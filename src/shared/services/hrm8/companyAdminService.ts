import { apiClient } from '@/shared/lib/apiClient';

export type CompanyStatusFilter = 'ACTIVE' | 'INACTIVE' | 'NEW';

export interface CompanyListItem {
  id: string;
  name: string;
  website?: string | null;
  domain?: string | null;
  country_or_region?: string | null;
  region_id?: string | null;
  billing_currency?: string | null;
  pricing_peg?: string | null;
  currency_locked_at?: string | null;
  attribution_status: 'OPEN' | 'LOCKED';
  attribution_locked_at?: string | null;
  created_at: string;
  updated_at: string;
  open_jobs_count: number;
  users_count: number;
  region?: {
    id: string;
    name: string;
    country?: string;
  } | null;
  subscription?: {
    id: string;
    name: string;
    plan_type?: string;
    status: string;
    start_date?: string | null;
    renewal_date?: string | null;
    job_quota?: number;
    jobs_used?: number;
  } | null;
}

export interface CompanyListResponse {
  companies: CompanyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CompanyOverviewResponse {
  company: {
    id: string;
    name: string;
    website?: string | null;
    domain?: string | null;
    country_or_region?: string | null;
    country?: string | null;
    billing_currency?: string | null;
    pricing_peg?: string | null;
    currency_locked_at?: string | null;
    attribution_locked?: boolean;
    attribution_locked_at?: string | null;
    created_at?: string;
    updated_at?: string;
    region?: {
      id: string;
      name: string;
      country?: string;
      code?: string;
    } | null;
    price_book?: {
      id: string;
      name: string;
      currency?: string;
      billing_currency?: string;
      pricing_peg?: string;
      version?: string;
      is_global?: boolean;
    } | null;
  };
  stats: {
    open_jobs_count: number;
    total_jobs_count: number;
    applications_count: number;
    users_count: number;
  };
  activeSubscription?: {
    id: string;
    name?: string;
    plan_type?: string;
    status?: string;
    job_quota?: number;
    jobs_used?: number;
    base_price?: number;
    currency?: string;
    created_at?: string;
    renewal_date?: string;
  } | null;
  wallet?: {
    id: string;
    balance: number;
    total_credits?: number;
    total_debits?: number;
    status?: string;
  } | null;
  commercialEvidence?: {
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
    firstJobEvidence?: {
      posted_at?: string | null;
      setup_type?: string | null;
      management_type?: string | null;
      service_package?: string | null;
      hiring_mode?: string | null;
      payment_status?: string | null;
      payment_currency?: string | null;
      payment_amount?: number | null;
    } | null;
    subscriptionAtFirstJob?: {
      name?: string | null;
      plan_type?: string | null;
      base_price?: number | null;
      currency?: string | null;
      billing_cycle?: string | null;
      created_at?: string | null;
      matchStrategy?: string;
    } | null;
    firstPaymentEvidence?: {
      source?: string | null;
      amount?: number | null;
      currency?: string | null;
      paid_at?: string | null;
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

export interface CompanyActivityEvent {
  id: string;
  entityId: string;
  entityType: string;
  type: string;
  occurredAt: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CompanyActivityResponse {
  events: CompanyActivityEvent[];
  total: number;
}

export interface CompanyUsersResponse {
  users: Array<{
    id: string;
    name?: string | null;
    email: string;
    role?: string;
    status?: string;
    last_login_at?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
}

export interface CompanyPricingContextResponse {
  company: {
    id: string;
    name: string;
    region_id?: string | null;
    billing_currency?: string | null;
    pricing_peg?: string | null;
    currency_locked_at?: string | null;
    price_book_id?: string | null;
  };
  pricingContext: {
    assignedPriceBook?: any;
    activeOverride?: any;
    resolvedPriceBook?: any;
    availablePriceBooks: any[];
  };
}

export interface CompanyPricingOverridesResponse {
  overrides: any[];
  total: number;
}

export interface CreatePricingOverridePayload {
  sourcePriceBookId: string;
  name?: string;
  description?: string;
  scope?: string[];
  effectiveFrom?: string;
  effectiveTo?: string | null;
  notes?: string;
  activateImmediately?: boolean;
}

class CompanyAdminService {
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CompanyStatusFilter;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search?.trim()) query.append('search', params.search.trim());
    if (params?.status) query.append('status', params.status);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<CompanyListResponse>(`/api/hrm8/companies${suffix}`);
  }

  async getCompanyOverview(companyId: string) {
    return apiClient.get<CompanyOverviewResponse>(`/api/hrm8/companies/${companyId}/overview`);
  }

  async getCompanyActivity(companyId: string, limit?: number) {
    const query = typeof limit === 'number' ? `?limit=${limit}` : '';
    return apiClient.get<CompanyActivityResponse>(`/api/hrm8/companies/${companyId}/activity${query}`);
  }

  async getCompanyUsers(companyId: string) {
    return apiClient.get<CompanyUsersResponse>(`/api/hrm8/companies/${companyId}/users`);
  }

  async getCompanyPricingContext(companyId: string) {
    return apiClient.get<CompanyPricingContextResponse>(`/api/hrm8/companies/${companyId}/pricing-context`);
  }

  async getCompanyPricingOverrides(companyId: string) {
    return apiClient.get<CompanyPricingOverridesResponse>(`/api/hrm8/companies/${companyId}/pricing-overrides`);
  }

  async createPricingOverride(companyId: string, payload: CreatePricingOverridePayload) {
    return apiClient.post<{ override: any; clonedPriceBook: any }>(
      `/api/hrm8/companies/${companyId}/pricing-overrides`,
      payload
    );
  }

  async activatePricingOverride(companyId: string, overrideId: string) {
    return apiClient.put<{ override: any }>(
      `/api/hrm8/companies/${companyId}/pricing-overrides/${overrideId}/activate`
    );
  }

  async deactivatePricingOverride(companyId: string, overrideId: string) {
    return apiClient.put<{ override: any }>(
      `/api/hrm8/companies/${companyId}/pricing-overrides/${overrideId}/deactivate`
    );
  }
}

export const companyAdminService = new CompanyAdminService();
