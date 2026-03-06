import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';

export interface JobCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    description?: string;
    is_active: boolean;
}

export interface JobTag {
    id: string;
    name: string;
    slug: string;
    color: string;
    description?: string;
    is_active: boolean;
}

/**
 * Fetch active job categories for job forms
 */
export const usePublicCategories = () => {
    return useQuery({
        queryKey: ['public-categories'],
        queryFn: async () => {
            const response = await apiClient.get<{ success: boolean; data: JobCategory[] }>(
                '/api/public/categories'
            );
            // Extract the data array from the response
            if (response.success && Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Fetch active job tags for job forms
 */
export const usePublicTags = () => {
    return useQuery({
        queryKey: ['public-tags'],
        queryFn: async () => {
            const response = await apiClient.get<{ success: boolean; data: JobTag[] }>(
                '/api/public/tags'
            );
            // Extract the data array from the response
            if (response.success && Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
