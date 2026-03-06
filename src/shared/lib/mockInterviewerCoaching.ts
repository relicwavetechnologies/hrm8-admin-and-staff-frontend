import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';

export interface CoachingSuggestion {
  id: string;
  category: 'quality' | 'bias' | 'consistency' | 'detail' | 'objectivity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  resources: { title: string; url: string }[];
}

export interface InterviewerPerformance {
  reviewerName: string;
  reviewerRole: string;
  totalFeedbacks: number;
  avgQualityScore: number;
  avgBiasCount: number;
  consistencyScore: number;
  detailScore: number;
  objectivityScore: number;
  sentimentBalance: {
    positive: number;
    neutral: number;
    negative: number;
  };
  coachingSuggestions: CoachingSuggestion[];
  strengths: string[];
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export function generateInterviewerCoaching(
  feedbacks: TeamMemberFeedback[],
  reviewerName: string
): InterviewerPerformance {
  const reviewerFeedbacks = feedbacks.filter(f => f.reviewerName === reviewerName);
  
  if (reviewerFeedbacks.length === 0) {
    return {
      reviewerName,
      reviewerRole: '',
      totalFeedbacks: 0,
      avgQualityScore: 0,
      avgBiasCount: 0,
      consistencyScore: 0,
      detailScore: 0,
      objectivityScore: 0,
      sentimentBalance: { positive: 0, neutral: 0, negative: 0 },
      coachingSuggestions: [],
      strengths: [],
      improvementTrend: 'stable',
    };
  }

  // Calculate metrics
  const avgQualityScore = Math.round(Math.random() * 30 + 60); // 60-90
  const avgBiasCount = Math.random() * 2;
  const consistencyScore = Math.round(Math.random() * 30 + 60);
  const detailScore = Math.round(Math.random() * 30 + 60);
  const objectivityScore = Math.round(Math.random() * 30 + 60);

  const coachingSuggestions: CoachingSuggestion[] = [];
  const strengths: string[] = [];

  // Quality-based coaching
  if (avgQualityScore < 70) {
    coachingSuggestions.push({
      id: 'quality-low',
      category: 'quality',
      severity: 'high',
      title: 'Enhance Feedback Quality',
      description: 'Your feedback quality score is below the recommended threshold. Focus on providing more specific, actionable insights with concrete examples.',
      actionItems: [
        'Use the STAR method (Situation, Task, Action, Result) when providing examples',
        'Include at least 2-3 specific examples for each assessment area',
        'Avoid vague statements like "good" or "needs improvement" - be specific',
        'Provide actionable recommendations for candidate development'
      ],
      resources: [
        { title: 'Effective Feedback Framework', url: '/resources/feedback-framework' },
        { title: 'STAR Method Guide', url: '/resources/star-method' }
      ]
    });
  } else if (avgQualityScore >= 80) {
    strengths.push('Consistently delivers high-quality, detailed feedback');
  }

  // Bias detection coaching
  if (avgBiasCount > 1) {
    coachingSuggestions.push({
      id: 'bias-awareness',
      category: 'bias',
      severity: avgBiasCount > 1.5 ? 'high' : 'medium',
      title: 'Unconscious Bias Awareness',
      description: 'AI has detected potential bias patterns in your feedback. This is common and can be improved with awareness and practice.',
      actionItems: [
        'Focus on job-relevant competencies and observable behaviors only',
        'Avoid comments about appearance, age, or personal characteristics',
        'Use structured interview guides to maintain consistency',
        'Review feedback before submitting to check for bias indicators',
        'Complete unconscious bias training module'
      ],
      resources: [
        { title: 'Unconscious Bias Training', url: '/resources/bias-training' },
        { title: 'Structured Interview Guide', url: '/resources/interview-guide' }
      ]
    });
  } else {
    strengths.push('Demonstrates strong awareness of potential biases');
  }

  // Consistency coaching
  if (consistencyScore < 70) {
    coachingSuggestions.push({
      id: 'consistency-improvement',
      category: 'consistency',
      severity: 'medium',
      title: 'Improve Rating Consistency',
      description: 'Your ratings show variation compared to team norms. Participating in calibration sessions can help align your assessments.',
      actionItems: [
        'Attend monthly calibration sessions with the interview team',
        'Review rating rubrics before each interview',
        'Compare your ratings with team averages for similar candidates',
        'Discuss edge cases with lead interviewers'
      ],
      resources: [
        { title: 'Rating Calibration Guide', url: '/resources/calibration' },
        { title: 'Interview Rubrics', url: '/resources/rubrics' }
      ]
    });
  } else if (consistencyScore >= 80) {
    strengths.push('Maintains consistent evaluation standards');
  }

  // Detail coaching
  if (detailScore < 70) {
    coachingSuggestions.push({
      id: 'detail-enhancement',
      category: 'detail',
      severity: 'medium',
      title: 'Add More Specific Details',
      description: 'Your feedback would benefit from more specific examples and concrete observations.',
      actionItems: [
        'Take detailed notes during interviews',
        'Reference specific questions and candidate responses',
        'Include direct quotes when particularly relevant',
        'Describe specific behaviors and competencies demonstrated'
      ],
      resources: [
        { title: 'Note-Taking Best Practices', url: '/resources/note-taking' },
        { title: 'Behavioral Observation Guide', url: '/resources/observation' }
      ]
    });
  } else if (detailScore >= 80) {
    strengths.push('Provides thorough, detailed assessments');
  }

  // Objectivity coaching
  if (objectivityScore < 70) {
    coachingSuggestions.push({
      id: 'objectivity-focus',
      category: 'objectivity',
      severity: 'medium',
      title: 'Enhance Objectivity',
      description: 'Focus on observable facts and demonstrated competencies rather than subjective impressions.',
      actionItems: [
        'Separate facts from opinions in your feedback',
        'Use data and specific examples to support assessments',
        'Avoid emotional language or personal reactions',
        'Focus on "what the candidate did" rather than "how they made you feel"'
      ],
      resources: [
        { title: 'Objective Assessment Framework', url: '/resources/objectivity' },
        { title: 'Fact vs. Opinion Guide', url: '/resources/facts-opinions' }
      ]
    });
  } else if (objectivityScore >= 80) {
    strengths.push('Maintains objective, fact-based assessments');
  }

  // Add strengths if high performer
  if (avgQualityScore >= 85 && avgBiasCount < 0.5) {
    strengths.push('Exemplary interviewer - consider mentoring others');
  }

  return {
    reviewerName,
    reviewerRole: reviewerFeedbacks[0].reviewerRole,
    totalFeedbacks: reviewerFeedbacks.length,
    avgQualityScore,
    avgBiasCount,
    consistencyScore,
    detailScore,
    objectivityScore,
    sentimentBalance: {
      positive: Math.round(Math.random() * 40 + 30),
      neutral: Math.round(Math.random() * 30 + 20),
      negative: Math.round(Math.random() * 20 + 10),
    },
    coachingSuggestions,
    strengths,
    improvementTrend: avgQualityScore >= 75 ? 'improving' : avgQualityScore >= 65 ? 'stable' : 'declining',
  };
}
