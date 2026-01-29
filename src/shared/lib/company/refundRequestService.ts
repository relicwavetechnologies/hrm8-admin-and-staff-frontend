/**
 * Refund Request Service (Frontend)
 * API client for transaction refund requests
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
}

class RefundRequestService {
    async create(data: {
        transactionId: string;
        transactionType: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL';
        amount: number;
        reason: string;
    }): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.post('/api/companies/refund-requests', data);
    }

    async getAll(): Promise<{ success: boolean; data?: { refundRequests: RefundRequest[] }; error?: string }> {
        return await apiClient.get('/api/companies/refund-requests');
    }

    async cancel(id: string): Promise<{ success: boolean; error?: string }> {
        return await apiClient.delete(`/api/companies/refund-requests/${id}`);
    }

    async withdraw(id: string): Promise<{ success: boolean; data?: { refundRequest: RefundRequest }; error?: string }> {
        return await apiClient.put(`/api/companies/refund-requests/${id}/withdraw`, {});
    }
}

export const refundRequestService = new RefundRequestService();
