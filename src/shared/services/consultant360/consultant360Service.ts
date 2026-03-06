/**
 * Consultant 360 API Service
 * Handles all API calls for Consultant 360 unified dashboard
 */

import { apiClient } from '@/shared/lib/apiClient';
import { Lead } from '@/shared/services/salesService';

// ==================== Types ====================

export interface UnifiedDashboardStats {
    totalEarnings: number;
    availableBalance: number;
    pendingBalance: number;
    activeJobs: number;
    activeLeads: number;
    conversionRate: number;
    totalPlacements: number;
    totalSubscriptionSales: number;
    recruiterEarnings: number;
    salesEarnings: number;
}

export interface ActiveJob {
    id: string;
    title: string;
    companyName: string;
    status: string;
    location: string;
    assignedAt: string;
}

export interface ActiveLead {
    id: string;
    companyName: string;
    contactEmail: string;
    status: string;
    source: string;
    createdAt: string;
}

export interface MonthlyTrendItem {
    month: string;
    year: number;
    recruiterEarnings: number;
    salesEarnings: number;
    total: number;
}

export interface Commission {
    id: string;
    consultantId: string;
    regionId: string;
    jobId?: string;
    type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
    amount: number;
    rate?: number;
    description?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
    confirmedAt?: string;
    paidAt?: string;
    paymentReference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecruiterEarnings {
    totalPlacements: number;
    totalRevenue: number;
    pendingCommissions: number;
    confirmedCommissions: number;
    paidCommissions: number;
    commissions: Commission[];
}

export interface SalesEarnings {
    totalSubscriptionSales: number;
    totalServiceFees: number;
    pendingCommissions: number;
    confirmedCommissions: number;
    paidCommissions: number;
    commissions: Commission[];
}

export interface CombinedBalance {
    totalEarned: number;
    availableBalance: number;
    pendingBalance: number;
    totalWithdrawn: number;
    /** Staff's single currency - all amounts in this currency */
    currency?: string;
    availableCommissions: Array<{
        id: string;
        amount: number;
        type?: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
        description: string;
        createdAt?: string;
        date?: string;
    }>;
}

export interface UnifiedEarnings {
    recruiterEarnings: RecruiterEarnings;
    salesEarnings: SalesEarnings;
    combined: CombinedBalance;
    recentCommissions: Commission[];
    monthlyTrend: MonthlyTrendItem[];
}

export interface DashboardData {
    stats: UnifiedDashboardStats;
    activeJobs: ActiveJob[];
    activeLeads: ActiveLead[];
    recentCommissions: Commission[];
    monthlyTrend: MonthlyTrendItem[];
}

export interface Withdrawal {
    id: string;
    consultantId: string;
    amount: number;
    /** Payout currency - staff receives in this currency */
    payoutCurrency?: string;
    payoutAmount?: number;
    status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
    paymentMethod: string;
    paymentDetails?: Record<string, unknown>;
    commissionIds: string[];
    processedBy?: string;
    processedAt?: string;
    paymentReference?: string;
    adminNotes?: string;
    rejectionReason?: string;
    rejectedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawalRequest {
    amount: number;
    paymentMethod: string;
    paymentDetails?: Record<string, unknown>;
    commissionIds: string[];
    notes?: string;
}

export interface StripeAccountStatus {
    hasAccount: boolean;
    accountId?: string;
    payoutsEnabled: boolean;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    requiresAction: boolean;
}

/** Provider-neutral alias for StripeAccountStatus */
export type PayoutAccountStatus = StripeAccountStatus;

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderType: 'USER' | 'CANDIDATE' | 'CONSULTANT';
    content: string;
    contentType: 'TEXT' | 'IMAGE' | 'FILE';
    metadata?: Record<string, unknown>;
    readAt?: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    candidateId: string;
    candidateName: string;
    candidateAvatar?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    jobTitle?: string;
    jobId?: string;
    updatedAt: string;
}

// ==================== API Functions ====================

export const consultant360Service = {
    /**
     * Get unified dashboard data
     */
    async getDashboard(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
        const response = await apiClient.get<DashboardData>('/api/consultant360/dashboard');
        return response;
    },

    /**
     * Get Leads
     */
    async getLeads(): Promise<{ success: boolean; data?: { leads: Lead[] }; error?: string }> {
        const response = await apiClient.get<{ leads: Lead[] }>('/api/consultant360/leads');
        return response;
    },

    /**
     * Create Lead
     */
    async createLead(data: any): Promise<{ success: boolean; data?: { lead: Lead; qualification?: any }; error?: string }> {
        const payload = {
            company_name: data.companyName ?? data.company_name,
            email: data.email,
            website: data.website,
            phone: data.phone,
            budget: data.budget,
            timeline: data.timeline,
            message: data.message,
        };
        const response = await apiClient.post<{ lead: Lead; qualification?: any }>('/api/consultant360/leads', payload);
        return response;
    },

    /**
     * Submit Conversion Request
     */
    async submitConversionRequest(leadId: string, data: any): Promise<any> {
        const response = await apiClient.post<any>(`/api/consultant360/leads/${leadId}/conversion-request`, data);
        if (!response.success) {
            throw new Error(response.error || 'Failed to submit conversion request');
        }
        return response.data?.request;
    },

    /**
     * Get unified earnings breakdown
     */
    async getEarnings(): Promise<{ success: boolean; data?: UnifiedEarnings; error?: string }> {
        const response = await apiClient.get<UnifiedEarnings>('/api/consultant360/earnings');
        return response;
    },

    /**
     * Request a new commission (creates PENDING - admin must approve to credit wallet)
     */
    async requestCommission(data: {
        type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
        amount?: number;
        jobId?: string;
        subscriptionId?: string;
        description?: string;
        calculateFromJob?: boolean;
        rate?: number;
    }): Promise<{ success: boolean; data?: { commission: Commission }; error?: string }> {
        const response = await apiClient.post<{ commission: Commission }>(
            '/api/consultant360/commissions/request',
            data
        );
        return response;
    },

    /**
     * Get commissions with optional filters
     */
    async getCommissions(filters?: {
        type?: 'RECRUITER' | 'SALES' | 'ALL';
        status?: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
        limit?: number;
        offset?: number;
    }): Promise<{
        success: boolean;
        data?: { commissions: Commission[]; total: number };
        error?: string;
    }> {
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `/api/consultant360/commissions${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<{ commissions: Commission[]; total: number }>(url);
        return response;
    },

    /**
     * Get unified withdrawal balance
     */
    async getBalance(): Promise<{ success: boolean; data?: { balance: CombinedBalance }; error?: string }> {
        const response = await apiClient.get<{ balance: CombinedBalance }>('/api/consultant360/balance');
        return response;
    },

    /**
     * Request withdrawal
     */
    async requestWithdrawal(data: WithdrawalRequest): Promise<{
        success: boolean;
        data?: { withdrawal: Withdrawal };
        error?: string;
    }> {
        const response = await apiClient.post<{ withdrawal: Withdrawal }>('/api/consultant360/withdraw', data);
        return response;
    },

    /**
     * Get withdrawal history
     */
    async getWithdrawals(status?: string): Promise<{
        success: boolean;
        data?: { withdrawals: Withdrawal[] };
        error?: string;
    }> {
        const url = status
            ? `/api/consultant360/withdrawals?status=${status}`
            : '/api/consultant360/withdrawals';
        const response = await apiClient.get<{ withdrawals: Withdrawal[] }>(url);
        return response;
    },

    /**
     * Cancel a pending withdrawal
     */
    async cancelWithdrawal(id: string): Promise<{ success: boolean; error?: string }> {
        const response = await apiClient.post(`/api/consultant360/withdrawals/${id}/cancel`);
        return response;
    },

    /**
     * Execute withdrawal (Stripe payout)
     */
    async executeWithdrawal(id: string): Promise<{
        success: boolean;
        data?: { transfer: unknown };
        error?: string;
    }> {
        const response = await apiClient.post<{ transfer: unknown }>(`/api/consultant360/withdrawals/${id}/execute`);
        return response;
    },

    /**
     * Start payout provider onboarding
     */
    async onboardPayoutProvider(): Promise<{
        success: boolean;
        data?: { accountLink: { url: string } };
        error?: string;
    }> {
        const response = await apiClient.post<{ accountLink: { url: string } }>('/api/payouts/beneficiaries');
        return response;
    },

    /**
     * @deprecated Use onboardPayoutProvider instead
     */
    async stripeOnboard(): Promise<{
        success: boolean;
        data?: { accountLink: { url: string } };
        error?: string;
    }> {
        return this.onboardPayoutProvider();
    },

    /**
     * Get payout account status
     */
    async getPayoutStatus(): Promise<{
        success: boolean;
        data?: StripeAccountStatus;
        error?: string;
    }> {
        const response = await apiClient.get<StripeAccountStatus>('/api/payouts/status');
        return response;
    },

    /**
     * @deprecated Use getPayoutStatus instead
     */
    async getStripeStatus(): Promise<{
        success: boolean;
        data?: StripeAccountStatus;
        error?: string;
    }> {
        return this.getPayoutStatus();
    },

    /**
     * Get payout provider dashboard link
     */
    async getPayoutDashboardLink(): Promise<{
        success: boolean;
        data?: { url: string };
        error?: string;
    }> {
        const response = await apiClient.post<{ url: string }>('/api/payouts/login-link');
        return response;
    },

    /**
     * @deprecated Use getPayoutDashboardLink instead
     */
    async getStripeLoginLink(): Promise<{
        success: boolean;
        data?: { url: string };
        error?: string;
    }> {
        return this.getPayoutDashboardLink();
    },

    /**
     * Get conversations list
     */
    async getConversations(): Promise<{
        success: boolean;
        data?: { conversations: Conversation[] };
        error?: string;
    }> {
        const response = await apiClient.get<{ conversations: Conversation[] }>('/api/consultant/conversations');
        return response;
    },

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string): Promise<{
        success: boolean;
        data?: { messages: Message[] };
        error?: string;
    }> {
        const response = await apiClient.get<{ messages: Message[] }>(`/api/consultant/conversations/${conversationId}/messages`);
        return response;
    },

    /**
     * Send a message
     */
    async sendMessage(conversationId: string, content: string, contentType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): Promise<{
        success: boolean;
        data?: { message: Message };
        error?: string;
    }> {
        const response = await apiClient.post<{ message: Message }>(`/api/consultant/conversations/${conversationId}/messages`, {
            content,
            contentType
        });
        return response;
    },

    /**
     * Mark messages as read
     */
    async markAsRead(conversationId: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        const response = await apiClient.patch(`/api/consultant/conversations/${conversationId}/read`);
        return response;
    },
};
