/**
 * Billing Admin API Service
 * Connects to the new /api/admin/billing/ endpoints
 */

import { apiClient } from '../api';

// ==================== TYPES ====================

export interface Commission {
    id: string;
    consultant_id: string;
    region_id: string;
    job_id?: string;
    company_id?: string;
    amount: number;
    currency: string;
    commission_type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
    rate?: number;
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
    confirmed_at?: string;
    paid_at?: string;
    paid_to?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface RegionalRevenue {
    id: string;
    region_id: string;
    licensee_id?: string;
    period_start: string;
    period_end: string;
    total_revenue: number;
    licensee_share: number;
    hrm8_share: number;
    subscription_revenue: number;
    job_payment_revenue: number;
    status: 'PENDING' | 'SETTLED';
    created_at: string;
}

export interface Settlement {
    id: string;
    licensee_id: string;
    period_start: string;
    period_end: string;
    total_revenue: number;
    licensee_share: number;
    hrm8_share: number;
    status: 'PENDING' | 'PAID';
    payment_date?: string;
    payment_reference?: string;
    created_at: string;
    licensee?: {
        id: string;
        name: string;
    };
}

export interface SettlementStats {
    total_pending: number;
    total_paid: number;
    pending_amount: number;
    paid_amount: number;
}

export interface AttributionData {
    company_id: string;
    sales_agent_id: string | null;
    referred_by: string | null;
    attribution_locked: boolean;
    attribution_locked_at: string | null;
    created_by: string | null;
}

export interface AttributionHistoryEntry {
    id: string;
    company_id: string;
    type: string;
    subject: string;
    description: string;
    attachments: {
        audit_type: string;
        action: string;
        previous_sales_agent_id: string | null;
        new_sales_agent_id: string | null;
        performed_by: string;
        reason: string | null;
    };
    created_at: string;
}

// ==================== BILLING API SERVICE ====================

class BillingApiService {
    // -------------------- COMMISSIONS --------------------

    async getCommissions(filters?: {
        consultant_id?: string;
        region_id?: string;
        job_id?: string;
        status?: string;
        type?: string;
        page?: number;
        limit?: number;
    }) {
        const params = new URLSearchParams();
        if (filters?.consultant_id) params.append('consultant_id', filters.consultant_id);
        if (filters?.region_id) params.append('region_id', filters.region_id);
        if (filters?.job_id) params.append('job_id', filters.job_id);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const query = params.toString();
        return apiClient.get<{
            commissions: Commission[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`/api/admin/billing/commissions${query ? `?${query}` : ''}`);
    }

    async getConsultantCommissions(consultantId: string, filters?: { status?: string; type?: string }) {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);

        const query = params.toString();
        return apiClient.get<{ commissions: Commission[] }>(
            `/api/admin/billing/commissions/consultant/${consultantId}${query ? `?${query}` : ''}`
        );
    }

    async payCommission(commissionId: string, paymentReference: string) {
        return apiClient.post<{ message: string }>(
            `/api/admin/billing/commissions/${commissionId}/pay`,
            { payment_reference: paymentReference }
        );
    }

    async bulkPayCommissions(commissionIds: string[], paymentReference: string) {
        return apiClient.post<{ processed: number; errors: string[] }>(
            '/api/admin/billing/commissions/bulk-pay',
            { commission_ids: commissionIds, payment_reference: paymentReference }
        );
    }

    // -------------------- REVENUE --------------------

    async getPendingRevenue(licenseeId?: string) {
        const params = new URLSearchParams();
        if (licenseeId) params.append('licensee_id', licenseeId);

        const query = params.toString();
        return apiClient.get<{ revenues: RegionalRevenue[] }>(
            `/api/admin/billing/revenue/pending${query ? `?${query}` : ''}`
        );
    }

    async getRegionalRevenue(regionId: string, options?: { limit?: number; status?: string }) {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.status) params.append('status', options.status);

        const query = params.toString();
        return apiClient.get<{ revenues: RegionalRevenue[] }>(
            `/api/admin/billing/revenue/region/${regionId}${query ? `?${query}` : ''}`
        );
    }

    async calculateMonthlyRevenue(regionId: string, month: string) {
        return apiClient.post<{ breakdown: RegionalRevenue }>(
            `/api/admin/billing/revenue/region/${regionId}/calculate`,
            { month }
        );
    }

    async processAllRegionsRevenue(month?: string) {
        return apiClient.post<{ processed: number; errors: string[]; month: string }>(
            '/api/admin/billing/revenue/process-all',
            { month }
        );
    }

    // -------------------- SETTLEMENTS --------------------

    async getSettlements(filters?: { licenseeId?: string; status?: string; limit?: number }) {
        const params = new URLSearchParams();
        if (filters?.licenseeId) params.append('licensee_id', filters.licenseeId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const query = params.toString();
        return apiClient.get<{ settlements?: Settlement[]; stats?: SettlementStats }>(
            `/api/admin/billing/settlements${query ? `?${query}` : ''}`
        );
    }

    async getSettlementById(settlementId: string) {
        return apiClient.get<{ settlement: Settlement }>(
            `/api/admin/billing/settlements/${settlementId}`
        );
    }

    async getSettlementStats() {
        return apiClient.get<{ stats: SettlementStats }>('/api/admin/billing/settlements/stats');
    }

    async generateSettlement(licenseeId: string, periodEnd?: string) {
        return apiClient.post<{ settlement: Settlement; revenueRecordsIncluded: number }>(
            `/api/admin/billing/settlements/licensee/${licenseeId}/generate`,
            { period_end: periodEnd }
        );
    }

    async generateAllSettlements(periodEnd?: string) {
        return apiClient.post<{ generated: number; errors: string[] }>(
            '/api/admin/billing/settlements/generate-all',
            { period_end: periodEnd }
        );
    }

    async markSettlementPaid(settlementId: string, paymentReference: string) {
        return apiClient.post<{ message: string }>(
            `/api/admin/billing/settlements/${settlementId}/pay`,
            { payment_reference: paymentReference }
        );
    }

    // -------------------- ATTRIBUTION --------------------

    async getAttribution(companyId: string) {
        return apiClient.get<{ attribution: AttributionData }>(
            `/api/admin/billing/attribution/${companyId}`
        );
    }

    async getAttributionHistory(companyId: string) {
        return apiClient.get<{ history: AttributionHistoryEntry[] }>(
            `/api/admin/billing/attribution/${companyId}/history`
        );
    }

    async lockAttribution(companyId: string) {
        return apiClient.post<{ message: string }>(
            `/api/admin/billing/attribution/${companyId}/lock`
        );
    }

    async overrideAttribution(companyId: string, newConsultantId: string, reason: string) {
        return apiClient.post<{ message: string }>(
            `/api/admin/billing/attribution/${companyId}/override`,
            { new_consultant_id: newConsultantId, reason }
        );
    }
}

export const billingApiService = new BillingApiService();
