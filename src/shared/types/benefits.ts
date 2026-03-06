export type BenefitType = 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement' | 'other';
export type EnrollmentStatus = 'pending' | 'enrolled' | 'waived' | 'cancelled';
export type CoverageLevel = 'employee' | 'employee-spouse' | 'employee-children' | 'family';

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitType;
  provider: string;
  description: string;
  coverageLevels: CoverageLevel[];
  employeeCost: number;
  employerCost: number;
  isActive: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  effectiveDate: string;
  requiresEvidence: boolean;
  waitingPeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitPlanId: string;
  benefitPlanName: string;
  coverageLevel: CoverageLevel;
  status: EnrollmentStatus;
  effectiveDate: string;
  terminationDate?: string;
  employeeCost: number;
  employerCost: number;
  dependents: Dependent[];
  enrolledAt: string;
  updatedAt: string;
}

export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'other';
  dateOfBirth: string;
  ssn?: string;
}

export interface BenefitsStats {
  totalPlans: number;
  totalEnrolled: number;
  enrollmentRate: number;
  totalCost: number;
  employeeCost: number;
  employerCost: number;
}
