import { apiClient } from '@/shared/lib/apiClient';
import type { FinanceTimelineEntry, BeneficiaryStatus } from '@/shared/lib/admin/withdrawalService';

export interface FinanceOpsSummary {
    pendingRefundRequests: number;
    pendingCompanyWithdrawals: number;
    approvedCompanyWithdrawals: number;
    processingCompanyWithdrawals: number;
    pendingStaffWithdrawals: number;
    approvedStaffWithdrawals: number;
    processingStaffWithdrawals: number;
    negativeCompanyWallets: number;
    beneficiaryAttentionCompanies: number;
    beneficiaryAttentionStaff: number;
    failedCompanyWithdrawals: number;
    failedStaffWithdrawals: number;
    pendingOutboxEvents: number;
    retryingOutboxEvents: number;
    deadLetterOutboxEvents: number;
    processingOutboxEvents: number;
    ledgerDriftAccounts: number;
    highRiskItems: number;
}

export interface ReconciliationBillRow {
    id: string;
    billNumber: string;
    companyName: string;
    amount: number;
    currency: string;
    status: string;
    providerReference?: string | null;
    accountingReference?: string | null;
    createdAt: string;
    paidAt?: string | null;
    mismatchFlags: string[];
}

export interface ReconciliationRefundRow {
    id: string;
    companyName: string;
    amount: number;
    currency?: string | null;
    status: string;
    destination: 'WALLET_CREDIT' | 'ORIGINAL_METHOD';
    providerReference?: string | null;
    createdAt: string;
    timeline: FinanceTimelineEntry[];
}

export interface ReconciliationWithdrawalRow {
    id: string;
    companyName?: string;
    consultantName?: string;
    amount: number;
    currency?: string | null;
    status: string;
    providerReference?: string | null;
    providerTransferId?: string | null;
    accountingReference?: string | null;
    beneficiaryStatus: BeneficiaryStatus;
    createdAt: string;
    timeline: FinanceTimelineEntry[];
}

export interface ReconciliationOverview {
    bills: ReconciliationBillRow[];
    refunds: ReconciliationRefundRow[];
    companyWithdrawals: ReconciliationWithdrawalRow[];
    staffWithdrawals: ReconciliationWithdrawalRow[];
    ledgerChecks: Array<{
        accountId: string;
        ownerType: string;
        ownerId: string;
        ownerLabel: string;
        status: 'OK' | 'DRIFT';
        actualBalance: number;
        projectedBalance: number;
        delta: number;
        currency: string;
        updatedAt: string;
    }>;
    outbox: {
        summary: {
            pending: number;
            retrying: number;
            deadLetter: number;
            processing: number;
        };
        events: Array<{
            id: string;
            eventType: string;
            publishStatus: string;
            publishAttempts: number;
            lastPublishError?: string | null;
            ownerType?: string | null;
            ownerId?: string | null;
            ownerLabel: string;
            sourceType: string;
            sourceId: string;
            referenceType?: string | null;
            referenceId?: string | null;
            providerReference?: string | null;
            accountingReference?: string | null;
            occurredAt: string;
            publishedAt?: string | null;
        }>;
    };
    riskFlags: Array<{
        id: string;
        kind: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        title: string;
        description: string;
        entityId: string;
        entityLabel: string;
        createdAt: string;
        status: string;
    }>;
}

export interface ReconciliationRunResult {
    runAt: string;
    walletChecks: Array<{
        consultantId: string;
        walletBalance: number;
        expectedBalance: number;
        delta: number;
        status: 'OK' | 'MISMATCH';
    }>;
    transferChecks: Array<{
        withdrawalId: string;
        transferId: string;
        localStatus: string;
        providerStatus: string;
        status: 'OK' | 'STALE' | 'MISMATCH';
        hoursInProcessing?: number;
    }>;
    summary: {
        totalIssues: number;
        walletMismatches: number;
        staleTransfers: number;
    };
}

export interface OutboxDispatchResult {
    processedAt: string;
    processedCount: number;
    publishedCount: number;
    retryingCount: number;
    deadLetterCount: number;
    results: Array<{
        id: string;
        eventType: string;
        publishStatus: string;
        publishAttempts: number;
        error?: string | null;
    }>;
}

export const financeOpsService = {
    async getSummary(): Promise<FinanceOpsSummary> {
        const response = await apiClient.get<FinanceOpsSummary>('/api/hrm8/finance/ops-summary');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch finance ops summary');
        }
        return response.data;
    },

    async getReconciliationOverview(): Promise<ReconciliationOverview> {
        const response = await apiClient.get<ReconciliationOverview>('/api/hrm8/finance/reconciliation');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch reconciliation overview');
        }
        return response.data;
    },

    async runReconciliation(): Promise<ReconciliationRunResult> {
        const response = await apiClient.post<ReconciliationRunResult>('/api/hrm8/finance/reconciliation/run', {});
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to run reconciliation');
        }
        return response.data;
    },

    async runOutboxDispatch(): Promise<OutboxDispatchResult> {
        const response = await apiClient.post<OutboxDispatchResult>('/api/hrm8/finance/outbox/run', {});
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to run finance outbox dispatch');
        }
        return response.data;
    },

    async retryOutboxEvent(eventId: string): Promise<void> {
        const response = await apiClient.post(`/api/hrm8/finance/outbox/events/${eventId}/retry`, {});
        if (!response.success) {
            throw new Error(response.error || 'Failed to retry finance outbox event');
        }
    },

    async replayOutboxEvent(eventId: string): Promise<void> {
        const response = await apiClient.post(`/api/hrm8/finance/outbox/events/${eventId}/replay`, {});
        if (!response.success) {
            throw new Error(response.error || 'Failed to replay finance outbox event');
        }
    },

    async markOutboxEventDeadLetter(eventId: string, reason: string): Promise<void> {
        const response = await apiClient.post(`/api/hrm8/finance/outbox/events/${eventId}/dead-letter`, { reason });
        if (!response.success) {
            throw new Error(response.error || 'Failed to mark finance outbox event as dead letter');
        }
    },
};
