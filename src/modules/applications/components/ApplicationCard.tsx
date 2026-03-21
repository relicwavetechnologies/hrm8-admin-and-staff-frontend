// @ts-nocheck
import { Application, ApplicationStage } from "@/shared/types/application";
import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Star, Calendar, FileText, MoreVertical, Mail, Phone, Sparkles, MessageSquare, Users, Bell, Info, Eye, CheckCircle2, CalendarClock, CheckCircle, Clock, UserX } from "lucide-react";
import { AIAnalysisView } from "./screening/AIAnalysisView";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AIMatchBadge } from "./AIMatchBadge";
import { AIInterviewScoreBadge } from "./AIInterviewScoreBadge";
import { TagManager } from "./TagManager";
import { QuickScoringWidget } from "./shortlisting/QuickScoringWidget";
import { RankingWidget } from "./shortlisting/RankingWidget";
import { StageDropdownMenu } from "./stages/StageDropdownMenu";
import { ProfileCompletenessIndicator } from "./parsing/ProfileCompletenessIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AIInterviewQuestionDialog } from "./AIInterviewQuestionDialog";
import { AutoScheduleAIInterviewDialog } from "./AutoScheduleAIInterviewDialog";
import { generateQuestionsFromApplication } from "@/shared/lib/aiInterviewQuestions";
import { ApplicationReviewDialog } from "./ApplicationReviewDialog";
import { ApplicationReviewPanel } from "./ApplicationReviewPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { getConsensusMetrics } from "@/shared/lib/applications/collaborativeReview";
import { isFollowing, followApplication, unfollowApplication } from "@/shared/lib/applications/notifications";
import { useToast } from "@/shared/hooks/use-toast";
import { applicationService } from "@/shared/lib/applicationService";

import { JobRound } from "@/shared/lib/jobRoundService";

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  isCompareMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (applicationId: string) => void;
  showOnlyReview?: boolean; // If true, only show Review button (for pipeline view)
  onViewInterviews?: (application: Application) => void; // New prop for viewing interviews
  onStageChange?: (applicationId: string, newStage: ApplicationStage) => void; // New prop for stage changes
  onScoreUpdate?: (applicationId: string, newScore: number) => void; // New prop for score updates
  onRankUpdate?: (applicationId: string, newRank: number) => void; // New prop for rank updates
  onShortlistChange?: (applicationId: string, shortlisted: boolean) => void; // New prop for shortlist changes
  variant?: 'default' | 'minimal';
  allRounds?: JobRound[];
  onMoveToRound?: (applicationId: string, roundId: string) => void;
  isOptimisticMove?: boolean; // Visual state for optimistic updates
  hasFailed?: boolean; // Visual state for failed moves
  isSimpleFlow?: boolean;
  isDragOverlay?: boolean;
  isPendingApproval?: boolean; // Consultant view: awaiting HR approval for OFFER/REJECT
  dragDisabled?: boolean;
  restrictToOfferActions?: boolean;
  lockReason?: string;
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronDown, ArrowRight } from "lucide-react";

