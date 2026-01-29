export interface BiasDetection {
  detected: boolean;
  type?: 'gender' | 'age' | 'cultural' | 'appearance' | 'personal';
  severity: 'low' | 'medium' | 'high';
  excerpt: string;
  suggestion: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative' | 'mixed';
  score: number; // -1 to 1
  emotions: {
    confidence: number;
    enthusiasm: number;
    concern: number;
    objectivity: number;
  };
}

export interface SmartSuggestion {
  type: 'improvement' | 'strength' | 'clarification' | 'example';
  title: string;
  suggestion: string;
}

export interface AIFeedbackAnalysis {
  biasDetection: BiasDetection[];
  sentiment: SentimentAnalysis;
  suggestions: SmartSuggestion[];
  summary: string;
  keyPoints: string[];
  confidenceScore: number;
}
