import { apiClient } from './api';

/**
 * Round types:
 * - CUSTOM: Simple mode, manual-only non-interview rounds (no automation)
 * - ASSESSMENT: Advanced mode, automated non-interview rounds (full automation support)
 * - INTERVIEW: Both modes, role-managed interview rounds
 */
export type JobRoundType = 'CUSTOM' | 'ASSESSMENT' | 'INTERVIEW';

export interface JobRound {
  id: string;
  jobId: string;
  name: string;
  order: number;
  type: JobRoundType;
  isFixed: boolean;
  fixedKey?: string | null;
  assignedRoleId?: string | null;
  /** When true, all hiring team roles can move/manage in this round */
  syncPermissions?: boolean;
  /** When true, automatically move candidate to next round on pass (fixed and custom rounds) */
  autoMoveOnPass?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRoundRequest {
  name: string;
  type: JobRoundType;
  assignedRoleId?: string;
  syncPermissions?: boolean;
  autoMoveOnPass?: boolean;
}

export interface UpdateJobRoundRequest {
  name?: string;
  type?: JobRoundType;
  order?: number;
  assignedRoleId?: string | null;
  syncPermissions?: boolean;
  autoMoveOnPass?: boolean;
  /** For INTERVIEW rounds: require approval from all assigned interviewers before progression */
  requireAllInterviewers?: boolean;
}

class JobRoundService {
  /**
   * Get all rounds for a job
   */
  async getJobRounds(jobId: string) {
    return apiClient.get<{ rounds: JobRound[] }>(`/api/jobs/${jobId}/rounds`);
  }

  /**
   * Create a new round for a job
   */
  async createRound(jobId: string, data: CreateJobRoundRequest) {
    return apiClient.post<{ round: JobRound }>(`/api/jobs/${jobId}/rounds`, data);
  }

  /**
   * Update a round
   */
  async updateRound(jobId: string, roundId: string, data: UpdateJobRoundRequest) {
    return apiClient.put<{ round: JobRound }>(`/api/jobs/${jobId}/rounds/${roundId}`, data);
  }

  /**
   * Delete a round
   */
  async deleteRound(jobId: string, roundId: string) {
    return apiClient.delete(`/api/jobs/${jobId}/rounds/${roundId}`);
  }

  /**
   * Get email configuration for a round
   */
  async getEmailConfig(jobId: string, roundId: string) {
    return apiClient.get<{ enabled: boolean; templateId?: string }>(`/api/jobs/${jobId}/rounds/${roundId}/email-config`);
  }

  /**
   * Update email configuration for a round
   */
  async updateEmailConfig(jobId: string, roundId: string, config: { enabled: boolean; templateId?: string }) {
    return apiClient.put<{ round: JobRound }>(`/api/jobs/${jobId}/rounds/${roundId}/email-config`, config);
  }

  /**
   * Get offer configuration for a round (OFFER round only)
   */
  async getOfferConfig(jobId: string, roundId: string) {
    return apiClient.get<OfferConfig>(`/api/jobs/${jobId}/rounds/${roundId}/offer-config`);
  }

  /**
   * Update offer configuration for a round (OFFER round only)
   */
  async updateOfferConfig(jobId: string, roundId: string, config: OfferConfig) {
    return apiClient.put<OfferConfig>(`/api/jobs/${jobId}/rounds/${roundId}/offer-config`, config);
  }
}

export interface OfferConfig {
  autoSend?: boolean;
  defaultTemplateId?: string;
  defaultSalary?: string;
  defaultSalaryCurrency?: string;
  defaultSalaryPeriod?: string;
  defaultWorkLocation?: string;
  defaultWorkArrangement?: string;
  defaultBenefits?: string;
  defaultVacationDays?: string;
  defaultExpiryDays?: string;
  defaultCustomMessage?: string;
}

export const jobRoundService = new JobRoundService();

