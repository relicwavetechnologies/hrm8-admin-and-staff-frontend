import { CommissionStatus } from './commission';

export type CommissionRoleType = 
  | 'sales-agent'
  | 'recruiter'
  | 'account-manager'
  | 'team-lead'
  | 'sourcing-specialist'
  | 'custom';

export interface CommissionRole {
  id: string;
  name: string;
  type: CommissionRoleType;
  description?: string;
  defaultRate: number; // Default percentage
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionRoleAssignment {
  id: string;
  roleId: string;
  roleName: string;
  roleType: CommissionRoleType;
  consultantId: string;
  consultantName: string;
  percentage: number; // This role's percentage of the transaction
  commissionAmount: number; // Calculated amount
  status: CommissionStatus;
  notes?: string;
}

export interface TransactionCommission {
  id: string;
  transactionId: string;
  transactionType: 'ats-subscription' | 'hrms-addon' | 'recruitment-service' | 'rpo-service' | 'additional-service';
  transactionDescription: string;
  
  // Financial
  baseAmount: number;
  totalCommissionableAmount: number; // May differ from baseAmount
  currency: string;
  
  // Multiple role assignments
  roleAssignments: CommissionRoleAssignment[];
  totalCommissionPercentage: number; // Sum of all role percentages
  totalCommissionAmount: number; // Sum of all role commissions
  
  // Linked entity
  employerId?: string;
  employerName?: string;
  entityId?: string;
  entityName?: string;
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  
  // Dates
  transactionDate: string;
  earnedDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Metadata
  notes?: string;
  isRecurring?: boolean; // For monthly subscriptions
  recurringPeriod?: 'monthly' | 'quarterly' | 'annually';
}
