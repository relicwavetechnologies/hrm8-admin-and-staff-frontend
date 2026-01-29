/**
 * Unified Authentication Service
 * Consolidates Admin, Consultant, and Sales Agent authentication
 */

import { hrm8AuthService, Hrm8User } from '../lib/hrm8AuthService';
import { consultantAuthService, ConsultantUser } from '../lib/consultantAuthService';

export type UserType = 'ADMIN' | 'CONSULTANT' | 'SALES_AGENT' | 'CONSULTANT360';

export interface UnifiedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    type: UserType;
    rawUser: Hrm8User | ConsultantUser;
}

class AuthService {
    async login(email: string, password: string, type: UserType) {
        if (type === 'ADMIN') {
            const response = await hrm8AuthService.login({ email, password });
            if (response.success && response.data?.hrm8User) {
                return {
                    success: true,
                    user: this.mapToUnifiedUser(response.data.hrm8User, 'ADMIN')
                };
            }
            return { success: false, error: response.error };
        } else {
            const response = await consultantAuthService.login({ email, password });
            if (response.success && response.data?.consultant) {
                const consultant = response.data.consultant;
                let finalType: UserType = 'CONSULTANT';

                if (consultant.role === 'SALES_AGENT') finalType = 'SALES_AGENT';
                else if (consultant.role === 'CONSULTANT_360') finalType = 'CONSULTANT360';

                return {
                    success: true,
                    user: this.mapToUnifiedUser(consultant, finalType)
                };
            }
            return { success: false, error: response.error };
        }
    }

    async getCurrentUser(type: UserType): Promise<UnifiedUser | null> {
        try {
            if (type === 'ADMIN') {
                const response = await hrm8AuthService.getCurrentHrm8User();
                if (response.success && response.data?.hrm8User) {
                    return this.mapToUnifiedUser(response.data.hrm8User, 'ADMIN');
                }
            } else {
                const response = await consultantAuthService.getCurrentConsultant();
                if (response.success && response.data?.consultant) {
                    const consultant = response.data.consultant;
                    let finalType: UserType = 'CONSULTANT';
                    if (consultant.role === 'SALES_AGENT') finalType = 'SALES_AGENT';
                    else if (consultant.role === 'CONSULTANT_360') finalType = 'CONSULTANT360';
                    return this.mapToUnifiedUser(consultant, finalType);
                }
            }
        } catch (error) {
            console.error('Failed to fetch current user', error);
        }
        return null;
    }

    async logout(type: UserType) {
        if (type === 'ADMIN') {
            await hrm8AuthService.logout();
        } else {
            await consultantAuthService.logout();
        }
    }

    private mapToUnifiedUser(user: Hrm8User | ConsultantUser, type: UserType): UnifiedUser {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            type,
            rawUser: user
        };
    }
}

export const authService = new AuthService();
