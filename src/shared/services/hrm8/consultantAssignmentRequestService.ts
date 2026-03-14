/**
 * Consultant Assignment Request Service
 * API service for pending consultant assignment requests
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface ConsultantAssignmentRequest {
  id: string;
  company_id: string;
  job_id: string;
  region_id: string | null;
  status: string;
  created_at: string;
  company: { id: string; name: string; region_id: string | null };
  job: {
    id: string;
    title: string;
    status: string;
    service_package: string | null;
    hiring_mode: string | null;
  };
  region: { id: string; name: string; code: string } | null;
}

class ConsultantAssignmentRequestService {
  async listPending(scope: 'my_regions' | 'all' = 'my_regions') {
    const params = new URLSearchParams();
    params.append('scope', scope);
    return apiClient.get<{ requests: ConsultantAssignmentRequest[] }>(
      `/api/hrm8/consultant-assignment-requests?${params.toString()}`
    );
  }

  async assign(requestId: string, consultantId: string, skipRegionCheck = true) {
    return apiClient.post<{ success: boolean; jobId: string; consultantId: string }>(
      `/api/hrm8/consultant-assignment-requests/${requestId}/assign`,
      { consultantId, skipRegionCheck }
    );
  }
}

export const consultantAssignmentRequestService = new ConsultantAssignmentRequestService();
