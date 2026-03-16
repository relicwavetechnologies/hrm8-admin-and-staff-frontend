// @ts-nocheck
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Star, ThumbsUp, ThumbsDown, Minus, ChevronRight, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

type Recommendation = 'STRONG_YES' | 'YES' | 'NEUTRAL' | 'NO' | 'STRONG_NO';

interface FeedbackItem {
  id: string;
  interviewerName: string;
  overallRating: number;
  recommendation: Recommendation;
  notes?: string;
  createdAt?: string;
}

interface InterviewFeedbackBadgeProps {
  score?: number;
  recommendation?: Recommendation;
  feedbacks?: FeedbackItem[];
  totalInterviewers?: number;
  feedbackCount?: number;
  interviewId: string;
  onViewFull?: (interviewId: string) => void;
}

const recommendationConfig: Record<Recommendation, { label: string; color: string; icon: React.ReactNode }> = {
  STRONG_YES: { label: 'Strong Yes', color: 'bg-green-500', icon: <ThumbsUp className="h-3 w-3" /> },
  YES: { label: 'Yes', color: 'bg-green-400', icon: <ThumbsUp className="h-3 w-3" /> },
  NEUTRAL: { label: 'Neutral', color: 'bg-yellow-400', icon: <Minus className="h-3 w-3" /> },
  NO: { label: 'No', color: 'bg-red-400', icon: <ThumbsDown className="h-3 w-3" /> },
  STRONG_NO: { label: 'Strong No', color: 'bg-red-500', icon: <ThumbsDown className="h-3 w-3" /> },
};

// Compact feedback indicator for inline display
export function CompactFeedbackIndicator({ 
  score, 
  feedbackCount, 
  totalInterviewers 
}: { 
  score?: number; 
  feedbackCount?: number; 
  totalInterviewers?: number;
}) {
  if (score === undefined && feedbackCount === 0) {
    return (
      <span className="text-xs text-muted-foreground">No feedback yet</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {score !== undefined && (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{score.toFixed(1)}</span>
        </div>
      )}
      {feedbackCount !== undefined && totalInterviewers !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({feedbackCount}/{totalInterviewers} feedback)
        </span>
      )}
    </div>
  );
}

export function InterviewFeedbackBadge({
  score,
  recommendation,
  feedbacks = [],
  totalInterviewers = 0,
  feedbackCount = 0,
  interviewId,
  onViewFull,
}: InterviewFeedbackBadgeProps) {
  const [open, setOpen] = useState(false);

  const recConfig = recommendation ? recommendationConfig[recommendation] : null;

  // Render stars for a rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-2 px-2">
          <CompactFeedbackIndicator
            score={score}
            feedbackCount={feedbackCount}
            totalInterviewers={totalInterviewers}
          />
          {recConfig && (
            <Badge 
              variant="secondary" 
              className={`${recConfig.color} text-white text-[10px] px-1.5 py-0`}
            >
              {recConfig.icon}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Interview Feedback</h4>
            {score !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{score.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
            )}
          </div>
          {recConfig && (
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${recConfig.color} text-white`}>
                {recConfig.icon}
                <span className="ml-1">{recConfig.label}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {feedbackCount} of {totalInterviewers} submitted
              </span>
            </div>
          )}
        </div>

        <div className="max-h-[240px] overflow-y-auto">
          {feedbacks.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No feedback submitted yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {feedbacks.map((fb, idx) => (
                <div key={fb.id || idx} className="p-2 rounded-md bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{fb.interviewerName}</span>
                    {renderStars(fb.overallRating)}
                  </div>
                  {fb.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {fb.notes}
                    </p>
                  )}
                  {fb.createdAt && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(fb.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className="mt-1.5 text-[10px]"
                  >
                    {recommendationConfig[fb.recommendation]?.label || fb.recommendation}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {onViewFull && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => {
                  onViewFull(interviewId);
                  setOpen(false);
                }}
              >
                View Full Feedback
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
