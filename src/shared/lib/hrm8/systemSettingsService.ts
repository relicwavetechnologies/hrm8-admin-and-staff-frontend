import { apiClient as api } from '@/shared/lib/api';

export interface SystemSetting {
    key: string;
    value: any;
    is_public: boolean;
    updated_at: string;
    updated_by: string;
}

export interface BulkUpdateSettingItem {
    key: string;
    value: any;
    isPublic?: boolean;
}

export const SystemSettingsService = {
    /**
     * Get all system settings (Admin only)
     */
    getAllSettings: async (): Promise<Record<string, any>> => {
        const response = await api.get<Record<string, any>>('/api/hrm8/system-settings');
        return response.data || {};
    },

    /**
     * Update a single setting
     */
    updateSetting: async (key: string, value: any, isPublic?: boolean): Promise<SystemSetting> => {
        const response = await api.post<SystemSetting>('/api/hrm8/system-settings', {
            key,
            value,
            isPublic
        });
        if (!response.data) throw new Error('Failed to update setting');
        return response.data;
    },

    /**
     * Bulk update settings
     */
    bulkUpdateSettings: async (settings: BulkUpdateSettingItem[]): Promise<SystemSetting[]> => {
        const response = await api.post<SystemSetting[]>('/api/hrm8/system-settings/bulk', {
            settings
        });
        return response.data || [];
    },

    /**
     * Get public settings (Branding etc)
     */
    getPublicSettings: async (): Promise<Record<string, any>> => {
        const response = await api.get<Record<string, any>>('/api/hrm8/system-settings/public');
        return response.data || {};
    }
};
