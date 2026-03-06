// Time Off Management Types

export type TimeOffStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'bereavement' | 'unpaid';

export interface TimeOffBalance {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
}

export interface TimeOffRequest {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
  status: TimeOffStatus;
  coverageConsultantId?: string;
  coverageConsultantName?: string;
  coverageNotes?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockoutPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  reason: string;
  appliesToAll: boolean;
  consultantIds: string[];
  allowExceptions: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CoverageAssignment {
  id: string;
  requestId: string;
  consultantId: string;
  consultantName: string;
  coveringConsultantId: string;
  coveringConsultantName: string;
  startDate: string;
  endDate: string;
  tasks: string[];
  notes?: string;
  status: 'pending' | 'accepted' | 'declined';
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  createdAt: string;
}

export interface TimeOffCalendarEvent {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: TimeOffStatus;
  isBlockout?: boolean;
}

export interface TimeOffStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysOff: number;
  upcomingDaysOff: number;
  utilizationRate: number;
}
