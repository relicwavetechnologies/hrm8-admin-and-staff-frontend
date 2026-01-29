import type { BackgroundCheck } from './backgroundCheck';

export interface StatusChangeRecord {
  id: string;
  checkId: string;
  candidateId: string;
  candidateName: string;
  previousStatus: BackgroundCheck['status'];
  newStatus: BackgroundCheck['status'];
  changedBy: string;
  changedByName: string;
  reason?: string;
  notes?: string;
  timestamp: string;
  automated: boolean;
  metadata?: Record<string, unknown>;
}

export interface StatusHistoryFilters {
  checkId?: string;
  candidateId?: string;
  status?: BackgroundCheck['status'];
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  automated?: boolean;
}
