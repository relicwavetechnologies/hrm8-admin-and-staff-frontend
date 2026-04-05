
import { apiClient } from '@/shared/lib/apiClient';

export interface CareersSocial {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
}

export interface CareersContent {
    logoUrl?: string | null;
    bannerUrl?: string | null;
    about?: string | null;
    social?: CareersSocial | null;
    images?: string[] | null;
}

export interface CareersRequest {
    id: string;
    companyName: string;
    domain: string;
    type: 'NEW_PAGE' | 'SECTION_UPDATE';
    status: string;
    pending: CareersContent | null;
    current: CareersContent | null;
    submittedAt: string;
}

type CareersRequestApiShape = CareersRequest & {
    company_name?: string;
    submitted_at?: string;
    pending?: CareersContent & {
        logo_url?: string | null;
        banner_url?: string | null;
    } | null;
    current?: CareersContent & {
        logo_url?: string | null;
        banner_url?: string | null;
    } | null;
};

function normalizePendingContent(content?: CareersRequestApiShape['pending']): CareersContent | null {
    if (!content || typeof content !== 'object') return null;
    const normalized: CareersContent = {};

    if ('logoUrl' in content || 'logo_url' in content) {
        normalized.logoUrl = content.logoUrl ?? content.logo_url ?? null;
    }
    if ('bannerUrl' in content || 'banner_url' in content) {
        normalized.bannerUrl = content.bannerUrl ?? content.banner_url ?? null;
    }
    if ('about' in content) {
        normalized.about = typeof content.about === 'string' ? content.about : null;
    }
    if ('social' in content) {
        normalized.social = content.social ?? null;
    }
    if ('images' in content) {
        normalized.images = Array.isArray(content.images) ? content.images : null;
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizeCurrentContent(content?: CareersRequestApiShape['current']): CareersContent | null {
    if (!content || typeof content !== 'object') return null;
    const normalized: CareersContent = {
        logoUrl: content.logoUrl ?? content.logo_url ?? null,
        bannerUrl: content.bannerUrl ?? content.banner_url ?? null,
        about: typeof content.about === 'string' ? content.about : null,
        social: content.social ?? null,
        images: Array.isArray(content.images) ? content.images : null,
    };

    const hasContent = Boolean(
        normalized.logoUrl ||
        normalized.bannerUrl ||
        normalized.about ||
        (normalized.social && Object.keys(normalized.social).length > 0) ||
        (normalized.images && normalized.images.length > 0)
    );
    return hasContent ? normalized : null;
}

function normalizeRequest(request: CareersRequestApiShape): CareersRequest {
    return {
        id: request.id,
        companyName: request.companyName || request.company_name || 'Unknown Company',
        domain: request.domain,
        type: request.type,
        status: request.status,
        pending: normalizePendingContent(request.pending),
        current: normalizeCurrentContent(request.current),
        submittedAt: request.submittedAt || request.submitted_at || new Date().toISOString(),
    };
}

export const careersRequestService = {
    getRequests: async (): Promise<{ requests: CareersRequest[]; total: number }> => {
        const response = await apiClient.get<any>('/api/hrm8/careers/requests');
        if (response.success && response.data && Array.isArray(response.data.requests)) {
            const requests = response.data.requests.map(normalizeRequest);
            return { requests, total: response.data.total || requests.length };
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
