export type QuestionType = 
  | 'multiple-choice'
  | 'rating-scale'
  | 'yes-no'
  | 'short-text'
  | 'long-text'
  | 'numeric'
  | 'date'
  | 'file-upload';

export interface AnswerOption {
  id: string;
  text: string;
  score?: number;
}

export interface RatingScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  order: number;
  
  // For multiple choice
  options?: AnswerOption[];
  allowMultiple?: boolean;
  
  // For rating scale
  ratingConfig?: RatingScaleConfig;
  
  // For text questions
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  
  // For numeric
  minValue?: number;
  maxValue?: number;
  
  // Scoring
  scoringEnabled?: boolean;
  maxScore?: number;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: QuestionnaireQuestion[];
  estimatedDuration: number; // minutes
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version: number;
}
