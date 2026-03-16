// @ts-nocheck
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Application } from "@/shared/types/application";
import { bulkScoreCandidates, BulkScoringProgress, ScoringCriteria } from "@/shared/lib/bulkAIScoring";
import { applicationService } from "@/shared/lib/applicationService";
import { useToast } from "@/shared/hooks/use-toast";
import { useCanUseAiFeatures } from "@/shared/hooks/useCanUseAiFeatures";
import { UpgradePlanDialog } from "@/shared/components/UpgradePlanDialog";
import { Loader2, Sparkles, RotateCcw, UserRound, Brain, Lock } from "lucide-react";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { AIScreeningAnalysisDrawer } from "./AIScreeningAnalysisDrawer";

interface AutomatedScreeningPanelProps {
  job: any;
  applications: Application[];
  onRefresh: () => void;
  canUseAiOverride?: boolean;
}

const asText = (value: unknown): string | null => {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => asText(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" | ") : null;
  }
  if (value && typeof value === "object") {
    const objectValues = Object.values(value as Record<string, unknown>)
      .map((item) => asText(item))
      .filter((item): item is string => Boolean(item));
    return objectValues.length ? objectValues.join(" | ") : null;
  }
  return null;
};

const formatRecommendation = (recommendation?: unknown) => {
  if (!recommendation || typeof recommendation !== "string") return "Pending";
  return recommendation
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
};

const getScore = (application: Application, analysis?: any) => {
  return (
    analysis?.overallScore ??
    analysis?.scores?.overall ??
    application.aiMatchScore ??
    application.score ??
    0
  );
};

const getReviewSummary = (analysis?: any) => {
  if (!analysis) return "No AI review yet.";
  const justification = asText(analysis.justification);
  if (justification) return justification;

  const detailed = asText(analysis.detailedAnalysis);
  if (detailed) return detailed;

  const strengths = asText(analysis.strengths);
  if (strengths) return strengths;

  return "AI review available in profile drawer.";
};

const scoreBadgeClass = (score: number) => {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};

