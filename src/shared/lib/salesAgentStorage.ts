import type { SalesAgent, SalesAgentStatus, SalesRole } from '@/shared/types/salesAgent';

const STORAGE_KEY = 'staffing_crm_sales_agents';

// Mock data initialization
function initializeMockData(): SalesAgent[] {
  return [
    {
      id: 'sa-1',
      firstName: 'Michael',
      lastName: 'Reynolds',
      email: 'michael.reynolds@company.com',
      phone: '+1 (555) 234-5678',
      salesRole: 'sales-manager',
      salesType: 'enterprise-sales',
      status: 'active',
      territoryIds: ['territory-1', 'territory-2'],
      assignedEmployers: ['employer-1', 'employer-2', 'employer-3'],
      quotaAmount: 1200000,
      quotaPeriod: 'annual',
      currentRevenue: 850000,
      closedDeals: 12,
      activeOpportunities: 8,
      conversionRate: 45.5,
      averageDealSize: 70833,
      commissionStructure: 'tiered',
      defaultCommissionRate: 8,
      totalCommissionsEarned: 68000,
      pendingCommissions: 12500,
      hireDate: '2022-03-15',
      reportingTo: 'sa-director-1',
      reportingToName: 'Sarah Thompson',
      createdAt: new Date('2022-03-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sa-2',
      firstName: 'Jessica',
      lastName: 'Chen',
      email: 'jessica.chen@company.com',
      phone: '+1 (555) 345-6789',
      salesRole: 'sales-rep',
      salesType: 'inside-sales',
      status: 'active',
      territoryIds: ['territory-3'],
      assignedEmployers: ['employer-4', 'employer-5'],
      quotaAmount: 720000,
      quotaPeriod: 'annual',
      currentRevenue: 620000,
      closedDeals: 18,
      activeOpportunities: 12,
      conversionRate: 52.3,
      averageDealSize: 34444,
      commissionStructure: 'percentage',
      defaultCommissionRate: 10,
      totalCommissionsEarned: 62000,
      pendingCommissions: 8900,
      hireDate: '2023-01-10',
      reportingTo: 'sa-1',
      reportingToName: 'Michael Reynolds',
      createdAt: new Date('2023-01-10').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sa-3',
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@company.com',
      phone: '+1 (555) 456-7890',
      salesRole: 'account-manager',
      salesType: 'outside-sales',
      status: 'active',
      territoryIds: ['territory-4'],
      assignedEmployers: ['employer-6', 'employer-7', 'employer-8', 'employer-9'],
      quotaAmount: 960000,
      quotaPeriod: 'annual',
      currentRevenue: 780000,
      closedDeals: 15,
      activeOpportunities: 10,
      conversionRate: 48.7,
      averageDealSize: 52000,
      commissionStructure: 'tiered',
      defaultCommissionRate: 7,
      totalCommissionsEarned: 54600,
      pendingCommissions: 15400,
      hireDate: '2021-08-20',
      reportingTo: 'sa-1',
      reportingToName: 'Michael Reynolds',
      createdAt: new Date('2021-08-20').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getAllSalesAgents(): SalesAgent[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockData = initializeMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(stored);
}

export function getSalesAgentById(id: string): SalesAgent | undefined {
  const agents = getAllSalesAgents();
  return agents.find(agent => agent.id === id);
}

export function createSalesAgent(agent: Omit<SalesAgent, 'id' | 'createdAt' | 'updatedAt'>): SalesAgent {
  const agents = getAllSalesAgents();
  const newAgent: SalesAgent = {
    ...agent,
    id: `sa-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  agents.push(newAgent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  return newAgent;
}

export function updateSalesAgent(id: string, updates: Partial<SalesAgent>): SalesAgent | null {
  const agents = getAllSalesAgents();
  const index = agents.findIndex(agent => agent.id === id);
  if (index === -1) return null;
  
  agents[index] = {
    ...agents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  return agents[index];
}

export function deleteSalesAgent(id: string): boolean {
  const agents = getAllSalesAgents();
  const filtered = agents.filter(agent => agent.id !== id);
  if (filtered.length === agents.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getSalesAgentsByRole(role: SalesRole): SalesAgent[] {
  return getAllSalesAgents().filter(agent => agent.salesRole === role);
}

export function getSalesAgentsByStatus(status: SalesAgentStatus): SalesAgent[] {
  return getAllSalesAgents().filter(agent => agent.status === status);
}

export function getActiveSalesAgents(): SalesAgent[] {
  return getSalesAgentsByStatus('active');
}

export function searchSalesAgents(query: string): SalesAgent[] {
  const agents = getAllSalesAgents();
  const lowerQuery = query.toLowerCase();
  return agents.filter(agent =>
    agent.firstName.toLowerCase().includes(lowerQuery) ||
    agent.lastName.toLowerCase().includes(lowerQuery) ||
    agent.email.toLowerCase().includes(lowerQuery)
  );
}

export function getTopPerformers(limit: number = 10): SalesAgent[] {
  return getAllSalesAgents()
    .filter(agent => agent.status === 'active')
    .sort((a, b) => b.currentRevenue - a.currentRevenue)
    .slice(0, limit);
}

export function getSalesAgentStats() {
  const agents = getAllSalesAgents();
  const active = agents.filter(a => a.status === 'active');
  
  return {
    total: agents.length,
    active: active.length,
    inactive: agents.filter(a => a.status === 'inactive').length,
    onLeave: agents.filter(a => a.status === 'on-leave').length,
    totalRevenue: active.reduce((sum, a) => sum + a.currentRevenue, 0),
    totalQuota: active.reduce((sum, a) => sum + a.quotaAmount, 0),
    avgConversionRate: active.reduce((sum, a) => sum + a.conversionRate, 0) / active.length,
    totalClosedDeals: active.reduce((sum, a) => sum + a.closedDeals, 0),
    totalActiveOpportunities: active.reduce((sum, a) => sum + a.activeOpportunities, 0),
  };
}
