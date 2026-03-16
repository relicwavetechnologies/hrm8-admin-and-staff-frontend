/**
 * Document Hub API Service
 * Handles all document-hub related API calls
 */

import { apiClient } from './api';

export interface CompanyDocument {
    id: string;
    name: string;
    description?: string;
    category: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    uploadedBy?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export const DOCUMENT_CATEGORIES = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'NDA', label: 'NDA' },
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'POLICY', label: 'Policy' },
    { value: 'ONBOARDING', label: 'Onboarding' },
    { value: 'COMPLIANCE', label: 'Compliance' },
    { value: 'OTHER', label: 'Other' },
];

class DocumentHubService {
    async getDocuments(params?: { search?: string; category?: string; limit?: number; offset?: number }) {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.category && params.category !== 'ALL') query.append('category', params.category);
        if (params?.limit) query.append('limit', String(params.limit));
        if (params?.offset) query.append('offset', String(params.offset));
        const qs = query.toString();
        return apiClient.get<{ documents: CompanyDocument[]; total: number; limit: number; offset: number }>(
            `/api/document-hub${qs ? `?${qs}` : ''}`
        );
    }

    async uploadDocument(file: File, metadata?: { name?: string; description?: string; category?: string; tags?: string }) {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata?.name) formData.append('name', metadata.name);
        if (metadata?.description) formData.append('description', metadata.description);
        if (metadata?.category) formData.append('category', metadata.category);
        if (metadata?.tags) formData.append('tags', metadata.tags);
        return apiClient.upload<{ document: CompanyDocument }>('/api/document-hub', formData);
    }

    async deleteDocument(id: string) {
        return apiClient.delete<{ message: string }>(`/api/document-hub/${id}`);
    }
}

export const documentHubService = new DocumentHubService();
