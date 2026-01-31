
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import type { Application } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';

interface QuestionnaireResponsesTabProps {
  application: Application;
}

export function QuestionnaireResponsesTab({ application }: QuestionnaireResponsesTabProps) {
  const { questionnaireData } = application;

  if (!questionnaireData || questionnaireData.responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Questionnaire Responses</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This application does not include custom questionnaire responses.
        </p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6 pr-4">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={cn("text-3xl font-bold", getScoreColor(questionnaireData.overallScore || 0))}>
                  {questionnaireData.overallScore || 0}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getScoreLabel(questionnaireData.overallScore || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {questionnaireData.completionRate}%
                </span>
              </div>
              <Progress value={questionnaireData.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {questionnaireData.timeSpent || 0}
                </span>
                <span className="text-sm text-muted-foreground mb-1">min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average: {Math.round((questionnaireData.timeSpent || 0) / questionnaireData.responses.length)} min/question
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Responses Section */}
        <div className="space-y-4">
          {questionnaireData.responses.map((response, index) => (
            <Card key={response.questionId} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {response.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold">
                      {response.question}
                    </CardTitle>
                  </div>
                  {response.aiAnalysis && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className={cn("h-4 w-4", getScoreColor(response.aiAnalysis.qualityScore))} />
                        <span className={cn("text-sm font-semibold", getScoreColor(response.aiAnalysis.qualityScore))}>
                          {response.aiAnalysis.qualityScore}
                        </span>
                      </div>
                      <Badge variant="outline" className={cn("border", getSentimentColor(response.aiAnalysis.sentiment))}>
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(response.aiAnalysis.sentiment)}
                          <span className="capitalize text-xs">{response.aiAnalysis.sentiment}</span>
                        </span>
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Candidate's Answer */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Candidate's Response
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                {response.aiAnalysis && (
                  <div className="space-y-4">
                    <Separator />

                    {/* Key Insights */}
                    {response.aiAnalysis.keyInsights && response.aiAnalysis.keyInsights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          Key Insights
                        </h4>
                        <ul className="space-y-1.5">
                          {response.aiAnalysis.keyInsights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strengths */}
                    {response.aiAnalysis.strengths && response.aiAnalysis.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {response.aiAnalysis.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Concerns */}
                    {response.aiAnalysis.concerns && response.aiAnalysis.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          Areas of Concern
                        </h4>
                        <ul className="space-y-1.5">
                          {response.aiAnalysis.concerns.map((concern, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">!</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
