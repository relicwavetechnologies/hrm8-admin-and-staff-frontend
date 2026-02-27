/**
 * Lead Conversion Admin Service (Frontend)
 * API calls for admin conversion request management
 */

import { apiClient } from '@/shared/lib/apiClient';
import { ConversionRequest } from '../leadConversionService';

export interface ConversionReviewContext {
    request: {
        id: string;
        status: string;
        company_name: string;
        email: string;
        phone?: string | null;
        website?: string | null;
        country?: string;
        city?: string | null;
        region_id?: string;
        created_at?: string;
        reviewed_at?: string | null;
        converted_at?: string | null;
        agent_notes?: string | null;
        intent_snapshot?: Record<string, unknown> | null;
    };
    leadMilestones?: {
        lead_created_at?: string | null;
        lead_confirmed_at?: string | null;
        lead_status?: string | null;
        lead_source?: string | null;
    };
    conversionMilestones?: {
        request_submitted_at?: string | null;
        reviewed_at?: string | null;
        converted_at?: string | null;
    };
    firstJobEvidence?: {
        job_id?: string;
        posted_at?: string | null;
        setup_type?: string | null;
        management_type?: string | null;
        service_package?: string | null;
        hiring_mode?: string | null;
        payment_status?: string | null;
    } | null;
    subscriptionAtFirstJob?: {
        subscription_id?: string;
        plan_type?: string;
        name?: string;
        base_price?: number;
        currency?: string | null;
        billing_cycle?: string;
        created_at?: string;
        matchStrategy?: string;
    } | null;
    firstPaymentEvidence?: {
        source?: string;
        amount?: number;
        currency?: string | null;
        paid_at?: string;
        reference_id?: string | null;
    } | null;
    commissionReadiness?: {
        eligible?: boolean;
        reason?: string;
        existing_commission_id?: string;
        existing_commission_status?: string;
    };
    dataCompleteness?: {
        preApprovalComplete?: boolean;
        postPaymentAvailable?: boolean;
    };
    companyContext?: {
        id?: string;
        name?: string;
        website?: string | null;
        billing_currency?: string | null;
        pricing_peg?: string | null;
        created_at?: string | null;
    } | null;
}

export const leadConversionAdminService = {
    /**
     * Get all conversion requests (with regional filtering)
     */
    async getAll(status?: string): Promise<ConversionRequest[]> {
        const endpoint = status
            ? `/api/hrm8/conversion-requests?status=${status}`
            : '/api/hrm8/conversion-requests';
        const response = await apiClient.get<any>(endpoint);

        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch conversion requests');
        }

        return response.data.requests;
    },

    /**
     * Get a single conversion request
     */
    async getOne(id: string): Promise<ConversionRequest> {
        const response = await apiClient.get<any>(`/api/hrm8/conversion-requests/${id}`);

        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch conversion request');
        }

        return response.data.request;
    },

    async getReviewContext(id: string): Promise<ConversionReviewContext> {
        const response = await apiClient.get<any>(`/api/hrm8/conversion-requests/${id}/review-context`);

        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch conversion review context');
        }

        return response.data.context;
    },

    /**
     * Approve a conversion request (auto-converts lead)
     */
    async approve(id: string, adminNotes?: string): Promise<{ request: ConversionRequest; company: any; inviteSent?: boolean }> {
        const response = await apiClient.put<any>(`/api/hrm8/conversion-requests/${id}/approve`, { adminNotes });

        if (!response.success) {
            throw new Error(response.error || 'Failed to approve conversion request');
        }

        return response.data;
    },

    /**
     * Decline a conversion request
     */
    async decline(id: string, declineReason: string): Promise<ConversionRequest> {
        const response = await apiClient.put<any>(`/api/hrm8/conversion-requests/${id}/decline`, { declineReason });

        if (!response.success) {
            throw new Error(response.error || 'Failed to decline conversion request');
        }

        return response.data.request;
    },
};
