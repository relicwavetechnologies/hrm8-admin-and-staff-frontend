/**
 * Audit Log Service
 * Frontend service for audit log API
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface AuditLogEntry {
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    performed_by: string;
    performed_by_email: string;
    performed_by_role: string;
    changes?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    description?: string;
    performed_at: string;
}

export interface AuditLogStats {
    total_logs: number;
    today_logs: number;
    top_actions: { action: string; count: number }[];
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
        if (filters?.entityType) params.append('entity_type', filters.entityType);
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
