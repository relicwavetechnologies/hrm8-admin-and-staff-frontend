import { AppRole, UserRole, ROLE_HIERARCHY } from "@/shared/types/rbac";

// Check if running in development mode
export function isDevelopmentMode(): boolean {
  return import.meta.env.DEV;
}

// Mock current user - in production, this would come from Supabase auth
const mockCurrentUserId = 'user-1';
const mockUserRoles: UserRole[] = [
  {
    id: 'role-1',
    userId: mockCurrentUserId,
    role: 'hr_admin',
    grantedBy: 'system',
    grantedAt: new Date().toISOString(),
    isActive: true,
  },
];

// In-memory storage for user roles
const userRoles = [...mockUserRoles];

export function getUserRoles(userId: string): UserRole[] {
  const roles = userRoles.filter(
    (role) => role.userId === userId && role.isActive && (!role.expiresAt || new Date(role.expiresAt) > new Date())
  );

  // In dev mode, always inject super_admin role
  if (isDevelopmentMode() && !roles.some(r => r.role === 'super_admin')) {
    roles.push({
      id: 'dev-super-admin',
      userId,
      role: 'super_admin',
      grantedBy: 'system-dev',
      grantedAt: new Date().toISOString(),
      isActive: true,
    });
  }

  return roles;
}

export function hasRole(userId: string, role: AppRole): boolean {
  const roles = getUserRoles(userId);
  return roles.some((r) => r.role === role);
}

export function hasAnyRole(userId: string, roles: AppRole[]): boolean {
  const userRolesList = getUserRoles(userId);
  return userRolesList.some((r) => roles.includes(r.role));
}

export function hasPermission(userId: string, _permission: string): boolean {
  // In dev mode, always grant all permissions
  if (isDevelopmentMode()) {
    return true;
  }

  const roles = getUserRoles(userId);

  // Check if user has super_admin role
  if (roles.some((r) => r.role === 'super_admin')) {
    return true;
  }

  // For now, implement basic permission checking
  // In production, this would check against ROLE_PERMISSIONS
  return roles.length > 0;
}

export function canManageRole(userId: string, targetRole: AppRole): boolean {
  const userRolesList = getUserRoles(userId);

  // Get user's highest role level
  const userLevel = Math.max(...userRolesList.map((r) => ROLE_HIERARCHY[r.role]));
  const targetLevel = ROLE_HIERARCHY[targetRole];

  // User can manage roles lower than their own
  return userLevel > targetLevel;
}

export function grantRole(grantedBy: string, userId: string, role: AppRole, departmentId?: string): UserRole {
  // Check if user already has this role
  const existingRole = userRoles.find(
    (r) => r.userId === userId && r.role === role && r.isActive
  );

  if (existingRole) {
    return existingRole;
  }

  const newRole: UserRole = {
    id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    role,
    departmentId,
    grantedBy,
    grantedAt: new Date().toISOString(),
    isActive: true,
  };

  userRoles.push(newRole);
  return newRole;
}

export function revokeRole(roleId: string): boolean {
  const index = userRoles.findIndex((r) => r.id === roleId);
  if (index === -1) return false;

  userRoles[index] = {
    ...userRoles[index],
    isActive: false,
  };

  return true;
}

export function getAllUserRoles(): UserRole[] {
  return userRoles.filter((r) => r.isActive);
}

export function getCurrentUserId(): string {
  // In production, this would get the actual authenticated user ID
  return mockCurrentUserId;
}
