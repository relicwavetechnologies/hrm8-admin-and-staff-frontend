/**
 * API Service for User Notification Preferences
 * Handles communication with backend for notification preferences and alert rules
 */

import { apiClient } from '../api';
import type { NotificationPreferences, AlertRule } from '@/shared/types/notificationPreferences';

export interface UpdatePreferencesData {
    eventPreferences?: Record<string, { enabled: boolean; channels: string[] }>;
    quietHours?: { enabled: boolean; start: string; end: string } | null;
}

export interface CreateAlertRuleData {
    name: string;
    description?: string;
    enabled?: boolean;
    eventType: string;
    conditions: Array<{
        field: string;
        operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
        value: string | number;
    }>;
    actions: {
        channels: string[];
        recipients: string[];
        priority: 'low' | 'medium' | 'high' | 'critical';
    };
}

export const userNotificationPreferencesService = {
    /**
     * Get notification preferences for the authenticated user
     */
    async getPreferences(): Promise<NotificationPreferences> {
        const response = await apiClient.get<NotificationPreferences>('/api/user/notifications/preferences');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch preferences');
        }
        return response.data;
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(data: UpdatePreferencesData): Promise<NotificationPreferences> {
        const response = await apiClient.put<NotificationPreferences>('/api/user/notifications/preferences', data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to update preferences');
        }
        return response.data;
    },

    /**
     * Get all alert rules for the authenticated user
     */
    async getAlertRules(): Promise<AlertRule[]> {
        const response = await apiClient.get<AlertRule[]>('/api/user/notifications/alert-rules');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch alert rules');
        }
        return response.data;
    },

    /**
     * Create a new alert rule
     */
    async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
        const response = await apiClient.post<AlertRule>('/api/user/notifications/alert-rules', data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to create alert rule');
        }
        return response.data;
    },

    /**
     * Update an existing alert rule
     */
    async updateAlertRule(ruleId: string, data: Partial<CreateAlertRuleData>): Promise<AlertRule> {
        const response = await apiClient.put<AlertRule>(`/api/user/notifications/alert-rules/${ruleId}`, data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to update alert rule');
        }
        return response.data;
    },

    /**
     * Delete an alert rule
     */
    async deleteAlertRule(ruleId: string): Promise<void> {
        const response = await apiClient.delete(`/api/user/notifications/alert-rules/${ruleId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete alert rule');
        }
    },
};
