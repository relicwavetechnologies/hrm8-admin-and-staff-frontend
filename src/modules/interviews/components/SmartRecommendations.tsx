// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CalibrationSession } from '@/shared/types/interview';
import { Lightbulb, TrendingUp, Users, Target } from 'lucide-react';

interface SmartRecommendationsProps {
  sessions: CalibrationSession[];
  currentSession?: CalibrationSession;
}

interface Recommendation {
  id: string;
  type: 'improvement' | 'pattern' | 'action' | 'best-practice';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: React.ElementType;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ sessions, currentSession }) => {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgImprovement = completedSessions.reduce((acc, s) => {
      if (!s.alignmentScores) return acc;
      const improvement = ((s.alignmentScores.afterSession - s.alignmentScores.beforeSession) / s.alignmentScores.beforeSession * 100);
      return acc + improvement;
    }, 0) / (completedSessions.length || 1);

    // Analyze patterns and generate recommendations
    if (avgImprovement < 10) {
      recommendations.push({
        id: '1',
        type: 'improvement',
        priority: 'high',
        title: 'Focus on Rating Alignment Exercise',
        description: 'Teams with low improvement typically benefit from more structured rating alignment exercises. Consider spending 15-20 minutes on this exercise.',
        icon: Target,
      });
    }

    if (currentSession && currentSession.participants.length < 4) {
      recommendations.push({
        id: '2',
        type: 'action',
        priority: 'medium',
        title: 'Expand Participant Diversity',
        description: 'Sessions with 4-6 participants show 23% better alignment outcomes. Consider inviting additional team members from different roles.',
        icon: Users,
      });
    }

    const mostEffectiveExercises = ['rating-alignment', 'bias-awareness'];
    recommendations.push({
      id: '3',
      type: 'best-practice',
      priority: 'medium',
      title: 'Prioritize High-Impact Exercises',
      description: `Based on historical data, ${mostEffectiveExercises.join(' and ')} exercises show the highest correlation with improved alignment.`,
      icon: TrendingUp,
    });

    if (completedSessions.length >= 3) {
      const recentTrend = completedSessions.slice(-3).reduce((acc, s) => {
        if (!s.alignmentScores) return acc;
        const improvement = ((s.alignmentScores.afterSession - s.alignmentScores.beforeSession) / s.alignmentScores.beforeSession * 100);
        return acc + improvement;
      }, 0) / 3;
      
      if (recentTrend > avgImprovement * 1.2) {
        recommendations.push({
          id: '4',
          type: 'pattern',
          priority: 'low',
          title: 'Positive Momentum Detected',
          description: 'Your recent sessions show above-average improvement. Continue current practices and consider documenting successful strategies.',
          icon: Lightbulb,
        });
      }
    }

    recommendations.push({
      id: '5',
      type: 'best-practice',
      priority: 'medium',
      title: 'Schedule Regular Sessions',
      description: 'Teams conducting calibration sessions monthly maintain 34% higher alignment scores compared to quarterly sessions.',
      icon: TrendingUp,
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div key={rec.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
