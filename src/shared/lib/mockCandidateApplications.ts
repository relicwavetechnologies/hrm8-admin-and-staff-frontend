export interface CandidateApplication {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  status: 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
  appliedDate: Date;
  lastUpdated: Date;
  notes?: string;
}

const STORAGE_KEY = 'hrm8_candidate_applications';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockApplications));
  }
}

const mockApplications: CandidateApplication[] = [
  {
    id: 'app-1',
    candidateId: '1',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Developer',
    employer: 'Tech Corp',
    status: 'interviewing',
    appliedDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-20'),
  },
  {
    id: 'app-2',
    candidateId: '1',
    jobId: 'job-2',
    jobTitle: 'Full Stack Engineer',
    employer: 'Startup Inc',
    status: 'offer',
    appliedDate: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-25'),
  },
];

export function getCandidateApplications(candidateId: string): CandidateApplication[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data)
    .filter((app: any) => app.candidateId === candidateId)
    .map((app: any) => ({
      ...app,
      appliedDate: new Date(app.appliedDate),
      lastUpdated: new Date(app.lastUpdated),
    }));
}

export function addApplication(application: Omit<CandidateApplication, 'id'>): CandidateApplication {
  initializeStorage();
  const applications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newApp: CandidateApplication = {
    ...application,
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  applications.push(newApp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  return newApp;
}

export function updateApplicationStatus(
  applicationId: string,
  status: CandidateApplication['status'],
  notes?: string
): void {
  initializeStorage();
  const applications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const index = applications.findIndex((app: any) => app.id === applicationId);
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      status,
      notes: notes || applications[index].notes,
      lastUpdated: new Date(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }
}