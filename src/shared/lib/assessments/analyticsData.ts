export interface PerformanceTrend {
  month: string;
  averageScore: number;
  passRate: number;
  completionRate: number;
  totalAssessments: number;
}

export interface QuestionDifficulty {
  questionId: string;
  questionText: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timesUsed: number;
  averageScore: number;
  averageTime: number; // seconds
  passRate: number;
  actualDifficulty: number; // 1-10 scale based on performance
}

export interface TimeMetrics {
  assessmentType: string;
  averageTime: number; // minutes
  medianTime: number;
  minTime: number;
  maxTime: number;
  completionRate: number;
}

export interface ProviderEffectiveness {
  provider: string;
  assessmentCount: number;
  averageScore: number;
  passRate: number;
  candidateSatisfaction: number; // 1-5
  costPerAssessment: number;
  averageCompletionTime: number; // minutes
  technicalIssues: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface CategoryPerformance {
  category: string;
  averageScore: number;
  questionsCount: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock data
export const performanceTrends: PerformanceTrend[] = [
  { month: 'Jan', averageScore: 72, passRate: 65, completionRate: 88, totalAssessments: 145 },
  { month: 'Feb', averageScore: 74, passRate: 68, completionRate: 90, totalAssessments: 168 },
  { month: 'Mar', averageScore: 76, passRate: 70, completionRate: 92, totalAssessments: 189 },
  { month: 'Apr', averageScore: 75, passRate: 69, completionRate: 91, totalAssessments: 201 },
  { month: 'May', averageScore: 78, passRate: 73, completionRate: 93, totalAssessments: 223 },
  { month: 'Jun', averageScore: 80, passRate: 75, completionRate: 94, totalAssessments: 245 },
];

export const questionDifficulties: QuestionDifficulty[] = [
  {
    questionId: 'q1',
    questionText: 'What is the time complexity of binary search?',
    category: 'Algorithms',
    difficulty: 'medium',
    timesUsed: 245,
    averageScore: 75,
    averageTime: 98,
    passRate: 68,
    actualDifficulty: 5.2,
  },
  {
    questionId: 'q2',
    questionText: 'Explain the difference between TCP and UDP',
    category: 'Networking',
    difficulty: 'medium',
    timesUsed: 189,
    averageScore: 62,
    averageTime: 156,
    passRate: 54,
    actualDifficulty: 6.8,
  },
  {
    questionId: 'q3',
    questionText: 'Write a function to reverse a string',
    category: 'Programming',
    difficulty: 'easy',
    timesUsed: 312,
    averageScore: 85,
    averageTime: 78,
    passRate: 82,
    actualDifficulty: 3.1,
  },
  {
    questionId: 'q4',
    questionText: 'Implement a LRU cache from scratch',
    category: 'Data Structures',
    difficulty: 'hard',
    timesUsed: 123,
    averageScore: 48,
    averageTime: 425,
    passRate: 38,
    actualDifficulty: 8.7,
  },
  {
    questionId: 'q5',
    questionText: 'Describe Agile methodology principles',
    category: 'Project Management',
    difficulty: 'medium',
    timesUsed: 267,
    averageScore: 71,
    averageTime: 134,
    passRate: 65,
    actualDifficulty: 5.5,
  },
];

export const timeMetrics: TimeMetrics[] = [
  {
    assessmentType: 'Cognitive',
    averageTime: 28,
    medianTime: 25,
    minTime: 15,
    maxTime: 45,
    completionRate: 92,
  },
  {
    assessmentType: 'Technical Skills',
    averageTime: 52,
    medianTime: 48,
    minTime: 30,
    maxTime: 90,
    completionRate: 87,
  },
  {
    assessmentType: 'Personality',
    averageTime: 18,
    medianTime: 16,
    minTime: 12,
    maxTime: 30,
    completionRate: 95,
  },
  {
    assessmentType: 'Situational Judgment',
    averageTime: 35,
    medianTime: 32,
    minTime: 20,
    maxTime: 55,
    completionRate: 89,
  },
];

export const providerEffectiveness: ProviderEffectiveness[] = [
  {
    provider: 'TestGorilla',
    assessmentCount: 342,
    averageScore: 74,
    passRate: 68,
    candidateSatisfaction: 4.2,
    costPerAssessment: 69,
    averageCompletionTime: 32,
    technicalIssues: 5,
  },
  {
    provider: 'Vervoe',
    assessmentCount: 289,
    averageScore: 76,
    passRate: 71,
    candidateSatisfaction: 4.5,
    costPerAssessment: 89,
    averageCompletionTime: 38,
    technicalIssues: 3,
  },
  {
    provider: 'Criteria Corp',
    assessmentCount: 256,
    averageScore: 72,
    passRate: 66,
    candidateSatisfaction: 4.0,
    costPerAssessment: 59,
    averageCompletionTime: 28,
    technicalIssues: 8,
  },
  {
    provider: 'HRM8 Internal',
    assessmentCount: 198,
    averageScore: 78,
    passRate: 73,
    candidateSatisfaction: 4.6,
    costPerAssessment: 0,
    averageCompletionTime: 30,
    technicalIssues: 2,
  },
];

export const scoreDistribution: ScoreDistribution[] = [
  { range: '0-20', count: 12, percentage: 3 },
  { range: '21-40', count: 28, percentage: 7 },
  { range: '41-60', count: 89, percentage: 22 },
  { range: '61-80', count: 176, percentage: 44 },
  { range: '81-100', count: 95, percentage: 24 },
];

export const categoryPerformance: CategoryPerformance[] = [
  {
    category: 'Algorithms',
    averageScore: 75,
    questionsCount: 45,
    passRate: 68,
    trend: 'up',
  },
  {
    category: 'Programming',
    averageScore: 82,
    questionsCount: 67,
    passRate: 78,
    trend: 'up',
  },
  {
    category: 'Data Structures',
    averageScore: 69,
    questionsCount: 38,
    passRate: 62,
    trend: 'stable',
  },
  {
    category: 'System Design',
    averageScore: 64,
    questionsCount: 29,
    passRate: 55,
    trend: 'down',
  },
  {
    category: 'Soft Skills',
    averageScore: 79,
    questionsCount: 52,
    passRate: 74,
    trend: 'up',
  },
  {
    category: 'Project Management',
    averageScore: 73,
    questionsCount: 41,
    passRate: 67,
    trend: 'stable',
  },
];

export function getAnalyticsSummary() {
  const totalAssessments = performanceTrends.reduce(
    (sum, trend) => sum + trend.totalAssessments,
    0
  );
  const averageScore =
    performanceTrends.reduce((sum, trend) => sum + trend.averageScore, 0) /
    performanceTrends.length;
  const averagePassRate =
    performanceTrends.reduce((sum, trend) => sum + trend.passRate, 0) /
    performanceTrends.length;
  const averageCompletionRate =
    performanceTrends.reduce((sum, trend) => sum + trend.completionRate, 0) /
    performanceTrends.length;

  return {
    totalAssessments,
    averageScore: Math.round(averageScore),
    averagePassRate: Math.round(averagePassRate),
    averageCompletionRate: Math.round(averageCompletionRate),
  };
}
