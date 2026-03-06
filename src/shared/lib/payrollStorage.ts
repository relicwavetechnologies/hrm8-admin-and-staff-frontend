import type { PayrollRun, Payslip, PayrollStats } from '@/shared/types/payroll';
import { mockPayrollRuns, mockPayslips } from '@/shared/data/mockPayrollData';

const PAYROLL_RUNS_KEY = 'payroll_runs';
const PAYSLIPS_KEY = 'payslips';

function initializeData() {
  if (!localStorage.getItem(PAYROLL_RUNS_KEY)) {
    localStorage.setItem(PAYROLL_RUNS_KEY, JSON.stringify(mockPayrollRuns));
  }
  if (!localStorage.getItem(PAYSLIPS_KEY)) {
    localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(mockPayslips));
  }
}

export function getPayrollRuns(): PayrollRun[] {
  initializeData();
  const stored = localStorage.getItem(PAYROLL_RUNS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePayrollRun(run: Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt'>): PayrollRun {
  const runs = getPayrollRuns();
  const newRun: PayrollRun = {
    ...run,
    id: `run-${Date.now()}`,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  runs.push(newRun);
  localStorage.setItem(PAYROLL_RUNS_KEY, JSON.stringify(runs));
  return newRun;
}

export function updatePayrollRun(id: string, updates: Partial<PayrollRun>): PayrollRun | null {
  const runs = getPayrollRuns();
  const index = runs.findIndex(r => r.id === id);
  if (index === -1) return null;

  runs[index] = {
    ...runs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PAYROLL_RUNS_KEY, JSON.stringify(runs));
  return runs[index];
}

export function getPayslips(): Payslip[] {
  initializeData();
  const stored = localStorage.getItem(PAYSLIPS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePayslip(payslip: Omit<Payslip, 'id' | 'generatedAt'>): Payslip {
  const payslips = getPayslips();
  const newPayslip: Payslip = {
    ...payslip,
    id: `payslip-${Date.now()}`,

    generatedAt: new Date().toISOString(),
  };
  payslips.push(newPayslip);
  localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(payslips));
  return newPayslip;
}

export function calculatePayrollStats(): PayrollStats {
  const payslips = getPayslips();
  const runs = getPayrollRuns();

  const totalPayrollBudget = runs.reduce((sum, r) => sum + r.totalNetPay, 0);
  const monthlyAverage = runs.length > 0 ? totalPayrollBudget / runs.length : 0;

  const salaries = payslips.map(p => p.netPay);
  const highestPaid = salaries.length > 0 ? Math.max(...salaries) : 0;
  const lowestPaid = salaries.length > 0 ? Math.min(...salaries) : 0;
  const averageSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;

  return {
    totalPayrollBudget,
    monthlyAverage,
    yearToDateTotal: totalPayrollBudget,
    highestPaid,
    lowestPaid,
    averageSalary,
  };
}
