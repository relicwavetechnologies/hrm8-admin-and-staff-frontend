import type { InterviewMode, AvailableSlot } from './aiReferenceCheck';

export interface RefereeDetails {
  id: string;
  candidateId: string;
  backgroundCheckId: string;
  name: string;
  email: string;
  phone?: string;
  relationship: 'manager' | 'colleague' | 'direct-report' | 'client' | 'other';
  relationshipDetails?: string;
  companyName?: string;
  position?: string;
  status: 'pending' | 'invited' | 'opened' | 'in-progress' | 'completed' | 'overdue';
  token: string;
  invitedDate?: string;
  lastReminderDate?: string;
  completedDate?: string;
  response?: ReferenceResponse;
  // AI Reference Check fields
  preferredMode?: InterviewMode;
  aiSessionId?: string;
  timezone?: string;
  availableSlots?: AvailableSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  category: 'general' | 'leadership' | 'technical' | 'sales' | 'quick';
  questions: QuestionnaireQuestion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireQuestion {
  id: string;
  type: 'rating' | 'yes-no' | 'text' | 'textarea';
  question: string;
  required: boolean;
  ratingScale?: {
    min: number;
    max: number;
    labels?: string[];
  };
  placeholder?: string;
  maxLength?: number;
  order: number;
}

export interface ReferenceResponse {
  refereeId: string;
  questionnaireTemplateId: string;
  answers: QuestionAnswer[];
  overallRating?: number;
  submittedAt: string;
  ipAddress?: string;
  completionTime?: number;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  value: string | number | boolean;
  type: 'rating' | 'yes-no' | 'text' | 'textarea';
}
