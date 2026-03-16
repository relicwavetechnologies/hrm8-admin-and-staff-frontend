import { apiClient } from '../api';
import { ConversationData, MessageData } from '@/shared/types/websocket';
import type { Application, ApplicationStage } from '@/shared/types/application';

export interface CandidatePipelineItem {
    id: string; // Application ID
    status: string;
    stage: string;
    applied_date: string;
    score?: number;
    recruiter_notes?: string;
    candidate: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        photo?: string;
        resume_url?: string;
        linked_in_url?: string;
    };
    video_interview?: {
        status: string;
    }[];
}

function mapApplicationStatus(status: unknown): Application['status'] {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase().trim() : '';

    const statusMap: Record<string, Application['status']> = {
        NEW: 'applied',
        APPLIED: 'applied',
        SCREENING: 'screening',
        INTERVIEW: 'interview',
        OFFER: 'offer',
        HIRED: 'hired',
        REJECTED: 'rejected',
        WITHDRAWN: 'withdrawn',
    };

    return statusMap[normalizedStatus] || 'applied';
}

function mapApplicationStage(stage: unknown): ApplicationStage {
    const normalizedStage = typeof stage === 'string' ? stage.toUpperCase().trim() : '';

    const stageMap: Record<string, ApplicationStage> = {
        NEW_APPLICATION: 'New Application',
        'NEW APPLICATION': 'New Application',
        RESUME_REVIEW: 'Resume Review',
        'RESUME REVIEW': 'Resume Review',
        PHONE_SCREEN: 'Phone Screen',
        'PHONE SCREEN': 'Phone Screen',
        TECHNICAL_INTERVIEW: 'Technical Interview',
        'TECHNICAL INTERVIEW': 'Technical Interview',
        ONSITE_INTERVIEW: 'Manager Interview',
        'ONSITE INTERVIEW': 'Manager Interview',
        MANAGER_INTERVIEW: 'Manager Interview',
        'MANAGER INTERVIEW': 'Manager Interview',
        FINAL_ROUND: 'Final Round',
        'FINAL ROUND': 'Final Round',
        REFERENCE_CHECK: 'Reference Check',
        'REFERENCE CHECK': 'Reference Check',
        OFFER_EXTENDED: 'Offer Extended',
        'OFFER EXTENDED': 'Offer Extended',
        OFFER_ACCEPTED: 'Offer Accepted',
        'OFFER ACCEPTED': 'Offer Accepted',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
    };

    return stageMap[normalizedStage] || 'New Application';
}

