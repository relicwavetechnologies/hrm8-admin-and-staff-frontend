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
    availableCommissions: Array<{
        id: string;
        amount: number;
        type: 'PLACEMENT' | 'SUBSCRIPTION_SALE' | 'RECRUITMENT_SERVICE' | 'CUSTOM';
        description: string;
        createdAt: string;
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
        const response = await apiClient.post<{ lead: Lead; qualification?: any }>('/api/consultant360/leads', data);
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
     * Start Stripe Connect onboarding
     */
    async stripeOnboard(): Promise<{
        success: boolean;
        data?: { accountLink: { url: string } };
        error?: string;
    }> {
        const response = await apiClient.post<{ accountLink: { url: string } }>('/api/consultant360/stripe/onboard');
        return response;
    },

    /**
     * Get Stripe account status
     */
    async getStripeStatus(): Promise<{
        success: boolean;
        data?: StripeAccountStatus;
        error?: string;
    }> {
        const response = await apiClient.get<StripeAccountStatus>('/api/consultant360/stripe/status');
        return response;
    },

    /**
     * Get Stripe dashboard login link
     */
    async getStripeLoginLink(): Promise<{
        success: boolean;
        data?: { url: string };
        error?: string;
    }> {
        const response = await apiClient.post<{ url: string }>('/api/consultant360/stripe/login-link');
        return response;
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
