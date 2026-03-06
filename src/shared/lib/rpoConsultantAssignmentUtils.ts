import type { RPOConsultantAssignment, ServiceProject } from '@/shared/types/recruitmentService';
import { getAllServiceProjects, updateServiceProject } from './recruitmentServiceStorage';
import { getConsultantById } from './consultantStorage';
import { parseISO } from 'date-fns';

export interface ConsultantCapacityCheck {
  available: boolean;
  currentAssignments: number;
  maxCapacity: number;
  conflictingContracts: Array<{
    contractId: string;
    contractName: string;
    startDate: string;
    endDate?: string;
  }>;
}

export function assignConsultantToRPO(
  contractId: string,
  assignment: Omit<RPOConsultantAssignment, 'id'>
): ServiceProject | null {
  const allProjects = getAllServiceProjects();
  const contract = allProjects.find(p => p.id === contractId);

  if (!contract || !contract.isRPO) return null;

  const newAssignment: RPOConsultantAssignment = {
    ...assignment,
    id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  const existingAssignments = contract.rpoAssignedConsultants || [];

  return updateServiceProject(contractId, {
    rpoAssignedConsultants: [...existingAssignments, newAssignment],
    updatedAt: new Date().toISOString(),
  });
}

export function removeConsultantFromRPO(
  contractId: string,
  assignmentId: string
): ServiceProject | null {
  const allProjects = getAllServiceProjects();
  const contract = allProjects.find(p => p.id === contractId);

  if (!contract || !contract.isRPO) return null;

  const updatedAssignments = (contract.rpoAssignedConsultants || []).filter(
    a => a.id !== assignmentId
  );

  return updateServiceProject(contractId, {
    rpoAssignedConsultants: updatedAssignments,
    updatedAt: new Date().toISOString(),
  });
}

export function updateConsultantAssignment(
  contractId: string,
  assignmentId: string,
  updates: Partial<RPOConsultantAssignment>
): ServiceProject | null {
  const allProjects = getAllServiceProjects();
  const contract = allProjects.find(p => p.id === contractId);

  if (!contract || !contract.isRPO) return null;

  const updatedAssignments = (contract.rpoAssignedConsultants || []).map(a =>
    a.id === assignmentId ? { ...a, ...updates } : a
  );

  return updateServiceProject(contractId, {
    rpoAssignedConsultants: updatedAssignments,
    updatedAt: new Date().toISOString(),
  });
}

export async function checkConsultantAvailability(
  consultantId: string,
  startDate: string,
  endDate?: string
): Promise<ConsultantCapacityCheck> {
  const consultant = await getConsultantById(consultantId);

  if (!consultant) {
    return {
      available: false,
      currentAssignments: 0,
      maxCapacity: 0,
      conflictingContracts: [],
    };
  }

  const allProjects = getAllServiceProjects();
  const rpoProjects = allProjects.filter(p => p.isRPO && p.status === 'active');

  const conflictingContracts: ConsultantCapacityCheck['conflictingContracts'] = [];
  let currentActiveAssignments = 0;

  rpoProjects.forEach(project => {
    const assignments = project.rpoAssignedConsultants || [];
    const consultantAssignments = assignments.filter(
      a => a.consultantId === consultantId && a.isActive
    );

    consultantAssignments.forEach(assignment => {
      currentActiveAssignments++;

      // Check for date overlap
      const assignmentStart = parseISO(assignment.startDate);
      const assignmentEnd = assignment.endDate ? parseISO(assignment.endDate) : null;
      const newStart = parseISO(startDate);
      const newEnd = endDate ? parseISO(endDate) : null;

      // Check if dates overlap
      const hasOverlap =
        (newEnd === null || assignmentStart <= newEnd) &&
        (assignmentEnd === null || newStart <= assignmentEnd);

      if (hasOverlap) {
        conflictingContracts.push({
          contractId: project.id,
          contractName: project.name,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
        });
      }
    });
  });

  const maxCapacity = consultant.role === 'RECRUITER' ? 3 : 2;
  const available = currentActiveAssignments < maxCapacity && conflictingContracts.length === 0;

  return {
    available,
    currentAssignments: currentActiveAssignments,
    maxCapacity,
    conflictingContracts,
  };
}

export function suggestConsultants(): Array<{
  consultantId: string;
  consultantName: string;
  matchScore: number;
  monthlyRate: number;
  availability: ConsultantCapacityCheck;
}> {
  // This would implement ML-based suggestions in production
  // For now, return consultants sorted by availability
  return [];
}

export function calculateAssignmentCost(assignment: {
  monthlyRate: number;
  startDate: string;
  endDate?: string;
}): {
  monthlyRate: number;
  totalMonths: number;
  totalCost: number;
} {
  const start = parseISO(assignment.startDate);
  const end = assignment.endDate ? parseISO(assignment.endDate) : new Date();

  const months = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return {
    monthlyRate: assignment.monthlyRate,
    totalMonths: months,
    totalCost: assignment.monthlyRate * months,
  };
}
