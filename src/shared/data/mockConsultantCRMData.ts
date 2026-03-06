import type { CRMActivity, CRMNote, CRMTask } from '@/shared/types/consultantCRM';

const CONSULTANT_CRM_STORAGE_KEY = 'consultant_crm_data';
const CONSULTANT_NOTES_STORAGE_KEY = 'consultant_notes';
const CONSULTANT_TASKS_STORAGE_KEY = 'consultant_tasks';

export const mockConsultantActivities: CRMActivity[] = [
  {
    id: 'activity_c1',
    consultantId: 'consultant_1',
    type: 'placement',
    title: 'Placement Completed',
    description: 'Senior Developer at TechCorp',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    relatedEntityType: 'job',
    relatedEntityId: 'job_1',
    performedBy: 'system',
  },
  {
    id: 'activity_c2',
    consultantId: 'consultant_1',
    type: 'meeting',
    title: 'Client Meeting',
    description: 'Quarterly review with Acme Corporation',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    relatedEntityType: 'employer',
    relatedEntityId: 'employer_1',
    performedBy: 'consultant_1',
  },
  {
    id: 'activity_c3',
    consultantId: 'consultant_1',
    type: 'commission',
    title: 'Commission Earned',
    description: '$5,200 commission approved',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    performedBy: 'system',
  },
];

export const mockConsultantNotes: CRMNote[] = [
  {
    id: 'note_c1',
    consultantId: 'consultant_1',
    content: 'Great performance this quarter. Exceeded placement targets by 20%.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'manager_1',
    createdByName: 'Sarah Johnson',
    isPinned: true,
  },
  {
    id: 'note_c2',
    consultantId: 'consultant_1',
    content: 'Needs additional training on new CRM system.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'manager_1',
    createdByName: 'Sarah Johnson',
    isPinned: false,
  },
];

export const mockConsultantTasks: CRMTask[] = [
  {
    id: 'task_c1',
    consultantId: 'consultant_1',
    title: 'Complete Q1 Performance Review',
    description: 'Review all placements and prepare quarterly report',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'consultant_1',
    assignedBy: 'manager_1',
  },
  {
    id: 'task_c2',
    consultantId: 'consultant_1',
    title: 'Follow up with TechCorp',
    description: 'Check in on recent placement satisfaction',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'consultant_1',
    assignedBy: 'consultant_1',
  },
];

export function initializeMockConsultantCRMData() {
  if (!localStorage.getItem(CONSULTANT_CRM_STORAGE_KEY)) {
    localStorage.setItem(CONSULTANT_CRM_STORAGE_KEY, JSON.stringify(mockConsultantActivities));
  }
  if (!localStorage.getItem(CONSULTANT_NOTES_STORAGE_KEY)) {
    localStorage.setItem(CONSULTANT_NOTES_STORAGE_KEY, JSON.stringify(mockConsultantNotes));
  }
  if (!localStorage.getItem(CONSULTANT_TASKS_STORAGE_KEY)) {
    localStorage.setItem(CONSULTANT_TASKS_STORAGE_KEY, JSON.stringify(mockConsultantTasks));
  }
}
