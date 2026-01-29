import { createServiceProject, updateServiceProject, getServiceProjectsByClient } from './recruitmentServiceStorage';
import type { ServiceProject, RPOFeeStructure } from '@/shared/types/recruitmentService';

/**
 * Calculate total RPO contract value based on fee structures and duration
 */
export function calculateRPOContractValue(
  feeStructures: RPOFeeStructure[], 
  durationMonths: number,
  estimatedPlacements?: number,
  numberOfConsultants?: number
): number {
  let total = 0;
  
  feeStructures.forEach(fee => {
    switch (fee.type) {
      case 'consultant-monthly':
        // Monthly consultant fee * months * number of consultants
        total += fee.amount * durationMonths * (numberOfConsultants || 1);
        break;
      case 'per-vacancy':
        total += fee.amount * (estimatedPlacements || 0);
        break;
      default:
        // Handle by frequency for backward compatibility
        switch (fee.frequency) {
          case 'monthly':
            total += fee.amount * durationMonths;
            break;
          case 'quarterly':
            total += fee.amount * Math.ceil(durationMonths / 3);
            break;
          case 'per-placement':
          case 'per-vacancy':
            total += fee.amount * (estimatedPlacements || 0);
            break;
          case 'one-time':
            total += fee.amount;
            break;
          default:
            total += fee.amount;
        }
    }
  });
  
  return total;
}

/**
 * Calculate guide pricing for RPO
 */
export function calculateRPOGuidePrice(
  consultants: number,
  months: number,
  estimatedVacancies: number
): {
  monthlyRetainer: number;
  totalMonthlyFees: number;
  perVacancyFees: number;
  totalEstimated: number;
  breakdown: string[];
} {
  const GUIDE_CONSULTANT_RATE = 5990;
  const GUIDE_VACANCY_FEE = 3990;
  
  const monthlyRetainer = consultants * GUIDE_CONSULTANT_RATE;
  const totalMonthlyFees = monthlyRetainer * months;
  const perVacancyFees = estimatedVacancies * GUIDE_VACANCY_FEE;
  const totalEstimated = totalMonthlyFees + perVacancyFees;
  
  return {
    monthlyRetainer,
    totalMonthlyFees,
    perVacancyFees,
    totalEstimated,
    breakdown: [
      `${consultants} consultant(s) × $${GUIDE_CONSULTANT_RATE.toLocaleString()}/month × ${months} months = $${totalMonthlyFees.toLocaleString()}`,
      `${estimatedVacancies} estimated vacancies × $${GUIDE_VACANCY_FEE.toLocaleString()} = $${perVacancyFees.toLocaleString()}`,
      `Total Estimated: $${totalEstimated.toLocaleString()}`
    ]
  };
}

/**
 * Calculate RPO progress metrics
 */
export function calculateRPOProgress(service: ServiceProject): {
  timeProgress: number;
  placementProgress: number;
  overallProgress: number;
} {
  const now = new Date();
  const start = new Date(service.rpoStartDate || service.startDate);
  const end = new Date(service.rpoEndDate || service.deadline);
  
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  const timeProgress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  const placementProgress = service.targetPlacements 
    ? Math.min((service.candidatesShortlisted / service.targetPlacements) * 100, 100)
    : 0;
  
  // Weighted: 30% time, 70% deliverables
  const overallProgress = (timeProgress * 0.3) + (placementProgress * 0.7);
  
  return {
    timeProgress: Math.round(timeProgress),
    placementProgress: Math.round(placementProgress),
    overallProgress: Math.round(overallProgress)
  };
}

/**
 * Create a new RPO service project
 */
