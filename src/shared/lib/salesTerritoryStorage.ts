import type { SalesTerritory, TerritoryRegion } from '@/shared/types/salesTerritory';

const STORAGE_KEY = 'staffing_crm_sales_territories';

function initializeMockData(): SalesTerritory[] {
  return [
    {
      id: 'territory-1',
      name: 'Northeast US',
      region: 'north-america',
      countries: ['United States'],
      states: ['NY', 'NJ', 'PA', 'CT', 'MA', 'VT', 'NH', 'ME', 'RI'],
      primarySalesAgentId: 'sa-1',
      primarySalesAgentName: 'Michael Reynolds',
      totalEmployers: 25,
      activeEmployers: 18,
      annualRevenue: 1250000,
      quota: 1500000,
      isActive: true,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'territory-2',
      name: 'West Coast',
      region: 'north-america',
      countries: ['United States'],
      states: ['CA', 'OR', 'WA', 'NV'],
      primarySalesAgentId: 'sa-1',
      primarySalesAgentName: 'Michael Reynolds',
      totalEmployers: 32,
      activeEmployers: 24,
      annualRevenue: 1680000,
      quota: 2000000,
      isActive: true,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'territory-3',
      name: 'Midwest',
      region: 'north-america',
      countries: ['United States'],
      states: ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO'],
      primarySalesAgentId: 'sa-2',
      primarySalesAgentName: 'Jessica Chen',
      totalEmployers: 18,
      activeEmployers: 14,
      annualRevenue: 920000,
      quota: 1200000,
      isActive: true,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'territory-4',
      name: 'Southeast US',
      region: 'north-america',
      countries: ['United States'],
      states: ['FL', 'GA', 'NC', 'SC', 'VA', 'TN', 'AL', 'MS', 'LA'],
      primarySalesAgentId: 'sa-3',
      primarySalesAgentName: 'David Martinez',
      totalEmployers: 22,
      activeEmployers: 17,
      annualRevenue: 1100000,
      quota: 1400000,
      isActive: true,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getAllTerritories(): SalesTerritory[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockData = initializeMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(stored);
}

export function getTerritoryById(id: string): SalesTerritory | undefined {
  return getAllTerritories().find(t => t.id === id);
}

export function createTerritory(territory: Omit<SalesTerritory, 'id' | 'createdAt' | 'updatedAt'>): SalesTerritory {
  const territories = getAllTerritories();
  const newTerritory: SalesTerritory = {
    ...territory,
    id: `territory-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  territories.push(newTerritory);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(territories));
  return newTerritory;
}

export function updateTerritory(id: string, updates: Partial<SalesTerritory>): SalesTerritory | null {
  const territories = getAllTerritories();
  const index = territories.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  territories[index] = {
    ...territories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(territories));
  return territories[index];
}

export function deleteTerritory(id: string): boolean {
  const territories = getAllTerritories();
  const filtered = territories.filter(t => t.id !== id);
  if (filtered.length === territories.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getTerritoriesByRegion(region: TerritoryRegion): SalesTerritory[] {
  return getAllTerritories().filter(t => t.region === region);
}

export function getActiveTerritories(): SalesTerritory[] {
  return getAllTerritories().filter(t => t.isActive);
}

export function getTerritoriesBySalesAgent(agentId: string): SalesTerritory[] {
  return getAllTerritories().filter(t => 
    t.primarySalesAgentId === agentId || 
    t.secondarySalesAgentIds?.includes(agentId)
  );
}

export function getTerritoryStats() {
  const territories = getAllTerritories();
  const active = territories.filter(t => t.isActive);
  
  return {
    total: territories.length,
    active: active.length,
    totalEmployers: active.reduce((sum, t) => sum + t.totalEmployers, 0),
    activeEmployers: active.reduce((sum, t) => sum + t.activeEmployers, 0),
    totalRevenue: active.reduce((sum, t) => sum + t.annualRevenue, 0),
    totalQuota: active.reduce((sum, t) => sum + t.quota, 0),
    avgQuotaAttainment: active.length > 0 
      ? (active.reduce((sum, t) => sum + (t.annualRevenue / t.quota * 100), 0) / active.length)
      : 0,
  };
}
