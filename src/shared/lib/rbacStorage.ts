import type { AppRole } from "@/shared/types/rbac";

export interface RoleAssignment {
  id: string;
  userId: string;
  userName: string;
  role: AppRole;
  departmentId?: string;
  departmentName?: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
}

const roleAssignments: RoleAssignment[] = [];

export function getRoleAssignments(filters?: {
  userId?: string;
  role?: AppRole;
  departmentId?: string;
}): RoleAssignment[] {
  let filtered = roleAssignments;

  if (filters?.userId) {
    filtered = filtered.filter((a) => a.userId === filters.userId);
  }
  if (filters?.role) {
    filtered = filtered.filter((a) => a.role === filters.role);
  }
  if (filters?.departmentId) {
    filtered = filtered.filter((a) => a.departmentId === filters.departmentId);
  }

  return filtered.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
}

export function getRoleAssignment(id: string): RoleAssignment | undefined {
  return roleAssignments.find((a) => a.id === id);
}

export function createRoleAssignment(
  assignment: Omit<RoleAssignment, 'id' | 'assignedAt'>
): RoleAssignment {
  const newAssignment: RoleAssignment = {
    ...assignment,
    id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assignedAt: new Date().toISOString(),
  };
  roleAssignments.push(newAssignment);
  return newAssignment;
}

export function updateRoleAssignment(id: string, updates: Partial<RoleAssignment>): RoleAssignment | null {
  const index = roleAssignments.findIndex((a) => a.id === id);
  if (index === -1) return null;

  roleAssignments[index] = {
    ...roleAssignments[index],
    ...updates,
  };
  return roleAssignments[index];
}

export function deleteRoleAssignment(id: string): boolean {
  const index = roleAssignments.findIndex((a) => a.id === id);
  if (index === -1) return false;

  roleAssignments.splice(index, 1);
  return true;
}
