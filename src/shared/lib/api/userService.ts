import { apiClient } from '../api';

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

class UserService {
  /**
   * Get all users in the company
   */
  async getCompanyUsers(): Promise<CompanyUser[]> {
    const response = await apiClient.get<CompanyUser[]>('/api/employees');

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch company users');
    }

    return response.data as CompanyUser[];
  }
}

export const userService = new UserService();

