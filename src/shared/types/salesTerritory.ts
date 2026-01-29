export type TerritoryRegion = 'north-america' | 'emea' | 'apac' | 'latam' | 'other';

export interface SalesTerritory {
  id: string;
  name: string;
  region: TerritoryRegion;
  
  // Geographic Definition
  countries: string[];
  states?: string[]; // For US/Canada
  cities?: string[];
  postalCodes?: string[];
  
  // Assignment
  primarySalesAgentId?: string;
  primarySalesAgentName?: string;
  secondarySalesAgentIds?: string[];
  
  // Metrics
  totalEmployers: number;
  activeEmployers: number;
  annualRevenue: number;
  quota: number;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
