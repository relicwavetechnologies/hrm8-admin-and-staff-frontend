import type { LeaveType, LeaveBalance, LeaveRequest, LeaveApprovalRule } from '@/shared/types/leave';
import { mockLeaveTypes, mockLeaveBalances, mockLeaveRequests, mockLeaveApprovalRules } from '@/shared/data/mockLeaveData';

const LEAVE_TYPES_KEY = 'hrms_leave_types';
const LEAVE_BALANCES_KEY = 'hrms_leave_balances';
const LEAVE_REQUESTS_KEY = 'hrms_leave_requests';
const LEAVE_APPROVAL_RULES_KEY = 'hrms_leave_approval_rules';

// Leave Types
export function getLeaveTypes(): LeaveType[] {
  const stored = localStorage.getItem(LEAVE_TYPES_KEY);
  return stored ? JSON.parse(stored) : mockLeaveTypes;
}

export function getLeaveTypeById(id: string): LeaveType | undefined {
  return getLeaveTypes().find(type => type.id === id);
}

export function saveLeaveType(leaveType: LeaveType): void {
  const types = getLeaveTypes();
  const index = types.findIndex(t => t.id === leaveType.id);

  if (index >= 0) {
    types[index] = { ...leaveType, updatedAt: new Date().toISOString() };
  } else {
    types.push({
      ...leaveType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(LEAVE_TYPES_KEY, JSON.stringify(types));
}

export function deleteLeaveType(id: string): void {
  const types = getLeaveTypes().filter(t => t.id !== id);
  localStorage.setItem(LEAVE_TYPES_KEY, JSON.stringify(types));
}

// Leave Balances
export function getLeaveBalances(employeeId?: string, year?: number): LeaveBalance[] {
  const stored = localStorage.getItem(LEAVE_BALANCES_KEY);
  let balances = stored ? JSON.parse(stored) : mockLeaveBalances;

  if (employeeId) {
    balances = balances.filter((b: LeaveBalance) => b.employeeId === employeeId);
  }

  if (year) {
    balances = balances.filter((b: LeaveBalance) => b.year === year);
  }

  return balances;
}

export function updateLeaveBalance(balance: LeaveBalance): void {
  const balances = getLeaveBalances();
  const index = balances.findIndex(b => b.id === balance.id);

  if (index >= 0) {
    balances[index] = balance;
  } else {
    balances.push(balance);
  }

  localStorage.setItem(LEAVE_BALANCES_KEY, JSON.stringify(balances));
}

// Leave Requests
export function getLeaveRequests(filters?: {
  employeeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): LeaveRequest[] {
  const stored = localStorage.getItem(LEAVE_REQUESTS_KEY);
  let requests = stored ? JSON.parse(stored) : mockLeaveRequests;

  if (filters?.employeeId) {
    requests = requests.filter((r: LeaveRequest) => r.employeeId === filters.employeeId);
  }

  if (filters?.status) {
    requests = requests.filter((r: LeaveRequest) => r.status === filters.status);
  }

  if (filters?.startDate) {
    requests = requests.filter((r: LeaveRequest) => r.startDate >= filters.startDate!);
  }

  if (filters?.endDate) {
    requests = requests.filter((r: LeaveRequest) => r.endDate <= filters.endDate!);
  }

  return requests.sort((a: LeaveRequest, b: LeaveRequest) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export function getLeaveRequestById(id: string): LeaveRequest | undefined {
  return getLeaveRequests().find(req => req.id === id);
}

export function saveLeaveRequest(request: LeaveRequest): void {
  const requests = getLeaveRequests();
  const index = requests.findIndex(r => r.id === request.id);

  if (index >= 0) {
    requests[index] = { ...request, updatedAt: new Date().toISOString() };
  } else {
    requests.push({
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
}

export function deleteLeaveRequest(id: string): void {
  const requests = getLeaveRequests().filter(r => r.id !== id);
  localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
}

// Leave Approval Rules
export function getLeaveApprovalRules(leaveTypeId?: string): LeaveApprovalRule[] {
  const stored = localStorage.getItem(LEAVE_APPROVAL_RULES_KEY);
  let rules = stored ? JSON.parse(stored) : mockLeaveApprovalRules;

  if (leaveTypeId) {
    rules = rules.filter((r: LeaveApprovalRule) =>
      !r.leaveTypeId || r.leaveTypeId === leaveTypeId
    );
  }

  return rules.sort((a: LeaveApprovalRule, b: LeaveApprovalRule) => a.level - b.level);
}

export function saveLeaveApprovalRule(rule: LeaveApprovalRule): void {
  const rules = getLeaveApprovalRules();
  const index = rules.findIndex(r => r.id === rule.id);

  if (index >= 0) {
    rules[index] = rule;
  } else {
    rules.push({
      ...rule,
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(LEAVE_APPROVAL_RULES_KEY, JSON.stringify(rules));
}

export function deleteLeaveApprovalRule(id: string): void {
  const rules = getLeaveApprovalRules().filter(r => r.id !== id);
  localStorage.setItem(LEAVE_APPROVAL_RULES_KEY, JSON.stringify(rules));
}

// Approval Actions
export function approveLeaveRequest(requestId: string, _approverId: string, notes?: string): void {
  const request = getLeaveRequestById(requestId);
  if (!request) return;

  const currentApproval = request.approvalWorkflow[request.currentApprovalLevel];
  if (!currentApproval) return;

  currentApproval.status = 'approved';
  currentApproval.respondedAt = new Date().toISOString();
  currentApproval.notes = notes;

  request.currentApprovalLevel += 1;

  // Check if all approvals are complete
  if (request.currentApprovalLevel >= request.approvalWorkflow.length) {
    request.status = 'approved';
    request.respondedAt = new Date().toISOString();
    request.respondedBy = currentApproval.approverName;
    request.responseNotes = notes;
  }

  saveLeaveRequest(request);
}

export function rejectLeaveRequest(requestId: string, _approverId: string, notes?: string): void {
  const request = getLeaveRequestById(requestId);
  if (!request) return;

  const currentApproval = request.approvalWorkflow[request.currentApprovalLevel];
  if (!currentApproval) return;

  currentApproval.status = 'rejected';
  currentApproval.respondedAt = new Date().toISOString();
  currentApproval.notes = notes;

  request.status = 'rejected';
  request.respondedAt = new Date().toISOString();
  request.respondedBy = currentApproval.approverName;
  request.responseNotes = notes;

  saveLeaveRequest(request);
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
