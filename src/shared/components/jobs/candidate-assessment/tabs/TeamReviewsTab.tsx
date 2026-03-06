import { Application } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";

import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Circle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import { LiveCommentThread } from "../LiveCommentThread";
import { LiveActivityFeed } from "../LiveActivityFeed";
import { CollaborativeEditor } from "../CollaborativeEditor";
import { VersionHistory } from "../VersionHistory";
import { useState } from "react";

interface TeamReviewsTabProps {
  application: Application;
}

export function TeamReviewsTab({ application }: TeamReviewsTabProps) {
  const reviews = application.teamReviews || [];
  const [editorContent, setEditorContent] = useState('');

  // Calculate consensus metrics
  const totalReviews = reviews.length;
  const averageScore = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / totalReviews
    : 0;

  const recommendationCounts = reviews.reduce((acc, r) => {
    acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageConfidence = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.confidence, 0) / totalReviews
    : 0;

  // Group ratings by criterion
  const criteriaAverages: Record<string, { total: number; count: number; notes: string[] }> = reviews.reduce((acc, review) => {
    review.ratings.forEach(rating => {
      if (!acc[rating.criterionId]) {
        acc[rating.criterionId] = { total: 0, count: 0, notes: [] };
      }
      acc[rating.criterionId].total += Number(rating.value);
      acc[rating.criterionId].count += 1;
      if (rating.notes) {
        acc[rating.criterionId].notes.push(rating.notes);
      }
    });
    return acc;
  }, {} as Record<string, { total: number; count: number; notes: string[] }>);

  const criterionNames: Record<string, string> = {
    '1': 'Technical Skills',
    '2': 'Problem Solving',
    '3': 'Communication',
    '4': 'Cultural Fit',
    '5': 'Leadership',
    '6': 'Learning Agility'
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'strong-hire':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'hire':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'maybe':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'no-hire':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'strong-no-hire':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong-hire':
      case 'hire':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no-hire':
      case 'strong-no-hire':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-50 border-green-200';
      case 'concern':
        return 'bg-red-50 border-red-200';
      case 'observation':
        return 'bg-blue-50 border-blue-200';
      case 'question':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-muted border-border';
    }
  };

  if (totalReviews === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Team Reviews Yet</h3>
        <p className="text-muted-foreground">
          Team reviews will appear here once team members submit their feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consensus Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Consensus Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">
                {averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average Score
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">
                {totalReviews}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Reviews
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">
                {averageConfidence.toFixed(1)}/5
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Avg Confidence
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-green-600">
                {((recommendationCounts['hire'] || 0) + (recommendationCounts['strong-hire'] || 0))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Hire Recommendations
              </div>
            </div>
          </div>

          {/* Recommendation Distribution */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Recommendation Distribution</h4>
            <div className="space-y-2">
              {Object.entries(recommendationCounts).map(([rec, count]) => (
                <div key={rec} className="flex items-center gap-3">
                  <div className="w-32 text-sm capitalize flex items-center gap-2">
                    {getRecommendationIcon(rec)}
                    {rec.replace(/-/g, ' ')}
                  </div>
                  <Progress value={(count / totalReviews) * 100} className="h-2 flex-1" />
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {count}/{totalReviews}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Criteria Averages */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Criteria Averages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(criteriaAverages).map(([criterionId, data]) => (
                <div key={criterionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="font-medium text-sm">
                    {criterionNames[criterionId] || `Criterion ${criterionId}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= (data.total / data.count) / 2
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">
                      {(data.total / data.count).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Individual Reviews ({totalReviews})
        </h3>

        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.reviewerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{review.reviewerName}</div>
                    <div className="text-sm text-muted-foreground">{review.reviewerRole}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {review.overallScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {review.confidence}/5
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recommendation */}
              <div>
                <Badge
                  variant="outline"
                  className={`${getRecommendationColor(review.recommendation)} flex items-center gap-1 w-fit`}
                >
                  {getRecommendationIcon(review.recommendation)}
                  <span className="capitalize">{review.recommendation.replace(/-/g, ' ')}</span>
                </Badge>
              </div>

              <Separator />

              {/* Ratings */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Ratings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {review.ratings.map((rating) => (
                    <div
                      key={rating.criterionId}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {criterionNames[rating.criterionId] || `Criterion ${rating.criterionId}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{rating.value}/10</span>
                        </div>
                      </div>
                      {rating.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          "{rating.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {review.comments && review.comments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Feedback</h4>
                    <div className="space-y-2">
                      {review.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-lg border ${getCommentTypeColor(comment.type)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {comment.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {comment.category}
                            </Badge>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          {comment.importance && (
                            <div className="mt-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${comment.importance === 'high'
                                    ? 'border-red-300 bg-red-50 text-red-700'
                                    : comment.importance === 'medium'
                                      ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                                      : 'border-gray-300 bg-gray-50 text-gray-700'
                                  }`}
                              >
                                {comment.importance} importance
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submitted Date */}
              <div className="text-xs text-muted-foreground text-right">
                Submitted on {new Date(review.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collaborative Editor and Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <CollaborativeEditor
            documentId={`interview-notes-${application.id}`}
            candidateName={application.candidateName}
            initialContent={editorContent}
          />
        </div>
        <div>
          <VersionHistory
            documentId={`interview-notes-${application.id}`}
            currentContent={editorContent}
            onRestore={setEditorContent}
          />
        </div>
      </div>

      {/* Live Activity Feed and Comment Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LiveCommentThread
          candidateId={application.id}
          candidateName={application.candidateName}
          currentUserId="current-user"
          currentUserName="Current User"
        />

        <LiveActivityFeed
          candidateId={application.id}
          maxHeight="600px"
        />
      </div>
    </div>
  );
}
