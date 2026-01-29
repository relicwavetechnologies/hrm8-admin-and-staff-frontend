import type { Expense, ExpenseReport, ExpenseStats, ExpensePolicy } from '@/shared/types/expense';
import { mockExpenses, mockExpensePolicies } from '@/shared/data/mockExpenseData';

const EXPENSES_KEY = 'expenses';
const REPORTS_KEY = 'expense_reports';
const POLICIES_KEY = 'expense_policies';

function initializeData() {
  if (!localStorage.getItem(EXPENSES_KEY)) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(mockExpenses));
  }
  if (!localStorage.getItem(POLICIES_KEY)) {
    localStorage.setItem(POLICIES_KEY, JSON.stringify(mockExpensePolicies));
  }
}

export function getExpenses(): Expense[] {
  initializeData();
  const stored = localStorage.getItem(EXPENSES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return newExpense;
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  expenses[index] = {
    ...expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return expenses[index];
}

export function getExpenseReports(): ExpenseReport[] {
  const stored = localStorage.getItem(REPORTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveExpenseReport(report: Omit<ExpenseReport, 'id'>): ExpenseReport {
  const reports = getExpenseReports();
  const newReport: ExpenseReport = {
    ...report,
    
  };
  reports.push(newReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  return newReport;
}

export function getExpensePolicies(): ExpensePolicy[] {
  initializeData();
  const stored = localStorage.getItem(POLICIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function calculateExpenseStats(): ExpenseStats {
  const expenses = getExpenses();
  
  return {
    totalExpenses: expenses.length,
    pendingAmount: expenses.filter(e => e.status === 'submitted').reduce((sum, e) => sum + e.amount, 0),
    approvedAmount: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    reimbursedAmount: expenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0),
    rejectedAmount: expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0),
  };
}
