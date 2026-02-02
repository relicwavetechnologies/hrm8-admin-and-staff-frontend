/**
 * Audit Log Service
 * Frontend service for audit log API
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface AuditLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    performedBy: string;
    performedByEmail: string;
    performedByRole: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
    performedAt: string;
}

export interface AuditLogStats {
    totalLogs: number;
    todayLogs: number;
    topActions: { action: string; count: number }[];
}

export const auditLogService = {
    /**
     * Get recent audit logs
     */
    getRecent: async (filters?: {
        entityType?: string;
        action?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ success: boolean; data?: { logs: AuditLogEntry[]; total: number } }> => {
        const params = new URLSearchParams();
        if (filters?.entityType) params.append('entityType', filters.entityType);
        if (filters?.action) params.append('action', filters.action);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        return apiClient.get(`/api/hrm8/audit-logs?${params.toString()}`);
    },

    /**
     * Get audit logs for a specific entity
     */
    getByEntity: async (
        entityType: string,
        entityId: string
    ): Promise<{ success: boolean; data?: { logs: AuditLogEntry[] } }> => {
        return apiClient.get(`/api/hrm8/audit-logs/${entityType}/${entityId}`);
    },

    /**
     * Get audit stats
     */
    getStats: async (): Promise<{ success: boolean; data?: AuditLogStats }> => {
        return apiClient.get('/api/hrm8/audit-logs/stats');
    },
};
