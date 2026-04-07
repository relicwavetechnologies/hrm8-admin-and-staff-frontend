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
    gaps?: string[];
    workExperience?: Array<{ company?: string; role?: string; startDate?: string; endDate?: string }>;
}

export interface Prospect {
    id: string;
    jobId: string;
    candidateId?: string;
    ownerConsultantId: string;
    stage: string;
    sequencePaused?: boolean;
    hasActiveSequence?: boolean;
    sourceType: string;
    sourceSystem: string;
    email?: string;
    linkedInUrl?: string;
    sourceProfileUrl?: string;
    externalDisplayName?: string;
    externalProfile?: {
        displayName?: string;
        firstName?: string;
        lastName?: string;
        headline?: string;
        location?: string;
        profileUrl?: string;
        profileImageUrl?: string;
    } | null;
    contact?: {
        displayEmail?: string;
        emailSource?: 'LINKEDIN_PUBLIC' | 'HUNTER' | 'MANUAL' | 'EXTENSION_IMPORT' | 'UNKNOWN';
        verificationState?: 'MISSING' | 'PENDING_VERIFY' | 'LOOKUP_PENDING' | 'VERIFIED' | 'MANUAL_REVIEW';
    } | null;
    workflow?: {
        status?: 'IMPORTED' | 'PUBLIC_EMAIL_PENDING_VERIFY' | 'CONTACT_LOOKUP_PENDING' | 'OUTREACH_READY' | 'MANUAL_REVIEW';
    } | null;
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
        params?: {
            search?: string;
            limit?: number;
            offset?: number;
            excludeApplied?: boolean;
            excludeProspected?: boolean;
            useSemanticRerank?: boolean;
            savedSearchId?: string;
        }
    ): Promise<{ success: boolean; data?: { candidates: ProspectSearchResult[]; total: number; limit: number; offset: number }; error?: string }> => {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.limit) q.set('limit', String(params.limit));
        if (params?.offset) q.set('offset', String(params.offset));
        if (params?.excludeApplied) q.set('excludeApplied', 'true');
        if (params?.excludeProspected) q.set('excludeProspected', 'true');
        if (params?.useSemanticRerank) q.set('useSemanticRerank', 'true');
        if (params?.savedSearchId) q.set('savedSearchId', params.savedSearchId);
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
        data: { stage?: string; notes?: string; tags?: string[]; email?: string }
    ): Promise<{ success: boolean; data?: Prospect; error?: string }> => {
        const res = await apiClient.patch<Prospect>(`/api/consultant/jobs/${jobId}/prospects/${prospectId}`, data);
        return res;
    },

    enrichProspect: async (
        jobId: string,
        prospectId: string
    ): Promise<{ success: boolean; data?: { found: boolean; email?: string; phone?: string; message: string }; error?: string }> => {
        const res = await apiClient.post<{ found: boolean; email?: string; phone?: string; message: string }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/enrich`,
            {}
        );
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

    getProspectMatchScore: async (
        jobId: string,
        prospectId: string
    ): Promise<{
        success: boolean;
        data?: { matchScore: number; matchReasons: string[]; gaps: string[]; message?: string };
        error?: string;
    }> => {
        const res = await apiClient.get<{ matchScore: number; matchReasons: string[]; gaps: string[]; message?: string }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/match-score`
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

    // Sequence templates & enrollment
    listSequenceTemplates: async (
        jobId: string
    ): Promise<{ success: boolean; data?: { templates: SequenceTemplate[] }; error?: string }> => {
        const res = await apiClient.get<{ templates: SequenceTemplate[] }>(
            `/api/consultant/jobs/${jobId}/sequence-templates`
        );
        return res;
    },

    createSequenceTemplate: async (
        jobId: string,
        data: { name: string; steps: SequenceStep[] }
    ): Promise<{ success: boolean; data?: SequenceTemplate; error?: string }> => {
        const res = await apiClient.post<SequenceTemplate>(
            `/api/consultant/jobs/${jobId}/sequence-templates`,
            data
        );
        return res;
    },

    enrollInSequence: async (
        jobId: string,
        prospectId: string,
        templateId: string
    ): Promise<{ success: boolean; data?: { enrollmentId: string; message: string }; error?: string }> => {
        const res = await apiClient.post<{ enrollmentId: string; message: string }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/sequence/enroll`,
            { templateId }
        );
        return res;
    },

    pauseSequence: async (
        jobId: string,
        prospectId: string
    ): Promise<{ success: boolean; data?: { message: string }; error?: string }> => {
        const res = await apiClient.post<{ message: string }>(
            `/api/consultant/jobs/${jobId}/prospects/${prospectId}/sequence/pause`,
            {}
        );
        return res;
    },

    listSavedSearches: async (jobId: string): Promise<{ success: boolean; data?: { savedSearches: SavedSearch[] }; error?: string }> => {
        const res = await apiClient.get<{ savedSearches: SavedSearch[] }>(
            `/api/consultant/jobs/${jobId}/saved-searches`
        );
        return res;
    },

    createSavedSearch: async (
        jobId: string,
        data: { name: string; query?: string; filters?: { excludeApplied?: boolean; excludeProspected?: boolean; useSemanticRerank?: boolean } }
    ): Promise<{ success: boolean; data?: SavedSearch; error?: string }> => {
        const res = await apiClient.post<SavedSearch>(
            `/api/consultant/jobs/${jobId}/saved-searches`,
            data
        );
        return res;
    },

    deleteSavedSearch: async (jobId: string, savedSearchId: string): Promise<{ success: boolean; data?: { message: string }; error?: string }> => {
        const res = await apiClient.delete<{ message: string }>(
            `/api/consultant/jobs/${jobId}/saved-searches/${savedSearchId}`
        );
        return res;
    },

    // Workflow automation (Executive Search only)
    listAutomations: async (jobId: string): Promise<{ success: boolean; data?: { automations: JobAutomation[] }; error?: string }> => {
        const res = await apiClient.get<{ automations: JobAutomation[] }>(
            `/api/consultant/jobs/${jobId}/automations`
        );
        return res.success && res.data ? { success: true, data: res.data } : { success: false, error: (res as any).error };
    },

    createAutomation: async (
        jobId: string,
        data: { name: string; triggerType: JobAutomationTriggerType; triggerConfig?: { stage?: string }; actions: JobAutomationAction[]; enabled?: boolean }
    ): Promise<{ success: boolean; data?: JobAutomation; error?: string }> => {
        const res = await apiClient.post<JobAutomation>(
            `/api/consultant/jobs/${jobId}/automations`,
            data
        );
        return res;
    },

    updateAutomation: async (
        jobId: string,
        automationId: string,
        data: { name?: string; triggerConfig?: { stage?: string }; actions?: JobAutomationAction[]; enabled?: boolean }
    ): Promise<{ success: boolean; data?: JobAutomation; error?: string }> => {
        const res = await apiClient.put<JobAutomation>(
            `/api/consultant/jobs/${jobId}/automations/${automationId}`,
            data
        );
        return res;
    },

    deleteAutomation: async (jobId: string, automationId: string): Promise<{ success: boolean; error?: string }> => {
        const res = await apiClient.delete(`/api/consultant/jobs/${jobId}/automations/${automationId}`);
        return res;
    },

    listEmailTemplates: async (jobId: string): Promise<{ success: boolean; data?: { templates: EmailTemplateOption[] }; error?: string }> => {
        const res = await apiClient.get<{ templates: EmailTemplateOption[] }>(
            `/api/consultant/jobs/${jobId}/email-templates`
        );
        return res.success && res.data ? { success: true, data: res.data } : { success: false, error: (res as any).error };
    },
};

export type JobAutomationTriggerType = 'APPLICATION_SUBMITTED' | 'MOVED_TO_STAGE' | 'DROPPED_FROM_STAGE';
export interface JobAutomationAction {
    type: string;
    templateId?: string;
}
export interface JobAutomation {
    id: string;
    jobId: string | null;
    companyId: string;
    name: string;
    triggerType: JobAutomationTriggerType;
    triggerConfig: { stage?: string } | null;
    actions: JobAutomationAction[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface EmailTemplateOption {
    id: string;
    name: string;
    subject: string;
}

export interface SavedSearch {
    id: string;
    name: string;
    query?: string;
    filters?: { excludeApplied?: boolean; excludeProspected?: boolean; useSemanticRerank?: boolean };
    createdAt: string;
}

export interface SequenceStep {
    dayOffset: number;
    subjectTemplate: string;
    bodyTemplate: string;
    channel?: string;
}

export interface SequenceTemplate {
    id: string;
    name: string;
    jobId?: string;
    steps: SequenceStep[];
    createdAt: string;
}
