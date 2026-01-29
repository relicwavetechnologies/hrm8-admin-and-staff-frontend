/**
 * Wallet API Service
 * Client-side service for wallet API calls
 */

export interface WalletBalance {
    balance: number;
    totalCredits: number;
    totalDebits: number;
    status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    balance_after: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    created_at: string;
    metadata?: Record<string, any>;
}

export interface Subscription {
    id: string;
    name: string;
    plan_type: string;
    status: string;
    base_price: number;
    billing_cycle: 'MONTHLY' | 'ANNUAL';
    job_quota: number | null;
    jobs_used: number;
    prepaid_balance: number | null;
    renewal_date: string | null;
    created_at: string;
}

export interface WithdrawalRequest {
    amount: number;
    paymentMethod: string;
    paymentDetails: Record<string, any>;
    notes?: string;
}

export interface RefundRequest {
    transactionId: string;
    transactionType: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL' | 'ADDON_SERVICE';
    amount: number;
    reason: string;
}

export interface AddOnServiceRequest {
    serviceType: string;
    jobId?: string;
    amount: number;
    description: string;
}

class WalletService {
    private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    private baseUrl = `${this.apiUrl}/api/wallet`;

    // Wallet Balance & Account
    async getBalance(): Promise<WalletBalance> {
        const response = await fetch(`${this.baseUrl}/balance`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch wallet balance');
        }
        const data = await response.json();
        return data.data;
    }

    async getAccount() {
        const response = await fetch(`${this.baseUrl}/account`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch wallet account');
        const data = await response.json();
        return data.data;
    }

    async verifyIntegrity() {
        const response = await fetch(`${this.baseUrl}/verify`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to verify wallet integrity');
        const data = await response.json();
        return data.data;
    }

    // Transactions
    async getTransactions(params?: {
        limit?: number;
        offset?: number;
        type?: string;
        direction?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.type) queryParams.append('type', params.type);
        if (params?.direction) queryParams.append('direction', params.direction);
        if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
        if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());

        const response = await fetch(`${this.baseUrl}/transactions?${queryParams}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        return data.data;
    }

    // Subscriptions
    async getSubscriptions(): Promise<Subscription[]> {
        const response = await fetch(`${this.baseUrl}/subscriptions`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch subscriptions');
        }
        const data = await response.json();
        return data.data;
    }

    async getSubscription(subscriptionId: string) {
        const response = await fetch(`${this.baseUrl}/subscription/${subscriptionId}`);
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        return data.data;
    }

    async createSubscription(subscriptionData: {
        planType: string;
        name: string;
        basePrice: number;
        billingCycle: 'MONTHLY' | 'ANNUAL';
        jobQuota?: number;
        autoRenew?: boolean;
    }) {
        const response = await fetch(`${this.baseUrl}/subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
            const error = await response.json();
            const errorObj: any = new Error(error.message || 'Failed to create subscription');
            errorObj.response = { status: response.status };
            errorObj.errorCode = error.errorCode;
            throw errorObj;
        }

        return response.json();
    }

    async renewSubscription(subscriptionId: string) {
        const response = await fetch(`${this.baseUrl}/subscription/${subscriptionId}/renew`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to renew subscription');
        }
        return response.json();
    }

    async cancelSubscription(subscriptionId: string, reason?: string) {
        const response = await fetch(`${this.baseUrl}/subscription/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to cancel subscription');
        return response.json();
    }

    // Wallet Recharge
    async rechargeWallet(data: {
        amount: number;
        paymentMethod: string;
    }) {
        const response = await fetch(`${this.apiUrl}/api/integrations/stripe/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                amount: data.amount,
                description: `Wallet recharge - $${data.amount.toFixed(2)}`,
                metadata: {
                    type: 'wallet_recharge',
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            const errorObj: any = new Error(error.message || 'Failed to initiate recharge');
            errorObj.response = { status: response.status };
            errorObj.errorCode = error.errorCode;
            throw errorObj;
        }

        const result = await response.json();

        // Redirect to Stripe Checkout
        if (result.data?.url) {
            window.location.href = result.data.url;
        }

        return result;
    }

    // Add-on Services
    async purchaseAddOnService(request: AddOnServiceRequest) {
        const response = await fetch(`${this.baseUrl}/subscription/addon-service`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.error === 'INSUFFICIENT_BALANCE') {
                throw {
                    type: 'INSUFFICIENT_BALANCE',
                    message: error.message,
                    currentBalance: error.currentBalance,
                    requiredAmount: error.requiredAmount,
                    shortfall: error.shortfall,
                };
            }
            throw new Error(error.message || 'Failed to purchase add-on service');
        }
        return response.json();
    }

    // Consultant Earnings & Withdrawals
    async getEarnings() {
        const response = await fetch(`${this.baseUrl}/earnings`);
        if (!response.ok) throw new Error('Failed to fetch earnings');
        const data = await response.json();
        return data.data;
    }

    async requestWithdrawal(request: WithdrawalRequest) {
        const response = await fetch(`${this.baseUrl}/withdrawal/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request withdrawal');
        }
        return response.json();
    }

    async getWithdrawalHistory(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/withdrawal/history?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch withdrawal history');
        const data = await response.json();
        return data.data;
    }

    // Refunds
    async requestRefund(request: RefundRequest) {
        const response = await fetch(`${this.baseUrl}/refund/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to request refund');
        return response.json();
    }

    async getRefundHistory(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/refund/history?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch refund history');
        const data = await response.json();
        return data.data;
    }

    // Admin Operations
    async getPendingWithdrawals(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/admin/withdrawals/pending?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch pending withdrawals');
        const data = await response.json();
        return data.data;
    }

    async approveWithdrawal(withdrawalId: string, data: { paymentReference?: string; adminNotes?: string }) {
        const response = await fetch(`${this.baseUrl}/admin/withdrawals/${withdrawalId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to approve withdrawal');
        return response.json();
    }

    async rejectWithdrawal(withdrawalId: string, reason: string) {
        const response = await fetch(`${this.baseUrl}/admin/withdrawals/${withdrawalId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to reject withdrawal');
        return response.json();
    }

    async getPendingRefunds(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/admin/refunds/pending?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch pending refunds');
        const data = await response.json();
        return data.data;
    }

    async approveRefund(refundId: string, adminNotes?: string) {
        const response = await fetch(`${this.baseUrl}/admin/refunds/${refundId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNotes }),
        });
        if (!response.ok) throw new Error('Failed to approve refund');
        return response.json();
    }

    async rejectRefund(refundId: string, reason: string) {
        const response = await fetch(`${this.baseUrl}/admin/refunds/${refundId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to reject refund');
        return response.json();
    }

    async getWalletStats() {
        const response = await fetch(`${this.baseUrl}/admin/stats`);
        if (!response.ok) throw new Error('Failed to fetch wallet stats');
        const data = await response.json();
        return data.data;
    }
}

export const walletService = new WalletService();
