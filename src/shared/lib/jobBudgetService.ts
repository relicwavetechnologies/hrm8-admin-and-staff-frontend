

export interface BudgetTransaction {
  id: string;
  jobId: string;
  date: string;
  type: 'promotion' | 'service_fee' | 'job_board' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
}

export interface BudgetAllocation {
  jobId: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  allocatedTo: {
    promotion: number;
    serviceFees: number;
    jobBoards: number;
    other: number;
  };
  transactions: BudgetTransaction[];
}

// Mock transactions
const mockTransactions: BudgetTransaction[] = [
  {
    id: '1',
    jobId: '1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'promotion',
    amount: 500,
    description: 'JobTarget Premium Promotion',
    status: 'completed',
    reference: 'JT-2024-001',
  },
  {
    id: '2',
    jobId: '1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'service_fee',
    amount: 299,
    description: 'Full-Service Recruitment Fee',
    status: 'completed',
    reference: 'SF-2024-001',
  },
  {
    id: '3',
    jobId: '1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'job_board',
    amount: 150,
    description: 'LinkedIn Job Board Posting',
    status: 'completed',
    reference: 'LI-2024-001',
  },
];

export function getBudgetAllocation(jobId: string): BudgetAllocation {
  const transactions = mockTransactions.filter((t) => t.jobId === jobId);
  const spent = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const allocatedTo = {
    promotion: transactions
      .filter((t) => t.type === 'promotion' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    serviceFees: transactions
      .filter((t) => t.type === 'service_fee' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    jobBoards: transactions
      .filter((t) => t.type === 'job_board' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    other: transactions
      .filter((t) => !['promotion', 'service_fee', 'job_board'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return {
    jobId,
    totalBudget: 2000,
    spent,
    remaining: 2000 - spent,
    allocatedTo,
    transactions,
  };
}

export function addBudgetTransaction(
  jobId: string,
  transaction: Omit<BudgetTransaction, 'id' | 'jobId' | 'date'>
): BudgetTransaction {
  const newTransaction: BudgetTransaction = {
    id: Date.now().toString(),
    jobId,
    date: new Date().toISOString(),
    ...transaction,
  };

  mockTransactions.push(newTransaction);
  return newTransaction;
}
