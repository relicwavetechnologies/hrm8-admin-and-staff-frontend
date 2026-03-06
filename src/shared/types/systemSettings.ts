/**
 * System Settings Type Definitions
 * 
 * Comprehensive type definitions for all system-level configuration and settings.
 * These settings are managed by super_admin users only.
 */

import { Territory } from './territory';
import { CommissionStructure, CommissionTier, CommissionRule } from './commission';

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

/**
 * Subscription tier configuration
 */
export interface SubscriptionTierConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  limits: {
    activeJobs: number;
    employeeSeats: number;
    storageGB: number;
    apiCallsPerMonth: number;
    customBranding: boolean;
    dedicatedSupport: boolean;
  };
  isActive: boolean;
  isPopular?: boolean;
  sortOrder: number;
}

/**
 * Recruitment service pricing configuration
 */
export interface RecruitmentServiceConfig {
  id: string;
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  name: string;
  description: string;
  baseFee: number;
  upfrontPercentage: number; // 0-1 (e.g., 0.5 = 50%)
  additionalFees?: {
    name: string;
    amount: number;
    condition?: string;
  }[];
  salaryThresholds?: {
    under100k?: number;
    over100k?: number;
  };
  features: string[];
  estimatedTimelineDays: number;
  isActive: boolean;
}

/**
 * Job board promotion budget tiers
 */
export interface JobBoardBudgetTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  reach?: string;
  boards?: string[];
  durationDays: number;
  isRecommended?: boolean;
  isActive: boolean;
  warning?: string;
}

/**
 * HRMS Add-on configuration
 */
export interface HRMSAddonConfig {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  features: string[];
  isActive: boolean;
}

/**
 * Additional service add-ons
 */
export interface ServiceAddonConfig {
  id: string;
  category: 'hrms' | 'analytics' | 'integration' | 'support' | 'custom';
  name: string;
  description: string;
  pricingModel: 'flat' | 'per-user' | 'per-job' | 'usage-based';
  price: number;
  billingPeriod?: 'monthly' | 'annual' | 'one-time';
  features: string[];
  isActive: boolean;
}

/**
 * Complete system pricing configuration
 */
export interface SystemPricingConfig {
  id: string;
  version: string;
  effectiveDate: string;
  
  subscriptionTiers: SubscriptionTierConfig[];
  recruitmentServices: RecruitmentServiceConfig[];
  jobBoardBudgets: JobBoardBudgetTier[];
  hrmsAddons: HRMSAddonConfig[];
  additionalAddons: ServiceAddonConfig[];
  
  // Job posting fees
  jobPostingFee: number;
  jobPostingFeeWaived: boolean;
  
  // Global pricing settings
  taxRate?: number;
  currency: string;
  discountRules?: DiscountRule[];
  
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedAt: string;
  notes?: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'flat' | 'tiered';
  value: number;
  condition: string;
  applicableTo: ('subscription' | 'service' | 'addon' | 'job-posting')[];
  isActive: boolean;
}

// ============================================================================
// COMMISSION CONFIGURATION
// ============================================================================

/**
 * Commission approval workflow configuration
 */
export interface CommissionApprovalWorkflow {
  id: string;
  name: string;
  steps: CommissionApprovalStep[];
  autoApprovalThreshold?: number; // Auto-approve commissions under this amount
  requiresMultipleApprovers: boolean;
  minimumApprovers?: number;
  isActive: boolean;
}

export interface CommissionApprovalStep {
  stepNumber: number;
  role: string;
  approverRoles: string[];
  requiredApprovals: number;
  timeoutDays?: number;
  autoEscalate?: boolean;
}

/**
 * Commission split rules configuration
 */
export interface CommissionSplitRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  splitType: 'percentage' | 'flat' | 'tiered';
  defaultSplitPercentage?: number;
  participants: {
    role: string;
    percentage?: number;
    flatAmount?: number;
  }[];
  isActive: boolean;
}

/**
 * Complete commission system configuration
 */
export interface CommissionSystemConfig {
  id: string;
  version: string;
  effectiveDate: string;
  
