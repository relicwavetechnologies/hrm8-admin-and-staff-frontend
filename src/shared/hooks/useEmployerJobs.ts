import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';

export interface JobFilters {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateJobDTO {
    title: string;
    description: string;
    responsibilities?: string;
    requirements?: string;
    location: string;
    job_type: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    benefits?: string;
    expires_at?: string;
    category?: string;
    status?: string;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> { }

export const useEmployerJobs = (filters: JobFilters) => {
    return useQuery({
        queryKey: ['employer-jobs', filters],
        queryFn: async () => {
            // Build query string manually or pass params if apiClient supports it
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.search) params.append('search', filters.search);

            const response = await apiClient.get<any>(`/api/employer/jobs?${params.toString()}`);
            if (!response.success) throw new Error(response.error);
            return response.data; // Expected { jobs: [], pagination: {} }
        },
        // Keep previous data while fetching new pages for smoother UX
        placeholderData: (previousData) => previousData
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateJobDTO) => {
            const response = await apiClient.post('/api/employer/jobs', data);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
        }
    });
};

export const useUpdateJob = (jobId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateJobDTO) => {
            const response = await apiClient.put(`/api/employer/jobs/${jobId}`, data);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        }
    });
};

export const useChangeJobStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
            const response = await apiClient.patch(`/api/employer/jobs/${jobId}/status`, { status });
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
        }
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (jobId: string) => {
            const response = await apiClient.delete(`/api/employer/jobs/${jobId}`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
        }
    });
};

export const useJobDetail = (jobId: string) => {
    return useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const response = await apiClient.get<any>(`/api/employer/jobs/${jobId}`);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        enabled: !!jobId
    });
}
