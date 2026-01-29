import type { ServiceProject } from '@/shared/types/recruitmentService';
import { getAllServiceProjects } from './recruitmentServiceStorage';
import { getConsultantById } from './consultantStorage';
import { differenceInDays, format } from 'date-fns';

export interface RPOContractSummary {
  id: string;
  name: string;
  clientName: string;
  clientLogo?: string;
  country: string;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  duration: number; // months
  daysRemaining?: number;
  isExpiring: boolean; // within 30 days

  // Consultants
  assignedConsultants: Array<{
    id: string;
    consultantId: string;
    consultantName: string;
    monthlyRate: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    avatar?: string;
  }>;
  numberOfConsultants: number;

  // Financial
  monthlyRetainer: number;
  perVacancyFee?: number;
  estimatedVacancies?: number;
  totalContractValue: number;
  feeStructures: Array<{
    type: string;
    name: string;
    amount: number;
    frequency?: string;
  }>;

  // Progress
  targetPlacements?: number;
  currentPlacements: number;
  progress: number;
}

export interface RPODashboardMetrics {
  totalActiveContracts: number;
  totalDedicatedConsultants: number;
  totalMonthlyRecurringRevenue: number;
  totalContractValue: number;
  expiringContracts: number; // expiring within 30 days
  averageContractDuration: number; // months
  contracts: RPOContractSummary[];
}

export async function getRPOContractSummary(service: ServiceProject): Promise<RPOContractSummary | null> {
  if (!service.isRPO || service.serviceType !== 'rpo') {
    return null;
  }

  const startDate = new Date(service.rpoStartDate || service.startDate);
  const endDate = service.rpoEndDate ? new Date(service.rpoEndDate) : undefined;
  const now = new Date();

  let daysRemaining: number | undefined;
  let isExpiring = false;

  if (endDate) {
    daysRemaining = differenceInDays(endDate, now);
    isExpiring = daysRemaining > 0 && daysRemaining <= 30;
  }

  // Get assigned consultants with full details
  const assignedConsultants = await Promise.all((service.rpoAssignedConsultants || []).map(async assignment => {
    const consultant = await getConsultantById(assignment.consultantId);
    return {
      ...assignment,
      avatar: consultant?.photo,
    };
  }));

  // Calculate monthly retainer from consultants or use fixed retainer
  let monthlyRetainer = service.rpoMonthlyRetainer || 0;
  if (assignedConsultants.length > 0 && !service.rpoMonthlyRetainer) {
    monthlyRetainer = assignedConsultants
      .filter(c => c.isActive)
      .reduce((sum, c) => sum + c.monthlyRate, 0);
  }

  return {
    id: service.id,
    name: service.name,
    clientName: service.clientName,
    clientLogo: service.clientLogo,
    country: service.rpoCountry || service.country,
    status: service.status,
    startDate: service.rpoStartDate || service.startDate,
    endDate: service.rpoEndDate,
    duration: service.rpoDuration || 0,
    daysRemaining,
    isExpiring,
    assignedConsultants,
    numberOfConsultants: assignedConsultants.filter(c => c.isActive).length,
    monthlyRetainer,
    perVacancyFee: service.rpoPerVacancyFee,
    estimatedVacancies: service.rpoEstimatedVacancies,
    totalContractValue: service.rpoTotalContractValue || 0,
    feeStructures: service.rpoFeeStructures || [],
    targetPlacements: service.targetPlacements,
    currentPlacements: service.candidatesInterviewed || 0, // Using interviewed as proxy for placements
    progress: service.progress,
  };
}

export async function getRPODashboardMetrics(): Promise<RPODashboardMetrics> {
  const allServices = getAllServiceProjects();
  const rpoServices = allServices.filter(s => s.isRPO || s.serviceType === 'rpo');

  const contracts = (await Promise.all(rpoServices.map(async s => await getRPOContractSummary(s))))
    .filter((c): c is RPOContractSummary => c !== null)
    .sort((a, b) => {
      // Sort by status (active first) then by days remaining
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
        return a.daysRemaining - b.daysRemaining;
      }
      return 0;
    });

  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiringContracts = activeContracts.filter(c => c.isExpiring).length;

  const totalDedicatedConsultants = activeContracts.reduce(
    (sum, contract) => sum + contract.numberOfConsultants,
    0
  );

  const totalMonthlyRecurringRevenue = activeContracts.reduce(
    (sum, contract) => sum + contract.monthlyRetainer,
    0
  );

  const totalContractValue = activeContracts.reduce(
    (sum, contract) => sum + contract.totalContractValue,
    0
  );

  const averageContractDuration = activeContracts.length > 0
    ? Math.round(
      activeContracts.reduce((sum, c) => sum + c.duration, 0) / activeContracts.length
    )
    : 0;

  return {
    totalActiveContracts: activeContracts.length,
    totalDedicatedConsultants,
    totalMonthlyRecurringRevenue,
    totalContractValue,
    expiringContracts,
    averageContractDuration,
    contracts,
  };
}

export async function getConsultantRPOAssignments(consultantId: string): Promise<RPOContractSummary[]> {
  const metrics = await getRPODashboardMetrics();
  return metrics.contracts.filter(contract =>
    contract.assignedConsultants.some(c => c.consultantId === consultantId && c.isActive)
  );
}

export interface MonthlyRevenueForecast {
  month: string;
  monthLabel: string;
  projectedRevenue: number;
  activeContracts: number;
  contractBreakdown: Array<{
    contractId: string;
    contractName: string;
    clientName: string;
    monthlyRetainer: number;
  }>;
}

export async function getRevenueProjection(months: number = 12): Promise<MonthlyRevenueForecast[]> {
  const metrics = await getRPODashboardMetrics();
  const activeContracts = metrics.contracts.filter(c => c.status === 'active');

  const now = new Date();
  const forecasts: MonthlyRevenueForecast[] = [];

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = format(forecastDate, 'MMM yyyy');
    const month = format(forecastDate, 'yyyy-MM');

    // Calculate which contracts will be active in this month
    const contractsActiveInMonth = activeContracts.filter(contract => {
      const contractStart = new Date(contract.startDate);
      const contractEnd = contract.endDate ? new Date(contract.endDate) : null;

      // Check if contract is active during this forecast month
      const isAfterStart = forecastDate >= contractStart;
      const isBeforeEnd = !contractEnd || forecastDate <= contractEnd;

      return isAfterStart && isBeforeEnd;
    });

    const projectedRevenue = contractsActiveInMonth.reduce(
      (sum, contract) => sum + contract.monthlyRetainer,
      0
    );

    const contractBreakdown = contractsActiveInMonth.map(contract => ({
      contractId: contract.id,
      contractName: contract.name,
      clientName: contract.clientName,
      monthlyRetainer: contract.monthlyRetainer,
    }));

    forecasts.push({
      month,
      monthLabel,
      projectedRevenue,
      activeContracts: contractsActiveInMonth.length,
      contractBreakdown,
    });
  }

  return forecasts;
}
