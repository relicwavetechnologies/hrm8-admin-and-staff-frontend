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
     * Execute withdrawal (trigger Stripe payout)
     */
    async executeWithdrawal(withdrawalId: string) {
        return apiClient.post<{ transfer: any }>(`/api/consultant/commissions/withdrawals/${withdrawalId}/execute`, {});
    }

    /**
     * Get Stripe Connect status
     */
    async getStripeStatus() {
        return apiClient.get<{
            hasAccount: boolean;
            isComplete: boolean;
            accountId?: string;
            detailsSubmitted?: boolean;
            chargesEnabled?: boolean;
            payoutsEnabled?: boolean;
        }>('/api/consultant/stripe/status');
    }

    /**
     * Initiate Stripe Connect onboarding
     */
    async initiateStripeOnboarding() {
        return apiClient.post<{ url: string }>('/api/consultant/stripe/onboard', {});
    }

    /**
     * Get Stripe dashboard login link
     */
    async getStripeLoginLink() {
        return apiClient.post<{ url: string }>('/api/consultant/stripe/login-link', {});
    }
}

export const consultantWithdrawalService = new ConsultantWithdrawalService();
