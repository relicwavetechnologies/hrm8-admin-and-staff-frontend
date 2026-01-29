export type SalesRole = 'sales-rep' | 'account-manager' | 'sales-manager' | 'sales-director';
export type SalesType = 'inside-sales' | 'outside-sales' | 'enterprise-sales' | 'smb-sales';
export type SalesAgentStatus = 'active' | 'on-leave' | 'inactive' | 'suspended';
export type QuotaPeriod = 'monthly' | 'quarterly' | 'annual';

export interface SalesAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  
  // Sales-Specific
  salesRole: SalesRole;
  salesType: SalesType;
  status: SalesAgentStatus;
  
  // Territory & Assignments
  territoryIds: string[];
  assignedEmployers: string[]; // Employer IDs
  quotaAmount: number; // Annual/Monthly quota
  quotaPeriod: QuotaPeriod;
  
  // Performance Metrics
  currentRevenue: number;
  closedDeals: number;
  activeOpportunities: number;
  conversionRate: number; // Percentage
  averageDealSize: number;
  
  // Commission
  commissionStructure: 'percentage' | 'flat' | 'tiered';
  defaultCommissionRate: number;
  totalCommissionsEarned: number;
  pendingCommissions: number;
  
  // Metadata
  hireDate: string;
  reportingTo?: string;
  reportingToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesMetrics {
  closedDeals: number;
  totalSalesRevenue: number;
  activeOpportunities: number;
  averageDealSize: number;
  quotaAttainment: number; // Percentage
}

export interface RecruitmentMetrics {
  totalPlacements: number;
  totalRevenue: number;
  successRate: number;
  averageDaysToFill: number;
}
