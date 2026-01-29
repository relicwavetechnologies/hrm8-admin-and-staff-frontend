import { apiClient } from '../api';

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
        return await apiClient.get<{ withdrawals: AdminWithdrawalRequest[] }>('/api/admin/billing/withdrawals');
    },

    /**
     * Approve a withdrawal request
     */
    approveWithdrawal: async (id: string) => {
        return await apiClient.post<{ message: string }>(`/api/admin/billing/withdrawals/${id}/approve`);
    },

    /**
     * Process payment for an approved withdrawal
     */
    processPayment: async (id: string, data: ProcessPaymentData) => {
        return await apiClient.post<{ message: string }>(`/api/admin/billing/withdrawals/${id}/process`, data);
    },

    /**
     * Reject a withdrawal request
     */
    rejectWithdrawal: async (id: string, data: RejectWithdrawalData) => {
        return await apiClient.post<{ message: string }>(`/api/admin/billing/withdrawals/${id}/reject`, data);
    },
};
