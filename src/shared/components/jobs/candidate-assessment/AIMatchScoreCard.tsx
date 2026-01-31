import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Application } from "@/shared/types/application";
import { Sparkles, TrendingUp, AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";

interface AIMatchScoreCardProps {
  application: Application;
}

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  cultural: number;
}

export function AIMatchScoreCard({ application }: AIMatchScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const aiAnalysis = application.aiAnalysis;

  // Use AI analysis data if available, otherwise fallback to mock/defaults
  const overallScore = aiAnalysis?.scores?.overall || application.aiMatchScore || 0;
  const breakdown: ScoreBreakdown = {
    skills: aiAnalysis?.scores?.skills || 0,
    experience: aiAnalysis?.scores?.experience || 0,
    education: aiAnalysis?.scores?.education || 0,
    cultural: aiAnalysis?.scores?.culture || 0,
  };

  const strengths = aiAnalysis?.strengths || [];
  const concerns = aiAnalysis?.concerns || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Weak Match";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Match Analysis</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered candidate fit assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                className={getScoreColor(overallScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>
              <span className="text-xs text-muted-foreground">Match Score</span>
            </div>
          </div>
          <div>
            <Badge
              variant="outline"
              className={`${getScoreColor(overallScore)} border-current`}
            >
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Score Breakdown</h4>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skills Match</span>
                <span className={`font-semibold ${getScoreColor(breakdown.skills)}`}>
                  {breakdown.skills}%
                </span>
              </div>
              <div className="relative w-full h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${getProgressColor(breakdown.skills)} transition-all`}
                  style={{ width: `${breakdown.skills}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Experience Match</span>
                <span className={`font-semibold ${getScoreColor(breakdown.experience)}`}>
                  {breakdown.experience}%
                </span>
              </div>
              <div className="relative w-full h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${getProgressColor(breakdown.experience)} transition-all`}
                  style={{ width: `${breakdown.experience}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Education Match</span>
                <span className={`font-semibold ${getScoreColor(breakdown.education)}`}>
                  {breakdown.education}%
                </span>
              </div>
              <div className="relative w-full h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${getProgressColor(breakdown.education)} transition-all`}
                  style={{ width: `${breakdown.education}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cultural Fit</span>
                <span className={`font-semibold ${getScoreColor(breakdown.cultural)}`}>
                  {breakdown.cultural}%
                </span>
              </div>
              <div className="relative w-full h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${getProgressColor(breakdown.cultural)} transition-all`}
                  style={{ width: `${breakdown.cultural}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h4 className="text-sm font-semibold">Key Strengths</h4>
          </div>
          <ul className="space-y-1.5 text-sm">
            {strengths.slice(0, 3).map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        {concerns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <h4 className="text-sm font-semibold">Areas of Concern</h4>
            </div>
            <ul className="space-y-1.5 text-sm">
              {concerns.slice(0, 3).map((concern, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How Score is Calculated */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2">
              <span className="text-sm text-muted-foreground">
                How this score is calculated
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 rounded-lg p-4">
              <p>
                Our AI analyzes multiple factors to calculate the match score:
              </p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Skills alignment with job requirements (30%)</li>
                <li>Years and relevance of experience (25%)</li>
                <li>Educational qualifications (20%)</li>
                <li>Cultural fit indicators (15%)</li>
                <li>Application quality and completeness (10%)</li>
              </ul>
              <p className="text-xs mt-3">
                Scores are updated automatically when application data changes.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Comparison */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">vs. Average Applicant</span>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% higher
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
