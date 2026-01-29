import type { 
  TimeOffBalance, 
  TimeOffRequest, 
  BlockoutPeriod, 
  CoverageAssignment,
  TimeOffCalendarEvent,
  TimeOffStats,
  TimeOffType,
  TimeOffStatus
} from '@/shared/types/timeoff';

const TIMEOFF_BALANCES_KEY = 'hrms_timeoff_balances';
const TIMEOFF_REQUESTS_KEY = 'hrms_timeoff_requests';
const BLOCKOUT_PERIODS_KEY = 'hrms_blockout_periods';
const COVERAGE_ASSIGNMENTS_KEY = 'hrms_coverage_assignments';

// Initialize with mock data
const mockBalances: TimeOffBalance[] = [
  {
    id: 'tb1',
    consultantId: '1',
    consultantName: 'Sarah Johnson',
    type: 'vacation',
    year: 2025,
    allocated: 20,
    used: 8,
    pending: 3,
    available: 9,
    carriedOver: 0,
  },
  {
    id: 'tb2',
    consultantId: '1',
    consultantName: 'Sarah Johnson',
    type: 'sick',
    year: 2025,
    allocated: 10,
    used: 2,
    pending: 0,
    available: 8,
    carriedOver: 0,
  },
];

const mockRequests: TimeOffRequest[] = [
  {
    id: 'tr1',
    consultantId: '1',
    consultantName: 'Sarah Johnson',
    type: 'vacation',
    startDate: '2025-12-20',
    endDate: '2025-12-31',
    totalDays: 10,
    isHalfDay: false,
    reason: 'Holiday vacation',
    status: 'approved',
    coverageConsultantId: '2',
    coverageConsultantName: 'David Martinez',
    approvedBy: 'admin1',
    approvedByName: 'Admin User',
    approvedAt: '2025-11-05T10:00:00Z',
    submittedAt: '2025-11-01T09:00:00Z',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-11-05T10:00:00Z',
  },
];

const mockBlockouts: BlockoutPeriod[] = [
  {
    id: 'bp1',
    name: 'Year-End Freeze',
    description: 'No time off during year-end close',
    startDate: '2025-12-26',
    endDate: '2025-12-31',
    reason: 'Critical business period - year-end financial close',
    appliesToAll: true,
    consultantIds: [],
    allowExceptions: false,
    createdBy: 'admin1',
    createdByName: 'Admin User',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    isActive: true,
  },
];

// Time Off Balances
export function getTimeOffBalances(consultantId?: string, year?: number): TimeOffBalance[] {
  const stored = localStorage.getItem(TIMEOFF_BALANCES_KEY);
  let balances = stored ? JSON.parse(stored) : mockBalances;
  
  if (consultantId) {
    balances = balances.filter((b: TimeOffBalance) => b.consultantId === consultantId);
  }
  
  if (year) {
    balances = balances.filter((b: TimeOffBalance) => b.year === year);
  }
  
  return balances;
}

export function updateTimeOffBalance(balance: TimeOffBalance): void {
  const balances = getTimeOffBalances();
  const index = balances.findIndex(b => b.id === balance.id);
  
  if (index >= 0) {
    balances[index] = balance;
  } else {
    balances.push(balance);
  }
  
  localStorage.setItem(TIMEOFF_BALANCES_KEY, JSON.stringify(balances));
}