export function AutomatedScreeningPanel({ job, applications, onRefresh, canUseAiOverride }: AutomatedScreeningPanelProps) {
  const { toast } = useToast();
  const { canUseAi } = useCanUseAiFeatures(canUseAiOverride === undefined);
  const effectiveCanUseAi = canUseAiOverride ?? canUseAi;
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringProgress, setScoringProgress] = useState<BulkScoringProgress | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Map<string, any>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerApplication, setDrawerApplication] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [analysisDrawerCandidate, setAnalysisDrawerCandidate] = useState<Application | null>(null);
  const [analysisDrawerData, setAnalysisDrawerData] = useState<any>(null);

  const rankedApplications = useMemo(() => {
    const ranked = [...applications].sort((a, b) => {
      const analysisA = analysisResults.get(a.id) || a.aiAnalysis;
      const analysisB = analysisResults.get(b.id) || b.aiAnalysis;
      const scoreA = getScore(a, analysisA);
      const scoreB = getScore(b, analysisB);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
    return ranked;
  }, [applications, analysisResults]);

  const allSelected = rankedApplications.length > 0 && rankedApplications.every((app) => selectedIds.has(app.id));

  const stats = useMemo(() => {
    const scores = rankedApplications.map((app) => getScore(app, analysisResults.get(app.id) || app.aiAnalysis));
    const scored = scores.filter((score) => score > 0);
    return {
      total: rankedApplications.length,
      top: scores.filter((score) => score >= 80).length,
      average: scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 0,
    };
  }, [rankedApplications, analysisResults]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(rankedApplications.map((app) => app.id)));
  };

  const handleBulkScore = async (targetIds?: string[]) => {
    if (!effectiveCanUseAi) {
      setShowUpgradeDialog(true);
      return;
    }
    const candidates = targetIds?.length
      ? rankedApplications.filter((app) => targetIds.includes(app.id))
      : rankedApplications;

    if (candidates.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Select candidates to run AI re-analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsScoring(true);
    setScoringProgress({ total: candidates.length, completed: 0, failed: 0 });

    try {
      const criteria: ScoringCriteria = { job };
      const results = await bulkScoreCandidates(candidates, criteria, (progress) => {
        setScoringProgress(progress);
      });

      const newAnalysisMap = new Map(analysisResults);
      const updatePromises = results
        .filter((result) => result.success)
        .map((result) => {
          if (result.fullAnalysis) {
            newAnalysisMap.set(result.applicationId, result.fullAnalysis);
          }
          return applicationService.updateScore(result.applicationId, result.newScore);
        });

      await Promise.all(updatePromises);
      setAnalysisResults(newAnalysisMap);

      const successCount = results.filter((result) => result.success).length;
      const failedCount = results.length - successCount;

      toast({
        title: "AI re-analysis complete",
        description: `${successCount} updated${failedCount ? `, ${failedCount} failed` : ""}.`,
        variant: failedCount ? "destructive" : "default",
      });

      onRefresh();
    } catch (error: unknown) {
      const err = error as { details?: { code?: string }; error?: string };
      if (err?.details?.code === "AI_SCREENING_REQUIRES_UPGRADE" || err?.error?.includes("Upgrade")) {
        setShowUpgradeDialog(true);
      } else {
        toast({
          title: "Re-analysis failed",
          description: error instanceof Error ? error.message : "Failed to run AI re-analysis.",
          variant: "destructive",
        });
      }
    } finally {
      setIsScoring(false);
      setScoringProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/80 shadow-none">
        <CardHeader className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Screening
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ranked by AI score. Use bulk selection to re-analyze quickly.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px]">{stats.total} candidates</Badge>
              <Badge variant="outline" className="text-[11px]">Top {stats.top}</Badge>
              <Badge variant="outline" className="text-[11px]">Avg {stats.average}%</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "No selection"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={isScoring || selectedIds.size === 0}
                onClick={() => (!effectiveCanUseAi ? setShowUpgradeDialog(true) : handleBulkScore(Array.from(selectedIds)))}
              >
                {!effectiveCanUseAi ? <Lock className="mr-1.5 h-3.5 w-3.5" /> : isScoring ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
                Re-analyze Selected
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                disabled={isScoring || rankedApplications.length === 0}
                onClick={() => (!effectiveCanUseAi ? setShowUpgradeDialog(true) : handleBulkScore())}
              >
                {!effectiveCanUseAi ? <Lock className="mr-1.5 h-3.5 w-3.5" /> : isScoring ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                Re-analyze All
              </Button>
            </div>
          </div>
          {isScoring && scoringProgress && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Processing {scoringProgress.completed}/{scoringProgress.total}
              {scoringProgress.currentCandidate ? ` • ${scoringProgress.currentCandidate}` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border/80 bg-background overflow-hidden">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="h-9 w-10 px-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
              </TableHead>
              <TableHead className="h-9 w-12 px-3">Rank</TableHead>
              <TableHead className="h-9 px-3">Candidate</TableHead>
              <TableHead className="h-9 px-3">AI Score</TableHead>
              <TableHead className="h-9 px-3">Recommendation</TableHead>
              <TableHead className="h-9 px-3">AI Review Summary</TableHead>
              <TableHead className="h-9 px-3">Current Round</TableHead>
              <TableHead className="h-9 px-3">Applied</TableHead>
              <TableHead className="h-9 px-3 text-right">Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
            {rankedApplications.map((application, index) => {
              const analysis = analysisResults.get(application.id) || application.aiAnalysis;
              const score = getScore(application, analysis);
              const recommendation = formatRecommendation(analysis?.recommendation);
              const summary = getReviewSummary(analysis);

              return (
                <TableRow key={application.id}>
                  <TableCell className="px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.has(application.id)}
                      onCheckedChange={() => toggleSelect(application.id)}
                      aria-label={`Select ${application.candidateName || "candidate"}`}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 font-semibold text-foreground">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[170px]">
                    <p className="font-medium text-foreground truncate">
                      {application.candidateName || application.candidateEmail?.split("@")[0] || "Unknown Candidate"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{application.candidateEmail || "No email"}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 mt-1 text-[10px] text-primary"
                      onClick={() => {
                        if (!effectiveCanUseAi) {
                          setShowUpgradeDialog(true);
                          return;
                        }
                        setAnalysisDrawerCandidate(application);
                        setAnalysisDrawerData(analysis);
                        setAnalysisDrawerOpen(true);
                      }}
                    >
                      {effectiveCanUseAi ? <Brain className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                      AI Analysis
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[11px] ${scoreBadgeClass(score)}`}>
                      {score > 0 ? `${Math.round(score)}%` : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className="text-[11px] text-foreground">{recommendation}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 max-w-[380px]">
                    <p className="text-[11px] text-muted-foreground leading-5 line-clamp-2">{summary}</p>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {application.stage || "New Application"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                    {application.appliedDate && !Number.isNaN(new Date(application.appliedDate).getTime())
                      ? formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => {
                        setDrawerApplication(application);
                        setDrawerOpen(true);
                      }}
                    >
                      <UserRound className="mr-1.5 h-3.5 w-3.5" />
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {drawerApplication && (
        <CandidateAssessmentView
          application={drawerApplication}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          jobTitle={drawerApplication.jobTitle || job?.title || "Job"}
          jobId={job?.id}
          canUseAiOverride={effectiveCanUseAi}
        />
      )}

      <AIScreeningAnalysisDrawer
        open={analysisDrawerOpen}
        onOpenChange={setAnalysisDrawerOpen}
        application={analysisDrawerCandidate}
        analysis={analysisDrawerData}
      />

      <UpgradePlanDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title="Upgrade to unlock AI Screening"
        description="AI Screening and Candidate Analysis require a paid plan (Small or higher). Upgrade to unlock these features."
      />
    </div>
  );
}
