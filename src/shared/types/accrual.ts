// Automated Time & Leave Accrual Types

export type AccrualMethod = 'annual' | 'monthly' | 'per-pay-period' | 'hours-worked';
export type AccrualFrequency = 'yearly' | 'monthly' | 'biweekly' | 'per-hour';

export interface TenureRate {
  yearsFrom: number;
  yearsTo?: number;
  accrualRate: number;
}

export interface AccrualPolicy {
  id: string;
  name: string;
  leaveTypeId: string;
  leaveTypeName: string;
  accrualMethod: AccrualMethod;
  accrualRate: number;
  accrualFrequency: AccrualFrequency;
  startDate: string;
  prorateFirstYear: boolean;
  prorateLastYear: boolean;
  maxAccrual?: number;
  carryoverAllowed: boolean;
  maxCarryover?: number;
  carryoverExpiry?: number; // days
  negativeBalanceAllowed: boolean;
  tenureBasedRates: TenureRate[];
  effectiveDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AccrualTransactionType = 
  | 'accrual' 
  | 'adjustment' 
  | 'carryover' 
  | 'expiry' 
  | 'usage';

export interface AccrualTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  policyId: string;
  policyName: string;
  transactionType: AccrualTransactionType;
  amount: number;
  balance: number;
  effectiveDate: string;
  processedAt: string;
  processedBy?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AccrualSchedule {
  id: string;
  policyId: string;
  nextRunDate: string;
  lastRunDate?: string;
  frequency: string;
  isActive: boolean;
}

export interface AccrualSimulation {
  policyId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  projectedBalance: number;
  transactions: Array<{
    date: string;
    amount: number;
    balance: number;
    type: AccrualTransactionType;
  }>;
}
