/**
 * Job Data Mapper
 * Maps backend job data to frontend format
 */

import { Job, JobFormData } from '@/shared/types/job';

/**
 * Normalize backend status to frontend status
 */
function normalizeStatus(status: string): 'draft' | 'open' | 'closed' | 'on-hold' | 'filled' | 'cancelled' | 'template' {
  const normalized = status.toLowerCase();
  if (normalized === 'on_hold' || normalized === 'on-hold') return 'on-hold';
  if (normalized === 'draft') return 'draft';
  if (normalized === 'open') return 'open';
  if (normalized === 'closed') return 'closed';
  if (normalized === 'filled') return 'filled';
  if (normalized === 'cancelled') return 'cancelled';
  if (normalized === 'template') return 'template';
  return 'draft'; // default
}

/**
 * Map backend hiringMode to frontend serviceType
 */
function mapHiringModeToServiceType(hiringMode: string): 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo' {
  const normalized = hiringMode.toLowerCase();
  if (normalized === 'self_managed' || normalized === 'self-managed') return 'self-managed';
  if (normalized === 'shortlisting') return 'shortlisting';
  if (normalized === 'full_service' || normalized === 'full-service') return 'full-service';
  if (normalized === 'executive_search' || normalized === 'executive-search') return 'executive-search';
  if (normalized === 'rpo') return 'rpo';
  return 'self-managed'; // default
}

/**
 * Map backend workArrangement to frontend format
 */
function normalizeWorkArrangement(workArrangement: string): 'on-site' | 'remote' | 'hybrid' {
  const normalized = workArrangement.toLowerCase();
  if (normalized === 'on_site' || normalized === 'on-site') return 'on-site';
  if (normalized === 'remote') return 'remote';
  if (normalized === 'hybrid') return 'hybrid';
  return 'on-site'; // default
}

/**
 * Map backend employmentType to frontend format
 */
function normalizeEmploymentType(employmentType: string): 'full-time' | 'part-time' | 'contract' | 'casual' {
  const normalized = employmentType.toLowerCase();
  if (normalized === 'full_time' || normalized === 'full-time') return 'full-time';
  if (normalized === 'part_time' || normalized === 'part-time') return 'part-time';
  if (normalized === 'contract') return 'contract';
  if (normalized === 'casual') return 'casual';
  return 'full-time'; // default
}

/**
 * Map backend job to frontend Job interface
 */
