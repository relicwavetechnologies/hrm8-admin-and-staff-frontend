import { SUBSCRIPTION_TIERS, HRMS_ADDON, type SubscriptionTier } from './subscriptionConfig';

/**
 * Module names in the HRM8 platform
 * Organized by category: ATS modules and HRMS modules
 */
export type ModuleName =
  // ATS Core Modules
  | 'ats.dashboard'
  | 'ats.jobs'
  | 'ats.candidates'
  | 'ats.applications'
  | 'ats.interviews'
  | 'ats.offers'
  | 'ats.talent-pool'
  | 'ats.careers-page'
  | 'ats.job-boards'
  | 'ats.reports'
  // ATS Advanced Features
  | 'ats.ai-screening'
  | 'ats.custom-forms'
  | 'ats.team-collaboration'
  | 'ats.location-manager'
  | 'ats.department-manager'
  | 'ats.division-manager'
  // HRMS Modules
  | 'hrms.dashboard'
  | 'hrms.employees'
  | 'hrms.attendance'
  | 'hrms.leave'
  | 'hrms.performance'
  | 'hrms.payroll'
  | 'hrms.benefits'
  | 'hrms.documents'
  | 'hrms.org-chart'
  | 'hrms.self-service'
  | 'hrms.reports'
  // Add-on Services
  | 'addon.assessments'
  | 'addon.reference-checking'
  | 'addon.video-interviewing';

export interface ModuleConfig {
  atsEnabled: boolean;
  hrmsEnabled: boolean;
  hrmsEmployeeCount?: number;
  enabledAddons: string[];
}

/**
 * Check if an employer has access to a specific module based on their subscription tier
 * and enabled modules configuration
 */
export function hasModuleAccess(
  subscriptionTier: SubscriptionTier,
  moduleConfig: ModuleConfig,
  module: ModuleName
): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[subscriptionTier];
  
  // HRMS modules require HRMS to be enabled
  if (module.startsWith('hrms.')) {
    return moduleConfig.hrmsEnabled === true;
  }
  
  // Add-on modules require explicit enablement
  if (module.startsWith('addon.')) {
    const addonName = module.replace('addon.', '');
    return moduleConfig.enabledAddons.includes(addonName);
  }
  
  // ATS modules are available based on tier features
  if (module.startsWith('ats.')) {
    // Core ATS modules available to all tiers
    const coreModules: ModuleName[] = [
      'ats.dashboard',
      'ats.jobs',
      'ats.candidates',
      'ats.applications',
      'ats.interviews',
      'ats.offers'
    ];
    
    if (coreModules.includes(module)) {
      return tierConfig.features.ats;
    }
    
    // Feature-specific modules
    const featureMap: Record<string, keyof typeof tierConfig.features> = {
      'ats.ai-screening': 'aiScreening',
      'ats.custom-forms': 'customForms',
      'ats.team-collaboration': 'teamCollaboration',
      'ats.talent-pool': 'talentPool',
      'ats.careers-page': 'brandedCareersPage',
      'ats.job-boards': 'jobBoardIntegration',
      'ats.location-manager': 'locationManager',
      'ats.department-manager': 'departmentManager',
      'ats.division-manager': 'divisionManager',
      'ats.reports': 'reportsAnalytics'
    };
    
    const featureKey = featureMap[module];
    if (featureKey) {
      const featureValue = tierConfig.features[featureKey];
      // Handle boolean and string values (for reports/analytics levels)
      return featureValue === true || (typeof featureValue === 'string' && featureValue !== 'basic');
    }
  }
  
  return false;
}

/**
 * Get all available modules for an employer based on their subscription and configuration
 */
