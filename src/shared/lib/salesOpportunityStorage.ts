import type { SalesOpportunity, OpportunityStage } from '@/shared/types/salesOpportunity';

const STORAGE_KEY = 'staffing_crm_sales_opportunities';

function initializeMockData(): SalesOpportunity[] {
  return [
    {
      id: 'opp-1',
      employerId: 'employer-1',
      employerName: 'TechCorp Solutions',
      salesAgentId: 'sa-1',
      salesAgentName: 'Michael Reynolds',
      name: 'TechCorp - Enterprise ATS Platform',
      type: 'new-business',
      productType: 'ats-subscription',
      estimatedValue: 120000,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      stage: 'negotiation',
      priority: 'high',
      leadSource: 'inbound',
      nextSteps: 'Schedule final pricing review with CFO',
      notes: 'Very interested in our AI-powered matching features',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'opp-2',
      employerId: 'employer-2',
      employerName: 'Global Industries Inc',
      salesAgentId: 'sa-2',
      salesAgentName: 'Jessica Chen',
      name: 'Global Industries - RPO Service Package',
      type: 'new-business',
      productType: 'rpo-service',
      estimatedValue: 250000,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      stage: 'proposal',
      priority: 'critical',
      leadSource: 'referral',
      nextSteps: 'Present RPO proposal to executive team',
      notes: 'Looking to fill 50+ positions in Q2',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'opp-3',
      employerId: 'employer-4',
      employerName: 'StartUp Ventures',
      salesAgentId: 'sa-2',
      salesAgentName: 'Jessica Chen',
      name: 'StartUp - HRMS Addon Package',
      type: 'upsell',
      productType: 'hrms-subscription',
      estimatedValue: 45000,
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      stage: 'negotiation',
      priority: 'medium',
      leadSource: 'outbound',
      nextSteps: 'Send final contract for signature',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'opp-4',
      employerId: 'employer-6',
      employerName: 'Manufacturing Co',
      salesAgentId: 'sa-3',
      salesAgentName: 'David Martinez',
      name: 'Manufacturing - ATS Renewal',
      type: 'renewal',
      productType: 'ats-subscription',
      estimatedValue: 80000,
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      stage: 'proposal',
      priority: 'high',
      leadSource: 'inbound',
      nextSteps: 'Discuss renewal pricing and new features',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getAllOpportunities(): SalesOpportunity[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockData = initializeMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(stored);
}

export function getOpportunityById(id: string): SalesOpportunity | undefined {
  return getAllOpportunities().find(opp => opp.id === id);
}

export function createOpportunity(opp: Omit<SalesOpportunity, 'id' | 'createdAt' | 'updatedAt'>): SalesOpportunity {
  const opportunities = getAllOpportunities();
  const newOpp: SalesOpportunity = {
    ...opp,
    id: `opp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  opportunities.push(newOpp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  return newOpp;
}

export function updateOpportunity(id: string, updates: Partial<SalesOpportunity>): SalesOpportunity | null {
  const opportunities = getAllOpportunities();
  const index = opportunities.findIndex(opp => opp.id === id);
  if (index === -1) return null;

  opportunities[index] = {
    ...opportunities[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  return opportunities[index];
}

export function deleteOpportunity(id: string): boolean {
  const opportunities = getAllOpportunities();
  const filtered = opportunities.filter(opp => opp.id !== id);
  if (filtered.length === opportunities.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getOpportunitiesByStage(stage: OpportunityStage): SalesOpportunity[] {
  return getAllOpportunities().filter(opp => opp.stage === stage);
}

export function getOpportunitiesBySalesAgent(agentId: string): SalesOpportunity[] {
  return getAllOpportunities().filter(opp => opp.salesAgentId === agentId);
}

export function getOpportunitiesByEmployer(employerId: string): SalesOpportunity[] {
  return getAllOpportunities().filter(opp => opp.employerId === employerId);
}

export function getActiveOpportunities(): SalesOpportunity[] {
  return getAllOpportunities().filter(opp =>
    opp.stage !== 'closed-won' && opp.stage !== 'closed-lost'
  );
}

export function getPipelineValue(): number {
  return getActiveOpportunities().reduce((sum, opp) => sum + opp.estimatedValue, 0);
}

export function getWeightedPipelineValue(): number {
  return getActiveOpportunities().reduce((sum, opp) =>
    sum + (opp.estimatedValue * (opp.probability / 100)), 0
  );
}

export function getOpportunityStats() {
  const opportunities = getAllOpportunities();
  const active = getActiveOpportunities();
  const won = opportunities.filter(o => o.stage === 'closed-won');
  const lost = opportunities.filter(o => o.stage === 'closed-lost');

  return {
    total: opportunities.length,
    active: active.length,
    won: won.length,
    lost: lost.length,
    pipelineValue: getPipelineValue(),
    weightedPipelineValue: getWeightedPipelineValue(),
    avgDealSize: won.length > 0 ? won.reduce((sum, o) => sum + o.estimatedValue, 0) / won.length : 0,
    conversionRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
  };
}
