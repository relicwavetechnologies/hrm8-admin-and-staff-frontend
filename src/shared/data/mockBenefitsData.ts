import type { BenefitPlan, BenefitEnrollment } from '@/shared/types/benefits';

export const mockBenefitPlans: BenefitPlan[] = [
  {
    id: '1',
    name: 'Premium Health Insurance',
    type: 'health',
    provider: 'HealthCare Plus',
    description: 'Comprehensive health coverage with dental and vision',
    coverageLevels: ['employee', 'employee-spouse', 'family'],
    employeeCost: 250,
    employerCost: 500,
    isActive: true,
    effectiveDate: '2025-01-01',
    requiresEvidence: false,
    waitingPeriodDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '401(k) Retirement Plan',
    type: 'retirement',
    provider: 'Fidelity Investments',
    description: 'Employer matching up to 6% of salary',
    coverageLevels: ['employee'],
    employeeCost: 0,
    employerCost: 0,
    isActive: true,
    effectiveDate: '2025-01-01',
    requiresEvidence: false,
    waitingPeriodDays: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockBenefitEnrollments: BenefitEnrollment[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    benefitPlanId: '1',
    benefitPlanName: 'Premium Health Insurance',
    coverageLevel: 'family',
    status: 'enrolled',
    effectiveDate: '2025-01-01',
    employeeCost: 250,
    employerCost: 500,
    dependents: [
      {
        id: 'd1',
        firstName: 'Jane',
        lastName: 'Doe',
        relationship: 'spouse',
        dateOfBirth: '1990-05-15',
      },
    ],
    enrolledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
