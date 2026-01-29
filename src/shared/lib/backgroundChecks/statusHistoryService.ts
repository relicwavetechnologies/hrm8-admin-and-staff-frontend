import type { StatusChangeRecord, StatusHistoryFilters } from '@/shared/types/statusHistory';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

const HISTORY_KEY = 'hrm8_status_history';

function getStatusHistory(): StatusChangeRecord[] {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function recordStatusChange(
  checkId: string,
  candidateId: string,
  candidateName: string,
  previousStatus: BackgroundCheck['status'],
  newStatus: BackgroundCheck['status'],
  changedBy: string,
  changedByName: string,
  reason?: string,
  notes?: string,
  automated: boolean = false,
  metadata?: Record<string, any>
): StatusChangeRecord {
  const record: StatusChangeRecord = {
    id: `sh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    checkId,
    candidateId,
    candidateName,
    previousStatus,
    newStatus,
    changedBy,
    changedByName,
    reason,
    notes,
    timestamp: new Date().toISOString(),
    automated,
    metadata
  };

  const history = getStatusHistory();
  history.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  return record;
}

export function getCheckStatusHistory(checkId: string): StatusChangeRecord[] {
  return getStatusHistory()
    .filter(record => record.checkId === checkId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getCandidateStatusHistory(candidateId: string): StatusChangeRecord[] {
  return getStatusHistory()
    .filter(record => record.candidateId === candidateId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function filterStatusHistory(filters: StatusHistoryFilters): StatusChangeRecord[] {
  let history = getStatusHistory();

  if (filters.checkId) {
    history = history.filter(r => r.checkId === filters.checkId);
  }

  if (filters.candidateId) {
    history = history.filter(r => r.candidateId === filters.candidateId);
  }

  if (filters.status) {
    history = history.filter(r => r.newStatus === filters.status || r.previousStatus === filters.status);
  }

  if (filters.changedBy) {
    history = history.filter(r => r.changedBy === filters.changedBy);
  }

  if (filters.dateFrom) {
    history = history.filter(r => new Date(r.timestamp) >= new Date(filters.dateFrom!));
  }

  if (filters.dateTo) {
    history = history.filter(r => new Date(r.timestamp) <= new Date(filters.dateTo!));
  }

  if (filters.automated !== undefined) {
    history = history.filter(r => r.automated === filters.automated);
  }

  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function exportStatusHistory(filters?: StatusHistoryFilters): string {
  const history = filters ? filterStatusHistory(filters) : getStatusHistory();
  
  const csv = [
    ['Timestamp', 'Candidate', 'Check ID', 'Previous Status', 'New Status', 'Changed By', 'Reason', 'Automated', 'Notes'].join(','),
    ...history.map(record => [
      record.timestamp,
      record.candidateName,
      record.checkId,
      record.previousStatus,
      record.newStatus,
      record.changedByName,
      record.reason || '',
      record.automated ? 'Yes' : 'No',
      record.notes || ''
    ].join(','))
  ].join('\n');

  return csv;
}

export function getStatusHistoryStats() {
  const history = getStatusHistory();
  const last30Days = history.filter(r => {
    const date = new Date(r.timestamp);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  return {
    totalChanges: history.length,
    changesLast30Days: last30Days.length,
    automatedChanges: history.filter(r => r.automated).length,
    manualChanges: history.filter(r => !r.automated).length,
    byStatus: history.reduce((acc, r) => {
      acc[r.newStatus] = (acc[r.newStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
