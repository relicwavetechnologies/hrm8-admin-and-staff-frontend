/**
 * Assessment Service - Frontend API client
 */

import { apiClient } from './api';

export interface AssessmentConfiguration {
  id?: string;
  jobRoundId: string;
  enabled: boolean;
  autoAssign: boolean;
  deadlineDays?: number;
  timeLimitMinutes?: number;
  passThreshold?: number;
  auto_reject_on_fail?: boolean;
  auto_reject_on_deadline?: boolean;
  auto_move_on_pass?: boolean;
  provider?: string;
  providerConfig?: any;
  questions?: AssessmentQuestion[];
  instructions?: string;
}

export interface AssessmentQuestion {
  id?: string;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
  options?: string[];
  correctAnswer?: any;
  points?: number;
  order?: number;
}

export interface CreateAssessmentRequest {
  enabled: boolean;
  evaluationMode?: "GRADING" | "VOTING";
  votingRule?: "UNANIMOUS" | "MAJORITY" | "MIN_APPROVALS";
  minApprovalsCount?: number;
  autoAssign?: boolean;
  deadlineDays?: number;
  timeLimitMinutes?: number;
  passThreshold?: number;
  auto_reject_on_fail?: boolean;
  auto_reject_on_deadline?: boolean;
  auto_move_on_pass?: boolean;
  provider?: string;
  providerConfig?: any;
  questions?: AssessmentQuestion[];
  instructions?: string;
}

class AssessmentService {
  /**
   * Get assessment configuration for a job round
   */
  async getAssessmentConfig(jobId: string, roundId: string) {
    return apiClient.get<{ config: AssessmentConfiguration | null }>(
      `/api/jobs/${jobId}/rounds/${roundId}/assessment-config`
    );
  }

  /**
   * Configure assessment for a job round
   */
  async configureAssessment(jobId: string, roundId: string, config: CreateAssessmentRequest) {
    return apiClient.post<{ message: string }>(
      `/api/jobs/${jobId}/rounds/${roundId}/assessment-config`,
      config
    );
  }

  /**
   * Submit a vote (APPROVE/REJECT) for an assessment (voting mode)
   */
  async saveVote(assessmentId: string, vote: "APPROVE" | "REJECT", comment?: string) {
    return apiClient.post<{ message: string }>(`/api/assessments/${assessmentId}/vote`, { vote, comment });
  }

  /**
   * Generate assessment questions using AI
   */
  async generateQuestionsWithAI(params: {
    jobTitle: string;
    jobDescription?: string;
    questionCount?: number;
  }) {
    const res = await apiClient.post<{ questions: AssessmentQuestion[] }>(
      "/api/ai/assessment-questions/generate",
      {
        jobTitle: params.jobTitle,
        jobDescription: params.jobDescription ?? undefined,
        questionCount: params.questionCount ?? 5,
      }
    );
    if (!res.success || !res.data?.questions) {
      throw new Error(res.error || "Failed to generate questions");
    }
    return res.data.questions;
  }
}

export const assessmentService = new AssessmentService();

