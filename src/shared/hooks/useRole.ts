/**
 * Hook to check user role and permissions
 */

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/shared/lib/authService';

export function useRole() {
  const { user } = useAuth();

  const role = user?.role as UserRole | undefined;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const canPostJobs = isSuperAdmin || role === 'ADMIN';
  const canManageUsers = isSuperAdmin || role === 'ADMIN';
  const canManageCompanySettings = isSuperAdmin;
  const canViewCompanyData = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER';
  const canEditCompanyData = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER';

  return {
    role,
    isSuperAdmin,
    isAdmin,
    canPostJobs,
    canManageUsers,
    canManageCompanySettings,
    canViewCompanyData,
    canEditCompanyData,
    loading: !user,
  };
}









