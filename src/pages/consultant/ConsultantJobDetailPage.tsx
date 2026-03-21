import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardPageLayout } from '@/shared/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/shared/components/layouts/AtsPageHeader';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { ConsultantCandidateService } from '@/shared/lib/consultant/consultantCandidateService';
import type { Application } from '@/shared/types/application';
import type { Job, JobActivity } from '@/shared/types/job';
import type { JobRound } from '@/shared/lib/jobRoundService';
import { formatExperienceLevel, formatRelativeDate, formatSalaryRange } from '@/shared/lib/jobUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
  ArrowLeft,
  ArrowUpCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  CheckSquare,
  DollarSign,
  Eye,
  GitBranch,
  Globe,
  Inbox,
  List,
  Lock,
  MapPin,
  MessageSquarePlus,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { JobQuickStats } from '@/modules/jobs/components/JobQuickStats';
import { JobStatusBadge } from '@/modules/jobs/components/JobStatusBadge';
import { EmploymentTypeBadge } from '@/modules/jobs/components/EmploymentTypeBadge';
import { ServiceTypeBadge } from '@/modules/jobs/components/ServiceTypeBadge';
import { JobActivityFeed } from '@/modules/jobs/components/JobActivityFeed';
import { ApplicationPipeline } from '@/modules/applications/components/ApplicationPipeline';
import {
  JobApplicationsFilterBar,
  type JobApplicationsFilters,
} from '@/modules/applications/components/JobApplicationsFilterBar';
import { RoundDetailView } from '@/modules/applications/components/RoundDetailView';
import { InitialScreeningTab } from '@/modules/applications/components/InitialScreeningTab';
import { CandidatesTab } from '@/modules/applications/components/CandidatesTab';
import { JobAIInterviewsTab } from '@/modules/jobs/components/aiInterview/JobAIInterviewsTab';
import { JobOffersTab } from '@/modules/jobs/components/offers/JobOffersTab';
import { JobTasksTab } from '@/modules/jobs/components/tasks/JobTasksTab';
import { JobInboxTab } from '@/modules/jobs/components/JobInboxTab';
import { JobMessagesTab } from '@/modules/jobs/components/JobMessagesTab';
import { CandidateAssessmentView } from '@/modules/jobs/components/candidate-assessment/CandidateAssessmentView';
import { JobDetailPageSkeleton } from '@/shared/components/jobs/JobDetailPageSkeleton';
import { normalizeServicePackage } from '@/shared/lib/managedServicePolicy';

type ConsultantJobDetailsResponse = {
  job: any;
  company?: {
    id: string;
    name: string;
    canUseAiFeatures: boolean;
    aiAccessReason?: 'PAYG' | 'PLAN_EXPIRED' | 'NO_SUBSCRIPTION' | 'OK';
    planType?: string;
  };
  pipeline?: {
    stage?: string;
    progress?: number | null;
    note?: string | null;
    updatedAt?: string | null;
  };
  team?: Array<{
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  }>;
  employer?: {
    contactName?: string;
    email?: string;
  };
};

const defaultFilters: JobApplicationsFilters = {
  searchQuery: '',
  selectedStages: [],
  selectedStatuses: [],
  selectedTags: [],
  dateFrom: undefined,
  dateTo: undefined,
  minScore: undefined,
  maxScore: undefined,
  assignedTo: undefined,
  quickFilter: null,
};

function normalizeJobStatus(status: string | undefined): Job['status'] {
  switch ((status || '').toUpperCase()) {
    case 'OPEN':
    case 'ACTIVE':
      return 'open';
    case 'CLOSED':
      return 'closed';
    case 'ON_HOLD':
      return 'on-hold';
    case 'FILLED':
      return 'filled';
    case 'CANCELLED':
      return 'cancelled';
    case 'DRAFT':
      return 'draft';
    default:
      return 'open';
  }
}

function normalizeServiceType(type: string | undefined): Job['serviceType'] {
  switch ((type || '').toLowerCase()) {
    case 'shortlisting':
      return 'shortlisting';
    case 'full-service':
    case 'full_service':
      return 'full-service';
    case 'executive-search':
    case 'executive_search':
      return 'executive-search';
    case 'rpo':
      return 'rpo';
    default:
      return 'self-managed';
  }
}

