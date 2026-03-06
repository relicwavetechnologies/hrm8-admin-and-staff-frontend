/**
 * Compliance Alerts Service (Frontend)
 * API client for compliance alerts and audit history
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface ComplianceAlert {
    id: string;
    type: 'OVERDUE_PAYOUT' | 'INACTIVE_REGION' | 'REVENUE_DECLINE' | 'EXPIRED_AGREEMENT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    entity_type: 'LICENSEE' | 'REGION';
    entity_id: string;
    entity_name: string;
    title: string;
    description: string;
    value?: number;
    threshold?: number;
    detected_at: string;
}

export interface AlertSummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    by_type: Record<string, number>;
}

export interface AuditLogEntry {
    id: string;
    entity_type?: string;
    entityType?: string;
    entity_id?: string;
    entityId?: string;
    action: string;
    changes?: Record<string, unknown> | null;
    performed_by?: string;
    performedBy?: string;
    performed_at?: string;
    performedAt?: string;
    ip_address?: string | null;
    ipAddress?: string | null;
    description?: string | null;
}

class ComplianceService {
    private normalizeAuditEntry(entry: any): AuditLogEntry {
        return {
            id: entry.id,
            entity_type: entry.entity_type ?? entry.entityType,
            entity_id: entry.entity_id ?? entry.entityId,
            action: entry.action,
            changes: entry.changes ?? null,
            performed_by: entry.performed_by ?? entry.performedBy ?? 'System',
            performed_at: entry.performed_at ?? entry.performedAt ?? null,
            ip_address: entry.ip_address ?? entry.ipAddress ?? null,
            description: entry.description ?? null,
        };
    }

    async getAlerts() {
        return apiClient.get<{ alerts: ComplianceAlert[] }>('/api/hrm8/compliance/alerts');
    }

    async getAlertSummary() {
        return apiClient.get<AlertSummary>('/api/hrm8/compliance/summary');
    }

    async getAuditHistory(entityType: string, entityId: string, limit: number = 50) {
        const response = await apiClient.get<{ history: AuditLogEntry[] }>(
            `/api/hrm8/compliance/audit/${entityType}/${entityId}?limit=${limit}`
        );
        if (response.success && response.data?.history) {
            response.data.history = response.data.history.map((entry) => this.normalizeAuditEntry(entry));
        }
        return response;
    }

    async getRecentAudit(limit: number = 100) {
        const response = await apiClient.get<{ entries: AuditLogEntry[] }>(
            `/api/hrm8/compliance/audit/recent?limit=${limit}`
        );
        if (response.success && response.data?.entries) {
            response.data.entries = response.data.entries.map((entry) => this.normalizeAuditEntry(entry));
        }
        return response;
    }
}

export const complianceService = new ComplianceService();
