import type { RPOTask } from '@/shared/types/rpoTask';
import { isPast } from 'date-fns';

const STORAGE_KEY = 'rpo_tasks';

export function getAllRPOTasks(): RPOTask[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTasks(tasks: RPOTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createRPOTask(task: Omit<RPOTask, 'id' | 'createdAt' | 'updatedAt'>): RPOTask {
  const tasks = getAllRPOTasks();
  const newTask: RPOTask = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateRPOTask(taskId: string, updates: Partial<RPOTask>): RPOTask | null {
  const tasks = getAllRPOTasks();
  const index = tasks.findIndex(t => t.id === taskId);

  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveTasks(tasks);
  return tasks[index];
}

export function deleteRPOTask(taskId: string): boolean {
  const tasks = getAllRPOTasks();
  const filtered = tasks.filter(t => t.id !== taskId);

  if (filtered.length === tasks.length) return false;

  saveTasks(filtered);
  return true;
}

export function getTasksByContract(contractId: string): RPOTask[] {
  return getAllRPOTasks().filter(t => t.contractId === contractId);
}

export function getTasksByConsultant(consultantId: string): RPOTask[] {
  return getAllRPOTasks().filter(t => t.assignedConsultantId === consultantId);
}

export function getTasksByStatus(status: RPOTask['status']): RPOTask[] {
  return getAllRPOTasks().filter(t => t.status === status);
}

export function getOverdueTasks(): RPOTask[] {
  // const now = new Date();
  return getAllRPOTasks().filter(
    t => t.status !== 'completed' && isPast(new Date(t.dueDate))
  );
}

export function getTaskStats(contractId?: string): {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byType: Record<string, number>;
} {
  const tasks = contractId
    ? getTasksByContract(contractId)
    : getAllRPOTasks();

  const overdueTasks = tasks.filter(
    t => t.status !== 'completed' && isPast(new Date(t.dueDate))
  );

  const byType: Record<string, number> = {
    sourcing: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    admin: 0,
    reporting: 0,
  };

  tasks.forEach(task => {
    byType[task.type] = (byType[task.type] || 0) + 1;
  });

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: overdueTasks.length,
    byType,
  };
}
