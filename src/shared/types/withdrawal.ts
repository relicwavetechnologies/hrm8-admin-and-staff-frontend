export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface WithdrawalBalance {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    /** Staff's single currency (payout currency) - all amounts are in this currency */
    currency?: string;
    availableCommissions: Array<{
        id: string;
        amount: number;
        currency?: string;
        payoutAmount?: number;
        payoutCurrency?: string;
        fxRate?: number;
        fxRateLockedAt?: string;
        description: string;
        createdAt: string;
        date?: string;
    }>;
}

export interface WithdrawalRequest {
    amount: number;
    paymentMethod: string;
    paymentDetails?: any;
    commissionIds: string[];
    notes?: string;
}

export interface CommissionWithdrawal {
    id: string;
    consultantId: string;
    amount: number;
    status: WithdrawalStatus;
    paymentMethod: string;
    paymentDetails?: any;
    commissionIds: string[];
    processedBy?: string;
    processedAt?: string;
    paymentReference?: string;
    adminNotes?: string;
    rejectionReason?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    notes?: string;
    payoutCurrency?: string;
    payoutAmount?: number;
    fxRateUsed?: number;
    airwallexTransferId?: string;
    xeroBillId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawalResponse {
    withdrawal: CommissionWithdrawal;
}

export interface WithdrawalHistoryResponse {
    withdrawals: CommissionWithdrawal[];
}
