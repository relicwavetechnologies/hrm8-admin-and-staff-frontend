import { apiClient as api } from '@/shared/lib/api';

export interface SystemSetting {
    key: string;
    value: any;
    is_public?: boolean;
    updated_at?: string;
    updated_by?: string;
}

export interface BulkUpdateSettingItem {
    key: string;
    value: any;
    isPublic?: boolean;
}

/** Backend returns array of { key, value, ... }; we transform to Record for consumers */
function settingsArrayToRecord(items: { key: string; value: any }[] | undefined): Record<string, any> {
    if (!Array.isArray(items)) return {};
    return items.reduce<Record<string, any>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});
}

export const SystemSettingsService = {
    /**
     * Get all system settings (Admin only)
     * Backend: GET /api/hrm8/settings returns array; we transform to key-value map
     */
    getAllSettings: async (): Promise<Record<string, any>> => {
        const response = await api.get<{ key: string; value: any }[]>('/api/hrm8/settings');
        const data = response.data;
        if (Array.isArray(data)) return settingsArrayToRecord(data);
        if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, any>;
        return {};
    },

    /**
     * Update a single setting
     * Backend: PUT /api/hrm8/settings/:key with body { value }
     */
    updateSetting: async (key: string, value: any, _isPublic?: boolean): Promise<SystemSetting> => {
        const response = await api.put<SystemSetting>(`/api/hrm8/settings/${encodeURIComponent(key)}`, { value });
        if (!response.data) throw new Error(response.error || 'Failed to update setting');
        return response.data;
    },

    /**
     * Bulk update settings
     * Backend has no bulk endpoint; we call updateSetting for each item
     */
    bulkUpdateSettings: async (settings: BulkUpdateSettingItem[]): Promise<SystemSetting[]> => {
        const results: SystemSetting[] = [];
        for (const item of settings) {
            const updated = await SystemSettingsService.updateSetting(item.key, item.value, item.isPublic);
            results.push(updated);
        }
        return results;
    },

    /**
     * Get public settings (Branding etc)
     * Uses same endpoint; public filter can be added server-side later
     */
    getPublicSettings: async (): Promise<Record<string, any>> => {
        return SystemSettingsService.getAllSettings();
    }
};
