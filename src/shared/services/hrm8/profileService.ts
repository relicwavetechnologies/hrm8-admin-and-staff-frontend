import { apiClient } from '@/shared/lib/api';

export interface Hrm8ProfileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  photo?: string | null;
  role: 'GLOBAL_ADMIN' | 'REGIONAL_LICENSEE';
  status: string;
  licenseeId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface RegionalLicenseeProfile {
  id: string;
  name: string;
  legalEntityName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  taxId?: string | null;
  agreementStartDate: string;
  agreementEndDate?: string | null;
  revenueSharePercent: number;
  exclusivity: boolean;
  contractFileUrl?: string | null;
  managerContact: string;
  financeContact?: string | null;
  complianceContact?: string | null;
  status: string;
  regions?: Array<{
    id: string;
    name: string;
    code: string;
    country: string;
    stateProvince?: string | null;
    city?: string | null;
    isActive: boolean;
    ownerType: string;
  }>;
}

export interface Hrm8Profile {
  user: Hrm8ProfileUser;
  licensee?: RegionalLicenseeProfile | null;
}

export interface Hrm8ProfileUpdatePayload {
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    photo?: string | null;
  };
  licensee?: {
    name?: string;
    legalEntityName?: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    taxId?: string | null;
    agreementStartDate?: string | null;
    agreementEndDate?: string | null;
    revenueSharePercent?: number;
    exclusivity?: boolean;
    contractFileUrl?: string | null;
    managerContact?: string;
    financeContact?: string | null;
    complianceContact?: string | null;
    status?: string;
  };
}

class Hrm8ProfileService {
  async getProfile() {
    return apiClient.get<{ profile: Hrm8Profile }>('/api/hrm8/profile');
  }

  async updateProfile(payload: Hrm8ProfileUpdatePayload) {
    return apiClient.put<{ profile: Hrm8Profile }>('/api/hrm8/profile', payload);
  }
}

export const hrm8ProfileService = new Hrm8ProfileService();
