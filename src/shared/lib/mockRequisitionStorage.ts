import type { JobRequisition } from '@/shared/types/requisition';

const STORAGE_KEY = 'hrm8_requisitions';

const mockRequisitions: JobRequisition[] = [
  {
    id: 'req-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    requestedBy: 'user-001',
    requestedByName: 'John Manager',
    numberOfPositions: 2,
    employmentType: 'full-time',
    location: 'Remote',
    justification: 'Need to expand the engineering team to support new product initiatives',
    budgetCode: 'ENG-2024-Q1',
    estimatedSalary: { min: 120000, max: 150000, currency: 'USD' },
    status: 'approved',
    priority: 'high',
    requestDate: new Date('2024-01-15').toISOString(),
    targetStartDate: new Date('2024-03-01').toISOString(),
    approvalWorkflow: [
      {
        id: 'step-1',
        approverId: 'manager-001',
        approverName: 'HR Manager',
        approverRole: 'HR Manager',
        status: 'approved',
        comments: 'Approved. Budget allocated.',
        approvedAt: new Date('2024-01-16').toISOString(),
        order: 1,
      },
      {
        id: 'step-2',
        approverId: 'cfo-001',
        approverName: 'CFO',
        approverRole: 'CFO',
        status: 'approved',
        approvedAt: new Date('2024-01-17').toISOString(),
        order: 2,
      },
    ],
    jobId: 'job-001',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-17').toISOString(),
  },
];

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRequisitions));
  }
}

export function getRequisitions(): JobRequisition[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getRequisitionById(id: string): JobRequisition | undefined {
  return getRequisitions().find(r => r.id === id);
}

export function saveRequisition(requisition: JobRequisition): void {
  const requisitions = getRequisitions();
  requisitions.push(requisition);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requisitions));
}

export function updateRequisition(id: string, updates: Partial<JobRequisition>): void {
  const requisitions = getRequisitions();
  const index = requisitions.findIndex(r => r.id === id);
  if (index !== -1) {
    requisitions[index] = { ...requisitions[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requisitions));
  }
}

export function deleteRequisition(id: string): void {
  const requisitions = getRequisitions();
  const filtered = requisitions.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
