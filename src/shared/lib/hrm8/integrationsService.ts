import { apiClient as api } from '@/shared/lib/api';

export interface GlobalIntegration {
  id: string;
  provider: string;
  name: string;
  category: string;
  api_key?: string | null;
  api_secret?: string | null;
  endpoint_url?: string | null;
  config?: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyIntegration {
  id: string;
  company_id: string | null;
  type: string;
  name: string;
  status: string;
  api_key?: string | null;
  api_secret?: string | null;
  login_url?: string | null;
  username?: string | null;
  password?: string | null;
  config?: Record<string, unknown> | null;
  last_sync_at?: string | null;
  sync_status?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationUsageStat {
  type: string;
  _count: {
    id: number;
  };
}

export const hrm8IntegrationsService = {
  async getCatalog(): Promise<GlobalIntegration[]> {
    const response = await api.get<{ integrations: GlobalIntegration[] }>('/api/hrm8/integrations/catalog');
    if (!response.success) throw new Error(response.error || 'Failed to fetch integrations');
    return response.data?.integrations || [];
  },

  async upsertGlobal(payload: Omit<GlobalIntegration, 'id' | 'created_at' | 'updated_at'> & { id?: string }) {
    const response = await api.post<{ integration: GlobalIntegration }>('/api/hrm8/integrations/global-config', payload);
    if (!response.success) throw new Error(response.error || 'Failed to save integration');
    return response.data?.integration;
  },

  async getUsage(): Promise<IntegrationUsageStat[]> {
    const response = await api.get<{ usage: IntegrationUsageStat[] }>('/api/hrm8/integrations/usage');
    if (!response.success) throw new Error(response.error || 'Failed to fetch usage');
    return response.data?.usage || [];
  },

  async getCompanyIntegrations(company_id: string): Promise<CompanyIntegration[]> {
    const response = await api.get<{ integrations: CompanyIntegration[] }>(`/api/hrm8/integrations/company/${company_id}`);
    if (!response.success) throw new Error(response.error || 'Failed to fetch company integrations');
    return response.data?.integrations || [];
  },

  async createCompanyIntegration(company_id: string, payload: Partial<CompanyIntegration>) {
    const response = await api.post<{ integration: CompanyIntegration }>(`/api/hrm8/integrations/company/${company_id}`, payload);
    if (!response.success) throw new Error(response.error || 'Failed to create integration');
    return response.data?.integration;
  },

  async updateCompanyIntegration(company_id: string, id: string, payload: Partial<CompanyIntegration>) {
    const response = await api.put<{ integration: CompanyIntegration }>(`/api/hrm8/integrations/company/${company_id}/${id}`, payload);
    if (!response.success) throw new Error(response.error || 'Failed to update integration');
    return response.data?.integration;
  },

  async deleteCompanyIntegration(company_id: string, id: string) {
    const response = await api.delete<{ message: string }>(`/api/hrm8/integrations/company/${company_id}/${id}`);
    if (!response.success) throw new Error(response.error || 'Failed to delete integration');
    return response.data;
  },
};
