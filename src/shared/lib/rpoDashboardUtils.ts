// import { ServiceProject } from '@/shared/types/recruitmentService';
import { getAllServiceProjects } from '@/shared/lib/recruitmentServiceStorage';
import { getAllConsultants } from '@/shared/lib/consultantStorage';

export interface RPODashboardMetrics {
  activeContracts: number;
  totalConsultants: number;
  monthlyRecurringRevenue: number;
  contractsExpiring: number;
  averageContractValue: number;
  totalPlacementsThisMonth: number;
}

export interface ContractStatusData {
  status: string;
  count: number;
  color: string;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  contracts: number;
}

export interface ConsultantUtilizationData {
  name: string;
  utilization: number;
  activeProjects: number;
}

export interface PlacementByServiceData {
  month: string;
  rpoFullService: number;
  executiveSearch: number;
  shortlisting: number;
}

export interface RenewalData {
  contractName: string;
  employer: string;
  renewalDate: string;
  daysUntilRenewal: number;
  value: number;
  urgency: 'high' | 'medium' | 'low';
}

export async function getRPODashboardMetrics(): Promise<RPODashboardMetrics> {
  const projects = getAllServiceProjects();
  const rpoProjects = projects.filter(p => p.serviceType === 'rpo' && p.isRPO);
  const consultants = await getAllConsultants();

  const activeContracts = rpoProjects.filter(p => p.status === 'active').length;

  const monthlyRecurringRevenue = rpoProjects
    .filter(p => p.status === 'active')
    .reduce((sum, p) => {
      const monthlyRate = (p.rpoMonthlyRetainer || 0);
      return sum + monthlyRate;
    }, 0);

  const now = new Date();
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const contractsExpiring = rpoProjects.filter(p => {
    if (p.status !== 'active' || !p.rpoEndDate) return false;
    const endDate = new Date(p.rpoEndDate);
    return endDate >= now && endDate <= threeMonthsFromNow;
  }).length;

  const averageContractValue = activeContracts > 0
    ? rpoProjects
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + (p.rpoTotalContractValue || 0), 0) / activeContracts
    : 0;

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalPlacementsThisMonth = rpoProjects
    .filter(p => {
      if (!p.completedDate) return false;
      const endDate = new Date(p.completedDate);
      return p.status === 'completed' &&
        endDate.getMonth() === thisMonth &&
        endDate.getFullYear() === thisYear;
    }).length;

  const rpoConsultants = consultants.filter(c =>
    rpoProjects.some(p => p.consultants.some(pc => pc.id === c.id))
  );

  return {
    activeContracts,
    totalConsultants: rpoConsultants.length,
    monthlyRecurringRevenue,
    contractsExpiring,
    averageContractValue,
    totalPlacementsThisMonth,
  };
}

export function getContractStatusDistribution(): ContractStatusData[] {
  const projects = getAllServiceProjects();
  const rpoProjects = projects.filter(p => p.serviceType === 'rpo' && p.isRPO);

  const statusMap: Record<string, number> = {};
  rpoProjects.forEach(p => {
    statusMap[p.status] = (statusMap[p.status] || 0) + 1;
  });

  const colorMap: Record<string, string> = {
    active: '#10b981',
    'on-hold': '#f59e0b',
    completed: '#6b7280',
    cancelled: '#ef4444',
  };

  return Object.entries(statusMap).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    count,
    color: colorMap[status] || '#6b7280',
  }));
}

export function getMonthlyRevenueProjection(): MonthlyRevenueData[] {
  const projects = getAllServiceProjects();
  const rpoProjects = projects.filter(p => p.serviceType === 'rpo' && p.isRPO);
  const months: MonthlyRevenueData[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    const activeInMonth = rpoProjects.filter(p => {
      if (!p.rpoStartDate || !p.rpoEndDate) return false;
      const start = new Date(p.rpoStartDate);
      const end = new Date(p.rpoEndDate);
      return start <= date && end >= date && p.status === 'active';
    });

    const revenue = activeInMonth.reduce((sum, p) => sum + (p.rpoMonthlyRetainer || 0), 0);

    months.push({
      month: monthKey,
      revenue,
      contracts: activeInMonth.length,
    });
  }

  return months;
}

export async function getConsultantUtilizationData(): Promise<ConsultantUtilizationData[]> {
  const consultants = await getAllConsultants();
  const projects = getAllServiceProjects();
  const rpoProjects = projects.filter(p => p.serviceType === 'rpo' && p.isRPO && p.status === 'active');

  const consultantData = consultants.map(c => {
    const activeProjects = rpoProjects.filter(p =>
      p.consultants.some(pc => pc.id === c.id)
    );

    const utilization = activeProjects.length > 0 ? Math.min(activeProjects.length * 30, 100) : 0;

    return {
      name: `${c.firstName} ${c.lastName}`,
      utilization,
      activeProjects: activeProjects.length,
    };
  }).filter(c => c.activeProjects > 0);

  return consultantData.sort((a, b) => b.utilization - a.utilization);
}

export function getPlacementsByService(): PlacementByServiceData[] {
  const projects = getAllServiceProjects();
  const months: PlacementByServiceData[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short' });

    const monthProjects = projects.filter(p => {
      if (!p.completedDate) return false;
      const endDate = new Date(p.completedDate);
      return p.status === 'completed' &&
        endDate.getMonth() === date.getMonth() &&
        endDate.getFullYear() === date.getFullYear();
    });

    months.push({
      month: monthKey,
      rpoFullService: monthProjects.filter(p => p.serviceType === 'rpo' && p.isRPO).length,
      executiveSearch: monthProjects.filter(p => p.serviceType === 'executive-search').length,
      shortlisting: monthProjects.filter(p => p.serviceType === 'shortlisting').length,
    });
  }

  return months;
}

export function getRenewalTimeline(): RenewalData[] {
  const projects = getAllServiceProjects();
  const rpoProjects = projects.filter(p =>
    p.serviceType === 'rpo' && p.isRPO && p.status === 'active'
  );

  const now = new Date();
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  return rpoProjects
    .map(p => {
      if (!p.rpoEndDate) return null;
      const renewalDate = new Date(p.rpoEndDate);
      const daysUntilRenewal = Math.floor((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      let urgency: 'high' | 'medium' | 'low' = 'low';
      if (daysUntilRenewal < 30) urgency = 'high';
      else if (daysUntilRenewal < 60) urgency = 'medium';

      return {
        contractName: p.name,
        employer: p.clientName,
        renewalDate: p.rpoEndDate,
        daysUntilRenewal,
        value: p.rpoTotalContractValue || 0,
        urgency,
      };
    })
    .filter((r): r is RenewalData => {
      if (!r) return false;
      const renewalDate = new Date(r.renewalDate);
      return renewalDate >= now && renewalDate <= sixMonthsFromNow;
    })
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
}
