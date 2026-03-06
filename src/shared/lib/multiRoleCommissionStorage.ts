import type { TransactionCommission, CommissionRole } from '@/shared/types/commissionRole';
import type { CommissionRule } from '@/shared/types/commissionRule';
import { COMMISSION_RULE_TEMPLATES } from '@/shared/types/commissionRule';

const TRANSACTION_COMMISSIONS_KEY = 'transaction_commissions';
const COMMISSION_ROLES_KEY = 'commission_roles';
const COMMISSION_RULES_KEY = 'commission_rules';

// ============= Transaction Commissions =============

export function getAllTransactionCommissions(): TransactionCommission[] {
  const stored = localStorage.getItem(TRANSACTION_COMMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getTransactionCommissionById(id: string): TransactionCommission | undefined {
  return getAllTransactionCommissions().find(tc => tc.id === id);
}

export function getTransactionCommissionsByConsultant(consultantId: string): TransactionCommission[] {
  return getAllTransactionCommissions()
    .filter(tc => tc.roleAssignments.some(ra => ra.consultantId === consultantId))
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export function getTransactionCommissionsByEmployer(employerId: string): TransactionCommission[] {
  return getAllTransactionCommissions()
    .filter(tc => tc.employerId === employerId)
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export function createTransactionCommission(
  data: Omit<TransactionCommission, 'id' | 'createdAt' | 'updatedAt'>
): TransactionCommission {
  const all = getAllTransactionCommissions();

  const newCommission: TransactionCommission = {
    ...data,
    id: `txn_comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newCommission);
  localStorage.setItem(TRANSACTION_COMMISSIONS_KEY, JSON.stringify(all));

  return newCommission;
}

export function updateTransactionCommission(
  id: string,
  updates: Partial<TransactionCommission>
): TransactionCommission | null {
  const all = getAllTransactionCommissions();
  const index = all.findIndex(tc => tc.id === id);

  if (index === -1) return null;



  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(TRANSACTION_COMMISSIONS_KEY, JSON.stringify(all));

  return all[index];
}

export function approveTransactionCommission(
  id: string,
  approvedBy: string
): boolean {
  const commission = getTransactionCommissionById(id);
  if (!commission) return false;

  const updated = updateTransactionCommission(id, {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
    // Update all role assignments to approved
    roleAssignments: commission.roleAssignments.map(ra => ({
      ...ra,
      status: 'approved' as const
    }))
  });

  return updated !== null;
}

export function markTransactionCommissionPaid(
  id: string,

): boolean {
  const commission = getTransactionCommissionById(id);
  if (!commission) return false;

  const updated = updateTransactionCommission(id, {
    status: 'paid',
    // Update all role assignments to paid
    roleAssignments: commission.roleAssignments.map(ra => ({
      ...ra,
      status: 'paid' as const
    }))
  });

  return updated !== null;
}

export function deleteTransactionCommission(id: string): boolean {
  const all = getAllTransactionCommissions();
  const filtered = all.filter(tc => tc.id !== id);

  if (filtered.length === all.length) return false;

  localStorage.setItem(TRANSACTION_COMMISSIONS_KEY, JSON.stringify(filtered));

  return true;
}

// ============= Commission Roles =============

export function getAllCommissionRoles(): CommissionRole[] {
  const stored = localStorage.getItem(COMMISSION_ROLES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default roles
  const defaults = getDefaultCommissionRoles();
  localStorage.setItem(COMMISSION_ROLES_KEY, JSON.stringify(defaults));
  return defaults;
}

function getDefaultCommissionRoles(): CommissionRole[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'role_sales',
      name: 'Sales Agent',
      type: 'sales-agent',
      description: 'Responsible for closing deals and new customer acquisition',
      defaultRate: 30,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'role_recruiter',
      name: 'Recruiter',
      type: 'recruiter',
      description: 'Delivers recruitment services and placements',
      defaultRate: 50,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'role_account_mgr',
      name: 'Account Manager',
      type: 'account-manager',
      description: 'Manages ongoing client relationships',
      defaultRate: 10,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'role_team_lead',
      name: 'Team Lead',
      type: 'team-lead',
      description: 'Oversees team performance and strategy',
      defaultRate: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'role_sourcing',
      name: 'Sourcing Specialist',
      type: 'sourcing-specialist',
      description: 'Specializes in candidate sourcing and pipeline building',
      defaultRate: 15,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
  ];
}

export function getCommissionRoleById(id: string): CommissionRole | undefined {
  return getAllCommissionRoles().find(r => r.id === id);
}

export function getActiveCommissionRoles(): CommissionRole[] {
  return getAllCommissionRoles().filter(r => r.isActive);
}

export function createCommissionRole(
  data: Omit<CommissionRole, 'id' | 'createdAt' | 'updatedAt'>
): CommissionRole {
  const all = getAllCommissionRoles();

  const newRole: CommissionRole = {
    ...data,
    id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newRole);
  localStorage.setItem(COMMISSION_ROLES_KEY, JSON.stringify(all));

  return newRole;
}

export function updateCommissionRole(
  id: string,
  updates: Partial<CommissionRole>
): CommissionRole | null {
  const all = getAllCommissionRoles();
  const index = all.findIndex(r => r.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COMMISSION_ROLES_KEY, JSON.stringify(all));
  return all[index];
}

// ============= Commission Rules =============

export function getAllCommissionRules(): CommissionRule[] {
  const stored = localStorage.getItem(COMMISSION_RULES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default rules from templates
  const defaults = initializeDefaultRules();
  localStorage.setItem(COMMISSION_RULES_KEY, JSON.stringify(defaults));
  return defaults;
}

function initializeDefaultRules(): CommissionRule[] {
  const now = new Date().toISOString();
  const templates = Object.entries(COMMISSION_RULE_TEMPLATES);

  return templates.map(([key, template], index) => ({
    id: `rule_${key}`,
    name: template.name,
    description: `Default ${template.name.toLowerCase()}`,
    priority: 100 - (index * 10),
    conditions: [...template.conditions] as any[],
    actions: [...template.actions] as any[],
    isActive: true,
    effectiveFrom: now,
    createdAt: now,
    updatedAt: now,
  }));
}

export function getActiveCommissionRules(): CommissionRule[] {
  return getAllCommissionRules()
    .filter(r => r.isActive)
    .sort((a, b) => b.priority - a.priority);
}

export function createCommissionRule(
  data: Omit<CommissionRule, 'id' | 'createdAt' | 'updatedAt'>
): CommissionRule {
  const all = getAllCommissionRules();

  const newRule: CommissionRule = {
    ...data,
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newRule);
  localStorage.setItem(COMMISSION_RULES_KEY, JSON.stringify(all));

  return newRule;
}

export function updateCommissionRule(
  id: string,
  updates: Partial<CommissionRule>
): CommissionRule | null {
  const all = getAllCommissionRules();
  const index = all.findIndex(r => r.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COMMISSION_RULES_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteCommissionRule(id: string): boolean {
  const all = getAllCommissionRules();
  const filtered = all.filter(r => r.id !== id);

  if (filtered.length === all.length) return false;

  localStorage.setItem(COMMISSION_RULES_KEY, JSON.stringify(filtered));
  return true;
}

// ============= Statistics =============

export function getConsultantCommissionStats(consultantId: string) {
  const all = getAllTransactionCommissions();

  // Get all role assignments for this consultant
  const consultantAssignments = all.flatMap(tc =>
    tc.roleAssignments
      .filter(ra => ra.consultantId === consultantId)
      .map(ra => ({
        ...ra,
        transactionId: tc.id,
        transactionType: tc.transactionType,
        transactionDate: tc.transactionDate,
        transactionStatus: tc.status,
        transactionDescription: tc.transactionDescription,
      }))
  );

  const totalEarned = consultantAssignments.reduce((sum, a) => sum + a.commissionAmount, 0);
  const totalPending = consultantAssignments
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.commissionAmount, 0);
  const totalApproved = consultantAssignments
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + a.commissionAmount, 0);
  const totalPaid = consultantAssignments
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + a.commissionAmount, 0);

  return {
    totalTransactions: consultantAssignments.length,
    totalEarned,
    totalPending,
    totalApproved,
    totalPaid,
    byRole: groupByRole(consultantAssignments),
    byStatus: groupByStatus(consultantAssignments),
    byTransactionType: groupByTransactionType(consultantAssignments),
  };
}

function groupByRole(assignments: any[]) {
  return assignments.reduce((acc, a) => {
    if (!acc[a.roleType]) {
      acc[a.roleType] = { count: 0, total: 0, roleName: a.roleName };
    }
    acc[a.roleType].count++;
    acc[a.roleType].total += a.commissionAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number; roleName: string }>);
}

function groupByStatus(assignments: any[]) {
  return assignments.reduce((acc, a) => {
    if (!acc[a.status]) {
      acc[a.status] = { count: 0, total: 0 };
    }
    acc[a.status].count++;
    acc[a.status].total += a.commissionAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
}

function groupByTransactionType(assignments: any[]) {
  return assignments.reduce((acc, a) => {
    if (!acc[a.transactionType]) {
      acc[a.transactionType] = { count: 0, total: 0 };
    }
    acc[a.transactionType].count++;
    acc[a.transactionType].total += a.commissionAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
}
