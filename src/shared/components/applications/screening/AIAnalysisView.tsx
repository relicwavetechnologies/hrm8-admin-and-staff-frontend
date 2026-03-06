import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, BookOpen, Briefcase, Users, Award } from "lucide-react";

interface AIAnalysisViewProps {
  analysis: {
    scores: {
      skills: number;
      experience: number;
      education: number;
      interview: number;
      culture: number;
      overall: number;
    };
    strengths: string[];
    concerns: string[];
    recommendation: string;
    justification: string;
    improvementAreas: string[];
    detailedAnalysis: {
      skillsAnalysis: string;
      experienceAnalysis: string;
      educationAnalysis: string;
      culturalFitAnalysis: string;
      overallAssessment: string;
    };
  };
}

export function AIAnalysisView({ analysis }: AIAnalysisViewProps) {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_hire':
        return 'bg-green-500 text-white';
      case 'hire':
        return 'bg-teal-500 text-white';
      case 'maybe':
        return 'bg-yellow-500 text-white';
      case 'no_hire':
        return 'bg-orange-500 text-white';
      case 'strong_no_hire':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'strong_hire':
        return 'Strong Hire';
      case 'hire':
        return 'Hire';
      case 'maybe':
        return 'Maybe';
      case 'no_hire':
        return 'No Hire';
      case 'strong_no_hire':
        return 'Strong No Hire';
      default:
        return rec;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-teal-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score & Recommendation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Analysis Summary</CardTitle>
            <Badge className={getRecommendationColor(analysis.recommendation)}>
              {getRecommendationLabel(analysis.recommendation)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.scores.overall)}`}>
                {analysis.scores.overall}/100
              </span>
            </div>
            <Progress value={analysis.scores.overall} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                Skills
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.scores.skills)}`}>
                {analysis.scores.skills}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Experience
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.scores.experience)}`}>
                {analysis.scores.experience}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Education
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.scores.education)}`}>
                {analysis.scores.education}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Interview
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.scores.interview)}`}>
                {analysis.scores.interview}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-3 w-3" />
                Culture
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.scores.culture)}`}>
                {analysis.scores.culture}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Justification */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Justification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.justification}</p>
        </CardContent>
      </Card>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Comprehensive breakdown by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Skills Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailedAnalysis.skillsAnalysis}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Experience Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailedAnalysis.experienceAnalysis}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Education Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailedAnalysis.educationAnalysis}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Cultural Fit Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailedAnalysis.culturalFitAnalysis}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overall Assessment
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailedAnalysis.overallAssessment}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      {analysis.improvementAreas && analysis.improvementAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Specific areas the candidate could develop</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.improvementAreas.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

