
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  ClipboardCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3
} from 'lucide-react';
import type { Application } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface ScorecardsTabProps {
  application: Application;
}

export function ScorecardsTab({ application }: ScorecardsTabProps) {
  const { scorecards } = application;

  if (!scorecards || scorecards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scorecards Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Evaluation scorecards will appear here once interviewers complete their assessments.
        </p>
      </div>
    );
  }

  // Calculate aggregate scores
  const totalScore = scorecards.reduce((sum, sc) => sum + sc.overallScore, 0) / scorecards.length;
  const totalRecommendations = scorecards.reduce((acc, sc) => {
    acc[sc.recommendation] = (acc[sc.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'strong-hire':
      case 'hire':
        return <ThumbsUp className="h-4 w-4" />;
      case 'no-hire':
      case 'strong-no-hire':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong-hire':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'hire':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'no-hire':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'strong-no-hire':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6 pr-4">
        {/* Aggregate Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={cn("text-3xl font-bold", getScoreColor(totalScore))}>
                  {totalScore.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/5.0</span>
              </div>
              <Progress value={(totalScore / 5) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Based on {scorecards.length} scorecard{scorecards.length > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {scorecards.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {scorecards.filter(sc => sc.status === 'completed').length} completed,{' '}
                {scorecards.filter(sc => sc.status === 'draft').length} draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(totalRecommendations).map(([rec, count]) => (
                  <div key={rec} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{rec.replace(/-/g, ' ')}</span>
                    <Badge variant="outline" className={getRecommendationColor(rec)}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Scorecards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Evaluations</h3>

          {scorecards.map((scorecard) => (
            <Card key={scorecard.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={scorecard.evaluatorPhoto} />
                        <AvatarFallback>
                          {scorecard.evaluatorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{scorecard.evaluatorName}</CardTitle>
                        <CardDescription className="text-sm">
                          {scorecard.evaluatorRole}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(scorecard.completedAt, 'MMM dd, yyyy')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {scorecard.template}
                      </Badge>
                      <Badge
                        variant={scorecard.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {scorecard.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-2xl font-bold", getScoreColor(scorecard.overallScore))}>
                        {scorecard.overallScore.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">/5.0</span>
                    </div>
                    <Badge variant="outline" className={cn("border", getRecommendationColor(scorecard.recommendation))}>
                      <span className="flex items-center gap-1">
                        {getRecommendationIcon(scorecard.recommendation)}
                        <span className="capitalize text-xs">{scorecard.recommendation.replace('-', ' ')}</span>
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Rating Criteria */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Evaluation Criteria</h4>
                    <div className="space-y-3">
                      {scorecard.criteria.map((criterion) => (
                        <div key={criterion.id} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{criterion.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {criterion.weight}% weight
                                </Badge>
                              </div>
                              {criterion.description && (
                                <p className="text-xs text-muted-foreground">
                                  {criterion.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {renderStars(criterion.rating)}
                              <span className={cn("text-sm font-semibold min-w-[2rem] text-right", getScoreColor(criterion.rating))}>
                                {criterion.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {criterion.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 ml-4">
                              {criterion.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Strengths and Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scorecard.strengths && scorecard.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {scorecard.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scorecard.concerns && scorecard.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          Areas of Concern
                        </h4>
                        <ul className="space-y-1.5">
                          {scorecard.concerns.map((concern, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">!</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Overall Feedback */}
                  {scorecard.overallFeedback && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Overall Feedback</h4>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{scorecard.overallFeedback}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Notes */}
                  {scorecard.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Additional Notes</h4>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{scorecard.notes}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
