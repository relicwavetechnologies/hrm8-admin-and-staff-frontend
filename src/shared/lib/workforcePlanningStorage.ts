import { HeadcountPlan, WorkforceScenario, WorkforceDemographics, BudgetForecast } from "@/shared/types/workforcePlanning";

export type { HeadcountPlan, WorkforceScenario, WorkforceDemographics, BudgetForecast };

// Mock data
const mockPlans: HeadcountPlan[] = [
  {
    id: 'plan-1',
    fiscalYear: 2025,
    quarter: 1,
    department: 'Engineering',
    location: 'San Francisco',
    currentHeadcount: 45,
    plannedHeadcount: 55,
    approvedHeadcount: 50,
    budgetAllocated: 5000000,
    budgetUsed: 4200000,
    positions: [
      {
        id: 'pos-1',
        jobTitle: 'Senior Software Engineer',
        level: 'L5',
        department: 'Engineering',
        location: 'San Francisco',
        hireDate: '2025-02-01',
        estimatedSalary: 160000,
        positionType: 'new',
        justification: 'Expand AI/ML team capabilities',
        status: 'approved',
      },
    ],
    status: 'approved',
    createdBy: 'department-head-1',
    createdAt: '2024-11-01',
    approvedBy: 'cfo-1',
    approvedAt: '2024-11-15',
  },
];

const plans = [...mockPlans];
const scenarios: WorkforceScenario[] = [];
const forecasts: BudgetForecast[] = [];

export function getHeadcountPlans(filters?: {
  fiscalYear?: number;
  department?: string;
  status?: string;
}): HeadcountPlan[] {
  let filtered = plans;

  if (filters?.fiscalYear) {
    filtered = filtered.filter((p) => p.fiscalYear === filters.fiscalYear);
  }
  if (filters?.department) {
    filtered = filtered.filter((p) => p.department === filters.department);
  }
  if (filters?.status) {
    filtered = filtered.filter((p) => p.status === filters.status);
  }

  return filtered.sort((a, b) => b.fiscalYear - a.fiscalYear);
}

export function getHeadcountPlan(id: string): HeadcountPlan | undefined {
  return plans.find((p) => p.id === id);
}

export function createHeadcountPlan(
  plan: Omit<HeadcountPlan, 'id' | 'createdAt'>
): HeadcountPlan {
  const newPlan: HeadcountPlan = {
    ...plan,
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  return newPlan;
}

export function updateHeadcountPlan(id: string, updates: Partial<HeadcountPlan>): HeadcountPlan | null {
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return null;

  plans[index] = {
    ...plans[index],
    ...updates,
  };
  return plans[index];
}

export function getWorkforceScenarios(): WorkforceScenario[] {
  return scenarios;
}

export function createWorkforceScenario(
  scenario: Omit<WorkforceScenario, 'id' | 'createdAt' | 'updatedAt'>
): WorkforceScenario {
  const newScenario: WorkforceScenario = {
    ...scenario,
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  scenarios.push(newScenario);
  return newScenario;
}

export function getWorkforceDemographics(): WorkforceDemographics {
  // Mock demographics data
  return {
    totalEmployees: 250,
    byDepartment: {
      Engineering: 45,
      Sales: 35,
      Marketing: 20,
      Operations: 30,
      Finance: 15,
      HR: 10,
      Support: 25,
      Other: 70,
    },
    byLocation: {
      'San Francisco': 120,
      'New York': 80,
      Remote: 50,
    },
    byLevel: {
      'Entry': 80,
      'Mid': 100,
      'Senior': 50,
      'Lead': 15,
      'Executive': 5,
    },
    avgTenure: 3.2,
    attritionRate: 12.5,
    costPerHire: 4500,
    timeToFill: 42,
  };
}

export function getBudgetForecasts(fiscalYear: number): BudgetForecast[] {
  return forecasts.filter((f) => f.fiscalYear === fiscalYear);
}

export function calculateProjections(baseYear: number, _assumptions: any): any[] {
  // Mock projection calculation
  const projections = [];
  for (let year = baseYear; year <= baseYear + 4; year++) {
    projections.push({
      year,
      headcount: 250 + (year - baseYear) * 25,
      totalCost: 25000000 + (year - baseYear) * 2500000,
      attrition: 30 + (year - baseYear) * 3,
      newHires: 50 + (year - baseYear) * 5,
      avgSalary: 100000 + (year - baseYear) * 5000,
    });
  }
  return projections;
}

export function deleteHeadcountPlan(id: string): boolean {
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return false;

  plans.splice(index, 1);
  return true;
}
