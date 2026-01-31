import { AccrualPolicy, AccrualTransaction, AccrualSchedule } from "@/shared/types/accrual";

export type { AccrualPolicy };

// Mock data
const mockPolicies: AccrualPolicy[] = [
  {
    id: 'policy-1',
    name: 'Standard PTO Accrual',
    leaveTypeId: 'pto',
    leaveTypeName: 'Paid Time Off',
    accrualMethod: 'monthly',
    accrualRate: 1.25, // days per month
    accrualFrequency: 'monthly',
    startDate: '2024-01-01',
    prorateFirstYear: true,
    prorateLastYear: true,
    maxAccrual: 30,
    carryoverAllowed: true,
    maxCarryover: 5,
    negativeBalanceAllowed: false,
    tenureBasedRates: [
      { yearsFrom: 0, yearsTo: 5, accrualRate: 1.25 },
      { yearsFrom: 5, yearsTo: 10, accrualRate: 1.67 },
      { yearsFrom: 10, accrualRate: 2.0 },
    ],
    effectiveDate: '2024-01-01',
    isActive: true,
    createdBy: 'hr-admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const policies = [...mockPolicies];
const transactions: AccrualTransaction[] = [];
const schedules: AccrualSchedule[] = [];

export function getAccrualPolicies(): AccrualPolicy[] {
  return policies.filter((p) => p.isActive);
}

export function getAccrualPolicy(id: string): AccrualPolicy | undefined {
  return policies.find((p) => p.id === id);
}

export function createAccrualPolicy(policy: Omit<AccrualPolicy, 'id' | 'createdAt' | 'updatedAt'>): AccrualPolicy {
  const newPolicy: AccrualPolicy = {
    ...policy,
    id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  policies.push(newPolicy);
  return newPolicy;
}

export function updateAccrualPolicy(id: string, updates: Partial<AccrualPolicy>): AccrualPolicy | null {
  const index = policies.findIndex((p) => p.id === id);
  if (index === -1) return null;

  policies[index] = {
    ...policies[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return policies[index];
}

export function getAccrualTransactions(filters?: {
  employeeId?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}): AccrualTransaction[] {
  let filtered = transactions;

  if (filters?.employeeId) {
    filtered = filtered.filter((t) => t.employeeId === filters.employeeId);
  }
  if (filters?.leaveTypeId) {
    filtered = filtered.filter((t) => t.leaveTypeId === filters.leaveTypeId);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((t) => new Date(t.effectiveDate) >= new Date(filters.startDate!));
  }
  if (filters?.endDate) {
    filtered = filtered.filter((t) => new Date(t.effectiveDate) <= new Date(filters.endDate!));
  }

  return filtered.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
}

export function createAccrualTransaction(
  transaction: Omit<AccrualTransaction, 'id' | 'processedAt'>
): AccrualTransaction {
  const newTransaction: AccrualTransaction = {
    ...transaction,
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    processedAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  return newTransaction;
}

export function getAccrualSchedules(): AccrualSchedule[] {
  return schedules.filter((s) => s.isActive);
}

export function processMonthlyAccruals(): number {
  // Mock processing - in production, this would calculate and create transactions
  console.log('Processing monthly accruals...');
  return policies.filter((p) => p.isActive && p.accrualFrequency === 'monthly').length;
}

export function calculateEmployeeAccrual(
  _employeeId: string,
  policyId: string,
  tenureYears: number
): number {
  const policy = getAccrualPolicy(policyId);
  if (!policy) return 0;

  // Find applicable tenure rate
  const rate = policy.tenureBasedRates.find(
    (r) => tenureYears >= r.yearsFrom && (!r.yearsTo || tenureYears < r.yearsTo)
  );

  return rate?.accrualRate || policy.accrualRate;
}

export function deleteAccrualPolicy(id: string): boolean {
  const index = policies.findIndex((p) => p.id === id);
  if (index === -1) return false;

  policies.splice(index, 1);
  return true;
}
