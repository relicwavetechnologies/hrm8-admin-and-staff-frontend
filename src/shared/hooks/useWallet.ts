/**
 * useWallet Hook
 * Unified wallet operations hook for both Consultant and Sales Agent portals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';

// Types
export interface WalletBalance {
    walletBalance: number;
    pendingCommissions: number;
    availableForWithdrawal: number;
    totalEarned: number;
    totalWithdrawn: number;
    stripeConnected: boolean;
    payoutEnabled: boolean;
}

export interface EarningsSummary {
    totalEarned: number;
    pendingCommissions: number;
    confirmedCommissions: number;
    paidCommissions: number;
    commissions: {
        pending: Array<{ id: string; amount: number; description: string; createdAt: string }>;
        confirmed: Array<{ id: string; amount: number; description: string; createdAt: string }>;
    };
}

export interface WalletTransaction {
    id: string;
    type: string;
    amount: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    createdAt: string;
    status: string;
}

export interface StripeStatus {
    payoutEnabled: boolean;
    detailsSubmitted: boolean;
}

// API base path - unified endpoint for both portals
const API_BASE = '/api/consultant-wallet';

/**
 * Hook for wallet operations
 */
export function useWallet() {
    const queryClient = useQueryClient();

    // Balance query
    const balanceQuery = useQuery({
        queryKey: ['wallet', 'balance'],
        queryFn: async () => {
            const response = await apiClient.get<WalletBalance>(`${API_BASE}/balance`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    // Earnings query
    const earningsQuery = useQuery({
        queryKey: ['wallet', 'earnings'],
        queryFn: async () => {
            const response = await apiClient.get<EarningsSummary>(`${API_BASE}/earnings`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    // Transactions query
    const transactionsQuery = useQuery({
        queryKey: ['wallet', 'transactions'],
        queryFn: async () => {
            const response = await apiClient.get<{ transactions: WalletTransaction[] }>(
                `${API_BASE}/transactions?limit=50`
            );
            if (!response.success) throw new Error(response.error);
            return response.data?.transactions || [];
        },
    });

    // Payout status query
    const payoutStatusQuery = useQuery({
        queryKey: ['wallet', 'payout', 'status'],
        queryFn: async () => {
            const response = await apiClient.get<StripeStatus>(`/api/payouts/status`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    // Minimum withdrawal query
    const minimumQuery = useQuery({
        queryKey: ['wallet', 'minimum'],
        queryFn: async () => {
            const response = await apiClient.get<{ minimumWithdrawal: number }>(`${API_BASE}/minimum`);
            if (!response.success) throw new Error(response.error);
            return response.data?.minimumWithdrawal || 50;
        },
        staleTime: Infinity, // Minimum doesn't change
    });

    // Withdrawal mutation
    const withdrawMutation = useMutation({
        mutationFn: async (data: { amount: number; commissionIds?: string[]; notes?: string }) => {
            const response = await apiClient.post(`${API_BASE}/withdraw`, data);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });

    // Payout provider onboard mutation
    const payoutOnboardMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<{ accountId: string; onboardingUrl: string }>(
                `/api/payouts/beneficiaries`
            );
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    // Payout dashboard link mutation
    const payoutDashboardMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<{ url: string }>(`/api/payouts/login-link`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    return {
        // Queries
        balance: balanceQuery.data,
        earnings: earningsQuery.data,
        transactions: transactionsQuery.data,
        payoutStatus: payoutStatusQuery.data,
        /** @deprecated Use payoutStatus instead */
        stripeStatus: payoutStatusQuery.data,
        minimumWithdrawal: minimumQuery.data || 50,

        // Loading states
        isLoading: balanceQuery.isLoading || earningsQuery.isLoading,
        isLoadingTransactions: transactionsQuery.isLoading,
        isLoadingPayoutStatus: payoutStatusQuery.isLoading,
        /** @deprecated Use isLoadingPayoutStatus instead */
        isLoadingStripe: payoutStatusQuery.isLoading,

        // Errors
        error: balanceQuery.error || earningsQuery.error,

        // Mutations
        withdraw: withdrawMutation.mutateAsync,
        isWithdrawing: withdrawMutation.isPending,
        withdrawError: withdrawMutation.error,

        onboardPayoutProvider: payoutOnboardMutation.mutateAsync,
        /** @deprecated Use onboardPayoutProvider instead */
        stripeOnboard: payoutOnboardMutation.mutateAsync,
        isOnboarding: payoutOnboardMutation.isPending,

        getPayoutDashboardLink: payoutDashboardMutation.mutateAsync,
        /** @deprecated Use getPayoutDashboardLink instead */
        stripeLogin: payoutDashboardMutation.mutateAsync,
        isLoggingIn: payoutDashboardMutation.isPending,

        // Refresh functions
        refreshBalance: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] }),
        refreshAll: () => queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    };
}
