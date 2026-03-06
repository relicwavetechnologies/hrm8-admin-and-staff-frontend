import type { Consultant, ConsultantType, ConsultantStatus } from '@/shared/types/consultant';

export function getConsultantFullName(consultant: Consultant): string {
  return `${consultant.firstName} ${consultant.lastName}`;
}

export function getConsultantInitials(consultant: Consultant): string {
  return `${consultant.firstName[0]}${consultant.lastName[0]}`.toUpperCase();
}

export function getConsultantTypeLabel(type: ConsultantType): string {
  const labels: Record<ConsultantType, string> = {
    'sales-rep': 'Sales Rep',
    'recruiter': 'Recruiter',
    '360-consultant': '360 Consultant',
    'industry-partner': 'Industry Partner',
  };
  return labels[type];
}

export function getConsultantStatusLabel(status: ConsultantStatus): string {
  const labels: Record<ConsultantStatus, string> = {
    'active': 'Active',
    'on-leave': 'On Leave',
    'inactive': 'Inactive',
    'suspended': 'Suspended',
  };
  return labels[status];
}

export function isConsultantAvailable(consultant: Consultant): boolean {
  return consultant.status === 'active';
}

export function hasEmployerCapacity(consultant: Consultant): boolean {
  return consultant.currentEmployers < consultant.maxEmployers;
}

export function hasJobCapacity(consultant: Consultant): boolean {
  return consultant.currentJobs < consultant.maxJobs;
}

export function getCapacityUsage(consultant: Consultant): {
  employers: { current: number; max: number; percentage: number };
  jobs: { current: number; max: number; percentage: number };
} {
  return {
    employers: {
      current: consultant.currentEmployers,
      max: consultant.maxEmployers,
      percentage: (consultant.currentEmployers / consultant.maxEmployers) * 100,
    },
    jobs: {
      current: consultant.currentJobs,
      max: consultant.maxJobs,
      percentage: (consultant.currentJobs / consultant.maxJobs) * 100,
    },
  };
}

export function formatTenure(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  const months = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

import { formatCurrency } from './currencyUtils';

export function formatRevenue(amount: number): string {
  return formatCurrency(amount);
}

export function getPerformanceRating(successRate: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (successRate >= 0.85) return 'excellent';
  if (successRate >= 0.75) return 'good';
  if (successRate >= 0.65) return 'average';
  return 'poor';
}

export function getSuccessRateColor(successRate: number): string {
  if (successRate >= 0.85) return 'text-green-600';
  if (successRate >= 0.75) return 'text-blue-600';
  if (successRate >= 0.65) return 'text-yellow-600';
  return 'text-red-600';
}

export function calculateCommissionRate(consultant: Consultant): number {
  return consultant.defaultCommissionRate || 15;
}

export function getDaysSinceLastActivity(consultant: Consultant): number {
  if (!consultant.lastActivityAt) return -1;
  const lastActivity = new Date(consultant.lastActivityAt);
  const now = new Date();
  return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
}

export function isRecentlyActive(consultant: Consultant, days: number = 7): boolean {
  const daysSince = getDaysSinceLastActivity(consultant);
  return daysSince >= 0 && daysSince <= days;
}
