export type PredictionConfidence = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type SuccessLikelihood = 'very-unlikely' | 'unlikely' | 'neutral' | 'likely' | 'very-likely';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HistoricalPattern {
  scoreRange: { min: number; max: number };
  sampleSize: number;
  successRate: number;
  averageRetention: number; // months
  averagePerformanceRating: number; // 1-5
}

export interface RiskFactor {
  id: string;
  category: 'score' | 'time' | 'behavioral' | 'cultural' | 'technical';
  severity: RiskLevel;
  description: string;
  impact: string;
  mitigation?: string;
}

export interface SuccessIndicator {
  id: string;
  category: 'strength' | 'opportunity';
  description: string;
  confidence: PredictionConfidence;
  supportingData: string;
}

export interface PredictionMetrics {
  hiringSuccessRate: number; // percentage
  retentionProbability: number; // percentage
  expectedPerformanceRating: number; // 1-5
  timeToProductivity: number; // days
  culturalFitScore: number; // 0-100
}

export interface AssessmentPrediction {
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  overallSuccessLikelihood: SuccessLikelihood;
  confidenceScore: number; // 0-100
  predictionConfidence: PredictionConfidence;
  metrics: PredictionMetrics;
  riskFactors: RiskFactor[];
  successIndicators: SuccessIndicator[];
  historicalPattern: HistoricalPattern;
  recommendations: string[];
  comparisonToAverage: {
    betterThan: number; // percentage of candidates
    averageScore: number;
    candidateScore: number;
  };
  predictedAt: string;
  dataQuality: {
    sampleSize: number;
    dataRecency: string; // e.g., "last 12 months"
    confidence: PredictionConfidence;
  };
}
