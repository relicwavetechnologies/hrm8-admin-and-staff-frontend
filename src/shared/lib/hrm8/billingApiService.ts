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
    company_name?: string;
    sales_agent_id: string | null;
    referred_by: string | null;
    attribution_locked: boolean;
    attribution_locked_at: string | null;
    created_by: string | null;
}

export interface AttributionCompanySearchResult {
    company_id: string;
    name: string;
    domain: string;
    region_id: string | null;
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
            `/api/hrm8/attribution/${companyId}`
        );
    }

    async searchAttributionCompanies(query: string, limit: number = 10) {
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('limit', String(limit));
        return apiClient.get<{ companies: AttributionCompanySearchResult[] }>(
            `/api/hrm8/attribution/companies/search?${params.toString()}`
        );
    }

    async getAttributionHistory(companyId: string) {
        return apiClient.get<{ history: AttributionHistoryEntry[] }>(
            `/api/hrm8/attribution/${companyId}/history`
        );
    }

    async lockAttribution(companyId: string) {
        return apiClient.post<{ message: string }>(
            `/api/hrm8/attribution/${companyId}/lock`
        );
    }

    async overrideAttribution(companyId: string, newConsultantId: string, reason: string) {
        return apiClient.post<{ message: string }>(
            `/api/hrm8/attribution/${companyId}/override`,
            { new_consultant_id: newConsultantId, reason }
        );
    }

    // ==================== ASSESSMENT PACKAGE CATALOG ====================

    async listAssessPackages(includeInactive = false) {
        return apiClient.get<{ packages: AssessPackage[] }>(
            `/api/admin/billing/assess-packages?includeInactive=${includeInactive}`
        );
    }

    async createAssessPackage(data: CreateAssessPackageInput) {
        return apiClient.post<{ package: AssessPackage }>(`/api/admin/billing/assess-packages`, data);
    }

    async updateAssessPackage(id: string, data: Partial<CreateAssessPackageInput>) {
        return apiClient.put<{ package: AssessPackage }>(`/api/admin/billing/assess-packages/${id}`, data);
    }

    async deactivateAssessPackage(id: string) {
        return apiClient.delete<{ package: AssessPackage }>(`/api/admin/billing/assess-packages/${id}`);
    }

    async getAssessPackageEntitlements(id: string) {
        return apiClient.get<{ entitlements: AssessEntitlement[] }>(
            `/api/admin/billing/assess-packages/${id}/entitlements`
        );
    }

    // ==================== XOBIN PLATFORM CONFIG ====================

    async getXobinPlatformConfig() {
        return apiClient.get<XobinPlatformConfig>(`/api/admin/billing/xobin/config`);
    }

    async setXobinApiKey(apiKey: string) {
        return apiClient.post<{ configured: boolean; apiKeyMasked: string }>(
            `/api/admin/billing/xobin/config/api-key`,
            { apiKey }
        );
    }

    async deleteXobinApiKey() {
        return apiClient.delete<{ configured: boolean }>(`/api/admin/billing/xobin/config/api-key`);
    }

    // ==================== CREDIT PACKS ====================

    async listCreditPackages(includeInactive = false) {
        return apiClient.get<{ packages: CreditPackage[] }>(
            `/api/admin/billing/credit-packages?includeInactive=${includeInactive}`
        );
    }

    async createCreditPackage(data: CreateCreditPackageInput) {
        return apiClient.post<{ package: CreditPackage }>(`/api/admin/billing/credit-packages`, data);
    }

    async updateCreditPackage(id: string, data: Partial<CreateCreditPackageInput>) {
        return apiClient.put<{ package: CreditPackage }>(`/api/admin/billing/credit-packages/${id}`, data);
    }

    async deactivateCreditPackage(id: string) {
        return apiClient.delete<{ package: CreditPackage }>(`/api/admin/billing/credit-packages/${id}`);
    }

    // ==================== CREDIT COST MAP ====================

    async getCreditCostSettings() {
        return apiClient.get<{ costMap: Record<string, number> }>(
            `/api/admin/billing/settings/credit-cost`
        );
    }

    async updateCreditCostSettings(costMap: Record<string, number>) {
        return apiClient.put<{ costMap: Record<string, number> }>(
            `/api/admin/billing/settings/credit-cost`,
            costMap
        );
    }

    // ==================== COMPANY CREDIT OPS ====================

    async listCompanyCreditSummaries(params?: {
        search?: string;
        mode?: 'SEATS' | 'CREDITS';
        limit?: number;
        offset?: number;
    }) {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        if (params?.mode) qs.set('mode', params.mode);
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.offset) qs.set('offset', String(params.offset));
        return apiClient.get<{ items: CompanyCreditSummary[]; limit: number; offset: number }>(
            `/api/admin/billing/companies/credit-summary?${qs.toString()}`
        );
    }

    async getCompanyCreditSummary(companyId: string) {
        return apiClient.get<{
            company: any;
            balance: { available: number; totalPurchased: number; totalConsumed: number; totalAdjusted: number };
            recentEntries: any[];
            counts: { purchases: number; consumptions: number };
        }>(`/api/admin/billing/companies/${companyId}/credit-summary`);
    }

    async getCompanyCreditLedger(
        companyId: string,
        params?: { cursor?: string; sourceType?: string; limit?: number }
    ) {
        const qs = new URLSearchParams();
        if (params?.cursor) qs.set('cursor', params.cursor);
        if (params?.sourceType) qs.set('sourceType', params.sourceType);
        if (params?.limit) qs.set('limit', String(params.limit));
        return apiClient.get<{ items: any[]; nextCursor: string | null }>(
            `/api/admin/billing/companies/${companyId}/credit-ledger?${qs.toString()}`
        );
    }

    async createCreditAdjustment(
        companyId: string,
        data: { delta: number; reason?: string; metadata?: Record<string, unknown> }
    ) {
        return apiClient.post<{ entry: any }>(
            `/api/admin/billing/companies/${companyId}/credit-adjustment`,
            data
        );
    }

    async updateCompanyCreditMode(companyId: string, mode: 'SEATS' | 'CREDITS') {
        return apiClient.post<{ company: { id: string; credit_mode: string; credit_mode_flipped_at: string } }>(
            `/api/admin/billing/companies/${companyId}/credit-mode`,
            { mode }
        );
    }

    async reverseCreditLedgerEntry(
        ledgerId: string,
        data?: { reason?: string; metadata?: Record<string, unknown> }
    ) {
        return apiClient.post<{ reversalLedgerId: string; balanceAfter: number; alreadyReversed: boolean }>(
            `/api/admin/billing/credit-ledger/${ledgerId}/reverse`,
            data || {}
        );
    }

    // ==================== XOBIN MONITORING ====================

    async getXobinStatus() {
        return apiClient.get<XobinStatusResponse>(`/api/admin/billing/xobin/status`);
    }

    async listXobinInvites(params?: {
        companyId?: string;
        status?: string;
        from?: string;
        to?: string;
        limit?: number;
        cursor?: string;
    }) {
        const qs = new URLSearchParams();
        if (params?.companyId) qs.set('companyId', params.companyId);
        if (params?.status) qs.set('status', params.status);
        if (params?.from) qs.set('from', params.from);
        if (params?.to) qs.set('to', params.to);
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.cursor) qs.set('cursor', params.cursor);
        return apiClient.get<{ items: XobinInviteMonitorRow[]; nextCursor: string | null }>(
            `/api/admin/billing/xobin/invites?${qs.toString()}`
        );
    }

    async reverseXobinInviteCredit(assessmentId: string) {
        return apiClient.post<{ reversalLedgerId: string; balanceAfter: number; alreadyReversed: boolean }>(
            `/api/admin/billing/xobin/invites/${assessmentId}/reverse-credit`,
            {}
        );
    }

    async getXobinCogs() {
        return apiClient.get<{ cogsPerInvite: number | null; currency: string; updatedAt: string | null }>(
            `/api/admin/billing/xobin/cogs`
        );
    }

    async setXobinCogs(amount: number, currency: string = 'USD') {
        return apiClient.put<{ cogsPerInvite: number; currency: string }>(
            `/api/admin/billing/xobin/cogs`,
            { amount, currency }
        );
    }

    // ==================== XOBIN PACKAGE CATALOG + PER-ASSESSMENT CREDIT OVERRIDES ====================

    async getXobinPackagesAdmin() {
        return apiClient.get<{
            packages: XobinAdminPackageRow[];
            defaultCost: number;
            overrides: Record<string, number>;
        }>(`/api/admin/billing/xobin/packages`);
    }

    async setXobinPackageCosts(overrides: Record<string, number>) {
        return apiClient.put<{ overrides: Record<string, number> }>(
            `/api/admin/billing/xobin/package-costs`,
            { overrides }
        );
    }

    async syncXobinPackagesPlatform() {
        return apiClient.post<{
            companiesSynced: number;
            totalPackagesSynced: number;
            errorCount: number;
            results: Array<{ companyId: string; syncedCount: number; error?: string }>;
        }>(`/api/admin/billing/xobin/sync-packages`, {});
    }

    async getCreditUsageReport(params?: { from?: string; to?: string; companyId?: string }) {
        const qs = new URLSearchParams();
        if (params?.from) qs.set('from', params.from);
        if (params?.to) qs.set('to', params.to);
        if (params?.companyId) qs.set('companyId', params.companyId);
        return apiClient.get<{ from: string; to: string; rows: any[] }>(
            `/api/admin/billing/credit-usage-report?${qs.toString()}`
        );
    }
}

