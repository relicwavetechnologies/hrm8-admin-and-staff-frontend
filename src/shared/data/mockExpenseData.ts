import type { Expense, ExpensePolicy } from '@/shared/types/expense';

export const mockExpenses: Expense[] = [
  {
    id: '1',
    employeeId: 'current-user',
    employeeName: 'Current User',
    category: 'travel',
    amount: 450,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    merchant: 'Delta Airlines',
    description: 'Flight to client meeting',
    status: 'submitted',
    approvalWorkflow: [
      {
        id: 'a1',
        expenseId: '1',
        level: 1,
        approverId: 'mgr1',
        approverName: 'Manager Smith',
        status: 'pending',
      },
    ],
    currentApprovalLevel: 1,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    category: 'meals',
    amount: 85,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    merchant: 'Restaurant XYZ',
    description: 'Client dinner',
    status: 'submitted',
    approvalWorkflow: [
      {
        id: 'a2',
        expenseId: '2',
        level: 1,
        approverId: 'current-user',
        approverName: 'Current User',
        status: 'pending',
      },
    ],
    currentApprovalLevel: 1,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockExpensePolicies: ExpensePolicy[] = [
  {
    id: '1',
    category: 'travel',
    maxAmount: 2000,
    requiresReceipt: true,
    requiresApproval: true,
    description: 'Business travel expenses including flights and accommodation',
  },
  {
    id: '2',
    category: 'meals',
    maxAmount: 100,
    requiresReceipt: true,
    requiresApproval: true,
    description: 'Business meals and entertainment',
  },
];
