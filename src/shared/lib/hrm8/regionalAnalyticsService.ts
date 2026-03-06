
import { apiClient as api } from '@/shared/lib/api';

export interface RegionalOperationalStats {
    region_id?: string;
    open_jobs_count: number;
    active_consultants_count: number;
    placements_this_month: number;
    active_employer_count: number;
    new_employer_count: number;
    inactive_employer_count: number;
    trends: {
        open_jobs: Array<{ name: string; value: number }>;
        active_consultants: Array<{ name: string; value: number }>;
        placements: Array<{ name: string; value: number }>;
    };
}

export const RegionalAnalyticsService = {
    /**
     * Get operational stats for a specific region
     */
    getOperationalStats: async (regionId: string): Promise<RegionalOperationalStats> => {
        const response = await api.get<RegionalOperationalStats>(`/api/hrm8/analytics/regional/${regionId}/operational`);
        if (!response.data) throw new Error('Failed to fetch regional operational stats');
        return response.data;
    },

    /**
     * Get companies for a region
     */
    getRegionalCompanies: async (regionId: string, params?: { status?: string; sort?: string }): Promise<{ companies: any[] }> => {
        const query = new URLSearchParams(params as any).toString();
        const response = await api.get<{ companies: any[] }>(`/api/hrm8/analytics/regional/${regionId}/companies?${query}`);
        if (!response.data) throw new Error('Failed to fetch regional companies');
        return response.data;
    }
};
