/**
 * Utility functions for Employer CRM
 */

import type { Employer } from "@/shared/types/entities";
import type { EmployerMetrics } from "@/shared/types/employerCRM";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "./subscriptionConfig";

/**
 * Format currency values
 */
export function formatRevenue(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get color for employer status
 */
export function getStatusColor(status: Employer['status']): string {
  const colors: Record<Employer['status'], string> = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-warning/10 text-warning border-warning/20',
    trial: 'bg-primary/10 text-primary border-primary/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return colors[status] || colors.inactive;
}

/**
 * Get color for subscription tier
 */
export function getSubscriptionTierColor(tier: SubscriptionTier): string {
  const colors: Record<SubscriptionTier, string> = {
    'ats-lite': 'bg-muted text-muted-foreground border-border',
    'payg': 'bg-green-500/10 text-green-600 border-green-500/20',
    small: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    medium: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    large: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    enterprise: 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary',
  };
  return colors[tier] || colors['ats-lite'];
}

/**
 * Get color for account type
 */
export function getAccountTypeColor(accountType: Employer['accountType']): string {
  const colors: Record<Employer['accountType'], string> = {
    approved: 'bg-success/10 text-success border-success/20',
    payg: 'bg-primary/10 text-primary border-primary/20',
  };
  return colors[accountType];
}

/**
 * Calculate employer metrics
 */
export function calculateEmployerMetrics(employer: Employer): EmployerMetrics {
  const tier = SUBSCRIPTION_TIERS[employer.subscriptionTier];
  const monthlyRevenue = tier.monthlyFee;
  const daysAsCustomer = Math.floor(
    (new Date().getTime() - new Date(employer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    totalRevenue: employer.totalSpent || monthlyRevenue * (daysAsCustomer / 30),
    monthlyRevenue,
    averageJobValue: employer.totalSpent ? employer.totalSpent / employer.totalJobsPosted : 0,
    lifetimeValue: employer.totalSpent || monthlyRevenue * 12,
    totalJobs: employer.totalJobsPosted,
    activeJobs: employer.activeJobCount,
    totalUsers: employer.userCount,
    activeUsers: employer.userCount,
    outstandingBalance: employer.outstandingBalance || 0,
    creditLimit: employer.creditLimit || 0,
    daysAsCustomer,
    lastActivityDate: employer.lastActivityAt || employer.updatedAt,
  };
}

/**
 * Format relationship stage
 */
export function formatRelationshipStage(stage: string): string {
  return stage
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get initials from company name
 */
export function getCompanyInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Sort employers by various criteria
 */
export function sortEmployers(
  employers: Employer[],
  sortBy: 'name' | 'revenue' | 'jobs' | 'created' | 'activity',
  direction: 'asc' | 'desc' = 'asc'
): Employer[] {
  const sorted = [...employers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'revenue':
        comparison = (a.totalSpent || 0) - (b.totalSpent || 0);
        break;
      case 'jobs':
        comparison = a.activeJobCount - b.activeJobCount;
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'activity':
        const aDate = new Date(a.lastActivityAt || a.updatedAt).getTime();
        const bDate = new Date(b.lastActivityAt || b.updatedAt).getTime();
        comparison = aDate - bDate;
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Group employers by criteria
 */
export function groupEmployers(employers: Employer[], groupBy: 'status' | 'tier' | 'industry') {
  return employers.reduce((groups, employer) => {
    const key = employer[groupBy];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(employer);
    return groups;
  }, {} as Record<string, Employer[]>);
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(employerId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${employerId.substring(0, 4).toUpperCase()}-${random}`;
}

/**
 * Calculate subscription usage percentage
 */
export function calculateSubscriptionUsage(employer: Employer): {
  jobsUsed: number;
  jobsLimit: number;
  usagePercentage: number;
  hasUnlimitedJobs: boolean;
} {
  const tier = SUBSCRIPTION_TIERS[employer.subscriptionTier];
  const jobsLimit = tier.maxOpenJobs;
  const hasUnlimitedJobs = jobsLimit === Infinity;
  const jobsUsed = employer.activeJobCount;
  const usagePercentage = hasUnlimitedJobs ? 0 : (jobsUsed / jobsLimit) * 100;
  
  return {
    jobsUsed,
    jobsLimit: hasUnlimitedJobs ? 0 : jobsLimit,
    usagePercentage,
    hasUnlimitedJobs,
  };
}
