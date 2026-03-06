import { UserRole, UserPermission, ROLE_PERMISSIONS_BY_MODULE } from "@/shared/types/employerUser";

export interface ModuleConfig {
  atsEnabled: boolean;
  hrmsEnabled: boolean;
}

/**
 * Get effective permissions for a user role based on enabled modules
 * Only returns permissions for modules that are enabled
 */
export function getEffectivePermissions(
  role: UserRole,
  moduleConfig: ModuleConfig
): UserPermission[] {
  const rolePermissions = ROLE_PERMISSIONS_BY_MODULE[role];
  const effectivePermissions: UserPermission[] = [];

  // Add ATS permissions if module is enabled
  if (moduleConfig.atsEnabled) {
    effectivePermissions.push(...rolePermissions.ats);
  }

  // Add HRMS permissions if module is enabled
  if (moduleConfig.hrmsEnabled) {
    effectivePermissions.push(...rolePermissions.hrms);
  }

  return effectivePermissions;
}

/**
 * Check if a user has a specific permission based on their role and enabled modules
 */
export function hasEffectivePermission(
  role: UserRole,
  permission: UserPermission,
  moduleConfig: ModuleConfig
): boolean {
  const effectivePermissions = getEffectivePermissions(role, moduleConfig);
  return effectivePermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions based on their role and enabled modules
 */
export function hasAnyEffectivePermission(
  role: UserRole,
  permissions: UserPermission[],
  moduleConfig: ModuleConfig
): boolean {
  const effectivePermissions = getEffectivePermissions(role, moduleConfig);
  return permissions.some(permission => effectivePermissions.includes(permission));
}

/**
 * Check if a user has all of the specified permissions based on their role and enabled modules
 */
export function hasAllEffectivePermissions(
  role: UserRole,
  permissions: UserPermission[],
  moduleConfig: ModuleConfig
): boolean {
  const effectivePermissions = getEffectivePermissions(role, moduleConfig);
  return permissions.every(permission => effectivePermissions.includes(permission));
}

/**
 * Get permissions by module type
 */
export function getModulePermissions(
  role: UserRole,
  module: 'ats' | 'hrms'
): UserPermission[] {
  return ROLE_PERMISSIONS_BY_MODULE[role][module];
}

/**
 * Check if a permission belongs to a specific module
 */
export function isATSPermission(permission: UserPermission): boolean {
  const atsPermissions = [
    'manage_jobs', 'view_jobs', 'manage_candidates', 'view_candidates',
    'manage_billing', 'view_billing', 'manage_users', 'manage_settings',
    'recruitment.view', 'recruitment.manage',
  ];
  return atsPermissions.includes(permission);
}

export function isHRMSPermission(permission: UserPermission): boolean {
  return !isATSPermission(permission);
}