function normalizeEmploymentType(type: string | undefined): Job['employmentType'] {
  switch ((type || '').toLowerCase()) {
    case 'part-time':
    case 'part_time':
      return 'part-time';
    case 'contract':
      return 'contract';
    case 'casual':
      return 'casual';
    default:
      return 'full-time';
  }
}

function normalizeWorkArrangement(arrangement: string | undefined): Job['workArrangement'] {
  switch ((arrangement || '').toLowerCase()) {
    case 'remote':
      return 'remote';
    case 'hybrid':
      return 'hybrid';
    default:
      return 'on-site';
  }
}

function normalizeExperienceLevel(level: string | undefined): Job['experienceLevel'] {
  switch ((level || '').toLowerCase()) {
    case 'entry':
      return 'entry';
    case 'senior':
      return 'senior';
    case 'executive':
      return 'executive';
    default:
      return 'mid';
  }
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }
      if (item && typeof item === 'object' && 'text' in item) {
        return String((item as { text?: string }).text || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function filterApplications(applications: Application[], filters: JobApplicationsFilters): Application[] {
  return applications.filter((application) => {
    const searchQuery = filters.searchQuery.trim().toLowerCase();
    const searchableText = [application.candidateName, application.candidateEmail, application.jobTitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (searchQuery && !searchableText.includes(searchQuery)) {
      return false;
    }

    if (filters.selectedStages.length > 0 && !filters.selectedStages.includes(application.stage)) {
      return false;
    }

    if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(application.status)) {
      return false;
    }

    if (filters.selectedTags.length > 0) {
      const applicationTags = application.tags || [];
      if (!filters.selectedTags.some((tag) => applicationTags.includes(tag))) {
        return false;
      }
    }

    if (filters.dateFrom && application.appliedDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (application.appliedDate > endOfDay) {
        return false;
      }
    }

    const score = application.score ?? application.aiMatchScore ?? 0;

    if (filters.minScore !== undefined && score < filters.minScore) {
      return false;
    }

    if (filters.maxScore !== undefined && score > filters.maxScore) {
      return false;
    }

    if (filters.quickFilter === 'new') {
      const isNew = application.status === 'applied' || application.stage === 'New Application' || application.isNew || !application.isRead;
      if (!isNew) {
        return false;
      }
    }

    if (filters.quickFilter === 'interviewed' && application.status !== 'interview') {
      return false;
    }

    if (filters.quickFilter === 'shortlisted' && !application.shortlisted) {
      return false;
    }

    if (filters.quickFilter === 'offered' && application.status !== 'offer') {
      return false;
    }

    if (filters.quickFilter === 'rejected' && application.status !== 'rejected') {
      return false;
    }

    if (filters.quickFilter === 'needs-review') {
      const requiresReview = score < 70 || application.stage === 'New Application' || !application.isRead;
      if (!requiresReview) {
        return false;
      }
    }

    return true;
  });
}

function buildFrontendJob(jobData: ConsultantJobDetailsResponse | null, applications: Application[]): Job | null {
  if (!jobData?.job) {
    return null;
  }

  const rawJob = jobData.job;
  const serviceType = normalizeServiceType(rawJob.service_type || rawJob.servicePackage || rawJob.service_package);

  return {
    id: rawJob.id,
    employerId: rawJob.company?.id || rawJob.company_id || '',
    employerName: rawJob.company?.name || 'Client company',
    createdBy: rawJob.created_by || '',
    createdByName: rawJob.created_by_name || '',
    title: rawJob.title || 'Untitled job',
    numberOfVacancies: rawJob.number_of_vacancies || rawJob.numberOfVacancies || 1,
    jobCode: rawJob.job_code || rawJob.id,
    description: rawJob.description || '',
    requirements: normalizeStringList(rawJob.requirements),
    responsibilities: normalizeStringList(rawJob.responsibilities),
    department: rawJob.department || '',
    location: rawJob.location || 'Location not specified',
    country: rawJob.country || undefined,
    employmentType: normalizeEmploymentType(rawJob.employment_type || rawJob.employmentType),
    salaryMin: rawJob.salary_min,
    salaryMax: rawJob.salary_max,
    salaryCurrency: rawJob.salary_currency || 'USD',
    salaryPeriod: rawJob.salary_period || 'annual',
    salaryDescription: rawJob.salary_description || rawJob.salaryDescription || undefined,
    experienceLevel: normalizeExperienceLevel(rawJob.experience_level || rawJob.experienceLevel),
    status: normalizeJobStatus(rawJob.status),
    visibility: (rawJob.visibility || 'private').toLowerCase() === 'public' ? 'public' : 'private',
    stealth: Boolean(rawJob.stealth),
    postingDate: rawJob.posting_date || rawJob.postingDate || rawJob.created_at || new Date().toISOString(),
    closeDate: rawJob.close_date || rawJob.closeDate || undefined,
    tags: normalizeStringList(rawJob.tags),
    workArrangement: normalizeWorkArrangement(rawJob.work_arrangement || rawJob.workArrangement),
    aiGeneratedDescription: Boolean(rawJob.ai_generated_description || rawJob.aiGeneratedDescription),
    serviceType,
    servicePackage: rawJob.service_package || rawJob.servicePackage || serviceType,
    paymentStatus: rawJob.payment_status || rawJob.paymentStatus,
    paymentAmount: rawJob.payment_amount || rawJob.paymentAmount,
    paymentCurrency: rawJob.payment_currency || rawJob.paymentCurrency,
    paymentCompletedAt: rawJob.payment_completed_at || rawJob.paymentCompletedAt,
    assignedConsultantId: rawJob.assigned_consultant_id || rawJob.assignedConsultantId || undefined,
    assignedConsultantName: rawJob.assigned_consultant
      ? `${rawJob.assigned_consultant.first_name || ''} ${rawJob.assigned_consultant.last_name || ''}`.trim()
      : rawJob.assignedConsultantName || undefined,
    pipeline: {
      stage: jobData.pipeline?.stage,
      progress: jobData.pipeline?.progress ?? undefined,
      note: jobData.pipeline?.note ?? undefined,
      updatedAt: jobData.pipeline?.updatedAt ?? undefined,
    },
    jobBoardDistribution: normalizeStringList(rawJob.jobBoardDistribution),
    applicantsCount: applications.length,
    viewsCount: rawJob.views_count || rawJob.viewsCount || 0,
    clicksCount: rawJob.clicks_count || rawJob.clicksCount || 0,
    createdAt: rawJob.created_at || new Date().toISOString(),
    updatedAt: rawJob.updated_at || new Date().toISOString(),
    archived: Boolean(rawJob.archived),
    hiringTeam: [],
    hasJobTargetPromotion: Boolean(rawJob.hasJobTargetPromotion),
    paymentId: rawJob.payment_id || rawJob.paymentId,
    requiresPayment: Boolean(rawJob.requires_payment || rawJob.requiresPayment),
    stripeSessionId: rawJob.stripe_session_id || rawJob.stripeSessionId,
    stripePaymentIntentId: rawJob.stripe_payment_intent_id || rawJob.stripePaymentIntentId,
    termsAccepted: Boolean(rawJob.terms_accepted || rawJob.termsAccepted),
    setupType: (rawJob.setup_type || rawJob.setupType || 'simple') as 'simple' | 'advanced',
    managementType: rawJob.management_type || rawJob.managementType,
    setupComplete: Boolean(rawJob.setup_complete || rawJob.setupComplete),
    pendingConsultantAssignment: Boolean(rawJob.pendingConsultantAssignment),
  } as Job;
}

function AiLockedCard({ message, title }: { message: string; title: string }) {
  return (
    <Card className="border-amber-200/60 bg-amber-50/80 dark:border-amber-800/40 dark:bg-amber-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Lock className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
        <p>{message}</p>
        <p>Consultants see the same AI lock state as the company for this job.</p>
      </CardContent>
    </Card>
  );
}

export default function ConsultantJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState<ConsultantJobDetailsResponse | null>(null);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [rounds, setRounds] = useState<JobRound[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRoundTab, setActiveRoundTab] = useState('overview');
  const [applicationsFilters, setApplicationsFilters] = useState<JobApplicationsFilters>(defaultFilters);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const baseJobsPath = location.pathname.startsWith('/consultant360/') ? '/consultant360/jobs' : '/consultant/jobs';

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    void loadPageData(jobId);
  }, [jobId]);

  const sanitizeId = (value: string) => {
    if (value.includes(' ') && !value.includes('-')) {
      return value.replace(/\s/g, '-');
    }
    return value;
  };

  const loadJobDetails = async (id: string) => {
    const cleanId = sanitizeId(id);
    const response = await consultantService.getJobDetails(cleanId);
    const details = response.data as ConsultantJobDetailsResponse;

    if (!response.success || !details?.job) {
      throw new Error(response.error || 'Failed to load job details');
    }

    setJobData(details);
  };

  const loadApplications = async (id: string) => {
    const cleanId = sanitizeId(id);
    const response = await ConsultantCandidateService.getJobApplications(cleanId);
    setAllApplications(response.data?.applications || []);
  };

  const loadRounds = async (id: string) => {
    const cleanId = sanitizeId(id);
    const response = await ConsultantCandidateService.getJobRounds(cleanId);
    const items = (response.data?.rounds || [])
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    setRounds(items as JobRound[]);
  };

  const loadPageData = async (id: string) => {
    setLoading(true);
    try {
      await Promise.all([loadJobDetails(id), loadApplications(id), loadRounds(id)]);
    } catch (error) {
      console.error('Failed to load consultant job page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load job');
      navigate(baseJobsPath);
    } finally {
      setLoading(false);
    }
  };

  const frontendJob = useMemo(() => buildFrontendJob(jobData, allApplications), [jobData, allApplications]);
  const isFullServiceHandoff = useMemo(
    () =>
      frontendJob?.managementType === 'hrm8-managed' &&
      normalizeServicePackage(frontendJob?.servicePackage || frontendJob?.serviceType) === 'full-service',
    [frontendJob]
  );

  const filteredApplications = useMemo(
    () => filterApplications(allApplications, applicationsFilters),
    [allApplications, applicationsFilters]
  );

  const selectedApplicationIndex = selectedApplication
    ? filteredApplications.findIndex((application) => application.id === selectedApplication.id)
    : -1;

  const activities = useMemo<JobActivity[]>(() => {
    const rawActivities = Array.isArray((jobData?.job as any)?.activities) ? (jobData?.job as any)?.activities : [];
    return rawActivities.map((activity: any) => ({
      id: activity.id,
      jobId: activity.jobId || activity.job_id || frontendJob?.id || '',
      userId: activity.userId || activity.user_id || '',
      userName: activity.userName || activity.user_name || 'System',
      activityType: activity.activityType || activity.activity_type || 'updated',
      activityDescription: activity.activityDescription || activity.activity_description || 'Activity updated',
      metadata: activity.metadata,
      createdAt: activity.createdAt || activity.created_at || new Date().toISOString(),
    }));
  }, [jobData, frontendJob?.id]);

  const companyAiEnabled = jobData?.company?.canUseAiFeatures === true;
  const aiLockMessage = jobData?.company?.aiAccessReason === 'PLAN_EXPIRED'
    ? 'This company plan has expired. Upgrade to restore AI features.'
    : 'AI features require a paid plan (Small or higher). Upgrade the company plan to unlock AI tools.';

  const handleRefresh = async () => {
    if (!jobId) return;
    await Promise.all([loadApplications(jobId), loadRounds(jobId), loadJobDetails(jobId)]);
  };

  const handleOpenCandidate = (application: Application) => {
    setSelectedApplication(application);
    setDetailPanelOpen(true);
  };

  const handleOpenNextCandidate = () => {
    if (selectedApplicationIndex < 0 || selectedApplicationIndex >= filteredApplications.length - 1) {
      return;
    }
    setSelectedApplication(filteredApplications[selectedApplicationIndex + 1]);
  };

  const handleOpenPreviousCandidate = () => {
    if (selectedApplicationIndex <= 0) {
      return;
    }
    setSelectedApplication(filteredApplications[selectedApplicationIndex - 1]);
  };

  const moveCandidateToRound = async (applicationId: string, roundId: string) => {
    const response = await ConsultantCandidateService.moveToRound(applicationId, roundId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to move candidate');
    }
    if (response.data?.requiresApproval) {
      toast.success(response.data.message || 'Approval requested. Candidate will move after approval.');
    } else {
      toast.success('Candidate moved successfully');
    }
    await handleRefresh();
  };

  if (loading) {
    return (
      <DashboardPageLayout fullWidth>
        <JobDetailPageSkeleton />
      </DashboardPageLayout>
    );
  }

  if (!frontendJob || !jobData) {
    return (
      <DashboardPageLayout fullWidth>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-lg font-semibold">Job not found</p>
              <p className="text-sm text-muted-foreground">We couldn&apos;t load this consultant job.</p>
              <Button variant="outline" onClick={() => navigate(baseJobsPath)}>
                Back to My Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout fullWidth>
      <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex h-[calc(100vh-65px)] w-full">
        <div className="w-56 border-r bg-muted/5 flex-shrink-0 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">Job Menu</h3>
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
              <TabsTrigger value="overview" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <List className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="applicants" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <GitBranch className="h-3.5 w-3.5" />
                Pipeline
                {frontendJob.applicantsCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center">
                    {frontendJob.applicantsCount}
                  </Badge>
                )}
              </TabsTrigger>
              {activeTab === 'applicants' && (
                <div className="flex flex-col gap-0.5 mt-0.5 mb-1 px-2 animate-in slide-in-from-top-1 duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveRoundTab('overview')}
                    className={`w-full justify-start pl-9 pr-3 py-1.5 text-xs rounded-md transition-colors ${activeRoundTab === 'overview' ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                    Overview
                  </Button>
                  {rounds.map((round) => (
                    <Button
                      key={round.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveRoundTab(round.id)}
                      className={`w-full justify-start pl-9 pr-3 py-1.5 text-xs rounded-md transition-colors ${activeRoundTab === round.id ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <span className="truncate">{round.name}</span>
                      <span className="ml-auto text-[10px] opacity-70">
                        {allApplications.filter((application) => application.roundId === round.id).length}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
              <TabsTrigger value="screening" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <Inbox className="h-3.5 w-3.5" />
                AI Screening
              </TabsTrigger>
              <TabsTrigger value="candidates" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <Users className="h-3.5 w-3.5" />
                Candidates
              </TabsTrigger>
              <TabsTrigger value="ai-interviews" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <Video className="h-3.5 w-3.5" />
                Interviews
              </TabsTrigger>
              <TabsTrigger value="offers" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <Briefcase className="h-3.5 w-3.5" />
                Offers
              </TabsTrigger>
              <TabsTrigger value="hired" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hired
              </TabsTrigger>
              <TabsTrigger value="tasks" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <CheckSquare className="h-3.5 w-3.5" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="inbox" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <Inbox className="h-3.5 w-3.5" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="candidate-messages" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Candidate Messages
              </TabsTrigger>
              <TabsTrigger value="company-chat" className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Company Chat
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto h-full bg-background p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <>
                <AtsPageHeader
                  title={frontendJob.title}
                  subtitle={`${frontendJob.employerName}${frontendJob.department ? ` • ${frontendJob.department}` : ''} • ${frontendJob.location}`}
                >
                  <div className="flex items-center gap-2 mr-4">
                    <JobStatusBadge status={frontendJob.status} />
                    <ServiceTypeBadge type={frontendJob.serviceType || 'self-managed'} />
                    {frontendJob.pipeline?.stage && (
                      <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                        Pipeline: {String(frontendJob.pipeline.stage).replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(baseJobsPath)}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                    Back
                  </Button>
                </AtsPageHeader>

                <JobQuickStats
                  applicantsCount={frontendJob.applicantsCount}
                  viewsCount={frontendJob.viewsCount}
                  postingDate={frontendJob.postingDate}
                />
              </>
            )}

            <TabsContent value="overview" className="mt-3 space-y-3">
              {frontendJob.pendingConsultantAssignment && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Pending consultant assignment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A regional admin will confirm consultant assignment before the workflow can move forward.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 space-y-3">
                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-xs font-semibold">Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 px-3 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span>{frontendJob.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Arrangement:</span>
                          <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                            {frontendJob.workArrangement === 'on-site'
                              ? 'On-site'
                              : frontendJob.workArrangement === 'remote'
                                ? 'Remote'
                                : 'Hybrid'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Type:</span>
                          <EmploymentTypeBadge type={frontendJob.employmentType} />
                        </div>
                        {(frontendJob.salaryMin || frontendJob.salaryMax) && (
                          <div className="space-y-2 col-span-2">
                            <div className="flex items-center gap-2 text-xs">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">Salary:</span>
                              <span>
                                {formatSalaryRange(
                                  frontendJob.salaryMin,
                                  frontendJob.salaryMax,
                                  frontendJob.salaryCurrency,
                                  frontendJob.salaryPeriod,
                                )}
                              </span>
                            </div>
                            {frontendJob.salaryDescription && (
                              <div className="ml-6 text-xs bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
                                <p className="text-foreground italic">💰 {frontendJob.salaryDescription}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Experience:</span>
                          <span>{formatExperienceLevel(frontendJob.experienceLevel)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Visibility:</span>
                          <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full capitalize">
                            {frontendJob.visibility}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Service:</span>
                          <ServiceTypeBadge type={frontendJob.serviceType} />
                        </div>
                        <div className="flex items-center gap-2 text-xs col-span-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Assigned Consultant:</span>
                          <span className={frontendJob.assignedConsultantName ? 'font-medium' : 'text-muted-foreground'}>
                            {frontendJob.assignedConsultantName || 'Assigned to you'}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                        <p className="font-mono text-xs font-medium">{frontendJob.jobCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Posted</p>
                        <p className="text-xs font-medium">{formatRelativeDate(frontendJob.postingDate)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Description</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <div className="prose prose-sm max-w-none text-xs leading-6" dangerouslySetInnerHTML={{ __html: frontendJob.description }} />
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <ul className="space-y-1.5">
                        {frontendJob.requirements.map((requirement, index) => (
                          <li key={`${requirement}-${index}`} className="flex items-start gap-2 text-xs">
                            <span className="text-primary mt-1">•</span>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <ul className="space-y-1.5">
                        {frontendJob.responsibilities.map((responsibility, index) => (
                          <li key={`${responsibility}-${index}`} className="flex items-start gap-2 text-xs">
                            <span className="text-primary mt-1">•</span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {frontendJob.jobBoardDistribution.length > 0 && (
                    <Card className="border-muted/60 shadow-none">
                      <CardHeader className="px-3 pt-3 pb-2">
                        <CardTitle className="text-sm font-semibold">Job Board Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <div className="flex flex-wrap gap-2">
                          {frontendJob.jobBoardDistribution.map((board) => (
                            <Badge key={board} variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                              {board}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-3">
                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 pt-0 px-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Total Views</span>
                        </div>
                        <span className="font-semibold">{frontendJob.viewsCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          <span>Apply Clicks</span>
                        </div>
                        <span className="font-semibold">{frontendJob.clicksCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>Applicants</span>
                        </div>
                        <span className="font-semibold">{frontendJob.applicantsCount || 0}</span>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Posted</p>
                        <p className="text-xs font-medium">{formatRelativeDate(frontendJob.postingDate)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <JobActivityFeed activities={activities} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applicants" className="mt-2 space-y-2">
              {activeRoundTab === 'overview' ? (
                <div className="space-y-4">
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between">
                      <JobApplicationsFilterBar
                        filters={applicationsFilters}
                        onFiltersChange={setApplicationsFilters}
                        totalCount={allApplications.length}
                        filteredCount={filteredApplications.length}
                      />
                    </div>
                  </div>

                  <ApplicationPipeline
                    jobId={frontendJob.id}
                    jobTitle={frontendJob.title}
                    jobServiceType={frontendJob.serviceType}
                    jobManagementType={frontendJob.managementType}
                    applications={filteredApplications}
                    enableMultiSelect={false}
                    isConsultantView={true}
                  />
                </div>
              ) : (
                (() => {
                  const round = rounds.find((item) => item.id === activeRoundTab);
                  if (!round) return null;

                  return (
                    <RoundDetailView
                      key={round.id}
                      jobId={frontendJob.id}
                      round={round}
                      applications={allApplications}
                      onRefresh={handleRefresh}
                      onApplicationClick={handleOpenCandidate}
                      allRounds={rounds}
                      onMoveToRound={async (applicationId, roundId) => {
                        try {
                          await moveCandidateToRound(applicationId, roundId);
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to move candidate');
                        }
                      }}
                      onMoveToNextRound={async (applicationId) => {
                        const currentIndex = rounds.findIndex((item) => item.id === round.id);
                        if (currentIndex === -1 || currentIndex === rounds.length - 1) {
                          toast.info('No next round available.');
                          return;
                        }

                        const nextRound = rounds[currentIndex + 1];
                        if (nextRound.fixedKey === 'HIRED') {
                          toast.error('Use the Offer tab to move candidates into Hired.');
                          return;
                        }

                        try {
                          await moveCandidateToRound(applicationId, nextRound.id);
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to move candidate');
                        }
                      }}
                      isSimpleFlow={frontendJob.setupType === 'simple'}
                    />
                  );
                })()
              )}
            </TabsContent>

            <TabsContent value="screening" className="mt-6">
              <InitialScreeningTab
                jobId={frontendJob.id}
                jobTitle={frontendJob.title}
                jobRequirements={frontendJob.requirements}
                jobDescription={frontendJob.description}
                job={frontendJob}
                canUseAiOverride={companyAiEnabled}
              />
            </TabsContent>

            <TabsContent value="candidates" className="mt-2">
              <CandidatesTab
                applications={allApplications}
                jobId={frontendJob.id}
                jobTitle={frontendJob.title}
                rounds={rounds.map((round) => ({ id: round.id, name: round.name }))}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="ai-interviews" className="h-full overflow-hidden p-6 pt-0">
              {!companyAiEnabled ? <AiLockedCard title="AI Interviews locked" message={aiLockMessage} /> : <JobAIInterviewsTab job={frontendJob} />}
            </TabsContent>

            <TabsContent value="offers" className="h-full overflow-hidden p-6 pt-0">
              <JobOffersTab
                jobId={frontendJob.id}
                jobTitle={frontendJob.title}
                applications={allApplications}
                rounds={rounds}
                onRefresh={handleRefresh}
                readOnly={isFullServiceHandoff}
              />
            </TabsContent>

            <TabsContent value="hired" className="h-full overflow-hidden p-6 pt-0">
              <JobOffersTab
                mode="hired"
                jobId={frontendJob.id}
                jobTitle={frontendJob.title}
                applications={allApplications}
                rounds={rounds}
                onRefresh={handleRefresh}
                readOnly={isFullServiceHandoff}
              />
            </TabsContent>

            <TabsContent value="tasks" className="h-full overflow-hidden p-6 pt-0">
              <JobTasksTab job={frontendJob} applications={allApplications} onRefresh={handleRefresh} />
            </TabsContent>

            <TabsContent value="inbox" className="h-full overflow-hidden p-6 pt-0">
              <JobInboxTab jobId={frontendJob.id} jobTitle={frontendJob.title} applications={allApplications} />
            </TabsContent>

            <TabsContent value="candidate-messages" className="h-full overflow-hidden p-6 pt-0">
              <div className="h-full flex flex-col gap-4">
                <div className="flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Candidate Messages</h2>
                    <p className="text-muted-foreground">Shared conversations with candidates and the hiring team</p>
                  </div>
                </div>
                <JobMessagesTab jobId={frontendJob.id} channelType="CANDIDATE_EMPLOYER" />
              </div>
            </TabsContent>

            <TabsContent value="company-chat" className="h-full overflow-hidden p-6 pt-0">
              <div className="h-full flex flex-col gap-4">
                <div className="flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Company Chat</h2>
                    <p className="text-muted-foreground">Private discussion with {frontendJob.employerName}</p>
                  </div>
                </div>
                <JobMessagesTab jobId={frontendJob.id} channelType="COMPANY_CONSULTANT" />
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {selectedApplication && (
        <CandidateAssessmentView
          key={selectedApplication.id}
          application={selectedApplication}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={frontendJob.title}
          jobId={frontendJob.id}
          onNext={handleOpenNextCandidate}
          onPrevious={handleOpenPreviousCandidate}
          hasNext={selectedApplicationIndex >= 0 && selectedApplicationIndex < filteredApplications.length - 1}
          hasPrevious={selectedApplicationIndex > 0}
          isSimpleFlow={frontendJob.setupType === 'simple'}
          canUseAiOverride={companyAiEnabled}
          statusUpdateDisabled
          statusUpdateDisabledReason="Use the kanban to manage candidates in this flow."
        />
      )}
    </DashboardPageLayout>
  );
}
