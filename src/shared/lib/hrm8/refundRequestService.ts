/**
 * HRM8 Refund Request Service (Frontend)
 * Admin API client for transaction refund requests
 */

import { apiClient } from '../api';

export interface RefundRequest {
    id: string;
    companyId: string;
    transactionId: string;
    transactionType: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL';
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    reason: string;
    processedBy?: string | null;
    processedAt?: string | null;
    paymentReference?: string | null;
    adminNotes?: string | null;
    rejectionReason?: string | null;
    rejectedAt?: string | null;
    rejectedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    transactionContext?: {
        title?: string;
        billNumber?: string;
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
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/approve`, { adminNotes });
    }

    async reject(id: string, rejectionReason: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/reject`, { rejectionReason });
    }

    async complete(id: string, paymentReference?: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/hrm8/refund-requests/${id}/complete`, { paymentReference });
    }
}

export const hrm8RefundRequestService = new Hrm8RefundRequestService();
