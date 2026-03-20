import { apiClient } from '../api';

export interface ProspectSearchResult {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photo?: string;
    linkedInUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    hasApplied: boolean;
    isProspected: boolean;
    matchScore?: number;
    matchReasons?: string[];
    workExperience?: Array<{ company?: string; role?: string; startDate?: string; endDate?: string }>;
}

export interface Prospect {
    id: string;
    jobId: string;
    candidateId?: string;
    ownerConsultantId: string;
    stage: string;
    sourceType: string;
    sourceSystem: string;
    email?: string;
    linkedInUrl?: string;
    sourceProfileUrl?: string;
    matchScore?: number;
    matchSummary?: string;
    tags: string[];
    notes?: string;
    lastContactedAt?: string;
    nextFollowUpAt?: string;
    followUpCount: number;
    createdAt: string;
    updatedAt: string;
    candidate?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        photo?: string;
        linkedInUrl?: string;
        city?: string;
        state?: string;
        country?: string;
    } | null;
}

export const executiveSearchService = {
    prospectSearch: async (
        jobId: string,
        params?: { search?: string; limit?: number; offset?: number; excludeApplied?: boolean; excludeProspected?: boolean }
    ): Promise<{ success: boolean; data?: { candidates: ProspectSearchResult[]; total: number; limit: number; offset: number }; error?: string }> => {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.limit) q.set('limit', String(params.limit));
        if (params?.offset) q.set('offset', String(params.offset));
        if (params?.excludeApplied) q.set('excludeApplied', 'true');
        if (params?.excludeProspected) q.set('excludeProspected', 'true');
        const suffix = q.toString() ? `?${q}` : '';
        const res = await apiClient.post<{ candidates: ProspectSearchResult[]; total: number; limit: number; offset: number }>(
            `/api/consultant/jobs/${jobId}/prospect-search${suffix}`,
            {}
        );
        return res;
    },

    listProspects: async (jobId: string): Promise<{ success: boolean; data?: { prospects: Prospect[] }; error?: string }> => {
        const res = await apiClient.get<{ prospects: Prospect[] }>(`/api/consultant/jobs/${jobId}/prospects`);
        return res;
    },

    importExisting: async (jobId: string, candidateId: string): Promise<{ success: boolean; data?: Prospect; error?: string }> => {
        const res = await apiClient.post<Prospect>(`/api/consultant/jobs/${jobId}/prospects/import-existing`, { candidateId });
        return res;
    },

    importExternal: async (
        jobId: string,
        data: {
            email: string;
            firstName?: string;
            lastName?: string;
            linkedInUrl?: string;
            sourceSystem?: string;
            sourceProfileUrl?: string;
            metadata?: Record<string, unknown>;
        }
    ): Promise<{ success: boolean; data?: Prospect; error?: string }> => {
        const res = await apiClient.post<Prospect>(`/api/consultant/jobs/${jobId}/prospects/import-external`, data);
        return res;
    },

    updateProspect: async (
        jobId: string,
        prospectId: string,
        data: { stage?: string; notes?: string; tags?: string[] }
    ): Promise<{ success: boolean; data?: Prospect; error?: string }> => {
        const res = await apiClient.patch<Prospect>(`/api/consultant/jobs/${jobId}/prospects/${prospectId}`, data);
        return res;
    },

    sendInvite: async (
        jobId: string,
        prospectId: string,
        options?: { customMessage?: string }
    ): Promise<{ success: boolean; data?: { invitationId: string; message: string }; error?: string }> => {
        const res = await apiClient.post<{ invitationId: string; message: string }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/send-invite`,
            options || {}
        );
        return res;
    },

    convertToApplication: async (
        jobId: string,
        prospectId: string
    ): Promise<{ success: boolean; data?: { applicationId: string; created: boolean }; error?: string }> => {
        const res = await apiClient.post<{ applicationId: string; created: boolean }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/convert-to-application`,
            {}
        );
        return res;
    },
};
