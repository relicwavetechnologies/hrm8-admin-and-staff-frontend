/**
 * Lead Conversion Admin Service (Frontend)
 * API calls for admin conversion request management
 */

import { apiClient } from '@/shared/lib/apiClient';
import { ConversionRequest } from '../leadConversionService';

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

    /**
     * Approve a conversion request (auto-converts lead)
     */
    async approve(id: string, adminNotes?: string): Promise<{ request: ConversionRequest; company: any; tempPassword?: string }> {
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
