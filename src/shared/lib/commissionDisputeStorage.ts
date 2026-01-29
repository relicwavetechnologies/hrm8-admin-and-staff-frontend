import type { CommissionDispute, DisputeStatus, DisputeEvidence, DisputeComment, DisputeAuditEntry } from '@/shared/types/commissionDispute';

const DISPUTES_KEY = 'commission_disputes';

// Audit Trail Helper
function addAuditEntry(
  dispute: CommissionDispute,
  action: string,
  userId: string,
  userName: string,
  details: Record<string, any>,
  previousValue?: any,
  newValue?: any
): CommissionDispute {
  const auditEntry: DisputeAuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    userId,
    userName,
    timestamp: new Date().toISOString(),
    details,
    previousValue,
    newValue,
  };

  return {
    ...dispute,
    auditTrail: [...dispute.auditTrail, auditEntry],
    updatedAt: new Date().toISOString(),
  };
}

// Storage Functions
export function getAllDisputes(): CommissionDispute[] {
  const stored = localStorage.getItem(DISPUTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getDisputeById(id: string): CommissionDispute | undefined {
  return getAllDisputes().find(d => d.id === id);
}

export function getConsultantDisputes(consultantId: string): CommissionDispute[] {
  return getAllDisputes()
    .filter(d => d.consultantId === consultantId)
    .sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime());
}

export function getDisputesByStatus(status: DisputeStatus): CommissionDispute[] {
  return getAllDisputes().filter(d => d.status === status);
}

export function createDispute(
  dispute: Omit<CommissionDispute, 'id' | 'createdAt' | 'updatedAt' | 'evidence' | 'comments' | 'auditTrail' | 'slaBreached'>
): CommissionDispute {
  const all = getAllDisputes();
  
  const newDispute: CommissionDispute = {
    ...dispute,
    id: `dispute_${Date.now()}`,
    evidence: [],
    comments: [],
    auditTrail: [],
    slaBreached: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add initial audit entry
  const withAudit = addAuditEntry(
    newDispute,
    'dispute_created',
    dispute.filedBy,
    dispute.filedByName,
    {
      reason: dispute.reason,
      disputedAmount: dispute.disputedAmount,
      expectedAmount: dispute.expectedAmount,
    }
  );

  all.push(withAudit);
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  
  return withAudit;
}

export function updateDisputeStatus(
  id: string,
  status: DisputeStatus,
  userId: string,
  userName: string,
  notes?: string
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  const oldStatus = all[index].status;
  all[index] = {
    ...all[index],
    status,
  };

  all[index] = addAuditEntry(
    all[index],
    'status_changed',
    userId,
    userName,
    { notes },
    oldStatus,
    status
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function assignDispute(
  id: string,
  assignedTo: string,
  assignedToName: string,
  assignedBy: string,
  assignedByName: string
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    assignedTo,
    assignedToName,
    assignedDate: new Date().toISOString(),
  };

  all[index] = addAuditEntry(
    all[index],
    'assigned',
    assignedBy,
    assignedByName,
    { assignedTo, assignedToName }
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function addDisputeEvidence(
  id: string,
  evidence: Omit<DisputeEvidence, 'id' | 'uploadedAt'>,
  uploadedBy: string,
  uploadedByName: string
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  const newEvidence: DisputeEvidence = {
    ...evidence,
    id: `evidence_${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };

  all[index] = {
    ...all[index],
    evidence: [...all[index].evidence, newEvidence],
  };

  all[index] = addAuditEntry(
    all[index],
    'evidence_added',
    uploadedBy,
    uploadedByName,
    { fileName: evidence.fileName, description: evidence.description }
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function addDisputeComment(
  id: string,
  comment: string,
  userId: string,
  userName: string,
  isInternal: boolean = false
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  const newComment: DisputeComment = {
    id: `comment_${Date.now()}`,
    userId,
    userName,
    comment,
    isInternal,
    createdAt: new Date().toISOString(),
  };

  all[index] = {
    ...all[index],
    comments: [...all[index].comments, newComment],
  };

  all[index] = addAuditEntry(
    all[index],
    'comment_added',
    userId,
    userName,
    { commentPreview: comment.substring(0, 50), isInternal }
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function resolveDispute(
  id: string,
  resolution: CommissionDispute['resolution'],
  resolutionNotes: string,
  approvedAmount: number | undefined,
  resolvedBy: string,
  resolvedByName: string
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    status: 'resolved',
    resolution,
    resolutionNotes,
    approvedAmount,
    resolvedBy,
    resolvedByName,
    resolvedDate: new Date().toISOString(),
  };

  all[index] = addAuditEntry(
    all[index],
    'dispute_resolved',
    resolvedBy,
    resolvedByName,
    { resolution, approvedAmount, notes: resolutionNotes }
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function escalateDispute(
  id: string,
  escalatedTo: string,
  escalatedToName: string,
  escalationReason: string,
  escalatedBy: string,
  escalatedByName: string
): CommissionDispute | null {
  const all = getAllDisputes();
  const index = all.findIndex(d => d.id === id);
  
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    status: 'escalated',
    escalatedTo,
    escalatedToName,
    escalatedDate: new Date().toISOString(),
    escalationReason,
  };

  all[index] = addAuditEntry(
    all[index],
    'dispute_escalated',
    escalatedBy,
    escalatedByName,
    { escalatedTo, escalatedToName, reason: escalationReason }
  );

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[index];
}

export function getDisputeStats(consultantId?: string) {
  const disputes = consultantId 
    ? getConsultantDisputes(consultantId)
    : getAllDisputes();
  
  return {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    underReview: disputes.filter(d => d.status === 'under-review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    rejected: disputes.filter(d => d.status === 'rejected').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
    totalDisputed: disputes.reduce((sum, d) => sum + d.disputedAmount, 0),
    totalResolved: disputes
      .filter(d => d.status === 'resolved' && d.approvedAmount)
      .reduce((sum, d) => sum + (d.approvedAmount || 0), 0),
    avgResolutionTime: calculateAvgResolutionTime(disputes),
    slaBreached: disputes.filter(d => d.slaBreached).length,
  };
}

function calculateAvgResolutionTime(disputes: CommissionDispute[]): number {
  const resolved = disputes.filter(d => d.resolvedDate);
  if (resolved.length === 0) return 0;
  
  const totalDays = resolved.reduce((sum, d) => {
    const filed = new Date(d.filedDate).getTime();
    const resolved = new Date(d.resolvedDate!).getTime();
    return sum + (resolved - filed) / (1000 * 60 * 60 * 24);
  }, 0);
  
  return Math.round(totalDays / resolved.length);
}
