import { apiClient } from '@/shared/lib/apiClient';

export interface BeneficiaryStatus {
    status: 'READY' | 'INCOMPLETE' | 'PENDING_VERIFICATION' | 'RESTRICTED';
    label: string;
    description: string;
    missingFields: string[];
}

export interface FinanceTimelineEntry {
    key: string;
    status: string;
    label: string;
    description: string;
    at: string | null;
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface AdminWithdrawalRequest {
    id: string;
    requestKind?: 'STAFF' | 'COMPANY';
    consultantId?: string;
    consultantName?: string;
    consultantEmail?: string | null;
    companyId?: string;
    companyName?: string;
    recipientName?: string;
    recipientEmail?: string | null;
    consultantRole?: string;
    payoutProviderConnected?: boolean;
    payoutAccountStatus?: string;
    payoutEnabled?: boolean;
    regionId?: string;
    amount: number;
    /** FX settlement amount when different from `amount` */
    payoutAmount?: number | null;
    currency?: string | null;
    payoutCurrency?: string | null;
    fxRateUsed?: number | null;
    status: string;
    paymentMethod: string;
    paymentDetails?: any;
    commissionIds?: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
    processedAt?: string | null;
    secondaryApprovalRequired?: boolean;
    secondaryApprovedBy?: string | null;
    secondaryApprovedAt?: string | null;
    riskHoldReason?: string | null;
    transferInitiatedAt?: string | null;
    transferCompletedAt?: string | null;
    rejectedAt?: string | null;
    rejectionReason?: string | null;
    transferFailedReason?: string | null;
    paymentReference?: string | null;
    providerTransferId?: string | null;
    xeroBillId?: string | null;
    beneficiaryStatus?: BeneficiaryStatus;
    timeline?: FinanceTimelineEntry[];
}

export interface ProcessPaymentData {
    paymentReference: string;
    adminNotes?: string;
}

export interface PayoutConfigResponse {
    BILLING_PROVIDER_MODE: string;
    AIRWALLEX_FALLBACK_TO_MOCK_ON_ERROR: boolean;
    MANUAL_OFFLINE_PAYOUT_MODE: boolean;
    BILLING_STRICT_LIVE: boolean;
    NODE_ENV: string;
}

export interface RejectWithdrawalData {
    reason: string;
}

export const adminWithdrawalService = {
    getPayoutConfig: async () => {
        const response = await apiClient.get<PayoutConfigResponse>('/api/hrm8/admin/billing/payout-config');
        if (!response.success || response.data == null) return null;
        return response.data;
    },

    getPendingWithdrawals: async () => {
        const response = await apiClient.get<{ withdrawals: AdminWithdrawalRequest[] }>('/api/hrm8/admin/billing/withdrawals');
        return response.data;
    },

    approveWithdrawal: async (id: string) => {
        const response = await apiClient.post<{ message: string }>(`/api/hrm8/admin/billing/withdrawals/${id}/approve`);
        return response.data;
    },

    secondaryApproveWithdrawal: async (id: string) => {
        const response = await apiClient.post<{ message: string }>(`/api/hrm8/admin/billing/withdrawals/${id}/secondary-approve`);
        return response.data;
    },

    executeAirwallexPayout: async (id: string) => {
        const response = await apiClient.post<{ transferId?: string; xeroBillId?: string; status?: string }>(
            `/api/hrm8/admin/billing/withdrawals/${id}/execute-airwallex`
        );
        if (!response.success) {
            throw new Error(response.error || 'Execute Airwallex payout failed');
        }
        return response.data;
    },

    processPayment: async (id: string, data: ProcessPaymentData) => {
        const response = await apiClient.post<{ message: string }>(`/api/hrm8/admin/billing/withdrawals/${id}/process`, {
            paymentReference: data.paymentReference,
            adminNotes: data.adminNotes,
        });
        if (!response.success) {
            throw new Error(response.error || 'Manual payout failed');
        }
        return response.data;
    },

    rejectWithdrawal: async (id: string, data: RejectWithdrawalData) => {
        const response = await apiClient.post<{ message: string }>(`/api/hrm8/admin/billing/withdrawals/${id}/reject`, data);
        return response.data;
    },
};
