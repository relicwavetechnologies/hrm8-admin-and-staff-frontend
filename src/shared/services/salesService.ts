import { apiClient } from '@/shared/lib/apiClient';
import { Company } from '@/shared/types/company';
import type { SalesAgent } from '@/shared/types/salesAgent';
import type { SalesActivity } from '@/shared/types/salesActivity';

// Types
export interface SalesDashboardStats {
  commissions: {
    total: number;
    pending: number;
    paid: number;
  };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
  };
  companies: {
    total: number;
    activeSubscriptions: number;
  };
  recentActivity: Array<{
    type: 'COMMISSION' | 'LEAD';
    description: string;
    date: string;
    amount?: number;
    status: string;
  }>;
}

export interface Lead {
  id: string;
  company_name: string;
  email: string;
  country: string;
  website?: string;
  phone?: string;
  status: string;
  created_at: string;
  conversion_requests?: Array<{
    id: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CONVERTED' | 'CANCELLED';
    created_at: string;
  }>;
}

export interface Commission {
  id: string;
  amount: number;
  status: string;
  description: string;
  type: string;
  createdAt: string;
  paidAt?: string;
  companyName?: string;
}

export interface CreateLeadData {
  companyName: string;
  email: string;
  country: string;
  website?: string;
  phone?: string;
  budget?: string;
  timeline?: string;
  message?: string;
}

export interface ConvertLeadData {
  adminFirstName: string;
  adminLastName: string;
  email: string;
  domain: string;
  password: string;
  acceptTerms: boolean;
}

export interface Opportunity {
  id: string;
  name: string;
  stage: string;
  amount: number; // Keep amount for backward compatibility if needed, or map to estimatedValue
  estimatedValue: number; // Add this
  probability: number;
  expectedCloseDate?: string;
  salesAgentId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  salesAgentName: string; // Add this as it's used in forecast utils
  employerName: string; // Add this
  company?: {
    id: string;
    name: string;
    domain: string;
  };
}

export interface PipelineStats {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  dealCount: number;
  byStage: Record<string, { count: number; value: number }>;
}

