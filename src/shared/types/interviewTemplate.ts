export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'cultural' | 'general';
  isRequired: boolean;
  expectedDuration: number; // in minutes
}

export interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage (0-100)
}

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  type: 'phone' | 'video' | 'in-person' | 'panel';
  duration: number; // in minutes
  questions: InterviewQuestion[];
  ratingCriteria: RatingCriteria[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
