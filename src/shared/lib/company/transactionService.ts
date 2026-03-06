/**
 * Transaction Service
 * Frontend service for company transaction API
 */

import { apiClient } from '../api';

export interface Transaction {
    id: string;
    type: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL';
    amount: number;
    date: string;
    description: string;
    status: string;
    reference?: string;
    refundStatus?: string;
    refundId?: string;
}

export interface TransactionStats {
    totalSpent: number;
    totalTransactions: number;
    jobPaymentsCount: number;
    jobPaymentsTotal: number;
    subscriptionPaymentsCount: number;
    subscriptionPaymentsTotal: number;
}

class TransactionService {
    async getAll(): Promise<{ success: boolean; data?: { transactions: Transaction[] }; error?: string }> {
        return await apiClient.get('/api/companies/transactions');
    }

    async getStats(): Promise<{ success: boolean; data?: TransactionStats; error?: string }> {
        return await apiClient.get('/api/companies/transactions/stats');
    }
}

export const transactionService = new TransactionService();
