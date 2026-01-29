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

    // Stripe status query
    const stripeStatusQuery = useQuery({
        queryKey: ['wallet', 'stripe', 'status'],
        queryFn: async () => {
            const response = await apiClient.get<StripeStatus>(`${API_BASE}/stripe/status`);
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

    // Stripe onboard mutation
    const stripeOnboardMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<{ accountId: string; onboardingUrl: string }>(
                `${API_BASE}/stripe/onboard`
            );
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    // Stripe login mutation
    const stripeLoginMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<{ url: string }>(`${API_BASE}/stripe/login`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    return {
        // Queries
        balance: balanceQuery.data,
        earnings: earningsQuery.data,
        transactions: transactionsQuery.data,
        stripeStatus: stripeStatusQuery.data,
        minimumWithdrawal: minimumQuery.data || 50,

        // Loading states
        isLoading: balanceQuery.isLoading || earningsQuery.isLoading,
        isLoadingTransactions: transactionsQuery.isLoading,
        isLoadingStripe: stripeStatusQuery.isLoading,

        // Errors
        error: balanceQuery.error || earningsQuery.error,

        // Mutations
        withdraw: withdrawMutation.mutateAsync,
        isWithdrawing: withdrawMutation.isPending,
        withdrawError: withdrawMutation.error,

        stripeOnboard: stripeOnboardMutation.mutateAsync,
        isOnboarding: stripeOnboardMutation.isPending,

        stripeLogin: stripeLoginMutation.mutateAsync,
        isLoggingIn: stripeLoginMutation.isPending,

        // Refresh functions
        refreshBalance: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] }),
        refreshAll: () => queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    };
}
