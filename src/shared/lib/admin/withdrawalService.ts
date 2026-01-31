import { apiClient } from '@/shared/lib/apiClient';

export interface AdminWithdrawalRequest {
    id: string;
    consultantId: string;
    consultantName: string;
    consultantEmail: string;
    consultantRole?: string;
    stripeConnected?: boolean;
    stripeAccountStatus?: string;
    payoutEnabled?: boolean;
    regionId?: string;
    amount: number;
    status: string;
    paymentMethod: string;
    paymentDetails?: any;
    commissionIds: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
    // Add missing properties found in usage if any
}

export interface ProcessPaymentData {
    paymentReference: string;
    adminNotes?: string;
}

export interface RejectWithdrawalData {
    reason: string;
}

export const adminWithdrawalService = {
    /**
     * Get all pending withdrawal requests
     */
    getPendingWithdrawals: async () => {
        const response = await apiClient.get<{ withdrawals: AdminWithdrawalRequest[] }>('/admin/billing/withdrawals');
        return response.data;
    },

    /**
     * Approve a withdrawal request
     */
    approveWithdrawal: async (id: string) => {
        const response = await apiClient.post<{ message: string }>(`/admin/billing/withdrawals/${id}/approve`);
        return response.data;
    },

    /**
     * Process payment for an approved withdrawal
     */
    processPayment: async (id: string, data: ProcessPaymentData) => {
        const response = await apiClient.post<{ message: string }>(`/admin/billing/withdrawals/${id}/process`, data);
        return response.data;
    },

    /**
     * Reject a withdrawal request
     */
    rejectWithdrawal: async (id: string, data: RejectWithdrawalData) => {
        const response = await apiClient.post<{ message: string }>(`/admin/billing/withdrawals/${id}/reject`, data);
        return response.data;
    },
};
