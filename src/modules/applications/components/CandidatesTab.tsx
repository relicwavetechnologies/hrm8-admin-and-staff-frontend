// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { TablePagination } from "@/shared/components/tables/TablePagination";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { applicationService } from "@/shared/lib/applicationService";
import { useToast } from "@/shared/hooks/use-toast";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { AIScreeningAnalysisDrawer } from "@/modules/applications/components/screening/AIScreeningAnalysisDrawer";
import type { Application } from "@/shared/types/application";
import { Eye, Save, TrendingUp, BarChart3, Brain, Sparkles, RotateCcw, Loader2 } from "lucide-react";

interface RoundLike {
  id: string;
  name: string;
}

interface CandidatesTabProps {
  applications: Application[];
  jobId: string;
  jobTitle: string;
  rounds?: RoundLike[];
  onRefresh?: () => void;
}

const STAGE_OPTIONS = [
  "New Application",
  "Resume Review",
  "Phone Screen",
  "Technical Interview",
  "Manager Interview",
  "Final Round",
  "Reference Check",
  "Offer Extended",
  "Offer Accepted",
  "Rejected",
  "Withdrawn",
];

const formatStageLabel = (value: string) => {
  if (!value) return "Unknown";
  if (!value.includes("_")) return value;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
};

const normalizeScore = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.min(100, Math.round(value)));
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  }
  return 0;
};

const scoreBadgeClass = (score: number) => {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};

