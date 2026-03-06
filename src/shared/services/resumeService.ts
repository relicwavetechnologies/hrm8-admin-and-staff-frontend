import { apiClient } from '@/shared/lib/api';
import { CandidateDocument } from '@/shared/types/entities';

export const resumeService = {
  async getResume(resumeId: string): Promise<CandidateDocument> {
    const response = await apiClient.get<CandidateDocument>(
      `/api/resumes/${resumeId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch resume');
    }
    return response.data;
  },
};
