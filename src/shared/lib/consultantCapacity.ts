import { mockConsultants } from "@/shared/data/mockConsultantsData";

export interface ConsultantCapacityInfo {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  specialization: string[];
  currentLoad: number;
  maxCapacity: number;
  capacityPercentage: number;
  status: 'available' | 'near-capacity' | 'at-capacity';
  statusColor: 'green' | 'yellow' | 'red';
}

export function getConsultantCapacity(consultantId: string): ConsultantCapacityInfo | null {
  const consultant = mockConsultants.find(c => c.id === consultantId);
  if (!consultant) return null;

  const capacityPercentage = (consultant.currentEmployers / consultant.maxEmployers) * 100;
  
  let status: ConsultantCapacityInfo['status'];
  let statusColor: ConsultantCapacityInfo['statusColor'];
  
  if (capacityPercentage >= 95) {
    status = 'at-capacity';
    statusColor = 'red';
  } else if (capacityPercentage >= 80) {
    status = 'near-capacity';
    statusColor = 'yellow';
  } else {
    status = 'available';
    statusColor = 'green';
  }

  return {
    id: consultant.id,
    name: `${consultant.firstName} ${consultant.lastName}`,
    title: consultant.title,
    avatar: consultant.photo,
    specialization: consultant.specialization,
    currentLoad: consultant.currentEmployers,
    maxCapacity: consultant.maxEmployers,
    capacityPercentage,
    status,
    statusColor
  };
}

export function getAllConsultantsWithCapacity(): ConsultantCapacityInfo[] {
  return mockConsultants
    .map(c => getConsultantCapacity(c.id))
    .filter((c): c is ConsultantCapacityInfo => c !== null);
}

export function getAvailableConsultants(): ConsultantCapacityInfo[] {
  return getAllConsultantsWithCapacity().filter(c => c.capacityPercentage < 95);
}
