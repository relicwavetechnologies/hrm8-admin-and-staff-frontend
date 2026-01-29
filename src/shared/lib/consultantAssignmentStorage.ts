import type { ConsultantAssignment } from '@/shared/types/consultantCRM';
import { updateConsultantCapacity } from './consultantStorage';
import { createActivity } from './consultantCRMStorage';

const STORAGE_KEY = 'consultant_assignments';

export function getAllAssignments(): ConsultantAssignment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantAssignments(consultantId: string): ConsultantAssignment[] {
  const all = getAllAssignments();
  return all
    .filter(a => a.consultantId === consultantId)
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
}

export function getEntityAssignments(entityId: string, entityType: 'employer' | 'job'): ConsultantAssignment[] {
  const all = getAllAssignments();
  return all.filter(a => a.entityId === entityId && a.entityType === entityType && a.status === 'active');
}

export function addAssignment(
  assignment: Omit<ConsultantAssignment, 'id' | 'assignedAt'>
): ConsultantAssignment {
  const all = getAllAssignments();
  
  // Check if this is being set as primary
  if (assignment.isPrimary) {
    // Remove primary status from other assignments for this entity
    all.forEach(a => {
      if (a.entityId === assignment.entityId && 
          a.entityType === assignment.entityType && 
          a.isPrimary &&
          a.status === 'active') {
        a.isPrimary = false;
      }
    });
  }
  
  const newAssignment: ConsultantAssignment = {
    ...assignment,
    id: `assignment_${Date.now()}`,
    assignedAt: new Date().toISOString(),
  };
  
  all.push(newAssignment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Update consultant capacity
  updateConsultantCapacity(
    assignment.consultantId,
    assignment.entityType === 'employer' ? 'employers' : 'jobs',
    1
  );
  
  // Log activity
  createActivity(
    assignment.consultantId,
    'assignment-added',
    `Assigned to ${assignment.entityType}: ${assignment.entityName}`,
    { role: assignment.role, isPrimary: assignment.isPrimary }
  );
  
  return newAssignment;
}

export function updateAssignment(
  id: string,
  updates: Partial<ConsultantAssignment>
): ConsultantAssignment | null {
  const all = getAllAssignments();
  const index = all.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  // If setting as primary, remove primary from others
  if (updates.isPrimary) {
    all.forEach((a, i) => {
      if (i !== index &&
          a.entityId === all[index].entityId &&
          a.entityType === all[index].entityType &&
          a.isPrimary &&
          a.status === 'active') {
        a.isPrimary = false;
      }
    });
  }
  
  all[index] = { ...all[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  return all[index];
}

export function completeAssignment(id: string): boolean {
  const assignment = updateAssignment(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
  
  if (!assignment) return false;
  
  // Update consultant capacity
  updateConsultantCapacity(
    assignment.consultantId,
    assignment.entityType === 'employer' ? 'employers' : 'jobs',
    -1
  );
  
  createActivity(
    assignment.consultantId,
    'assignment-removed',
    `Assignment completed: ${assignment.entityName}`,
    { entityType: assignment.entityType }
  );
  
  return true;
}

export function cancelAssignment(id: string): boolean {
  const assignment = updateAssignment(id, { status: 'cancelled' });
  
  if (!assignment) return false;
  
  // Update consultant capacity
  updateConsultantCapacity(
    assignment.consultantId,
    assignment.entityType === 'employer' ? 'employers' : 'jobs',
    -1
  );
  
  createActivity(
    assignment.consultantId,
    'assignment-removed',
    `Assignment cancelled: ${assignment.entityName}`,
    { entityType: assignment.entityType }
  );
  
  return true;
}

export function setPrimaryAssignment(
  assignmentId: string,
  entityId: string,
  entityType: 'employer' | 'job'
): boolean {
  const all = getAllAssignments();
  
  // Remove primary from all assignments for this entity
  all.forEach(a => {
    if (a.entityId === entityId && a.entityType === entityType) {
      a.isPrimary = a.id === assignmentId;
    }
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return true;
}

export function getActiveAssignmentsByType(
  consultantId: string,
  entityType: 'employer' | 'job'
): ConsultantAssignment[] {
  const all = getAllAssignments();
  return all.filter(
    a => a.consultantId === consultantId && 
         a.entityType === entityType && 
         a.status === 'active'
  );
}

export function hasCapacity(
  consultantId: string,
  entityType: 'employer' | 'job'
): boolean {
  const active = getActiveAssignmentsByType(consultantId, entityType);
  // For now, we'll just check the count - in a real app, compare with max limits from consultant record
  return true; // Simplified - should check against consultant.maxEmployers/maxJobs
}
