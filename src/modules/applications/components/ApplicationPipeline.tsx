// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Application, ApplicationStage } from "@/shared/types/application";
import { ApplicationCard } from "./ApplicationCard";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { updateApplicationStatus, getApplications } from "@/shared/lib/mockApplicationStorage";
import { applicationService } from "@/shared/lib/applicationService";
import { ConsultantCandidateService } from "@/shared/lib/consultant/consultantCandidateService";
import { toast } from "sonner";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronDown, Plus, Trash2, GripVertical, Settings, CalendarClock, FileSearch, Send, Star, Users, Play, Mail } from "lucide-react";
import { CreateRoundDialog } from "./CreateRoundDialog";
import { RoundConfigDrawer, RoundConfigTab } from "./RoundConfigDrawer";
import { AssessmentReviewDrawer } from "./AssessmentReviewDrawer";
import { InterviewScheduleDrawer } from "./InterviewScheduleDrawer";
import { RoundInterviewsDrawer } from "./RoundInterviewsDrawer";
import { InitialScreeningDrawer } from "./InitialScreeningDrawer";
import { OfferConfigurationDrawer } from "./OfferConfigurationDrawer";
import { OfferExecutionDrawer } from "./OfferExecutionDrawer";
import { JobRound, JobRoundType, jobRoundService } from "@/shared/lib/jobRoundService";
import { jobService } from "@/shared/lib/jobService";
import type { Job } from "@/shared/types/job";
import { MoveStageDialog } from "./MoveStageDialog";

interface ApplicationPipelineProps {
  jobId?: string;
  jobTitle?: string;
  applications?: Application[];
  isCompareMode?: boolean;
  selectedForComparison?: string[];
  onToggleSelect?: (applicationId: string) => void;
  enableMultiSelect?: boolean;
  selectedApplicationIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onApplicationMoved?: () => void; // Callback when application is moved (for parent to refresh)
  isConsultantView?: boolean; // When true, uses consultant API endpoints
}

type DragHandleProps = React.HTMLAttributes<HTMLDivElement>;

type PipelineApiCandidate = {
  id?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  photo?: string;
  resume_url?: string;
  linked_in_url?: string;
};

type PipelineApiApplication = {
  id: string;
  candidateId?: string;
  candidate_id?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhoto?: string;
  jobId?: string;
  job_id?: string;
  jobTitle?: string;
  employerName?: string;
  appliedDate?: string | Date;
  applied_date?: string | Date;
  status: string;
  stage: string;
  roundId?: string;
  round_id?: string;
  resumeUrl?: string;
  resume_url?: string;
  coverLetterUrl?: string;
  cover_letter_url?: string;
  portfolioUrl?: string;
  portfolio_url?: string;
  linkedInUrl?: string;
  linked_in_url?: string;
  customAnswers?: unknown[];
  custom_answers?: unknown[];
  isRead?: boolean;
  is_read?: boolean;
  isNew?: boolean;
  is_new?: boolean;
  tags?: string[];
  recruiterNotes?: string;
  recruiter_notes?: string;
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
  shortlisted?: boolean;
  manuallyAdded?: boolean;
  manually_added?: boolean;
  score?: number;
  aiMatchScore?: number;
  aiScore?: number;
  aiAnalysis?: string;
  candidate?: PipelineApiCandidate;
  job?: {
    title?: string;
    company?: {
      name?: string;
    };
  };
};

type PipelineRoundProgressMap = Record<string, { roundId?: string }>;
type PipelineJobApplicationsResponse = {
  applications?: PipelineApiApplication[];
  roundProgress?: PipelineRoundProgressMap;
};

type PipelineJobData = {
  job: Job;
};

const pipelineStages: { stage: ApplicationStage; label: string; color: string }[] = [
  { stage: "New Application", label: "New", color: "bg-blue-50 dark:bg-blue-950/30" },
  { stage: "Resume Review", label: "Screening", color: "bg-purple-50 dark:bg-purple-950/30" },
  { stage: "Phone Screen", label: "Phone Screen", color: "bg-amber-50 dark:bg-amber-950/30" },
  { stage: "Technical Interview", label: "Interview", color: "bg-cyan-50 dark:bg-cyan-950/30" },
  { stage: "Offer Extended", label: "Offer", color: "bg-green-50 dark:bg-green-950/30" },
  { stage: "Offer Accepted", label: "Hired", color: "bg-emerald-50 dark:bg-emerald-950/30" },
  { stage: "Rejected", label: "Rejected", color: "bg-red-50 dark:bg-red-950/30" },
];

