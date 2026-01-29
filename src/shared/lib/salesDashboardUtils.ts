import { SalesOpportunity } from '@/shared/types/salesOpportunity';
import { SalesActivity } from '@/shared/types/salesActivity';
import { SalesAgent } from '@/shared/types/salesAgent';
import { getAllOpportunities } from '@/shared/lib/salesOpportunityStorage';
import { getAllActivities } from '@/shared/lib/salesActivityStorage';
import { getAllSalesAgents } from '@/shared/lib/salesAgentStorage';

export interface SalesDashboardMetrics {
  totalPipelineValue: number;
  activeOpportunities: number;
  conversionRate: number;
  averageDealSize: number;
  quotaAttainment: number;
  expectedRevenueThisQuarter: number;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  value: number;
  color: string;
}

export interface RevenueForecastData {
  month: string;
  projected: number;
  actual?: number;
}

export interface RegionData {
  region: string;
  value: number;
  percentage: number;
}

export interface PerformerData {
  name: string;
  revenue: number;
  deals: number;
}

export function getSalesDashboardMetrics(): SalesDashboardMetrics {
  const opportunities = getAllOpportunities();
  const agents = getAllSalesAgents();
  
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  
  const totalPipelineValue = activeOpportunities.reduce(
    (sum, opp) => sum + opp.estimatedValue, 0
  );
  
  const closedWon = opportunities.filter(opp => opp.stage === 'closed-won');
  const closedLost = opportunities.filter(opp => opp.stage === 'closed-lost');
  const conversionRate = closedWon.length + closedLost.length > 0
    ? (closedWon.length / (closedWon.length + closedLost.length)) * 100
    : 0;
  
  const averageDealSize = closedWon.length > 0
    ? closedWon.reduce((sum, opp) => sum + opp.estimatedValue, 0) / closedWon.length
    : 0;
  
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const currentYear = new Date().getFullYear();
  
  const expectedRevenueThisQuarter = activeOpportunities
    .filter(opp => {
      const closeDate = new Date(opp.expectedCloseDate);
      const oppQuarter = Math.floor(closeDate.getMonth() / 3) + 1;
      return oppQuarter === currentQuarter && closeDate.getFullYear() === currentYear;
    })
    .reduce((sum, opp) => sum + (opp.estimatedValue * opp.probability / 100), 0);
  
  const totalQuota = agents.reduce((sum, agent) => sum + (agent.quotaAmount || 0), 0);
  const quotaAttainment = totalQuota > 0
    ? (closedWon.reduce((sum, opp) => sum + opp.estimatedValue, 0) / totalQuota) * 100
    : 0;
  
  return {
    totalPipelineValue,
    activeOpportunities: activeOpportunities.length,
    conversionRate,
    averageDealSize,
    quotaAttainment,
    expectedRevenueThisQuarter,
  };
}

export function getSalesFunnelData(): FunnelStageData[] {
  const opportunities = getAllOpportunities();
  
  const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won'];
  const stageNames: Record<string, string> = {
    prospecting: 'Prospecting',
    qualification: 'Qualification',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Closed Won',
  };
  
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#10b981'];
  
  return stageOrder.map((stage, index) => {
    const stageOpps = opportunities.filter(opp => opp.stage === stage);
    return {
      stage: stageNames[stage],
      count: stageOpps.length,
      value: stageOpps.reduce((sum, opp) => sum + opp.estimatedValue, 0),
      color: colors[index],
    };
  });
}

export function getRevenueForecastData(): RevenueForecastData[] {
  const opportunities = getAllOpportunities();
  const months: RevenueForecastData[] = [];
  const now = new Date();
  
  for (let i = -3; i < 9; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    const monthOpps = opportunities.filter(opp => {
      const closeDate = new Date(opp.expectedCloseDate);
      return closeDate.getMonth() === date.getMonth() && 
             closeDate.getFullYear() === date.getFullYear();
    });
    
    const projected = monthOpps
      .filter(opp => opp.stage !== 'closed-lost')
      .reduce((sum, opp) => sum + (opp.estimatedValue * opp.probability / 100), 0);
    
    const actual = i <= 0 ? monthOpps
      .filter(opp => opp.stage === 'closed-won')
      .reduce((sum, opp) => sum + opp.estimatedValue, 0) : undefined;
    
    months.push({ month: monthKey, projected, actual });
  }
  
  return months;
}

export function getPipelineByRegion(): RegionData[] {
  const opportunities = getAllOpportunities();
  const agents = getAllSalesAgents();
  const activeOpps = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  
  const regionMap: Record<string, number> = {};
  activeOpps.forEach(opp => {
    const agent = agents.find(a => a.id === opp.salesAgentId);
    const region = agent?.territoryIds[0] || 'Unassigned';
    regionMap[region] = (regionMap[region] || 0) + opp.estimatedValue;
  });
  
  const total = Object.values(regionMap).reduce((sum, val) => sum + val, 0);
  
  return Object.entries(regionMap)
    .map(([region, value]) => ({
      region,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function getWinRateTrend(): Array<{ month: string; winRate: number }> {
  const opportunities = getAllOpportunities();
  const months: Array<{ month: string; winRate: number }> = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    
    const monthOpps = opportunities.filter(opp => {
      const closeDate = new Date(opp.expectedCloseDate);
      return closeDate.getMonth() === date.getMonth() && 
             closeDate.getFullYear() === date.getFullYear() &&
             (opp.stage === 'closed-won' || opp.stage === 'closed-lost');
    });
    
    const won = monthOpps.filter(opp => opp.stage === 'closed-won').length;
    const winRate = monthOpps.length > 0 ? (won / monthOpps.length) * 100 : 0;
    
    months.push({ month: monthKey, winRate });
  }
  
  return months;
}

export function getTopPerformers(): PerformerData[] {
  const opportunities = getAllOpportunities();
  const agents = getAllSalesAgents();
  
  const performerMap: Record<string, { revenue: number; deals: number }> = {};
  
  opportunities
    .filter(opp => opp.stage === 'closed-won')
    .forEach(opp => {
      const agentId = opp.salesAgentId;
      if (!performerMap[agentId]) {
        performerMap[agentId] = { revenue: 0, deals: 0 };
      }
      performerMap[agentId].revenue += opp.estimatedValue;
      performerMap[agentId].deals += 1;
    });
  
  return Object.entries(performerMap)
    .map(([agentId, data]) => {
      const agent = agents.find(a => a.id === agentId);
      return {
        name: agent ? `${agent.firstName} ${agent.lastName}` : agentId,
        revenue: data.revenue,
        deals: data.deals,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
