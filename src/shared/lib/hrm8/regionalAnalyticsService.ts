
import { apiClient as api } from '@/shared/lib/api';

export interface RegionalOperationalStats {
    regionId: string;
    openJobsCount: number;
    activeConsultantsCount: number;
    placementsThisMonth: number;
    activeEmployerCount: number;
    newEmployerCount: number;
    inactiveEmployerCount: number;
    trends: {
        openJobs: Array<{ name: string; value: number }>;
        activeConsultants: Array<{ name: string; value: number }>;
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
