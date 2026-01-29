import type { Employer } from '@/shared/types/entities';
import { calculateMonthlyCost, hasModuleAccess, type ModuleName, type ModuleConfig } from './moduleAccessControl';
import { HRMS_ADDON } from './subscriptionConfig';

/**
 * Get the module configuration from an employer
 */
export function getEmployerModuleConfig(employer: Employer): ModuleConfig {
  return {
    atsEnabled: employer.modules.atsEnabled,
    hrmsEnabled: employer.modules.hrmsEnabled,
    hrmsEmployeeCount: employer.modules.hrmsEmployeeCount,
    enabledAddons: employer.modules.enabledAddons
  };
}

/**
 * Check if employer has access to a specific module
 */
export function employerHasModule(employer: Employer, module: ModuleName): boolean {
  const moduleConfig = getEmployerModuleConfig(employer);
  return hasModuleAccess(employer.subscriptionTier, moduleConfig, module);
}

/**
 * Calculate total monthly cost for an employer including HRMS add-on
 */
export function calculateEmployerMonthlyCost(employer: Employer): number {
  const moduleConfig = getEmployerModuleConfig(employer);
  return calculateMonthlyCost(employer.subscriptionTier, moduleConfig);
}

/**
 * Get HRMS monthly cost for an employer
 */
export function getEmployerHRMSCost(employer: Employer): number {
  if (!employer.modules.hrmsEnabled || !employer.modules.hrmsEmployeeCount) {
    return 0;
  }
  
  const employeeBlocks = Math.ceil(employer.modules.hrmsEmployeeCount / HRMS_ADDON.minimumEmployees);
  const billedEmployeeCount = employeeBlocks * HRMS_ADDON.minimumEmployees;
  return billedEmployeeCount * HRMS_ADDON.pricePerEmployee;
}

/**
 * Get formatted billing breakdown for an employer
 */
export function getEmployerBillingBreakdown(employer: Employer): {
  subscriptionFee: number;
  hrmsFee: number;
  addonsFee: number;
  total: number;
  breakdown: Array<{ item: string; cost: number }>;
} {
  const subscriptionFee = employer.monthlySubscriptionFee || 0;
  const hrmsFee = getEmployerHRMSCost(employer);
  const addonsFee = 0; // Add-ons calculation can be added here if needed
  const total = subscriptionFee + hrmsFee + addonsFee;
  
  const breakdown: Array<{ item: string; cost: number }> = [];
  
  if (subscriptionFee > 0) {
    breakdown.push({ item: 'Base Subscription', cost: subscriptionFee });
  }
  
  if (hrmsFee > 0) {
    breakdown.push({ 
      item: `HRMS Module (${employer.modules.hrmsEmployeeCount} employees)`, 
      cost: hrmsFee 
    });
  }
  
  if (addonsFee > 0) {
    breakdown.push({ item: 'Add-on Services', cost: addonsFee });
  }
  
  return { subscriptionFee, hrmsFee, addonsFee, total, breakdown };
}

/**
 * Get CRM stage badge color
 */
export function getCRMStageColor(stage: Employer['crm']['salesStage']): string {
  const colors: Record<typeof stage, string> = {
    'lead': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    'prospect': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'trial': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'customer': 'bg-green-500/10 text-green-600 border-green-500/20',
    'at-risk': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'churned': 'bg-red-500/10 text-red-600 border-red-500/20'
  };
  return colors[stage];
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority?: 'low' | 'medium' | 'high' | 'critical'): string {
  if (!priority) return 'bg-muted text-muted-foreground border-border';
  
  const colors: Record<typeof priority, string> = {
    'low': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    'medium': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'high': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'critical': 'bg-red-500/10 text-red-600 border-red-500/20'
  };
  return colors[priority];
}

/**
 * Get health score badge color
 */
export function getHealthScoreColor(score?: number): string {
  if (!score) return 'bg-muted text-muted-foreground border-border';
  
  if (score >= 80) return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (score >= 60) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  if (score >= 40) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format storage size
 */
export function formatStorageSize(mb: number): string {
  if (mb < 1024) {
    return `${mb.toFixed(0)} MB`;
  }
  return `${(mb / 1024).toFixed(2)} GB`;
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(current: number, max: number): number {
  if (max === Infinity || max === 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}

/**
 * Check if employer is at risk based on usage and health score
 */
export function isEmployerAtRisk(employer: Employer): boolean {
  const healthScore = employer.crm.healthScore || 0;
  const paymentStatus = employer.paymentStatus;
  const salesStage = employer.crm.salesStage;
  
  return (
    healthScore < 50 ||
    paymentStatus === 'past_due' ||
    salesStage === 'at-risk'
  );
}

/**
 * Get usage status color based on percentage
 */
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-orange-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-green-600';
}
