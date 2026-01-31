import { Application } from "@/shared/types/application";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Mail, Calendar, FileText,
  Star, Download, Video, Send,
  Sparkles
} from "lucide-react";
import { AIAnalysisView } from "./screening/AIAnalysisView";
import { ParsedResumeView } from "./parsing/ParsedResumeView";
import { CoverLetterView } from "./parsing/CoverLetterView";
import { QuestionnaireResponseView } from "./parsing/QuestionnaireResponseView";
import { ProfileCompletenessIndicator } from "./parsing/ProfileCompletenessIndicator";
import { QuickScoringWidget } from "./shortlisting/QuickScoringWidget";
import { RankingWidget } from "./shortlisting/RankingWidget";
import { ShortlistButton } from "./shortlisting/ShortlistButton";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ApplicationStage } from "@/shared/types/application";
import { updateApplicationStatus } from "@/shared/lib/mockApplicationStorage";
import { applicationService } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { Textarea } from "@/shared/components/ui/textarea";
// import { Input } from "@/shared/components/ui/input"; // Unused
import { Label } from "@/shared/components/ui/label";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { InterviewScheduler } from "./placeholders/InterviewScheduler";
import { OfferForm } from "./placeholders/OfferForm";
import { getTemplateById } from "@/shared/lib/mockTemplateStorage";
import { offerService } from "@/shared/lib/api/offerService";
import { jobService } from "@/shared/lib/api/jobService";
import { Job } from "@/shared/types/job";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";
import { ApplicationEmailHistory } from "./placeholders/ApplicationEmailHistory";

