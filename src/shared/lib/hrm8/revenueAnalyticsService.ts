/**
 * Global Revenue Analytics Service
 * API client for revenue dashboard analytics
 */

import { apiClient } from '../api';

export interface RevenueSummary {
    total_revenue: number;
    total_commissions: number;
    net_revenue: number;
    commission_rate: number;
    bill_count: number;
    paid_commission_count: number;
}

export interface RegionRevenue {
    region_id: string;
    region_name: string;
    revenue: number;
    commissions: number;
    net_revenue: number;
    bill_count: number;
    consultant_count: number;
}

export interface CommissionTypeBreakdown {
    type: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface TopConsultant {
    consultant_id: string;
    name: string;
    total_commissions: number;
    commission_count: number;
    region_id: string;
    region_name: string;
}

export interface RevenueTimelineEntry {
    month: string;
    revenue: number;
    commissions: number;
    net_revenue: number;
    bill_count: number;
}

export interface DashboardData {
    summary: RevenueSummary;
    by_region: RegionRevenue[];
    by_commission_type: CommissionTypeBreakdown[];
    top_consultants: TopConsultant[];
    timeline: RevenueTimelineEntry[];
}

export const revenueAnalyticsService = {
    /**
     * Get comprehensive dashboard data
     */
    async getDashboard(filters: {
        start_date?: string;
        end_date?: string;
    }): Promise<DashboardData> {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

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
        start_date?: string;
        end_date?: string;
    }): Promise<RevenueSummary> {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

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
