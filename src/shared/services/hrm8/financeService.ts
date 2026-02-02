/**
 * HRM8 Finance Service
 * Handles API calls for finance management (invoices, dunning, settlements)
 */

import { apiClient } from '@/shared/lib/apiClient';

// Types
export interface Invoice {
    id: string;
    company_id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    due_date: string;
    paid_at?: string;
    created_at: string;
    company?: {
        id: string;
        name: string;
        region_id?: string;
    };
}

export interface DunningCandidate {
    id: string;
    company_id: string;
    amount: number;
    due_date: string;
    status: string;
    company?: {
        id: string;
        name: string;
        email?: string;
    };
}

export interface SettlementCalculation {
    licenseeId: string;
    periodStart: string;
    periodEnd: string;
    totalRevenue: number;
    commissionRate: number;
    licenseeShare: number;
    platformShare: number;
    billCount: number;
}

export interface InvoiceFilters {
    status?: string;
    companyId?: string;
    agingDays?: number;
}

interface InvoicesResponse {
    invoices: Invoice[];
}

interface DunningResponse {
    candidates: DunningCandidate[];
}

interface SettlementResponse {
    settlement: SettlementCalculation;
}

// ==================== INVOICES ====================

export const getInvoices = async (filters: InvoiceFilters = {}): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.agingDays) params.append('agingDays', filters.agingDays.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/hrm8/finance/invoices?${queryString}` : '/api/hrm8/finance/invoices';
    const response = await apiClient.get<InvoicesResponse>(endpoint);
    return response.data?.invoices || [];
};

// ==================== DUNNING ====================

export const getDunningCandidates = async (): Promise<DunningCandidate[]> => {
    const response = await apiClient.get<DunningResponse>('/api/hrm8/finance/dunning');
    return response.data?.candidates || [];
};

// ==================== SETTLEMENTS ====================

export const calculateSettlement = async (
    licenseeId: string,
    periodStart: string,
    periodEnd: string
): Promise<SettlementCalculation | null> => {
    const response = await apiClient.post<SettlementResponse>('/api/hrm8/finance/settlements/calculate', {
        licenseeId,
        periodStart,
        periodEnd
    });
    return response.data?.settlement || null;
};

// Export as default object
const financeService = {
    getInvoices,
    getDunningCandidates,
    calculateSettlement,
};

export default financeService;
