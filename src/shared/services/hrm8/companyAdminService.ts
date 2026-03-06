import { apiClient } from '@/shared/lib/apiClient';

export interface CompanyListItem {
  id: string;
  name: string;
  domain?: string;
  status: string;
  region_id?: string;
  created_at: string;
  subscription_status?: string;
  open_jobs_count: number;
  attribution_status?: 'OPEN' | 'LOCKED' | 'EXPIRED';
  subscription?: { plan: string; start_date: string; renewal_date: string } | null;
}

export interface CompanyOverviewDTO {
  company: {
    id: string;
    name: string;
    website?: string;
    domain?: string;
    country_or_region?: string;
    country?: string;
    billing_currency?: string;
    pricing_peg?: string;
    currency_locked_at?: string | null;
    attribution_locked?: boolean;
    attribution_locked_at?: string | null;
    created_at: string;
    updated_at: string;
    region?: { id: string; name: string; country?: string } | null;
    price_book?: { id: string; name: string; currency: string } | null;
  };
  stats: {
    open_jobs_count: number;
    total_jobs_count: number;
    applications_count: number;
    users_count: number;
  };
  activeSubscription: {
    id: string;
    name?: string;
    plan_type?: string;
    status: string;
    start_date?: string;
    renewal_date?: string;
    job_quota?: number | null;
    jobs_used?: number;
  } | null;
  wallet: {
    id: string;
    balance: number;
    total_credits: number;
    total_debits: number;
    status: string;
  } | null;
  commercialEvidence: {
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
    firstJobEvidence: {
      job_id?: string;
      title?: string;
      posted_at?: string | null;
      setup_type?: string | null;
      hiring_mode?: string | null;
      service_package?: string | null;
      payment_status?: string | null;
      payment_amount?: number | null;
      payment_currency?: string | null;
    } | null;
    subscriptionAtFirstJob: {
      subscription_id?: string;
      plan_type?: string;
      name?: string;
      base_price?: number;
      currency?: string | null;
      billing_cycle?: string;
      created_at?: string;
    } | null;
    firstPaymentEvidence: {
      source?: string;
      amount?: number;
      currency?: string | null;
      paid_at?: string;
      reference_id?: string | null;
    } | null;
    commissionReadiness: {
      eligible?: boolean;
      reason?: string;
      existing_commission_id?: string;
      existing_commission_status?: string;
    };
  };
  dataCompleteness: {
    preApprovalComplete?: boolean;
    postPaymentAvailable?: boolean;
  };
}

export interface CompanyActivityEventDTO {
  id: string;
  entityId: string;
  entityType: string;
  type: string;
  occurredAt: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface CompanyPricingContextDTO {
  company: {
    id: string;
    name: string;
    region_id?: string;
    billing_currency?: string;
    pricing_peg?: string;
    currency_locked_at?: string | null;
    price_book_id?: string;
  };
  pricingContext: {
    assignedPriceBook: { id: string; name: string; currency: string; is_global?: boolean } | null;
    activeOverride: {
      id: string;
      is_active: boolean;
      created_at: string;
      effective_from?: string;
      effective_to?: string | null;
      price_book?: { id: string; name: string; currency: string } | null;
    } | null;
    resolvedPriceBook: { id: string; name: string; currency: string; is_global?: boolean } | null;
    availablePriceBooks: Array<{
      id: string;
      name: string;
      currency: string;
      is_global: boolean;
      is_active: boolean;
      region?: { id: string; name: string; code?: string } | null;
    }>;
  };
}

export interface CompanyPricingOverrideDTO {
  id: string;
  company_id: string;
  price_book_id: string;
  is_active: boolean;
  scope?: string[] | null;
  notes?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string | null;
  approved_by?: string | null;
  price_book?: {
    id: string;
    name: string;
    currency: string;
    is_global?: boolean;
    region?: { id: string; name: string; code?: string } | null;
  } | null;
}

class CompanyAdminService {
  async getCompanies(params?: { regionId?: string; search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.regionId) query.append('regionId', params.regionId);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page != null) query.append('page', String(params.page));
    if (params?.limit != null) query.append('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ companies: CompanyListItem[]; total: number }>(`/api/hrm8/companies${suffix}`);
  }

  async getCompanyOverview(companyId: string) {
    return apiClient.get<CompanyOverviewDTO>(`/api/hrm8/companies/${companyId}/overview`);
  }

  async getCompanyActivity(companyId: string) {
    return apiClient.get<{ events: CompanyActivityEventDTO[] }>(`/api/hrm8/companies/${companyId}/activity`);
  }

  async getCompanyUsers(companyId: string) {
    return apiClient.get<{ users: Array<{ id: string; name: string; email: string; role: string; status: string; created_at: string }> }>(`/api/hrm8/companies/${companyId}/users`);
  }

  async getCompanyJobs(companyId: string) {
    return apiClient.get<{ jobs: Array<{ id: string; title: string; status: string; type?: string; location?: string; salaryMin?: number; salaryMax?: number; postedAt: string; applicants: number; views: number; clicks: number; createdAt: string }> }>(`/api/hrm8/companies/${companyId}/jobs`);
  }

  async getCompanyPricingContext(companyId: string) {
    return apiClient.get<CompanyPricingContextDTO>(`/api/hrm8/companies/${companyId}/pricing-context`);
  }

  async getCompanyPricingOverrides(companyId: string) {
    return apiClient.get<{ overrides: CompanyPricingOverrideDTO[] }>(`/api/hrm8/companies/${companyId}/pricing-overrides`);
  }

  async createPricingOverride(companyId: string, data: { name: string; sourcePriceBookId: string }) {
    return apiClient.post<{ override: CompanyPricingOverrideDTO }>(`/api/hrm8/companies/${companyId}/pricing-overrides`, data);
  }

  async activatePricingOverride(companyId: string, overrideId: string) {
    return apiClient.put<{ override: CompanyPricingOverrideDTO }>(`/api/hrm8/companies/${companyId}/pricing-overrides/${overrideId}/activate`);
  }

  async deactivatePricingOverride(companyId: string, overrideId: string) {
    return apiClient.put<{ override: CompanyPricingOverrideDTO }>(`/api/hrm8/companies/${companyId}/pricing-overrides/${overrideId}/deactivate`);
  }
}

export const companyAdminService = new CompanyAdminService();