export const ConsultantCandidateService = {
    /**
     * Fetch candidate pipeline for a specific job
     */
    getPipeline: async (jobId: string): Promise<CandidatePipelineItem[]> => {
        const { data } = await apiClient.get<CandidatePipelineItem[]>(`/api/consultant/jobs/${jobId}/candidates/pipeline`);
        return data || [];
    },

    /**
     * Update application status
     */
    updateStatus: async (applicationId: string, status: string, stage?: string): Promise<any> => {
        const { data } = await apiClient.post<any>(`/api/consultant/candidates/${applicationId}/status`, { status, stage });
        return data;
    },

    /**
     * Add operational note
     */
    addNote: async (applicationId: string, note: string): Promise<void> => {
        await apiClient.post(`/api/consultant/candidates/${applicationId}/note`, { note });
    },

    /**
     * List conversations
     */
    getConversations: async (): Promise<ConversationData[]> => {
        const { data } = await apiClient.get<ConversationData[]>('/api/consultant/messages');
        return data || [];
    },

    /**
     * Get messages for a conversation
     */
    getMessages: async (conversationId: string, limit = 50, cursor?: string): Promise<MessageData[]> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);

        const { data } = await apiClient.get<MessageData[]>(`/api/consultant/messages/${conversationId}?${params}`);
        return data || [];
    },

    /**
     * Send a message
     */
    sendMessage: async (conversationId: string, content: string, attachments?: any[]): Promise<MessageData> => {
        const { data } = await apiClient.post<MessageData>(`/api/consultant/messages/${conversationId}`, {
            content,
            attachments
        });
        // data will be the Message object.
        if (!data) throw new Error('Failed to send message');
        return data;
    },

    /**
     * Mark conversation as read
     */
    markRead: async (conversationId: string): Promise<void> => {
        await apiClient.put(`/api/consultant/messages/${conversationId}/read`);
    },

    /**
     * Move application to a specific round (for drag-drop pipeline).
     * For HRM8-managed jobs, OFFER/REJECT may return requiresApproval: true (approval requested from HR).
     */
    moveToRound: async (
        applicationId: string,
        roundId: string,
        reason?: string
    ): Promise<{ success: boolean; data?: { requiresApproval?: boolean; requestId?: string; message?: string }; error?: string }> => {
        const response = await apiClient.post<any>(`/api/consultant/candidates/${applicationId}/move-to-round`, {
            roundId,
            reason,
        });
        return response;
    },

    /**
     * List consultant's decision requests (for pending approval display)
     */
    listDecisionRequests: async (
        status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<{ success: boolean; data?: { requests: Array<{ id: string; application_id: string; job_id: string }> }; error?: string }> => {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get<{ requests: any[] }>(`/api/consultant/decision-requests${params}`);
        return response;
    },

    /**
     * Update application stage (for drag-drop pipeline)
     */
    updateStage: async (applicationId: string, stage: string): Promise<{ success: boolean; data?: any; error?: string }> => {
        const response = await apiClient.post<any>(`/api/consultant/candidates/${applicationId}/stage`, { stage });
        return response;
    },

    /**
     * Get job applications in ApplicationPipeline-compatible format
     */
    getJobApplications: async (jobId: string): Promise<{ success: boolean; data: { applications: any[] } }> => {
        const { data } = await apiClient.get<any[]>(`/api/consultant/jobs/${jobId}/candidates/pipeline`);
        // Backend now returns pre-mapped camelCase data with AI scoring fields
        const applications = (data || []).map((app: any) => ({
            id: app.id,
            candidateId: app.candidateId || app.candidate?.id,
            // Use pre-mapped candidateName or construct from candidate object
            candidateName: app.candidateName || (
                (app.candidate?.firstName && app.candidate?.lastName)
                    ? `${app.candidate.firstName} ${app.candidate.lastName}`
                    : (app.candidate?.first_name && app.candidate?.last_name)
                        ? `${app.candidate.first_name} ${app.candidate.last_name}`
                        : 'Unknown Candidate'
            ),
            candidateEmail: app.candidateEmail || app.candidate?.email || '',
            candidatePhoto: app.candidatePhoto || app.candidate?.photo,
            jobId: app.jobId || jobId,
            jobTitle: app.jobTitle || app.job?.title || '',
            employerName: app.employerName || app.job?.company?.name || '',
            appliedDate: app.appliedDate ? new Date(app.appliedDate) : (app.applied_date ? new Date(app.applied_date) : new Date()),
            status: mapApplicationStatus(app.status),
            stage: mapApplicationStage(app.stage),
            resumeUrl: app.resumeUrl || app.candidate?.resumeUrl || app.candidate?.resume_url,
            linkedInUrl: app.linkedInUrl || app.candidate?.linkedInUrl || app.candidate?.linked_in_url,
            // AI Scoring - now comes directly from backend
            score: app.score,
            aiMatchScore: app.aiMatchScore || app.aiScore || app.score, // For AIMatchBadge
            aiScore: app.aiScore || app.score,
            aiAnalysis: app.aiAnalysis, // For recommendation badge and justification
            aiReasoning: app.aiReasoning,
            aiMatchType: app.aiMatchType,
            // Round tracking
            roundId: app.roundId,
            // Flags
            shortlisted: app.shortlisted || false,
            manuallyAdded: app.manuallyAdded || false,
            isRead: app.isRead,
            isNew: app.isNew,
            // Candidate object for nested access
            candidate: app.candidate,
            // Empty arrays for compatibility
            notes: [],
            activities: [],
            interviews: [],
            tags: app.tags || [],
            createdAt: app.createdAt ? new Date(app.createdAt) : (app.created_at ? new Date(app.created_at) : new Date()),
            updatedAt: app.updatedAt ? new Date(app.updatedAt) : (app.updated_at ? new Date(app.updated_at) : new Date()),
        }));
        return { success: true, data: { applications } };
    },

    /**
     * Get job rounds for pipeline columns
     */
    getJobRounds: async (jobId: string): Promise<{ success: boolean; data: { rounds: any[] } }> => {
        const response = await apiClient.get<{ rounds: any[] }>(`/api/consultant/jobs/${jobId}/rounds`);
        return { success: response.success, data: { rounds: response.data?.rounds || [] } };
    }
};
