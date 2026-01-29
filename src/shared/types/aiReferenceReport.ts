export interface AITranscriptionSummary {
  sessionId: string;
  candidateName: string;
  candidateId: string;
  refereeInfo: {
    name: string;
    relationship: string;
    companyName: string;
    yearsKnown?: string;
  };
  sessionDetails: {
    mode: 'video' | 'phone';
    duration: number; // seconds
    completedAt: string;
    questionsAsked: number;
  };
  executiveSummary: string; // AI-generated 2-3 paragraph summary
  keyFindings: {
    strengths: string[];
    concerns: string[];
    neutralObservations: string[];
  };
  categoryBreakdown: {
    category: string;
    score: number; // 1-5
    summary: string;
    evidence: string[]; // quotes from transcript
  }[];
  recommendation: {
    overallScore: number; // 0-100
    hiringRecommendation: 'strongly-recommend' | 'recommend' | 'neutral' | 'concerns' | 'not-recommend';
    confidenceLevel: number; // 0-1
    reasoningSummary: string;
  };
  conversationHighlights: {
    question: string;
    answer: string;
    significance: string;
    timestamp: number;
  }[];
  redFlags: {
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    evidence: string;
  }[];
  verificationItems: {
    claim: string;
    verified: boolean;
    notes: string;
  }[];
  generatedAt: string;
  generatedBy: 'ai' | 'manual';
  lastEditedAt?: string;
  lastEditedBy?: string;
}

export interface EditableReport {
  id: string;
  sessionId: string;
  summary: AITranscriptionSummary;
  editableContent: string; // HTML content from TipTap editor
  version: number;
  status: 'draft' | 'reviewed' | 'finalized';
  createdAt: string;
  updatedAt: string;
}
