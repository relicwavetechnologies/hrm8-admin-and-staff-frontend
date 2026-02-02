/**
 * Compliance Alerts Service (Frontend)
 * API client for compliance alerts and audit history
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface ComplianceAlert {
    id: string;
    type: 'OVERDUE_PAYOUT' | 'INACTIVE_REGION' | 'REVENUE_DECLINE' | 'EXPIRED_AGREEMENT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    entityType: 'LICENSEE' | 'REGION';
    entityId: string;
    entityName: string;
    title: string;
    description: string;
    value?: number;
    threshold?: number;
    detectedAt: string;
}

export interface AlertSummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
}

export interface AuditLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    performedBy: string;
    performedAt: string;
    ipAddress: string | null;
    notes: string | null;
}

class ComplianceService {
    async getAlerts() {
        return apiClient.get<{ alerts: ComplianceAlert[] }>('/api/hrm8/compliance/alerts');
    }

    async getAlertSummary() {
        return apiClient.get<AlertSummary>('/api/hrm8/compliance/summary');
    }

    async getAuditHistory(entityType: string, entityId: string, limit: number = 50) {
        return apiClient.get<{ history: AuditLogEntry[] }>(
            `/api/hrm8/compliance/audit/${entityType}/${entityId}?limit=${limit}`
        );
    }

    async getRecentAudit(limit: number = 100) {
        return apiClient.get<{ entries: AuditLogEntry[] }>(
            `/api/hrm8/compliance/audit/recent?limit=${limit}`
        );
    }
}

export const complianceService = new ComplianceService();
