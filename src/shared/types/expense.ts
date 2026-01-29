export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
export type ExpenseCategory = 'travel' | 'meals' | 'accommodation' | 'transport' | 'supplies' | 'equipment' | 'training' | 'other';

export interface ExpensePolicy {
  id: string;
  category: ExpenseCategory;
  maxAmount: number;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  description: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  merchant: string;
  description: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  approvalWorkflow: ExpenseApproval[];
  currentApprovalLevel: number;
  submittedAt?: string;
  reimbursedAt?: string;
  reimbursedAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseApproval {
  id: string;
  expenseId: string;
  level: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
  notes?: string;
}

export interface ExpenseReport {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  expenses: Expense[];
  totalAmount: number;
  status: ExpenseStatus;
  submittedAt?: string;
  approvedAt?: string;
  reimbursedAt?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  pendingAmount: number;
  approvedAmount: number;
  reimbursedAmount: number;
  rejectedAmount: number;
}
