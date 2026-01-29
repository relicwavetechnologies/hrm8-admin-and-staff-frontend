import type { Application, ApplicationStatus, ApplicationStage } from '@/shared/types/application';
import { mockApplicationsData } from '@/shared/data/mockApplicationsData';

const STORAGE_KEY = 'hrm8_applications';

// Initialize storage with mock data if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockApplicationsData));
  }
}

// Deserialize dates
function deserializeApplication(data: any): Application {
  return {
    ...data,
    appliedDate: new Date(data.appliedDate),
    rejectionDate: data.rejectionDate ? new Date(data.rejectionDate) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    activities: data.activities.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
    })),
    interviews: data.interviews.map((i: any) => ({
      ...i,
      scheduledDate: new Date(i.scheduledDate),
    })),
    notes: data.notes.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    })),
  };
}

export function getApplications(): Application[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data).map(deserializeApplication);
}

export function getApplicationById(id: string): Application | undefined {
  const applications = getApplications();
  return applications.find(a => a.id === id);
}

export function getApplicationsByCandidate(candidateId: string): Application[] {
  const applications = getApplications();
  return applications.filter(a => a.candidateId === candidateId);
}

export function getApplicationsByJob(jobId: string): Application[] {
  const applications = getApplications();
  return applications.filter(a => a.jobId === jobId);
}

export function saveApplication(application: Application): void {
  const applications = getApplications();
  const newApplication = {
    ...application,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  applications.push(newApplication);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export function updateApplication(id: string, updates: Partial<Application>): void {
  const applications = getApplications();
  const index = applications.findIndex(a => a.id === id);
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      ...updates,
      updatedAt: new Date(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }
}

export function updateApplicationStatus(id: string, status: ApplicationStatus, stage?: ApplicationStage): void {
  const applications = getApplications();
  const index = applications.findIndex(a => a.id === id);
  if (index !== -1) {
    const application = applications[index];
    application.status = status;
    if (stage) {
      application.stage = stage;
    }
    application.updatedAt = new Date();
    
    // Add activity
    application.activities.push({
      id: `activity-${Date.now()}`,
      type: 'status_change',
      description: `Status changed to ${status}${stage ? ` (${stage})` : ''}`,
      createdAt: new Date(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }
}

export function deleteApplication(id: string): void {
  const applications = getApplications();
  const filtered = applications.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function searchApplications(query?: string, filters?: {
  status?: ApplicationStatus[];
  stage?: ApplicationStage[];
  jobId?: string;
  candidateId?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
}): Application[] {
  let applications = getApplications();

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase();
    applications = applications.filter(a =>
      a.candidateName.toLowerCase().includes(lowerQuery) ||
      a.candidateEmail.toLowerCase().includes(lowerQuery) ||
      a.jobTitle.toLowerCase().includes(lowerQuery) ||
      a.employerName.toLowerCase().includes(lowerQuery)
    );
  }

  // Filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      applications = applications.filter(a => filters.status!.includes(a.status));
    }
    if (filters.stage && filters.stage.length > 0) {
      applications = applications.filter(a => filters.stage!.includes(a.stage));
    }
    if (filters.jobId) {
      applications = applications.filter(a => a.jobId === filters.jobId);
    }
    if (filters.candidateId) {
      applications = applications.filter(a => a.candidateId === filters.candidateId);
    }
    if (filters.assignedTo) {
      applications = applications.filter(a => a.assignedTo === filters.assignedTo);
    }
    if (filters.dateFrom) {
      applications = applications.filter(a => a.appliedDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      applications = applications.filter(a => a.appliedDate <= filters.dateTo!);
    }
    if (filters.minScore !== undefined) {
      applications = applications.filter(a => a.score && a.score >= filters.minScore!);
    }
    if (filters.maxScore !== undefined) {
      applications = applications.filter(a => a.score && a.score <= filters.maxScore!);
    }
  }

  return applications;
}

export function clearAllApplications(): void {
  localStorage.removeItem(STORAGE_KEY);
}
