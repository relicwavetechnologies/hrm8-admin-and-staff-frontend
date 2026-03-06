import { apiClient } from '../api';

export type JobRoundType = 'ASSESSMENT' | 'INTERVIEW';

export interface JobRound {
  id: string;
  jobId: string;
  name: string;
  order: number;
  type: JobRoundType;
  isFixed: boolean;
  fixedKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRoundRequest {
  name: string;
  type: JobRoundType;
}

export interface UpdateJobRoundRequest {
  name?: string;
  type?: JobRoundType;
  order?: number;
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
}

export const jobRoundService = new JobRoundService();

