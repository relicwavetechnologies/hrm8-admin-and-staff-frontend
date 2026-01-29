import type { BackgroundCheck } from './backgroundCheck';

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  status: BackgroundCheck['status'];
  daysThreshold: number;
  escalateTo: string[]; // User IDs to escalate to
  escalateToNames?: string[];
  notifyOriginalInitiator: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  checkId: string;
  candidateName: string;
  status: BackgroundCheck['status'];
  daysPending: number;
  escalatedTo: string[];
  escalatedAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}
