/**
 * Job Description Service
 * Handles AI-powered job description generation using all available form fields
 */

import { apiClient } from '../api';
import { JobFormData } from '@/shared/types/job';

export interface GenerateDescriptionRequest {
  // Step 1
  title: string;
  numberOfVacancies?: number;
  department?: string;
  location?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'casual';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  workArrangement?: 'on-site' | 'remote' | 'hybrid';
  tags?: string[];
  serviceType?: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';

  // Step 2 (if partially filled)
  existingDescription?: string;
  existingRequirements?: string[];
  existingResponsibilities?: string[];

  // Step 3 (if available)
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  salaryDescription?: string;
  hideSalary?: boolean;
  closeDate?: string;
  visibility?: 'public' | 'private';
  stealth?: boolean;

  // Additional context
  additionalContext?: string;
}

export interface GeneratedJobDescription {
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export const jobDescriptionService = {
  /**
   * Generate job description using ALL available form fields
   */
  async generateDescription(formData: Partial<JobFormData>, additionalContext?: string): Promise<GeneratedJobDescription> {
    // Extract requirements and responsibilities as string arrays
    const existingRequirements = formData.requirements?.map(r =>
      typeof r === 'string' ? r : r.text
    ).filter(Boolean);

    const existingResponsibilities = formData.responsibilities?.map(r =>
      typeof r === 'string' ? r : r.text
    ).filter(Boolean);

    const request: GenerateDescriptionRequest = {
      // Step 1
      title: formData.title || '',
      numberOfVacancies: formData.numberOfVacancies,
      department: formData.department,
      location: formData.location,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      workArrangement: formData.workArrangement,
      tags: formData.tags,
      serviceType: formData.serviceType,

      // Step 2 (if partially filled)
      existingDescription: formData.description,
      existingRequirements: existingRequirements && existingRequirements.length > 0 ? existingRequirements : undefined,
      existingResponsibilities: existingResponsibilities && existingResponsibilities.length > 0 ? existingResponsibilities : undefined,

      // Step 3 (if available)
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
      salaryCurrency: formData.salaryCurrency,
      salaryPeriod: formData.salaryPeriod,
      salaryDescription: formData.salaryDescription,
      hideSalary: formData.hideSalary,
      closeDate: formData.closeDate,
      visibility: formData.visibility,
      stealth: formData.stealth,

      // Additional context
      additionalContext,
    };

    console.log('🚀 Calling /api/jobs/generate-description with:', request);

    const response = await apiClient.post<GeneratedJobDescription>(
      '/api/jobs/generate-description',
      request
    );

    console.log('📥 Raw API Response:', JSON.stringify(response, null, 2));

    if (!response.success || !response.data) {
      console.error('❌ API Error - no data in response or success is false', response.error);
      throw new Error(response.error || 'Failed to generate job description');
    }

    return response.data;
  },
};

