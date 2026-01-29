/**
 * ATS Integration Service
 * Handles integrations with external ATS systems (Greenhouse, Lever, Workday, etc.)
 */

export type ATSProvider = 'greenhouse' | 'lever' | 'workday' | 'icims' | 'taleo' | 'jobvite';

export interface ATSIntegration {
  id: string;
  provider: ATSProvider;
  companyName: string;
  apiKey?: string;
  apiUrl?: string;
  connected: boolean;
  connectedAt?: string;
  lastSync?: string;
  syncEnabled: boolean;
  syncDirection: 'import' | 'export' | 'bidirectional';
}

export interface ATSSyncResult {
  candidatesImported: number;
  candidatesExported: number;
  jobsImported: number;
  jobsExported: number;
  errors: string[];
}

// Mock storage for integrations
const STORAGE_KEY = 'ats_integrations';

export function getATSIntegrations(): ATSIntegration[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveATSIntegration(integration: ATSIntegration): void {
  const integrations = getATSIntegrations();
  const index = integrations.findIndex(i => i.id === integration.id);
  
  if (index >= 0) {
    integrations[index] = integration;
  } else {
    integrations.push(integration);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function disconnectATSIntegration(integrationId: string): void {
  const integrations = getATSIntegrations().filter(i => i.id !== integrationId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function getATSIntegration(integrationId: string): ATSIntegration | undefined {
  return getATSIntegrations().find(i => i.id === integrationId);
}

/**
 * Connect to ATS provider
 */
export async function connectATSProvider(
  provider: ATSProvider,
  companyName: string,
  apiKey: string,
  apiUrl?: string,
  syncDirection: 'import' | 'export' | 'bidirectional' = 'bidirectional'
): Promise<ATSIntegration> {
  // Mock connection - in production this would validate credentials
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate API key validation
      if (!apiKey || apiKey.length < 10) {
        reject(new Error('Invalid API key'));
        return;
      }

      const integration: ATSIntegration = {
        id: `${provider}-${Date.now()}`,
        provider,
        companyName,
        apiKey,
        apiUrl,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        syncEnabled: true,
        syncDirection,
      };
      
      saveATSIntegration(integration);
      resolve(integration);
    }, 1500);
  });
}

/**
 * Test ATS connection
 */
export async function testATSConnection(
  provider: ATSProvider,
  apiKey: string,
  apiUrl?: string
): Promise<boolean> {
  // Mock connection test - in production this would make an API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!apiKey || apiKey.length < 10) {
        reject(new Error('Invalid API key'));
        return;
      }
      resolve(true);
    }, 1000);
  });
}

/**
 * Sync data with ATS
 */
export async function syncWithATS(integrationId: string): Promise<ATSSyncResult> {
  const integration = getATSIntegration(integrationId);
  
  if (!integration || !integration.connected) {
    throw new Error('ATS integration not found or not connected');
  }

  // Mock sync - in production this would sync with the actual ATS
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: ATSSyncResult = {
        candidatesImported: integration.syncDirection !== 'export' ? Math.floor(Math.random() * 20) : 0,
        candidatesExported: integration.syncDirection !== 'import' ? Math.floor(Math.random() * 15) : 0,
        jobsImported: integration.syncDirection !== 'export' ? Math.floor(Math.random() * 10) : 0,
        jobsExported: integration.syncDirection !== 'import' ? Math.floor(Math.random() * 5) : 0,
        errors: [],
      };

      integration.lastSync = new Date().toISOString();
      saveATSIntegration(integration);

      resolve(result);
    }, 3000);
  });
}

/**
 * Import candidates from ATS
 */
export async function importCandidatesFromATS(
  integrationId: string,
  filters?: {
    status?: string[];
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<any[]> {
  const integration = getATSIntegration(integrationId);
  
  if (!integration || !integration.connected) {
    throw new Error('ATS integration not found or not connected');
  }

  // Mock import - in production this would fetch from the actual ATS
  console.log('Importing candidates from', integration.provider, filters);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 2000);
  });
}

/**
 * Export candidates to ATS
 */
export async function exportCandidatesToATS(
  integrationId: string,
  candidateIds: string[]
): Promise<void> {
  const integration = getATSIntegration(integrationId);
  
  if (!integration || !integration.connected) {
    throw new Error('ATS integration not found or not connected');
  }

  // Mock export - in production this would push to the actual ATS
  console.log('Exporting candidates to', integration.provider, candidateIds);

  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

/**
 * Get ATS provider info
 */
export function getATSProviderInfo(provider: ATSProvider) {
  const providers = {
    greenhouse: {
      name: 'Greenhouse',
      description: 'Leading ATS for modern recruiting teams',
      website: 'https://www.greenhouse.io',
      setupGuideUrl: 'https://developers.greenhouse.io/harvest.html',
    },
    lever: {
      name: 'Lever',
      description: 'ATS and CRM for talent acquisition',
      website: 'https://www.lever.co',
      setupGuideUrl: 'https://hire.lever.co/developer/documentation',
    },
    workday: {
      name: 'Workday',
      description: 'Enterprise HCM and ATS platform',
      website: 'https://www.workday.com',
      setupGuideUrl: 'https://community.workday.com/articles/5767',
    },
    icims: {
      name: 'iCIMS',
      description: 'Talent cloud platform',
      website: 'https://www.icims.com',
      setupGuideUrl: 'https://developer.icims.com',
    },
    taleo: {
      name: 'Oracle Taleo',
      description: 'Cloud-based talent management',
      website: 'https://www.oracle.com/taleo',
      setupGuideUrl: 'https://docs.oracle.com/en/cloud/saas/talent-management',
    },
    jobvite: {
      name: 'Jobvite',
      description: 'Comprehensive talent acquisition suite',
      website: 'https://www.jobvite.com',
      setupGuideUrl: 'https://help.jobvite.com/s/',
    },
  };

  return providers[provider];
}
