/**
 * HRM8 Finance Service
 * Handles API calls for finance management (invoices, dunning, settlements)
 */

import { apiClient } from '@/shared/lib/apiClient';

// Types
export interface Invoice {
    id: string;
    bill_number: string;
    company_id: string;
    amount: number;
    currency: string;
    total_amount: number;
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
    company_id?: string;
    aging_days?: number;
    region_id?: string;
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
    if (filters.company_id) params.append('company_id', filters.company_id);
    if (filters.aging_days) params.append('aging_days', filters.aging_days.toString());
    if (filters.region_id) params.append('region_id', filters.region_id);

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

export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/hrm8/finance/invoices/${invoiceId}/download`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to download invoice');
    }

    return response.blob();
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
    downloadInvoice,
};

export default financeService;
