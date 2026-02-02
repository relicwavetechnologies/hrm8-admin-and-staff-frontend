
import { apiClient } from '@/shared/lib/apiClient';

export interface CareersRequest {
    id: string;
    companyName: string;
    domain: string;
    type: 'NEW_PAGE' | 'SECTION_UPDATE';
    status: string;
    pending: {
        logoUrl?: string;
        bannerUrl?: string;
        about?: string;
        social?: {
            linkedin?: string;
            twitter?: string;
            facebook?: string;
            instagram?: string;
        };
    };
    current: {
        logoUrl?: string;
        bannerUrl?: string;
        about?: string;
        social?: any;
    } | null;
    submittedAt: string;
}

export const careersRequestService = {
    getRequests: async (): Promise<{ requests: CareersRequest[]; total: number }> => {
        const response = await apiClient.get<any>('/api/hrm8/careers/requests');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch careers requests');
    },

    approve: async (id: string, section?: string): Promise<any> => {
        const response = await apiClient.post<any>(`/api/hrm8/careers/${id}/approve`, { section });
        if (!response.success) {
            throw new Error(response.error || 'Failed to approve request');
        }
        return response.data;
    },

    reject: async (id: string, reason: string): Promise<any> => {
        const response = await apiClient.post<any>(`/api/hrm8/careers/${id}/reject`, { reason });
        if (!response.success) {
            throw new Error(response.error || 'Failed to reject request');
        }
        return response.data;
    }
};