// Sortable Round Column Wrapper - allows dragging round columns to reorder
const SortableRoundColumn = React.memo(function SortableRoundColumn({
  round,
  applications,
  onApplicationClick,
  isCompareMode,
  selectedForComparison,
  onToggleSelect,
  onStageChange,
  onMoveToRound,
  onDeleteRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onViewInterviews,
  onViewRoundInterviews,
  onOpenScreening,
  onConfigureOffer,
  onExecuteOffer,
  onOpenAssessmentDrawer,
  onConfigureEmail,
  isSimpleFlow,
  optimisticMoves,
  failedMoves,
  restrictToOfferActions = false,
  pendingApplicationIds,
}: {
  round: JobRound;
  applications: Application[];
  onApplicationClick: (application: Application) => void;
  isCompareMode: boolean;
  selectedForComparison: string[];
  onToggleSelect?: (applicationId: string) => void;
  onStageChange: (applicationId: string, newStage: ApplicationStage) => void;
  onMoveToRound?: (applicationId: string, roundId: string) => void;
  onDeleteRound?: (roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds: JobRound[];
  onViewInterviews?: (application: Application) => void;
  onViewRoundInterviews?: (roundId: string) => void;
  onOpenScreening?: (round: JobRound) => void;
  onConfigureOffer?: (roundId: string) => void;
  onExecuteOffer?: (roundId: string) => void;
  onOpenAssessmentDrawer?: (round: JobRound) => void;
  onConfigureEmail?: (round: JobRound) => void;
  isSimpleFlow?: boolean;
  optimisticMoves: Map<string, string>;
  failedMoves: Set<string>;
  restrictToOfferActions?: boolean;
  dragHandleProps?: DragHandleProps;
  pendingApplicationIds?: Set<string>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: `round-${round.id}`,
    disabled: round.isFixed, // Fixed rounds cannot be reordered
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  return (
    <div ref={setSortableRef} style={style} className="min-w-0">
      <StageColumn
        round={round}
        applications={applications}
        onApplicationClick={onApplicationClick}
        isCompareMode={isCompareMode}
        selectedForComparison={selectedForComparison}
        onToggleSelect={onToggleSelect}
        onStageChange={onStageChange}
        onMoveToRound={onMoveToRound}
        onDeleteRound={onDeleteRound}
        onConfigureAssessment={onConfigureAssessment}
        onConfigureInterview={onConfigureInterview}
        allRounds={allRounds}
        onViewInterviews={onViewInterviews}
        onViewRoundInterviews={onViewRoundInterviews}
        onOpenScreening={onOpenScreening}
        onConfigureOffer={onConfigureOffer}
        onExecuteOffer={onExecuteOffer}
        onOpenAssessmentDrawer={onOpenAssessmentDrawer}
        onConfigureEmail={onConfigureEmail}
        isSimpleFlow={isSimpleFlow}
        optimisticMoves={optimisticMoves}
        failedMoves={failedMoves}
        restrictToOfferActions={restrictToOfferActions}
        dragHandleProps={!round.isFixed && !restrictToOfferActions ? { ...attributes, ...listeners } : undefined}
        pendingApplicationIds={pendingApplicationIds}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.round?.id === nextProps.round?.id &&
    prevProps.applications === nextProps.applications &&
    prevProps.isSimpleFlow === nextProps.isSimpleFlow &&
    prevProps.optimisticMoves === nextProps.optimisticMoves &&
    prevProps.failedMoves === nextProps.failedMoves
  );
});

// Stage Column Component with Droppable
const StageColumn = React.memo(function StageColumn({
  round,
  applications,
  onApplicationClick,
  isCompareMode,
  selectedForComparison,
  onToggleSelect,
  onStageChange,
  onMoveToRound,
  onDeleteRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onViewInterviews,
  onViewRoundInterviews,
  onOpenScreening,
  onExecuteOffer,
  onConfigureOffer,
  onOpenAssessmentDrawer,
  onConfigureEmail,
  isSimpleFlow,
  optimisticMoves,
  failedMoves,
  restrictToOfferActions = false,
  dragHandleProps,
  pendingApplicationIds,
}: {
  round: JobRound;
  applications: Application[];
  onApplicationClick: (application: Application) => void;
  isCompareMode: boolean;
  selectedForComparison: string[];
  onToggleSelect?: (applicationId: string) => void;
  onStageChange: (applicationId: string, newStage: ApplicationStage) => void;
  onMoveToRound?: (applicationId: string, roundId: string) => void;
  onDeleteRound?: (roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds: JobRound[];
  onViewInterviews?: (application: Application) => void;
  onViewRoundInterviews?: (roundId: string) => void;
  onOpenScreening?: (round: JobRound) => void;
  onConfigureOffer?: (roundId: string) => void;
  onExecuteOffer?: (roundId: string) => void;
  onOpenAssessmentDrawer?: (round: JobRound) => void;
  onConfigureEmail?: (round: JobRound) => void;
  isSimpleFlow?: boolean;
  optimisticMoves: Map<string, string>;
  failedMoves: Set<string>;
  restrictToOfferActions?: boolean;
  dragHandleProps?: DragHandleProps;
  pendingApplicationIds?: Set<string>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: round.id,
  });
  const selectedSet = useMemo(() => new Set(selectedForComparison), [selectedForComparison]);

  // Get color based on round type and fixed status
  const getRoundColor = (round: JobRound): string => {
    if (round.isFixed) {
      if (round.fixedKey === 'NEW') return 'bg-blue-50 dark:bg-blue-950/30';
      if (round.fixedKey === 'OFFER') return 'bg-green-50 dark:bg-green-950/30';
      if (round.fixedKey === 'HIRED') return 'bg-emerald-50 dark:bg-emerald-950/30';
      if (round.fixedKey === 'REJECTED') return 'bg-red-50 dark:bg-red-950/30';
    }
    return round.type === 'INTERVIEW'
      ? 'bg-cyan-50 dark:bg-cyan-950/30'
      : 'bg-purple-50 dark:bg-purple-950/30';
  };

  return (
    <div className="min-w-0">
      <Card className={`${getRoundColor(round)} border h-full flex flex-col shadow-none ${isOver ? 'ring-1 ring-primary' : ''}`}>
        <div className="p-2.5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div
              className={`flex items-center gap-2 flex-1 min-w-0 ${round.isFixed && round.fixedKey === 'NEW' ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={(e) => {
                if (round.isFixed && round.fixedKey === 'NEW' && onOpenScreening) {
                  e.stopPropagation();
                  onOpenScreening(round);
                }
              }}
            >
              {dragHandleProps && !round.isFixed && (
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <h3 className="font-semibold text-xs truncate">{round.name}</h3>
              {!round.isFixed && round.type === 'INTERVIEW' && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 rounded-full shrink-0">
                  Interview
                </Badge>
              )}
              {!round.isFixed && round.type === 'ASSESSMENT' && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 rounded-full shrink-0">
                  Assessment
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-full">
                {applications.length}
              </Badge>
              {onConfigureEmail && !isSimpleFlow && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureEmail(round);
                  }}
                  title="Configure Auto-Reply Email"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
              {round.isFixed && round.fixedKey === 'NEW' && !isSimpleFlow && (
                <>
                  {onOpenScreening && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenScreening(round);
                      }}
                      title="Open Initial Screening"
                    >
                      <FileSearch className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && round.type === 'ASSESSMENT' && !isSimpleFlow && (
                <>
                  {onOpenAssessmentDrawer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAssessmentDrawer(round);
                      }}
                      title="Review Assessments"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {onConfigureAssessment && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureAssessment(round.id);
                      }}
                      title="Configure Assessment"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && round.type === 'INTERVIEW' && !isSimpleFlow && (
                <>
                  {onConfigureInterview && !isSimpleFlow && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureInterview(round.id);
                      }}
                      title="Configure Interview"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                  {onViewRoundInterviews && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewRoundInterviews(round.id);
                      }}
                      title="View Round Interviews"
                    >
                      <CalendarClock className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {round.isFixed && round.fixedKey === 'OFFER' && !isSimpleFlow && (
                <>
                  {onConfigureOffer && !isSimpleFlow && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureOffer(round.id);
                      }}
                      title="Configure Offer Settings"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                  {onExecuteOffer && applications.length > 0 && !isSimpleFlow && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExecuteOffer(round.id);
                      }}
                      title="Send Offers"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && onDeleteRound && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRound(round.id);
                  }}
                  title="Delete Round"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div ref={setNodeRef} className="flex-1 min-h-[150px]">
            <SortableContext items={applications.filter((app): app is Application => !!app?.id).map((app) => app.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 flex-1 overflow-y-auto min-h-[150px]">
                {applications.filter((application): application is Application => !!application?.id).map((application) => (
                  <div key={application.id} className="relative group">
                    <ApplicationCard
                      application={application}
                      onClick={() => onApplicationClick(application)}
                      isCompareMode={isCompareMode}
                      isSelected={selectedSet.has(application.id)}
                      onToggleSelect={onToggleSelect}
                      variant="minimal"
                      allRounds={allRounds}
                      onMoveToRound={onMoveToRound}
                      onViewInterviews={onViewInterviews}
                      isOptimisticMove={optimisticMoves.has(application.id)}
                      hasFailed={failedMoves.has(application.id)}
                      isSimpleFlow={isSimpleFlow}
                      isPendingApproval={pendingApplicationIds?.has(application.id)}
                      dragDisabled={restrictToOfferActions}
                      restrictToOfferActions={restrictToOfferActions}
                    />
                  </div>
                ))}

                {applications.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No applications
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        </div>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.round?.id === nextProps.round?.id &&
    prevProps.applications === nextProps.applications &&
    prevProps.optimisticMoves === nextProps.optimisticMoves &&
    prevProps.failedMoves === nextProps.failedMoves
  );
});

export function ApplicationPipeline({
  jobId,
  jobTitle = "Position",
  applications: providedApplications,
  isCompareMode = false,
  selectedForComparison = [],
  onToggleSelect,
  enableMultiSelect = false,
  selectedApplicationIds = [],
  onSelectionChange,
  onApplicationMoved,
  isConsultantView = false,
}: ApplicationPipelineProps) {
  // Service layer - switches between employer and consultant APIs
  const appService = isConsultantView ? ConsultantCandidateService : applicationService;
  const queryClient = useQueryClient();

  // Consultant view: fetch pending decision requests for "Awaiting approval" badge
  const { data: decisionRequestsData } = useQuery({
    queryKey: ['consultant-decision-requests', 'PENDING'],
    queryFn: async () => {
      const res = await ConsultantCandidateService.listDecisionRequests('PENDING');
      if (!res.success || !res.data) return [];
      return res.data.requests || [];
    },
    enabled: isConsultantView && !!jobId,
  });
  const pendingApplicationIds = useMemo(() => {
    if (!isConsultantView || !jobId || !decisionRequestsData) return undefined;
    const ids = (decisionRequestsData as any[])
      .filter((r: any) => r.job_id === jobId || r.jobId === jobId)
      .map((r: any) => r.application_id || r.applicationId);
    return new Set(ids);
  }, [isConsultantView, jobId, decisionRequestsData]);

  // Core state
  const [applications, setApplications] = useState<Application[]>([]);
  const [rounds, setRounds] = useState<JobRound[]>([]);
  const [jobData, setJobData] = useState<PipelineJobData | null>(null);
  const isSimpleFlow = jobData?.job?.setupType === 'simple';
  const isOfferOnlyCompanyView = !isConsultantView && jobData?.job?.managementType === 'hrm8-managed';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Optimistic update state - for instant UI feedback
  const [optimisticMoves, setOptimisticMoves] = useState<Map<string, string>>(new Map());
  const [failedMoves, setFailedMoves] = useState<Set<string>>(new Set());

  // Drawer state consolidation
  type DrawerState = {
    type: 'config' | 'assessment' | 'interview' | 'screening' | 'offer-config' | 'offer-exec' | null;
    round: JobRound | null;
    application: Application | null;
    initialTab?: RoundConfigTab;
  };
  const [drawerState, setDrawerState] = useState<DrawerState>({
    type: null,
    round: null,
    application: null,
  });

  // Move dialog state consolidation
  const [moveDialogState, setMoveDialogState] = useState({
    open: false,
    application: null as Application | null,
    targetRound: null as JobRound | null,
    isMoving: false,
  });

  // UI state consolidation
  const [uiState, setUIState] = useState({
    createRoundDialogOpen: false,
    detailPanelOpen: false,
    selectedApplication: null as Application | null,
    activeId: null as string | null,
    activeRoundId: null as string | null,
  });

  // Legacy state aliases for backward compatibility (to avoid breaking existing code)
  const activeId = uiState.activeId;
  const setActiveId = (id: string | null) => setUIState(prev => ({ ...prev, activeId: id }));
  const activeRoundId = uiState.activeRoundId;
  const setActiveRoundId = (id: string | null) => setUIState(prev => ({ ...prev, activeRoundId: id }));
  const selectedApplication = uiState.selectedApplication;
  const setSelectedApplication = (app: Application | null) => setUIState(prev => ({ ...prev, selectedApplication: app }));
  const detailPanelOpen = uiState.detailPanelOpen;
  const setDetailPanelOpen = (open: boolean) => setUIState(prev => ({ ...prev, detailPanelOpen: open }));
  const createRoundDialogOpen = uiState.createRoundDialogOpen;
  const setCreateRoundDialogOpen = (open: boolean) => setUIState(prev => ({ ...prev, createRoundDialogOpen: open }));

  // Drawer state aliases
  const configDrawerOpen = drawerState.type === 'config';
  const setConfigDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const selectedRoundForConfig = drawerState.type === 'config' ? drawerState.round : null;
  const setSelectedRoundForConfig = (round: JobRound | null) => {
    if (round) setDrawerState(prev => ({ ...prev, round }));
  };
  const initialConfigTab = drawerState.initialTab || 'general';
  const setInitialConfigTab = (tab: RoundConfigTab) => {
    setDrawerState(prev => ({ ...prev, initialTab: tab }));
  };

  const interviewScheduleDrawerOpen = drawerState.type === 'interview';
  const setInterviewScheduleDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const selectedApplicationForInterviews = drawerState.type === 'interview' ? drawerState.application : null;
  const setSelectedApplicationForInterviews = (app: Application | null) => {
    if (app) setDrawerState({ type: 'interview', round: null, application: app });
  };

  const selectedRoundForInterviews = drawerState.type === 'interview' ? drawerState.round : null;
  const setSelectedRoundForInterviews = (round: JobRound | null) => {
    if (round) setDrawerState({ type: 'interview', round, application: null });
  };

  const screeningDrawerOpen = drawerState.type === 'screening';
  const setScreeningDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const selectedRoundForScreening = drawerState.type === 'screening' ? drawerState.round : null;
  const setSelectedRoundForScreening = (round: JobRound | null) => {
    if (round) setDrawerState({ type: 'screening', round, application: null });
  };

  const offerConfigDrawerOpen = drawerState.type === 'offer-config';
  const setOfferConfigDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const offerExecutionDrawerOpen = drawerState.type === 'offer-exec';
  const setOfferExecutionDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const selectedRoundForOffer = drawerState.type === 'offer-config' || drawerState.type === 'offer-exec' ? drawerState.round : null;
  const setSelectedRoundForOffer = (round: JobRound | null) => {
    if (round) setDrawerState(prev => ({ ...prev, round }));
  };

  const assessmentReviewDrawerOpen = drawerState.type === 'assessment';
  const setAssessmentReviewDrawerOpen = (open: boolean) => {
    if (!open) setDrawerState({ type: null, round: null, application: null });
  };
  const selectedRoundForReview = drawerState.type === 'assessment' ? drawerState.round : null;
  const setSelectedRoundForReview = (round: JobRound | null) => {
    if (round) setDrawerState({ type: 'assessment', round, application: null });
  };

  // Move dialog state aliases
  const isMoveStageDialogOpen = moveDialogState.open;
  const setIsMoveStageDialogOpen = (open: boolean) => setMoveDialogState(prev => ({ ...prev, open }));
  const pendingMoveApplication = moveDialogState.application;
  const setPendingMoveApplication = (app: Application | null) => setMoveDialogState(prev => ({ ...prev, application: app }));
  const pendingTargetRound = moveDialogState.targetRound;
  const setPendingTargetRound = (round: JobRound | null) => setMoveDialogState(prev => ({ ...prev, targetRound: round }));
  const pendingIsMoving = moveDialogState.isMoving;
  const setPendingIsMoving = (moving: boolean) => setMoveDialogState(prev => ({ ...prev, isMoving: moving }));

  // Effect 1: Load initial data when jobId changes
  useEffect(() => {
    if (!jobId) return;

    // Parallel loading for speed
    Promise.all([
      loadRounds(),
      loadJobData()
    ]);
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: Handle provided applications or load from API
  useEffect(() => {
    if (providedApplications !== undefined) {
      // Merge optimistic moves with provided applications
      // This prevents overwriting optimistic state when parent re-renders
      const mergedApplications = providedApplications.filter((app): app is Application => !!app?.id).map(app => {
        const optimisticRoundId = optimisticMoves.get(app.id);
        if (optimisticRoundId) {
          return { ...app, roundId: optimisticRoundId };
        }
        return app;
      });
      setApplications(mergedApplications);
    } else if (jobId) {
      loadApplications();
    }
  }, [providedApplications, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobData = async () => {
    if (!jobId) return;
    // Skip job data loading for consultant view - not needed for pipeline
    if (isConsultantView) return;
    try {
      const response = await jobService.getJobById(jobId);
      if (response.success && response.data) {
        setJobData(response.data);
      }
    } catch (error) {
      console.error('Failed to load job data:', error);
    }
  };

  const loadRounds = async () => {
    if (!jobId) return;

    try {
      // Use consultant service for rounds if in consultant view
      const response = isConsultantView
        ? await ConsultantCandidateService.getJobRounds(jobId)
        : await jobRoundService.getJobRounds(jobId);

      if (response.success && response.data) {
        const loadedRounds = response.data.rounds || [];
        // Ensure we always have the 4 fixed rounds
        const fixedRoundKeys = ['NEW', 'OFFER', 'HIRED', 'REJECTED'];
        const fixedRounds = fixedRoundKeys.map((key, idx) => {
          const existing = loadedRounds.find(r => r.fixedKey === key);
          if (existing) return existing;
          // Create fallback fixed round if missing
          return {
            id: `fixed-${key}-${jobId}`,
            jobId,
            name: key === 'NEW' ? 'New' : key === 'OFFER' ? 'Offer' : key === 'HIRED' ? 'Hired' : 'Rejected',
            order: key === 'NEW' ? 1 : key === 'OFFER' ? 999 : key === 'HIRED' ? 1000 : 1001,
            type: 'ASSESSMENT' as JobRoundType,
            isFixed: true,
            fixedKey: key,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        // Separate custom rounds and sort them
        const customRounds = loadedRounds.filter(r => !r.isFixed).sort((a, b) => a.order - b.order);

        // Build final array: NEW (1), then custom rounds (2-998), then OFFER (999), HIRED (1000), REJECTED (1001)
        const allRounds: JobRound[] = [];

        // Always start with NEW
        const newRound = fixedRounds.find(r => r.fixedKey === 'NEW');
        if (newRound) allRounds.push(newRound);

        // Add custom rounds (they should have orders between 2 and 998)
        allRounds.push(...customRounds);

        // Add end fixed rounds
        const offerRound = fixedRounds.find(r => r.fixedKey === 'OFFER');
        const hiredRound = fixedRounds.find(r => r.fixedKey === 'HIRED');
        const rejectedRound = fixedRounds.find(r => r.fixedKey === 'REJECTED');
        if (offerRound) allRounds.push(offerRound);
        if (hiredRound) allRounds.push(hiredRound);
        if (rejectedRound) allRounds.push(rejectedRound);

        // Final sort by order to ensure correct sequence
        allRounds.sort((a, b) => a.order - b.order);

        setRounds(allRounds);
      }
    } catch (error) {
      console.error('Failed to load rounds:', error);
      // Create default fixed rounds if backend fails
      if (jobId) {
        const defaultRounds: JobRound[] = [
          { id: `fixed-NEW-${jobId}`, jobId, name: 'New', order: 1, type: 'ASSESSMENT', isFixed: true, fixedKey: 'NEW', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-OFFER-${jobId}`, jobId, name: 'Offer', order: 999, type: 'ASSESSMENT', isFixed: true, fixedKey: 'OFFER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-HIRED-${jobId}`, jobId, name: 'Hired', order: 1000, type: 'ASSESSMENT', isFixed: true, fixedKey: 'HIRED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-REJECTED-${jobId}`, jobId, name: 'Rejected', order: 1001, type: 'ASSESSMENT', isFixed: true, fixedKey: 'REJECTED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];
        setRounds(defaultRounds);
      }
    }
  };


  const loadApplications = async (): Promise<Record<string, string> | undefined> => {
    if (providedApplications) {
      // Use provided filtered applications
      setApplications(providedApplications);
      return undefined;
    } else if (jobId) {
      // Load from API if jobId is provided
      try {
        const response = await appService.getJobApplications(jobId);
        const responseData = response.data as PipelineJobApplicationsResponse | undefined;
        const apiApplications = responseData?.applications || [];

        // Extract round progress mapping
        const roundMap: Record<string, string> = {};
        if (responseData?.roundProgress) {
          Object.entries(responseData.roundProgress).forEach(([appId, progress]) => {
            if (progress.roundId) {
              roundMap[appId] = progress.roundId;
            }
          });
        }

        // Map API applications to frontend Application type
        // Handle both pre-transformed consultant data and raw employer API data
        const mappedApplications: Application[] = apiApplications
          .filter((app): app is PipelineApiApplication => !!app?.id)
          .map((app) => {
          const extractedRoundId = app.roundId || app.round_id || roundMap[app.id];

          // Debug logging
          if (!extractedRoundId) {
            console.log('[ApplicationPipeline] No roundId found for application:', {
              appId: app.id,
              stage: app.stage,
              hasDirectRoundId: !!app.roundId,
              hasSnakeCaseRoundId: !!app.round_id,
              hasRoundProgress: !!roundMap[app.id],
              roundProgressKeys: Object.keys(roundMap)
            });
          }

          return {
            id: app.id,
            candidateId: app.candidateId || app.candidate_id || app.candidate?.id || '',
            // Handle pre-transformed data (candidateName) or raw data (candidate.firstName/first_name)
            candidateName: app.candidateName || (
              (app.candidate?.firstName && app.candidate?.lastName)
                ? `${app.candidate.firstName} ${app.candidate.lastName}`
                : (app.candidate?.first_name && app.candidate?.last_name)
                  ? `${app.candidate.first_name} ${app.candidate.last_name}`
                  : 'Unknown Candidate'
            ),
            candidateEmail: app.candidateEmail || app.candidate?.email || '',
            candidatePhoto: app.candidatePhoto || app.candidate?.photo,
            jobId: app.jobId || app.job_id,
            jobTitle: app.jobTitle || app.job?.title || 'Unknown Job',
            employerName: app.employerName || app.job?.company?.name || 'Unknown Company',
            appliedDate: app.appliedDate ? new Date(app.appliedDate) : (app.applied_date ? new Date(app.applied_date) : new Date()),
            status: mapApplicationStatus(app.status),
            stage: mapApplicationStage(app.stage),
            roundId: extractedRoundId, // Try direct field first, then fallback to roundProgress map
            resumeUrl: app.resumeUrl || app.resume_url || app.candidate?.resume_url,
            coverLetterUrl: app.coverLetterUrl || app.cover_letter_url,
            portfolioUrl: app.portfolioUrl || app.portfolio_url,
            linkedInUrl: app.linkedInUrl || app.linked_in_url || app.candidate?.linked_in_url,
            customAnswers: app.customAnswers || app.custom_answers || [],
            isRead: app.isRead ?? app.is_read,
            isNew: app.isNew ?? app.is_new,
            tags: app.tags || [],
            recruiterNotes: app.recruiterNotes || app.recruiter_notes,
            notes: [],
            activities: [],
            interviews: [],
            createdAt: app.createdAt ? new Date(app.createdAt) : (app.created_at ? new Date(app.created_at) : new Date()),
            updatedAt: app.updatedAt ? new Date(app.updatedAt) : (app.updated_at ? new Date(app.updated_at) : new Date()),
            shortlisted: app.shortlisted || false,
            manuallyAdded: app.manuallyAdded || app.manually_added || false,
            // Include AI scoring fields for ApplicationCard display
            score: app.score,
            aiMatchScore: app.aiMatchScore || app.aiScore || app.score, // Used by AIMatchBadge
            aiAnalysis: app.aiAnalysis, // Used for recommendation badge and justification
          };
        });

        // Apply optimistic moves to prevent overwriting ongoing drag operations
        const mergedApplications = mappedApplications.map(app => {
          const optimisticRoundId = optimisticMoves.get(app.id);
          if (optimisticRoundId) {
            return { ...app, roundId: optimisticRoundId };
          }
          return app;
        });

        setApplications(mergedApplications);
        return undefined;
      } catch (error) {
        console.error('Failed to load applications:', error);
        // Fallback to mock data
        const allApps = getApplications();
        const filtered = allApps.filter(app => app.jobId === jobId);

        // Apply optimistic moves
        const mergedFiltered = filtered.map(app => {
          const optimisticRoundId = optimisticMoves.get(app.id);
          if (optimisticRoundId) {
            return { ...app, roundId: optimisticRoundId };
          }
          return app;
        });

        setApplications(mergedFiltered);
        return undefined;
      }
    } else {
      // Fetch all from mock storage
      const allApps = getApplications();

      // Apply optimistic moves
      const mergedAllApps = allApps.map(app => {
        const optimisticRoundId = optimisticMoves.get(app.id);
        if (optimisticRoundId) {
          return { ...app, roundId: optimisticRoundId };
        }
        return app;
      });

      setApplications(mergedAllApps);
      return undefined;
    }
  };

  // Map backend ApplicationStatus to frontend ApplicationStatus
  const mapApplicationStatus = (status: string): Application['status'] => {
    const statusMap: Record<string, Application['status']> = {
      'NEW': 'applied',
      'SCREENING': 'screening',
      'INTERVIEW': 'interview',
      'OFFER': 'offer',
      'HIRED': 'hired',
      'REJECTED': 'rejected',
      'WITHDRAWN': 'withdrawn',
    };
    return statusMap[status] || 'applied';
  };

  // Map backend ApplicationStage to frontend ApplicationStage
  const mapApplicationStage = (stage: string): ApplicationStage => {
    const stageMap: Record<string, ApplicationStage> = {
      'NEW_APPLICATION': 'New Application',
      'RESUME_REVIEW': 'Resume Review',
      'PHONE_SCREEN': 'Phone Screen',
      'TECHNICAL_INTERVIEW': 'Technical Interview',
      'ONSITE_INTERVIEW': 'Manager Interview',
      'OFFER_EXTENDED': 'Offer Extended',
      'OFFER_ACCEPTED': 'Offer Accepted',
      'REJECTED': 'Rejected',
    };
    return stageMap[stage] || 'New Application';
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isOfferOnlyCompanyView) {
      return;
    }
    const id = event.active.id as string;
    // Check if dragging a round column (starts with "round-")
    if (id.startsWith('round-')) {
      setActiveRoundId(id);
    } else {
      // Dragging an application
      setActiveId(id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isOfferOnlyCompanyView) {
      setActiveId(null);
      setActiveRoundId(null);
      return;
    }
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveRoundId(null);
      return;
    }

    const activeIdStr = active.id as string;

    // Handle round column reordering
    if (activeIdStr.startsWith('round-')) {
      if (over.id.toString().startsWith('round-')) {
        const activeRoundId = activeIdStr.replace('round-', '');
        const overRoundId = over.id.toString().replace('round-', '');

        if (activeRoundId !== overRoundId) {
          await handleRoundReorder(activeRoundId, overRoundId);
        }
      }
      setActiveRoundId(null);
      return;
    }

    // Handle application drag between rounds
    const application = applications.find((app) => app.id === active.id);
    if (!application) {
      setActiveId(null);
      return;
    }

    // Check if dropped on a round column (droppable area)
    let targetRound: JobRound | null = null;

    // Check if dropped directly on a round column
    targetRound = rounds.find(r => r.id === over.id) || null;

    // Handle case where it dropped on the SortableRoundColumn wrapper
    if (!targetRound && over.id.toString().startsWith('round-')) {
      const cleanId = over.id.toString().replace('round-', '');
      targetRound = rounds.find(r => r.id === cleanId) || null;
    }

    if (!targetRound) {
      // Dropped on another card - find which round that card's application belongs to
      const targetApplication = applications.find((app) => app.id === over.id);
      if (targetApplication) {
        // Find the round this application is currently in
        targetRound = rounds.find(r => {
          const roundName = r.name.toLowerCase();
          const stageName = targetApplication.stage.toLowerCase();
          // Improve matching logic to use ID if possible or reliable stage map
          if (targetApplication.roundId && r.id === targetApplication.roundId) return true;

          if (roundName.includes(stageName) || stageName.includes(roundName)) return true;
          return false;
        }) || null;
      }
    }

    // If we found a target round, move application to that round
    if (targetRound) {
      const currentRound = findRoundForApplication(application);
      if (targetRound.fixedKey === 'HIRED') {
        toast.error("Direct move blocked", {
          description: "Use the Offer tab onboarding flow to move a candidate to Hired.",
          duration: 3500,
        });
        setActiveId(null);
        return;
      }
      if (currentRound?.fixedKey === 'HIRED') {
        toast.error("Move blocked", {
          description: "A hired candidate cannot be moved to another round.",
          duration: 3500,
        });
        setActiveId(null);
        return;
      }
      await handleMoveToRound(application.id, targetRound.id);
    }

    setActiveId(null);
  };

  const handleRoundReorder = async (activeRoundId: string, overRoundId: string) => {
    if (!jobId) return;

    const activeIndex = rounds.findIndex(r => r.id === activeRoundId);
    const overIndex = rounds.findIndex(r => r.id === overRoundId);

    if (activeIndex === -1 || overIndex === -1) return;

    const activeRound = rounds[activeIndex];
    const overRound = rounds[overIndex];

    if (activeRound.isFixed) {
      toast.error('Fixed rounds cannot be reordered');
      return;
    }

    // Don't allow placing custom rounds before NEW or after REJECTED
    if (overRound.fixedKey === 'NEW' && activeIndex > overIndex) {
      toast.error('Cannot place rounds before "New"');
      return;
    }

    // Calculate new order based on the over round's order
    let newOrder: number;
    if (overRound.isFixed) {
      // If dropping on a fixed round, place before it (for OFFER) or after it (for others)
      if (overRound.fixedKey === 'OFFER' || overRound.fixedKey === 'HIRED') {
        newOrder = overRound.order - 1;
      } else {
        newOrder = overRound.order + 1;
      }
    } else {
      newOrder = overRound.order;
    }

    // Calculate new order for the moved round
    const reorderedRounds = arrayMove(rounds, activeIndex, overIndex);

    // Optimistically update UI
    setRounds(reorderedRounds);

    // Update the active round's order on backend
    try {
      const response = await jobRoundService.updateRound(jobId, activeRoundId, { order: newOrder });

      if (!response.success) {
        // Revert on error
        loadRounds();
        toast.error(response.error || 'Failed to reorder round');
      } else {
        // Reload to get updated orders from backend
        loadRounds();
      }
    } catch (error) {
      console.error('Failed to reorder round:', error);
      loadRounds(); // Revert on error
      toast.error('Failed to reorder round');
    }
  };

  // Helper to find current round for an application
  const findRoundForApplication = (app: Application): JobRound | undefined => {
    if (app.roundId) {
      return rounds.find(r => r.id === app.roundId);
    }
    // Fallback logic specific to how getApplicationsForRound works
    return rounds.find(round => {
      const roundName = round.name.toLowerCase();
      const stageName = app.stage.toLowerCase();
      if (round.isFixed) {
        if (round.fixedKey === 'NEW' && (stageName.includes('new'))) return true;
        if (round.fixedKey === 'OFFER' && stageName.includes('offer')) return true;
        if (round.fixedKey === 'HIRED' && stageName.includes('hired')) return true;
        if (round.fixedKey === 'REJECTED' && stageName.includes('rejected')) return true;
      }
      if (stageName.includes(roundName) || roundName.includes(stageName)) return true;
      const stageConfig = pipelineStages.find(s => s.stage === app.stage);
      if (stageConfig) {
        const labelName = stageConfig.label.toLowerCase();
        if (roundName.includes(labelName) || labelName.includes(roundName)) return true;
      }
      return false;
    });
  };

  const handleStageChange = async (applicationId: string, newStage: ApplicationStage) => {
    // Deprecated in favor of Round Movement, but kept for compatibility with detail panel if needed
    // Logic remains similar but we should encourage round movement
    try {
      // ... existing implementation ...
      // For now, let's just delegate to the existing logic or keep it as is since it's used by the DetailPanel directly
      // However, DetailPanel now uses MoveStageDialog on its own.
      // So this might only be called by other components (none in this file use it directly except SortableRoundColumn prop passing)

      const stageMap: Record<ApplicationStage, string> = {
        "New Application": "NEW_APPLICATION",
        "Resume Review": "RESUME_REVIEW",
        "Phone Screen": "PHONE_SCREEN",
        "Technical Interview": "TECHNICAL_INTERVIEW",
        "Manager Interview": "ONSITE_INTERVIEW",
        "Final Round": "ONSITE_INTERVIEW",
        "Reference Check": "ONSITE_INTERVIEW",
        "Offer Extended": "OFFER_EXTENDED",
        "Offer Accepted": "OFFER_ACCEPTED",
        "Rejected": "REJECTED",
        "Withdrawn": "REJECTED",
      };

      const backendStage = stageMap[newStage] || "NEW_APPLICATION";
      if (isOfferOnlyCompanyView && !['OFFER_EXTENDED', 'OFFER_ACCEPTED'].includes(backendStage)) {
        toast.error("Offer actions only", {
          description: "For HRM8 Managed Recruitment jobs, your company can only take action in the Offer round.",
        });
        return;
      }
      const response = await applicationService.updateStage(applicationId, backendStage);

      if (response.success) {
        const statusMapForUpdate: Record<string, Application['status']> = {
          "New Application": "applied",
          "Resume Review": "screening",
          "Phone Screen": "screening",
          "Technical Interview": "interview",
          "Manager Interview": "interview",
          "Offer Extended": "offer",
          "Offer Accepted": "hired",
          "Rejected": "rejected"
        };
        updateApplicationStatus(applicationId, statusMapForUpdate[newStage] || "applied", newStage);
        if (providedApplications === undefined) {
          loadApplications();
        } else {
          onApplicationMoved?.();
        }
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('Failed to update application stage');
    }
  };

  const handleMoveToRound = async (applicationId: string, roundId: string) => {
    // 1. Identify Application and Target Round
    const application = applications.find(app => app?.id === applicationId);
    const targetRound = rounds.find(r => r.id === roundId);

    if (!application || !targetRound) {
      console.error("Application or Target Round not found", { applicationId, roundId });
      return;
    }

    if (isOfferOnlyCompanyView && targetRound.fixedKey !== 'OFFER') {
      toast.error("Offer actions only", {
        description: "For HRM8 Managed Recruitment jobs, your company can only take action in the Offer round.",
        duration: 4000,
      });
      return;
    }

    // 2. Identify Current Round
    const currentRound = findRoundForApplication(application);

    // Global hard restrictions for hired stage
    if (targetRound.fixedKey === 'HIRED') {
      toast.error("Direct move blocked", {
        description: "Use the Offer tab onboarding flow to move a candidate to Hired.",
        duration: 3500,
      });
      return;
    }
    if (currentRound?.fixedKey === 'HIRED') {
      toast.error("Move blocked", {
        description: "A hired candidate cannot be moved to another round.",
        duration: 3500,
      });
      return;
    }

    // 3. Validation Logic - SKIP FOR SIMPLE FLOW (no restrictions)
    if (!isSimpleFlow) {
      let isAllowed = false;

      // Rule: Can always move to Rejected
      if (targetRound.isFixed && targetRound.fixedKey === 'REJECTED') {
        isAllowed = true;
      }
      // Rule: Can move if we couldn't determine current round (safe fallback)
      else if (!currentRound) {
        isAllowed = true;
      }
      else {
        const currentIndex = rounds.findIndex(r => r.id === currentRound.id);
        const targetIndex = rounds.findIndex(r => r.id === targetRound.id);

        // Rule: Can move to Next Round (advanced flow restriction)
        if (targetIndex === currentIndex + 1) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        toast.error("Process Restriction", {
          description: "You can only move candidates to the immediate next round or to Rejected.",
          duration: 4000,
        });
        return;
      }

      // Advanced mode: Open Confirmation Dialog
      setPendingMoveApplication(application);
      setPendingTargetRound(targetRound);
      setIsMoveStageDialogOpen(true);
    } else {
      // Simple Flow: No restrictions, execute immediately
      await executeMoveToRound("", application, targetRound);
    }
  };

  // Helper: Refresh single application after rollback
  const refreshSingleApplication = useCallback(async (appId: string) => {
    try {
      const response = await appService.getApplication(appId);
      if (response.success && response.data?.application) {
        const apiApp = response.data.application;

        // Map the single application using same logic as loadApplications
        const updatedApp: Application = {
          id: apiApp.id,
          candidateId: apiApp.candidateId || apiApp.candidate_id || apiApp.candidate?.id || '',
          candidateName: apiApp.candidateName || (
            (apiApp.candidate?.firstName && apiApp.candidate?.lastName)
              ? `${apiApp.candidate.firstName} ${apiApp.candidate.lastName}`
              : (apiApp.candidate?.first_name && apiApp.candidate?.last_name)
                ? `${apiApp.candidate.first_name} ${apiApp.candidate.last_name}`
                : 'Unknown Candidate'
          ),
          candidateEmail: apiApp.candidateEmail || apiApp.candidate?.email || '',
          candidatePhoto: apiApp.candidatePhoto || apiApp.candidate?.photo,
          jobId: apiApp.jobId || apiApp.job_id,
          jobTitle: apiApp.jobTitle || apiApp.job?.title || 'Unknown Job',
          employerName: apiApp.employerName || apiApp.job?.company?.name || 'Unknown Company',
          appliedDate: apiApp.appliedDate ? new Date(apiApp.appliedDate) : (apiApp.applied_date ? new Date(apiApp.applied_date) : new Date()),
          status: mapApplicationStatus(apiApp.status),
          stage: mapApplicationStage(apiApp.stage),
          roundId: apiApp.roundId || apiApp.round_id,
          resumeUrl: apiApp.resumeUrl || apiApp.resume_url || apiApp.candidate?.resume_url,
          coverLetterUrl: apiApp.coverLetterUrl || apiApp.cover_letter_url,
          portfolioUrl: apiApp.portfolioUrl || apiApp.portfolio_url,
          linkedInUrl: apiApp.linkedInUrl || apiApp.linked_in_url || apiApp.candidate?.linked_in_url,
          customAnswers: apiApp.customAnswers || apiApp.custom_answers || [],
          isRead: apiApp.isRead ?? apiApp.is_read,
          isNew: apiApp.isNew ?? apiApp.is_new,
          tags: apiApp.tags || [],
          recruiterNotes: apiApp.recruiterNotes || apiApp.recruiter_notes,
          notes: [],
          activities: [],
          interviews: [],
          createdAt: apiApp.createdAt ? new Date(apiApp.createdAt) : (apiApp.created_at ? new Date(apiApp.created_at) : new Date()),
          updatedAt: apiApp.updatedAt ? new Date(apiApp.updatedAt) : (apiApp.updated_at ? new Date(apiApp.updated_at) : new Date()),
          shortlisted: apiApp.shortlisted || false,
          manuallyAdded: apiApp.manuallyAdded || apiApp.manually_added || false,
          score: apiApp.score,
          aiMatchScore: apiApp.aiMatchScore || apiApp.aiScore || apiApp.score,
          aiAnalysis: apiApp.aiAnalysis,
        };

        setApplications(prev => prev.map(app => app?.id === appId ? updatedApp : app));
      }
    } catch (error) {
      console.error('Failed to refresh single application:', error);
    }
  }, [appService]);

  // Helper: Rollback optimistic move on error
  const rollbackMove = useCallback((appId: string, errorMsg: string) => {
    // Clear optimistic state
    setOptimisticMoves(prev => {
      const newMap = new Map(prev);
      newMap.delete(appId);
      return newMap;
    });

    // Mark as failed for visual feedback
    setFailedMoves(prev => new Set(prev).add(appId));

    // Refresh the single application from server
    refreshSingleApplication(appId);

    // Show error toast
    toast.error('Failed to move candidate', {
      description: errorMsg,
    });

    // Clear failed state after animation
    setTimeout(() => {
      setFailedMoves(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }, 2000);
  }, [refreshSingleApplication]);

  const executeMoveToRound = async (comment: string, appOverride?: Application, roundOverride?: JobRound) => {
    const application = appOverride || pendingMoveApplication;
    const targetRound = roundOverride || pendingTargetRound;

    if (!application || !targetRound) return;

    const applicationId = application.id;
    const roundId = targetRound.id;

    // Handle fallback IDs if needed
    let actualRoundId = roundId;
    if (roundId.startsWith('fixed-')) {
      const parts = roundId.split('-');
      if (parts.length >= 2) {
        const fixedKey = parts[1];
        const actualRound = rounds.find(r => r.isFixed && r.fixedKey === fixedKey);
        if (actualRound) actualRoundId = actualRound.id;
      }
    }

    // Simple Mode Fast Path - Optimistic Updates
    if (isSimpleFlow) {
      const optimisticStatus =
        targetRound.fixedKey === 'REJECTED'
          ? 'rejected'
          : targetRound.fixedKey === 'OFFER'
            ? 'offer'
            : application.status;
      const optimisticStage: ApplicationStage =
        targetRound.fixedKey === 'REJECTED'
          ? 'Rejected'
          : targetRound.fixedKey === 'OFFER'
            ? 'Offer Extended'
            : targetRound.fixedKey === 'NEW'
              ? 'New Application'
              : application.stage;
      // 1. Optimistic update (instant UI response)
      setOptimisticMoves(prev => new Map(prev).set(applicationId, actualRoundId));
      setApplications(prev => prev.map(app =>
        app?.id === applicationId
          ? { ...app, roundId: actualRoundId, stage: optimisticStage, status: optimisticStatus }
          : app
      ));
      setSelectedApplication(prev =>
        prev?.id === applicationId
          ? { ...prev, roundId: actualRoundId, stage: optimisticStage, status: optimisticStatus }
          : prev
      );

      // 2. Quick success toast
      toast.success(`Moved to ${targetRound.name}`, { duration: 800 });

      // 3. Background API sync (non-blocking)
      appService.moveToRound(applicationId, actualRoundId)
        .then(response => {
          if (response.success && response.data?.requiresApproval) {
            // HRM8-managed: consultant requested approval, no move yet - rollback optimistic
            rollbackMove(applicationId, '');
            setOptimisticMoves(prev => {
              const newMap = new Map(prev);
              newMap.delete(applicationId);
              return newMap;
            });
            queryClient.invalidateQueries({ queryKey: ['consultant-decision-requests'] });
            toast.success(response.data?.message || 'Approval requested from HR. You will be notified when it is reviewed.', {
              duration: 5000,
            });
          } else if (response.success) {
            // Clear optimistic state on success - local state is already correct
            setOptimisticMoves(prev => {
              const newMap = new Map(prev);
              newMap.delete(applicationId);
              return newMap;
            });
          } else {
            rollbackMove(applicationId, response.error || 'Please try again');
          }
        })
        .catch(() => {
          rollbackMove(applicationId, 'Network error');
        });

      return; // Exit immediately - no waiting!
    }

    // Advanced Mode - Use dialog with full validation
    setPendingIsMoving(true);

    try {
      // Robust Date Formatter (DD/MM/YYYY, HH:mm:ss) - Deterministic
      const formatTimestamp = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return `${d}/${m}/${y}, ${h}:${min}:${s}`;
      };

      // 1. Execute Move
      const response = await appService.moveToRound(applicationId, actualRoundId);

      if (response.success && response.data?.requiresApproval) {
        // HRM8-managed: consultant requested approval - no move executed
        setIsMoveStageDialogOpen(false);
        setPendingMoveApplication(null);
        setPendingTargetRound(null);
        setPendingIsMoving(false);
        queryClient.invalidateQueries({ queryKey: ['consultant-decision-requests'] });
        toast.success(response.data?.message || 'Approval requested from HR. You will be notified when it is reviewed.', {
          duration: 5000,
        });
        return;
      }

      if (response.success) {
        // 2. Save Comment (if provided)
        if (comment && !isConsultantView) {
          try {
            const response = await applicationService.getApplication(applicationId);
            const latestApp = response.data?.application || response.application;

            const currentNotes = latestApp?.recruiterNotes || "";
            const timestamp = formatTimestamp(new Date());
            const newNoteEntry = `[${timestamp}] Moved to ${targetRound.name}: ${comment}`;

            const appendText = currentNotes
              ? `${currentNotes}\n\n${newNoteEntry}`
              : newNoteEntry;

            await applicationService.updateNotes(applicationId, appendText);

            // Update selected application if it's the one being moved
            if (selectedApplication && selectedApplication.id === applicationId) {
              setSelectedApplication(latestApp);
            }
          } catch (err) {
            console.error("Failed to append move note", err);
          }
        }

        // 3. Refresh data
        if (providedApplications !== undefined) {
          toast.success(`Moved ${application.candidateName} to ${targetRound.name}`);
          onApplicationMoved?.();
        } else {
          // Only refresh the single application, not all
          await refreshSingleApplication(applicationId);
          toast.success(`Moved ${application.candidateName} to ${targetRound.name}`);
        }

        // Close Dialog
        setIsMoveStageDialogOpen(false);
        setPendingMoveApplication(null);
        setPendingTargetRound(null);

      } else {
        toast.error('Failed to move application', {
          description: response.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Failed to move application to round:', error);
      toast.error('Failed to move application', {
        description: 'Please try again'
      });
    } finally {
      setPendingIsMoving(false);
    }
  };

  const handleConfigureOffer = useCallback((roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setDrawerState({ type: 'offer-config', round, application: null });
    }
  }, [rounds]);

  const handleExecuteOffer = useCallback((roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setDrawerState({ type: 'offer-exec', round, application: null });
    }
  }, [rounds]);

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setDetailPanelOpen(true);
  };

  const handleOfferCandidate = useCallback((applicationId: string) => {
    const offerRound = rounds.find((r) => r.fixedKey === "OFFER" || String(r.name).toLowerCase() === "offer");
    if (!offerRound) {
      toast.error("Offer stage not found");
      return;
    }
    handleMoveToRound(applicationId, offerRound.id);
  }, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRejectCandidate = useCallback((applicationId: string) => {
    const rejectedRound = rounds.find(
      (r) =>
        r.fixedKey === "REJECTED" ||
        String(r.name).toLowerCase() === "rejected" ||
        String(r.name).toLowerCase() === "declined"
    );
    if (!rejectedRound) {
      toast.error("Rejected stage not found");
      return;
    }
    handleMoveToRound(applicationId, rejectedRound.id);
  }, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app?.id === selectedApplication.id);
    if (currentIndex < applications.length - 1) {
      setSelectedApplication(applications[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app?.id === selectedApplication.id);
    if (currentIndex > 0) {
      setSelectedApplication(applications[currentIndex - 1]);
    }
  };

  const currentIndex = selectedApplication
    ? applications.findIndex(app => app?.id === selectedApplication.id)
    : -1;
  const hasNext = currentIndex < applications.length - 1;
  const hasPrevious = currentIndex > 0;

  const activeApplication = activeId ? applications.find((app) => app?.id === activeId) : null;

  const handleDeleteRound = useCallback(async (roundId: string) => {
    if (!jobId) return;

    if (!confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await jobRoundService.deleteRound(jobId, roundId);
      if (response.success) {
        toast.success('Round deleted successfully');
        loadRounds();
      } else {
        toast.error(response.error || 'Failed to delete round');
      }
    } catch (error) {
      console.error('Failed to delete round:', error);
      toast.error('Failed to delete round');
    }
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundCreated = () => {
    loadRounds();
  };

  const handleConfigureAssessment = useCallback((roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setDrawerState({ type: 'config', round, application: null, initialTab: 'assessment' });
    }
  }, [rounds]);

  const handleOpenAssessmentReview = useCallback((round: JobRound) => {
    setDrawerState({ type: 'assessment', round, application: null });
  }, []);

  const handleConfigureInterview = useCallback((roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setDrawerState({ type: 'config', round, application: null, initialTab: 'interview' });
    }
  }, [rounds]);

  const handleViewInterviews = useCallback((application: Application) => {
    setDrawerState({ type: 'interview', round: null, application });
  }, []);

  const handleViewRoundInterviews = useCallback((roundId: string) => {
    console.log('handleViewRoundInterviews called with roundId:', roundId);
    console.log('Current jobId:', jobId);
    const round = rounds.find((r) => r.id === roundId);
    console.log('Found round:', round);
    if (round) {
      setDrawerState({ type: 'interview', round, application: null });
      console.log('Set selectedRoundForInterviews to:', round);
      console.log('Drawer should open with jobId:', jobId);
    } else {
      console.error('Round not found with id:', roundId);
    }
  }, [jobId, rounds]);

  const handleOpenScreening = useCallback((round: JobRound) => {
    console.log('Opening screening drawer for round:', round);
    setDrawerState({ type: 'screening', round, application: null });
    // Ensure job data is loaded if not already
    if (!jobData && jobId) {
      loadJobData();
    }
  }, [jobData, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedRoundForInterviews) {
      console.log('selectedRoundForInterviews is set:', selectedRoundForInterviews);
      console.log('jobId for drawer:', jobId);
      console.log('Drawer should be rendered:', !!selectedRoundForInterviews && !!jobId);
    }
  }, [selectedRoundForInterviews, jobId]);

  // Map applications to rounds using ApplicationRoundProgress data
  // Memoized for performance - only recalculates when applications, rounds, or optimistic moves change
  const getApplicationsForRound = useMemo(() => {
    // Build lookup map: O(n+m) instead of O(n*m)
    const roundMap = new Map<string, Application[]>();
    rounds.forEach(round => roundMap.set(round.id, []));

    // Single pass through applications
    applications.forEach(app => {
      if (!app?.id) return;
      // Check for optimistic move first (takes precedence)
      const appRoundId = optimisticMoves.get(app.id) || app.roundId;

      if (appRoundId && roundMap.has(appRoundId)) {
        roundMap.get(appRoundId)!.push(app);
      } else {
        // Fallback to name-based matching for applications without round progress
        const matchedRound = findRoundForApplication(app);
        if (matchedRound && roundMap.has(matchedRound.id)) {
          roundMap.get(matchedRound.id)!.push(app);
        }
      }
    });

    // Return a function that looks up the round
    return (round: JobRound) => roundMap.get(round.id) || [];
  }, [applications, rounds, optimisticMoves]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate pipeline statistics
  const totalApplications = applications.length;
  const avgScore = useMemo(() => {
    const scores = applications
      .map(app => app.score ?? app.aiMatchScore)
      .filter((score): score is number => score !== undefined && score !== null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [applications]);

  const shortlistedCount = applications.filter(app => app.shortlisted).length;
  const newApplicationsCount = applications.filter(app =>
    app.stage === 'New Application' || !app.isRead
  ).length;

  // Handle multi-select if enabled
  const handleToggleSelection = (applicationId: string) => {
    if (onSelectionChange && selectedApplicationIds) {
      const newSelection = selectedApplicationIds.includes(applicationId)
        ? selectedApplicationIds.filter(id => id !== applicationId)
        : [...selectedApplicationIds, applicationId];
      onSelectionChange(newSelection);
    }
  };

  const handleConfigureEmail = useCallback((round: JobRound) => {
    setDrawerState({ type: 'config', round, application: null, initialTab: 'email' });
  }, []);

  const selectedIds = enableMultiSelect ? (selectedApplicationIds || []) : selectedForComparison;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {/* Pipeline Stats */}
        {totalApplications > 0 ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-xs font-semibold">{totalApplications}</span>
            </div>
            {newApplicationsCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                <span className="text-xs text-muted-foreground">New:</span>
                <span className="text-xs font-semibold">{newApplicationsCount}</span>
              </div>
            )}
            {shortlistedCount > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">Shortlisted:</span>
                <span className="text-xs font-semibold">{shortlistedCount}</span>
              </div>
            )}
            {avgScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Avg Score:</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-semibold">
                  {avgScore}%
                </Badge>
              </div>
            )}
          </div>
        ) : <div />}

        {/* Create Round Button */}
        {jobId && (
          <div>
            <Button
              onClick={() => setCreateRoundDialogOpen(true)}
              size="sm"
              className="gap-2 h-7 text-xs"
              variant="outline"
            >
              <Plus className="h-3 w-3" />
              Create Round
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 min-w-max pb-4">
            <SortableContext items={rounds.map((r) => `round-${r.id}`)} strategy={horizontalListSortingStrategy}>
              {rounds.map((round) => (
                <SortableRoundColumn
                  key={round.id}
                  round={round}
                  allRounds={rounds}
                  applications={getApplicationsForRound(round)}
                  onApplicationClick={handleApplicationClick}
                  isCompareMode={isCompareMode}
                  selectedForComparison={selectedForComparison}
                  onToggleSelect={onToggleSelect}
                  onStageChange={handleStageChange}
                  onMoveToRound={handleMoveToRound}
                  onDeleteRound={handleDeleteRound}
                  onConfigureAssessment={isSimpleFlow ? undefined : handleConfigureAssessment}
                  onConfigureInterview={handleConfigureInterview}
                  onViewInterviews={handleViewInterviews}
                  onViewRoundInterviews={handleViewRoundInterviews}
                  onOpenScreening={isSimpleFlow ? undefined : handleOpenScreening}
                  onConfigureOffer={isSimpleFlow ? undefined : handleConfigureOffer}
                  onExecuteOffer={handleExecuteOffer}
                  onOpenAssessmentDrawer={isSimpleFlow ? undefined : handleOpenAssessmentReview}
                  onConfigureEmail={isSimpleFlow ? undefined : handleConfigureEmail}
                  isSimpleFlow={isSimpleFlow}
                  optimisticMoves={optimisticMoves}
                  failedMoves={failedMoves}
                  restrictToOfferActions={isOfferOnlyCompanyView}
                  pendingApplicationIds={pendingApplicationIds}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeApplication && (
              <ApplicationCard
                application={activeApplication}
                onClick={() => { }}
                variant="minimal"
                allRounds={rounds}
                onMoveToRound={handleMoveToRound}
                isSimpleFlow={isSimpleFlow}
                isDragOverlay
                dragDisabled={isOfferOnlyCompanyView}
                restrictToOfferActions={isOfferOnlyCompanyView}
              />
            )}
            {activeRoundId && (() => {
              const draggedRound = rounds.find(r => `round-${r.id}` === activeRoundId);
              if (draggedRound) {
                const roundApps = getApplicationsForRound(draggedRound);
                return (
                  <div style={{ width: '280px' }}>
                    <StageColumn
                      round={draggedRound}
                      applications={roundApps}
                      onApplicationClick={() => { }}
                      isCompareMode={false}
                      selectedForComparison={[]}
                      onStageChange={() => { }}
                      allRounds={rounds}
                      optimisticMoves={optimisticMoves}
                      failedMoves={failedMoves}
                    />
                  </div>
                );
              }
              return null;
            })()}
          </DragOverlay>
        </DndContext>
      </div>



      {selectedApplication?.id && (
        <CandidateAssessmentView
          key={selectedApplication.id}
          application={selectedApplication}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={jobTitle}
          jobId={jobId}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isSimpleFlow={isSimpleFlow}
          onOfferCandidate={handleOfferCandidate}
          onRejectCandidate={handleRejectCandidate}

          // Next Stage Logic
          nextStageName={(() => {
            // Try to find current round index
            // 1. By ID match if we know current round ID (not stored in app usually, but we can look up by stage name?)
            // Application has "stage", Rounds have "name".
            const currentStageName = selectedApplication.stage;
            const currentRoundIndex = rounds.findIndex(r => r.name === currentStageName);

            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              return rounds[currentRoundIndex + 1].name;
            }
            return undefined;
          })()}
          onMoveToNextStage={() => {
            const currentStageName = selectedApplication.stage;
            const currentRoundIndex = rounds.findIndex(r => r.name === currentStageName);

            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              const nextRound = rounds[currentRoundIndex + 1];
              handleMoveToRound(selectedApplication.id, nextRound.id);
            } else {
              toast.error("No next stage available");
            }
          }}
        />
      )}

      {jobId && (
        <>
          <RoundConfigDrawer
            open={configDrawerOpen}
            onOpenChange={(open) => {
              setConfigDrawerOpen(open);
              if (!open) setSelectedRoundForConfig(null);
            }}
            jobId={jobId || ''}
            round={selectedRoundForConfig}
            jobTitle={jobTitle}
            initialTab={initialConfigTab}
            onSuccess={loadRounds}
          />

          <CreateRoundDialog
            open={createRoundDialogOpen}
            onOpenChange={setCreateRoundDialogOpen}
            onSuccess={handleRoundCreated}
            jobId={jobId}
          />
        </>
      )}

      <InterviewScheduleDrawer
        open={interviewScheduleDrawerOpen}
        onOpenChange={setInterviewScheduleDrawerOpen}
        applicationId={selectedApplicationForInterviews?.id}
        jobId={jobId}
        candidateName={selectedApplicationForInterviews?.candidateName || selectedApplicationForInterviews?.candidateId}
        jobTitle={jobTitle}
      />

      {selectedRoundForInterviews && jobId && (
        <RoundInterviewsDrawer
          key={`drawer-${selectedRoundForInterviews.id}`}
          open={true}
          onOpenChange={(open) => {
            console.log('RoundInterviewsDrawer onOpenChange:', open);
            if (!open) {
              setSelectedRoundForInterviews(null);
            }
          }}
          jobId={jobId}
          jobRoundId={selectedRoundForInterviews.id}
          roundName={selectedRoundForInterviews.name}
          roundType={selectedRoundForInterviews.type}
          jobTitle={jobTitle}
          onConfigureRound={() => {
            setSelectedRoundForConfig(selectedRoundForInterviews);
            setInitialConfigTab("interview");
            setConfigDrawerOpen(true);
          }}
        />
      )}

      {selectedRoundForScreening && jobId && (
        <InitialScreeningDrawer
          open={screeningDrawerOpen}
          onOpenChange={(open) => {
            setScreeningDrawerOpen(open);
            if (!open) {
              setSelectedRoundForScreening(null);
            }
          }}
          jobId={jobId}
          jobTitle={jobData?.job?.title || jobTitle}
          jobRequirements={jobData?.job?.requirements || []}
          jobDescription={jobData?.job?.description || ''}
          job={jobData?.job || { id: jobId, title: jobTitle, requirements: [], description: '' } as Job}
          roundId={selectedRoundForScreening.id}
          roundName={selectedRoundForScreening.name}
        />
      )}

      {jobId && selectedRoundForReview && (
        <AssessmentReviewDrawer
          open={assessmentReviewDrawerOpen}
          onOpenChange={setAssessmentReviewDrawerOpen}
          jobId={jobId}
          round={selectedRoundForReview}
          onMoveToNextRound={async (applicationId) => {
            const currentRoundIndex = rounds.findIndex(r => r.id === selectedRoundForReview.id);
            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              const nextRound = rounds[currentRoundIndex + 1];
              await handleMoveToRound(applicationId, nextRound.id);
            } else {
              toast.error("No next stage available");
            }
          }}
        />
      )}

      {selectedRoundForOffer && jobId && (
        <>
          <OfferConfigurationDrawer
            open={offerConfigDrawerOpen}
            onOpenChange={(open) => {
              setOfferConfigDrawerOpen(open);
              if (!open) {
                setSelectedRoundForOffer(null);
              }
            }}
            jobId={jobId}
            roundId={selectedRoundForOffer.id}
            roundName={selectedRoundForOffer.name}
            onSuccess={() => {
              loadRounds();
            }}
          />
          <OfferExecutionDrawer
            open={offerExecutionDrawerOpen}
            onOpenChange={(open) => {
              setOfferExecutionDrawerOpen(open);
              if (!open) {
                setSelectedRoundForOffer(null);
              }
            }}
            jobId={jobId}
            roundId={selectedRoundForOffer.id}
            applications={getApplicationsForRound(selectedRoundForOffer)}
            jobTitle={jobTitle}
            onSuccess={() => {
              loadApplications();
            }}
          />
        </>
      )}

      {/* Move Stage Dialog from Drag & Drop */}
      <MoveStageDialog
        open={isMoveStageDialogOpen}
        onOpenChange={setIsMoveStageDialogOpen}
        candidateName={pendingMoveApplication?.candidateName || "Candidate"}
        nextStageName={pendingTargetRound?.name || "Next Stage"}
        onConfirm={executeMoveToRound}
        isSubmitting={pendingIsMoving}
      />
    </>
  );
}
