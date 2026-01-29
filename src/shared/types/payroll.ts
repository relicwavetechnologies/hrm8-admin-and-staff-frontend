export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'cancelled';
export type DeductionType = 'tax' | 'insurance' | 'loan' | 'advance' | 'other';
export type AllowanceType = 'housing' | 'transport' | 'meal' | 'bonus' | 'commission' | 'other';

export interface SalaryComponent {
  id: string;
  name: string;
  type: DeductionType | AllowanceType;
  amount: number;
  isPercentage: boolean;
  isRecurring: boolean;
}

export interface PayrollRun {
  id: string;
  period: string; // YYYY-MM format
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossPay: number;
  netPay: number;
  workDays: number;
  overtimeHours: number;
  leaveDays: number;
  status: PayrollStatus;
  generatedAt: string;
  paidAt?: string;
}

export interface PayrollStats {
  totalPayrollBudget: number;
  monthlyAverage: number;
  yearToDateTotal: number;
  highestPaid: number;
  lowestPaid: number;
  averageSalary: number;
}
