import { useState, useEffect } from "react";
import { AppRole, UserRole } from "@/shared/types/rbac";
import { getUserRoles, hasRole, hasAnyRole, hasPermission, getCurrentUserId, isDevelopmentMode } from "@/shared/lib/rbacService";

export function useRBAC() {
  const [userId] = useState(getCurrentUserId());
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = () => {
      const userRoles = getUserRoles(userId);
      setRoles(userRoles);
      setLoading(false);
    };

    loadRoles();
  }, [userId]);

  const checkRole = (role: AppRole): boolean => {
    return hasRole(userId, role);
  };

  const checkAnyRole = (rolesList: AppRole[]): boolean => {
    return hasAnyRole(userId, rolesList);
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(userId, permission);
  };

  const isSuperAdmin = isDevelopmentMode() || checkRole('super_admin');
  const isHRAdmin = isDevelopmentMode() || checkRole('hr_admin');
  const isManager = isDevelopmentMode() || checkAnyRole(['manager', 'department_head', 'hr_manager']);

  return {
    userId,
    roles,
    loading,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    hasPermission: checkPermission,
    isSuperAdmin,
    isHRAdmin,
    isManager,
  };
}
