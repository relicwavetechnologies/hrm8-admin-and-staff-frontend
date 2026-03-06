/**
 * Company Settings Service
 * Handles fetching and updating company-level settings (office hours, timezone)
 */

import { apiClient } from './api';

export interface OfficeHoursConfig {
  timezone: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface CompanySettingsResponse {
  success: boolean;
  data?: OfficeHoursConfig;
  error?: string;
  message?: string;
}

class CompanySettingsService {
  /**
   * Get company settings (office hours, timezone)
   */
  async getCompanySettings(): Promise<CompanySettingsResponse> {
    return apiClient.get<OfficeHoursConfig>('/api/companies/settings');
  }

  /**
   * Update company settings (office hours, timezone)
   */
  async updateCompanySettings(
    settings: Partial<OfficeHoursConfig>
  ): Promise<CompanySettingsResponse> {
    return apiClient.put<OfficeHoursConfig>('/api/companies/settings', settings);
  }
}

export const companySettingsService = new CompanySettingsService();

