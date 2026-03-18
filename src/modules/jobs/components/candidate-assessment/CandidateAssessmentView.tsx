// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, ClipboardCheck, MessageSquare, Activity, Vote, GitCompare, Highlighter, Mail, Phone, Hash, CheckSquare, Plus, Loader2, Sparkles, Lock } from "lucide-react";
import { Application } from "@/shared/types/application";
import { ActivityTimelineTab } from "./tabs/ActivityTimelineTab";
import { ExperienceSkillsTab } from "./tabs/ExperienceSkillsTab";
import { QuestionnaireResponsesTab } from "./tabs/QuestionnaireResponsesTab";
import { InterviewsTab } from "./tabs/InterviewsTab";
import { TeamReviewsTab } from "./tabs/TeamReviewsTab";
import { ResumeAnnotationsTab } from "./tabs/ResumeAnnotationsTab";
import { EmailTab } from "./tabs/EmailTab";
import { CallLogsTab } from "./tabs/CallLogsTab";
import { SmsTab } from "./tabs/SmsTab";
import { SlackTab } from "./tabs/SlackTab";
import { NotesTab } from "./tabs/NotesTab";
import { TaskCreationTab, TaskListTab } from "./tabs/CreateTaskTab";
import { CandidateAssessmentListTab } from "./tabs/AssessmentRoundTab";
import { useCursorTracking } from "@/shared/hooks/useCursorTracking";
import { NotificationCenter } from "@/modules/notifications/components/NotificationCenter";
import { CandidateInfoPanel } from "./CandidateInfoPanel";
import { CandidateNotesPanelEnhanced } from "./CandidateNotesPanelEnhanced";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/shared/components/ui/resizable";
import { useToast } from "@/shared/hooks/use-toast";
import { AiAssistantSidebar } from "@/shared/components/common/AiAssistantSidebar";
import { useCanUseAiFeatures } from "@/shared/hooks/useCanUseAiFeatures";

interface CandidateAssessmentViewProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  jobTitle: string;
  nextStageName?: string;
  onMoveToNextStage?: () => void;
  isSimpleFlow?: boolean;
  jobId?: string;
  onOfferCandidate?: (applicationId: string) => void;
  onRejectCandidate?: (applicationId: string) => void;
  canUseAiOverride?: boolean;
  statusUpdateDisabled?: boolean;
  statusUpdateDisabledReason?: string | null;
  offerActionsDisabledReason?: string | null;
}