export const salesService = {
  // ... existing methods ...

  // Opportunities
  getOpportunities: async (filters?: { stage?: string }) => {
    console.log('[salesService] 📤 Fetching opportunities with filters:', filters);
    const params = new URLSearchParams(filters);
    const url = `/api/sales/opportunities?${params.toString()}`;
    console.log('[salesService] 🌐 Request URL:', url);

    const response = await apiClient.get<{ opportunities: any[] }>(url);

    if (response.success && response.data?.opportunities) {
      const mappedOpportunities = response.data.opportunities.map((opp: any) => ({
        id: opp.id,
        name: opp.name,
        stage: opp.stage,
        amount: opp.amount || 0,
        estimatedValue: opp.amount || 0, // Map amount to estimatedValue
        probability: opp.probability || 0,
        expectedCloseDate: opp.expected_close_date,
        salesAgentId: opp.sales_agent_id,
        companyId: opp.company_id,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at,
        salesAgentName: opp.sales_agent_name || 'Unknown Agent', // derived or mock fallback if missing
        employerName: opp.company?.name || 'Unknown Employer',
        leadSource: opp.lead_source || 'inbound', // Defaulting as it might be missing
        type: opp.type || 'new-business',
        productType: opp.product_type || 'ats-subscription',
        priority: opp.priority || 'medium',
        company: opp.company
      }));

      // We return the mapped data but structure it as the expected response
      return {
        ...response,
        data: {
          opportunities: mappedOpportunities
        }
      };
    }

    return response;
  },

  getPipelineStats: async () => {
    console.log('[salesService] 📤 Fetching pipeline stats');
    const response = await apiClient.get<PipelineStats>('/api/sales/opportunities/stats');

    console.log('[salesService] ✅ Pipeline stats response:', {
      success: response.success,
      stats: response.data,
    });

    return response;
  },

  createOpportunity: async (data: Partial<Opportunity>) => {
    return await apiClient.post<{ opportunity: Opportunity }>('/api/sales/opportunities', data);
  },

  updateOpportunity: async (id: string, data: Partial<Opportunity>) => {
    return await apiClient.put<{ opportunity: Opportunity }>(`/api/sales/opportunities/${id}`, data);
  },

  getForecastStats: async () => {
    // Assuming backend aggregates this, or we fetch all opportunities and calculate
    // For now, let's assume a dedicated endpoint exists or we use pipeline stats
    return await apiClient.get<any>('/api/sales/forecast/stats');
  },

  // Sales Agents
  getSalesAgents: async (filters?: { status?: string; role?: string; search?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return await apiClient.get<{ agents: SalesAgent[] }>(`/api/sales/agents?${params}`);
  },

  getSalesAgentStats: async () => {
    return await apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      onLeave: number;
      totalRevenue: number;
      totalQuota: number;
      avgConversionRate: number;
      totalClosedDeals: number;
      totalActiveOpportunities: number;
    }>('/api/sales/agents/stats');
  },

  // Dashboard
  getDashboardStats: async () => {
    return await apiClient.get<SalesDashboardStats>('/api/sales/dashboard/stats');
  },

  // Leads
  getLeads: async () => {
    return await apiClient.get<{ leads: Lead[] }>('/api/sales/leads');
  },

  createLead: async (data: CreateLeadData) => {
    return await apiClient.post<{ lead: Lead; qualification?: Record<string, unknown> }>('/api/sales/leads', data);
  },

  convertLead: async (leadId: string, data: ConvertLeadData) => {
    return await apiClient.post<{ company: Company }>(`/api/sales/leads/${leadId}/convert`, data);
  },

  // Commissions
  getCommissions: async () => {
    return await apiClient.get<{ commissions: Commission[] }>('/api/sales/commissions');
  },

  // Attributed Companies
  getCompanies: async () => {
    return await apiClient.get<{ companies: any[] }>('/api/sales/companies');
  },

  // Withdrawals
  getWithdrawalBalance: async () => {
    return await apiClient.get<import('@/shared/types/withdrawal').WithdrawalBalance>('/api/sales/commissions/balance');
  },

  requestWithdrawal: async (data: import('@/shared/types/withdrawal').WithdrawalRequest) => {
    return await apiClient.post<import('@/shared/types/withdrawal').WithdrawalResponse>('/api/sales/commissions/withdraw', data);
  },

  getWithdrawals: async (filters?: { status?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return await apiClient.get<{ withdrawals: import('@/shared/types/withdrawal').CommissionWithdrawal[] }>(`/api/sales/commissions/withdrawals?${params}`);
  },

  cancelWithdrawal: async (id: string) => {
    return await apiClient.post<{ message: string }>(`/api/sales/commissions/withdrawals/${id}/cancel`);
  },

  // Stripe Connect
  stripeOnboard: async () => {
    return await apiClient.post<{ accountId: string; onboardingUrl: string }>('/api/sales/stripe/onboard');
  },

  getStripeStatus: async () => {
    return await apiClient.get<{ payoutEnabled: boolean; detailsSubmitted: boolean }>('/api/sales/stripe/status');
  },

  getStripeLoginLink: async () => {
    return await apiClient.post<{ url: string }>('/api/sales/stripe/login-link');
  },

  executeWithdrawal: async (id: string) => {
    return await apiClient.post<{ transfer: any; message: string }>(`/api/sales/commissions/withdrawals/${id}/execute`);
  },

  // Activities
  getActivities: async (filters?: { type?: string; outcome?: string; search?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return await apiClient.get<{ activities: SalesActivity[] }>(`/api/sales/activities?${params}`);
  },

  createActivity: async (data: Partial<SalesActivity>) => {
    return await apiClient.post<{ activity: SalesActivity }>('/api/sales/activities', data);
  },

  updateActivity: async (id: string, data: Partial<SalesActivity>) => {
    return await apiClient.put<{ activity: SalesActivity }>(`/api/sales/activities/${id}`, data);
  },

  deleteActivity: async (id: string) => {
    return await apiClient.delete<{ success: boolean }>(`/api/sales/activities/${id}`);
  },

  getActivityStats: async () => {
    return await apiClient.get<{
      total: number;
      completed: number;
      upcoming: number;
      successful: number;
      unsuccessful: number;
      followUpNeeded: number;
      byType: Record<string, number>;
    }>('/api/sales/activities/stats');
  }
};
