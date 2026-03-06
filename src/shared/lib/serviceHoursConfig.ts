import type { ServiceType } from '@/shared/types/recruitmentService';

export interface ServiceHoursConfig {
  shortlisting: number;
  'full-service': number;
  'executive-search-under-100k': number;
  'executive-search-over-100k': number;
  rpo: number;
}

const STORAGE_KEY = 'service_hours_config';

const DEFAULT_CONFIG: ServiceHoursConfig = {
  shortlisting: 8,
  'full-service': 24,
  'executive-search-under-100k': 40,
  'executive-search-over-100k': 54,
  rpo: 0, // RPO hours calculated separately based on consultant assignments
};

export function getServiceHoursConfig(): ServiceHoursConfig {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_CONFIG;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function updateServiceHoursConfig(config: ServiceHoursConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetServiceHoursConfig(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
}

export function getServiceHours(
  serviceType: ServiceType,
  salaryMax?: number
): number {
  const config = getServiceHoursConfig();
  
  switch (serviceType) {
    case 'shortlisting':
      return config.shortlisting;
    case 'full-service':
      return config['full-service'];
    case 'executive-search':
      // Differentiate by salary
      if (salaryMax !== undefined && salaryMax >= 100000) {
        return config['executive-search-over-100k'];
      }
      return config['executive-search-under-100k'];
    case 'rpo':
      // RPO hours handled separately
      return config.rpo;
    default:
      return 0;
  }
}

export const MONTHLY_HOURS_AVAILABLE = 160;
