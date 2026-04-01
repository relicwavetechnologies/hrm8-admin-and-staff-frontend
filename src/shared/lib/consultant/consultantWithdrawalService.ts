/**
 * Consultant Withdrawal Service
 * API service for consultant commission withdrawals
 */

import { apiClient } from '../api';
import {
    WithdrawalBalance,
    WithdrawalRequest,
    CommissionWithdrawal,
    WithdrawalStatus
} from '@/shared/types/withdrawal';

class ConsultantWithdrawalService {
    /**
     * Get withdrawal balance
     */
    async getBalance() {
        return apiClient.get<{ balance: WithdrawalBalance }>('/api/consultant/commissions/balance');
    }

    /**
     * Request a withdrawal
     */
    async requestWithdrawal(data: WithdrawalRequest) {
        return apiClient.post<{ withdrawal: CommissionWithdrawal }>('/api/consultant/commissions/withdraw', data);
    }

    /**
     * Get withdrawal history
     */
    async getWithdrawals(filters?: { status?: WithdrawalStatus }) {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);

        const query = params.toString();
        return apiClient.get<{ withdrawals: CommissionWithdrawal[] }>(
            `/api/consultant/commissions/withdrawals${query ? `?${query}` : ''}`
        );
    }

    /**
     * Cancel a pending withdrawal
     */
    async cancelWithdrawal(withdrawalId: string) {
        return apiClient.post(`/api/consultant/commissions/withdrawals/${withdrawalId}/cancel`, {});
    }

    /**
     * Execute withdrawal through the payout provider
     */
    async executeWithdrawal(withdrawalId: string) {
        return apiClient.post<{ transfer: any }>(`/api/consultant/commissions/withdrawals/${withdrawalId}/execute`, {});
    }

    /**
     * Get payout provider status
     */
    async getPayoutStatus() {
        return apiClient.get<{
            hasAccount: boolean;
            isComplete: boolean;
            accountId?: string;
            detailsSubmitted?: boolean;
            chargesEnabled?: boolean;
            payoutsEnabled?: boolean;
        }>('/api/payouts/status');
    }

    /**
     * Initiate payout provider onboarding
     */
    async onboardPayoutProvider() {
        return apiClient.post<{ url: string }>('/api/payouts/beneficiaries', {});
    }

    /**
     * Get payout dashboard login link
     */
    async getPayoutDashboardLink() {
        return apiClient.post<{ url: string }>('/api/payouts/login-link', {});
    }

}

export const consultantWithdrawalService = new ConsultantWithdrawalService();
