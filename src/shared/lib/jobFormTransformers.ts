/**
 * Job Form Data Transformers
 * Utility functions to transform JobFormData to API request formats
 */

import { JobFormData } from '@/shared/types/job';
import { CreateJobRequest, HiringMode, WorkArrangement, EmploymentType } from '@/shared/lib/api/jobService';

/**
 * Transform requirements/responsibilities from form objects to strings
 */
export function transformRequirements(requirements: JobFormData['requirements']): string[] {
  return (requirements || [])
    .map((req: any) => {
      if (typeof req === 'string') return req;
      return req.text || req;
    })
    .filter((req: any) => req && typeof req === 'string' && req.trim().length > 0);
}

export function transformResponsibilities(responsibilities: JobFormData['responsibilities']): string[] {
  return (responsibilities || [])
    .map((resp: any) => {
      if (typeof resp === 'string') return resp;
      return resp.text || resp;
    })
    .filter((resp: any) => resp && typeof resp === 'string' && resp.trim().length > 0);
}

/**
 * Convert service type to hiring mode
 */
export function serviceTypeToHiringMode(serviceType: JobFormData['serviceType']): HiringMode {
  switch (serviceType) {
    case 'self-managed':
      return 'SELF_MANAGED';
    case 'shortlisting':
      return 'SHORTLISTING';
    case 'full-service':
      return 'FULL_SERVICE';
    case 'executive-search':
      return 'EXECUTIVE_SEARCH';
    case 'rpo':
      return 'FULL_SERVICE'; // RPO maps to full service
    default:
      return 'SELF_MANAGED';
  }
}

/**
 * Convert kebab-case to UPPER_SNAKE_CASE
 */
export function toUpperSnakeCase(value: string): string {
  return value.toUpperCase().replace(/-/g, '_');
}

/**
 * Transform JobFormData to CreateJobRequest
 */
export function transformJobFormDataToCreateRequest(
  data: JobFormData,
  options: {
    includeTerms?: boolean;
    userId?: string;
    status?: 'DRAFT' | 'TEMPLATE';
  } = {}
): CreateJobRequest {
  const { includeTerms = false, userId, status } = options;

  const requirements = transformRequirements(data.requirements);
  const responsibilities = transformResponsibilities(data.responsibilities);

  const jobRequest: CreateJobRequest = {
    title: data.title,
    description: data.description,
    jobSummary: data.description?.substring(0, 150),
    hiringMode: serviceTypeToHiringMode(data.serviceType),
    location: data.location,
    department: data.department,
    workArrangement: toUpperSnakeCase(data.workArrangement) as WorkArrangement,
    employmentType: toUpperSnakeCase(data.employmentType) as EmploymentType,
    numberOfVacancies: data.numberOfVacancies || 1,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    salaryCurrency: data.salaryCurrency,
    salaryDescription: data.salaryDescription,
    promotionalTags: data.tags || [],
    stealth: data.stealth,
    visibility: data.visibility,
    requirements,
    responsibilities,
    category: data.experienceLevel || undefined,
    category_id: data.category_id || undefined, // NEW: Job category FK
    tag_ids: data.tag_ids || undefined, // NEW: Job tags array
    videoInterviewingEnabled: data.videoInterviewingEnabled || false,
  };

  // Add optional fields
  if (includeTerms && data.termsAccepted) {
    (jobRequest as any).termsAccepted = true;
    (jobRequest as any).termsAcceptedAt = new Date();
    (jobRequest as any).termsAcceptedBy = userId;
  }

  if (data.closeDate) {
    (jobRequest as any).closeDate = new Date(data.closeDate);
  }

  if (data.hiringTeam) {
    (jobRequest as any).hiringTeam = data.hiringTeam;
  }

  if (data.applicationForm) {
    (jobRequest as any).applicationForm = data.applicationForm;
  }

  if (status) {
    (jobRequest as any).status = status;
  }

  if (data.assignmentMode) {
    (jobRequest as any).assignmentMode = data.assignmentMode;
  }

  if (data.regionId) {
    (jobRequest as any).regionId = data.regionId;
  }

  return jobRequest;
}

/**
 * Transform JobFormData to UpdateJobRequest (for updating existing jobs)
 */
