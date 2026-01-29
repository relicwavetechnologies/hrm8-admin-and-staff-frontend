/**
 * Billing Admin API Service
 * Connects to the new /api/admin/billing/ endpoints
 */

import { apiClient } from '../api';

// ==================== TYPES ====================

export interface Commission {
    id: string;
    consultantId: string;
    regionId: string;
    jobId?: string;
    companyId?: string;
    amount: number;
    currency: string;
    commissionType: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
    rate?: number;
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
    confirmedAt?: string;
    paidAt?: string;
    paidTo?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegionalRevenue {
    id: string;
    regionId: string;
    licenseeId?: string;
    periodStart: string;
    periodEnd: string;
    totalRevenue: number;
    licenseeShare: number;
    hrm8Share: number;
    subscriptionRevenue: number;
    jobPaymentRevenue: number;
    status: 'PENDING' | 'SETTLED';
    createdAt: string;
}

export interface Settlement {
    id: string;
    licenseeId: string;
    periodStart: string;
    periodEnd: string;
    totalRevenue: number;
    licenseeShare: number;
    hrm8Share: number;
    status: 'PENDING' | 'PAID';
    paymentDate?: string;
    paymentReference?: string;
    createdAt: string;
    licensee?: {
        id: string;
        name: string;
    };
}

export interface SettlementStats {
    totalPending: number;
    totalPaid: number;
    pendingAmount: number;
    paidAmount: number;
}

export interface AttributionData {
    companyId: string;
    salesAgentId: string | null;
    referredBy: string | null;
    attributionLocked: boolean;
    attributionLockedAt: string | null;
    createdBy: string | null;
}

export interface AttributionHistoryEntry {
    id: string;
    companyId: string;
    type: string;
    subject: string;
    description: string;
    attachments: {
        audit_type: string;
        action: string;
        previousSalesAgentId: string | null;
        newSalesAgentId: string | null;
        performedBy: string;
        reason: string | null;
    };
    createdAt: string;
}

// ==================== BILLING API SERVICE ====================

class BillingApiService {
    // -------------------- COMMISSIONS --------------------

    async getCommissions(filters?: {
        consultantId?: string;
        regionId?: string;
        jobId?: string;
        status?: string;
        type?: string;
        page?: number;
        limit?: number;
    }) {
        const params = new URLSearchParams();
        if (filters?.consultantId) params.append('consultantId', filters.consultantId);
        if (filters?.regionId) params.append('regionId', filters.regionId);
        if (filters?.jobId) params.append('jobId', filters.jobId);
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
            { paymentReference }
        );
    }

    async bulkPayCommissions(commissionIds: string[], paymentReference: string) {
        return apiClient.post<{ processed: number; errors: string[] }>(
            '/api/admin/billing/commissions/bulk-pay',
            { commissionIds, paymentReference }
        );
    }

    // -------------------- REVENUE --------------------

    async getPendingRevenue(licenseeId?: string) {
        const params = new URLSearchParams();
        if (licenseeId) params.append('licenseeId', licenseeId);

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
        if (filters?.licenseeId) params.append('licenseeId', filters.licenseeId);
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
            { periodEnd }
        );
    }

    async generateAllSettlements(periodEnd?: string) {
        return apiClient.post<{ generated: number; errors: string[] }>(
            '/api/admin/billing/settlements/generate-all',
            { periodEnd }
        );
    }

    async markSettlementPaid(settlementId: string, paymentReference: string) {
        return apiClient.post<{ message: string }>(
            `/api/admin/billing/settlements/${settlementId}/pay`,
            { paymentReference }
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
            { newConsultantId, reason }
        );
    }
}

export const billingApiService = new BillingApiService();
