import { EmployerActivity, EmployerNote, EmployerTask } from "@/shared/types/employerCRM";
import { mockEmployers } from "./mockTableData";

const activityTypes = [
  'account-created', 'account-updated', 'job-posted', 
  'subscription-changed', 'invoice-paid', 'note-added'
];

const noteCategories = ['general', 'meeting', 'call', 'email', 'issue'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const taskStatuses = ['pending', 'in-progress', 'completed'];

export const mockActivities: EmployerActivity[] = mockEmployers.flatMap(employer => {
  const count = Math.floor(Math.random() * 6) + 5;
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `activity_${employer.id}_${i}`,
      employerId: employer.id,
      type: activityTypes[Math.floor(Math.random() * activityTypes.length)] as any,
      title: `Activity ${i + 1} for ${employer.name}`,
      description: `Sample activity description for tracking purposes`,
      userId: `user_${Math.floor(Math.random() * 5)}`,
      userName: `Admin User ${Math.floor(Math.random() * 5) + 1}`,
      createdAt: date.toISOString(),
    };
  });
});

export const mockNotes: EmployerNote[] = mockEmployers.flatMap(employer => {
  const count = Math.floor(Math.random() * 4) + 2;
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 20);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `note_${employer.id}_${i}`,
      employerId: employer.id,
      authorId: `user_${Math.floor(Math.random() * 5)}`,
      authorName: `Admin User ${Math.floor(Math.random() * 5) + 1}`,
      category: noteCategories[Math.floor(Math.random() * noteCategories.length)] as any,
      content: `This is a sample note about ${employer.name}. It contains important information about their account status and engagement.`,
      isPrivate: Math.random() > 0.7,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
  });
});

export const mockTasks: EmployerTask[] = mockEmployers.flatMap(employer => {
  const count = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: count }, (_, i) => {
    const daysFromNow = Math.floor(Math.random() * 14) - 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    
    const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)] as any;
    
    return {
      id: `task_${employer.id}_${i}`,
      employerId: employer.id,
      title: `Follow up with ${employer.name}`,
      description: `Task description for ${employer.name}`,
      dueDate: dueDate.toISOString(),
      priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
      status,
      assignedTo: `user_${Math.floor(Math.random() * 5)}`,
      assignedToName: `Admin User ${Math.floor(Math.random() * 5) + 1}`,
      createdBy: `user_0`,
      createdByName: `System Admin`,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    };
  });
});

export function initializeMockCRMData() {
  if (!localStorage.getItem('employer_activities')) {
    localStorage.setItem('employer_activities', JSON.stringify(mockActivities));
  }
  if (!localStorage.getItem('employer_notes')) {
    localStorage.setItem('employer_notes', JSON.stringify(mockNotes));
  }
  if (!localStorage.getItem('employer_tasks')) {
    localStorage.setItem('employer_tasks', JSON.stringify(mockTasks));
  }
}
