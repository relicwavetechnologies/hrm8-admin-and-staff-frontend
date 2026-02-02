/**
 * Global Revenue Analytics Service
 * API client for revenue dashboard analytics
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RevenueSummary {
    totalRevenue: number;
    totalCommissions: number;
    netRevenue: number;
    commissionRate: number;
    billCount: number;
    paidCommissionCount: number;
}

export interface RegionRevenue {
    regionId: string;
    regionName: string;
    revenue: number;
    commissions: number;
    netRevenue: number;
    billCount: number;
    consultantCount: number;
}

export interface CommissionTypeBreakdown {
    type: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface TopConsultant {
    consultantId: string;
    name: string;
    totalCommissions: number;
    commissionCount: number;
    regionId: string;
    regionName: string;
}

export interface RevenueTimelineEntry {
    month: string;
    revenue: number;
    commissions: number;
    netRevenue: number;
    billCount: number;
}

export interface DashboardData {
    summary: RevenueSummary;
    byRegion: RegionRevenue[];
    byCommissionType: CommissionTypeBreakdown[];
    topConsultants: TopConsultant[];
    timeline: RevenueTimelineEntry[];
}

export const revenueAnalyticsService = {
    /**
     * Get comprehensive dashboard data
     */
    async getDashboard(filters: {
        startDate?: string;
        endDate?: string;
    }): Promise<DashboardData> {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/api/hrm8/revenue/dashboard?${queryString}`
            : '/api/hrm8/revenue/dashboard';

        const response = await apiClient.get<any>(endpoint);

        if (!response.success) {
            throw new Error(response.error || 'Failed to get revenue dashboard');
        }

        return response.data;
    },

    /**
     * Get revenue summary only
     */
    async getSummary(filters: {
        startDate?: string;
        endDate?: string;
    }): Promise<RevenueSummary> {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/api/hrm8/revenue/summary?${queryString}`
            : '/api/hrm8/revenue/summary';

        const response = await apiClient.get<any>(endpoint);

        if (!response.success) {
            throw new Error(response.error || 'Failed to get revenue summary');
        }

        return response.data;
    },
};
