import { getAllServiceProjects } from './recruitmentServiceStorage';
import { getAllConsultants } from './consultantStorage';
import { getTimeOffRequests } from './timeoffStorage';
import { getServiceHours, MONTHLY_HOURS_AVAILABLE } from './serviceHoursConfig';
import { getJobById } from './mockJobStorage';
import type { ServiceProject } from '@/shared/types/recruitmentService';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface MonthlyForecast {
  month: Date;
  monthLabel: string;
  consultantForecasts: ConsultantMonthForecast[];
  teamAverageUtilization: number;
  teamTotalHoursAssigned: number;
  teamTotalHoursAvailable: number;
  overloadedConsultants: number;
  atCapacityConsultants: number;
}

export interface ConsultantMonthForecast {
  consultantId: string;
  consultantName: string;
  hoursAssigned: number;
  hoursAvailable: number;
  adjustedCapacity: number;
  timeOffDays: number;
  timeOffHours: number;
  utilizationPercent: number;
  status: 'available' | 'busy' | 'at-capacity' | 'overloaded';
  activeServices: ServiceForecastItem[];
  pipelineServices: ServiceForecastItem[];
}

export interface ServiceForecastItem {
  id: string;
  name: string;
  serviceType: string;
  hours: number;
  probability: number; // 0-100, 100 for active services
  expectedStart?: string;
  expectedEnd?: string;
}

export interface HistoricalMetrics {
  avgCompletionDays: number;
  avgCompletionRate: number; // How close to deadline services typically complete
  totalCompleted: number;
  serviceTypeMetrics: {
    [key: string]: {
      avgDays: number;
      count: number;
    };
  };
}

/**
 * Calculate historical completion metrics
 */
