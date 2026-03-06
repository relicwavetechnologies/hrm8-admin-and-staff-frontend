import { apiClient } from '../api';
import { HiringTeamMember } from '@/shared/types/job';

export interface InviteHiringTeamMemberRequest {
  email: string;
  name: string;
  role: HiringTeamMember['role'];
  permissions: HiringTeamMember['permissions'];
}

class HiringTeamService {
  /**
   * Invite a member to the hiring team for a specific job
   */
  async inviteMember(
    jobId: string,
    data: InviteHiringTeamMemberRequest
  ): Promise<void> {
    const response = await apiClient.post(
      `/api/jobs/${jobId}/hiring-team/invite`,
      data
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to send invitation');
    }
  }
}

export const hiringTeamService = new HiringTeamService();

