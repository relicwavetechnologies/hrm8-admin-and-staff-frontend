import { EnrollmentPeriod, EligibilityRule, LifeEvent, BenefitsCostBreakdown, COBRAEvent } from "@/shared/types/benefitsEnhanced";

export type { EnrollmentPeriod, EligibilityRule, LifeEvent, COBRAEvent };

// Mock data
const mockEnrollmentPeriods: EnrollmentPeriod[] = [
  {
    id: 'enrollment-1',
    name: 'Annual Open Enrollment 2025',
    type: 'open',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    effectiveDate: '2025-01-01',
    eligiblePlans: ['health-1', 'dental-1', 'vision-1', '401k-1'],
    notifications: [
      {
        id: 'notif-1',
        type: 'email',
        triggerDays: 14,
        sent: true,
        sentAt: '2024-10-18',
      },
      {
        id: 'notif-2',
        type: 'email',
        triggerDays: 7,
        sent: true,
        sentAt: '2024-10-25',
      },
    ],
    status: 'active',
    createdAt: '2024-10-01',
  },
];

const enrollmentPeriods = [...mockEnrollmentPeriods];
const eligibilityRules: EligibilityRule[] = [];
const lifeEvents: LifeEvent[] = [];
const cobraEvents: COBRAEvent[] = [];

export function getEnrollmentPeriods(status?: string): EnrollmentPeriod[] {
  if (status) {
    return enrollmentPeriods.filter((e) => e.status === status);
  }
  return enrollmentPeriods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function getEnrollmentPeriod(id: string): EnrollmentPeriod | undefined {
  return enrollmentPeriods.find((e) => e.id === id);
}

export function createEnrollmentPeriod(
  period: Omit<EnrollmentPeriod, 'id' | 'createdAt'>
): EnrollmentPeriod {
  const newPeriod: EnrollmentPeriod = {
    ...period,
    id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  enrollmentPeriods.push(newPeriod);
  return newPeriod;
}

export function getEligibilityRules(): EligibilityRule[] {
  return eligibilityRules;
}

export function createEligibilityRule(
  rule: Omit<EligibilityRule, 'id'>
): EligibilityRule {
  const newRule: EligibilityRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  eligibilityRules.push(newRule);
  return newRule;
}

export function getLifeEvents(filters?: {
  employeeId?: string;
  processed?: boolean;
}): LifeEvent[] {
  let filtered = lifeEvents;

  if (filters?.employeeId) {
    filtered = filtered.filter((e) => e.employeeId === filters.employeeId);
  }
  if (filters?.processed !== undefined) {
    filtered = filtered.filter((e) => e.processed === filters.processed);
  }

  return filtered.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}

export function createLifeEvent(
  event: Omit<LifeEvent, 'id' | 'reportedDate'>
): LifeEvent {
  const newEvent: LifeEvent = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reportedDate: new Date().toISOString(),
  };
  lifeEvents.push(newEvent);
  return newEvent;
}

export function updateLifeEvent(id: string, updates: Partial<LifeEvent>): LifeEvent | null {
  const index = lifeEvents.findIndex((e) => e.id === id);
  if (index === -1) return null;

  lifeEvents[index] = {
    ...lifeEvents[index],
    ...updates,
  };
  return lifeEvents[index];
}

export function getCOBRAEvents(status?: string): COBRAEvent[] {
  if (status) {
    return cobraEvents.filter((e) => e.status === status);
  }
  return cobraEvents.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}

export function createCOBRAEvent(
  event: Omit<COBRAEvent, 'id'>
): COBRAEvent {
  const newEvent: COBRAEvent = {
    ...event,
    id: `cobra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  cobraEvents.push(newEvent);
  return newEvent;
}

export function calculateBenefitsCost(planId: string, tier: string, employeeId: string): BenefitsCostBreakdown {
  // Mock cost calculation
  const tierMultipliers = {
    'employee': 1,
    'employee-spouse': 1.8,
    'employee-children': 1.6,
    'family': 2.2,
  };

  const baseCost = 450;
  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1;
  const totalCost = baseCost * multiplier;

  return {
    planId,
    planName: 'Premium Health Plan',
    tier: tier as any,
    employeeContribution: totalCost * 0.3,
    employerContribution: totalCost * 0.7,
    totalCost,
    frequency: 'monthly',
  };
}

export function checkEligibility(employeeId: string, planId: string): boolean {
  // Mock eligibility check
  return true;
}

export function updateEnrollmentPeriod(id: string, updates: Partial<EnrollmentPeriod>): EnrollmentPeriod | null {
  const index = enrollmentPeriods.findIndex((p) => p.id === id);
  if (index === -1) return null;

  enrollmentPeriods[index] = {
    ...enrollmentPeriods[index],
    ...updates,
  };
  return enrollmentPeriods[index];
}

export function deleteEnrollmentPeriod(id: string): boolean {
  const index = enrollmentPeriods.findIndex((p) => p.id === id);
  if (index === -1) return false;

  enrollmentPeriods.splice(index, 1);
  return true;
}

export function updateCOBRAEvent(id: string, updates: Partial<COBRAEvent>): COBRAEvent | null {
  const index = cobraEvents.findIndex((e) => e.id === id);
  if (index === -1) return null;

  cobraEvents[index] = {
    ...cobraEvents[index],
    ...updates,
  };
  return cobraEvents[index];
}

export function deleteCOBRAEvent(id: string): boolean {
  const index = cobraEvents.findIndex((e) => e.id === id);
  if (index === -1) return false;

  cobraEvents.splice(index, 1);
  return true;
}

export function deleteLifeEvent(id: string): boolean {
  const index = lifeEvents.findIndex((e) => e.id === id);
  if (index === -1) return false;

  lifeEvents.splice(index, 1);
  return true;
}
