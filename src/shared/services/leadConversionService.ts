/**
 * Lead Conversion Request Service (Frontend)
 * API calls for conversion request management
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface ConversionIntentSnapshot {
    intendedSetupType?: 'SIMPLE' | 'ADVANCED';
    intendedServicePackage?: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
    expectedSubscriptionPlan?: 'PAYG' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | 'RPO';
    expectedFirstPaymentAmount?: number;
    expectedCurrency?: string;
    snapshotVersion?: string;
    capturedAt?: string;
}

export interface LifecycleMilestones {
    lead_created_at?: string | null;
    lead_confirmed_at?: string | null;
    lead_status?: string | null;
    request_submitted_at?: string | null;
    reviewed_at?: string | null;
    converted_at?: string | null;
}

export interface FirstJobEvidence {
    job_id: string;
    posted_at: string | null;
    setup_type: string | null;
    management_type: string | null;
    service_package: string | null;
    hiring_mode: string | null;
    payment_status: string | null;
}

export interface CommercialEvidence {
    subscription_id: string;
    plan_type: string;
    name: string;
    base_price: number;
    currency: string;
    billing_cycle: string;
    created_at: string;
    matchStrategy: 'before_or_equal' | 'after_fallback';
}

export interface FirstPaymentEvidence {
    source: 'SUBSCRIPTION_BILL' | 'MANAGED_WALLET';
    amount: number;
    currency: string | null;
    paid_at: string;
    reference_id: string | null;
}

export interface ConversionCommissionReadiness {
    eligible: boolean;
    reason: string;
    existing_commission_id?: string;
    existing_commission_status?: string;
}

export interface ConversionReviewContext {
    request: ConversionRequest;
    leadMilestones: {
        lead_created_at?: string | null;
        lead_confirmed_at?: string | null;
        lead_status?: string | null;
        lead_source?: string | null;
    };
    conversionMilestones: {
        request_submitted_at?: string | null;
        reviewed_at?: string | null;
        converted_at?: string | null;
    };
    firstJobEvidence: FirstJobEvidence | null;
    subscriptionAtFirstJob: CommercialEvidence | null;
    firstPaymentEvidence: FirstPaymentEvidence | null;
    commissionReadiness: ConversionCommissionReadiness;
    dataCompleteness: {
        preApprovalComplete: boolean;
        postPaymentAvailable: boolean;
    };
    companyContext?: {
        id: string;
        name: string;
        website?: string;
        billing_currency?: string | null;
        pricing_peg?: string | null;
        created_at?: string | null;
    } | null;
}

export interface ConversionRequest {
    id: string;
    lead_id: string;
    consultant_id: string;
    region_id: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CONVERTED' | 'CANCELLED';
    company_name: string;
    email: string;
    phone?: string;
    website?: string;
    country: string;
    city?: string;
    state_province?: string;
    agent_notes?: string;
    intent_snapshot?: ConversionIntentSnapshot | null;
    reviewed_by?: string;
    reviewed_at?: string;
    admin_notes?: string;
    decline_reason?: string;
    converted_at?: string;
    company_id?: string;
    lead_confirmed_at?: string | null;
    has_company?: boolean;
    has_first_payment?: boolean;
    created_at: string;
    updated_at: string;
}

export const leadConversionService = {
    /**
     * Submit a conversion request for a lead
     */
    async submitRequest(leadId: string, data: {
        agentNotes?: string;
        tempPassword?: string;
        intentSnapshot?: ConversionIntentSnapshot;
    }): Promise<ConversionRequest> {
        const response = await apiClient.post<any>(`/api/sales/leads/${leadId}/conversion-request`, data);

        if (!response.success) {
            throw new Error(response.error || 'Failed to submit conversion request');
        }

        const responseData = response.data;
        // response.data contains the payload { request: ... }
        if (!responseData || !responseData.request) {
            throw new Error('Invalid response from server');
        }

        return responseData.request;
    },

    /**
     * Get all conversion requests for the authenticated consultant
     */
    async getMyRequests(status?: string): Promise<ConversionRequest[]> {
        const endpoint = status ? `/api/sales/conversion-requests?status=${status}` : '/api/sales/conversion-requests';
        const response = await apiClient.get<any>(endpoint);

        if (!response.success) {
            throw new Error(response.error || 'Failed to get conversion requests');
        }

        return response.data.requests;
    },

    /**
     * Get a single conversion request
     */
    async getRequest(id: string): Promise<ConversionRequest> {
        const response = await apiClient.get<any>(`/api/sales/conversion-requests/${id}`);

        if (!response.success) {
            throw new Error(response.error || 'Failed to get conversion request');
        }

        return response.data.request || response.data;
    },

    /**
     * Cancel a pending conversion request
     */
    async cancelRequest(id: string): Promise<ConversionRequest> {
        const response = await apiClient.put<any>(`/api/sales/conversion-requests/${id}/cancel`);

        if (!response.success) {
            throw new Error(response.error || 'Failed to cancel conversion request');
        }

        return response.data.request;
    },
};
