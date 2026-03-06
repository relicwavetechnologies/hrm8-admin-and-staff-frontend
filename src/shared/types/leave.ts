export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveApprovalStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  isPaid: boolean;
  requiresApproval: boolean;
  maxDaysPerYear?: number;
  allowNegativeBalance: boolean;
  carryoverAllowed: boolean;
  maxCarryoverDays?: number;
  requiresDocumentation: boolean;
  minNoticeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  attachments?: string[];
  approvalWorkflow: LeaveApproval[];
  currentApprovalLevel: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  responseNotes?: string;
}

export interface LeaveApproval {
  id: string;
  leaveRequestId: string;
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: LeaveApprovalStatus;
  respondedAt?: string;
  notes?: string;
  isRequired: boolean;
}

export interface LeaveApprovalRule {
  id: string;
  leaveTypeId?: string; // If null, applies to all leave types
  level: number;
  roleOrEmployeeId: string;
  roleOrEmployeeName: string;
  isRole: boolean; // true = role, false = specific employee
  isRequired: boolean; // If false, can be skipped
  autoApproveAfterDays?: number;
  notifyOnSubmission: boolean;
  createdAt: string;
}

export interface LeaveCalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  totalDays: number;
}
