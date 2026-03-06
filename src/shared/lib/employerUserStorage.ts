import { EmployerUser, ROLE_PERMISSIONS } from "@/shared/types/employerUser";
import { mockEmployerUsers } from "@/shared/data/mockEmployerUsers";

// In-memory storage
let users = [...mockEmployerUsers];

export function getEmployerUsers(employerId: string): EmployerUser[] {
  return users.filter(user => user.employerId === employerId);
}

export function getEmployerUserById(id: string): EmployerUser | undefined {
  return users.find(user => user.id === id);
}

export function createEmployerUser(user: Omit<EmployerUser, 'id' | 'createdAt' | 'updatedAt'>): EmployerUser {
  const newUser: EmployerUser = {
    ...user,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    permissions: user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  return newUser;
}

export function updateEmployerUser(id: string, updates: Partial<EmployerUser>): EmployerUser | null {
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return users[index];
}

export function deleteEmployerUser(id: string): boolean {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length < initialLength;
}

export function inviteUser(
  employerId: string,
  email: string,
  role: EmployerUser['role'],
  invitedBy: string
): EmployerUser {
  const newUser: EmployerUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    employerId,
    firstName: "",
    lastName: "",
    email,
    role,
    status: "invited",
    permissions: ROLE_PERMISSIONS[role],
    invitedAt: new Date().toISOString(),
    invitedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  return newUser;
}

export function getEmployerUserStats(employerId: string) {
  const employerUsers = getEmployerUsers(employerId);
  
  return {
    total: employerUsers.length,
    active: employerUsers.filter(u => u.status === 'active').length,
    invited: employerUsers.filter(u => u.status === 'invited').length,
    suspended: employerUsers.filter(u => u.status === 'suspended').length,
    byRole: {
      owner: employerUsers.filter(u => u.role === 'owner').length,
      admin: employerUsers.filter(u => u.role === 'admin').length,
      recruiter: employerUsers.filter(u => u.role === 'recruiter').length,
      'hiring-manager': employerUsers.filter(u => u.role === 'hiring-manager').length,
      viewer: employerUsers.filter(u => u.role === 'viewer').length,
    },
  };
}
