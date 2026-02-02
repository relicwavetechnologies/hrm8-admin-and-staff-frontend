/**
 * HRM8 Alerts Service
 * Handles API calls for system alerts
 */

import { apiClient } from '@/shared/lib/apiClient';

// Types
export interface SystemAlert {
    id: string;
    type: 'ERROR' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    createdAt: string;
}

// ==================== ALERTS ====================

export const getActiveAlerts = async (): Promise<SystemAlert[]> => {
    const response = await apiClient.get<SystemAlert[]>('/api/hrm8/alerts');
    return response.data || [];
};

// Export as default object
const alertsService = {
    getActiveAlerts,
};

export default alertsService;
