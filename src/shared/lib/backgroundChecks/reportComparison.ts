import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

export interface CategoryComparison {
  category: string;
  scores: { refereeName: string; score: number; summary: string }[];
  averageScore: number;
  variance: number;
  consensus: 'high' | 'medium' | 'low';
}

export interface ConsensusArea {
  type: 'strength' | 'concern' | 'observation';
  text: string;
  supportingReferees: string[];
  evidence: string[];
}

export interface DivergentArea {
  category: string;
  refereeViews: { name: string; view: string; score?: number }[];
  divergenceLevel: 'high' | 'medium' | 'low';
}

export interface AggregateRecommendation {
  overallScore: number;
  recommendationDistribution: Record<string, number>;
  majorityRecommendation: string;
  confidenceLevel: number;
  summary: string;
}

export interface ComparisonResult {
  categoryComparisons: CategoryComparison[];
  consensusAreas: ConsensusArea[];
  divergentAreas: DivergentArea[];
  aggregateRecommendation: AggregateRecommendation;
  totalReferees: number;
}

export function compareAIReports(reports: AITranscriptionSummary[]): ComparisonResult {
  if (reports.length === 0) {
    return {
      categoryComparisons: [],
      consensusAreas: [],
      divergentAreas: [],
      aggregateRecommendation: {
        overallScore: 0,
        recommendationDistribution: {},
        majorityRecommendation: 'neutral',
        confidenceLevel: 0,
        summary: 'No reports available for comparison',
      },
      totalReferees: 0,
    };
  }

  const categoryComparisons = analyzeCategoryScores(reports);
  const consensusAreas = findConsensusAreas(reports);
  const divergentAreas = findDivergentAreas(reports, categoryComparisons);
  const aggregateRecommendation = calculateAggregateRecommendation(reports);

  return {
    categoryComparisons,
    consensusAreas,
    divergentAreas,
    aggregateRecommendation,
    totalReferees: reports.length,
  };
}

