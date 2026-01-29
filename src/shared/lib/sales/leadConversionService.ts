/**
 * Lead Conversion Request Service (Frontend)
 * API calls for conversion request management
 */

import { apiClient } from '../api';

export interface ConversionRequest {
    id: string;
    leadId: string;
    consultantId: string;
    regionId: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CONVERTED' | 'CANCELLED';
    companyName: string;
    email: string;
    phone?: string;
    website?: string;
    country: string;
    city?: string;
    stateProvince?: string;
    agentNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    adminNotes?: string;
    declineReason?: string;
    convertedAt?: string;
    companyId?: string;
    createdAt: string;
    updatedAt: string;
}

export const leadConversionService = {
    /**
     * Submit a conversion request for a lead
     */
    async submitRequest(leadId: string, data: { agentNotes?: string; tempPassword?: string }): Promise<ConversionRequest> {
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

        return response.data.request;
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
