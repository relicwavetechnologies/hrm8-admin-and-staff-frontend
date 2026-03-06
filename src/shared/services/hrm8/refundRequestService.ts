/**
 * HRM8 Refund Request Service (Frontend)
 * Admin API client for transaction refund requests
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface RefundRequest {
    id: string;
    company_id: string;
    transaction_id: string;
    transaction_type: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL';
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    reason: string;
    processed_by?: string | null;
    processed_at?: string | null;
    payment_reference?: string | null;
    admin_notes?: string | null;
    rejection_reason?: string | null;
    rejected_at?: string | null;
    rejected_by?: string | null;
    created_at: string;
    updated_at: string;
    transaction_context?: {
        title?: string;
        bill_number?: string;
        date: string;
    };
}

class Hrm8RefundRequestService {
    async getAll(filters?: { status?: string }): Promise<{ success: boolean; data?: { refundRequests: RefundRequest[] }; error?: string }> {
        const params = new URLSearchParams();
        if (filters?.status) {
            params.append('status', filters.status);
        }

        const queryString = params.toString();
        const url = `/api/hrm8/refund-requests${queryString ? `?${queryString}` : ''}`;

        return await apiClient.get(url);
    }

    async approve(id: string, adminNotes?: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/approve`, { admin_notes: adminNotes });
    }

    async reject(id: string, rejectionReason: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/reject`, { rejection_reason: rejectionReason });
    }

    async complete(id: string, paymentReference?: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/complete`, { payment_reference: paymentReference });
    }
}

export const hrm8RefundRequestService = new Hrm8RefundRequestService();
