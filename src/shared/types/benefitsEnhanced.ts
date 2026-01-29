// Enhanced Benefits Administration Types

export type EnrollmentType = 'open' | 'new-hire' | 'life-event';
export type EnrollmentStatus = 'upcoming' | 'active' | 'closed';
export type LifeEventType = 
  | 'marriage' 
  | 'birth' 
  | 'adoption' 
  | 'divorce' 
  | 'death' 
  | 'loss-of-coverage';

export interface EnrollmentPeriod {
  id: string;
  name: string;
  type: EnrollmentType;
  startDate: string;
  endDate: string;
  effectiveDate: string;
  eligiblePlans: string[];
  notifications: EnrollmentNotification[];
  status: EnrollmentStatus;
  createdAt: string;
}

export interface EnrollmentNotification {
  id: string;
  type: 'email' | 'push' | 'sms';
  triggerDays: number; // days before enrollment
  sent: boolean;
  sentAt?: string;
}

export type ConditionOperator = 'equals' | 'greater_than' | 'less_than' | 'in';

export interface EligibilityCondition {
  id: string;
  field: 'tenure' | 'employment_type' | 'hours_per_week' | 'department' | 'location';
  operator: ConditionOperator;
  value: string | number | string[];
  description: string;
}

export interface EligibilityRule {
  id: string;
  planId: string;
  planName: string;
  conditions: EligibilityCondition[];
  waitingPeriodDays?: number;
  allConditionsMustMatch: boolean; // AND vs OR logic
}

export interface LifeEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  eventType: LifeEventType;
  eventDate: string;
  reportedDate: string;
  specialEnrollmentPeriod: number; // days
  documentationRequired: boolean;
  documentationReceived: boolean;
  documentUrls?: string[];
  processed: boolean;
  processedBy?: string;
  processedAt?: string;
  notes?: string;
}

export type CoverageTier = 'employee' | 'employee-spouse' | 'employee-children' | 'family';

export interface BenefitsCostBreakdown {
  planId: string;
  planName: string;
  tier: CoverageTier;
  employeeContribution: number;
  employerContribution: number;
  totalCost: number;
  frequency: 'monthly' | 'per-paycheck' | 'annual';
}

export interface DependentVerification {
  id: string;
  dependentId: string;
  employeeId: string;
  verificationType: 'birth-certificate' | 'marriage-certificate' | 'tax-return' | 'court-order';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  documentUrls: string[];
  notes?: string;
}

export interface COBRAEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  qualifyingEvent: 'termination' | 'reduction-hours' | 'death' | 'divorce' | 'medicare-eligible';
  eventDate: string;
  coverageEndDate: string;
  cobraStartDate: string;
  cobraEndDate: string;
  notificationSent: boolean;
  notificationDate?: string;
  elected: boolean;
  electionDate?: string;
  premiumAmount: number;
  status: 'pending' | 'active' | 'expired' | 'terminated';
}

export interface BenefitsComparison {
  employeeId: string;
  plans: Array<{
    planId: string;
    planName: string;
    category: string;
    monthlyCost: number;
    coverage: string[];
    deductible?: number;
    outOfPocketMax?: number;
    recommended: boolean;
  }>;
}
