import { useMemo } from 'react';
import { Employer } from '@/shared/types/entities';
import { 
  hasModuleAccess, 
  getAvailableModules, 
  calculateMonthlyCost,
  type ModuleName,
  type ModuleConfig 
} from '@/shared/lib/moduleAccessControl';

interface UseModuleAccessResult {
  hasAccess: (module: ModuleName) => boolean;
  availableModules: ModuleName[];
  monthlyCost: number;
  atsEnabled: boolean;
  hrmsEnabled: boolean;
  addonCount: number;
}

/**
 * Hook to check module access for an employer
 */
export function useModuleAccess(employer: Employer): UseModuleAccessResult {
  const availableModules = useMemo(
    () => getAvailableModules(employer.subscriptionTier, employer.modules),
    [employer.subscriptionTier, employer.modules]
  );

  const monthlyCost = useMemo(
    () => calculateMonthlyCost(employer.subscriptionTier, employer.modules),
    [employer.subscriptionTier, employer.modules]
  );

  const hasAccess = useMemo(
    () => (module: ModuleName) => 
      hasModuleAccess(employer.subscriptionTier, employer.modules, module),
    [employer.subscriptionTier, employer.modules]
  );

  return {
    hasAccess,
    availableModules,
    monthlyCost,
    atsEnabled: employer.modules.atsEnabled,
    hrmsEnabled: employer.modules.hrmsEnabled,
    addonCount: employer.modules.enabledAddons.length,
  };
}
