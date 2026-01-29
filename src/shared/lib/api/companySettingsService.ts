import { apiClient } from '../api';

export type JobAssignmentMode = 'AUTO_RULES_ONLY' | 'MANUAL_ONLY';

export interface JobAssignmentSettings {
  jobAssignmentMode: JobAssignmentMode;
  preferredRecruiterId: string | null;
}

class CompanySettingsService {
  /**
   * Get job assignment settings for a company
   */
  async getJobAssignmentSettings(companyId: string): Promise<JobAssignmentSettings> {
    const response = await apiClient.get<JobAssignmentSettings>(
      `/api/companies/${companyId}/job-assignment-settings`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch job assignment settings');
    }

    return response.data;
  }

  /**
   * Update job assignment mode for a company
   */
  async updateJobAssignmentMode(companyId: string, mode: JobAssignmentMode): Promise<void> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/api/companies/${companyId}/job-assignment-mode`,
      { mode }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update job assignment mode');
    }
  }
}

export const companySettingsService = new CompanySettingsService();


















