import { apiClient } from '../api';
import { ConversationData, MessageData } from '@/shared/types/websocket';

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

export const ConsultantCandidateService = {
    /**
     * Fetch candidate pipeline for a specific job
     */
    getPipeline: async (jobId: string): Promise<CandidatePipelineItem[]> => {
        const { data } = await apiClient.get<CandidatePipelineItem[]>(`/api/consultant/jobs/${jobId}/candidates`);
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
     * Move application to a specific round (for drag-drop pipeline)
     */
    moveToRound: async (applicationId: string, roundId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
        const response = await apiClient.post<any>(`/api/consultant/candidates/${applicationId}/move-to-round`, { roundId });
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
        const { data } = await apiClient.get<any[]>(`/api/consultant/jobs/${jobId}/candidates`);
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
            appliedDate: app.appliedDate ? new Date(app.appliedDate) : (app.applied_date ? new Date(app.applied_date) : new Date()),
            status: typeof app.status === 'string' ? app.status.toLowerCase() : 'new',
            stage: app.stage,
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
