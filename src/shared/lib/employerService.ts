import { mockEmployers } from "@/shared/data/mockTableData";
import type { Employer, Department, Location } from "@/shared/types/entities";

/**
 * Get all employers
 */
export function getEmployers(): Employer[] {
  return mockEmployers;
}

/**
 * Get employer by ID
 */
export function getEmployerById(id: string): Employer | undefined {
  return mockEmployers.find(employer => employer.id === id);
}

/**
 * Create new employer
 */
export function createEmployer(employer: Omit<Employer, 'id' | 'createdAt' | 'updatedAt'>): Employer {
  const newEmployer: Employer = {
    ...employer,
    id: `employer_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEmployers.push(newEmployer);
  return newEmployer;
}

/**
 * Update employer
 */
export function updateEmployer(id: string, updates: Partial<Employer>): Employer | undefined {
  const index = mockEmployers.findIndex(emp => emp.id === id);
  if (index !== -1) {
    mockEmployers[index] = { ...mockEmployers[index], ...updates, updatedAt: new Date().toISOString() };
    return mockEmployers[index];
  }
  return undefined;
}

/**
 * Delete employer
 */
export function deleteEmployer(id: string): boolean {
  const index = mockEmployers.findIndex(emp => emp.id === id);
  if (index !== -1) {
    mockEmployers.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Search employers by name, industry, or location
 */
export function searchEmployers(query: string): Employer[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return mockEmployers;
  }
  
  return mockEmployers.filter(employer => 
    employer.name.toLowerCase().includes(searchTerm) ||
    employer.industry.toLowerCase().includes(searchTerm) ||
    employer.location.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get active employers only
 */
export function getActiveEmployers(): Employer[] {
  return mockEmployers.filter(employer => employer.status === 'active');
}

/**
 * Get department names from structured Department objects
 */
export function getDepartmentNames(departments?: Department[]): string[] {
  if (!departments) return [];
  return departments.map(dept => dept.name);
}

/**
 * Get location names from structured Location objects
 * Format: "San Francisco HQ, San Francisco, CA"
 */
export function getLocationNames(locations?: Location[]): string[] {
  if (!locations) return [];
  return locations.map(loc => {
    const parts = [loc.name];
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    return parts.join(", ");
  });
}

/**
 * Get short location names (just the location name without city/state)
 */
export function getLocationShortNames(locations?: Location[]): string[] {
  if (!locations) return [];
  return locations.map(loc => loc.name);
}

/**
 * Calculate employer metrics for display
 */
export function calculateEmployerMetrics(employer: Employer) {
  const createdDate = new Date(employer.createdAt);
  const today = new Date();
  const daysAsCustomer = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Convert lastActivityDate to Date object
  const lastActivityDate = new Date(employer.lastActivityAt || employer.updatedAt || employer.createdAt);

  return {
    totalRevenue: employer.totalSpent,
    monthlyRevenue: employer.monthlySubscriptionFee || 0,
    totalJobs: employer.totalJobsPosted,
    activeJobs: employer.activeJobs,
    totalUsers: employer.currentUsers,
    activeUsers: employer.currentUsers, // TODO: Calculate actual active users
    lifetimeValue: employer.totalSpent,
    daysAsCustomer,
    lastActivityDate,
    outstandingBalance: employer.outstandingBalance || 0,
  };
}
