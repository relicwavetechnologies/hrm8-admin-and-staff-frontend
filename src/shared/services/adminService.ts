/**
 * Admin Service
 * Handles API calls for admin management (categories, tags)
 */

import { apiClient } from '@/shared/lib/apiClient';

// Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    order: number;
    is_active: boolean;
    _count?: {
        jobs: number;
    };
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    is_active: boolean;
    _count?: {
        jobs: number;
    };
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryDTO {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
    is_active?: boolean;
}

export interface CreateTagDTO {
    name: string;
    slug?: string;
    color?: string;
    description?: string;
}

export interface UpdateTagDTO extends Partial<CreateTagDTO> {
    is_active?: boolean;
}

// ==================== CATEGORIES ====================

export const getAllCategories = async (includeInactive = false): Promise<Category[]> => {
    const endpoint = includeInactive ? '/api/admin/categories?includeInactive=true' : '/api/admin/categories';
    const response = await apiClient.get<Category[]>(endpoint);
    return response.data || [];
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    const response = await apiClient.get<Category>(`/api/admin/categories/${id}`);
    return response.data || null;
};

export const createCategory = async (data: CreateCategoryDTO): Promise<Category | null> => {
    const response = await apiClient.post<Category>('/api/admin/categories', data);
    return response.data || null;
};

export const updateCategory = async (id: string, data: UpdateCategoryDTO): Promise<Category | null> => {
    const response = await apiClient.put<Category>(`/api/admin/categories/${id}`, data);
    return response.data || null;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/admin/categories/${id}`);
    return response.success;
};

export const reorderCategories = async (order: { id: string; order: number }[]): Promise<boolean> => {
    const response = await apiClient.patch('/api/admin/categories/reorder', { order });
    return response.success;
};

// ==================== TAGS ====================

export const getAllTags = async (includeInactive = false): Promise<Tag[]> => {
    const endpoint = includeInactive ? '/api/admin/tags?includeInactive=true' : '/api/admin/tags';
    const response = await apiClient.get<Tag[]>(endpoint);
    return response.data || [];
};

export const getTagById = async (id: string): Promise<Tag | null> => {
    const response = await apiClient.get<Tag>(`/api/admin/tags/${id}`);
    return response.data || null;
};

export const createTag = async (data: CreateTagDTO): Promise<Tag | null> => {
    const response = await apiClient.post<Tag>('/api/admin/tags', data);
    return response.data || null;
};

export const updateTag = async (id: string, data: UpdateTagDTO): Promise<Tag | null> => {
    const response = await apiClient.put<Tag>(`/api/admin/tags/${id}`, data);
    return response.data || null;
};

export const deleteTag = async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/admin/tags/${id}`);
    return response.success;
};

// Export as default object for convenience
const adminService = {
    // Categories
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    // Tags
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
};

export default adminService;
