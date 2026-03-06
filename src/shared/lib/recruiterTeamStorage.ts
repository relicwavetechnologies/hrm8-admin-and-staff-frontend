import { RecruiterAssignment } from "@/shared/types/teamAssignment";
import { createActivity } from "@/shared/lib/employerCRMStorage";

const STORAGE_KEY = 'employer_recruiter_assignments';

export function getEmployerRecruiters(employerId: string): RecruiterAssignment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  
  return all
    .filter((r: RecruiterAssignment) => r.employerId === employerId)
    .sort((a: RecruiterAssignment, b: RecruiterAssignment) => {
      // Primary first, then by assigned date
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });
}

export function addRecruiter(
  assignmentData: Omit<RecruiterAssignment, 'id' | 'assignedAt'>
): RecruiterAssignment {
  const stored = localStorage.getItem(STORAGE_KEY);
  const assignments = stored ? JSON.parse(stored) : [];
  
  // If setting as primary, unset existing primary for this employer
  if (assignmentData.isPrimary) {
    assignments.forEach((a: RecruiterAssignment) => {
      if (a.employerId === assignmentData.employerId && a.isPrimary) {
        a.isPrimary = false;
      }
    });
  }
  
  const newAssignment: RecruiterAssignment = {
    ...assignmentData,
    id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assignedAt: new Date(),
  };
  
  assignments.push(newAssignment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  
  // Log activity
  createActivity(
    assignmentData.employerId,
    'account-updated',
    `Recruiter assigned: ${assignmentData.recruiterName}`,
    assignmentData.specialization ? `Specialization: ${assignmentData.specialization}` : undefined
  );
  
  return newAssignment;
}

export function removeRecruiter(assignmentId: string, employerId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  const assignments = JSON.parse(stored);
  const assignment = assignments.find((a: RecruiterAssignment) => a.id === assignmentId);
  
  if (!assignment) return false;
  
  const filtered = assignments.filter((a: RecruiterAssignment) => a.id !== assignmentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  // Log activity
  createActivity(
    employerId,
    'account-updated',
    `Recruiter removed: ${assignment.recruiterName}`
  );
  
  return true;
}

export function setPrimaryRecruiter(assignmentId: string, employerId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  const assignments = JSON.parse(stored);
  
  // Unset all primary recruiters for this employer
  assignments.forEach((a: RecruiterAssignment) => {
    if (a.employerId === employerId) {
      a.isPrimary = false;
    }
  });
  
  // Set new primary
  const assignment = assignments.find((a: RecruiterAssignment) => a.id === assignmentId);
  if (!assignment) return false;
  
  assignment.isPrimary = true;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  
  // Log activity
  createActivity(
    employerId,
    'account-updated',
    `Primary recruiter set: ${assignment.recruiterName}`
  );
  
  return true;
}
