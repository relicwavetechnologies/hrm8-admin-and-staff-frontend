import { useEffect, useState } from 'react';
import { getAllFeedback } from '@/shared/lib/collaborativeFeedbackService';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';

export interface FeedbackStats {
  totalFeedback: number;
  thisWeekCount: number;
  averageScore: number;
  pendingReview: number;
  recentFeedback: TeamMemberFeedback[];
  topCandidates: Array<{
    candidateId: string;
    score: number;
    feedbackCount: number;
  }>;
}

export function useFeedbackStats() {
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    thisWeekCount: 0,
    averageScore: 0,
    pendingReview: 0,
    recentFeedback: [],
    topCandidates: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      try {
        const allFeedback = getAllFeedback();

        // Calculate week stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekCount = allFeedback.filter(
          f => new Date(f.submittedAt) > weekAgo
        ).length;

        // Calculate average score
        const avgScore = allFeedback.length > 0
          ? allFeedback.reduce((sum, f) => sum + f.overallScore, 0) / allFeedback.length
          : 0;

        // Get recent feedback
        const recentFeedback = allFeedback
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5);

        // Calculate top candidates
        const candidateScores: Record<string, { total: number; count: number }> = {};
        allFeedback.forEach(f => {
          if (!candidateScores[f.candidateId]) {
            candidateScores[f.candidateId] = { total: 0, count: 0 };
          }
          candidateScores[f.candidateId].total += f.overallScore;
          candidateScores[f.candidateId].count += 1;
        });

        const topCandidates = Object.entries(candidateScores)
          .map(([candidateId, data]) => ({
            candidateId,
            score: data.total / data.count,
            feedbackCount: data.count,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setStats({
          totalFeedback: allFeedback.length,
          thisWeekCount,
          averageScore: avgScore,
          pendingReview: 5, // Mock value
          recentFeedback,
          topCandidates,
        });
      } catch (error) {
        console.error('Error loading feedback stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading };
}
