// Workforce Planning & Analytics Types

export type PositionType = 'new' | 'replacement' | 'backfill';
export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type PositionStatus = 'planned' | 'approved' | 'requisitioned' | 'filled' | 'cancelled';

export interface PlannedPosition {
  id: string;
  jobTitle: string;
  level: string;
  department: string;
  location?: string;
  hireDate: string;
  estimatedSalary: number;
  positionType: PositionType;
  replacingEmployeeId?: string;
  replacingEmployeeName?: string;
  justification: string;
  status: PositionStatus;
  requisitionId?: string;
}

export interface HeadcountPlan {
  id: string;
  fiscalYear: number;
  quarter?: number;
  department: string;
  location?: string;
  currentHeadcount: number;
  plannedHeadcount: number;
  approvedHeadcount?: number;
  budgetAllocated: number;
  budgetUsed: number;
  positions: PlannedPosition[];
  status: PlanStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export type ScenarioParameter = 
  | 'attrition-rate' 
  | 'salary-increase' 
  | 'headcount-growth' 
  | 'benefits-cost';

export interface ScenarioAssumption {
  id: string;
  parameter: ScenarioParameter;
  value: number;
  unit: 'percentage' | 'absolute';
  description: string;
}

export interface YearProjection {
  year: number;
  headcount: number;
  totalCost: number;
  attrition: number;
  newHires: number;
  avgSalary: number;
}

export interface WorkforceScenario {
  id: string;
  name: string;
  description: string;
  baseYear: number;
  assumptions: ScenarioAssumption[];
  projections: YearProjection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkforceDemographics {
  totalEmployees: number;
  byDepartment: Record<string, number>;
  byLocation: Record<string, number>;
  byLevel: Record<string, number>;
  avgTenure: number;
  attritionRate: number;
  costPerHire: number;
  timeToFill: number;
}

export interface BudgetForecast {
  id: string;
  fiscalYear: number;
  department: string;
  salaryBudget: number;
  benefitsBudget: number;
  overheadBudget: number;
  totalBudget: number;
  actualSpent: number;
  variance: number;
  forecastedSpent: number;
}
