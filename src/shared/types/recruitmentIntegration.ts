export interface CandidateToEmployee {
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  serviceProjectId?: string;
  status: 'offer-accepted' | 'onboarding' | 'hired' | 'declined';
  offerDate: string;
  startDate: string;
  employeeId?: string;
  onboardingProgress: number; // 0-100
  onboardingTasks: OnboardingTask[];
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'equipment' | 'training' | 'access' | 'orientation';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  dueDate: string;
  completedDate?: string;
}

export interface HiringPipeline {
  jobId: string;
  jobTitle: string;
  department: string;
  candidatesApplied: number;
  candidatesScreened: number;
  candidatesInterviewed: number;
  candidatesOffered: number;
  candidatesHired: number;
  avgTimeToHire: number; // days
  costPerHire: number;
}

export interface RecruitmentROI {
  serviceProjectId: string;
  projectName: string;
  serviceType: string;
  serviceFee: number;
  candidatesPlaced: number;
  averageRetention: number; // months
  costPerPlacement: number;
  timeToFill: number; // days
  clientSatisfaction: number; // 1-5
  roi: number; // percentage
}
