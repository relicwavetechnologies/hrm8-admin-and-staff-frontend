import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Minus, Send } from 'lucide-react';
import {
  getReviewsByApplication,
  getVotesByApplication,
  getCommentsByApplication,
  getConsensusMetrics,
  addComment,
  type ApplicationReview,
  type ApplicationVote,
  type ApplicationComment,
} from '@/shared/lib/applications/collaborativeReview';
import { formatDistanceToNow } from 'date-fns';
import { notifyCommentAdded, followApplication } from '@/shared/lib/applications/notifications';

interface ApplicationReviewPanelProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onReviewClick: () => void;
}

export function ApplicationReviewPanel({ applicationId, candidateName, jobTitle, onReviewClick }: ApplicationReviewPanelProps) {
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [votes, setVotes] = useState<ApplicationVote[]>([]);
  const [comments, setComments] = useState<ApplicationComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const loadData = () => {
    setReviews(getReviewsByApplication(applicationId));
    setVotes(getVotesByApplication(applicationId));
    setComments(getCommentsByApplication(applicationId));
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const metrics = getConsensusMetrics(applicationId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment({
      applicationId,
      userId: 'current-user-id',
      userName: 'Current User',
      content: newComment,
      parentId: replyTo || undefined,
    });

    // Auto-follow application when commenting
    followApplication('current-user-id', applicationId);

    // Notify followers
    notifyCommentAdded(
      applicationId,
      candidateName,
      jobTitle,
      'current-user-id',
      'Current User',
      newComment,
      !!replyTo
    );

    setNewComment('');
    setReplyTo(null);
    loadData();
  };

  const getRecommendationColor = (rec: ApplicationReview['recommendation']) => {
    switch (rec) {
      case 'strong-hire':
        return 'bg-green-600';
      case 'hire':
        return 'bg-green-500';
      case 'maybe':
        return 'bg-yellow-500';
      case 'no-hire':
        return 'bg-red-500';
      case 'strong-no-hire':
        return 'bg-red-600';
      default:
        return 'bg-muted';
    }
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) => comments.filter((c) => c.parentId === commentId);

  const CommentItem = ({ comment, level = 0 }: { comment: ApplicationComment; level?: number }) => (
    <div className={`${level > 0 ? 'ml-8 mt-2' : 'mt-3'}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 mt-1 text-xs"
            onClick={() => setReplyTo(comment.id)}
          >
            Reply
          </Button>
        </div>
      </div>
      {getReplies(comment.id).map((reply) => (
        <CommentItem key={reply.id} comment={reply} level={level + 1} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Consensus Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Consensus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{metrics.totalReviews}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</span>
                {renderStars(Math.round(metrics.averageRating))}
              </div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.totalVotes}</div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
            <div>
              <div className="flex gap-1">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium">{metrics.voteCount.hire}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  <span className="text-sm font-medium">{metrics.voteCount.noHire}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Vote Tally</div>
            </div>
          </div>

          <Button onClick={onReviewClick} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Your Review
          </Button>
        </CardContent>
      </Card>

      {/* Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewerAvatar} />
                      <AvatarFallback>
                        {review.reviewerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.reviewerName}</span>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge className={getRecommendationColor(review.recommendation)}>
                    {review.recommendation.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Technical</div>
                    {renderStars(review.categories.technicalSkills)}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Experience</div>
                    {renderStars(review.categories.experience)}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Culture Fit</div>
                    {renderStars(review.categories.culturalFit)}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Communication</div>
                    {renderStars(review.categories.communication)}
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Votes */}
      {votes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Votes ({votes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {votes.map((vote) => (
              <div key={vote.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={vote.voterAvatar} />
                  <AvatarFallback>{vote.voterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{vote.voterName}</span>
                    {vote.decision === 'hire' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                    {vote.decision === 'no-hire' && <ThumbsDown className="h-4 w-4 text-red-600" />}
                    {vote.decision === 'abstain' && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <Badge variant={vote.decision === 'hire' ? 'default' : 'secondary'}>
                      {vote.decision.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{vote.reasoning}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(vote.votedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Discussion Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discussion ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? 'Write a reply...' : 'Start a discussion...'}
                rows={3}
              />
              <Button onClick={handleAddComment} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {replyTo && (
              <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                Cancel Reply
              </Button>
            )}
            {topLevelComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
