import { Permission, UserRole } from "@/shared/types/employerUser";
import { getEffectivePermissions } from "@/shared/lib/employerUserPermissions";
import { useMemo } from "react";
import { hasModuleAccess as checkModuleAccess, type ModuleName } from "@/shared/lib/moduleAccessControl";
import { type SubscriptionTier } from "@/shared/lib/subscriptionConfig";

// Check if running in development mode
function isDevelopmentMode(): boolean {
  return import.meta.env.DEV;
}

// Mock current user - in production, this would come from auth context
const mockCurrentUser = {
  id: 'user-1',
  role: (isDevelopmentMode() ? 'owner' : 'admin') as UserRole,
  // Mock employer context - in production, would come from context/auth
  employerId: 'employer-1',
  modules: {
    atsEnabled: true,
    hrmsEnabled: true,
    enabledAddons: [],
  },
};

export function usePermissions() {
  // Calculate effective permissions based on enabled modules
  const effectivePermissions = useMemo(() => {
    return getEffectivePermissions(mockCurrentUser.role, {
      atsEnabled: mockCurrentUser.modules.atsEnabled,
      hrmsEnabled: mockCurrentUser.modules.hrmsEnabled,
    });
  }, [mockCurrentUser.role, mockCurrentUser.modules.atsEnabled, mockCurrentUser.modules.hrmsEnabled]);

  const hasPermission = (permission: Permission): boolean => {
    // In dev mode, grant all permissions
    if (isDevelopmentMode()) return true;
    return effectivePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    // In dev mode, grant all permissions
    if (isDevelopmentMode()) return true;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    // In dev mode, grant all permissions
    if (isDevelopmentMode()) return true;
    return permissions.every(permission => hasPermission(permission));
  };

  const hasModuleAccess = (module: ModuleName): boolean => {
    // In dev mode, grant access to all modules
    if (isDevelopmentMode()) return true;
    // In production, this would get the actual subscription tier from context
    const mockSubscriptionTier: SubscriptionTier = 'medium';
    return checkModuleAccess(mockSubscriptionTier, mockCurrentUser.modules, module);
  };

  return {
    user: mockCurrentUser,
    permissions: effectivePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
  };
}
