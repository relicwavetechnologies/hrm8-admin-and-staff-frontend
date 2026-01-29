export type InterviewStatus = 'scheduled' | 'ready' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type InterviewMode = 'video' | 'phone' | 'text';
export type QuestionSource = 'predefined' | 'ai-generated' | 'hybrid';
export type QuestionCategory = 'technical' | 'behavioral' | 'situational' | 'cultural' | 'experience';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  rationale?: string;
  expectedKeywords?: string[];
  followUpQuestions?: string[];
  order: number;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: 'ai' | 'candidate';
  content: string;
  duration?: number;
}

export interface InterviewAnalysis {
  overallScore: number;
  categoryScores: {
    technical: number;
    communication: number;
    culturalFit: number;
    experience: number;
    problemSolving: number;
  };
  strengths: string[];
  concerns: string[];
  redFlags: string[];
  keyHighlights: Array<{
    quote: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  recommendation: 'strongly-recommend' | 'recommend' | 'maybe' | 'not-recommend';
  confidenceScore: number;
  summary: string;
}

export interface AIInterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  applicationId?: string;
  jobId: string;
  jobTitle: string;
  status: InterviewStatus;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  interviewMode: InterviewMode;
  questionSource: QuestionSource;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  transcript: TranscriptEntry[];
  recordingUrl?: string;
  analysis?: InterviewAnalysis;
  reportId?: string;
  invitationToken: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InterviewInvitation {
  sessionId: string;
  token: string;
  candidateEmail: string;
  expiresAt: string;
  sent: boolean;
  sentAt?: string;
}
