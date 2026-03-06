import type { CandidateToEmployee, HiringPipeline, RecruitmentROI } from '@/shared/types/recruitmentIntegration';

export const mockCandidatesToEmployees: CandidateToEmployee[] = [
  {
    candidateId: 'c1',
    candidateName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0123',
    jobId: 'j1',
    jobTitle: 'Senior Software Engineer',
    serviceProjectId: 'sp1',
    status: 'onboarding',
    offerDate: '2024-03-01',
    startDate: '2024-03-15',
    onboardingProgress: 65,
    onboardingTasks: [
      {
        id: 't1',
        title: 'Complete I-9 Form',
        description: 'Submit employment eligibility verification',
        category: 'documentation',
        status: 'completed',
        dueDate: '2024-03-14',
        completedDate: '2024-03-13'
      },
      {
        id: 't2',
        title: 'IT Equipment Setup',
        description: 'Laptop, monitor, and access credentials',
        category: 'equipment',
        status: 'completed',
        assignedTo: 'IT Department',
        dueDate: '2024-03-15',
        completedDate: '2024-03-15'
      },
      {
        id: 't3',
        title: 'Department Orientation',
        description: 'Meet team and review project roadmap',
        category: 'orientation',
        status: 'in-progress',
        assignedTo: 'Engineering Manager',
        dueDate: '2024-03-20'
      }
    ]
  },
  {
    candidateId: 'c2',
    candidateName: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1-555-0124',
    jobId: 'j2',
    jobTitle: 'Product Manager',
    status: 'offer-accepted',
    offerDate: '2024-03-10',
    startDate: '2024-04-01',
    onboardingProgress: 20,
    onboardingTasks: [
      {
        id: 't4',
        title: 'Sign Offer Letter',
        description: 'Review and sign employment offer',
        category: 'documentation',
        status: 'completed',
        dueDate: '2024-03-12',
        completedDate: '2024-03-11'
      },
      {
        id: 't5',
        title: 'Background Check',
        description: 'Complete background verification',
        category: 'documentation',
        status: 'in-progress',
        dueDate: '2024-03-25'
      }
    ]
  }
];

export const mockHiringPipelines: HiringPipeline[] = [
  {
    jobId: 'j1',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    candidatesApplied: 156,
    candidatesScreened: 42,
    candidatesInterviewed: 18,
    candidatesOffered: 3,
    candidatesHired: 1,
    avgTimeToHire: 32,
    costPerHire: 5200
  },
  {
    jobId: 'j2',
    jobTitle: 'Product Manager',
    department: 'Product',
    candidatesApplied: 89,
    candidatesScreened: 28,
    candidatesInterviewed: 12,
    candidatesOffered: 2,
    candidatesHired: 1,
    avgTimeToHire: 28,
    costPerHire: 4800
  }
];

export const mockRecruitmentROI: RecruitmentROI[] = [
  {
    serviceProjectId: 'sp1',
    projectName: 'Engineering Team Expansion Q1',
    serviceType: 'full-service',
    serviceFee: 45000,
    candidatesPlaced: 3,
    averageRetention: 18,
    costPerPlacement: 15000,
    timeToFill: 28,
    clientSatisfaction: 4.5,
    roi: 285
  },
  {
    serviceProjectId: 'sp2',
    projectName: 'Sales Leadership Search',
    serviceType: 'executive-search',
    serviceFee: 65000,
    candidatesPlaced: 1,
    averageRetention: 24,
    costPerPlacement: 65000,
    timeToFill: 45,
    clientSatisfaction: 5.0,
    roi: 320
  }
];

export function getCandidatesToEmployees(): CandidateToEmployee[] {
  return mockCandidatesToEmployees;
}

export function getHiringPipelines(): HiringPipeline[] {
  return mockHiringPipelines;
}

export function getRecruitmentROI(): RecruitmentROI[] {
  return mockRecruitmentROI;
}
