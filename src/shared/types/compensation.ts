export type CompensationType = 'salary' | 'hourly' | 'commission' | 'bonus';
export type ReviewCycle = 'annual' | 'semi-annual' | 'quarterly';

export interface SalaryBand {
  id: string;
  jobLevel: string;
  jobTitle: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompensationReview {
  id: string;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  proposedSalary: number;
  increasePercentage: number;
  increaseAmount: number;
  effectiveDate: string;
  reviewCycle: ReviewCycle;
  reviewYear: number;
  justification: string;
  performanceRating?: number;
  marketPosition?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BonusPlan {
  id: string;
  name: string;
  type: 'performance' | 'annual' | 'signing' | 'retention' | 'spot';
  targetAmount: number;
  eligibilityCriteria: string;
  payoutSchedule: string;
  fiscalYear: number;
  isActive: boolean;
}

export interface EquityGrant {
  id: string;
  employeeId: string;
  employeeName: string;
  grantType: 'stock-option' | 'rsu' | 'sar';
  shares: number;
  strikePrice?: number;
  grantDate: string;
  vestingStartDate: string;
  vestingSchedule: string;
  vestedShares: number;
  status: 'active' | 'fully-vested' | 'forfeited';
}

export interface CompensationStats {
  totalCompensationBudget: number;
  averageIncrease: number;
  budgetUtilization: number;
  pendingReviews: number;
  completedReviews: number;
}
