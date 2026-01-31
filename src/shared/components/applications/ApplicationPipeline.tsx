import { useState, useEffect, useMemo } from "react";
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
import { CandidateAssessmentView } from "../jobs/candidate-assessment/CandidateAssessmentView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronDown, Plus, Trash2, GripVertical, Settings, CalendarClock, FileSearch, Send, Star, Play } from "lucide-react";

import { CreateRoundDialog } from "./CreateRoundDialog";
import { AssessmentConfigurationDrawer } from "./AssessmentConfigurationDrawer";
import { AssessmentReviewDrawer } from "./AssessmentReviewDrawer";
import { InterviewConfigurationDrawer } from "./InterviewConfigurationDrawer";
import { InterviewScheduleDrawer } from "./InterviewScheduleDrawer";
import { RoundInterviewsDrawer } from "./RoundInterviewsDrawer";
import { InitialScreeningDrawer } from "./InitialScreeningDrawer";
import { OfferConfigurationDrawer } from "./OfferConfigurationDrawer";
import { OfferExecutionDrawer } from "./OfferExecutionDrawer";
import { JobRound, JobRoundType, jobRoundService } from "@/shared/lib/api/jobRoundService";
import { jobService } from "@/shared/lib/api/jobService";
import { offerService } from "@/shared/lib/api/offerService";

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

// pipelineStages removed as it is unused and rounds are now dynamic
// const pipelineStages: { stage: ApplicationStage; label: string; color: string }[] = ...

