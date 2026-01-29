export type RPOTaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type RPOTaskPriority = 'high' | 'medium' | 'low';
export type RPOTaskType = 'sourcing' | 'screening' | 'interview' | 'offer' | 'admin' | 'reporting';

export interface RPOTask {
  id: string;
  contractId: string;
  contractName: string;
  title: string;
  description: string;
  assignedConsultantId: string;
  assignedConsultantName: string;
  status: RPOTaskStatus;
  priority: RPOTaskPriority;
  type: RPOTaskType;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RPOTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byType: {
    [key in RPOTaskType]: number;
  };
}
