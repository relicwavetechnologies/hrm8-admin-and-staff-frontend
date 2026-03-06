import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Application } from "@/shared/types/application";
import { applicationService } from "@/shared/lib/applicationService";
import { useToast } from "@/shared/hooks/use-toast";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  Filter,
  Eye,
  Star,
  Calendar,
  Phone as _Phone,
  ExternalLink,
  CheckSquare,
  Square,
  User as _User,
  Briefcase,
  GraduationCap as _GraduationCap,
  Award,
  MessageSquare,
  FileCheck,
  Users,
  CheckCircle,
  X as _X,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Progress } from "@/shared/components/ui/progress";

import { questionService } from "@/shared/lib/api/questionService";
import type { ApplicationFormConfig, ApplicationQuestion } from "@/shared/types/applicationForm";
import { CandidateAssessmentView } from "../../jobs/candidate-assessment/CandidateAssessmentView";

interface ManualScreeningPanelProps {
  jobId: string;
  jobTitle: string;
  jobRequirements: string[];
  jobDescription?: string;
  applications: Application[];
  onRefresh: () => void;
}

interface ScreeningCriteria {
  id: string;
  requirement: string;
  checked: boolean;
  notes: string;
  weight: number;
}

type ViewMode = "list" | "grid" | "detail";
type FilterStatus = "all" | "pending" | "screened" | "approved" | "rejected";

