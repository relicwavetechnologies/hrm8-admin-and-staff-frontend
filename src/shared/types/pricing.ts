/**
 * Pricing management types - Complete pricing system
 */

export type BillingCycle = 'monthly' | 'annual';
export type PricingStatus = 'active' | 'draft' | 'archived';
export type PricingModel = 'flat' | 'per_use' | 'tiered' | 'percentage';

// ATS Subscription Tiers
export interface ATSSubscriptionTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: number; // percentage discount for annual billing
  maxJobs: number;
  maxUsers: number;
  features: string[];
  popularBadge?: boolean;
  status: PricingStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Add-on Services
export interface AddonService {
  id: string;
  name: string;
  description: string;
  pricingModel: PricingModel;
  basePrice: number;
  pricePerUnit?: number;
  unitLabel?: string; // e.g., "per employee", "per assessment"
  features: string[];
  applicableTiers: string[]; // tier IDs this addon can be added to
  status: PricingStatus;
  createdAt: string;
  updatedAt: string;
}

// Recruitment Services
export interface RecruitmentService {
  id: string;
  name: string;
  description: string;
  serviceType: 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  pricingModel: PricingModel;
  baseFee: number;
  percentageFee?: number; // percentage of salary
  minFee?: number;
  maxFee?: number;
  estimatedDuration?: string;
  features: string[];
  status: PricingStatus;
  createdAt: string;
  updatedAt: string;
}

// Custom Pricing for specific employers
export interface CustomPricing {
  id: string;
  employerId: string;
  employerName: string;
  baseTierId: string;
  customMonthlyPrice?: number;
  customAnnualPrice?: number;
  customMaxJobs?: number;
  customMaxUsers?: number;
  customFeatures?: string[];
  addons: Array<{
    addonId: string;
    customPrice?: number;
  }>;
  notes?: string;
  validFrom: string;
  validUntil?: string;
  approvedBy: string;
  status: PricingStatus;
  createdAt: string;
  updatedAt: string;
}

// Pricing History for audit trail
export interface PricingHistory {
  id: string;
  entityType: 'tier' | 'addon' | 'recruitment' | 'custom';
  entityId: string;
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// Pricing comparison data
export interface PricingComparison {
  tiers: ATSSubscriptionTier[];
  features: Array<{
    category: string;
    name: string;
    values: Record<string, string | boolean | number>;
  }>;
}