export function CandidatesTab({ applications, jobId, jobTitle, rounds = [], onRefresh }: CandidatesTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [stageDrafts, setStageDrafts] = useState<Record<string, string>>({});
  const [savingScore, setSavingScore] = useState<Record<string, boolean>>({});
  const [savingStage, setSavingStage] = useState<Record<string, boolean>>({});
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [openAssessment, setOpenAssessment] = useState(false);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [analysisDrawerCandidate, setAnalysisDrawerCandidate] = useState<Application | null>(null);
  const [analysisDrawerData, setAnalysisDrawerData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const isRoundMode = rounds.length > 0;

  useEffect(() => {
    const initialScores: Record<string, string> = {};
    const initialStages: Record<string, string> = {};

    applications.forEach((app) => {
      initialScores[app.id] = String(normalizeScore(app.score ?? app.aiMatchScore ?? app.aiAnalysis?.overallScore));
      initialStages[app.id] = isRoundMode ? app.roundId || "" : app.stage || "New Application";
    });

    setScoreDrafts(initialScores);
    setStageDrafts(initialStages);
  }, [applications, isRoundMode]);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const scoreA = normalizeScore(a.aiAnalysis?.overallScore ?? a.aiMatchScore ?? a.score);
      const scoreB = normalizeScore(b.aiAnalysis?.overallScore ?? b.aiMatchScore ?? b.score);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
  }, [applications]);

  const summary = useMemo(() => {
    const scores = sortedApplications.map((app) => normalizeScore(app.aiAnalysis?.overallScore ?? app.aiMatchScore ?? app.score));
    const validScores = scores.filter((score) => score > 0);
    const top = scores.filter((score) => score >= 80).length;
    const medium = scores.filter((score) => score >= 60 && score < 80).length;
    const low = scores.filter((score) => score < 60).length;
    const avg = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    return { total: sortedApplications.length, top, medium, low, avg };
  }, [sortedApplications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [applications.length]);

  const stageOptions = useMemo(() => {
    if (isRoundMode) {
      return rounds.map((round) => ({ id: round.id, name: round.name }));
    }

    const options = STAGE_OPTIONS.map((name) => ({ id: name, name }));
    const seen = new Set(options.map((option) => option.id));

    sortedApplications.forEach((app) => {
      const stage = app.stage || "New Application";
      if (!seen.has(stage)) {
        seen.add(stage);
        options.push({ id: stage, name: formatStageLabel(stage) });
      }
    });

    return options;
  }, [isRoundMode, rounds, sortedApplications]);

  const trendPoints = useMemo(() => {
    const scores = sortedApplications
      .slice(0, 20)
      .map((app) => normalizeScore(app.aiAnalysis?.overallScore ?? app.aiMatchScore ?? app.score))
      .reverse();
    if (scores.length === 0) return [] as Array<{ x: number; y: number }>;

    const width = 240;
    const height = 66;
    const xStep = scores.length === 1 ? width : width / (scores.length - 1);
    return scores.map((score, index) => ({
      x: Number((index * xStep).toFixed(2)),
      y: Number((height - (score / 100) * (height - 8) - 4).toFixed(2)),
    }));
  }, [sortedApplications]);

  const trendPath = useMemo(() => {
    if (trendPoints.length === 0) return "";
    return trendPoints
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");
  }, [trendPoints]);

  const totalItems = sortedApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApplications.slice(start, start + pageSize);
  }, [sortedApplications, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const currentIds = new Set(sortedApplications.map((app) => app.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (currentIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [sortedApplications]);

  const allVisibleSelected =
    pagedApplications.length > 0 && pagedApplications.every((app) => selectedIds.has(app.id));
  const someVisibleSelected =
    pagedApplications.some((app) => selectedIds.has(app.id)) && !allVisibleSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        pagedApplications.forEach((app) => next.delete(app.id));
      } else {
        pagedApplications.forEach((app) => next.add(app.id));
      }
      return next;
    });
  };

  const handleViewAnalysis = async (application: Application) => {
    try {
      const response = await applicationService.getApplicationForAdmin(application.id);
      if (response.success && response.data?.application) {
        const full = response.data.application as any;
        const candidate = full.candidate || full.candidateProfile || {};
        const fullName = [
          candidate.firstName || candidate.first_name,
          candidate.lastName || candidate.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        setAnalysisDrawerCandidate({
          ...application,
          candidateName: fullName || candidate.name || candidate.fullName || application.candidateName,
          candidateEmail: candidate.email || application.candidateEmail,
        });
        setAnalysisDrawerData(full.aiAnalysis || application.aiAnalysis || null);
      } else {
        setAnalysisDrawerCandidate(application);
        setAnalysisDrawerData(application.aiAnalysis || null);
      }
    } catch {
      setAnalysisDrawerCandidate(application);
      setAnalysisDrawerData(application.aiAnalysis || null);
    } finally {
      setAnalysisDrawerOpen(true);
    }
  };

  const handleBulkAnalyze = async (targetIds?: string[]) => {
    const ids = targetIds && targetIds.length ? targetIds : Array.from(selectedIds);
    if (ids.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Select candidates to run AI analysis.",
        variant: "destructive",
      });
      return;
    }

    const selectedApps = sortedApplications.filter((app) => ids.includes(app.id) && app.jobId);
    if (selectedApps.length === 0) {
      toast({
        title: "Missing job mapping",
        description: "Selected candidates are missing job association.",
        variant: "destructive",
      });
      return;
    }

    const byJob = selectedApps.reduce((acc, app) => {
      if (!acc[app.jobId]) acc[app.jobId] = [];
      acc[app.jobId].push(app.id);
      return acc;
    }, {} as Record<string, string[]>);

    setIsAnalyzing(true);
    try {
      const results = await Promise.allSettled(
        Object.entries(byJob).map(([jobIdKey, applicationIds]) =>
          applicationService.bulkScoreCandidates(applicationIds, jobIdKey)
        )
      );

      const successCount = results.filter((r) => r.status === "fulfilled" && r.value?.success).length;
      const failedCount = results.length - successCount;

      toast({
        title: failedCount ? "AI analysis partially completed" : "AI analysis completed",
        description: failedCount
          ? `Updated ${successCount} job groups, ${failedCount} failed.`
          : `AI analysis completed for ${ids.length} candidates.`,
        variant: failedCount ? "destructive" : "default",
      });

      if (!failedCount) {
        setSelectedIds(new Set());
      }
      onRefresh?.();
    } catch (error) {
      toast({
        title: "AI analysis failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveScore = async (application: Application) => {
    const value = normalizeScore(scoreDrafts[application.id]);
    setSavingScore((prev) => ({ ...prev, [application.id]: true }));
    try {
      const response = await applicationService.updateScore(application.id, value);
      if (!response.success) {
        throw new Error(response.error || "Failed to update score");
      }
      toast({ title: "Score updated", description: `${application.candidateName || "Candidate"} score set to ${value}` });
      onRefresh?.();
    } catch (error) {
      toast({ title: "Failed to update score", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setSavingScore((prev) => ({ ...prev, [application.id]: false }));
    }
  };

  const handleStageChange = async (application: Application, value: string) => {
    setStageDrafts((prev) => ({ ...prev, [application.id]: value }));
    setSavingStage((prev) => ({ ...prev, [application.id]: true }));

    try {
      if (isRoundMode) {
        const selectedRound = rounds.find((round) => round.id === value);
        if (!selectedRound) throw new Error("Invalid round selected");
        const response = await applicationService.moveStage(application.id, selectedRound.name, selectedRound.id);
        if (!response.success) throw new Error(response.error || "Failed to move candidate");
        toast({ title: "Round updated", description: `${application.candidateName || "Candidate"} moved to ${selectedRound.name}` });
      } else {
        const response = await applicationService.updateStage(application.id, value);
        if (!response.success) throw new Error(response.error || "Failed to update stage");
        toast({ title: "Stage updated", description: `${application.candidateName || "Candidate"} moved to ${value}` });
      }
      onRefresh?.();
    } catch (error) {
      toast({ title: "Failed to update round", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setSavingStage((prev) => ({ ...prev, [application.id]: false }));
    }
  };

  const handleOpenProfile = async (application: Application) => {
    setLoadingProfileId(application.id);
    try {
      const response = await applicationService.getApplicationForAdmin(application.id);
      if (response.success && response.data?.application) {
        const full = response.data.application as any;
        const candidate = full.candidate || full.candidateProfile || {};
        const fullName = [
          candidate.firstName || candidate.first_name,
          candidate.lastName || candidate.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        const mappedApplication: Application = {
          ...application,
          candidateName: fullName || candidate.name || candidate.fullName || application.candidateName,
          candidateEmail: candidate.email || application.candidateEmail,
          candidatePhone: candidate.phone || application.candidatePhone,
          candidatePhoto: candidate.photo || application.candidatePhoto,
          activities: full.activities || application.activities || [],
          notes: full.notes || application.notes || [],
          interviews: full.interviews || application.interviews || [],
          scorecards: full.scorecards || (application as any).scorecards,
          teamReviews: full.teamReviews || application.teamReviews || [],
          evaluations: full.evaluations || application.evaluations || [],
          aiAnalysis: full.aiAnalysis || application.aiAnalysis,
        };
        setSelectedApplication(mappedApplication);
      } else {
        setSelectedApplication(application);
      }
    } catch (error) {
      setSelectedApplication(application);
      toast({
        title: "Using basic profile",
        description: "Could not load full candidate details.",
        variant: "destructive",
      });
    } finally {
      setOpenAssessment(true);
      setLoadingProfileId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border/80 bg-background shadow-none">
      <div className="border-b px-4 py-2.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidates</p>
          <p className="text-[11px] text-muted-foreground">Compact candidate control table with quick round and score updates.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[11px]">{summary.total} total</Badge>
          <Badge variant="outline" className="text-[11px]">Top {summary.top}</Badge>
          <Badge variant="outline" className="text-[11px]">Avg {summary.avg}%</Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isAnalyzing || selectedIds.size === 0}
            onClick={() => handleBulkAnalyze()}
          >
            {isAnalyzing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1 h-3.5 w-3.5" />}
            Analyze Selected
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={isAnalyzing || totalItems === 0}
            onClick={() => handleBulkAnalyze(sortedApplications.map((app) => app.id))}
          >
            {isAnalyzing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
            Analyze All
          </Button>
        </div>
      </div>
      {selectedIds.size > 0 && (
        <div className="border-b px-4 py-2 text-[11px] text-muted-foreground">
          {selectedIds.size} selected
        </div>
      )}

      <div className="border-b px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Score Trend</p>
                </div>
                <svg viewBox="0 0 240 70" className="w-full h-[70px]">
                  <path d="M0 70 H240" stroke="#E5E7EB" strokeWidth="1" fill="none" />
                  {trendPath ? (
                    <>
                      <path d={trendPath} stroke="#0F766E" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      {trendPoints.map((point, idx) => (
                        <circle key={`pt-${idx}`} cx={point.x} cy={point.y} r={2.2} fill="#0F766E" />
                      ))}
                    </>
                  ) : (
                    <text x="6" y="40" className="fill-muted-foreground" style={{ fontSize: 11 }}>No score data</text>
                  )}
                </svg>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Score Mix</p>
                </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[70px_1fr_34px] items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Top</span>
                <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${summary.total ? (summary.top / summary.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">{summary.top}</span>
              </div>
              <div className="grid grid-cols-[70px_1fr_34px] items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Medium</span>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${summary.total ? (summary.medium / summary.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[11px] text-amber-700 font-medium">{summary.medium}</span>
              </div>
              <div className="grid grid-cols-[70px_1fr_34px] items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Low</span>
                <div className="h-2 rounded-full bg-rose-100 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${summary.total ? (summary.low / summary.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[11px] text-rose-700 font-medium">{summary.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[430px]">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-8 px-3 w-[34px]">
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                  onCheckedChange={toggleSelectVisible}
                  aria-label="Select visible candidates"
                />
              </TableHead>
              <TableHead className="h-8 px-3 w-[56px]">Rank</TableHead>
              <TableHead className="h-9 px-3">Candidate</TableHead>
              <TableHead className="h-9 px-3">Job Applied</TableHead>
              <TableHead className="h-9 px-3">{isRoundMode ? "Round" : "Stage"}</TableHead>
              <TableHead className="h-9 px-3">AI Score</TableHead>
              <TableHead className="h-9 px-3">Score</TableHead>
              <TableHead className="h-9 px-3">Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalItems === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No candidates available.
                </TableCell>
              </TableRow>
            )}

            {pagedApplications.map((application, index) => {
              const aiScore = normalizeScore(application.aiAnalysis?.overallScore ?? application.aiMatchScore ?? application.score);
              const currentStageValue = stageDrafts[application.id] || (isRoundMode ? application.roundId || "" : application.stage || "New Application");
              const rowNumber = (currentPage - 1) * pageSize + index + 1;

              return (
                <TableRow key={application.id}>
                  <TableCell className="px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.has(application.id)}
                      onCheckedChange={() => toggleSelect(application.id)}
                      aria-label={`Select ${application.candidateName || "candidate"}`}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[11px] font-semibold text-foreground">#{rowNumber}</TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[220px]">
                    <p className="font-medium text-foreground truncate">{application.candidateName || application.candidateEmail || "Unknown Candidate"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{application.candidateEmail || "No email"}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 mt-1 text-[10px] text-primary"
                      onClick={() => handleOpenProfile(application)}
                      disabled={loadingProfileId === application.id}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      {loadingProfileId === application.id ? "Loading..." : "View Profile"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 mt-0.5 text-[10px] text-primary"
                      onClick={() => handleViewAnalysis(application)}
                    >
                      <Brain className="mr-1 h-3 w-3" />
                      View Analysis
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <p className="text-[11px] font-medium text-foreground truncate max-w-[220px]">
                      {application.jobTitle || "Untitled Job"}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 mt-1 text-[10px] text-primary"
                      onClick={() => application.jobId && navigate(`/ats/jobs/${application.jobId}`)}
                      disabled={!application.jobId}
                    >
                      Go to Job
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[190px]">
                    <Select
                      value={currentStageValue || undefined}
                      onValueChange={(value) => handleStageChange(application, value)}
                      disabled={savingStage[application.id]}
                    >
                      <SelectTrigger className="h-7 text-[10px]">
                        <SelectValue placeholder={`Select ${isRoundMode ? "round" : "stage"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id} className="text-[11px]">
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${scoreBadgeClass(aiScore)}`}>{aiScore}%</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={scoreDrafts[application.id] || ""}
                        onChange={(e) => setScoreDrafts((prev) => ({ ...prev, [application.id]: e.target.value }))}
                        className="h-7 text-[11px] w-16"
                        type="number"
                        min={0}
                        max={100}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => handleSaveScore(application)}
                        disabled={savingScore[application.id]}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                    {application.appliedDate
                      ? formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="border-t px-4 py-2">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {selectedApplication && (
        <CandidateAssessmentView
          application={selectedApplication}
          open={openAssessment}
          onOpenChange={setOpenAssessment}
          jobTitle={jobTitle}
          jobId={jobId}
        />
      )}
      <AIScreeningAnalysisDrawer
        open={analysisDrawerOpen}
        onOpenChange={setAnalysisDrawerOpen}
        application={analysisDrawerCandidate}
        analysis={analysisDrawerData}
      />
    </div>
  );
}
