/**
 * Regional Sales Service (Frontend)
 * Fetches sales pipeline data for Regional Licensees
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RegionalOpportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  sales_agent_id: string; // Added field
  sales_agent?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  company: {
    id: string;
    name: string;
    domain: string;
  };
}

export interface RegionalPipelineStats {
  regionId: string;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  dealCount: number;
  activeAgents: number;
  byStage: Record<string, { count: number; value: number }>;
}

interface OpportunitiesResponse {
  opportunities: RegionalOpportunity[];
}

interface ActivitiesResponse {
  activities: Record<string, unknown>[];
}

export interface RegionalLead {
  id: string;
  company_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  country: string;
  status: string;
  created_at: string;
  assigned_consultant_id: string | null;
  consultant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  referrer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface LeadsResponse {
  leads: RegionalLead[];
}

export const regionalSalesService = {
  /**
   * Get Leads for a region
   */
  getLeads: async (regionId: string) => {
    const params = new URLSearchParams({ regionId });
    const response = await apiClient.get<LeadsResponse>(`/api/hrm8/leads/regional?${params.toString()}`);
    return response.data?.leads || [];
  },

  /**
   * Reassign a lead
   */
  reassignLead: async (leadId: string, consultantId: string) => {
    const response = await apiClient.post<{ success: boolean; data: { lead: RegionalLead } }>(`/api/hrm8/leads/${leadId}/reassign`, { newConsultantId: consultantId });
    return response;
  },

  /**
   * Get Opportunities for a region
   */
  getOpportunities: async (regionId: string, filters?: Record<string, string>) => {
    console.log('[regionalSalesService] 📤 Fetching opportunities for region:', regionId, 'filters:', filters);
    // Construct query string manually for GET params
    const params = new URLSearchParams({ regionId, ...filters });
    const response = await apiClient.get<OpportunitiesResponse>(`/api/hrm8/sales/regional/opportunities?${params.toString()}`);

    console.log('[regionalSalesService] 📦 Response structure:', {
      success: response.success,
      dataKeys: response.data ? Object.keys(response.data) : [],
      opportunities: response.data?.opportunities,
    });

    const opportunities = response.data?.opportunities || [];
    console.log('[regionalSalesService] ✅ Returning opportunities:', opportunities.length);

    return opportunities;
  },

  /**
   * Get Pipeline Stats for a region
   */
  getStats: async (regionId: string) => {
    console.log('[regionalSalesService] 📤 Fetching stats for region:', regionId);
    const params = new URLSearchParams({ regionId });
    const response = await apiClient.get<RegionalPipelineStats>(`/api/hrm8/sales/regional/stats?${params.toString()}`);

    console.log('[regionalSalesService] 📊 Stats response:', {
      success: response.success,
      stats: response.data,
    });

    return response.data as RegionalPipelineStats;
  },

  /**
   * Get Recent Activities for a region
   */
  getActivities: async (regionId: string) => {
    console.log('[regionalSalesService] 📤 Fetching activities for region:', regionId);
    const params = new URLSearchParams({ regionId });
    const response = await apiClient.get<ActivitiesResponse>(`/api/hrm8/sales/regional/activities?${params.toString()}`);

    console.log('[regionalSalesService] 📋 Activities response:', {
      success: response.success,
      activities: response.data?.activities,
    });

    return response.data?.activities || [];
  }
};
