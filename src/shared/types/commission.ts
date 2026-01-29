export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';

export type CommissionStructure = 'percentage' | 'flat' | 'tiered' | 'custom';

export interface Commission {
  id: string;
  consultantId: string;
  consultantName: string;
  
  // Related Entity
  entityType: 'placement' | 'job' | 'employer' | 'other';
  entityId?: string;
  entityName?: string;
  
  // Financial
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  
  // Status & Approval
  status: CommissionStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  // Payment
  paymentDate?: string;
  paymentReference?: string;
  paymentMethod?: 'bank-transfer' | 'check' | 'payroll' | 'other';
  
  // Dispute
  disputeReason?: string;
  disputedAt?: string;
  resolvedAt?: string;
  
  // Metadata
  description?: string;
  notes?: string;
  invoiceId?: string;
  
  // Dates
  earnedDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional Info
  splitWith?: string[]; // Other consultant IDs if commission is split
  splitPercentage?: number;
}

export interface CommissionStructureConfig {
  id: string;
  consultantId: string;
  type: CommissionStructure;
  
  // Percentage Structure
  percentage?: number;
  
  // Flat Structure
  flatAmount?: number;
  
  // Tiered Structure
  tiers?: CommissionTier[];
  
  // Custom Rules
  customRules?: CommissionRule[];
  
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CommissionTier {
  from: number;
  to?: number;
  rate: number;
  flatBonus?: number;
}

export interface CommissionRule {
  condition: string;
  rate?: number;
  flatAmount?: number;
  description: string;
}

export interface CommissionPayment {
  id: string;
  consultantId: string;
  paymentDate: string;
  amount: number;
  currency: string;
  method: 'bank-transfer' | 'check' | 'payroll' | 'other';
  reference: string;
  commissionIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes?: string;
  createdAt: string;
}
