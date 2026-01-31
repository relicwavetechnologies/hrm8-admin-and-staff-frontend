import type { BenefitPlan, BenefitEnrollment, BenefitsStats } from '@/shared/types/benefits';
import { mockBenefitPlans, mockBenefitEnrollments } from '@/shared/data/mockBenefitsData';

const PLANS_KEY = 'benefit_plans';
const ENROLLMENTS_KEY = 'benefit_enrollments';

function initializeData() {
  if (!localStorage.getItem(PLANS_KEY)) {
    localStorage.setItem(PLANS_KEY, JSON.stringify(mockBenefitPlans));
  }
  if (!localStorage.getItem(ENROLLMENTS_KEY)) {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(mockBenefitEnrollments));
  }
}

export function getBenefitPlans(): BenefitPlan[] {
  initializeData();
  const stored = localStorage.getItem(PLANS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveBenefitPlan(plan: Omit<BenefitPlan, 'id' | 'createdAt' | 'updatedAt'>): BenefitPlan {
  const plans = getBenefitPlans();
  const newPlan: BenefitPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  return newPlan;
}

export function getBenefitEnrollments(): BenefitEnrollment[] {
  initializeData();
  const stored = localStorage.getItem(ENROLLMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveBenefitEnrollment(enrollment: Omit<BenefitEnrollment, 'id' | 'enrolledAt' | 'updatedAt'>): BenefitEnrollment {
  const enrollments = getBenefitEnrollments();
  const newEnrollment: BenefitEnrollment = {
    ...enrollment,
    id: `enroll-${Date.now()}`,
    enrolledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  enrollments.push(newEnrollment);
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
  return newEnrollment;
}

export function updateBenefitEnrollment(id: string, updates: Partial<BenefitEnrollment>): BenefitEnrollment | null {
  const enrollments = getBenefitEnrollments();
  const index = enrollments.findIndex(e => e.id === id);
  if (index === -1) return null;

  enrollments[index] = {
    ...enrollments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
  return enrollments[index];
}

export function calculateBenefitsStats(): BenefitsStats {
  const plans = getBenefitPlans();
  const enrollments = getBenefitEnrollments();

  const totalPlans = plans.length;
  const totalEnrolled = enrollments.filter(e => e.status === 'enrolled').length;
  const employeeCost = enrollments.reduce((sum, e) => sum + e.employeeCost, 0);
  const employerCost = enrollments.reduce((sum, e) => sum + e.employerCost, 0);

  return {
    totalPlans,
    totalEnrolled,
    enrollmentRate: 0, // Would need employee count to calculate
    totalCost: employeeCost + employerCost,
    employeeCost,
    employerCost,
  };
}