export function createRPOService(data: Partial<ServiceProject>): ServiceProject {
  const feeStructures = data.rpoFeeStructures || [];
  const duration = data.rpoDuration || 12;
  const totalContractValue = calculateRPOContractValue(
    feeStructures,
    duration,
    data.targetPlacements
  );

  // Calculate end date if start date and duration are provided
  let endDate: string | undefined;
  if (data.startDate && duration) {
    const start = new Date(data.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);
    endDate = end.toISOString().split('T')[0];
  }

  const newService: ServiceProject = {
    id: `service_${Date.now()}`,
    name: data.name || 'New RPO Service',
    serviceType: 'rpo',
    status: 'active',
    priority: data.priority || 'medium',
    stage: 'initiated',
    clientId: data.clientId || '',
    clientName: data.clientName || '',
    location: data.location || '',
    country: data.country || 'United States',
    consultants: data.consultants || [],
    progress: 0,
    candidatesShortlisted: 0,
    candidatesInterviewed: 0,
    numberOfVacancies: 1,
    projectValue: totalContractValue,
    upfrontPaid: 0,
    balanceDue: totalContractValue,
    currency: 'USD',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    deadline: endDate || data.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: data.description,
    requirements: data.requirements,
    tags: data.tags,
    isRPO: true,
    rpoStartDate: data.startDate,
    rpoEndDate: endDate,
    rpoDuration: duration,
    rpoFeeStructures: feeStructures,
    rpoTotalContractValue: totalContractValue,
    rpoAutoRenew: data.rpoAutoRenew,
    rpoNoticePeriod: data.rpoNoticePeriod,
    rpoNotes: data.rpoNotes,
    targetPlacements: data.targetPlacements,
    rpoCountry: data.country,
    rpoPrimaryContactId: data.rpoPrimaryContactId,
    rpoPrimaryContactName: data.rpoPrimaryContactName,
    rpoAdditionalContactIds: data.rpoAdditionalContactIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createServiceProject(newService);
}

/**
 * Update an existing RPO service
 */
export function updateRPOService(id: string, updates: Partial<ServiceProject>): ServiceProject | null {
  // Recalculate contract value if fee structures or duration changed
  if (updates.rpoFeeStructures || updates.rpoDuration) {
    const current = updates as ServiceProject;
    const feeStructures = updates.rpoFeeStructures || current.rpoFeeStructures || [];
    const duration = updates.rpoDuration || current.rpoDuration || 0;
    
    if (feeStructures.length > 0 && duration > 0) {
      updates.rpoTotalContractValue = calculateRPOContractValue(
        feeStructures,
        duration,
        updates.targetPlacements || current.targetPlacements
      );
      updates.projectValue = updates.rpoTotalContractValue;
    }
  }
  
  // Recalculate end date if start date or duration changed
  if ((updates.rpoStartDate || updates.rpoDuration) && !updates.rpoEndDate) {
    const current = updates as ServiceProject;
    const startDate = updates.rpoStartDate || current.rpoStartDate;
    const duration = updates.rpoDuration || current.rpoDuration;
    
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + duration);
      updates.rpoEndDate = end.toISOString().split('T')[0];
      updates.deadline = updates.rpoEndDate;
    }
  }
  
  return updateServiceProject(id, updates);
}

/**
 * Get all RPO services for a specific employer
 */
export function getRPOServicesByEmployer(employerId: string): ServiceProject[] {
  return getServiceProjectsByClient(employerId).filter(p => p.serviceType === 'rpo' || p.isRPO);
}

/**
 * Add a fee structure to an RPO service
 */
export function addRPOFeeStructure(serviceId: string, fee: RPOFeeStructure): ServiceProject | null {
  const service = getServiceProjectsByClient('').find(s => s.id === serviceId);
  if (!service || !service.isRPO) return null;
  
  const currentFees = service.rpoFeeStructures || [];
  const updatedFees = [...currentFees, fee];
  
  return updateRPOService(serviceId, {
    rpoFeeStructures: updatedFees
  });
}

/**
 * Remove a fee structure from an RPO service
 */
export function removeRPOFeeStructure(serviceId: string, feeId: string): ServiceProject | null {
  const service = getServiceProjectsByClient('').find(s => s.id === serviceId);
  if (!service || !service.isRPO) return null;
  
  const updatedFees = (service.rpoFeeStructures || []).filter(f => f.id !== feeId);
  
  return updateRPOService(serviceId, {
    rpoFeeStructures: updatedFees
  });
}
