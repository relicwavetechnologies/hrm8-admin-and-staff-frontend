import { ERCase, ERCaseStats, InvestigationNote, ActionPlan, CaseOutcome } from "@/shared/types/employeeRelations";

export type { ERCase, ERCaseStats, InvestigationNote, ActionPlan, CaseOutcome };

// Mock data
const mockCases: ERCase[] = [];

const cases = [...mockCases];
let caseCounter = 1000;

export function getERCases(filters?: {
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
}): ERCase[] {
  let filtered = cases;

  if (filters?.status) {
    filtered = filtered.filter((c) => c.status === filters.status);
  }
  if (filters?.type) {
    filtered = filtered.filter((c) => c.type === filters.type);
  }
  if (filters?.priority) {
    filtered = filtered.filter((c) => c.priority === filters.priority);
  }
  if (filters?.assignedTo) {
    filtered = filtered.filter((c) => c.assignedTo.includes(filters.assignedTo!));
  }

  return filtered.sort((a, b) => new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime());
}

export function getERCase(id: string): ERCase | undefined {
  return cases.find((c) => c.id === id);
}

export function createERCase(caseData: Omit<ERCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt' | 'investigationNotes'>): ERCase {
  const newCase: ERCase = {
    ...caseData,
    id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    caseNumber: `ER-${caseCounter++}`,
    investigationNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cases.push(newCase);
  return newCase;
}

export function updateERCase(id: string, updates: Partial<ERCase>): boolean {
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return false;

  cases[index] = {
    ...cases[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return true;
}

export function addInvestigationNote(caseId: string, note: Omit<InvestigationNote, 'id' | 'caseId' | 'timestamp'>): InvestigationNote {
  const newNote: InvestigationNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    caseId,
    timestamp: new Date().toISOString(),
  };

  const caseIndex = cases.findIndex((c) => c.id === caseId);
  if (caseIndex !== -1) {
    cases[caseIndex].investigationNotes.push(newNote);
    cases[caseIndex].updatedAt = new Date().toISOString();
  }

  return newNote;
}

export function createActionPlan(caseId: string, plan: Omit<ActionPlan, 'id' | 'caseId' | 'createdAt' | 'updatedAt'>): ActionPlan {
  const newPlan: ActionPlan = {
    ...plan,
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    caseId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateERCase(caseId, { actionPlan: newPlan });
  return newPlan;
}

export function recordCaseOutcome(caseId: string, outcome: Omit<CaseOutcome, 'id' | 'caseId'>): CaseOutcome {
  const newOutcome: CaseOutcome = {
    ...outcome,
    id: `outcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    caseId,
  };

  updateERCase(caseId, { outcome: newOutcome, status: 'resolved' });
  return newOutcome;
}

export function getERCaseStats(): ERCaseStats {
  const stats: ERCaseStats = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'open').length,
    investigating: cases.filter((c) => c.status === 'investigating').length,
    resolved: cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
    byType: {
      grievance: cases.filter((c) => c.type === 'grievance').length,
      complaint: cases.filter((c) => c.type === 'complaint').length,
      disciplinary: cases.filter((c) => c.type === 'disciplinary').length,
      investigation: cases.filter((c) => c.type === 'investigation').length,
      mediation: cases.filter((c) => c.type === 'mediation').length,
    },
    byCategory: {
      harassment: cases.filter((c) => c.category === 'harassment').length,
      discrimination: cases.filter((c) => c.category === 'discrimination').length,
      'policy-violation': cases.filter((c) => c.category === 'policy-violation').length,
      performance: cases.filter((c) => c.category === 'performance').length,
      conduct: cases.filter((c) => c.category === 'conduct').length,
      'workplace-safety': cases.filter((c) => c.category === 'workplace-safety').length,
      other: cases.filter((c) => c.category === 'other').length,
    },
    avgResolutionTime: 14, // days - mock value
  };

  return stats;
}

export function checkCaseAccess(caseId: string, userId: string): boolean {
  const erCase = getERCase(caseId);
  if (!erCase) return false;

  // Check if user is in access control list or assigned to the case
  return erCase.accessControlList.includes(userId) || erCase.assignedTo.includes(userId);
}

export function deleteERCase(id: string): boolean {
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return false;

  cases.splice(index, 1);
  return true;
}
