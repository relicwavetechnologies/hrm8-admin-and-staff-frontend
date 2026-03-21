// @ts-nocheck

import { apiClient } from '@/shared/lib/api';
import type { Application } from '@/shared/types/application';
import { jobService } from '@/modules/jobs/lib/jobService';

export interface SubmitApplicationRequest {
    jobId: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    portfolioUrl?: string;
    linkedInUrl?: string;
    websiteUrl?: string;
    customAnswers?: Array<{
        questionId: string;
        answer: string | string[];
    }>;
    questionnaireData?: any;
    tags?: string[];
}

export { type Application };

class ApplicationService {
    async submitApplication(data: SubmitApplicationRequest) {
        return apiClient.post<{ application: Application; message: string }>('/api/applications', data);
    }

    async getApplication(id: string) {
        return apiClient.get<{ application: Application }>(`/api/applications/${id}`);
    }

    // Recruiter/admin view – does not require candidate auth
    async getApplicationForAdmin(id: string) {
        return apiClient.get<{ application: Application }>(`/api/applications/admin/${id}`);
    }

    // Get application resume with content
    async getApplicationResume(id: string) {
        return apiClient.get<{
            id: string;
            candidateId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: string;
            content?: string;
            uploadedBy?: string;
        }>(`/api/applications/${id}/resume`);
    }

    async getCandidateApplications() {
        try {
            return await apiClient.get<{ applications: Application[] }>('/api/applications');
        } catch {
            const jobsResponse = await jobService.getJobs({ page: 1, limit: 300 });
            if (!jobsResponse.success || !jobsResponse.data?.jobs?.length) {
                return { success: true, data: { applications: [] } } as any;
            }

            const appResponses = await Promise.allSettled(
                jobsResponse.data.jobs.map((job) => this.getJobApplications(job.id))
            );

            const allApplications = appResponses
                .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
                .flatMap((result) => result.value?.data?.applications || []);

            const unique = new Map<string, Application>();
            allApplications.forEach((app: Application) => {
                if (app?.id && !unique.has(app.id)) unique.set(app.id, app);
            });

            return {
                success: true,
                data: { applications: Array.from(unique.values()) },
            } as any;
        }
    }

    async getJobApplications(
        jobId: string,
        filters?: {
            status?: string;
            stage?: string;
            minScore?: number;
            maxScore?: number;
            shortlisted?: boolean;
        }
    ) {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.stage) queryParams.append('stage', filters.stage);
        if (filters?.minScore !== undefined) queryParams.append('minScore', filters.minScore.toString());
        if (filters?.maxScore !== undefined) queryParams.append('maxScore', filters.maxScore.toString());
        if (filters?.shortlisted !== undefined) queryParams.append('shortlisted', filters.shortlisted.toString());

        const queryString = queryParams.toString();
        const endpoint = `/api/applications/job/${jobId}${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<{ applications: Application[] }>(endpoint);
    }

    async withdrawApplication(id: string) {
        return apiClient.post<{ application: Application; message: string }>(`/api/applications/${id}/withdraw`);
    }

    /**
     * Create application manually (by recruiter)
     */
    async createManualApplication(data: {
        jobId: string;
        candidateId: string;
        resumeUrl?: string;
        coverLetterUrl?: string;
        portfolioUrl?: string;
        linkedInUrl?: string;
        websiteUrl?: string;
        tags?: string[];
        notes?: string;
    }) {
        return apiClient.post<{ application: Application; message: string }>('/api/applications/manual', data);
    }

    /**
     * Update application score
     */
    async updateScore(id: string, score: number) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/score`, { score });
    }

    /**
     * Bulk score candidates using AI (backend handles OpenAI)
     * POST /api/applications/bulk-score
     */
    async bulkScoreCandidates(applicationIds: string[], jobId: string) {
        return apiClient.post<{
            results: Array<{
                applicationId: string;
                score: number;
                analysis: any;
                success: boolean;
            }>;
            progress: Array<{ completed: number; total: number; current: string }>;
            summary: {
                total: number;
                successful: number;
                failed: number;
            };
        }>('/api/applications/bulk-score', {
            applicationIds,
            jobId,
        });
    }

    /**
     * Update application tags
     */
    async updateTags(id: string, tags: string[]) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/tags`, { tags });
    }

    /**
     * Update application rank
     */
    async updateRank(id: string, rank: number) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/rank`, { rank });
    }

    /**
     * Shortlist candidate
     */
    async shortlistCandidate(id: string) {
        return apiClient.post<{ application: Application; message: string }>(`/api/applications/${id}/shortlist`);
    }

    /**
     * Unshortlist candidate
     */
    async unshortlistCandidate(id: string) {
        return apiClient.post<{ application: Application; message: string }>(`/api/applications/${id}/unshortlist`);
    }

    /**
     * Update application stage
     */
    async updateStage(id: string, stage: string) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/stage`, { stage });
    }

    /**
     * Move application to a round
     */
    async moveToRound(id: string, roundId: string) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/round/${roundId}`);
    }

    /**
     * Update recruiter notes
     */
    async updateNotes(id: string, notes: string) {
        return apiClient.put<{ application: Application; message: string }>(`/api/applications/${id}/notes`, { notes });
    }

    /**
     * Update manual screening results
     */
    async updateManualScreening(id: string, data: {
        score?: number;
        status?: 'PENDING' | 'PASSED' | 'FAILED';
        notes?: string;
        completed?: boolean;
    }) {
        return apiClient.put<{ application: Application; message: string }>(
            `/api/applications/${id}/manual-screening`,
            data
        );
    }

    /**
     * Add candidate from talent pool to job
     */
    async addFromTalentPool(data: {
        jobId: string;
        candidateId: string;
        notes?: string;
    }) {
        return apiClient.post<{ application: Application; message: string }>('/api/applications/from-talent-pool', data);
    }
    /**
     * Approve a hire (Company Admin action)
     */
    async approveHire(applicationId: string) {
        return apiClient.post<{
            success: boolean;
            message: string;
            data: {
                applicationId: string;
                commissionConfirmed: boolean
            }
        }>(`/api/employer/hires/${applicationId}/approve`);
    }
}

export const applicationService = new ApplicationService();
