import { getAllConsultants } from './consultantStorage';
import { getRPODashboardMetrics } from './rpoTrackingUtils';

export interface ConsultantRPOAvailability {
  consultant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    type: string;
    status: string;
    specializations: string[];
  };
  availability: {
    isAvailable: boolean;
    status: 'available' | 'partially-available' | 'unavailable';
    currentRPOAssignments: number;
    maxRPOCapacity: number;
    availableCapacity: number;
  };
  currentAssignments: Array<{
    contractId: string;
    contractName: string;
    clientName: string;
    monthlyRate: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }>;
  rates: {
    standardMonthlyRate: number;
    standardDailyRate: number;
    standardHourlyRate: number;
    averageRPORate?: number; // Average rate from current assignments
  };
  experience: {
    totalRPOContracts: number;
    activeRPOContracts: number;
    totalMonthsInRPO: number;
  };
}

export async function getConsultantRPOAvailability(): Promise<ConsultantRPOAvailability[]> {
  const allConsultants = await getAllConsultants();
  const activeConsultants = allConsultants.filter(c => c.status === 'ACTIVE');
  const rpoMetrics = await getRPODashboardMetrics();

  return activeConsultants.map(consultant => {
    // Find all RPO assignments for this consultant
    const assignments = rpoMetrics.contracts
      .filter(contract =>
        contract.assignedConsultants.some(a =>
          a.consultantId === consultant.id
        )
      )
      .map(contract => {
        const assignment = contract.assignedConsultants.find(
          a => a.consultantId === consultant.id
        )!;

        return {
          contractId: contract.id,
          contractName: contract.name,
          clientName: contract.clientName,
          monthlyRate: assignment.monthlyRate,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isActive: assignment.isActive,
        };
      });

    const activeAssignments = assignments.filter(a => a.isActive);
    const currentRPOAssignments = activeAssignments.length;

    // Typically consultants can handle 1-2 RPO contracts simultaneously
    const maxRPOCapacity = 2;
    const availableCapacity = Math.max(0, maxRPOCapacity - currentRPOAssignments);

    let availabilityStatus: 'available' | 'partially-available' | 'unavailable';
    if (currentRPOAssignments === 0) {
      availabilityStatus = 'available';
    } else if (currentRPOAssignments < maxRPOCapacity) {
      availabilityStatus = 'partially-available';
    } else {
      availabilityStatus = 'unavailable';
    }

    // Calculate average RPO rate from current assignments
    const averageRPORate = activeAssignments.length > 0
      ? activeAssignments.reduce((sum, a) => sum + a.monthlyRate, 0) / activeAssignments.length
      : undefined;

    // Calculate standard rates (these would typically come from consultant profile)
    // For now, using estimated rates based on consultant type
    let standardMonthlyRate = 8000; // Base rate for sales-rep
    if (consultant.role === 'RECRUITER') standardMonthlyRate = 9000;
    if (consultant.role === 'CONSULTANT_360') standardMonthlyRate = 10000;

    const standardDailyRate = Math.round(standardMonthlyRate / 20); // ~20 working days/month
    const standardHourlyRate = Math.round(standardMonthlyRate / 160); // ~160 hours/month

    // Calculate experience metrics
    const allAssignments = assignments;
    const totalRPOContracts = allAssignments.length;
    const activeRPOContracts = activeAssignments.length;

    // Calculate total months in RPO (simplified - just counting active contracts * avg duration)
    const totalMonthsInRPO = allAssignments.length * 6; // Assuming avg 6 months per contract

    return {
      consultant: {
        id: consultant.id,
        name: `${consultant.firstName} ${consultant.lastName}`,
        email: consultant.email,
        phone: consultant.phone,
        avatar: consultant.photo,
        type: consultant.role,
        status: consultant.status,
        specializations: consultant.industryExpertise || [],
      },
      availability: {
        isAvailable: availableCapacity > 0,
        status: availabilityStatus,
        currentRPOAssignments,
        maxRPOCapacity,
        availableCapacity,
      },
      currentAssignments: assignments,
      rates: {
        standardMonthlyRate,
        standardDailyRate,
        standardHourlyRate,
        averageRPORate,
      },
      experience: {
        totalRPOContracts,
        activeRPOContracts,
        totalMonthsInRPO,
      },
    };
  }).sort((a, b) => {
    // Sort by availability first, then by experience
    if (a.availability.status !== b.availability.status) {
      const order = { 'available': 0, 'partially-available': 1, 'unavailable': 2 };
      return order[a.availability.status] - order[b.availability.status];
    }
    return b.experience.totalRPOContracts - a.experience.totalRPOContracts;
  });
}

export async function getAvailableConsultantsForRPO(): Promise<ConsultantRPOAvailability[]> {
  return (await getConsultantRPOAvailability()).filter(c => c.availability.isAvailable);
}

export async function getConsultantRPOStats() {
  const allAvailability = await getConsultantRPOAvailability();

  return {
    totalConsultants: allAvailability.length,
    available: allAvailability.filter(c => c.availability.status === 'available').length,
    partiallyAvailable: allAvailability.filter(c => c.availability.status === 'partially-available').length,
    unavailable: allAvailability.filter(c => c.availability.status === 'unavailable').length,
    totalCapacity: allAvailability.reduce((sum, c) => sum + c.availability.maxRPOCapacity, 0),
    usedCapacity: allAvailability.reduce((sum, c) => sum + c.availability.currentRPOAssignments, 0),
    availableCapacity: allAvailability.reduce((sum, c) => sum + c.availability.availableCapacity, 0),
    averageMonthlyRate: Math.round(
      allAvailability.reduce((sum, c) => sum + c.rates.standardMonthlyRate, 0) / allAvailability.length
    ),
  };
}
