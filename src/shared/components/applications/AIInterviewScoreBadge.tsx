import { Badge } from '@/shared/components/ui/badge';
import { Video, TrendingUp } from 'lucide-react';
import { getAIInterviewsByCandidate } from '@/shared/lib/aiInterview/aiInterviewStorage';

interface AIInterviewScoreBadgeProps {
  candidateId: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function AIInterviewScoreBadge({ candidateId, variant = 'default' }: AIInterviewScoreBadgeProps) {
  const interviews = getAIInterviewsByCandidate(candidateId);
  const completedInterviews = interviews.filter(i => i.status === 'completed' && i.analysis);
  
  if (completedInterviews.length === 0) {
    return null;
  }

  const latestInterview = completedInterviews[completedInterviews.length - 1];
  const score = latestInterview.analysis?.overallScore || 0;
  const recommendation = latestInterview.analysis?.recommendation;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500 hover:bg-green-600 text-white';
    if (score >= 70) return 'bg-blue-500 hover:bg-blue-600 text-white';
    if (score >= 60) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    return 'bg-red-500 hover:bg-red-600 text-white';
  };

  const getRecommendationText = (rec?: string) => {
    if (!rec) return '';
    return rec.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (variant === 'compact') {
    return (
      <Badge className={`${getScoreColor(score)} gap-1 text-xs`}>
        <TrendingUp className="h-3 w-3" />
        {score}
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge className={`${getScoreColor(score)} gap-1`}>
            <Video className="h-3 w-3" />
            AI Interview: {score}
          </Badge>
        </div>
        {recommendation && (
          <span className="text-xs text-muted-foreground">
            {getRecommendationText(recommendation)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge className={`${getScoreColor(score)} gap-1`}>
      <Video className="h-3 w-3" />
      AI: {score}
    </Badge>
  );
}
