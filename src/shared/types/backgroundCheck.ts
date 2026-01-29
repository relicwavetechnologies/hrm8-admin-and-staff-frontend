export type BackgroundCheckType = 
  | 'criminal' 
  | 'employment' 
  | 'education' 
  | 'credit' 
  | 'drug-screen' 
  | 'reference' 
  | 'identity' 
  | 'professional-license';

export interface BackgroundCheckTypeConfig {
  type: BackgroundCheckType;
  required: boolean;
}

export interface BackgroundCheckResult {
  checkType: BackgroundCheckType;
  status: 'clear' | 'review-required' | 'not-clear' | 'pending';
  details?: string;
  documents?: { name: string; url: string }[];
  completedDate?: string;
}

export interface BackgroundCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  offerLetterId?: string;
  jobId?: string;
  jobTitle?: string;
  employerId?: string;
  employerName?: string;
  employerLogo?: string;
  provider: 'checkr' | 'sterling' | 'hireright' | 'manual';
  checkTypes: BackgroundCheckTypeConfig[];
  status: 'not-started' | 'pending-consent' | 'in-progress' | 'completed' | 'issues-found' | 'cancelled';
  initiatedBy: string;
  initiatedByName: string;
  initiatedDate: string;
  completedDate?: string;
  consentGiven: boolean;
  consentDate?: string;
  consentRequestId?: string;
  results: BackgroundCheckResult[];
  overallStatus?: 'clear' | 'conditional' | 'not-clear';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewNotes?: string;
  expiryDate?: string;
  reportUrl?: string;
  cost?: number;
  totalCost?: number;
  costBreakdown?: Array<{ checkType: BackgroundCheckType; cost: number }>;
  referees?: string[];
  questionnaireTemplateId?: string;
  billedTo?: string;
  billedToName?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  country?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}
