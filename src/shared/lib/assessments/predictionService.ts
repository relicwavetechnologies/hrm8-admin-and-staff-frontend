import { Assessment } from '@/shared/types/assessment';
import {
  AssessmentPrediction,
  SuccessLikelihood,
  PredictionConfidence,
  RiskFactor,
  SuccessIndicator,
  RiskLevel,
} from '@/shared/types/assessmentPrediction';

/**
 * Mock prediction service that generates predictions based on assessment data
 * In production, this would call ML models trained on historical hiring outcomes
 */

function calculateSuccessLikelihood(score: number): SuccessLikelihood {
  if (score >= 85) return 'very-likely';
  if (score >= 70) return 'likely';
  if (score >= 55) return 'neutral';
  if (score >= 40) return 'unlikely';
  return 'very-unlikely';
}

function calculateConfidence(
  score: number,
  sampleSize: number,
  completedDate?: string
): { confidence: number; level: PredictionConfidence } {
  let baseConfidence = 50;

  // Score reliability factor
  if (score >= 80 || score <= 40) baseConfidence += 15; // Clear signals
  else if (score >= 60 && score <= 75) baseConfidence += 5; // Moderate signals

  // Sample size factor
  if (sampleSize >= 100) baseConfidence += 20;
  else if (sampleSize >= 50) baseConfidence += 10;
  else if (sampleSize >= 20) baseConfidence += 5;

  // Recency factor
  if (completedDate) {
    const daysSince = Math.floor(
      (Date.now() - new Date(completedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 7) baseConfidence += 10;
    else if (daysSince <= 30) baseConfidence += 5;
  }

  const confidence = Math.min(Math.max(baseConfidence, 0), 100);

  let level: PredictionConfidence;
  if (confidence >= 80) level = 'very-high';
  else if (confidence >= 65) level = 'high';
  else if (confidence >= 45) level = 'medium';
  else if (confidence >= 25) level = 'low';
  else level = 'very-low';

  return { confidence, level };
}

function generateRiskFactors(assessment: Assessment): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const score = assessment.overallScore || 0;

  // Score-based risks
  if (score < 50) {
    factors.push({
      id: 'low-score',
      category: 'score',
      severity: 'high',
      description: 'Below average assessment performance',
      impact: 'May struggle with core job responsibilities and require extended training',
      mitigation: 'Consider additional skills assessment or structured onboarding plan',
    });
  } else if (score < 65) {
    factors.push({
      id: 'moderate-score',
      category: 'score',
      severity: 'medium',
      description: 'Moderate assessment performance',
      impact: 'May need additional support in certain areas',
      mitigation: 'Identify specific weakness areas for targeted development',
    });
  }

  // Time-based risks
  if (assessment.result?.timeSpent) {
    if (assessment.result.timeSpent > 90) {
      factors.push({
        id: 'slow-completion',
        category: 'time',
        severity: 'medium',
        description: 'Took longer than average to complete assessment',
        impact: 'May indicate slower decision-making or processing speed',
        mitigation: 'Evaluate if role requires time-sensitive decisions',
      });
    }
  }

  // Category-specific risks
  if (assessment.result?.details?.weaknesses?.length) {
    const weaknesses = assessment.result.details.weaknesses;
    if (weaknesses.length >= 3) {
      factors.push({
        id: 'multiple-weaknesses',
        category: 'technical',
        severity: 'medium',
        description: `Multiple areas of weakness identified: ${weaknesses.slice(0, 2).join(', ')}`,
        impact: 'May require comprehensive training across multiple competencies',
        mitigation: 'Create detailed skill development plan with measurable milestones',
      });
    }
  }

  return factors;
}

function generateSuccessIndicators(assessment: Assessment): SuccessIndicator[] {
  const indicators: SuccessIndicator[] = [];
  const score = assessment.overallScore || 0;

  // Score-based indicators
  if (score >= 85) {
    indicators.push({
      id: 'high-score',
      category: 'strength',
      description: 'Exceptional assessment performance',
      confidence: 'very-high',
      supportingData: `Scored in top 15% of all candidates (${score}/100)`,
    });
  } else if (score >= 70) {
    indicators.push({
      id: 'good-score',
      category: 'strength',
      description: 'Strong assessment performance',
      confidence: 'high',
      supportingData: `Above average score indicates solid competency (${score}/100)`,
    });
  }

  // Strength-based indicators
  if (assessment.result?.details?.strengths?.length) {
    const strengths = assessment.result.details.strengths;
    if (strengths.length >= 3) {
      indicators.push({
        id: 'multiple-strengths',
        category: 'strength',
        description: `Multiple core strengths identified: ${strengths.slice(0, 2).join(', ')}`,
        confidence: 'high',
        supportingData: `${strengths.length} areas of excellence demonstrated`,
      });
    }
  }

  // Time efficiency
  if (assessment.result?.timeSpent && assessment.result.timeSpent < 45) {
    indicators.push({
      id: 'efficient-completion',
      category: 'strength',
      description: 'Efficient problem-solving and decision-making',
      confidence: 'medium',
      supportingData: `Completed assessment faster than average while maintaining quality`,
    });
  }

  // Pass status
  if (assessment.passed) {
    indicators.push({
      id: 'passed-threshold',
      category: 'strength',
      description: 'Exceeded minimum qualification threshold',
      confidence: 'high',
      supportingData: `Score of ${score} exceeds pass threshold of ${assessment.passThreshold}`,
    });
  }

  return indicators;
}

function generateRecommendations(
  assessment: Assessment,
  likelihood: SuccessLikelihood,
  riskFactors: RiskFactor[]
): string[] {
  const recommendations: string[] = [];
  const score = assessment.overallScore || 0;

  if (likelihood === 'very-likely' || likelihood === 'likely') {
    recommendations.push('Strong candidate - recommend proceeding to next interview stage');
    recommendations.push('Consider for fast-track hiring process');
    if (score >= 90) {
      recommendations.push('Exceptional fit - prioritize and move quickly to prevent loss to competitors');
    }
  } else if (likelihood === 'neutral') {
    recommendations.push('Proceed with additional evaluation - schedule behavioral interview');
    recommendations.push('Request work samples or practical assessments to validate skills');
    recommendations.push('Consider fit for alternative roles if current role is not ideal');
  } else {
    recommendations.push('High risk candidate - recommend additional screening before proceeding');
    if (riskFactors.length >= 2) {
      recommendations.push('Multiple risk factors identified - consider alternative candidates');
    }
  }

  // Specific recommendations based on risk factors
  const hasLowScore = riskFactors.some(r => r.id === 'low-score');
  if (hasLowScore) {
    recommendations.push('If proceeding, plan for extended onboarding and skill development');
  }

  const hasWeaknesses = riskFactors.some(r => r.id === 'multiple-weaknesses');
  if (hasWeaknesses) {
    recommendations.push('Create targeted training plan to address specific weakness areas');
  }

  return recommendations;
}

export function generatePrediction(assessment: Assessment): AssessmentPrediction {
  const score = assessment.overallScore || 0;
  const sampleSize = 127; // Mock historical data sample size
  
  const successLikelihood = calculateSuccessLikelihood(score);
  const { confidence, level: predictionConfidence } = calculateConfidence(
    score,
    sampleSize,
    assessment.completedDate
  );

  const riskFactors = generateRiskFactors(assessment);
  const successIndicators = generateSuccessIndicators(assessment);
  const recommendations = generateRecommendations(assessment, successLikelihood, riskFactors);

  // Calculate metrics based on score
  const hiringSuccessRate = Math.min(Math.max(40 + (score - 50) * 0.8, 30), 95);
  const retentionProbability = Math.min(Math.max(50 + (score - 50) * 0.7, 40), 92);
  const expectedPerformanceRating = Math.min(Math.max(2.5 + (score - 50) * 0.04, 2.0), 5.0);
  const timeToProductivity = Math.max(30, 120 - score);
  const culturalFitScore = Math.min(Math.max(45 + (score - 50) * 0.9, 35), 95);

  return {
    assessmentId: assessment.id,
    candidateId: assessment.candidateId,
    candidateName: assessment.candidateName,
    jobTitle: assessment.jobTitle || 'Position',
    overallSuccessLikelihood: successLikelihood,
    confidenceScore: confidence,
    predictionConfidence,
    metrics: {
      hiringSuccessRate,
      retentionProbability,
      expectedPerformanceRating: Math.round(expectedPerformanceRating * 10) / 10,
      timeToProductivity: Math.round(timeToProductivity),
      culturalFitScore: Math.round(culturalFitScore),
    },
    riskFactors,
    successIndicators,
    historicalPattern: {
      scoreRange: { min: Math.max(0, score - 10), max: Math.min(100, score + 10) },
      sampleSize,
      successRate: hiringSuccessRate,
      averageRetention: Math.round(retentionProbability / 100 * 36), // months
      averagePerformanceRating: expectedPerformanceRating,
    },
    recommendations,
    comparisonToAverage: {
      betterThan: Math.round((score / 100) * 85), // percentage
      averageScore: 65,
      candidateScore: score,
    },
    predictedAt: new Date().toISOString(),
    dataQuality: {
      sampleSize,
      dataRecency: 'last 12 months',
      confidence: predictionConfidence,
    },
  };
}

export function getPredictionColor(likelihood: SuccessLikelihood): string {
  const colors = {
    'very-likely': 'text-green-600 dark:text-green-400',
    'likely': 'text-blue-600 dark:text-blue-400',
    'neutral': 'text-yellow-600 dark:text-yellow-400',
    'unlikely': 'text-orange-600 dark:text-orange-400',
    'very-unlikely': 'text-red-600 dark:text-red-400',
  };
  return colors[likelihood];
}

export function getPredictionBgColor(likelihood: SuccessLikelihood): string {
  const colors = {
    'very-likely': 'bg-green-50 dark:bg-green-950/30',
    'likely': 'bg-blue-50 dark:bg-blue-950/30',
    'neutral': 'bg-yellow-50 dark:bg-yellow-950/30',
    'unlikely': 'bg-orange-50 dark:bg-orange-950/30',
    'very-unlikely': 'bg-red-50 dark:bg-red-950/30',
  };
  return colors[likelihood];
}

export function getRiskColor(severity: RiskLevel): string {
  const colors = {
    low: 'text-blue-600 dark:text-blue-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  return colors[severity];
}

export function getConfidenceColor(confidence: PredictionConfidence): string {
  const colors = {
    'very-low': 'text-red-600 dark:text-red-400',
    'low': 'text-orange-600 dark:text-orange-400',
    'medium': 'text-yellow-600 dark:text-yellow-400',
    'high': 'text-blue-600 dark:text-blue-400',
    'very-high': 'text-green-600 dark:text-green-400',
  };
  return colors[confidence];
}
