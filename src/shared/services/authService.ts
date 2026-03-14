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
                // Strict role-based portal access: no cross-login allowed
                const roleToType: Record<string, UserType> = {
                    RECRUITER: 'CONSULTANT',
                    SALES_AGENT: 'SALES_AGENT',
                    CONSULTANT_360: 'CONSULTANT360',
                };
                const allowedType = roleToType[consultant.role] ?? 'CONSULTANT';
                if (type !== allowedType) {
                    const portalNames: Record<UserType, string> = {
                        ADMIN: 'HRM8 Admin',
                        CONSULTANT: 'Consultant Portal',
                        SALES_AGENT: 'Sales Agent Portal',
                        CONSULTANT360: 'Consultant 360 Portal',
                    };
                    return {
                        success: false,
                        error: `This account can only access the ${portalNames[allowedType]}. Please select it and sign in again.`,
                    };
                }
                return {
                    success: true,
                    user: this.mapToUnifiedUser(consultant, allowedType),
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
        const hrm8User = user as Hrm8User;
        return {
            id: user.id,
            email: user.email,
            firstName: hrm8User.firstName ?? (user as any).first_name ?? (user as any).firstName,
            lastName: hrm8User.lastName ?? (user as any).last_name ?? (user as any).lastName,
            role: user.role,
            type,
            rawUser: user
        };
    }
}

export const authService = new AuthService();
