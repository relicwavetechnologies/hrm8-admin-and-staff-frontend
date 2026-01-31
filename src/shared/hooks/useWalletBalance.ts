import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';

export interface WalletBalance {
    balance: number;
    currency: string;
}

export interface WalletCheckResult {
    canPost: boolean;
    balance: number;
    required: number;
    shortfall: number;
    currency: string;
}

export function useWalletBalance() {
    const { data: balanceData, isLoading, refetch } = useQuery({
        queryKey: ['wallet-balance'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: number }>('/api/wallet/balance');
            return response.data; // Response format: { success: true, data: 1234.56 }
        }
    });

    const checkBalanceForJob = useCallback(async (servicePackage: string): Promise<WalletCheckResult> => {
        // This could also be an API call if we add the specific check endpoint
        // For now we'll rely on the backend error 402, but pre-checking is nice UX

        // Map service packages to prices (client-side estimation, backend is source of truth)
        const prices: Record<string, number> = {
            'self-managed': 0,
            'shortlisting': 1990,
            'full-service': 5990,
            'executive-search': 9990
        };

        const required = prices[servicePackage] || 0;
        // Handle the case where balanceData might be the full response object or just the number depending on API
        // Based on wallet.controller.ts: return res.json({ success: true, data: balance });
        const currentBalance = typeof balanceData === 'number' ? balanceData : (balanceData as any)?.data || 0;

        return {
            canPost: currentBalance >= required,
            balance: currentBalance,
            required,
            shortfall: Math.max(0, required - currentBalance),
            currency: 'USD'
        };
    }, [balanceData]);

    return {
        balance: typeof balanceData === 'number' ? balanceData : (balanceData as any)?.data || 0,
        isLoading,
        refetch,
        checkBalanceForJob
    };
}
