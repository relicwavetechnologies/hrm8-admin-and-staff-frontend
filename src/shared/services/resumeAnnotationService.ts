import { apiClient } from '@/shared/lib/api';

export interface ResumeAnnotation {
  id: string;
  resume_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  type: 'highlight' | 'comment';
  text: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
  created_at: string;
}

export interface CreateAnnotationRequest {
  resume_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  type: 'highlight' | 'comment';
  text: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
}

export const resumeAnnotationService = {
  async getAnnotations(resumeId: string): Promise<ResumeAnnotation[]> {
    const response = await apiClient.get<ResumeAnnotation[]>(
      `/api/resumes/${resumeId}/annotations`
    );
    return response.data || [];
  },

  async createAnnotation(data: CreateAnnotationRequest): Promise<ResumeAnnotation> {
    const response = await apiClient.post<ResumeAnnotation>(
      `/api/resumes/${data.resume_id}/annotations`,
      data
    );
    if (!response.data) {
      throw new Error('Failed to create annotation: No data returned');
    }
    return response.data;
  },

  async deleteAnnotation(resumeId: string, annotationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/api/resumes/${resumeId}/annotations/${annotationId}`, { user_id: userId });
  }
};
