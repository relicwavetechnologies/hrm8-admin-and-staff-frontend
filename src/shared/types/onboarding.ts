export type ConsultantType = 'employee' | 'contractor';
export type OnboardingStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';
export type ChecklistItemStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';
export type DocumentStatus = 'not-submitted' | 'submitted' | 'approved' | 'rejected' | 'revision-required';
export type TrainingStatus = 'not-started' | 'in-progress' | 'completed' | 'failed';

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  dueDate?: string;
  completedDate?: string;
  completedBy?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'hr' | 'it' | 'training' | 'documentation' | 'admin' | 'compliance';
  dependencies?: string[]; // IDs of items that must be completed first
  order: number;
  notes?: string;
  isRequired: boolean;
  applicableFor: ConsultantType[];
}

export interface OnboardingDocument {
  id: string;
  name: string;
  description: string;
  status: DocumentStatus;
  category: 'identity' | 'tax' | 'contract' | 'banking' | 'compliance' | 'insurance' | 'other';
  fileUrl?: string;
  fileName?: string;
  uploadedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  expiryDate?: string;
  isRequired: boolean;
  applicableFor: ConsultantType[];
  template?: string; // URL to template if available
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'compliance' | 'technical' | 'product' | 'sales' | 'hr-policy' | 'safety' | 'other';
  duration: number; // in minutes
  status: TrainingStatus;
  startedDate?: string;
  completedDate?: string;
  score?: number; // percentage
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  certificateUrl?: string;
  contentUrl?: string;
  isRequired: boolean;
  applicableFor: ConsultantType[];
  order: number;
}

export interface OnboardingWorkflow {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantType: ConsultantType;
  
  // Status & Dates
  status: OnboardingStatus;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  
  // Assigned People
  onboardingCoordinator?: string;
  onboardingCoordinatorName?: string;
  buddy?: string;
  buddyName?: string;
  manager?: string;
  managerName?: string;
  
  // Progress
  checklist: OnboardingChecklistItem[];
  documents: OnboardingDocument[];
  training: TrainingModule[];
  
  // Metrics
  overallProgress: number; // percentage
  checklistProgress: number;
  documentProgress: number;
  trainingProgress: number;
  
  // Special Dates
  firstDayDate?: string;
  orientationDate?: string;
  
  // Notes & Communication
  notes?: string;
  welcomeMessageSent: boolean;
  lastActivityDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  consultantType: ConsultantType;
  defaultDuration: number; // days
  checklistItems: Omit<OnboardingChecklistItem, 'id' | 'status' | 'completedDate' | 'completedBy'>[];
  documents: Omit<OnboardingDocument, 'id' | 'status' | 'uploadedDate' | 'fileUrl' | 'fileName' | 'reviewedBy' | 'reviewedDate'>[];
  training: Omit<TrainingModule, 'id' | 'status' | 'startedDate' | 'completedDate' | 'score' | 'attempts'>[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