export function ManualScreeningPanel({
  jobId,
  jobTitle,
  jobRequirements,
  jobDescription: _jobDescription,
  applications,
  onRefresh,
}: ManualScreeningPanelProps) {
  const { toast } = useToast();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    applications.length > 0 ? applications[0]?.id || null : null
  );
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<Set<string>>(new Set());
  const [_viewMode, _setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [criteria, setCriteria] = useState<ScreeningCriteria[]>(() =>
    jobRequirements.map((req, index) => ({
      id: `criteria-${index}`,
      requirement: req,
      checked: false,
      notes: "",
      weight: 1,
    }))
  );
  const [manualScore, setManualScore] = useState<number | undefined>(undefined);
  const [screeningNotes, setScreeningNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fullApplication, setFullApplication] = useState<Application | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [_applicationForm, setApplicationForm] = useState<ApplicationFormConfig | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Map<string, ApplicationQuestion>>(new Map());
  const [screeningQueue, setScreeningQueue] = useState<string[]>([]); // Queue of application IDs to review

  const selectedApplication = useMemo(
    () => applications.find((app) => app.id === selectedApplicationId),
    [applications, selectedApplicationId]
  );

  // Initialize screening queue with unscreened candidates
  useEffect(() => {
    const unscreened = applications
      .filter(app => !app.score || app.score === 0)
      .map(app => app.id);
    setScreeningQueue(unscreened);
  }, [applications]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => {
        switch (filterStatus) {
          case "pending":
            return !app.score || app.score === 0;
          case "screened":
            return app.score && app.score > 0;
          case "approved":
            return app.stage === "Phone Screen" || app.stage === "Technical Interview";
          case "rejected":
            return app.stage === "Rejected";
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const name = app.candidateName?.toLowerCase() || "";
        const email = app.candidateEmail?.toLowerCase() || "";
        const jobTitle = app.jobTitle?.toLowerCase() || "";
        return name.includes(query) || email.includes(query) || jobTitle.includes(query);
      });
    }

    return filtered;
  }, [applications, filterStatus, searchQuery]);

  // Load application form questions when component mounts
  useEffect(() => {
    const loadApplicationForm = async () => {
      try {
        const form = await questionService.getApplicationForm(jobId);
        if (form) {
          setApplicationForm(form);
          // Create a map of questionId -> question for quick lookup
          const map = new Map<string, ApplicationQuestion>();
          form.questions?.forEach((q) => {
            if (q.id) {
              map.set(q.id, q);
            }
          });
          setQuestionsMap(map);
        }
      } catch (error) {
        console.error("Failed to load application form:", error);
      }
    };
    loadApplicationForm();
  }, [jobId]);

  // Load full application details when selected
  useEffect(() => {
    if (selectedApplication) {
      resetScreeningForm(selectedApplication);
      // Load full details
      applicationService.getApplicationForAdmin(selectedApplication.id).then((response) => {
        if (response.success && response.data) {
          const app = response.data.application as any;
          let candidateName = 'Unknown Candidate';
          if (app.candidate?.firstName && app.candidate?.lastName) {
            candidateName = `${app.candidate.firstName} ${app.candidate.lastName}`;
          } else if (app.candidate?.firstName) {
            candidateName = app.candidate.firstName;
          } else if (app.candidate?.email) {
            candidateName = app.candidate.email.split('@')[0];
          }

          const mappedApp: Application = {
            ...selectedApplication,
            candidateName,
            candidateEmail: app.candidate?.email || selectedApplication.candidateEmail || '',
            candidatePhoto: app.candidate?.photo || selectedApplication.candidatePhoto,
            activities: app.activities || selectedApplication.activities || [],
            notes: app.notes || selectedApplication.notes || [],
            interviews: app.interviews || selectedApplication.interviews || [],
            scorecards: app.scorecards || selectedApplication.scorecards,
            teamReviews: app.teamReviews || selectedApplication.teamReviews,
            aiAnalysis: app.aiAnalysis || selectedApplication.aiAnalysis,
            customAnswers: app.customAnswers || selectedApplication.customAnswers || [],
            resumeUrl: app.resumeUrl || selectedApplication.resumeUrl,
            coverLetterUrl: app.coverLetterUrl || selectedApplication.coverLetterUrl,
            portfolioUrl: app.portfolioUrl || selectedApplication.portfolioUrl,
            linkedInUrl: app.linkedInUrl || selectedApplication.linkedInUrl,
            recruiterNotes: app.recruiterNotes || selectedApplication.recruiterNotes,
          };
          setFullApplication(mappedApp);
        }
      });
    }
  }, [selectedApplicationId]);

  const resetScreeningForm = (app: Application) => {
    setCriteria(
      jobRequirements.map((req, index) => ({
        id: `criteria-${index}`,
        requirement: req,
        checked: false,
        notes: "",
        weight: 1,
      }))
    );
    setManualScore(app.score);
    setScreeningNotes(app.recruiterNotes || "");
  };

  const handleCriteriaChange = (id: string, checked: boolean) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked } : c))
    );
  };

  const handleCriteriaNotesChange = (id: string, notes: string) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes } : c))
    );
  };

  const calculateScoreFromCriteria = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const checkedWeight = criteria
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.weight, 0);
    return totalWeight > 0 ? Math.round((checkedWeight / totalWeight) * 100) : 0;
  };

  const handleSaveScreening = async () => {
    if (!selectedApplication) return;

    setIsSaving(true);
    try {
      const finalScore = manualScore ?? calculateScoreFromCriteria();

      const notesWithCriteria = [
        screeningNotes,
        ...criteria
          .filter((c) => c.notes)
          .map((c) => `${c.requirement}: ${c.notes}`),
      ]
        .filter(Boolean)
        .join("\n\n");

      // Build update data - only include defined values
      const updateData: {
        score?: number;
        notes?: string;
        completed: boolean;
        status: 'PENDING' | 'PASSED' | 'FAILED';
      } = {
        completed: true,
        status: finalScore >= 60 ? 'PASSED' : finalScore > 0 ? 'FAILED' : 'PENDING',
      };

      // Only add score if it's greater than 0
      if (finalScore > 0) {
        updateData.score = finalScore;
      }

      // Only add notes if they exist
      if (notesWithCriteria && notesWithCriteria.trim()) {
        updateData.notes = notesWithCriteria;
      }

      console.log('💾 Saving manual screening:', {
        applicationId: selectedApplication.id,
        candidateName: selectedApplication.candidateName,
        updateData,
      });

      await applicationService.updateManualScreening(selectedApplication.id, updateData);

      toast({
        title: "Screening Saved",
        description: `Screening results saved for ${selectedApplication.candidateName}.`,
      });

      onRefresh();
    } catch (error) {
      console.error("❌ Save screening error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save screening results.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject" | "save") => {
    const idsToProcess = selectedApplicationIds.size > 0
      ? Array.from(selectedApplicationIds)
      : [selectedApplicationId].filter(Boolean) as string[];

    if (idsToProcess.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one candidate.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      for (const appId of idsToProcess) {
        const app = applications.find(a => a.id === appId);
        if (!app) continue;

        if (action === "approve") {
          await applicationService.updateStage(appId, "PHONE_SCREEN");
        } else if (action === "reject") {
          await applicationService.updateStage(appId, "REJECTED");
        }
      }

      toast({
        title: "Bulk Action Complete",
        description: `Processed ${idsToProcess.length} candidate(s).`,
      });

      setSelectedApplicationIds(new Set());
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk action.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSelect = (applicationId: string) => {
    const newSet = new Set(selectedApplicationIds);
    if (newSet.has(applicationId)) {
      newSet.delete(applicationId);
    } else {
      newSet.add(applicationId);
    }
    setSelectedApplicationIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedApplicationIds.size === filteredApplications.length) {
      setSelectedApplicationIds(new Set());
    } else {
      setSelectedApplicationIds(new Set(filteredApplications.map(app => app.id)));
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    setIsSaving(true);
    try {
      const finalScore = manualScore ?? calculateScoreFromCriteria();
      const notesWithCriteria = [
        screeningNotes,
        ...criteria
          .filter((c) => c.notes)
          .map((c) => `${c.requirement}: ${c.notes}`),
      ]
        .filter(Boolean)
        .join("\n\n");

      // Update manual screening as PASSED and move to next stage
      await applicationService.updateManualScreening(selectedApplication.id, {
        score: finalScore > 0 ? finalScore : 60, // Default to 60 if no score
        status: 'PASSED',
        notes: notesWithCriteria || undefined,
        completed: true,
      });

      // Move to next stage
      await applicationService.updateStage(selectedApplication.id, "PHONE_SCREEN");

      toast({
        title: "Candidate Approved",
        description: `${selectedApplication.candidateName} moved to next stage.`,
      });
      onRefresh();
    } catch (error) {
      console.error("Approve error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve candidate.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    setIsSaving(true);
    try {
      const finalScore = manualScore ?? calculateScoreFromCriteria();
      const notesWithCriteria = [
        screeningNotes,
        ...criteria
          .filter((c) => c.notes)
          .map((c) => `${c.requirement}: ${c.notes}`),
      ]
        .filter(Boolean)
        .join("\n\n");

      // Update manual screening as FAILED and reject
      await applicationService.updateManualScreening(selectedApplication.id, {
        score: finalScore > 0 ? finalScore : 0,
        status: 'FAILED',
        notes: notesWithCriteria || undefined,
        completed: true,
      });

      // Move to rejected stage
      await applicationService.updateStage(selectedApplication.id, "REJECTED");

      toast({
        title: "Candidate Rejected",
        description: `${selectedApplication.candidateName} has been rejected.`,
      });
      onRefresh();
    } catch (error) {
      console.error("Reject error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject candidate.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => !app.score || app.score === 0).length;
    const screened = applications.filter(app => app.score && app.score > 0).length;
    const approved = applications.filter(app =>
      app.stage === "Phone Screen" || app.stage === "Technical Interview"
    ).length;
    const rejected = applications.filter(app => app.stage === "Rejected").length;

    // Calculate average scores
    const scores = applications.filter(app => app.score && app.score > 0).map(app => app.score ?? 0);
    const aiScores = applications.filter(app => app.aiMatchScore && app.aiMatchScore > 0).map(app => app.aiMatchScore ?? 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const averageAIScore = aiScores.length > 0 ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length) : 0;

    // Stage breakdown
    const stageBreakdown = {
      "New Application": applications.filter(app => app.stage === "New Application").length,
      "Resume Review": applications.filter(app => app.stage === "Resume Review").length,
      "Phone Screen": applications.filter(app => app.stage === "Phone Screen").length,
      "Technical Interview": applications.filter(app => app.stage === "Technical Interview").length,
      "Manager Interview": applications.filter(app => app.stage === "Manager Interview").length,
      "Offer Extended": applications.filter(app => app.stage === "Offer Extended").length,
      "Offer Accepted": applications.filter(app => app.stage === "Offer Accepted").length,
      "Rejected": applications.filter(app => app.stage === "Rejected").length,
    };

    return { total, pending, screened, approved, rejected, stageBreakdown, averageScore, averageAIScore };
  }, [applications]);

  const checkedCount = criteria.filter((c) => c.checked).length;
  const totalCriteria = criteria.length;
  const calculatedScore = calculateScoreFromCriteria();

  // Navigation functions
  const handleNextCandidate = () => {
    if (!selectedApplicationId) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplicationId);
    if (currentIndex < applications.length - 1) {
      setSelectedApplicationId(applications[currentIndex + 1].id);
    }
  };

  const handlePreviousCandidate = () => {
    if (!selectedApplicationId) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplicationId);
    if (currentIndex > 0) {
      setSelectedApplicationId(applications[currentIndex - 1].id);
    }
  };

  const handleNextInQueue = () => {
    if (screeningQueue.length === 0) return;
    const currentIndex = screeningQueue.findIndex(id => id === selectedApplicationId);
    const nextIndex = currentIndex >= 0 && currentIndex < screeningQueue.length - 1
      ? currentIndex + 1
      : 0;
    setSelectedApplicationId(screeningQueue[nextIndex]);
  };

  // Quick Actions
  const handleQuickApprove = async () => {
    if (!selectedApplication) return;
    await handleApprove();
    handleNextInQueue();
  };

  const handleQuickReject = async () => {
    if (!selectedApplication) return;
    await handleReject();
    handleNextInQueue();
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No applications found for this job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {screeningQueue.length} in queue
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Screened</p>
                <p className="text-2xl font-bold text-blue-600">{stats.screened}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? Math.round((stats.screened / stats.total) * 100) : 0}% completion
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.screened > 0 ? Math.round((stats.approved / stats.screened) * 100) : 0}% approval rate
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screening Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Screening Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Manual Score</span>
                <span className="text-lg font-bold text-purple-600">
                  {stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average AI Score</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats.averageAIScore > 0 ? `${stats.averageAIScore}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Screening Progress</span>
                <span className="text-lg font-bold">
                  {stats.total > 0 ? Math.round((stats.screened / stats.total) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats.total > 0 ? (stats.screened / stats.total) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Screening Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Review</span>
                <span className="text-lg font-bold text-amber-600">
                  {screeningQueue.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.screened}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="text-lg font-bold">
                  {stats.screened > 0 ? Math.round((stats.approved / stats.screened) * 100) : 0}%
                </span>
              </div>
              {screeningQueue.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNextInQueue}
                >
                  Start Screening Queue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Candidates by Stage
          </CardTitle>
          <CardDescription>
            Overview of candidates in each stage of the hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(stats.stageBreakdown).map(([stage, count]) => (
              <div key={stage} className="text-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="screened">Screened</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedApplicationIds.size === filteredApplications.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              {selectedApplicationIds.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleBulkAction("approve")}
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve ({selectedApplicationIds.size})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction("reject")}
                    disabled={isSaving}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject ({selectedApplicationIds.size})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Candidates ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredApplications.map((app) => (
                    <Card
                      key={app.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedApplicationId === app.id
                        ? "ring-2 ring-primary"
                        : ""
                        } ${selectedApplicationIds.has(app.id) ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedApplicationId(app.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedApplicationIds.has(app.id)}
                            onCheckedChange={(_checked) => {
                              handleToggleSelect(app.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={app.candidatePhoto} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(app.candidateName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {app.candidateName || "Unknown"}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.candidateEmail}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {app.score !== undefined && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(app.score)}%
                                </Badge>
                              )}
                              {app.resumeUrl && (
                                <FileText className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Screening Detail View */}
        {selectedApplication && (
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedApplication.candidatePhoto} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(selectedApplication.candidateName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedApplication.candidateName || "Unknown Candidate"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {selectedApplication.candidateEmail}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{selectedApplication.stage}</Badge>
                        {selectedApplication.score !== undefined && (
                          <Badge variant="secondary">
                            Score: {Math.round(selectedApplication.score)}%
                          </Badge>
                        )}
                        {selectedApplication.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{selectedApplication.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedApplication.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResumeUrl(selectedApplication.resumeUrl || null);
                          setShowResumeDialog(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Full Profile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Applied:</span>
                    <span>{formatDistanceToNow(new Date(selectedApplication.appliedDate), { addSuffix: true })}</span>
                  </div>
                  {selectedApplication.resumeUrl && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Resume:</span>
                      <span className="text-green-600">Available</span>
                    </div>
                  )}
                  {selectedApplication.portfolioUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Portfolio:</span>
                      <a href={selectedApplication.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View
                      </a>
                    </div>
                  )}
                  {selectedApplication.linkedInUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">LinkedIn:</span>
                      <a href={selectedApplication.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Answers */}
            {fullApplication && fullApplication.customAnswers && fullApplication.customAnswers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Application Answers ({fullApplication.customAnswers.length})
                  </CardTitle>
                  <CardDescription>
                    Questions and answers from the application form
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-6">
                      {fullApplication.customAnswers.map((answer, index) => {
                        // Get the actual question text from the application form
                        const question = questionsMap.get(answer.questionId);
                        const questionText = question?.label || answer.question || `Question ${index + 1}`;

                        return (
                          <div key={answer.questionId || index} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                                Q{index + 1}
                              </Badge>
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-sm font-semibold text-foreground">
                                    {questionText}
                                  </Label>
                                  {question?.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {question.description}
                                    </p>
                                  )}
                                </div>
                                <div className="bg-muted/50 rounded-md p-3 border-l-2 border-primary">
                                  <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {Array.isArray(answer.answer)
                                      ? answer.answer.join(", ")
                                      : answer.answer || (
                                        <span className="text-muted-foreground italic">No answer provided</span>
                                      )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {index < fullApplication.customAnswers.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Screening Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Screening Criteria</CardTitle>
                <CardDescription>
                  Based on job requirements: {checkedCount} of {totalCriteria} met
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {criteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={criterion.id}
                          checked={criterion.checked}
                          onCheckedChange={(checked) =>
                            handleCriteriaChange(criterion.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={criterion.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {criterion.requirement}
                          </Label>
                          <Textarea
                            placeholder="Add notes for this criterion..."
                            value={criterion.notes}
                            onChange={(e) =>
                              handleCriteriaNotesChange(criterion.id, e.target.value)
                            }
                            className="text-xs min-h-[60px]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* AI vs Manual Score Comparison */}
            {selectedApplication && (selectedApplication.aiMatchScore || selectedApplication.score) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Score Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">AI Score</Label>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedApplication.aiMatchScore ?? 'N/A'}
                        {selectedApplication.aiMatchScore && '%'}
                      </div>
                      {selectedApplication.aiMatchScore && (
                        <Progress value={selectedApplication.aiMatchScore} className="h-2" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Manual Score</Label>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedApplication.score ?? manualScore ?? 'N/A'}
                        {(selectedApplication.score ?? manualScore) && '%'}
                      </div>
                      {(selectedApplication.score ?? manualScore) && (
                        <Progress value={selectedApplication.score ?? manualScore ?? 0} className="h-2" />
                      )}
                    </div>
                  </div>
                  {selectedApplication.aiMatchScore && (selectedApplication.score ?? manualScore) && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">Score Difference</div>
                      <div className={`text-lg font-bold ${Math.abs((selectedApplication.aiMatchScore ?? 0) - (selectedApplication.score ?? manualScore ?? 0)) > 20
                        ? 'text-amber-600'
                        : 'text-green-600'
                        }`}>
                        {Math.abs((selectedApplication.aiMatchScore ?? 0) - (selectedApplication.score ?? manualScore ?? 0))} points
                      </div>
                      {Math.abs((selectedApplication.aiMatchScore ?? 0) - (selectedApplication.score ?? manualScore ?? 0)) > 20 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Large discrepancy - review recommended
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Scoring and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Calculated Score (from criteria)</Label>
                    <div className="text-3xl font-bold text-primary">
                      {calculatedScore}%
                    </div>
                    <Progress value={calculatedScore} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-score">Manual Score (0-100)</Label>
                    <Input
                      id="manual-score"
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore ?? ""}
                      onChange={(e) =>
                        setManualScore(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="Enter manual score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screening-notes">Screening Notes</Label>
                    <Textarea
                      id="screening-notes"
                      placeholder="Add overall screening notes and feedback..."
                      value={screeningNotes}
                      onChange={(e) => setScreeningNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleQuickApprove}
                      disabled={isSaving}
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Quick Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleQuickReject}
                      disabled={isSaving}
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Quick Reject
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handlePreviousCandidate}
                      disabled={!selectedApplicationId || applications.findIndex(app => app.id === selectedApplicationId) === 0}
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleNextCandidate}
                      disabled={!selectedApplicationId || applications.findIndex(app => app.id === selectedApplicationId) === applications.length - 1}
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {screeningQueue.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleNextInQueue}
                      size="sm"
                    >
                      Next in Queue ({screeningQueue.length} remaining)
                    </Button>
                  )}

                  <Separator />

                  <Button
                    className="w-full"
                    onClick={handleSaveScreening}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Screening
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve & Move Forward
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleReject}
                    disabled={isSaving}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Candidate
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedApplication && (
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Select a candidate to start screening</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Resume Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Resume - {selectedApplication?.candidateName}</DialogTitle>
            <DialogDescription>
              {selectedApplication?.candidateEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {resumeUrl ? (
              <iframe
                src={resumeUrl}
                className="w-full h-[600px] border rounded"
                title="Resume"
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">No resume available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Details Drawer */}
      {showDetails && fullApplication && (
        <CandidateAssessmentView
          application={fullApplication as any}
          jobTitle={jobTitle}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}
    </div>
  );
}
