export type QuestionType = 
  | 'multiple-choice'
  | 'single-choice'
  | 'true-false'
  | 'text-short'
  | 'text-long'
  | 'coding'
  | 'video-response'
  | 'file-upload';

export type DifficultyLevel = 
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionVersion {
  version: number;
  text: string;
  options?: QuestionOption[];
  updatedBy: string;
  updatedAt: string;
  changeNotes?: string;
}

export interface QuestionUsageStats {
  totalUses: number;
  assessmentCount: number;
  lastUsedDate?: string;
  averageScore?: number;
  passRate?: number;
}

export interface QuestionBankItem {
  id: string;
  text: string;
  type: QuestionType;
  category: string[];
  difficulty: DifficultyLevel;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number; // seconds
  isActive: boolean;
  version: number;
  versionHistory: QuestionVersion[];
  usageStats: QuestionUsageStats;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  instructions?: string;
}
