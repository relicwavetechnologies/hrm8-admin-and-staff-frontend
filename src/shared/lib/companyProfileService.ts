import { apiClient } from './api';
import {
  CompanyProfileProgressResponse,
  CompanyProfileSectionKey,
  CompanyProfileDTO,
} from '@/shared/types/companyProfile';

class CompanyProfileService {
  async getProfile(companyId: string) {
    return apiClient.get<CompanyProfileProgressResponse>(`/api/companies/${companyId}/profile`);
  }

  async saveSection(
    companyId: string,
    section: CompanyProfileSectionKey,
    data: Record<string, unknown>,
    markComplete?: boolean
  ) {
    return apiClient.put<{ profile: CompanyProfileDTO }>(`/api/companies/${companyId}/profile`, {
      section,
      data,
      markComplete,
    });
  }

  async completeProfile(companyId: string) {
    return apiClient.post<{ profile: CompanyProfileDTO; message: string }>(
      `/api/companies/${companyId}/profile/complete`
    );
  }
}

export const companyProfileService = new CompanyProfileService();


