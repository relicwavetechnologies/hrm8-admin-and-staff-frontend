import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Application } from "@/shared/types/application";
import { applicationService } from "@/shared/lib/applicationService";
import { useToast } from "@/shared/hooks/use-toast";
import { Eye, Star, FileText, CheckCircle2, Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { AIMatchBadge } from "../AIMatchBadge";
import { CandidateAssessmentView } from "../../jobs/candidate-assessment/CandidateAssessmentView";
import { AIAnalysisView } from "./AIAnalysisView";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface ScreeningCandidateCardProps {
  application: Application;
  jobId: string;
  onUpdate: () => void;
  aiAnalysis?: any;
}

export function ScreeningCandidateCard({
  application,
  jobId: _jobId,
  onUpdate,
  aiAnalysis,
}: ScreeningCandidateCardProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [fullApplication, setFullApplication] = useState<Application | null>(null);

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const aiScore = application.aiMatchScore ?? application.score ?? 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  useEffect(() => {
    if (showDetails && !fullApplication) {
      // Load full application details when opening
      applicationService.getApplicationForAdmin(application.id).then((response) => {
        if (response.success && response.data) {
          const app = response.data.application as any;
          // Map to full Application type with all required fields
          // Extract candidate name with fallbacks
          let candidateName = 'Unknown Candidate';
          if (app.candidate?.firstName && app.candidate?.lastName) {
            candidateName = `${app.candidate.firstName} ${app.candidate.lastName}`;
          } else if (app.candidate?.firstName) {
            candidateName = app.candidate.firstName;
          } else if (app.candidate?.email) {
            candidateName = app.candidate.email.split('@')[0];
          } else if (application.candidateName && application.candidateName !== 'Unknown Candidate') {
            candidateName = application.candidateName;
          }

          const mappedApp: Application = {
            ...application, // Use existing mapped application as base
            // Override with any additional fields from full application
            candidateName,
            candidateEmail: app.candidate?.email || application.candidateEmail || '',
            candidatePhoto: app.candidate?.photo || application.candidatePhoto,
            activities: app.activities || application.activities || [],
            notes: app.notes || application.notes || [],
            interviews: app.interviews || application.interviews || [],
            scorecards: app.scorecards || application.scorecards,
            teamReviews: app.teamReviews || application.teamReviews,
          };
          setFullApplication(mappedApp);
        }
      });
    }
  }, [showDetails, application.id, fullApplication, application]);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (application.shortlisted) {
      // Already shortlisted, do nothing or unshortlist
      return;
    }

    setIsShortlisting(true);
    try {
      await applicationService.shortlistCandidate(application.id);
      toast({
        title: "Candidate Shortlisted",
        description: `${application.candidateName || "Candidate"} has been added to shortlist.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shortlist candidate.",
        variant: "destructive",
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={application.candidatePhoto} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(application.candidateName || undefined)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h4 className="font-semibold text-sm truncate">
                {application.candidateName || application.candidateEmail?.split('@')[0] || "Unknown Candidate"}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                Applied {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })}
              </p>
            </div>

            {/* AI Score Badge with Manual Score Comparison */}
            {aiScore > 0 || application.score ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {aiScore > 0 && (
                    <>
                      <AIMatchBadge score={aiScore} size="sm" />
                      <span className={`text-xs font-medium ${getScoreColor(aiScore)}`}>
                        AI: {aiScore}%
                      </span>
                    </>
                  )}
                  {application.score && application.score > 0 && (
                    <span className={`text-xs font-medium ${getScoreColor(application.score)}`}>
                      Manual: {application.score}%
                    </span>
                  )}
                  {aiScore > 0 && application.score && Math.abs(aiScore - application.score) > 20 && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                      Score Gap
                    </Badge>
                  )}
                  {aiAnalysis?.recommendation && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${aiAnalysis.recommendation === 'strong_hire' || aiAnalysis.recommendation === 'hire'
                        ? 'border-green-500 text-green-700 dark:text-green-400'
                        : aiAnalysis.recommendation === 'maybe'
                          ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                          : 'border-red-500 text-red-700 dark:text-red-400'
                        }`}
                    >
                      {aiAnalysis.recommendation === 'strong_hire' ? 'Strong Hire' :
                        aiAnalysis.recommendation === 'hire' ? 'Hire' :
                          aiAnalysis.recommendation === 'maybe' ? 'Maybe' :
                            aiAnalysis.recommendation === 'no_hire' ? 'No Hire' :
                              'Strong No Hire'}
                    </Badge>
                  )}
                </div>
                {/* AI Review/Justification */}
                {aiAnalysis?.justification && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground cursor-help group">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                          <p className="line-clamp-2 leading-relaxed">
                            {aiAnalysis.justification.length > 150
                              ? `${aiAnalysis.justification.substring(0, 150)}...`
                              : aiAnalysis.justification}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md p-3">
                        <p className="text-sm leading-relaxed">{aiAnalysis.justification}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                Not Scored
              </Badge>
            )}

            {/* Screening Status Indicator */}
            <div className="flex items-center gap-2">
              {application.score && application.score > 0 ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Screened
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                  Pending Review
                </Badge>
              )}
              {application.aiMatchScore && !application.score && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                  AI Scored
                </Badge>
              )}
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {application.resumeUrl && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>Resume</span>
                </div>
              )}
              {application.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{application.rating}/5</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Review
                </Button>
                {aiAnalysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowAIAnalysis(true)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Analysis
                  </Button>
                )}
              </div>
              {!application.shortlisted && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleShortlist}
                  disabled={isShortlisting}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Shortlist
                </Button>
              )}
              {application.shortlisted && (
                <Badge variant="default" className="bg-green-500 text-xs w-full justify-center">
                  Shortlisted
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Candidate Details Drawer */}
      {showDetails && fullApplication && (
        <CandidateAssessmentView
          application={fullApplication as any}
          jobTitle={application.jobTitle}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}

      {/* AI Analysis Dialog */}
      {aiAnalysis && (
        <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Analysis: {application.candidateName}
              </DialogTitle>
            </DialogHeader>
            <AIAnalysisView analysis={aiAnalysis} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