export function CandidateAssessmentView({
  application,
  open,
  onOpenChange,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  jobTitle,
  nextStageName,
  onMoveToNextStage,
  isSimpleFlow,
  jobId,
  onOfferCandidate,
  onRejectCandidate,
  canUseAiOverride,
  statusUpdateDisabled = false,
  statusUpdateDisabledReason,
  offerActionsDisabledReason,
}: CandidateAssessmentViewProps) {
  const { toast } = useToast();
  const { canUseAi } = useCanUseAiFeatures(canUseAiOverride === undefined);
  const effectiveCanUseAi = canUseAiOverride ?? canUseAi;
  const [activeTab, setActiveTab] = useState("activity");
  const [topActiveTab, setTopActiveTab] = useState("notes");
  const [fullApplication, setFullApplication] = useState<Application>(application);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

  const statusToStageMap: Record<string, string> = {
    applied: "New Application",
    screening: "Resume Review",
    interview: "Technical Interview",
    offer: "Offer Extended",
    hired: "Offer Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!application.id) return;
      try {
        const { applicationService } = await import("@/modules/applications/lib/applicationService");
        const response = await applicationService.getApplication(application.id);
        if (response.success && response.data && response.data.application) {
          setFullApplication(prev => ({ ...prev, ...response.data!.application }));
        }
      } catch (error) {
        console.error("Failed to fetch full application details", error);
      }
    };

    fetchFullDetails();
  }, [application.id, application.updatedAt, application]);

  const { containerRef } = useCursorTracking({
    applicationId: fullApplication.id,
    currentUserId: 'current-user',
    enabled: open,
  });

  const assistantRequestBody = useMemo(
    () => ({
      context: {
        mode: "candidate_assessment",
        pageContext: "candidate_drawer",
        applicationId: fullApplication.id,
        candidateId: fullApplication.candidateId,
        candidateName: fullApplication.candidateName || "Candidate",
        candidateEmail: fullApplication.candidateEmail || fullApplication.email || undefined,
        jobId: fullApplication.jobId,
        jobTitle,
        currentStage: fullApplication.stage ? String(fullApplication.stage) : undefined,
        currentStatus: fullApplication.status ? String(fullApplication.status) : undefined,
        roundId: fullApplication.roundId || undefined,
        activeTab,
        pipelineMode: isSimpleFlow ? "simple" : "advanced",
      },
    }),
    [
      fullApplication.id,
      fullApplication.candidateId,
      fullApplication.candidateName,
      fullApplication.candidateEmail,
      fullApplication.email,
      fullApplication.jobId,
      fullApplication.stage,
      fullApplication.status,
      fullApplication.roundId,
      jobTitle,
      activeTab,
      isSimpleFlow,
    ]
  );

  // When AI sidebar closes, bump refresh key so notes re-fetch (AI may have written one)
  const prevAiOpenRef = useRef(isAiAssistantOpen);
  useEffect(() => {
    if (prevAiOpenRef.current && !isAiAssistantOpen) {
      setNotesRefreshKey((k) => k + 1);
    }
    prevAiOpenRef.current = isAiAssistantOpen;
  }, [isAiAssistantOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    } else if (e.key === "n" && hasNext && onNext) {
      onNext();
    } else if (e.key === "p" && hasPrevious && onPrevious) {
      onPrevious();
    }
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (statusUpdateDisabled) {
      toast({
        title: "Status locked",
        description: statusUpdateDisabledReason || "Use the kanban for candidate movement in this flow.",
        variant: "destructive",
      });
      return;
    }
    if (!fullApplication.id || !nextStatus || nextStatus === fullApplication.status) return;
    const currentStatus = String(fullApplication.status || "").toLowerCase();
    if (currentStatus === "hired") {
      toast({ title: "Status locked", description: "Hired candidate status cannot be changed.", variant: "destructive" });
      return;
    }
    if (nextStatus === "hired") {
      toast({ title: "Use Offer Flow", description: "Move candidate to Hired from the Offer tab onboarding flow.", variant: "destructive" });
      return;
    }
    const nextStage = statusToStageMap[nextStatus] || fullApplication.stage || "New Application";

    setIsUpdatingStatus(true);
    try {
      const { applicationService } = await import("@/modules/applications/lib/applicationService");
      const response = await applicationService.updateStage(fullApplication.id, nextStage);

      if (!response.success) {
        throw new Error(response.error || "Failed to update status");
      }

      setFullApplication((prev) => ({
        ...prev,
        status: nextStatus as Application["status"],
        stage: nextStage as Application["stage"],
      }));
      toast({ title: "Status updated" });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] p-0 gap-0 h-full overflow-hidden"
        onKeyDown={handleKeyDown}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Candidate Assessment - {fullApplication.candidateName || "Candidate"}</SheetTitle>
        <SheetDescription className="sr-only">
          Assessment details for {fullApplication.candidateName || "Candidate"}
        </SheetDescription>
        <div ref={containerRef} className="flex flex-col h-full relative overflow-hidden">
          {/* Compact Header */}
          <div className="bg-background flex-shrink-0">
            <div className="flex items-center justify-between py-1.5 px-2 gap-2 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="h-6 text-[10px] px-2 max-w-[180px] truncate">
                  {fullApplication.candidateName || "Candidate"}
                </Badge>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Status</span>
                <Select
                  value={String(fullApplication.status || "applied")}
                  onValueChange={handleStatusChange}
                  disabled={
                    statusUpdateDisabled ||
                    isUpdatingStatus ||
                    String(fullApplication.status || "").toLowerCase() === "hired"
                  }
                >
                  <SelectTrigger className="h-7 w-[160px] text-[11px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="h-7 px-2 text-[11px] gap-1.5 border-muted-foreground/20"
                >
                  {effectiveCanUseAi ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  Ask AI
                </Button>
                <NotificationCenter userId="current-user" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Resizable 3-Panel Content Layout */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Left Panel - Resizable Candidate Info */}
              <ResizablePanel
                defaultSize={25}
                minSize={20}
                maxSize={40}
                className="overflow-hidden"
              >
            <CandidateInfoPanel
              application={fullApplication}
              jobTitle={jobTitle}
              onOfferCandidate={onOfferCandidate}
              onRejectCandidate={onRejectCandidate}
              canUseAiOverride={effectiveCanUseAi}
              offerActionsDisabledReason={offerActionsDisabledReason}
            />
              </ResizablePanel>

              {/* Resize Handle */}
              <ResizableHandle withHandle />

              {/* Right Side - Notes + Tabs */}
              <ResizablePanel defaultSize={75} minSize={50}>
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Top - Notes Panel */}
                  {/* Top - Notes / New Task Panel */}
                  <div className="h-[360px] flex-shrink-0 border-b bg-background">
                    <CandidateNotesPanelEnhanced
                      applicationId={fullApplication.id}
                      jobId={jobId || fullApplication.jobId || ''}
                      candidateName={fullApplication.candidateName || "Candidate"}
                      jobTitle={jobTitle}
                      candidateEmail={fullApplication.candidateEmail}
                      candidatePhone={fullApplication.candidatePhone}
                      application={fullApplication}
                      refreshTrigger={notesRefreshKey}
                    />
                  </div>

                  {/* Bottom - Existing Tabs */}
                  <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <div className="border-b px-2 bg-muted/20 flex-shrink-0">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                          <TabsList className="h-10 bg-transparent inline-flex w-max gap-1 whitespace-nowrap">
                            <TabsTrigger value="activity" className="gap-1.5 text-xs">
                              <Activity className="h-3.5 w-3.5" />
                              Activity
                            </TabsTrigger>

                            <TabsTrigger value="notes" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Notes
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="gap-1.5 text-xs">
                              <CheckSquare className="h-3.5 w-3.5" />
                              Tasks
                            </TabsTrigger>
                            <TabsTrigger value="annotations" className="gap-1.5 text-xs">
                              <Highlighter className="h-3.5 w-3.5" />
                              Annotations
                            </TabsTrigger>
                            <TabsTrigger value="questionnaire" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Questionnaire
                            </TabsTrigger>
                            <TabsTrigger value="interviews" className="gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5" />
                              Interviews
                            </TabsTrigger>
                            <TabsTrigger value="assessment" className="gap-1.5 text-xs">
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              Assessment
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="gap-1.5 text-xs">
                              <Users className="h-3.5 w-3.5" />
                              Team Reviews
                            </TabsTrigger>
                            <TabsTrigger value="email" className="gap-1.5 text-xs">
                              <Mail className="h-3.5 w-3.5" />
                              Email
                            </TabsTrigger>
                            <TabsTrigger value="calls" className="gap-1.5 text-xs">
                              <Phone className="h-3.5 w-3.5" />
                              Calls
                            </TabsTrigger>
                            <TabsTrigger value="sms" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              SMS
                            </TabsTrigger>
                            <TabsTrigger value="slack" className="gap-1.5 text-xs">
                              <Hash className="h-3.5 w-3.5" />
                              Slack
                            </TabsTrigger>
                          </TabsList>
                        </div>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="p-4">
                          <TabsContent value="activity" className="mt-0">
                            <ActivityTimelineTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="notes" className="mt-0">
                            <NotesTab application={fullApplication} />
                          </TabsContent>





                          <TabsContent value="tasks" className="mt-0 h-full">
                            <TaskListTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="experience" className="mt-0">
                            <ExperienceSkillsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="questionnaire" className="mt-0">
                            <QuestionnaireResponsesTab
                              application={fullApplication}
                              jobId={jobId || fullApplication.jobId}
                            />
                          </TabsContent>

                          <TabsContent value="interviews" className="mt-0">
                            <InterviewsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="assessment" className="mt-0">
                            <CandidateAssessmentListTab
                              application={fullApplication}
                              jobId={jobId || fullApplication.jobId || ""}
                            />
                          </TabsContent>

                          <TabsContent value="reviews" className="mt-0">
                            <TeamReviewsTab
                              application={fullApplication}
                              onUpdate={async () => {
                                if (!application.id) return;
                                try {
                                  const { applicationService } = await import("@/modules/applications/lib/applicationService");
                                  const response = await applicationService.getApplication(application.id);
                                  if (response.success && response.data && response.data.application) {
                                    setFullApplication(prev => ({ ...prev, ...response.data!.application }));
                                  }
                                } catch (error) {
                                  console.error("Failed to fetch full application details", error);
                                }
                              }}
                            />
                          </TabsContent>

                          <TabsContent value="annotations" className="mt-0">
                            <ResumeAnnotationsTab candidateId={fullApplication.id} application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="email" className="mt-0">
                            <EmailTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="calls" className="mt-0">
                            <CallLogsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="sms" className="mt-0">
                            <SmsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="slack" className="mt-0">
                            <SlackTab application={fullApplication} />
                          </TabsContent>
                        </div>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </SheetContent>

      <Sheet open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[560px] p-0"
          overlayClassName="bg-black/25 backdrop-blur-[1px]"
        >
          <SheetTitle className="sr-only">Ask AI about this candidate</SheetTitle>
          <SheetDescription className="sr-only">
            Candidate-scoped assistant for analysis and actions
          </SheetDescription>
          <AiAssistantSidebar
            streamEndpoint="/api/assistant/chat/stream"
            requestBody={assistantRequestBody}
            welcomeTitle="Candidate Copilot"
            welcomeSubtitle="Ask anything about this candidate or run actions."
            suggestedPrompts={[
              "Give me a full summary of this candidate",
              "What are the top strengths and concerns?",
              "Move this candidate to Technical Interview",
              "Add a note: Strong communication and stakeholder handling",
            ]}
            canUseAiOverride={effectiveCanUseAi}
            lockDescriptionOverride="AI features require a paid plan (Small or higher). Upgrade to unlock AI-powered assistance for this company."
          />
        </SheetContent>
      </Sheet>
    </Sheet >
  );
}
