import { BadgeProps } from "@/shared/components/ui/badge";
import { Job } from "@/shared/types/job";

export function generateJobCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JOB-${year}-${random}`;
}

export function formatSalaryRange(
  min?: number, 
  max?: number, 
  currency: string = 'USD',
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'
): string {
  if (!min && !max) return 'Salary not disclosed';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  let range = '';
  if (min && max) {
    range = `${formatter.format(min)} - ${formatter.format(max)}`;
  } else if (min) {
    range = `From ${formatter.format(min)}`;
  } else if (max) {
    range = `Up to ${formatter.format(max)}`;
  } else {
    return 'Salary not disclosed';
  }
  
  if (period) {
    const periodMap = {
      'hourly': 'per hour',
      'daily': 'per day',
      'weekly': 'per week',
      'monthly': 'per month',
      'annual': 'per year',
    };
    range += ` ${periodMap[period]}`;
  }
  
  return range;
}

export function formatSalaryPeriod(period: string): string {
  const periodMap: Record<string, string> = {
    'hourly': 'per hour',
    'daily': 'per day',
    'weekly': 'per week',
    'monthly': 'per month',
    'annual': 'per year',
  };
  return periodMap[period] || '';
}

export function getJobStatusVariant(status: Job['status']): BadgeProps['variant'] {
  const statusMap: Record<Job['status'], BadgeProps['variant']> = {
    'draft': 'outline',
    'open': 'success',
    'closed': 'outline',
    'on-hold': 'warning',
    'filled': 'default',
    'cancelled': 'destructive',
    'template': 'outline',
  };
  
  return statusMap[status] || 'outline';
}

export function getEmploymentTypeVariant(type: Job['employmentType']): BadgeProps['variant'] {
  const typeMap: Record<Job['employmentType'], BadgeProps['variant']> = {
    'full-time': 'default',
    'part-time': 'purple',
    'contract': 'orange',
    'casual': 'teal',
  };
  
  return typeMap[type] || 'neutral';
}

export function getServiceTypeVariant(type: Job['serviceType']): BadgeProps['variant'] {
  const serviceMap: Record<Job['serviceType'], BadgeProps['variant']> = {
    'self-managed': 'neutral',
    'shortlisting': 'default',
    'full-service': 'success',
    'executive-search': 'purple',
    'rpo': 'purple',
  };
  
  return serviceMap[type] || 'neutral';
}

export function calculateDaysOpen(postingDate: string): number {
  const posted = new Date(postingDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffTime = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

export function formatEmploymentType(type: Job['employmentType']): string {
  const typeMap: Record<Job['employmentType'], string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'casual': 'Casual',
  };
  
  return typeMap[type] || type;
}

export function formatExperienceLevel(level: Job['experienceLevel']): string {
  const levelMap: Record<Job['experienceLevel'], string> = {
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior Level',
    'executive': 'Executive',
  };
  
  return levelMap[level] || level;
}

export function formatServiceType(type: Job['serviceType']): string {
  const serviceMap: Record<Job['serviceType'], string> = {
    'self-managed': 'Self-Managed',
    'shortlisting': 'Shortlisting Service',
    'full-service': 'Full-Service',
    'executive-search': 'Executive Search',
    'rpo': 'RPO',
  };
  
  return serviceMap[type] || type;
}

export function reorderRequirements<T extends { order: number }>(
  requirements: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(requirements);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  return result.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

export function reorderResponsibilities<T extends { order: number }>(
  responsibilities: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(responsibilities);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  return result.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}