  // Default commission structures by role/service type
  defaultStructures: {
    roleId: string;
    roleName: string;
    serviceType?: string;
    structure: CommissionStructure;
    percentage?: number;
    flatAmount?: number;
    tiers?: CommissionTier[];
    customRules?: CommissionRule[];
  }[];
  
  // Approval workflows
  approvalWorkflows: CommissionApprovalWorkflow[];
  defaultWorkflowId: string;
  
  // Split rules
  splitRules: CommissionSplitRule[];
  allowManualSplits: boolean;
  
  // Payment settings
  paymentSchedule: 'weekly' | 'bi-weekly' | 'monthly' | 'on-completion';
  paymentDay?: number; // Day of month for monthly payments
  minimumPayoutAmount?: number;
  
  // Clawback rules
  clawbackEnabled: boolean;
  clawbackPeriodDays?: number;
  clawbackConditions?: string[];
  
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedAt: string;
  notes?: string;
}

// ============================================================================
// TERRITORY & REGION CONFIGURATION
// ============================================================================

/**
 * Region configuration
 */
export interface RegionConfig {
  id: string;
  name: string;
  code: string; // e.g., 'NA', 'EMEA', 'APAC', 'LATAM'
  description?: string;
  countries: string[];
  timezone: string;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Territory auto-assignment rules
 */
export interface TerritoryAutoAssignmentRule {
  id: string;
  name: string;
  priority: number; // Lower number = higher priority
  conditions: {
    countries?: string[];
    states?: string[];
    postalCodes?: string[];
    industry?: string[];
    employerSize?: {
      min?: number;
      max?: number;
    };
  };
  assignToTerritoryId: string;
  assignToSalesRepId?: string;
  isActive: boolean;
}

/**
 * Complete territory system configuration
 */
export interface TerritorySystemConfig {
  id: string;
  version: string;
  effectiveDate: string;
  
  regions: RegionConfig[];
  territories: Territory[];
  
  autoAssignmentEnabled: boolean;
  autoAssignmentRules: TerritoryAutoAssignmentRule[];
  
  allowMultipleTerritories: boolean;
  requireTerritoryAssignment: boolean;
  
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedAt: string;
  notes?: string;
}

// ============================================================================
// CURRENCY CONFIGURATION
// ============================================================================

/**
 * Exchange rate configuration
 */
export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
  source?: string; // e.g., 'manual', 'xe.com', 'ecb'
}

/**
 * Supported currency configuration
 */
export interface SupportedCurrency {
  code: string; // ISO 4217 code (e.g., 'USD', 'EUR', 'GBP')
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  regions: string[];
}

/**
 * Complete currency configuration
 */
export interface CurrencyConfig {
  id: string;
  version: string;
  effectiveDate: string;
  
  baseCurrency: string; // Primary currency (e.g., 'USD')
  supportedCurrencies: SupportedCurrency[];
  exchangeRates: ExchangeRate[];
  
  autoUpdateRates: boolean;
  rateUpdateFrequency?: 'hourly' | 'daily' | 'weekly';
  rateUpdateSource?: string;
  
  displayFormat: 'symbol-first' | 'symbol-last' | 'code-only';
  
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedAt: string;
  notes?: string;
}

// ============================================================================
// GLOBAL SYSTEM SETTINGS
// ============================================================================

/**
 * Company information
 */
export interface CompanyInfo {
  name: string;
  legalName: string;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
    supportEmail?: string;
    salesEmail?: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

/**
 * Localization settings
 */
export interface LocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1 | 6; // 0=Sunday, 1=Monday, 6=Saturday
}

/**
 * System defaults
 */
export interface SystemDefaults {
  defaultSubscriptionTier: string;
  defaultJobPostingDuration: number; // days
  defaultApplicationDeadline: number; // days from posting
  defaultCandidateRetentionDays: number;
  defaultInvoicePaymentTerms: number; // days
  defaultEmailNotifications: boolean;
}

/**
 * Feature flags for system-wide features
 */
export interface FeatureFlags {
  enableRPOServices: boolean;
  enableCustomBranding: boolean;
  enableAPIAccess: boolean;
  enableAdvancedAnalytics: boolean;
  enableJobBoardIntegrations: boolean;
  enableAIRecommendations: boolean;
  enableVideoInterviews: boolean;
  enableBackgroundChecks: boolean;
  enableMultiCurrency: boolean;
  enableCommissionSplits: boolean;
  maintenanceMode: boolean;
}

