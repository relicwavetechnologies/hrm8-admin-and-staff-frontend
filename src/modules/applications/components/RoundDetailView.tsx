// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Application } from "@/shared/types/application";
import { JobRound } from "@/shared/lib/jobRoundService";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ApplicationCard } from "./ApplicationCard";
import { Users, Filter, Settings, Loader2, CheckCircle2, AlertCircle, Send, Eye, Clock, ArrowRight, Calendar, Video, Phone, MapPin, XCircle, Sparkles, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { format, isValid } from "date-fns";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { AssessmentGradingDialog } from "./AssessmentGradingDialog";
import { InterviewRoundPanel } from "./InterviewRoundPanel";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { applicationService } from "@/shared/lib/applicationService";
import { CandidateEvaluationView } from "./candidate-evaluation/CandidateEvaluationView";

interface RoundDetailViewProps {
  jobId: string;
  round: JobRound;
  applications: Application[];
  onApplicationClick: (app: Application) => void;
  onMoveToRound?: (appId: string, roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds?: JobRound[];
  onMoveToNextRound?: (applicationId: string) => Promise<void> | void;
  onReject?: (applicationId: string) => void;
  onRefresh?: () => void;
  onConfigureEmail?: (roundId: string) => void;
  isSimpleFlow?: boolean;
}

interface RoundAssessment {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  status: string; // 'INVITED' | 'IN_PROGRESS' | 'COMPLETED'
  score: number | null;
  averageScore?: number | null;
  invitedAt: string | null;
  completedAt: string | null;
  invitationToken: string;
  isFinalized?: boolean;
}

// Derive display state from assessment data
type DisplayState = 'NOT_INVITED' | 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';

const PASS_THRESHOLD = 70;

function getDisplayState(assessment: RoundAssessment | null): DisplayState {
  if (!assessment) return 'NOT_INVITED';

  const { status, averageScore, isFinalized } = assessment;

  // Finalized with score determines pass/fail
  if (isFinalized && averageScore !== null) {
    return averageScore >= PASS_THRESHOLD ? 'PASSED' : 'FAILED';
  }

  // Assessment completed, awaiting grading/finalization
  if (status === 'COMPLETED') return 'COMPLETED';

  // Assessment in progress
  if (status === 'IN_PROGRESS') return 'IN_PROGRESS';

  // Invited but not started
  if (status === 'INVITED') return 'INVITED';

  return 'NOT_INVITED';
}

export function RoundDetailView({
  jobId,
  round,
  applications,
  onApplicationClick,
  onMoveToRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onMoveToNextRound,
  onReject,
  onRefresh,
  onConfigureEmail,
  isSimpleFlow = false
}: RoundDetailViewProps) {

  // Candidates currently in this round
  const roundApplications = useMemo(() => {
    return applications.filter(app => app.roundId === round.id);
  }, [applications, round.id]);

  // Assessment data
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RoundAssessment[]>([]);
  const [activeTab, setActiveTab] = useState(round.type === 'ASSESSMENT' ? "candidates" : "candidates");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Bulk Analysis State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [movingNextIds, setMovingNextIds] = useState<Set<string>>(new Set());

  // Candidate detail drawer state
  const [selectedProfileApp, setSelectedProfileApp] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const handleViewProfile = (app: Application) => {
    setSelectedProfileApp(app);
    setDetailPanelOpen(true);
  };

  // Evaluation State
  const [selectedAppForEval, setSelectedAppForEval] = useState<Application | null>(null);

  useEffect(() => {
    if (round.type === 'ASSESSMENT' && jobId && round.id) {
      fetchAssessments();
    }
    // Clear selection when round changes
    setSelectedCandidateIds(new Set());
  }, [jobId, round.id, round.type, applications]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<RoundAssessment[]>(`/api/jobs/${jobId}/rounds/${round.id}/assessments`);
      if (response.success && response.data) {
        setAssessments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (applicationId: string) => {
    setInvitingId(applicationId);
    try {
      const response = await apiClient.post(`/api/assessments/invite`, {
        applicationId,
        jobRoundId: round.id
      });
      if (response.success) {
        toast.success("Invitation sent successfully");
        fetchAssessments();
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Failed to invite", error);
      toast.error("Failed to send invitation");
    } finally {
      setInvitingId(null);
    }
  };

  const handleResend = async (assessmentId: string) => {
    setResendingId(assessmentId);
    try {
      const response = await apiClient.post(`/api/assessments/${assessmentId}/resend`);
      if (response.success) {
        toast.success("Invitation resent successfully");
        fetchAssessments();
      }
    } catch (error) {
      console.error("Failed to resend invitation", error);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleGrade = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setGradingOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBulkReanalyze = async () => {
    if (selectedCandidateIds.size === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await applicationService.bulkScoreCandidates(
        Array.from(selectedCandidateIds),
        jobId
      );

      if (result.success && result.data) {
        toast.success(result.data.message || `Successfully analyzed ${result.data.success} candidates`);
        // Refresh the page data
        onRefresh?.();
        // Clear selection
        setSelectedCandidateIds(new Set());
      } else {
        toast.error(result.error || "Failed to analyze candidates");
      }
    } catch (error) {
      console.error("Bulk analysis failed", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isBulkMoving, setIsBulkMoving] = useState(false);

  const handleBulkMove = async () => {
    if (selectedCandidateIds.size === 0) return;

    setIsBulkMoving(true);
    try {
      const selectedApps = roundApplications.filter(app => selectedCandidateIds.has(app.id));

      for (const app of selectedApps) {
        if (app.shortlisted) {
          await onMoveToNextRound?.(app.id);
        } else if (app.status === 'rejected') {
          await onReject?.(app.id);
        }
      }

      toast.success(`Successfully processed ${selectedApps.length} candidates`);
      onRefresh?.();
      setSelectedCandidateIds(new Set());
    } catch (error) {
      console.error("Bulk move failed", error);
      toast.error("Failed to move some candidates");
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleMoveToNext = async (applicationId: string) => {
    if (!onMoveToNextRound) return;
    setMovingNextIds((prev) => new Set(prev).add(applicationId));
    try {
      await onMoveToNextRound(applicationId);
    } finally {
      setMovingNextIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  // Build candidate list with assessment state
  const candidatesWithState = useMemo(() => {
    return roundApplications.map(app => {
      const assessment = assessments.find(a => a.applicationId === app.id);
      const displayState = getDisplayState(assessment || null);
      return { app, assessment, displayState };
    });
  }, [roundApplications, assessments]);

  // Group candidates by state
  const pendingCandidates = candidatesWithState.filter(c =>
    ['NOT_INVITED', 'INVITED', 'IN_PROGRESS'].includes(c.displayState)
  );
  const reviewCandidates = candidatesWithState.filter(c => c.displayState === 'COMPLETED');
  const decidedCandidates = candidatesWithState.filter(c =>
    ['PASSED', 'FAILED'].includes(c.displayState)
  );

  // Render a single candidate row
  const renderCandidateRow = ({ app, assessment, displayState }: { app: Application; assessment: RoundAssessment | null; displayState: DisplayState }) => {
    const name = app.candidateName || 'Unknown';

    return (
      <div
        key={app.id}
        className="group flex items-center justify-between p-4 mb-3 bg-background border border-border/40 rounded-xl hover:border-border/80 hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-border/20">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-foreground/90">{name}</h4>
              {assessment?.averageScore != null && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted/50 text-muted-foreground border-0">
                  Score: {assessment.averageScore}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-3">
              {/* Status Badge */}
              {displayState === 'NOT_INVITED' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400">Not Invited</Badge>
              )}
              {displayState === 'INVITED' && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">Invited</Badge>
                  {assessment?.invitedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      {format(new Date(assessment.invitedAt), 'MMM d')}
                    </span>
                  )}
                </>
              )}
              {displayState === 'IN_PROGRESS' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">In Progress</Badge>
              )}
              {displayState === 'COMPLETED' && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-400 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Completed</Badge>
                  {assessment?.completedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      {format(new Date(assessment.completedAt), 'MMM d')}
                    </span>
                  )}
                </>
              )}
              {displayState === 'PASSED' && (
                <Badge className="text-[10px] h-5 px-1.5 bg-green-500 text-white dark:bg-green-600 dark:text-white">Passed</Badge>
              )}
              {displayState === 'FAILED' && (
                <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Failed</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions based on state */}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Always show View Profile */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleViewProfile(app)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Button>

          {displayState === 'NOT_INVITED' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={() => handleInvite(app.id)}
              disabled={invitingId === app.id}
            >
              {invitingId === app.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Invite
            </Button>
          )}

          {(displayState === 'INVITED' || displayState === 'IN_PROGRESS') && assessment && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs hover:bg-primary/5"
              onClick={() => handleResend(assessment.id)}
              disabled={resendingId === assessment.id}
            >
              {resendingId === assessment.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Resend
            </Button>
          )}

          {displayState === 'COMPLETED' && assessment && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => handleGrade(assessment.id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Review & Grade
            </Button>
          )}

          {displayState === 'PASSED' && (
            <>
              {assessment && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleGrade(assessment.id)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onMoveToNextRound && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 text-xs bg-primary hover:bg-primary/90"
                  onClick={() => onMoveToNextRound(app.id)}
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  Next Stage
                </Button>
              )}
            </>
          )}

          {displayState === 'FAILED' && (
            <>
              {assessment && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleGrade(assessment.id)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => onReject?.(app.id)}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 tracking-tight">
            {round.name}
            <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {roundApplications.length}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Manage candidates in the {round.name} stage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isSimpleFlow && round.type === 'INTERVIEW' && !round.isFixed && onConfigureInterview && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureInterview(round.id)}
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
          {!isSimpleFlow && onConfigureEmail && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureEmail(round.id)}
            >
              <Mail className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
          {!isSimpleFlow && round.type === 'ASSESSMENT' && !round.isFixed && onConfigureAssessment && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureAssessment(round.id)}
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {roundApplications.length > 0 && (
          <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={roundApplications.length > 0 && selectedCandidateIds.size === roundApplications.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCandidateIds(new Set(roundApplications.map((a) => a.id)));
                  } else {
                    setSelectedCandidateIds(new Set());
                  }
                }}
                id="select-all-candidates"
              />
              <Label htmlFor="select-all-candidates" className="text-xs text-muted-foreground cursor-pointer">
                Select All ({roundApplications.length})
              </Label>
            </div>
            {selectedCandidateIds.size > 0 && (
              <div className="flex items-center gap-2">
                {round.type === "ASSESSMENT" && !isSimpleFlow && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkReanalyze}
                    disabled={isAnalyzing}
                    className="h-8 text-xs"
                  >
                    {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                    Reanalyze
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleBulkMove}
                  disabled={isBulkMoving}
                  className="h-8 text-xs"
                >
                  {isBulkMoving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5 mr-1.5" />}
                  Move Selected
                </Button>
              </div>
            )}
          </div>
        )}

        {round.type === "ASSESSMENT" && loading ? (
          <div className="flex items-center justify-center rounded-md border bg-background p-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : roundApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border bg-background p-12 text-center text-muted-foreground">
            <Users className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium text-foreground">No candidates in this round</p>
            <p className="text-xs mt-1">Move candidates here from the pipeline.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 text-muted-foreground uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 w-8"></th>
                    <th className="text-left px-3 py-2">Candidate</th>
                    <th className="text-left px-3 py-2">Applied</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Score</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roundApplications.map((app) => {
                    const assessment = assessments.find((a) => a.applicationId === app.id) || null;
                    const displayState = round.type === "ASSESSMENT" ? getDisplayState(assessment) : null;
                    const appliedDate = new Date(app.appliedDate || app.createdAt || (app as any).created_at);
                    const statusBadge =
                      isSimpleFlow ? (
                        <Badge variant="outline" className="h-5 text-[10px]">Manual</Badge>
                      ) : round.type === "ASSESSMENT" ? (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {displayState?.replace(/_/g, " ")}
                        </Badge>
                      ) : app.status === "rejected" ? (
                        <Badge variant="outline" className="h-5 text-[10px] text-red-700 border-red-200 bg-red-50">Rejected</Badge>
                      ) : app.shortlisted ? (
                        <Badge variant="outline" className="h-5 text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50">Shortlisted</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 text-[10px]">Pending</Badge>
                      );

                    const scoreValue =
                      round.type === "ASSESSMENT"
                        ? assessment?.averageScore ?? assessment?.score ?? null
                        : (app.score ?? app.aiMatchScore ?? null);

                    const canMoveToNext =
                      isSimpleFlow
                        ? app.status !== "rejected"
                        : round.type === "ASSESSMENT"
                        ? displayState === "PASSED"
                        : app.status !== "rejected";

                    return (
                      <tr key={app.id} className="border-t hover:bg-muted/10">
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={selectedCandidateIds.has(app.id)}
                            onCheckedChange={(checked) => {
                              const next = new Set(selectedCandidateIds);
                              if (checked) next.add(app.id);
                              else next.delete(app.id);
                              setSelectedCandidateIds(next);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px]">{getInitials(app.candidateName || "Unknown")}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{app.candidateName || "Unknown Candidate"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{app.candidateEmail || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {isValid(appliedDate) ? format(appliedDate, "MMM d, yyyy") : "N/A"}
                        </td>
                        <td className="px-3 py-2">{statusBadge}</td>
                        <td className="px-3 py-2">
                          {scoreValue != null ? (
                            <Badge variant="outline" className="h-5 text-[10px]">
                              {scoreValue}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                              onClick={() => handleViewProfile(app)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View Profile
                            </Button>

                            {round.type === "ASSESSMENT" && !isSimpleFlow && displayState === "NOT_INVITED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px]"
                                onClick={() => handleInvite(app.id)}
                                disabled={invitingId === app.id}
                              >
                                {invitingId === app.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                                Invite
                              </Button>
                            )}

                            {round.type === "ASSESSMENT" && !isSimpleFlow && (displayState === "INVITED" || displayState === "IN_PROGRESS") && assessment && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px]"
                                onClick={() => handleResend(assessment.id)}
                                disabled={resendingId === assessment.id}
                              >
                                {resendingId === assessment.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                                Resend
                              </Button>
                            )}

                            {round.type === "ASSESSMENT" && !isSimpleFlow && displayState === "COMPLETED" && assessment && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px]"
                                onClick={() => handleGrade(assessment.id)}
                              >
                                Review & Grade
                              </Button>
                            )}

                            <Button
                              size="sm"
                              className="h-7 text-[11px]"
                              onClick={() => handleMoveToNext(app.id)}
                              disabled={!canMoveToNext || !onMoveToNextRound || movingNextIds.has(app.id)}
                            >
                              {movingNextIds.has(app.id) ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              ) : (
                                <ArrowRight className="h-3.5 w-3.5 mr-1" />
                              )}
                              {movingNextIds.has(app.id) ? "Moving..." : "Move to Next Stage"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedAssessmentId && (
        <AssessmentGradingDialog
          open={gradingOpen}
          onOpenChange={setGradingOpen}
          assessmentId={selectedAssessmentId}
          readOnly={false}
          onGraded={fetchAssessments}
        />
      )}

      {/* Candidate Detail Drawer */}
      {selectedProfileApp && (
        <CandidateAssessmentView
          key={selectedProfileApp.id}
          application={selectedProfileApp}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={round.name}
          jobId={jobId}
        />
      )}

      {selectedAppForEval && (
        <CandidateEvaluationView
          isOpen={!!selectedAppForEval}
          application={selectedAppForEval}
          onClose={() => setSelectedAppForEval(null)}
          onEvaluationComplete={() => {
            onRefresh?.();
            // We keep it open or close depending on preference, current implementation closes if non-pending decision
          }}
        />
      )}
    </div>
  );
}
