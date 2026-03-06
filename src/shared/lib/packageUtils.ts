/**
 * Package Utilities
 * Helper functions to check company subscription packages
 */

import { getEmployerById } from './employerService';


export type SubscriptionTier = 'ats-lite' | 'payg' | 'small' | 'medium' | 'large' | 'enterprise';

/**
 * Check if a company has a paid subscription package
 * Free packages: 'ats-lite'
 * Paid packages: 'payg', 'small', 'medium', 'large', 'enterprise'
 */
export function isPaidPackage(companyId: string): boolean {
  const employer = getEmployerById(companyId);

  if (!employer) {
    return false;
  }

  const subscriptionTier = employer.subscriptionTier;

  // Free package
  if (subscriptionTier === 'ats-lite') {
    return false;
  }

  // All other tiers are considered paid
  return true;
}

/**
 * Get subscription tier for a company
 */
export function getPackageTier(companyId: string): SubscriptionTier {
  const employer = getEmployerById(companyId);

  if (!employer) {
    return 'ats-lite'; // Default to free tier
  }

  return employer.subscriptionTier || 'ats-lite';
}

/**
 * Check if company can offload jobs to consultants
 * Only paid packages can offload to consultants
 */
export function canOffloadToConsultants(companyId: string): boolean {
  return isPaidPackage(companyId);
}

/**
 * Get package display name
 */
export function getPackageDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    'ats-lite': 'ATS Lite (Free)',
    'payg': 'Pay As You Go',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'enterprise': 'Enterprise',
  };

  return names[tier] || tier;
}