export function ApplicationCard({
  application,
  onClick,
  isCompareMode = false,
  isSelected = false,
  onToggleSelect,
  showOnlyReview = false,
  onViewInterviews,
  onStageChange,
  onScoreUpdate,
  onRankUpdate,
  onShortlistChange,
  variant = 'default',
  allRounds,
  onMoveToRound,
  isOptimisticMove = false,
  hasFailed = false,
  isSimpleFlow = false,
  isDragOverlay = false,
  isPendingApproval = false,
  dragDisabled = false,
  restrictToOfferActions = false,
  lockReason,
}: ApplicationCardProps) {
  if (!application || !application.id) {
    return null;
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showScheduleAIInterview, setShowScheduleAIInterview] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<ReturnType<typeof generateQuestionsFromApplication>>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);

  useEffect(() => {
    const metrics = getConsensusMetrics(application.id);
    setReviewCount(metrics.totalReviews);
    setVoteCount(metrics.totalVotes);
    setFollowing(isFollowing('current-user-id', application.id));
  }, [application.id]);

  const handleReviewAdded = () => {
    const metrics = getConsensusMetrics(application.id);
    setReviewCount(metrics.totalReviews);
    setVoteCount(metrics.totalVotes);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = 'current-user-id';
    if (following) {
      unfollowApplication(userId, application.id);
      setFollowing(false);
    } else {
      followApplication(userId, application.id);
      setFollowing(true);
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id, disabled: isDragOverlay || dragDisabled });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  const normalizedStage = String(application.stage || "").toLowerCase();
  const normalizedStatus = String(application.status || "").toLowerCase();

  const findRound = (target: "OFFER" | "REJECTED" | "HIRED") => {
    if (!allRounds || allRounds.length === 0) return null;
    return (
      allRounds.find((r) => r.fixedKey === target) ||
      allRounds.find((r) => {
        const name = String(r.name || "").toLowerCase();
        if (target === "OFFER") return name === "offer";
        if (target === "HIRED") return name === "hired";
        return name === "rejected" || name === "declined";
      }) ||
      null
    );
  };

  const offerRound = findRound("OFFER");
  const hiredRound = findRound("HIRED");
  const rejectedRound = findRound("REJECTED");
  const managedPipelineOwner = application.managedPipelineOwner ?? null;
  const isInHiredRound = !!(application.roundId && hiredRound && application.roundId === hiredRound.id);
  const isInOfferRound = !!(application.roundId && offerRound && application.roundId === offerRound.id);
  const isInRejectedRound = !!(application.roundId && rejectedRound && application.roundId === rejectedRound.id);
  const isOfferState = isInOfferRound || normalizedStage.includes("offer") || normalizedStatus === "offer";
  const isHiredState = isInHiredRound || normalizedStage.includes("hired") || normalizedStatus === "hired";
  const isRejectedState = isInRejectedRound || normalizedStage.includes("reject") || normalizedStatus === "rejected";
  const isFullServiceHandoffState =
    managedPipelineOwner === "COMPANY" || Boolean(application.offerHandoffAt);
  const isShortlistedState =
    !isFullServiceHandoffState &&
    !isRejectedState &&
    !isHiredState &&
    (isOfferState || Boolean(application.shortlisted));

  const displayCandidateName = application.candidateName?.trim() || "Unknown Candidate";

  const getInitials = (name?: string) => {
    return (name || "Unknown Candidate")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActionLocked = Boolean(lockReason);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActionLocked) {
      toast({
        title: "Action locked",
        description: lockReason,
        variant: "destructive",
      });
      return;
    }
    if (isOfferState || isRejectedState || isHiredState) {
      return;
    }

    if (offerRound && onMoveToRound) {
      onMoveToRound(application.id, offerRound.id);
      return;
    }

    setIsShortlisting(true);
    try {
      await applicationService.updateStage(application.id, "Offer Extended");
      toast({
        title: "Candidate moved",
        description: `${application.candidateName || "Candidate"} moved to Offer.`,
      });
      // Refresh if there's a refresh callback
      if (onClick) {
        onClick();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move candidate to Offer.",
        variant: "destructive",
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActionLocked) {
      toast({
        title: "Action locked",
        description: lockReason,
        variant: "destructive",
      });
      return;
    }
    if (restrictToOfferActions) {
      toast({
        title: "Offer actions only",
        description: "For HRM8 Managed Recruitment jobs, your company can only take action in the Offer round.",
        variant: "destructive",
      });
      return;
    }
    if (isRejectedState || isHiredState) return;
    
    // Find the Rejected round
    // Try to find by fixedKey first, then name
    if (rejectedRound && onMoveToRound) {
       onMoveToRound(application.id, rejectedRound.id);
       return;
    }

    applicationService.updateStage(application.id, "Rejected").then((res) => {
      if (res.success) {
        toast({
          title: "Candidate moved",
          description: `Moved ${application.candidateName} to Rejected.`,
        });
        onClick?.();
      } else {
        toast({
          title: "Error",
          description: "Could not move candidate to Rejected.",
          variant: "destructive"
        });
      }
    }).catch(() => {
      toast({
        title: "Error",
        description: "Could not move candidate to Rejected.",
        variant: "destructive"
      });
    });
  };

  const handleGenerateQuestions = (e: React.MouseEvent) => {
    e.stopPropagation();
    const questions = generateQuestionsFromApplication(
      application,
      application.jobTitle,
      application.employerName
    );
    setGeneratedQuestions(questions);
    setShowQuestionDialog(true);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...(!isDragOverlay ? attributes : {})}
        {...(!isDragOverlay ? listeners : {})}
        className={`${variant === 'minimal' ? 'p-2 border-muted/60 shadow-none hover:shadow-sm' : 'p-2.5'} cursor-pointer transition-all relative group ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${
          isOptimisticMove ? 'opacity-70 animate-pulse' : ''
        } ${
          hasFailed ? 'border-destructive animate-shake' : ''
        }`}
        onClick={onClick}
      >
        {/* Comparison Checkbox */}
        {isCompareMode && (
          <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(application.id)}
              className="bg-background"
            />
          </div>
        )}
        {/* New/Unread Indicator */}
        {(application.isNew || !application.isRead) && variant !== 'minimal' && (
          <div className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        )}

        {/* Quick Actions Menu - REMOVED as per user request */}
        <div className="flex items-start gap-2">
          {variant === 'minimal' ? (
            // Minimal Header Layout
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                  <AvatarImage src={application.candidatePhoto} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                    {getInitials(displayCandidateName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${!application.isRead ? 'font-bold' : ''}`}>
                    {displayCandidateName}
                  </h4>
                  {!isSimpleFlow && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {application.jobTitle || "Candidate"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 flex-wrap">
                {!isFullServiceHandoffState && isShortlistedState && (
                  <Badge variant="default" className="h-5 px-2 text-[10px] bg-green-600 hover:bg-green-600">
                    Shortlisted
                  </Badge>
                )}
                {lockReason && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="h-5 px-2 text-[10px] border-amber-300 text-amber-700">
                          Locked
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{lockReason}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isHiredState && (
                  <Badge className="h-5 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-600">
                    Hired
                  </Badge>
                )}
                {isRejectedState && (
                  <Badge variant="destructive" className="h-5 px-2 text-[10px]">
                    Rejected
                  </Badge>
                )}
                {!isSimpleFlow && !isOfferState && !isRejectedState && !isHiredState && application.stage && (
                  <Badge variant="outline" className="h-5 px-2 text-[10px]">
                    {application.stage}
                  </Badge>
                )}
              </div>

              {/* Centered Score */}
              {(isSimpleFlow || application.score !== undefined || application.aiMatchScore !== undefined) && (
                <div className="flex justify-center py-1">
                   <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 h-6 font-semibold bg-primary/5 text-primary hover:bg-primary/10 border-0"
                  >
                    {application.score ?? Math.round(application.aiMatchScore || 0)}% Match
                  </Badge>
                </div>
              )}

              {/* Minimal Actions */}
               <div className={`flex items-center gap-2 mt-1 ${isSimpleFlow ? "justify-center" : ""}`}>
                    {!isSimpleFlow && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-7 px-0 bg-background hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClick?.();
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1.5 opacity-70" />
                        View
                      </Button>
                    )}
                    {!isOfferState && !isRejectedState && !isHiredState && (
                      <Button
                        variant="default"
                        size="sm"
                        className={`${isSimpleFlow ? "h-7 min-w-[84px] px-3 text-[11px]" : "h-7 px-2 text-[10px]"}`}
                        onClick={handleShortlist}
                        disabled={isActionLocked || isShortlisting}
                        title="Move to Offer"
                      >
                        Offer
                      </Button>
                    )}
                    {isSimpleFlow ? (
                      !restrictToOfferActions && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 min-w-[84px] px-3 text-[11px] border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        onClick={handleReject}
                        disabled={isActionLocked || isRejectedState || isHiredState}
                        title="Reject Candidate"
                      >
                        Reject
                      </Button>
                      )
                    ) : (
                      !restrictToOfferActions && (
                      <Button
                         variant="ghost"
                         size="sm"
                         className="h-7 w-7 px-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                         onClick={handleReject}
                         disabled={isActionLocked || isRejectedState || isHiredState}
                         title="Reject Candidate"
                      >
                         <UserX className="h-3.5 w-3.5" />
                      </Button>
                      )
                    )}
                  </div>
            </div>
          ) : (
            // Default Header Layout
            <>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={application.candidatePhoto} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(application.candidateName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-sm font-semibold truncate ${!application.isRead ? 'font-bold' : ''}`}>
                    {application.candidateName}
                  </h4>
                  {isPendingApproval && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 border-amber-500 text-amber-700 dark:text-amber-400">
                            <Clock className="h-2.5 w-2.5" />
                            Pending
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Awaiting HR approval for OFFER/REJECT</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {application.jobTitle}
                </p>

                {/* AI Match Badge - Prominent */}
                {application.aiMatchScore && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <AIMatchBadge score={application.aiMatchScore} size="sm" />
                      {application.aiAnalysis?.recommendation && (
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1 py-0 h-4 ${
                            application.aiAnalysis.recommendation === 'strong_hire' || application.aiAnalysis.recommendation === 'hire' 
                              ? 'border-green-500 text-green-700 dark:text-green-400' 
                              : application.aiAnalysis.recommendation === 'maybe'
                              ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                              : 'border-red-500 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {application.aiAnalysis.recommendation === 'strong_hire' ? 'Strong Hire' :
                           application.aiAnalysis.recommendation === 'hire' ? 'Hire' :
                           application.aiAnalysis.recommendation === 'maybe' ? 'Maybe' :
                           application.aiAnalysis.recommendation === 'no_hire' ? 'No Hire' :
                           'Strong No Hire'}
                        </Badge>
                      )}
                    </div>
                    {/* AI Review/Justification - Compact */}
                    {application.aiAnalysis?.justification && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-start gap-1 text-[10px] text-muted-foreground cursor-help group">
                              <Info className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                              <p className="line-clamp-1 leading-tight">
                                {application.aiAnalysis.justification.length > 80 
                                  ? `${application.aiAnalysis.justification.substring(0, 80)}...` 
                                  : application.aiAnalysis.justification}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm p-3">
                            <p className="text-xs leading-relaxed">{application.aiAnalysis.justification}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}

                {/* Screening Status Indicator */}
                {(application.aiMatchScore || application.score) && (
                  <div className="mt-1 flex items-center gap-1">
                    {application.score && application.score > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" />
                              Screened
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Manually screened: {application.score}%</p>
                            {application.aiMatchScore && (
                              <p className="text-xs">AI score: {application.aiMatchScore}%</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : application.aiMatchScore && application.aiMatchScore > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-500 text-blue-700 dark:text-blue-400 flex items-center gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI Scored
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">AI scored: {application.aiMatchScore}%</p>
                            <p className="text-xs">Pending manual review</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-amber-500 text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              Pending
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Awaiting screening</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}

                {/* Compact Rating, Score, Rank, and Shortlisted */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {application.rating && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2.5 w-2.5 ${
                            i < application.rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {!isCompareMode && application.score !== undefined && (
                    <QuickScoringWidget
                      applicationId={application.id}
                      score={application.score}
                      onScoreUpdate={(newScore) => onScoreUpdate?.(application.id, newScore)}
                      variant="inline"
                    />
                  )}
                  {application.score === undefined && application.aiMatchScore && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-500 text-blue-700">
                      AI: {Math.round(application.aiMatchScore)}%
                    </Badge>
                  )}
                  {!isCompareMode && application.rank !== undefined && (
                    <RankingWidget
                      applicationId={application.id}
                      rank={application.rank}
                      onRankUpdate={(newRank) => onRankUpdate?.(application.id, newRank)}
                      variant="inline"
                    />
                  )}
                  {!isCompareMode && (
                    isHiredState ? (
                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-600 hover:bg-emerald-600">
                        Hired
                      </Badge>
                    ) : isRejectedState ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                        Rejected
                      </Badge>
                    ) : isShortlistedState ? (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-600 hover:bg-green-600">
                        Shortlisted
                      </Badge>
                    ) : null
                  )}
                  {application.shortlisted && isCompareMode && (
                    <Badge variant="default" className="text-[10px] px-1 py-0 h-4 bg-green-500">
                      Shortlisted
                    </Badge>
                  )}
                  <AIInterviewScoreBadge candidateId={application.candidateId} variant="compact" />
                </div>

                {/* Compact Metadata */}
                {variant !== 'minimal' && (
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      <span className="truncate">
                        {(() => {
                          const date = new Date(application.appliedDate);
                          return isNaN(date.getTime()) 
                            ? 'Just now' 
                            : formatDistanceToNow(date, { addSuffix: true });
                        })()}
                      </span>
                    </div>
                    {application.resumeUrl && (
                      <div className="flex items-center gap-0.5">
                        <FileText className="h-2.5 w-2.5" />
                        <span>CV</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {!isCompareMode && variant !== 'minimal' && (
                  <div className="mt-1.5">
                    <TagManager
                      applicationId={application.id}
                      tags={application.tags || []}
                    />
                  </div>
                )}

                {/* Team Review Indicator */}
                {!isCompareMode && (reviewCount > 0 || voteCount > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 mt-1.5 text-[10px] w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReviewPanel(true);
                    }}
                  >
                    <Users className="h-2.5 w-2.5 mr-1" />
                    {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                    {voteCount > 0 && ` • ${voteCount} votes`}
                  </Button>
                )}

                {/* Action Buttons */}
                {!isCompareMode && (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
                    {showOnlyReview ? (
                      // Pipeline view - show Review and View Interviews buttons
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        {onViewInterviews && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewInterviews(application);
                            }}
                          >
                            <CalendarClock className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </>
                    ) : (
                      // Full view - show all buttons
                      <>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClick?.();
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          {!restrictToOfferActions && !isRejectedState && !isHiredState && (
                            <Button 
                               variant="ghost" 
                               size="sm"
                               className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                               onClick={handleReject}
                               title="Reject Candidate"
                            >
                               <UserX className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        {!isOfferState && !isRejectedState && !isHiredState && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full text-xs h-7"
                            onClick={handleShortlist}
                            disabled={isActionLocked || isShortlisting}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Offer
                          </Button>
                        )}
                        {!isFullServiceHandoffState && isShortlistedState && (
                          <Badge variant="default" className="bg-green-500 text-xs w-full justify-center h-7">
                            Shortlisted
                          </Badge>
                        )}
                        {isHiredState && (
                          <Badge className="text-xs w-full justify-center h-7 bg-emerald-600 hover:bg-emerald-600">
                            Hired
                          </Badge>
                        )}
                        {isRejectedState && (
                          <Badge variant="destructive" className="text-xs w-full justify-center h-7">
                            Rejected
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* AI Analysis Dialog */}
      {application.aiAnalysis && (
        <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Analysis: {application.candidateName}
              </DialogTitle>
            </DialogHeader>
            <AIAnalysisView analysis={application.aiAnalysis} />
          </DialogContent>
        </Dialog>
      )}

      <ApplicationReviewDialog
        applicationId={application.id}
        candidateName={application.candidateName}
        jobTitle={application.jobTitle}
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onReviewAdded={handleReviewAdded}
      />

      <Dialog open={showReviewPanel} onOpenChange={setShowReviewPanel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Reviews - {application.candidateName}</DialogTitle>
          </DialogHeader>
          <ApplicationReviewPanel
            applicationId={application.id}
            candidateName={application.candidateName}
            jobTitle={application.jobTitle}
            onReviewClick={() => {
              setShowReviewPanel(false);
              setShowReviewDialog(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <AIInterviewQuestionDialog
        open={showQuestionDialog}
        onOpenChange={setShowQuestionDialog}
        questions={generatedQuestions}
        candidateName={application.candidateName}
        jobTitle={application.jobTitle}
      />

      <AutoScheduleAIInterviewDialog
        application={application}
        open={showScheduleAIInterview}
        onOpenChange={setShowScheduleAIInterview}
      />
    </>
  );
}