// Time Off Requests
export function getTimeOffRequests(filters?: {
  consultantId?: string;
  status?: TimeOffStatus;
  startDate?: string;
  endDate?: string;
}): TimeOffRequest[] {
  const stored = localStorage.getItem(TIMEOFF_REQUESTS_KEY);
  let requests = stored ? JSON.parse(stored) : mockRequests;
  
  if (filters?.consultantId) {
    requests = requests.filter((r: TimeOffRequest) => r.consultantId === filters.consultantId);
  }
  
  if (filters?.status) {
    requests = requests.filter((r: TimeOffRequest) => r.status === filters.status);
  }
  
  if (filters?.startDate) {
    requests = requests.filter((r: TimeOffRequest) => r.startDate >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    requests = requests.filter((r: TimeOffRequest) => r.endDate <= filters.endDate!);
  }
  
  return requests.sort((a: TimeOffRequest, b: TimeOffRequest) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export function getTimeOffRequestById(id: string): TimeOffRequest | undefined {
  return getTimeOffRequests().find(req => req.id === id);
}

export function createTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>): TimeOffRequest {
  const newRequest: TimeOffRequest = {
    ...request,
    id: `tr${Date.now()}`,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const requests = getTimeOffRequests();
  requests.push(newRequest);
  localStorage.setItem(TIMEOFF_REQUESTS_KEY, JSON.stringify(requests));
  
  // Update pending balance
  updatePendingBalance(newRequest.consultantId, newRequest.type, newRequest.totalDays);
  
  return newRequest;
}

export function updateTimeOffRequest(id: string, updates: Partial<TimeOffRequest>): void {
  const requests = getTimeOffRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index >= 0) {
    requests[index] = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(TIMEOFF_REQUESTS_KEY, JSON.stringify(requests));
  }
}

export function approveTimeOffRequest(id: string, approvedBy: string, approvedByName: string): void {
  const request = getTimeOffRequestById(id);
  if (!request) return;
  
  updateTimeOffRequest(id, {
    status: 'approved',
    approvedBy,
    approvedByName,
    approvedAt: new Date().toISOString(),
  });
  
  // Update balances
  updateUsedBalance(request.consultantId, request.type, request.totalDays);
  updatePendingBalance(request.consultantId, request.type, -request.totalDays);
}

export function rejectTimeOffRequest(id: string, rejectedBy: string, rejectedByName: string, reason: string): void {
  const request = getTimeOffRequestById(id);
  if (!request) return;
  
  updateTimeOffRequest(id, {
    status: 'rejected',
    rejectedBy,
    rejectedByName,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  });
  
  // Update pending balance
  updatePendingBalance(request.consultantId, request.type, -request.totalDays);
}

export function cancelTimeOffRequest(id: string): void {
  const request = getTimeOffRequestById(id);
  if (!request) return;
  
  updateTimeOffRequest(id, {
    status: 'cancelled',
  });
  
  // Update balances based on current status
  if (request.status === 'approved') {
    updateUsedBalance(request.consultantId, request.type, -request.totalDays);
  } else if (request.status === 'pending') {
    updatePendingBalance(request.consultantId, request.type, -request.totalDays);
  }
}

// Blockout Periods
export function getBlockoutPeriods(activeOnly: boolean = false): BlockoutPeriod[] {
  const stored = localStorage.getItem(BLOCKOUT_PERIODS_KEY);
  let periods = stored ? JSON.parse(stored) : mockBlockouts;
  
  if (activeOnly) {
    periods = periods.filter((p: BlockoutPeriod) => p.isActive);
  }
  
  return periods.sort((a: BlockoutPeriod, b: BlockoutPeriod) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export function createBlockoutPeriod(period: Omit<BlockoutPeriod, 'id' | 'createdAt' | 'updatedAt'>): BlockoutPeriod {
  const newPeriod: BlockoutPeriod = {
    ...period,
    id: `bp${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const periods = getBlockoutPeriods();
  periods.push(newPeriod);
  localStorage.setItem(BLOCKOUT_PERIODS_KEY, JSON.stringify(periods));
  
  return newPeriod;
}

export function updateBlockoutPeriod(id: string, updates: Partial<BlockoutPeriod>): void {
  const periods = getBlockoutPeriods();
  const index = periods.findIndex(p => p.id === id);
  
  if (index >= 0) {
    periods[index] = {
      ...periods[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(BLOCKOUT_PERIODS_KEY, JSON.stringify(periods));
  }
}

export function deleteBlockoutPeriod(id: string): void {
  const periods = getBlockoutPeriods().filter(p => p.id !== id);
  localStorage.setItem(BLOCKOUT_PERIODS_KEY, JSON.stringify(periods));
}

export function isDateInBlockoutPeriod(date: string, consultantId: string): BlockoutPeriod | null {
  const periods = getBlockoutPeriods(true);
  const checkDate = new Date(date);
  
  for (const period of periods) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    if (checkDate >= start && checkDate <= end) {
      if (period.appliesToAll || period.consultantIds.includes(consultantId)) {
        return period;
      }
    }
  }
  
  return null;
}

// Coverage Assignments
export function getCoverageAssignments(filters?: {
  consultantId?: string;
  coveringConsultantId?: string;
  status?: 'pending' | 'accepted' | 'declined';
}): CoverageAssignment[] {
  const stored = localStorage.getItem(COVERAGE_ASSIGNMENTS_KEY);
  let assignments = stored ? JSON.parse(stored) : [];
  
  if (filters?.consultantId) {
    assignments = assignments.filter((a: CoverageAssignment) => a.consultantId === filters.consultantId);
  }
  
  if (filters?.coveringConsultantId) {
    assignments = assignments.filter((a: CoverageAssignment) => a.coveringConsultantId === filters.coveringConsultantId);
  }
  
  if (filters?.status) {
    assignments = assignments.filter((a: CoverageAssignment) => a.status === filters.status);
  }
  
  return assignments;
}

export function createCoverageAssignment(assignment: Omit<CoverageAssignment, 'id' | 'createdAt'>): CoverageAssignment {
  const newAssignment: CoverageAssignment = {
    ...assignment,
    id: `ca${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  const assignments = getCoverageAssignments();
  assignments.push(newAssignment);
  localStorage.setItem(COVERAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  
  return newAssignment;
}

export function updateCoverageAssignment(id: string, updates: Partial<CoverageAssignment>): void {
  const assignments = getCoverageAssignments();
  const index = assignments.findIndex(a => a.id === id);
  
  if (index >= 0) {
    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(COVERAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }
}

// Calendar Events
export function getTimeOffCalendarEvents(startDate?: string, endDate?: string): TimeOffCalendarEvent[] {
  const requests = getTimeOffRequests({ status: 'approved' });
  const blockouts = getBlockoutPeriods(true);
  
  let events: TimeOffCalendarEvent[] = requests.map(r => ({
    id: r.id,
    consultantId: r.consultantId,
    consultantName: r.consultantName,
    type: r.type,
    startDate: r.startDate,
    endDate: r.endDate,
    totalDays: r.totalDays,
    status: r.status,
  }));
  
  // Add blockout periods as events
  blockouts.forEach(b => {
    events.push({
      id: b.id,
      consultantId: 'all',
      consultantName: b.name,
      type: 'vacation',
      startDate: b.startDate,
      endDate: b.endDate,
      totalDays: calculateDays(b.startDate, b.endDate),
      status: 'approved',
      isBlockout: true,
    });
  });
  
  if (startDate) {
    events = events.filter(e => e.endDate >= startDate);
  }
  
  if (endDate) {
    events = events.filter(e => e.startDate <= endDate);
  }
  
  return events;
}

// Statistics
export function getTimeOffStats(consultantId: string, year: number): TimeOffStats {
  const requests = getTimeOffRequests({ consultantId });
  const yearRequests = requests.filter(r => 
    new Date(r.startDate).getFullYear() === year
  );
  
  const now = new Date();
  const upcomingRequests = yearRequests.filter(r => 
    r.status === 'approved' && new Date(r.startDate) > now
  );
  
  const balances = getTimeOffBalances(consultantId, year);
  const totalAllocated = balances.reduce((sum, b) => sum + b.allocated, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  
  return {
    totalRequests: yearRequests.length,
    pendingRequests: yearRequests.filter(r => r.status === 'pending').length,
    approvedRequests: yearRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: yearRequests.filter(r => r.status === 'rejected').length,
    totalDaysOff: totalUsed,
    upcomingDaysOff: upcomingRequests.reduce((sum, r) => sum + r.totalDays, 0),
    utilizationRate: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0,
  };
}

// Helper functions
function updateUsedBalance(consultantId: string, type: TimeOffType, days: number): void {
  const balances = getTimeOffBalances(consultantId);
  const balance = balances.find(b => b.type === type);
  
  if (balance) {
    balance.used += days;
    balance.available = balance.allocated - balance.used - balance.pending;
    updateTimeOffBalance(balance);
  }
}

function updatePendingBalance(consultantId: string, type: TimeOffType, days: number): void {
  const balances = getTimeOffBalances(consultantId);
  const balance = balances.find(b => b.type === type);
  
  if (balance) {
    balance.pending += days;
    balance.available = balance.allocated - balance.used - balance.pending;
    updateTimeOffBalance(balance);
  }
}

export function calculateDays(startDate: string, endDate: string, isHalfDay: boolean = false): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return isHalfDay ? 0.5 : diffDays;
}