export function calculateHistoricalMetrics(): HistoricalMetrics {
  const allServices = getAllServiceProjects();
  const completedServices = allServices.filter(s => s.status === 'completed' && s.completedDate);

  if (completedServices.length === 0) {
    // Default metrics if no history
    return {
      avgCompletionDays: 30,
      avgCompletionRate: 1.0,
      totalCompleted: 0,
      serviceTypeMetrics: {
        shortlisting: { avgDays: 7, count: 0 },
        'full-service': { avgDays: 21, count: 0 },
        'executive-search': { avgDays: 45, count: 0 },
        rpo: { avgDays: 180, count: 0 },
      },
    };
  }

  const serviceTypeMetrics: { [key: string]: { totalDays: number; count: number } } = {};
  let totalDays = 0;
  let totalCompletionRates = 0;

  completedServices.forEach(service => {
    const startDate = new Date(service.startDate);
    const completedDate = new Date(service.completedDate!);
    const deadline = new Date(service.deadline);

    const actualDays = Math.ceil((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    totalDays += actualDays;
    totalCompletionRates += actualDays / expectedDays;

    if (!serviceTypeMetrics[service.serviceType]) {
      serviceTypeMetrics[service.serviceType] = { totalDays: 0, count: 0 };
    }
    serviceTypeMetrics[service.serviceType].totalDays += actualDays;
    serviceTypeMetrics[service.serviceType].count += 1;
  });

  const avgCompletionDays = Math.round(totalDays / completedServices.length);
  const avgCompletionRate = totalCompletionRates / completedServices.length;

  const formattedMetrics: HistoricalMetrics['serviceTypeMetrics'] = {};
  Object.entries(serviceTypeMetrics).forEach(([type, data]) => {
    formattedMetrics[type] = {
      avgDays: Math.round(data.totalDays / data.count),
      count: data.count,
    };
  });

  return {
    avgCompletionDays,
    avgCompletionRate,
    totalCompleted: completedServices.length,
    serviceTypeMetrics: formattedMetrics,
  };
}

/**
 * Get expected hours for a service in a given month
 */
function getServiceHoursForMonth(
  service: ServiceProject,
  month: Date,
  historicalMetrics: HistoricalMetrics
): number {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // For active services, use actual dates
  if (service.status === 'active') {
    const serviceStart = new Date(service.startDate);
    const serviceEnd = new Date(service.deadline);

    // Service doesn't overlap with this month
    if (serviceEnd < monthStart || serviceStart > monthEnd) {
      return 0;
    }

    // Get total hours for this service
    let salaryMax: number | undefined;
    if (service.serviceType === 'executive-search' && service.jobId) {
      const job = getJobById(service.jobId);
      salaryMax = job?.salaryMax;
    }

    const totalHours = getServiceHours(service.serviceType, salaryMax);

    // Calculate what portion falls in this month
    // Simplified: distribute hours evenly across service duration
    const serviceDurationDays = Math.ceil(
      (serviceEnd.getTime() - serviceStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const hoursPerDay = totalHours / serviceDurationDays;

    // Count days in this month
    const overlapStart = serviceStart > monthStart ? serviceStart : monthStart;
    const overlapEnd = serviceEnd < monthEnd ? serviceEnd : monthEnd;
    const daysInMonth = Math.ceil(
      (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    return Math.round(hoursPerDay * daysInMonth);
  }

  // For pipeline services (on-hold), estimate based on historical data
  if (service.status === 'on-hold') {
    // Assume service might start this month or soon
    // Use historical average completion time to estimate duration
    const avgDays = historicalMetrics.serviceTypeMetrics[service.serviceType]?.avgDays || 30;

    let salaryMax: number | undefined;
    if (service.serviceType === 'executive-search' && service.jobId) {
      const job = getJobById(service.jobId);
      salaryMax = job?.salaryMax;
    }

    const totalHours = getServiceHours(service.serviceType, salaryMax);
    const hoursPerDay = totalHours / avgDays;

    // Estimate 30 days of work in this month (conservative)
    return Math.round(hoursPerDay * 30);
  }

  return 0;
}

/**
 * Calculate time off hours for a consultant in a specific month
 */
function getTimeOffHoursForMonth(consultantId: string, month: Date): { days: number; hours: number } {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const timeOffRequests = getTimeOffRequests({
    consultantId,
    status: 'approved',
  });

  let totalDays = 0;

  timeOffRequests.forEach(request => {
    const requestStart = new Date(request.startDate);
    const requestEnd = new Date(request.endDate);

    // Check if request overlaps with this month
    if (requestStart <= monthEnd && requestEnd >= monthStart) {
      const overlapStart = requestStart > monthStart ? requestStart : monthStart;
      const overlapEnd = requestEnd < monthEnd ? requestEnd : monthEnd;

      const days = Math.ceil(
        (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      totalDays += days;
    }
  });

  return {
    days: totalDays,
    hours: totalDays * 8, // 8 hours per day
  };
}

/**
 * Generate forecast for a specific month and consultant
 */
function forecastConsultantMonth(
  consultantId: string,
  consultantName: string,
  month: Date,
  historicalMetrics: HistoricalMetrics
): ConsultantMonthForecast {
  const allServices = getAllServiceProjects();

  // Get active services for this consultant in this month
  const activeServices = allServices.filter(
    s => s.status === 'active' && s.consultants.some(c => c.id === consultantId)
  );

  // Get pipeline services (on-hold) that might start
  const pipelineServices = allServices.filter(
    s => s.status === 'on-hold' && s.consultants.some(c => c.id === consultantId)
  );

  // Calculate hours from active services
  const activeServiceItems: ServiceForecastItem[] = activeServices.map(service => {
    const hours = getServiceHoursForMonth(service, month, historicalMetrics);
    return {
      id: service.id,
      name: service.name,
      serviceType: service.serviceType,
      hours,
      probability: 100,
      expectedStart: service.startDate,
      expectedEnd: service.deadline,
    };
  });

  // Calculate hours from pipeline services (with probability)
  const pipelineServiceItems: ServiceForecastItem[] = pipelineServices.map(service => {
    const hours = getServiceHoursForMonth(service, month, historicalMetrics);
    // Reduce hours by probability (e.g., 60% chance of activation)
    const probability = 60;
    return {
      id: service.id,
      name: service.name,
      serviceType: service.serviceType,
      hours: Math.round(hours * (probability / 100)),
      probability,
      expectedStart: service.startDate,
      expectedEnd: service.deadline,
    };
  });

  const activeHours = activeServiceItems.reduce((sum, s) => sum + s.hours, 0);
  const pipelineHours = pipelineServiceItems.reduce((sum, s) => sum + s.hours, 0);
  const totalHoursAssigned = activeHours + pipelineHours;

  // Get time off for this month
  const { days: timeOffDays, hours: timeOffHours } = getTimeOffHoursForMonth(consultantId, month);

  // Calculate adjusted capacity
  const adjustedCapacity = Math.max(0, MONTHLY_HOURS_AVAILABLE - timeOffHours);
  const hoursAvailable = Math.max(0, adjustedCapacity - totalHoursAssigned);
  const utilizationPercent = adjustedCapacity > 0 ? (totalHoursAssigned / adjustedCapacity) * 100 : 0;

  let status: ConsultantMonthForecast['status'];
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
    consultantId,
    consultantName,
    hoursAssigned: totalHoursAssigned,
    hoursAvailable,
    adjustedCapacity,
    timeOffDays,
    timeOffHours,
    utilizationPercent: Math.round(utilizationPercent),
    status,
    activeServices: activeServiceItems,
    pipelineServices: pipelineServiceItems,
  };
}

/**
 * Generate workload forecast for the next N months
 */
export async function generateWorkloadForecast(monthsAhead: number = 6): Promise<MonthlyForecast[]> {
  const allConsultants = await getAllConsultants();
  const consultants = allConsultants.filter(c => c.status === 'ACTIVE');
  const historicalMetrics = calculateHistoricalMetrics();

  const forecasts: MonthlyForecast[] = [];
  const today = new Date();

  for (let i = 0; i < monthsAhead; i++) {
    const month = addMonths(startOfMonth(today), i);
    const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const consultantForecasts = consultants.map(consultant =>
      forecastConsultantMonth(
        consultant.id,
        `${consultant.firstName} ${consultant.lastName}`,
        month,
        historicalMetrics
      )
    );

    const teamTotalHoursAssigned = consultantForecasts.reduce((sum, c) => sum + c.hoursAssigned, 0);
    const teamTotalHoursAvailable = consultantForecasts.reduce((sum, c) => sum + c.adjustedCapacity, 0);
    const teamAverageUtilization =
      teamTotalHoursAvailable > 0
        ? Math.round((teamTotalHoursAssigned / teamTotalHoursAvailable) * 100)
        : 0;

    const overloadedConsultants = consultantForecasts.filter(c => c.status === 'overloaded').length;
    const atCapacityConsultants = consultantForecasts.filter(c => c.status === 'at-capacity').length;

    forecasts.push({
      month,
      monthLabel,
      consultantForecasts,
      teamAverageUtilization,
      teamTotalHoursAssigned,
      teamTotalHoursAvailable,
      overloadedConsultants,
      atCapacityConsultants,
    });
  }

  return forecasts;
}

/**
 * Get capacity alerts for upcoming months
 */
export function getCapacityAlerts(forecasts: MonthlyForecast[]): Array<{
  month: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  consultants: string[];
}> {
  const alerts: Array<{
    month: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    consultants: string[];
  }> = [];

  forecasts.forEach(forecast => {
    // Critical: Multiple consultants overloaded
    if (forecast.overloadedConsultants > 2) {
      alerts.push({
        month: forecast.monthLabel,
        severity: 'critical',
        message: `${forecast.overloadedConsultants} consultants projected to be overloaded`,
        consultants: forecast.consultantForecasts
          .filter(c => c.status === 'overloaded')
          .map(c => c.consultantName),
      });
    }
    // Warning: Team average very high
    else if (forecast.teamAverageUtilization > 90) {
      alerts.push({
        month: forecast.monthLabel,
        severity: 'warning',
        message: `Team utilization projected at ${forecast.teamAverageUtilization}%`,
        consultants: [],
      });
    }
    // Info: Low utilization
    else if (forecast.teamAverageUtilization < 40) {
      alerts.push({
        month: forecast.monthLabel,
        severity: 'info',
        message: `Team utilization projected at ${forecast.teamAverageUtilization}% - consider new business`,
        consultants: [],
      });
    }
  });

  return alerts;
}