// ==================== CREDIT TYPES ====================

export interface CreditPackage {
    id: string;
    code: string;
    name: string;
    description: string | null;
    display_order: number;
    credits_included: number;
    base_price: number;
    currency: string;
    region_id: string | null;
    is_active: boolean;
    billing_tag: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCreditPackageInput {
    code: string;
    name: string;
    description?: string;
    displayOrder?: number;
    creditsIncluded: number;
    basePrice: number;
    currency?: string;
    regionId?: string | null;
    billingTag?: string | null;
    isActive?: boolean;
}

export interface CompanyCreditSummary {
    id: string;
    name: string;
    domain: string;
    billingCurrency: string | null;
    creditMode: 'SEATS' | 'CREDITS';
    creditModeFlippedAt: string | null;
    createdAt: string;
    balance: {
        available: number;
        totalPurchased: number;
        totalConsumed: number;
        totalAdjusted: number;
        lastActivityAt: string | null;
    };
}

export interface XobinStatusResponse {
    apiKey: { configured: boolean; source: 'environment' | 'database' | null };
    webhookSecret: { configured: boolean };
    catalog: { totalPackages: number; lastSyncAt: string | null };
    invites: { last24h: number; last30d: number; cancelledLast30d: number; reversalsLast30d: number };
}

export interface XobinInviteMonitorRow {
    id: string;
    status: string;
    invitedAt: string | null;
    expiryDate: string | null;
    xobinAssessmentId: string | null;
    xobinInviteId: string | null;
    providerStatus: string | null;
    launchUrl: string | null;
    lastSyncedAt: string | null;
    candidate: { id: string; name: string; email: string } | null;
    job: { id: string; title: string; company: { id: string; name: string; billing_currency: string | null } | null } | null;
    creditLedger: {
        id: string;
        delta: number;
        reason: string;
        balanceAfter: number;
        createdAt: string;
        isReversed: boolean;
    } | null;
}

export interface XobinAdminPackageRow {
    externalId: string;
    externalCode: string | null;
    name: string;
    description: string | null;
    durationMinutes: number | null;
    cutoffScore: number | null;
    status: string;
    syncedAt: string | null;
    creditCostOverride: number | null;
    effectiveCreditCost: number;
}

export const billingApiService = new BillingApiService();

// ==================== ASSESS TYPES ====================

export interface AssessPackage {
    id: string;
    code: string;
    name: string;
    description: string | null;
    base_price: number;
    currency: string;
    per_candidate_price: number;
    included_candidates: number;
    validity_days: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    _count?: { entitlements: number };
}

export interface CreateAssessPackageInput {
    code: string;
    name: string;
    description?: string;
    basePrice: number;
    currency?: string;
    perCandidatePrice?: number;
    includedCandidates: number;
    validityDays?: number | null;
}

export interface AssessEntitlement {
    id: string;
    company_id: string;
    job_id: string | null;
    package_catalog_id: string;
    included_seats: number;
    purchased_extra_seats: number;
    used_seats: number;
    status: string;
    expires_at: string | null;
    created_at: string;
}

export interface XobinPlatformConfig {
    apiKeyConfigured: boolean;
    apiKeyMasked: string | null;
    source: 'database' | 'environment' | null;
    webhookSecretConfigured: boolean;
}
