import type { AITranscriptionSummary, EditableReport } from './aiReferenceReport';

export type InterviewMode = 'video' | 'phone' | 'questionnaire';
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type QuestionSource = 'pre-written' | 'ai-derived' | 'template' | 'dynamic';

export interface AIReferenceCheckSession {
  id: string;
  refereeId: string;
  candidateId: string;
  backgroundCheckId: string;
  mode: InterviewMode;
  status: SessionStatus;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in seconds
  questionSource: QuestionSource;
  templateId?: string;
  aiPrompt?: string;
  transcript?: InterviewTranscript;
  recording?: SessionRecording;
  analysis?: AIAnalysis;
  transcriptionSummary?: AITranscriptionSummary;
  report?: EditableReport;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewTranscript {
  sessionId: string;
  turns: TranscriptTurn[];
  summary?: string;
  generatedAt: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'ai-recruiter' | 'referee';
  text: string;
  timestamp: number; // seconds from start
  confidence?: number; // speech recognition confidence
}

export interface SessionRecording {
  sessionId: string;
  videoUrl?: string;
  audioUrl?: string;
  duration: number;
  format: string;
  size: number; // bytes
  uploadedAt: string;
}

export interface AIAnalysis {
  sessionId: string;
  overallRating: number; // 1-5
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  keyInsights: string[];
  strengths: string[];
  concerns: string[];
  recommendationScore: number; // 0-100
  categories: CategoryScore[];
  aiConfidence: number; // 0-1
  generatedAt: string;
}

export interface CategoryScore {
  category: string;
  score: number; // 1-5
  evidence: string[];
}

export interface AIQuestionConfig {
  source: QuestionSource;
  templateId?: string;
  customPrompt?: string;
  focusAreas?: string[];
  adaptiveMode: boolean;
  maxQuestions?: number;
  estimatedDuration?: number; // minutes
}

export interface AvailableSlot {
  start: string; // ISO timestamp
  end: string; // ISO timestamp
}
