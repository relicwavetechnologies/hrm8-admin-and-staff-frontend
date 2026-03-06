import { mockServiceProjects } from '@/shared/data/mockRecruitmentServices';
import type { ServiceProject, ServiceType, ServiceStatus, ServiceStats } from '@/shared/types/recruitmentService';

const STORAGE_KEY = 'service_projects';
const STORAGE_VERSION_KEY = 'service_projects_version';
const CURRENT_VERSION = 5; // Added RPO-specific fields and service_10 example

export function getAllServiceProjects(): ServiceProject[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const version = localStorage.getItem(STORAGE_VERSION_KEY);
  
  // Reset if no version or version mismatch (forces reload with correct pricing)
  if (!version || parseInt(version) !== CURRENT_VERSION) {
    console.log('Service projects storage version mismatch - resetting to latest data');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockServiceProjects));
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
    return mockServiceProjects;
  }
  
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockServiceProjects));
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
    return mockServiceProjects;
  }
  
  return JSON.parse(stored);
}

export function getServiceProjectById(id: string): ServiceProject | undefined {
  const all = getAllServiceProjects();
  return all.find(p => p.id === id);
}

export function createServiceProject(data: Partial<ServiceProject>): ServiceProject {
  const all = getAllServiceProjects();
  const newProject: ServiceProject = {
    id: `service_${Date.now()}`,
    name: data.name || 'New Service Project',
    serviceType: data.serviceType || 'shortlisting',
    status: data.status || 'active',
    priority: data.priority || 'medium',
    stage: data.stage || 'initiated',
    clientId: data.clientId || '',
    clientName: data.clientName || '',
    location: data.location || '',
    country: data.country || '',
    consultants: data.consultants || [],
    progress: data.progress || 0,
    candidatesShortlisted: data.candidatesShortlisted || 0,
    candidatesInterviewed: data.candidatesInterviewed || 0,
    numberOfVacancies: data.numberOfVacancies || 1,
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    jobPaymentId: data.jobPaymentId,
    projectValue: data.projectValue || 0,
    upfrontPaid: data.upfrontPaid || 0,
    balanceDue: data.balanceDue || 0,
    currency: data.currency || 'USD',
    startDate: data.startDate || new Date().toISOString(),
    deadline: data.deadline || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  };
  all.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  return newProject;
}

export function updateServiceProject(id: string, updates: Partial<ServiceProject>): ServiceProject | null {
  const all = getAllServiceProjects();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  return all[index];
}

export function deleteServiceProject(id: string): boolean {
  const all = getAllServiceProjects();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  return true;
}

export function getServiceProjectsByType(type: ServiceType): ServiceProject[] {
  return getAllServiceProjects().filter(p => p.serviceType === type);
}

export function getServiceProjectsByStatus(status: ServiceStatus): ServiceProject[] {
  return getAllServiceProjects().filter(p => p.status === status);
}

export function getServiceProjectsByConsultant(consultantId: string): ServiceProject[] {
  return getAllServiceProjects().filter(p => 
    p.consultants.some(c => c.id === consultantId)
  );
}

export function getServiceProjectsByClient(clientId: string): ServiceProject[] {
  return getAllServiceProjects().filter(p => p.clientId === clientId);
}

export function getServiceStats(): ServiceStats {
  const all = getAllServiceProjects();
  const active = all.filter(p => p.status === 'active');
  
  const totalRevenue = active.reduce((sum, p) => sum + p.projectValue, 0);
  const avgSuccessRate = active.length > 0
    ? active.reduce((sum, p) => sum + p.progress, 0) / active.length / 100
    : 0;
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = all.filter(p => 
    p.status === 'completed' && 
    p.completedDate && 
    new Date(p.completedDate) >= firstDayOfMonth
  ).length;
  
  return {
    totalActive: active.length,
    byType: {
      shortlisting: all.filter(p => p.serviceType === 'shortlisting' && p.status === 'active').length,
      fullService: all.filter(p => p.serviceType === 'full-service' && p.status === 'active').length,
      executiveSearch: all.filter(p => p.serviceType === 'executive-search' && p.status === 'active').length,
      rpo: all.filter(p => p.serviceType === 'rpo' && p.status === 'active').length
    },
    totalRevenue,
    avgSuccessRate,
    completedThisMonth
  };
}
