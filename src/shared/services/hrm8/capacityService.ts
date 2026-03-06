/**
 * HRM8 Capacity Service
 * Handles API calls for consultant capacity monitoring
 */

import { apiClient } from '@/shared/lib/apiClient';

// Types
export interface CapacityWarning {
    consultantId: string;
    name: string;
    email: string;
    currentJobs: number;
    maxCapacity: number;
    utilizationRate: number;
    status: 'OVERLOADED' | 'WARNING' | 'NORMAL';
}

export interface CapacityResponse {
    warnings: CapacityWarning[];
    summary: {
        total: number;
        overloaded: number;
        warning: number;
    };
}

// ==================== CAPACITY ====================

export const getCapacityWarnings = async (): Promise<CapacityResponse> => {
    const response = await apiClient.get<CapacityResponse>('/api/hrm8/consultants/capacity-warnings');
    return response.data || { warnings: [], summary: { total: 0, overloaded: 0, warning: 0 } };
};

// Export as default object
const capacityService = {
    getCapacityWarnings,
};

export default capacityService;
