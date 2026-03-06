import type { Consultant } from '@/shared/types/consultant';

export interface ConsultantMetrics {
  totalRevenue: number;
  totalPlacements: number;
  successRate: number;
  averageDaysToFill: number;
  activeAssignments: number;
  lifetimeCommissions: number;
  pendingCommissions: number;
  daysEmployed: number;
  lastActivityDate: Date;
  currentMonthPlacements: number;
  currentMonthRevenue: number;
  capacityUtilization: {
    employers: { current: number; max: number; percentage: number };
    jobs: { current: number; max: number; percentage: number };
  };
}

/**
 * Calculate comprehensive consultant metrics
 */
export function calculateConsultantMetrics(consultant: Consultant): ConsultantMetrics {
  const hireDate = new Date(consultant.hireDate);
  const today = new Date();
  const daysEmployed = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const lastActivityDate = new Date(consultant.lastActivityAt || consultant.updatedAt || consultant.createdAt);
  
  // Calculate capacity utilization
  const employersPercentage = consultant.maxEmployers > 0 
    ? (consultant.currentEmployers / consultant.maxEmployers) * 100 
    : 0;
  const jobsPercentage = consultant.maxJobs > 0 
    ? (consultant.currentJobs / consultant.maxJobs) * 100 
    : 0;

  return {
    totalRevenue: consultant.totalRevenue,
    totalPlacements: consultant.totalPlacements,
    successRate: consultant.successRate,
    averageDaysToFill: consultant.averageDaysToFill,
    activeAssignments: consultant.currentEmployers + consultant.currentJobs,
    lifetimeCommissions: consultant.totalCommissionsPaid,
    pendingCommissions: consultant.pendingCommissions,
    daysEmployed,
    lastActivityDate,
    currentMonthPlacements: Math.floor(consultant.totalPlacements / 12), // Mock
    currentMonthRevenue: Math.floor(consultant.totalRevenue / 12), // Mock
    capacityUtilization: {
      employers: {
        current: consultant.currentEmployers,
        max: consultant.maxEmployers,
        percentage: employersPercentage,
      },
      jobs: {
        current: consultant.currentJobs,
        max: consultant.maxJobs,
        percentage: jobsPercentage,
      },
    },
  };
}

/**
 * Get capacity status indicator
 */
export function getCapacityStatus(consultant: Consultant): 'available' | 'near-capacity' | 'at-capacity' {
  const employerCapacity = consultant.maxEmployers > 0 
    ? (consultant.currentEmployers / consultant.maxEmployers) 
    : 0;
  const jobCapacity = consultant.maxJobs > 0 
    ? (consultant.currentJobs / consultant.maxJobs) 
    : 0;
  
  const maxCapacity = Math.max(employerCapacity, jobCapacity);
  
  if (maxCapacity >= 1) return 'at-capacity';
  if (maxCapacity >= 0.8) return 'near-capacity';
  return 'available';
}

/**
 * Format consultant full name
 */
export function formatConsultantName(consultant: Consultant): string {
  return `${consultant.firstName} ${consultant.lastName}`;
}

/**
 * Format employment tenure
 */
export function formatEmploymentTenure(hireDate: string): string {
  const hire = new Date(hireDate);
  const today = new Date();
  const months = Math.floor((today.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Get consultant type label
 */
export function getConsultantTypeLabel(type: Consultant['type']): string {
  const labels = {
    'sales-rep': 'Sales Representative',
    'recruiter': 'Recruiter',
    '360-consultant': '360 Consultant',
    'industry-partner': 'Industry Partner',
  };
  return labels[type] || type;
}

/**
 * Get consultant status color
 */
export function getConsultantStatusColor(status: Consultant['status']): string {
  const colors = {
    'active': 'text-green-600 bg-green-50',
    'on-leave': 'text-yellow-600 bg-yellow-50',
    'inactive': 'text-gray-600 bg-gray-50',
    'suspended': 'text-red-600 bg-red-50',
  };
  return colors[status] || colors.inactive;
}