interface ApplicationDetailPanelProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function ApplicationDetailPanel({ application, open, onOpenChange, onRefresh }: ApplicationDetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [editingScore, setEditingScore] = useState<string>("");
  const [editingRank, setEditingRank] = useState<string>("");
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [isUpdatingRank, setIsUpdatingRank] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // Suppress unused warnings
  void isUpdatingScore;
  void isUpdatingRank;
  void isShortlisting;
  void isLoadingJob;

  // Fetch job data when offer dialog opens
  useEffect(() => {
    const fetchJob = async () => {
      if (isOfferDialogOpen && application?.jobId && !job) {
        setIsLoadingJob(true);
        try {
          const response = await jobService.getJobById(application.jobId);
          if (response.success && response.data) {
            const mappedJob = mapBackendJobToFrontend(response.data);
            setJob(mappedJob);
          }
        } catch (error) {
          console.error('Failed to fetch job:', error);
        } finally {
          setIsLoadingJob(false);
        }
      }
    };

    fetchJob();
  }, [isOfferDialogOpen, application?.jobId]);

  // Reset job when dialog closes
  useEffect(() => {
    if (!isOfferDialogOpen) {
      setJob(null);
    }
  }, [isOfferDialogOpen]);

  // Update editing values when application changes
  useEffect(() => {
    if (application) {
      setEditingScore(application.score?.toString() || "");
      setEditingRank(application.rank?.toString() || "");
    }
  }, [application]);

  if (!application) return null;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleStageChange = async (newStage: ApplicationStage) => {
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
      const response = await applicationService.updateStage(application.id, backendStage);

      if (response.success) {
        // Also update local mock storage for fallback
        const statusMap: Record<ApplicationStage, Application['status']> = {
          "New Application": "applied",
          "Resume Review": "screening",
          "Phone Screen": "screening",
          "Technical Interview": "interview",
          "Manager Interview": "interview",
          "Final Round": "interview",
          "Reference Check": "interview",
          "Offer Extended": "offer",
          "Offer Accepted": "hired",
          "Rejected": "rejected",
          "Withdrawn": "withdrawn",
        };
        updateApplicationStatus(application.id, statusMap[newStage], newStage);
        toast.success("Application stage updated");
        onRefresh();
      } else {
        toast.error("Failed to update stage", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error("Failed to update stage");
    }
  };

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleScoreUpdate = async () => {
    const score = parseFloat(editingScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    setIsUpdatingScore(true);
    try {
      const response = await applicationService.updateScore(application.id, score);
      if (response.success) {
        toast.success("Score updated");
        onRefresh();
      } else {
        toast.error("Failed to update score", {
          description: response.error || "Please try again"
        });
        setEditingScore(application.score?.toString() || "");
      }
    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error("Failed to update score");
      setEditingScore(application.score?.toString() || "");
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const handleRankUpdate = async () => {
    const rank = parseInt(editingRank);
    if (isNaN(rank) || rank < 1) {
      toast.error("Rank must be at least 1");
      return;
    }

    setIsUpdatingRank(true);
    try {
      const response = await applicationService.updateRank(application.id, rank);
      if (response.success) {
        toast.success("Rank updated");
        onRefresh();
      } else {
        toast.error("Failed to update rank", {
          description: response.error || "Please try again"
        });
        setEditingRank(application.rank?.toString() || "");
      }
    } catch (error) {
      console.error('Failed to update rank:', error);
      toast.error("Failed to update rank");
      setEditingRank(application.rank?.toString() || "");
    } finally {
      setIsUpdatingRank(false);
    }
  };

  const handleShortlist = async () => {
    setIsShortlisting(true);
    try {
      const response = application.shortlisted
        ? await applicationService.unshortlistCandidate(application.id)
        : await applicationService.shortlistCandidate(application.id);

      if (response.success) {
        toast.success(application.shortlisted ? "Candidate unshortlisted" : "Candidate shortlisted");
        onRefresh();
      } else {
        toast.error("Failed to update shortlist status", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update shortlist:', error);
      toast.error("Failed to update shortlist status");
    } finally {
      setIsShortlisting(false);
    }
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // Suppress unused warnings
  void handleScoreUpdate;
  void handleRankUpdate;
  void handleShortlist;

  const handleNotesUpdate = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await applicationService.updateNotes(application.id, newNote);
      if (response.success) {
        toast.success("Note added");
        setNewNote("");
        onRefresh();
      } else {
        toast.error("Failed to add note", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error("Failed to add note");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Application Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Candidate Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.candidatePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(application.candidateName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{application.candidateName}</h2>
                  <p className="text-muted-foreground">{application.jobTitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{application.stage}</Badge>
                    {application.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < application.rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ProfileCompletenessIndicator application={application} showProgress={false} showDetails={true} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsInterviewDialogOpen(true)}>
              <Video className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsOfferDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send Offer
            </Button>
          </div>

          {/* Shortlisting & Scoring Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shortlisting & Scoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Shortlist Button */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Shortlist Status</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {application.shortlisted ? "Candidate is shortlisted" : "Not shortlisted"}
                  </p>
                </div>
                <ShortlistButton
                  applicationId={application.id}
                  shortlisted={application.shortlisted}
                  onShortlistChange={(_shortlisted) => {
                    onRefresh();
                  }}
                  variant="button"
                  size="sm"
                  showLabel={true}
                />
              </div>

              <Separator />

              {/* Score Input */}
              <div className="space-y-2">
                <Label htmlFor="score">Fit Score (0-100)</Label>
                <QuickScoringWidget
                  applicationId={application.id}
                  score={application.score}
                  onScoreUpdate={(newScore) => {
                    setEditingScore(newScore.toString());
                    onRefresh();
                  }}
                  variant="card"
                  showSlider={true}
                />
              </div>

              {/* Rank Input */}
              <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <RankingWidget
                  applicationId={application.id}
                  rank={application.rank}
                  onRankUpdate={(newRank) => {
                    setEditingRank(newRank.toString());
                    onRefresh();
                  }}
                  variant="card"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stage Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Move to Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={application.stage} onValueChange={handleStageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Application">New Application</SelectItem>
                  <SelectItem value="Resume Review">Resume Review</SelectItem>
                  <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                  <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                  <SelectItem value="Manager Interview">Manager Interview</SelectItem>
                  <SelectItem value="Final Round">Final Round</SelectItem>
                  <SelectItem value="Reference Check">Reference Check</SelectItem>
                  <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                  <SelectItem value="Offer Accepted">Offer Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {application.parsedResume && (
                <TabsTrigger value="resume">Resume</TabsTrigger>
              )}
              {application.coverLetterUrl && (
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
              )}
              {application.questionnaireData && (
                <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
              )}
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Emails
              </TabsTrigger>
              {application.aiAnalysis && (
                <TabsTrigger value="ai-analysis" className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Analysis
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{application.candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Applied {formatDistanceToNow(application.appliedDate, { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>

              {application.resumeUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Resume.pdf
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {application.customAnswers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Application Answers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {application.customAnswers.map((answer) => (
                      <div key={answer.questionId}>
                        <p className="text-sm font-medium mb-1">{answer.question}</p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resume" className="mt-4">
              {application.parsedResume ? (
                <ParsedResumeView
                  parsedResume={application.parsedResume}
                  resumeUrl={application.resumeUrl}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Resume parsing not available</p>
                  {application.resumeUrl && (
                    <p className="text-xs mt-2">Resume file is available but not yet parsed</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-4">
              <CoverLetterView application={application} />
            </TabsContent>

            <TabsContent value="questionnaire" className="mt-4">
              {application.questionnaireData ? (
                <QuestionnaireResponseView questionnaireData={application.questionnaireData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No questionnaire responses available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3 mt-4">
              {application.activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 bg-primary rounded-full" />
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                      {activity.userName && ` by ${activity.userName}`}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-4">
              {application.aiAnalysis ? (
                <AIAnalysisView analysis={application.aiAnalysis} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI analysis available</p>
                  <p className="text-sm mt-2">Run AI screening to generate analysis</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this candidate..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleNotesUpdate} size="sm">
                  Add Note
                </Button>
              </div>

              <Separator />

              {application.notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">{note.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="emails" className="mt-4">
              <ApplicationEmailHistory applicationId={application.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Interview Dialog */}
        <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <InterviewScheduler
              candidateName={application.candidateName}
              jobTitle={application.jobTitle}
              onSubmit={(data) => {
                const template = data.templateId ? getTemplateById(data.templateId) : null;
                setIsInterviewDialogOpen(false);
                toast.success(
                  template
                    ? `Interview scheduled with ${template.name} template`
                    : "Interview scheduled successfully"
                );
              }}
              onCancel={() => setIsInterviewDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Offer Dialog */}
        <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Offer Letter</DialogTitle>
            </DialogHeader>
            <OfferForm
              candidateName={application.candidateName}
              jobTitle={application.jobTitle}
              job={job}
              onSubmit={async (data) => {
                try {
                  // Create offer
                  const createResponse = await offerService.createOffer(application.id, {
                    applicationId: application.id,
                    offerType: data.offerType,
                    salary: data.salary,
                    salaryCurrency: data.salaryCurrency,
                    salaryPeriod: data.salaryPeriod,
                    startDate: data.startDate,
                    workLocation: data.workLocation,
                    workArrangement: data.workArrangement,
                    probationPeriod: data.probationPeriod,
                    vacationDays: data.vacationDays,
                    bonusStructure: data.bonusStructure,
                    equityOptions: data.equityOptions,
                    benefits: data.benefits ? data.benefits.split(',').map((b: string) => b.trim()) : [],
                    customMessage: data.customMessage,
                    expiryDate: data.expiryDate,
                    templateId: data.templateId,
                  });

                  if (createResponse.success && createResponse.data) {
                    // Send offer immediately
                    const sendResponse = await offerService.sendOffer(createResponse.data.id);
                    if (sendResponse.success) {
                      toast.success("Offer created and sent successfully");
                      setIsOfferDialogOpen(false);
                      onRefresh();
                    } else {
                      toast.error("Offer created but failed to send", {
                        description: sendResponse.error
                      });
                    }
                  } else {
                    toast.error("Failed to create offer", {
                      description: createResponse.error
                    });
                  }
                } catch (error) {
                  console.error('Failed to create offer:', error);
                  toast.error("Failed to create offer");
                }
              }}
              onCancel={() => setIsOfferDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