export function transformJobFormDataToUpdateRequest(
  data: JobFormData,
  options: {
    includeTerms?: boolean;
    userId?: string;
    status?: 'DRAFT' | 'TEMPLATE' | 'OPEN';
  } = {}
): any {
  const createRequest = transformJobFormDataToCreateRequest(data, {
    ...options,
    status: options.status === 'OPEN' ? 'DRAFT' : options.status
  });

  // UpdateJobRequest extends CreateJobRequest, so we can return it as-is
  return createRequest;
}

/**
 * Transform Job API response to JobFormData format
 */
export function transformJobToFormData(job: any): JobFormData {
  // Map serviceType from hiringMode
  const hiringModeToServiceType = {
    'SELF_MANAGED': 'self-managed',
    'SHORTLISTING': 'shortlisting',
    'FULL_SERVICE': 'full-service',
    'EXECUTIVE_SEARCH': 'executive-search',
  } as Record<string, JobFormData['serviceType']>;

  // Map status
  const statusMap: Record<string, 'draft' | 'open'> = {
    'DRAFT': 'draft',
    'OPEN': 'open',
    'CLOSED': 'open',
    'ON_HOLD': 'open',
    'FILLED': 'open',
  };

  // Transform requirements/responsibilities from strings to objects
  const requirements = (job.requirements || []).map((req: string, index: number) => ({
    id: `req-${Date.now()}-${index}`,
    text: req,
    order: index + 1,
  }));

  const responsibilities = (job.responsibilities || []).map((resp: string, index: number) => ({
    id: `resp-${Date.now()}-${index}`,
    text: resp,
    order: index + 1,
  }));

  // Map workArrangement and employmentType from UPPER_SNAKE_CASE to kebab-case
  const workArrangementMap: Record<string, 'on-site' | 'remote' | 'hybrid'> = {
    'ON_SITE': 'on-site',
    'REMOTE': 'remote',
    'HYBRID': 'hybrid',
  };

  const employmentTypeMap: Record<string, 'full-time' | 'part-time' | 'contract' | 'casual'> = {
    'FULL_TIME': 'full-time',
    'PART_TIME': 'part-time',
    'CONTRACT': 'contract',
    'CASUAL': 'casual',
  };

  return {
    serviceType: hiringModeToServiceType[job.hiringMode || 'SELF_MANAGED'] || 'self-managed',
    title: job.title || '',
    numberOfVacancies: job.numberOfVacancies || 1,
    department: job.department || '',
    location: job.location || '',
    employmentType: employmentTypeMap[job.employmentType] || 'full-time',
    experienceLevel: (job.category || 'mid') as 'entry' | 'mid' | 'senior' | 'executive',
    workArrangement: workArrangementMap[job.workArrangement] || 'on-site',
    tags: job.promotionalTags || [],
    category_id: job.category_id || undefined, // NEW: Job category FK
    tag_ids: job.tags?.map((t: any) => t.tag_id || t.id) || undefined, // NEW: Extract tag IDs
    description: job.description || '',
    requirements,
    responsibilities,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency || 'USD',
    salaryPeriod: (job.salaryPeriod || 'annual') as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual',
    salaryDescription: job.salaryDescription,
    hideSalary: !job.salaryMin && !job.salaryMax,
    closeDate: job.closeDate ? new Date(job.closeDate).toISOString().split('T')[0] : undefined,
    visibility: (job.visibility || 'public') as 'public' | 'private',
    stealth: job.stealth || false,
    hiringTeam: job.hiringTeam || [],
    applicationForm: job.applicationForm || {
      id: `form-${Date.now()}`,
      name: 'Application Form',
      questions: [],
      includeStandardFields: {
        resume: { included: true, required: true },
        coverLetter: { included: false, required: false },
        portfolio: { included: false, required: false },
        linkedIn: { included: false, required: false },
        website: { included: false, required: false },
      },
    },
    status: statusMap[job.status] || 'draft',
    jobBoardDistribution: job.jobBoardDistribution || ['HRM8 Job Board'],
    termsAccepted: job.termsAccepted || false,
    videoInterviewingEnabled: job.videoInterviewingEnabled || false,
    assignedConsultantId: job.assignedConsultantId,
    assignmentMode: job.assignmentMode,
    screeningEnabled: job.screening_enabled || job.screeningEnabled || false,
    automatedScreeningEnabled: job.automated_screening_enabled || job.automatedScreeningEnabled || false,
    screeningCriteria: job.screening_criteria || job.screeningCriteria,
    preInterviewQuestionnaireEnabled: job.pre_interview_questionnaire_enabled || job.preInterviewQuestionnaireEnabled || false,
  };
}

