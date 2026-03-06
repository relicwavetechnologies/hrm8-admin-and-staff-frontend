import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Application } from "@/shared/types/application";
import { bulkScoreCandidates, ScoringCriteria, BulkScoringProgress } from "@/shared/lib/bulkAIScoring";
import { applicationService } from "@/shared/lib/applicationService";
import { useToast } from "@/shared/hooks/use-toast";
import { Sparkles, Play, TrendingUp, Users, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import { ScreeningCandidateCard } from "./ScreeningCandidateCard";

interface AutomatedScreeningPanelProps {
  job: any; // Full job object
  applications: Application[];
  onRefresh: () => void;
}

export function AutomatedScreeningPanel({
  job,
  applications,
  onRefresh,
}: AutomatedScreeningPanelProps) {
  // Extract job properties for backward compatibility
  const jobId = job?.id || '';
  const { toast } = useToast();
  const [isScoring, setIsScoring] = useState(false);
  const [scoringProgress, setScoringProgress] = useState<BulkScoringProgress | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("score");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [maxScore, setMaxScore] = useState<number | undefined>(undefined);
  const [analysisResults, setAnalysisResults] = useState<Map<string, any>>(new Map());

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    // Filter by score range
    if (minScore !== undefined) {
      filtered = filtered.filter(
        (app) => (app.aiMatchScore ?? app.score ?? 0) >= minScore
      );
    }
    if (maxScore !== undefined) {
      filtered = filtered.filter(
        (app) => (app.aiMatchScore ?? app.score ?? 0) <= maxScore
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          const scoreA = a.aiMatchScore ?? a.score ?? 0;
          const scoreB = b.aiMatchScore ?? b.score ?? 0;
          return scoreB - scoreA;
        case "date":
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case "name":
          return a.candidateName.localeCompare(b.candidateName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, sortBy, minScore, maxScore]);

  // Calculate statistics
  const stats = useMemo(() => {
    const scores = filteredAndSortedApplications
      .map((app) => app.aiMatchScore ?? app.score ?? 0)
      .filter((score) => score > 0);

    const topMatches = scores.filter((score) => score >= 80).length;
    const mediumMatches = scores.filter((score) => score >= 60 && score < 80).length;
    const lowMatches = scores.filter((score) => score < 60).length;
    const noScore = filteredAndSortedApplications.length - scores.length;

    return {
      total: filteredAndSortedApplications.length,
      topMatches,
      mediumMatches,
      lowMatches,
      noScore,
      averageScore: scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    };
  }, [filteredAndSortedApplications]);

  const handleBulkScore = async () => {
    if (applications.length === 0) {
      toast({
        title: "No applications",
        description: "There are no applications to score.",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Starting bulk AI scoring via backend...', {
      candidateCount: applications.length,
      jobId: job.id,
      jobTitle: job.title,
    });

    setIsScoring(true);
    setScoringProgress({
      total: applications.length,
      completed: 0,
      failed: 0,
    });

    try {
      const criteria: ScoringCriteria = {
        job: job, // Pass full job object
      };

      console.log('📋 Scoring criteria prepared:', {
        jobId: criteria.job.id,
        jobTitle: criteria.job.title,
        hasRequirements: criteria.job.requirements?.length > 0,
        hasDescription: !!criteria.job.description,
      });

      const results = await bulkScoreCandidates(applications, criteria, (progress) => {
        setScoringProgress(progress);
        console.log('📊 Progress update:', progress);
      });

      console.log('✅ Bulk scoring completed:', {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        errors: results.filter(r => !r.success).map(r => ({
          candidate: r.candidateName,
          error: r.error,
        })),
      });

      // Store analysis results
      const newAnalysisMap = new Map(analysisResults);
      results.forEach((result) => {
        if (result.success && result.fullAnalysis) {
          newAnalysisMap.set(result.applicationId, result.fullAnalysis);
        }
      });
      setAnalysisResults(newAnalysisMap);

      // Update scores in backend
      const updatePromises = results
        .filter((r) => r.success)
        .map((result) =>
          applicationService.updateScore(result.applicationId, result.newScore)
        );

      await Promise.all(updatePromises);

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;
      const failedResults = results.filter((r) => !r.success);

      if (failedCount > 0) {
        console.error('❌ Some candidates failed to score:', failedResults);
        const errorMessages = failedResults
          .map(r => `${r.candidateName}: ${r.error || 'Unknown error'}`)
          .join('; ');
        console.error('Error details:', errorMessages);
      }

      toast({
        title: "AI Screening Complete",
        description: `Scored ${successCount} candidates${failedCount > 0 ? `, ${failedCount} failed. Check console for details.` : ""}.`,
        variant: failedCount > 0 ? "destructive" : "default",
      });

      onRefresh();
    } catch (error) {
      console.error("❌ Bulk scoring failed with exception:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Scoring Failed",
        description: error instanceof Error ? error.message : "Failed to score candidates. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsScoring(false);
      setScoringProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Screening
              </CardTitle>
              <CardDescription>
                Use AI to automatically score and rank candidates based on job requirements
              </CardDescription>
            </div>
            <Button
              onClick={handleBulkScore}
              disabled={isScoring || applications.length === 0}
              size="lg"
            >
              {isScoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run AI Screening
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isScoring && scoringProgress && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Scoring {scoringProgress.currentCandidate || "candidates"}...
                </span>
                <span>
                  {scoringProgress.completed} / {scoringProgress.total}
                </span>
              </div>
              <Progress
                value={(scoringProgress.completed / scoringProgress.total) * 100}
                className="h-2"
              />
              {scoringProgress.failed > 0 && (
                <p className="text-xs text-muted-foreground">
                  {scoringProgress.failed} failed
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Matches (≥80)</p>
                <p className="text-2xl font-bold text-green-600">{stats.topMatches}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium (60-79)</p>
                <p className="text-2xl font-bold text-amber-600">{stats.mediumMatches}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low (&lt;60)</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowMatches}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter & Sort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">AI Score (High to Low)</SelectItem>
                  <SelectItem value="date">Applied Date (Newest)</SelectItem>
                  <SelectItem value="name">Candidate Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minScore ?? ""}
                onChange={(e) =>
                  setMinScore(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxScore ?? ""}
                onChange={(e) =>
                  setMaxScore(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Actions:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const topCandidates = filteredAndSortedApplications
                    .filter(app => (app.aiMatchScore ?? app.score ?? 0) >= 80)
                    .slice(0, 10);
                  if (topCandidates.length === 0) {
                    toast({
                      title: "No Top Candidates",
                      description: "No candidates with score ≥80 found.",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Top Candidates",
                    description: `Found ${topCandidates.length} candidates with score ≥80.`,
                  });
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Show Top 10 (≥80)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const lowCandidates = filteredAndSortedApplications
                    .filter(app => (app.aiMatchScore ?? app.score ?? 0) < 50);
                  if (lowCandidates.length === 0) {
                    toast({
                      title: "No Low Scored Candidates",
                      description: "No candidates with score <50 found.",
                    });
                    return;
                  }
                  toast({
                    title: "Low Scored Candidates",
                    description: `Found ${lowCandidates.length} candidates with score <50.`,
                  });
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Show Low Scores (&lt;50)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Candidates ({filteredAndSortedApplications.length})
          </h3>
          <div className="flex items-center gap-2">
            {stats.averageScore > 0 && (
              <Badge variant="outline" className="text-sm">
                Avg: {stats.averageScore}%
              </Badge>
            )}
            {stats.topMatches > 0 && (
              <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200">
                {stats.topMatches} Top Matches
              </Badge>
            )}
          </div>
        </div>

        {filteredAndSortedApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {applications.length === 0
                  ? "No applications found for this job."
                  : "No candidates match the current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedApplications.map((application) => {
              // Use application's aiAnalysis if available, otherwise use analysisResults Map
              const aiAnalysis = application.aiAnalysis || analysisResults.get(application.id);
              return (
                <ScreeningCandidateCard
                  key={application.id}
                  application={application}
                  jobId={jobId}
                  onUpdate={onRefresh}
                  aiAnalysis={aiAnalysis}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