// Sortable Round Column Wrapper - allows dragging round columns to reorder
function SortableRoundColumn({
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
  dragHandleProps?: any;
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
        dragHandleProps={!round.isFixed ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

// Stage Column Component with Droppable
function StageColumn({
  round,
  applications,
  onApplicationClick,
  isCompareMode,
  selectedForComparison,
  onToggleSelect,
  onStageChange: _onStageChange,
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
  dragHandleProps,
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
  dragHandleProps?: any;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: round.id,
  });

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
      <Card className={`${getRoundColor(round)} border-2 h-full flex flex-col ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
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
              <h3 className="font-semibold text-sm truncate">{round.name}</h3>
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
              <Badge variant="outline" className="text-xs h-6 px-2 rounded-full">
                {applications.length}
              </Badge>
              {round.isFixed && round.fixedKey === 'NEW' && onOpenScreening && (
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
              {!round.isFixed && round.type === 'ASSESSMENT' && (
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
              {!round.isFixed && round.type === 'INTERVIEW' && (
                <>
                  {onConfigureInterview && (
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
              {round.isFixed && round.fixedKey === 'OFFER' && (
                <>
                  {onConfigureOffer && (
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
                  {onExecuteOffer && applications.length > 0 && (
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
            <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 flex-1 overflow-y-auto min-h-[150px]">
                {applications.map((application) => (
                  <div key={application.id} className="relative group">
                    <ApplicationCard
                      application={application}
                      onClick={() => onApplicationClick(application)}
                      isCompareMode={isCompareMode}
                      isSelected={selectedForComparison.includes(application.id)}
                      onToggleSelect={onToggleSelect}
                      showOnlyReview={true}
                      onViewInterviews={onViewInterviews}
                    />
                    {/* Round Dropdown - Alternative to drag-drop */}
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Select
                        value={round.id}
                        onValueChange={(roundId) => {
                          if (onMoveToRound && roundId !== round.id) {
                            onMoveToRound(application.id, roundId);
                          }
                        }}
                      >
                        <SelectTrigger
                          className="h-6 text-[10px] px-1.5 w-auto bg-background/95 backdrop-blur-sm border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          {allRounds.map((r) => (
                            <SelectItem
                              key={r.id}
                              value={r.id}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
}

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [rounds, setRounds] = useState<JobRound[]>([]);
  const [createRoundDialogOpen, setCreateRoundDialogOpen] = useState(false);
  const [assessmentConfigDrawerOpen, setAssessmentConfigDrawerOpen] = useState(false);
  const [interviewConfigDrawerOpen, setInterviewConfigDrawerOpen] = useState(false);
  const [selectedRoundForConfig, setSelectedRoundForConfig] = useState<JobRound | null>(null);
  const [selectedRoundForInterviews, setSelectedRoundForInterviews] = useState<JobRound | null>(null);
  const [interviewScheduleDrawerOpen, setInterviewScheduleDrawerOpen] = useState(false);
  const [selectedApplicationForInterviews, setSelectedApplicationForInterviews] = useState<Application | null>(null);
  const [screeningDrawerOpen, setScreeningDrawerOpen] = useState(false);
  const [selectedRoundForScreening, setSelectedRoundForScreening] = useState<JobRound | null>(null);
  const [offerConfigDrawerOpen, setOfferConfigDrawerOpen] = useState(false);
  const [offerExecutionDrawerOpen, setOfferExecutionDrawerOpen] = useState(false);
  const [selectedRoundForOffer, setSelectedRoundForOffer] = useState<JobRound | null>(null);
  const [assessmentReviewDrawerOpen, setAssessmentReviewDrawerOpen] = useState(false);
  const [selectedRoundForReview, setSelectedRoundForReview] = useState<JobRound | null>(null);
  const [_isLoadingJob, _setIsLoadingJob] = useState(false);
  const [_jobData, setJobData] = useState<any>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));


  // Load rounds and job data when jobId changes
  useEffect(() => {
    if (jobId) {
      loadRounds();
      loadJobData();
    }
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update applications when providedApplications changes (for filtering)
  useEffect(() => {
    if (providedApplications !== undefined) {
      setApplications(providedApplications);
    } else {
      loadApplications();
    }
  }, [providedApplications, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load when jobId is set and no providedApplications
  useEffect(() => {
    if (jobId && providedApplications === undefined) {
      loadApplications();
    }
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const fixedRounds = fixedRoundKeys.map((key) => {
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
        const apiApplications = response.data?.applications || [];

        // Extract round progress mapping
        const roundMap: Record<string, string> = {};
        // @ts-expect-error - roundProgress exists in backend response but might not be in type definition
        if (response.data?.roundProgress) {
          // @ts-expect-error - iterating over unknown type
          Object.entries(response.data.roundProgress).forEach(([appId, progress]: [string, any]) => {
            if (progress?.roundId) {
              roundMap[appId] = progress.roundId;
            }
          });
        }

        // Map API applications to frontend Application type
        // Handle both pre-transformed consultant data and raw employer API data
        const mappedApplications: Application[] = apiApplications.map((app: any) => ({
          id: app.id,
          candidateId: app.candidateId || app.candidate_id || app.candidate?.id,
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
          roundId: roundMap[app.id],
          resumeUrl: app.resumeUrl || app.resume_url || app.candidate?.resume_url,
          coverLetterUrl: app.coverLetterUrl || app.cover_letter_url,
          portfolioUrl: app.portfolioUrl || app.portfolio_url,
          linkedInUrl: app.linkedInUrl || app.linked_in_url || app.candidate?.linked_in_url,
          customAnswers: app.customAnswers || app.custom_answers || [],
          isRead: app.isRead ?? app.is_read,
          isNew: app.isNew ?? app.is_new,
          tags: app.tags || [],
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
        }));
        setApplications(mappedApplications);
        return undefined;
      } catch (error) {
        console.error('Failed to load applications:', error);
        // Fallback to mock data
        const allApps = getApplications();
        const filtered = allApps.filter(app => app.jobId === jobId);
        setApplications(filtered);
        return undefined;
      }
    } else {
      // Fetch all from mock storage
      const allApps = getApplications();
      setApplications(allApps);
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

    if (!targetRound) {
      // Dropped on another card - find which round that card's application belongs to
      const targetApplication = applications.find((app) => app.id === over.id);
      if (targetApplication) {
        // Find the round this application is currently in
        targetRound = rounds.find(r => {
          const roundName = r.name.toLowerCase();
          const stageName = targetApplication.stage.toLowerCase();
          return stageName.includes(roundName) || roundName.includes(stageName);
        }) || null;
      }
    }

    // If we found a target round, move application to that round
    if (targetRound) {
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

  const handleStageChange = async (applicationId: string, newStage: ApplicationStage) => {
    try {
      // Map frontend stage to backend stage format
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

      // Update via API
      const response = await applicationService.updateStage(applicationId, backendStage);

      if (response.success) {
        // Also update local mock storage for fallback
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

        // Reload applications only if not using providedApplications (parent handles refresh)
        if (providedApplications === undefined) {
          loadApplications();
        } else {
          // Notify parent to refresh filtered applications
          onApplicationMoved?.();
        }
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('Failed to update application stage');
    }
  };

  const handleMoveToRound = async (applicationId: string, roundId: string) => {
    try {
      // Find the target round first (might be fallback ID)
      const targetRound = rounds.find(r => r.id === roundId);
      const application = applications.find(app => app.id === applicationId);

      // If it's a fallback ID, find the actual round by fixedKey
      let actualRoundId = roundId;
      let actualRound = targetRound;

      if (roundId.startsWith('fixed-')) {
        // Extract fixedKey from fallback ID format: "fixed-{FIXEDKEY}-{jobId}"
        const parts = roundId.split('-');
        if (parts.length >= 2) {
          const fixedKey = parts[1];

          // Try to find the actual round in current rounds
          actualRound = rounds.find(r => r.isFixed && r.fixedKey === fixedKey);

          if (actualRound) {
            actualRoundId = actualRound.id;
          } else if (targetRound && targetRound.fixedKey === fixedKey) {
            // If targetRound was found by fallback ID, use it
            actualRoundId = targetRound.id;
            actualRound = targetRound;
          } else {
            // Round doesn't exist yet - backend will create it
            // We'll use the fallback ID and let backend handle it
            // Backend will resolve it to actual ID
            console.log(`Using fallback ID ${roundId}, backend will resolve to actual round`);
          }
        }
      }

      // Move application to round via API (using actual round ID)
      const response = await appService.moveToRound(applicationId, actualRoundId);

      if (response.success) {
        // Reload rounds first in case backend created a new fixed round
        await loadRounds();

        // Check if moved to OFFER round and auto-send is enabled
        const offerRound = rounds.find(r => r.isFixed && r.fixedKey === 'OFFER');
        if (offerRound && application && jobId) {
          const configKey = `offer_config_${jobId}_${offerRound.id}`;
          const savedConfig = localStorage.getItem(configKey);
          if (savedConfig) {
            try {
              const config = JSON.parse(savedConfig);
              if (config.autoSend) {
                // Auto-send offer
                await autoSendOffer(application, config);
              }
            } catch (e) {
              console.error('Failed to parse offer config:', e);
            }
          }
        }

        // If using providedApplications, update round mapping only and let parent refresh
        if (providedApplications !== undefined) {
          // Parent component will handle the refresh
          const finalRound = rounds.find(r => r.id === actualRoundId) || actualRound;
          if (finalRound && application) {
            toast.success(`Moved ${application.candidateName} to ${finalRound.name}`);
          } else {
            toast.success('Application moved successfully');
          }

          // Notify parent to refresh filtered applications
          onApplicationMoved?.();
        } else {
          // Reload applications to get updated round progress with actual round IDs
          const roundMap = await loadApplications();

          // Get the updated round ID from the returned map
          // If we still don't have it, try to find the OFFER round again (in case it was just created)
          let updatedRoundId = roundMap?.[applicationId];

          if (!updatedRoundId && actualRound?.fixedKey) {
            // Try to find the round by fixedKey again (it might have been created)
            const foundRound = rounds.find(r => r.isFixed && r.fixedKey === actualRound?.fixedKey);
            if (foundRound) {
              updatedRoundId = foundRound.id;
            }
          }

          // Fallback to actualRoundId if we still don't have it
          if (!updatedRoundId) {
            updatedRoundId = actualRoundId;
          }

          const finalRound = rounds.find(r => r.id === updatedRoundId) || actualRound;
          if (finalRound && application) {
            toast.success(`Moved ${application.candidateName} to ${finalRound.name}`);
          } else {
            toast.success('Application moved successfully');
          }
        }
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
    }
  };

  const autoSendOffer = async (application: Application, config: any) => {
    try {
      console.log('Auto-sending offer for application:', application.id, 'with config:', config);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (parseInt(config.defaultExpiryDays) || 7));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);

      const offerData = {
        applicationId: application.id,
        offerType: "full-time",
        salary: parseFloat(config.defaultSalary) || 0,
        salaryCurrency: config.defaultSalaryCurrency || "USD",
        salaryPeriod: config.defaultSalaryPeriod || "annual",
        startDate: startDate.toISOString().split('T')[0],
        workLocation: config.defaultWorkLocation || "",
        workArrangement: config.defaultWorkArrangement || "remote",
        benefits: config.defaultBenefits
          ? (typeof config.defaultBenefits === 'string'
            ? config.defaultBenefits.split(',').map((b: string) => b.trim())
            : config.defaultBenefits)
          : [],
        vacationDays: config.defaultVacationDays ? parseInt(config.defaultVacationDays) : undefined,
        customMessage: config.defaultCustomMessage,
        expiryDate: expiryDate.toISOString().split('T')[0],
        templateId: config.defaultTemplateId,
      };

      console.log('Creating offer with data:', offerData);
      const createResponse = await offerService.createOffer(application.id, offerData);

      if (createResponse.success && createResponse.data) {
        console.log('Offer created successfully:', createResponse.data.id);
        const sendResponse = await offerService.sendOffer(createResponse.data.id);
        if (sendResponse.success) {
          console.log('Offer sent successfully');
          toast.success(`Offer auto-sent to ${application.candidateName}`);
        } else {
          console.error('Failed to send offer:', sendResponse.error);
          toast.error(`Failed to send offer to ${application.candidateName}`, {
            description: sendResponse.error || 'Please try manually'
          });
        }
      } else {
        console.error('Failed to create offer:', createResponse.error);
        toast.error(`Failed to create offer for ${application.candidateName}`, {
          description: createResponse.error || 'Please try manually'
        });
      }
    } catch (error) {
      console.error('Failed to auto-send offer:', error);
      toast.error(`Failed to auto-send offer to ${application.candidateName}`, {
        description: error instanceof Error ? error.message : 'Please try manually'
      });
    }
  };

  const handleConfigureOffer = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForOffer(round);
      setOfferConfigDrawerOpen(true);
    }
  };

  const handleExecuteOffer = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForOffer(round);
      setOfferExecutionDrawerOpen(true);
    }
  };

  const getOfferConfig = (roundId: string) => {
    if (!jobId) return undefined;
    const configKey = `offer_config_${jobId}_${roundId}`;
    const saved = localStorage.getItem(configKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setDetailPanelOpen(true);
  };

  const handleNext = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplication.id);
    if (currentIndex < applications.length - 1) {
      setSelectedApplication(applications[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplication.id);
    if (currentIndex > 0) {
      setSelectedApplication(applications[currentIndex - 1]);
    }
  };

  const currentIndex = selectedApplication
    ? applications.findIndex(app => app.id === selectedApplication.id)
    : -1;
  const hasNext = currentIndex < applications.length - 1;
  const hasPrevious = currentIndex > 0;

  const activeApplication = activeId ? applications.find((app) => app.id === activeId) : null;

  const handleDeleteRound = async (roundId: string) => {
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
  };

  const handleRoundCreated = () => {
    loadRounds();
  };

  const handleConfigureAssessment = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setAssessmentConfigDrawerOpen(true);
    }
  };

  const handleOpenAssessmentReview = (round: JobRound) => {
    setSelectedRoundForReview(round);
    setAssessmentReviewDrawerOpen(true);
  };

  const handleConfigureInterview = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setInterviewConfigDrawerOpen(true);
    }
  };

  const handleViewInterviews = (application: Application) => {
    setSelectedApplicationForInterviews(application);
    setInterviewScheduleDrawerOpen(true);
  };

  const handleViewRoundInterviews = (roundId: string) => {
    console.log('handleViewRoundInterviews called with roundId:', roundId);
    console.log('Current jobId:', jobId);
    const round = rounds.find((r) => r.id === roundId);
    console.log('Found round:', round);
    if (round) {
      setSelectedRoundForInterviews(round);
      console.log('Set selectedRoundForInterviews to:', round);
      console.log('Drawer should open with jobId:', jobId);
    } else {
      console.error('Round not found with id:', roundId);
    }
  };

  const handleOpenScreening = (round: JobRound) => {
    console.log('Opening screening drawer for round:', round);
    setSelectedRoundForScreening(round);
    setScreeningDrawerOpen(true);
    // Ensure job data is loaded if not already
    if (!_jobData && jobId) {
      loadJobData();
    }
  };

  useEffect(() => {
    if (selectedRoundForInterviews) {
      console.log('selectedRoundForInterviews is set:', selectedRoundForInterviews);
      console.log('jobId for drawer:', jobId);
      console.log('Drawer should be rendered:', !!selectedRoundForInterviews && !!jobId);
    }
  }, [selectedRoundForInterviews, jobId]);

  // Map applications to rounds using ApplicationRoundProgress data
  const getApplicationsForRound = (round: JobRound) => {
    return applications.filter((app) => {
      // Check if application has a round mapping
      const appRoundId = app.roundId;

      if (appRoundId) {
        // Use round progress mapping if available
        return appRoundId === round.id;
      }

      // Fallback to name-based matching for applications without round progress
      // This handles new applications or legacy data
      const roundName = round.name.toLowerCase();
      const stageName = app.stage.toLowerCase();

      // For fixed rounds, try to match by stage
      if (round.isFixed) {
        if (round.fixedKey === 'NEW' && (stageName.includes('new') || !appRoundId)) {
          return true; // New applications without round progress go to "New"
        }
        if (round.fixedKey === 'OFFER' && stageName.includes('offer')) return true;
        if (round.fixedKey === 'HIRED' && stageName.includes('hired')) return true;
        if (round.fixedKey === 'REJECTED' && stageName.includes('rejected')) return true;
      }

      // For custom rounds, try to match by name similarity (fallback only)
      if (!round.isFixed) {
        return stageName.includes(roundName) || roundName.includes(stageName);
      }

      return false;
    });
  };

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

  const selectedIds = enableMultiSelect ? (selectedApplicationIds || []) : selectedForComparison;

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Pipeline Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Application Pipeline</h2>
            {providedApplications === undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop to move candidates between stages
              </p>
            )}
          </div>
          {jobId && (
            <Button
              onClick={() => setCreateRoundDialogOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Round
            </Button>
          )}
        </div>

        {/* Pipeline Stats */}
        {totalApplications > 0 && (
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-sm font-semibold">{totalApplications}</span>
            </div>
            {newApplicationsCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-muted-foreground">New:</span>
                <span className="text-sm font-semibold">{newApplicationsCount}</span>
              </div>
            )}
            {shortlistedCount > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-muted-foreground">Shortlisted:</span>
                <span className="text-sm font-semibold">{shortlistedCount}</span>
              </div>
            )}
            {avgScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Avg Score:</span>
                <Badge variant="outline" className="text-sm font-semibold">
                  {avgScore}%
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext
          items={rounds.map(r => `round-${r.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 max-h-[calc(100vh-300px)]" style={{ minWidth: 'min-content' }}>
            {rounds.length > 0 ? (
              rounds.map((round) => {
                const roundApplications = getApplicationsForRound(round);
                return (
                  <div key={round.id} className="flex-shrink-0" style={{ width: '280px' }}>
                    <SortableRoundColumn
                      round={round}
                      applications={roundApplications}
                      onApplicationClick={handleApplicationClick}
                      isCompareMode={enableMultiSelect ? true : isCompareMode}
                      selectedForComparison={enableMultiSelect ? selectedIds : selectedForComparison}
                      onToggleSelect={enableMultiSelect ? handleToggleSelection : onToggleSelect}
                      onStageChange={handleStageChange}
                      onMoveToRound={handleMoveToRound}
                      onDeleteRound={round.isFixed ? undefined : handleDeleteRound}
                      onConfigureAssessment={round.type === 'ASSESSMENT' ? handleConfigureAssessment : undefined}
                      onConfigureInterview={round.type === 'INTERVIEW' ? handleConfigureInterview : undefined}
                      allRounds={rounds}
                      onViewInterviews={handleViewInterviews}
                      onViewRoundInterviews={handleViewRoundInterviews}
                      onOpenScreening={handleOpenScreening}
                      onConfigureOffer={handleConfigureOffer}
                      onExecuteOffer={handleExecuteOffer}
                      onOpenAssessmentDrawer={handleOpenAssessmentReview}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Loading rounds...
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeApplication && <ApplicationCard application={activeApplication} onClick={() => { }} />}
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
                  />
                </div>
              );
            }
            return null;
          })()}
        </DragOverlay>
      </DndContext>

      {selectedApplication && (
        <CandidateAssessmentView
          application={selectedApplication}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={jobTitle}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}

      {jobId && (
        <CreateRoundDialog
          open={createRoundDialogOpen}
          onOpenChange={setCreateRoundDialogOpen}
          onSuccess={handleRoundCreated}
          jobId={jobId}
        />
      )}

      {jobId && selectedRoundForConfig && (
        <>
          <AssessmentConfigurationDrawer
            open={assessmentConfigDrawerOpen}
            onOpenChange={setAssessmentConfigDrawerOpen}
            jobId={jobId}
            roundId={selectedRoundForConfig.id}
            roundName={selectedRoundForConfig.name}
            onSuccess={() => {
              loadRounds();
            }}
          />
          <InterviewConfigurationDrawer
            open={interviewConfigDrawerOpen}
            onOpenChange={setInterviewConfigDrawerOpen}
            jobId={jobId}
            roundId={selectedRoundForConfig.id}
            roundName={selectedRoundForConfig.name}
            jobRounds={rounds}
            onSuccess={() => {
              loadRounds();
            }}
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
            setInterviewConfigDrawerOpen(true);
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
          jobTitle={_jobData?.title || jobTitle}
          jobRequirements={_jobData?.requirements || []}
          jobDescription={_jobData?.description || ''}
          job={_jobData || { id: jobId, title: jobTitle, requirements: [], description: '' } as any}
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
              toast.success(`Moved candidate to ${nextRound.name}`);
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
            defaultConfig={getOfferConfig(selectedRoundForOffer.id)}
            onSuccess={() => {
              loadApplications();
            }}
          />
        </>
      )}
    </>
  );
}