/**
 * System limits and quotas
 */
export interface SystemLimits {
  maxJobsPerEmployer: number;
  maxApplicationsPerJob: number;
  maxFileUploadSizeMB: number;
  maxBulkUploadRows: number;
  maxAPICallsPerMinute: number;
  maxConcurrentUsers: number;
  sessionTimeoutMinutes: number;
}

/**
 * Security policies
 */
export interface SecurityPolicies {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpirationDays?: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireMFA: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelist?: string[];
}

/**
 * Complete global system settings
 */
export interface SystemGlobalSettings {
  id: string;
  version: string;
  effectiveDate: string;
  
  companyInfo: CompanyInfo;
  localization: LocalizationSettings;
  defaults: SystemDefaults;
  featureFlags: FeatureFlags;
  systemLimits: SystemLimits;
  securityPolicies: SecurityPolicies;
  
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedAt: string;
  notes?: string;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Types of actions that can be audited
 */
export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'login'
  | 'logout'
  | 'permission-change'
  | 'config-change';

/**
 * Categories of system entities that can be audited
 */
export type AuditCategory =
  | 'pricing'
  | 'commission'
  | 'territory'
  | 'currency'
  | 'global-settings'
  | 'user-management'
  | 'security'
  | 'integrations'
  | 'system-config'
  | 'audit';

/**
 * Severity level of audit events
 */
export type AuditSeverity = 'info' | 'warning' | 'critical';

/**
 * Represents a change in value (before/after)
 */
export interface AuditChange {
  field: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

/**
 * Complete audit log entry
 */
export interface SystemAuditLog {
  id: string;
  timestamp: string;
  
  // Who
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  
  // What
  action: AuditActionType;
  category: AuditCategory;
  entityType: string;
  entityId?: string;
  entityName?: string;
  
  // Details
  description: string;
  changes?: AuditChange[];
  previousState?: unknown;
  newState?: unknown;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  
  // Metadata
  severity: AuditSeverity;
  tags?: string[];
  metadata?: Record<string, unknown>;
  
  // Impact
  affectedUsers?: string[];
  affectedEmployers?: string[];
  
  // Retention
  retentionPeriodDays: number;
  canBeDeleted: boolean;
}

/**
 * Audit log query filters
 */
export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  category?: AuditCategory;
  action?: AuditActionType;
  severity?: AuditSeverity;
  entityType?: string;
  entityId?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

/**
 * Audit log export options
 */
export interface AuditLogExportOptions {
  filters: AuditLogFilters;
  format: 'json' | 'csv' | 'pdf';
  includeMetadata: boolean;
  includeChanges: boolean;
  compressOutput: boolean;
}

// ============================================================================
// SYSTEM CONFIGURATION SNAPSHOT
// ============================================================================

/**
 * Complete snapshot of all system configuration
 * Used for backups, versioning, and rollbacks
 */
export interface SystemConfigurationSnapshot {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  description?: string;
  
  pricingConfig: SystemPricingConfig;
  commissionConfig: CommissionSystemConfig;
  territoryConfig: TerritorySystemConfig;
  currencyConfig: CurrencyConfig;
  globalSettings: SystemGlobalSettings;
  
  isActive: boolean;
  canRestore: boolean;
  
  metadata?: {
    changeReason?: string;
    approvedBy?: string;
    approvedAt?: string;
    rollbackOf?: string;
  };
}

/**
 * Configuration change request
 * Used for approval workflows on major system changes
 */
export interface ConfigurationChangeRequest {
  id: string;
  category: AuditCategory;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  
  title: string;
  description: string;
  reason: string;
  
  changes: AuditChange[];
  
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'implemented';
  
  approvals: {
    userId: string;
    userName: string;
    decision: 'approved' | 'rejected';
    comment?: string;
    timestamp: string;
  }[];
  
  requiredApprovals: number;
  
  implementedAt?: string;
  implementedBy?: string;
  
  effectiveDate?: string;
}