export function getAvailableModules(
  subscriptionTier: SubscriptionTier,
  moduleConfig: ModuleConfig
): ModuleName[] {
  const allModules: ModuleName[] = [
    // ATS Core
    'ats.dashboard',
    'ats.jobs',
    'ats.candidates',
    'ats.applications',
    'ats.interviews',
    'ats.offers',
    'ats.talent-pool',
    'ats.careers-page',
    'ats.job-boards',
    'ats.reports',
    // ATS Advanced
    'ats.ai-screening',
    'ats.custom-forms',
    'ats.team-collaboration',
    'ats.location-manager',
    'ats.department-manager',
    'ats.division-manager',
    // HRMS
    'hrms.dashboard',
    'hrms.employees',
    'hrms.attendance',
    'hrms.leave',
    'hrms.performance',
    'hrms.payroll',
    'hrms.benefits',
    'hrms.documents',
    'hrms.org-chart',
    'hrms.self-service',
    'hrms.reports',
    // Add-ons
    'addon.assessments',
    'addon.reference-checking',
    'addon.video-interviewing'
  ];
  
  return allModules.filter(module => 
    hasModuleAccess(subscriptionTier, moduleConfig, module)
  );
}

/**
 * Calculate monthly cost for an employer based on their subscription and add-ons
 */
export function calculateMonthlyCost(
  subscriptionTier: SubscriptionTier,
  moduleConfig: ModuleConfig
): number {
  const tierConfig = SUBSCRIPTION_TIERS[subscriptionTier];
  let totalCost = tierConfig.monthlyFee;
  
  // Add HRMS cost if enabled
  if (moduleConfig.hrmsEnabled && moduleConfig.hrmsEmployeeCount) {
    const employeeBlocks = Math.ceil(moduleConfig.hrmsEmployeeCount / HRMS_ADDON.minimumEmployees);
    const hrmsEmployeeCount = employeeBlocks * HRMS_ADDON.minimumEmployees;
    totalCost += hrmsEmployeeCount * HRMS_ADDON.pricePerEmployee;
  }
  
  return totalCost;
}

/**
 * Get module categories organized by type
 */
export function getModuleCategories() {
  return {
    atsCore: {
      name: 'ATS Core',
      description: 'Essential applicant tracking features',
      modules: [
        'ats.dashboard',
        'ats.jobs',
        'ats.candidates',
        'ats.applications',
        'ats.interviews',
        'ats.offers'
      ] as ModuleName[]
    },
    atsAdvanced: {
      name: 'ATS Advanced',
      description: 'Advanced recruiting features',
      modules: [
        'ats.ai-screening',
        'ats.custom-forms',
        'ats.team-collaboration',
        'ats.talent-pool',
        'ats.careers-page',
        'ats.job-boards',
        'ats.location-manager',
        'ats.department-manager',
        'ats.division-manager',
        'ats.reports'
      ] as ModuleName[]
    },
    hrms: {
      name: 'HRMS',
      description: 'Human Resource Management System',
      modules: [
        'hrms.dashboard',
        'hrms.employees',
        'hrms.attendance',
        'hrms.leave',
        'hrms.performance',
        'hrms.payroll',
        'hrms.benefits',
        'hrms.documents',
        'hrms.org-chart',
        'hrms.self-service',
        'hrms.reports'
      ] as ModuleName[]
    },
    addons: {
      name: 'Add-on Services',
      description: 'Optional enhancement services',
      modules: [
        'addon.assessments',
        'addon.reference-checking',
        'addon.video-interviewing'
      ] as ModuleName[]
    }
  };
}

/**
 * Check if an employer can upgrade to HRMS
 */
export function canEnableHRMS(subscriptionTier: SubscriptionTier): boolean {
  // HRMS available as add-on for all paid tiers
  return subscriptionTier !== 'ats-lite';
}

/**
 * Get the minimum HRMS employee count required
 */
export function getMinimumHRMSEmployees(): number {
  return HRMS_ADDON.minimumEmployees;
}

/**
 * Calculate HRMS monthly cost for a given employee count
 */
export function calculateHRMSCost(employeeCount: number): number {
  const employeeBlocks = Math.ceil(employeeCount / HRMS_ADDON.minimumEmployees);
  const billedEmployeeCount = employeeBlocks * HRMS_ADDON.minimumEmployees;
  return billedEmployeeCount * HRMS_ADDON.pricePerEmployee;
}
