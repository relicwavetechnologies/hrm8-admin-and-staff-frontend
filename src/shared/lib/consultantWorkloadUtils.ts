import type { ConsultantType } from '@/shared/types/consultant';
import type { ServiceProject, ServiceType } from '@/shared/types/recruitmentService';
import { getAllConsultants } from './consultantStorage';
import { getAllServiceProjects } from './recruitmentServiceStorage';
import { getJobById } from './mockJobStorage';
import { getServiceHours } from './serviceHoursConfig';
import { calculateAdjustedCapacity, type TimeOffAdjustment } from './timeoffCapacityUtils';

export interface WorkloadData {
  consultantId: string;
  consultantName: string;
  consultantType: ConsultantType;
  consultantStatus: string;
  avatar?: string;
  monthlyHoursAvailable: number;
  hoursAssigned: number;
  hoursRemaining: number;
  utilizationPercent: number;
  status: 'available' | 'busy' | 'at-capacity' | 'overloaded';
  serviceHoursBreakdown: {
    shortlisting: number;
    'full-service': number;
    'executive-search-under-100k': number;
    'executive-search-over-100k': number;
    rpo: number;
  };
  serviceCountBreakdown: {
    shortlisting: number;
    'full-service': number;
    'executive-search-under-100k': number;
    'executive-search-over-100k': number;
    rpo: number;
  };
  activeServices: Array<{
    id: string;
    name: string;
    type: ServiceType;
    hours: number;
    expectedCompletion: string;
  }>;
  timeOffAdjustment?: TimeOffAdjustment;
}

export interface TeamWorkloadSummary {
  totalActive: number;
  atCapacity: number;
  available: number;
  overloaded: number;
  averageUtilization: number;
  totalHoursAssigned: number;
  totalHoursAvailable: number;
  workloadData: WorkloadData[];
}

export interface ServiceTypeBreakdown {
  shortlisting: { count: number; hours: number; percentage: number };
  'full-service': { count: number; hours: number; percentage: number };
  'executive-search-under-100k': { count: number; hours: number; percentage: number };
  'executive-search-over-100k': { count: number; hours: number; percentage: number };
  rpo: { count: number; hours: number; percentage: number };
  total: number;
  totalHours: number;
}

function getServiceProjectHours(service: ServiceProject): number {
  // Use custom hours if set
  if (service.customHours !== undefined && service.customHours !== null) {
    return service.customHours;
  }

  // For RPO, hours are calculated based on dedicated consultants
  if (service.serviceType === 'rpo' && service.rpoAssignedConsultants) {
    // RPO services with dedicated consultants don't count toward hourly workload
    // They're tracked separately as full-time assignments
    return 0;
  }

  // Get linked job for salary information (for executive search)
  let salaryMax: number | undefined;
  if (service.serviceType === 'executive-search' && service.jobId) {
    const job = getJobById(service.jobId);
    salaryMax = job?.salaryMax;
  }

  return getServiceHours(service.serviceType, salaryMax);
}

export async function calculateConsultantWorkload(consultantId: string): Promise<WorkloadData> {
  const consultants = await getAllConsultants();
  const consultant = consultants.find(c => c.id === consultantId);

  if (!consultant) {
    throw new Error(`Consultant ${consultantId} not found`);
  }

  // Calculate time off adjustments
  const timeOffAdjustment = calculateAdjustedCapacity(consultantId);

  // Get all active service projects assigned to this consultant
  const allServices = getAllServiceProjects();
  const consultantServices = allServices.filter(
    service =>
      service.status === 'active' &&
      service.consultants.some(c => c.id === consultantId)
  );

  // Calculate hours and count breakdown by service type
  const serviceHoursBreakdown = {
    shortlisting: 0,
    'full-service': 0,
    'executive-search-under-100k': 0,
    'executive-search-over-100k': 0,
    rpo: 0,
  };

  const serviceCountBreakdown = {
    shortlisting: 0,
    'full-service': 0,
    'executive-search-under-100k': 0,
    'executive-search-over-100k': 0,
    rpo: 0,
  };

  const activeServices = consultantServices.map(service => {
    const hours = getServiceProjectHours(service);

    // Determine service category
    let category: keyof typeof serviceHoursBreakdown;

    if (service.serviceType === 'executive-search') {
      // Check job salary to categorize
      const job = service.jobId ? getJobById(service.jobId) : null;
      const salaryMax = job?.salaryMax || 0;
      category = salaryMax >= 100000
        ? 'executive-search-over-100k'
        : 'executive-search-under-100k';
    } else {
      category = service.serviceType as keyof typeof serviceHoursBreakdown;
    }

    // Add to breakdown
    serviceHoursBreakdown[category] += hours;
    serviceCountBreakdown[category] += 1;

    // Calculate expected completion (30 days from now)
    const expectedCompletion = new Date();
    expectedCompletion.setDate(expectedCompletion.getDate() + 30);

    return {
      id: service.id,
      name: service.name,
      type: service.serviceType,
      hours,
      expectedCompletion: expectedCompletion.toISOString(),
    };
  });

  const hoursAssigned = Object.values(serviceHoursBreakdown).reduce((sum, h) => sum + h, 0);
  const adjustedCapacity = timeOffAdjustment.adjustedHoursAvailable;
  const hoursRemaining = Math.max(0, adjustedCapacity - hoursAssigned);
  const utilizationPercent = adjustedCapacity > 0
    ? (hoursAssigned / adjustedCapacity) * 100
    : 0;

  let status: WorkloadData['status'];
  if (utilizationPercent > 100) {
    status = 'overloaded';
  } else if (utilizationPercent >= 86) {
    status = 'at-capacity';
  } else if (utilizationPercent >= 61) {
    status = 'busy';
  } else {
    status = 'available';
  }

  return {
    consultantId: consultant.id,
    consultantName: `${consultant.firstName} ${consultant.lastName}`,
    consultantType: consultant.role as unknown as ConsultantType,
    consultantStatus: consultant.status,
    avatar: consultant.photo,
    monthlyHoursAvailable: adjustedCapacity,
    hoursAssigned,
    hoursRemaining,
    utilizationPercent: Math.round(utilizationPercent),
    status,
    serviceHoursBreakdown,
    serviceCountBreakdown,
    activeServices,
    timeOffAdjustment,
  };
}

