import type { PayrollRun, Payslip } from '@/shared/types/payroll';

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: '1',
    period: '2025-01',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'processing',
    totalGrossPay: 250000,
    totalDeductions: 50000,
    totalNetPay: 200000,
    employeeCount: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPayslips: Payslip[] = [
  {
    id: '1',
    payrollRunId: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    period: '2025-01',
    baseSalary: 8000,
    allowances: [
      { id: '1', name: 'Housing Allowance', type: 'housing', amount: 1500, isPercentage: false, isRecurring: true },
      { id: '2', name: 'Transport Allowance', type: 'transport', amount: 500, isPercentage: false, isRecurring: true },
    ],
    deductions: [
      { id: '1', name: 'Tax', type: 'tax', amount: 1200, isPercentage: false, isRecurring: true },
      { id: '2', name: 'Insurance', type: 'insurance', amount: 300, isPercentage: false, isRecurring: true },
    ],
    grossPay: 10000,
    netPay: 8500,
    workDays: 22,
    overtimeHours: 5,
    leaveDays: 0,
    status: 'processing',
    generatedAt: new Date().toISOString(),
  },
];