function analyzeCategoryScores(reports: AITranscriptionSummary[]): CategoryComparison[] {
  const categoryMap = new Map<string, { scores: any[]; summaries: string[] }>();

  reports.forEach((report) => {
    report.categoryBreakdown.forEach((cat) => {
      if (!categoryMap.has(cat.category)) {
        categoryMap.set(cat.category, { scores: [], summaries: [] });
      }
      categoryMap.get(cat.category)!.scores.push({
        refereeName: report.refereeInfo.name,
        score: cat.score,
        summary: cat.summary,
      });
    });
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => {
    const scores = data.scores.map((s) => s.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = calculateVariance(scores);

    let consensus: 'high' | 'medium' | 'low' = 'high';
    if (variance > 1.5) consensus = 'low';
    else if (variance > 0.8) consensus = 'medium';

    return {
      category,
      scores: data.scores,
      averageScore,
      variance,
      consensus,
    };
  });
}

function findConsensusAreas(reports: AITranscriptionSummary[]): ConsensusArea[] {
  const consensusAreas: ConsensusArea[] = [];

  // Find common strengths
  const strengthCounts = new Map<string, { count: number; referees: string[]; evidence: string[] }>();
  reports.forEach((report) => {
    report.keyFindings.strengths.forEach((strength) => {
      const normalized = strength.toLowerCase().trim();
      if (!strengthCounts.has(normalized)) {
        strengthCounts.set(normalized, { count: 0, referees: [], evidence: [] });
      }
      const entry = strengthCounts.get(normalized)!;
      entry.count++;
      entry.referees.push(report.refereeInfo.name);

      // Find evidence from category breakdown
      report.categoryBreakdown.forEach((cat) => {
        cat.evidence.forEach((ev) => {
          if (ev.toLowerCase().includes(normalized.split(' ')[0])) {
            entry.evidence.push(ev);
          }
        });
      });
    });
  });

  strengthCounts.forEach((data, strength) => {
    if (data.count >= Math.ceil(reports.length / 2)) {
      consensusAreas.push({
        type: 'strength',
        text: strength.charAt(0).toUpperCase() + strength.slice(1),
        supportingReferees: data.referees,
        evidence: data.evidence.slice(0, 3),
      });
    }
  });

  // Find common concerns
  const concernCounts = new Map<string, { count: number; referees: string[]; evidence: string[] }>();
  reports.forEach((report) => {
    report.keyFindings.concerns.forEach((concern) => {
      const normalized = concern.toLowerCase().trim();
      if (!concernCounts.has(normalized)) {
        concernCounts.set(normalized, { count: 0, referees: [], evidence: [] });
      }
      const entry = concernCounts.get(normalized)!;
      entry.count++;
      entry.referees.push(report.refereeInfo.name);

      report.categoryBreakdown.forEach((cat) => {
        cat.evidence.forEach((ev) => {
          if (ev.toLowerCase().includes(normalized.split(' ')[0])) {
            entry.evidence.push(ev);
          }
        });
      });
    });
  });

  concernCounts.forEach((data, concern) => {
    if (data.count >= Math.ceil(reports.length / 2)) {
      consensusAreas.push({
        type: 'concern',
        text: concern.charAt(0).toUpperCase() + concern.slice(1),
        supportingReferees: data.referees,
        evidence: data.evidence.slice(0, 3),
      });
    }
  });

  return consensusAreas;
}

function findDivergentAreas(
  _reports: AITranscriptionSummary[],
  categoryComparisons: CategoryComparison[]
): DivergentArea[] {
  const divergentAreas: DivergentArea[] = [];

  // Find categories with low consensus (high variance)
  categoryComparisons.forEach((comp) => {
    if (comp.consensus === 'low') {
      divergentAreas.push({
        category: comp.category,
        refereeViews: comp.scores.map((s) => ({
          name: s.refereeName,
          view: s.summary,
          score: s.score,
        })),
        divergenceLevel: 'high',
      });
    } else if (comp.consensus === 'medium') {
      divergentAreas.push({
        category: comp.category,
        refereeViews: comp.scores.map((s) => ({
          name: s.refereeName,
          view: s.summary,
          score: s.score,
        })),
        divergenceLevel: 'medium',
      });
    }
  });

  return divergentAreas;
}

function calculateAggregateRecommendation(reports: AITranscriptionSummary[]): AggregateRecommendation {
  const scores = reports.map((r) => r.recommendation.overallScore);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const recommendationDistribution: Record<string, number> = {};
  reports.forEach((report) => {
    const rec = report.recommendation.hiringRecommendation;
    recommendationDistribution[rec] = (recommendationDistribution[rec] || 0) + 1;
  });

  const majorityRecommendation = Object.entries(recommendationDistribution).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  const confidenceLevels = reports.map((r) => r.recommendation.confidenceLevel);
  const confidenceLevel = confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length;

  const summary = generateAggregateSummary(overallScore, majorityRecommendation, reports.length);

  return {
    overallScore,
    recommendationDistribution,
    majorityRecommendation,
    confidenceLevel,
    summary,
  };
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function generateAggregateSummary(score: number, recommendation: string, refereeCount: number): string {
  let scoreSummary = '';
  if (score >= 80) scoreSummary = 'consistently excellent';
  else if (score >= 70) scoreSummary = 'generally strong';
  else if (score >= 60) scoreSummary = 'moderately positive';
  else if (score >= 50) scoreSummary = 'mixed';
  else scoreSummary = 'below expectations';

  const recText = recommendation.replace(/-/g, ' ');

  return `Based on ${refereeCount} referee ${refereeCount === 1 ? 'interview' : 'interviews'}, the candidate received ${scoreSummary} feedback with a majority recommendation to ${recText}. Review individual reports and divergent areas for comprehensive assessment.`;
}