export async function getTeamWorkloadSummary(): Promise<TeamWorkloadSummary> {
  const consultants = await getAllConsultants();
  const activeConsultants = consultants.filter(c => c.status === 'ACTIVE');

  const workloadData = await Promise.all(activeConsultants.map(c => calculateConsultantWorkload(c.id)));

  const atCapacity = workloadData.filter(w => w.status === 'at-capacity').length;
  const available = workloadData.filter(w => w.status === 'available').length;
  const overloaded = workloadData.filter(w => w.status === 'overloaded').length;

  const totalUtilization = workloadData.reduce((sum, w) => sum + w.utilizationPercent, 0);
  const averageUtilization = workloadData.length > 0
    ? Math.round(totalUtilization / workloadData.length)
    : 0;

  const totalHoursAssigned = workloadData.reduce((sum, w) => sum + w.hoursAssigned, 0);
  const totalHoursAvailable = workloadData.reduce((sum, w) => sum + w.monthlyHoursAvailable, 0);

  return {
    totalActive: activeConsultants.length,
    atCapacity,
    available,
    overloaded,
    averageUtilization,
    totalHoursAssigned,
    totalHoursAvailable,
    workloadData: workloadData.sort((a, b) => b.utilizationPercent - a.utilizationPercent),
  };
}

export function getServiceTypeDistribution(): ServiceTypeBreakdown {
  const allServices = getAllServiceProjects();
  // Exclude RPO services - they're tracked separately with dedicated teams
  const activeServices = allServices.filter(s => s.status === 'active' && s.serviceType !== 'rpo');

  const counts = {
    shortlisting: 0,
    'full-service': 0,
    'executive-search-under-100k': 0,
    'executive-search-over-100k': 0,
    rpo: 0,
  };

  const hours = {
    shortlisting: 0,
    'full-service': 0,
    'executive-search-under-100k': 0,
    'executive-search-over-100k': 0,
    rpo: 0,
  };

  activeServices.forEach(service => {
    if (service.serviceType === 'executive-search') {
      // Check job salary to categorize
      const job = service.jobId ? getJobById(service.jobId) : null;
      const salaryMax = job?.salaryMax || 0;

      if (salaryMax >= 100000) {
        counts['executive-search-over-100k']++;
        hours['executive-search-over-100k'] += getServiceProjectHours(service);
      } else {
        counts['executive-search-under-100k']++;
        hours['executive-search-under-100k'] += getServiceProjectHours(service);
      }
    } else {
      counts[service.serviceType]++;
      hours[service.serviceType] += getServiceProjectHours(service);
    }
  });

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const totalHours = Object.values(hours).reduce((sum, h) => sum + h, 0);

  return {
    shortlisting: {
      count: counts.shortlisting,
      hours: hours.shortlisting,
      percentage: total > 0 ? Math.round((counts.shortlisting / total) * 100) : 0,
    },
    'full-service': {
      count: counts['full-service'],
      hours: hours['full-service'],
      percentage: total > 0 ? Math.round((counts['full-service'] / total) * 100) : 0,
    },
    'executive-search-under-100k': {
      count: counts['executive-search-under-100k'],
      hours: hours['executive-search-under-100k'],
      percentage: total > 0 ? Math.round((counts['executive-search-under-100k'] / total) * 100) : 0,
    },
    'executive-search-over-100k': {
      count: counts['executive-search-over-100k'],
      hours: hours['executive-search-over-100k'],
      percentage: total > 0 ? Math.round((counts['executive-search-over-100k'] / total) * 100) : 0,
    },
    rpo: {
      count: counts.rpo,
      hours: hours.rpo,
      percentage: total > 0 ? Math.round((counts.rpo / total) * 100) : 0,
    },
    total,
    totalHours,
  };
}

export function getCapacityColor(utilizationPercent: number): string {
  if (utilizationPercent > 100) return 'hsl(var(--destructive))';
  if (utilizationPercent >= 86) return 'hsl(var(--warning))';
  if (utilizationPercent >= 61) return 'hsl(var(--chart-2))';
  return 'hsl(var(--chart-1))';
}

export function getCapacityBgColor(utilizationPercent: number): string {
  if (utilizationPercent > 100) return 'bg-destructive/10';
  if (utilizationPercent >= 86) return 'bg-warning/10';
  if (utilizationPercent >= 61) return 'bg-chart-2/10';
  return 'bg-chart-1/10';
}