export function mapBackendJobToFrontend(backendJob: any): Job {
  return {
    id: backendJob.id,
    employerId: backendJob.companyId || '',
    employerName: backendJob.company?.name || backendJob.companyName || '',
    employerLogo: backendJob.company?.logo || backendJob.companyLogo,
    createdBy: backendJob.createdBy || '',
    createdByName: backendJob.createdByName || '',
    title: backendJob.title || '',
    numberOfVacancies: backendJob.numberOfVacancies || 1,
    jobCode: backendJob.jobCode || '',
    description: backendJob.description || '',
    requirements: backendJob.requirements || [],
    responsibilities: backendJob.responsibilities || [],
    department: backendJob.department || '',
    location: backendJob.location || '',
    country: backendJob.country,
    employmentType: normalizeEmploymentType(backendJob.employmentType || 'FULL_TIME'),
    salaryMin: backendJob.salaryMin,
    salaryMax: backendJob.salaryMax,
    salaryCurrency: backendJob.salaryCurrency || 'USD',
    salaryPeriod: backendJob.salaryPeriod || 'annual',
    salaryDescription: backendJob.salaryDescription,
    experienceLevel: backendJob.experienceLevel || 'mid',
    status: normalizeStatus(backendJob.status || 'DRAFT'),
    visibility: backendJob.visibility || 'public',
    stealth: backendJob.stealth || false,
    postingDate: backendJob.postingDate
      ? (typeof backendJob.postingDate === 'string' ? backendJob.postingDate : backendJob.postingDate.toISOString())
      : new Date().toISOString(),
    closeDate: backendJob.closeDate
      ? (typeof backendJob.closeDate === 'string' ? backendJob.closeDate : backendJob.closeDate.toISOString())
      : undefined,
    tags: backendJob.promotionalTags || backendJob.tags || [],
    workArrangement: normalizeWorkArrangement(backendJob.workArrangement || 'ON_SITE'),
    aiGeneratedDescription: backendJob.aiGeneratedDescription || false,
    serviceType: mapHiringModeToServiceType(backendJob.hiringMode || backendJob.serviceType || 'SELF_MANAGED'),
    serviceStatus: backendJob.serviceStatus,
    assignedConsultantId: backendJob.assignedConsultantId,
    assignedConsultantName: backendJob.assignedConsultantName,
    pipeline: backendJob.pipeline
      ? {
        stage: backendJob.pipeline.stage,
        progress: backendJob.pipeline.progress,
        note: backendJob.pipeline.note,
        updatedAt: backendJob.pipeline.updatedAt
          ? (typeof backendJob.pipeline.updatedAt === 'string'
            ? backendJob.pipeline.updatedAt
            : backendJob.pipeline.updatedAt.toISOString())
          : null,
        updatedBy: backendJob.pipeline.updatedBy,
        consultantId: backendJob.pipeline.consultantId,
      }
      : undefined,
    jobBoardDistribution: backendJob.jobBoardDistribution || ['HRM8 Job Board'],
    applicantsCount: backendJob.applicantsCount || 0,
    unreadApplicants: backendJob.unreadApplicants,
    viewsCount: backendJob.viewsCount || 0,
    clicksCount: backendJob.clicksCount || 0,
    createdAt: backendJob.createdAt
      ? (typeof backendJob.createdAt === 'string' ? backendJob.createdAt : backendJob.createdAt.toISOString())
      : new Date().toISOString(),
    updatedAt: backendJob.updatedAt
      ? (typeof backendJob.updatedAt === 'string' ? backendJob.updatedAt : backendJob.updatedAt.toISOString())
      : new Date().toISOString(),
    hiringTeam: backendJob.hiringTeam || [],
    applicationForm: backendJob.applicationForm,
    hasJobTargetPromotion: backendJob.hasJobTargetPromotion,
    jobTargetBudget: backendJob.jobTargetBudget,
    jobTargetBudgetRemaining: backendJob.jobTargetBudgetRemaining,
    jobTargetPromotions: backendJob.jobTargetPromotions,
    paymentId: backendJob.paymentId,
    requiresPayment: backendJob.requiresPayment,
    paymentStatus: backendJob.paymentStatus,
    serviceFee: backendJob.serviceFee,
    termsAccepted: backendJob.termsAccepted,
    termsAcceptedAt: backendJob.termsAcceptedAt,
    termsAcceptedBy: backendJob.termsAcceptedBy,
    isInternal: backendJob.isInternal,
    internalOnly: backendJob.internalOnly,
    eligibleDepartments: backendJob.eligibleDepartments,
    internalApplyDeadline: backendJob.internalApplyDeadline,
    currentEmployeePriority: backendJob.currentEmployeePriority,
    requisitionId: backendJob.requisitionId,
    aiInterviewConfig: backendJob.aiInterviewConfig,
    videoInterviewingEnabled: backendJob.videoInterviewingEnabled || false,
  };
}

/**
 * Map backend job to JobFormData for the wizard
 */
export function mapBackendJobToFormData(backendJob: any): Partial<JobFormData> {
  const normalizedJob = mapBackendJobToFrontend(backendJob);

  return {
    serviceType: normalizedJob.serviceType,
    title: normalizedJob.title,
    numberOfVacancies: normalizedJob.numberOfVacancies || 1,
    department: normalizedJob.department,
    location: normalizedJob.location,
    employmentType: normalizedJob.employmentType,
    experienceLevel: normalizedJob.experienceLevel,
    workArrangement: normalizedJob.workArrangement,
    tags: normalizedJob.tags,
    description: normalizedJob.description,
    requirements: (normalizedJob.requirements || []).map((text: string, index: number) => ({
      id: `req-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    responsibilities: (normalizedJob.responsibilities || []).map((text: string, index: number) => ({
      id: `resp-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    salaryMin: normalizedJob.salaryMin,
    salaryMax: normalizedJob.salaryMax,
    salaryCurrency: normalizedJob.salaryCurrency,
    salaryPeriod: normalizedJob.salaryPeriod || 'annual',
    salaryDescription: normalizedJob.salaryDescription,
    hideSalary: false,
    closeDate: normalizedJob.closeDate,
    visibility: normalizedJob.visibility as 'public' | 'private',
    stealth: normalizedJob.stealth,
    hiringTeam: normalizedJob.hiringTeam || [],
    applicationForm: normalizedJob.applicationForm || {
      id: `form-${Date.now()}`,
      name: "Application Form",
      questions: [],
      includeStandardFields: {
        resume: { included: true, required: true },
        coverLetter: { included: false, required: false },
        portfolio: { included: false, required: false },
        linkedIn: { included: false, required: false },
        website: { included: false, required: false },
      },
    },
    status: normalizedJob.status === 'open' ? 'open' : 'draft',
    jobBoardDistribution: normalizedJob.jobBoardDistribution || [],
    videoInterviewingEnabled: normalizedJob.videoInterviewingEnabled || false,
  };
}

