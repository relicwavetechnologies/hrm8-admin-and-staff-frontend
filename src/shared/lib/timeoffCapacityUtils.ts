import { getTimeOffRequests } from './timeoffStorage';
import { MONTHLY_HOURS_AVAILABLE } from './serviceHoursConfig';

const HOURS_PER_DAY = 8;

export interface TimeOffAdjustment {
  consultantId: string;
  month: Date;
  scheduledDaysOff: number;
  hoursOff: number;
  adjustedHoursAvailable: number;
  upcomingTimeOff: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
  }>;
}

/**
 * Calculate working days that fall within a given month for a time off request
 */
function calculateWorkingDaysInMonth(
  startDate: string,
  endDate: string,
  month: Date
): number {
  const requestStart = new Date(startDate);
  const requestEnd = new Date(endDate);

  // Get month boundaries
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Find overlap
  const overlapStart = requestStart > monthStart ? requestStart : monthStart;
  const overlapEnd = requestEnd < monthEnd ? requestEnd : monthEnd;

  // No overlap
  if (overlapStart > overlapEnd) {
    return 0;
  }

  // Calculate days (inclusive)
  const diffTime = overlapEnd.getTime() - overlapStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // TODO: Could enhance to exclude weekends if needed
  return diffDays;
}

/**
 * Calculate adjusted capacity for a consultant in a specific month
 */
export function calculateAdjustedCapacity(
  consultantId: string,
  month: Date = new Date()
): TimeOffAdjustment {
  // Get start and end of month
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // const startDateStr = monthStart.toISOString().split('T')[0];
  // const endDateStr = monthEnd.toISOString().split('T')[0];

  // Get approved time off requests for this consultant in this month
  const allRequests = getTimeOffRequests({
    consultantId,
    status: 'approved',
  });

  // Filter requests that overlap with this month
  const monthRequests = allRequests.filter(request => {
    const requestStart = new Date(request.startDate);
    const requestEnd = new Date(request.endDate);
    return requestStart <= monthEnd && requestEnd >= monthStart;
  });

  // Calculate total days off in this month
  let scheduledDaysOff = 0;
  monthRequests.forEach(request => {
    scheduledDaysOff += calculateWorkingDaysInMonth(
      request.startDate,
      request.endDate,
      month
    );
  });

  // Check for blockout periods (these affect availability differently)
  // Blockouts typically mean NO ONE can take time off, not that they're off
  // So we don't reduce capacity for blockouts

  // Calculate hours off
  const hoursOff = scheduledDaysOff * HOURS_PER_DAY;

  // Calculate adjusted available hours
  const adjustedHoursAvailable = Math.max(0, MONTHLY_HOURS_AVAILABLE - hoursOff);

  // Get upcoming time off (next 60 days)
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 60);

  const upcomingRequests = allRequests.filter(request => {
    const requestStart = new Date(request.startDate);
    return requestStart >= now && requestStart <= futureDate;
  });

  const upcomingTimeOff = upcomingRequests.map(request => ({
    id: request.id,
    type: request.type,
    startDate: request.startDate,
    endDate: request.endDate,
    totalDays: request.totalDays,
  }));

  return {
    consultantId,
    month,
    scheduledDaysOff,
    hoursOff,
    adjustedHoursAvailable,
    upcomingTimeOff,
  };
}

/**
 * Get time off adjustments for multiple consultants
 */
export function calculateTeamCapacityAdjustments(
  consultantIds: string[],
  month: Date = new Date()
): Map<string, TimeOffAdjustment> {
  const adjustments = new Map<string, TimeOffAdjustment>();

  consultantIds.forEach(id => {
    adjustments.set(id, calculateAdjustedCapacity(id, month));
  });

  return adjustments;
}

/**
 * Check if a consultant has time off scheduled in a date range
 */
export function hasScheduledTimeOff(
  consultantId: string,
  startDate: string,
  endDate: string
): boolean {
  const requests = getTimeOffRequests({
    consultantId,
    status: 'approved',
  });

  const start = new Date(startDate);
  const end = new Date(endDate);

  return requests.some(request => {
    const requestStart = new Date(request.startDate);
    const requestEnd = new Date(request.endDate);

    // Check for overlap
    return requestStart <= end && requestEnd >= start;
  });
}
