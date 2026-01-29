// Role-Based Access Control Types

export type AppRole = 
  | 'super_admin'
  | 'hr_admin'
  | 'hr_manager'
  | 'department_head'
  | 'manager'
  | 'employee'
  | 'contractor'
  | 'viewer';

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
  departmentId?: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface RolePermission {
  role: AppRole;
  permissions: string[];
  description: string;
}

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 100,
  hr_admin: 90,
  hr_manager: 80,
  department_head: 70,
  manager: 60,
  employee: 50,
  contractor: 40,
  viewer: 30,
};

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'super_admin',
    permissions: ['*'],
    description: 'Full system access and configuration',
  },
  {
    role: 'hr_admin',
    permissions: [
      'employees.*',
      'payroll.*',
      'benefits.*',
      'compliance.*',
      'reports.*',
      'settings.view',
      'settings.manage',
    ],
    description: 'Complete HR management access',
  },
  {
    role: 'hr_manager',
    permissions: [
      'employees.view',
      'employees.edit',
      'payroll.view',
      'benefits.view',
      'benefits.manage',
      'compliance.view',
      'reports.view',
    ],
    description: 'HR operations and reporting',
  },
  {
    role: 'department_head',
    permissions: [
      'employees.view',
      'performance.view',
      'performance.manage',
      'leave.approve',
      'expenses.approve',
      'reports.view',
    ],
    description: 'Department-level people management',
  },
  {
    role: 'manager',
    permissions: [
      'employees.view',
      'performance.view',
      'leave.approve',
      'expenses.approve',
      'attendance.view',
    ],
    description: 'Team management and approvals',
  },
  {
    role: 'employee',
    permissions: [
      'ess.view',
      'ess.edit',
      'leave.apply',
      'expenses.submit',
      'documents.view',
    ],
    description: 'Self-service access',
  },
  {
    role: 'contractor',
    permissions: [
      'ess.view',
      'documents.view',
    ],
    description: 'Limited self-service access',
  },
  {
    role: 'viewer',
    permissions: [
      'employees.view',
      'reports.view',
    ],
    description: 'Read-only access',
  },
];
