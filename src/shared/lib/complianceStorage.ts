import { AuditLog, CompliancePolicy, PolicyAcknowledgment, ComplianceReport, ComplianceAlert, DataSubjectRequest } from "@/shared/types/compliance";

export type { CompliancePolicy, DataSubjectRequest, AuditLog };

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: new Date().toISOString(),
    userId: 'user-1',
    userName: 'John Doe',
    action: 'login',
    module: 'auth',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
];

const mockPolicies: CompliancePolicy[] = [
  {
    id: 'policy-1',
    title: 'Code of Conduct',
    category: 'code-of-conduct',
    version: '1.0',
    effectiveDate: '2024-01-01',
    content: 'All employees must adhere to professional conduct standards...',
    requiresAcknowledgment: true,
    targetAudience: 'all',
    createdBy: 'hr-admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const auditLogs = [...mockAuditLogs];
const policies = [...mockPolicies];
const acknowledgments: PolicyAcknowledgment[] = [];
const reports: ComplianceReport[] = [];
const alerts: ComplianceAlert[] = [];
const dsRequests: DataSubjectRequest[] = [];

export function logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const newLog: AuditLog = {
    ...log,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs.push(newLog);
  return newLog;
}

export function getAuditLogs(filters?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  module?: string;
  action?: string;
}): AuditLog[] {
  let filtered = auditLogs;

  if (filters?.startDate) {
    filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(filters.startDate!));
  }
  if (filters?.endDate) {
    filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(filters.endDate!));
  }
  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }
  if (filters?.module) {
    filtered = filtered.filter((log) => log.module === filters.module);
  }
  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getPolicies(): CompliancePolicy[] {
  return policies;
}

export function getPolicy(id: string): CompliancePolicy | undefined {
  return policies.find((p) => p.id === id);
}

export function createPolicy(policy: Omit<CompliancePolicy, 'id' | 'createdAt' | 'updatedAt'>): CompliancePolicy {
  const newPolicy: CompliancePolicy = {
    ...policy,
    id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  policies.push(newPolicy);
  return newPolicy;
}

export function updatePolicy(id: string, updates: Partial<CompliancePolicy>): CompliancePolicy | null {
  const index = policies.findIndex((p) => p.id === id);
  if (index === -1) return null;

  policies[index] = {
    ...policies[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return policies[index];
}

export function acknowledgePolicy(policyId: string, employeeId: string, employeeName: string, ipAddress: string): PolicyAcknowledgment {
  const policy = getPolicy(policyId);
  if (!policy) throw new Error('Policy not found');

  const ack: PolicyAcknowledgment = {
    id: `ack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    policyId,
    policyTitle: policy.title,
    employeeId,
    employeeName,
    acknowledgedAt: new Date().toISOString(),
    ipAddress,
    version: policy.version,
  };

  acknowledgments.push(ack);
  return ack;
}

export function getPolicyAcknowledgments(policyId?: string): PolicyAcknowledgment[] {
  if (policyId) {
    return acknowledgments.filter((ack) => ack.policyId === policyId);
  }
  return acknowledgments;
}

export function getComplianceReports(): ComplianceReport[] {
  return reports;
}

export function createComplianceReport(report: Omit<ComplianceReport, 'id'>): ComplianceReport {
  const newReport: ComplianceReport = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  reports.push(newReport);
  return newReport;
}

export function getComplianceAlerts(): ComplianceAlert[] {
  return alerts.filter((alert) => !alert.resolvedAt);
}

export function createDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'requestDate' | 'dueDate' | 'status'>): DataSubjectRequest {
  const requestDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days to fulfill GDPR request

  const newRequest: DataSubjectRequest = {
    ...request,
    id: `dsr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    requestDate: requestDate.toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'pending',
  };

  dsRequests.push(newRequest);
  return newRequest;
}

export function getDataSubjectRequests(): DataSubjectRequest[] {
  return dsRequests;
}

export function deletePolicy(id: string): boolean {
  const index = policies.findIndex((p) => p.id === id);
  if (index === -1) return false;

  policies.splice(index, 1);
  return true;
}

export function updateDataSubjectRequest(id: string, updates: Partial<DataSubjectRequest>): DataSubjectRequest | null {
  const index = dsRequests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  dsRequests[index] = {
    ...dsRequests[index],
    ...updates,
  };
  return dsRequests[index];
}

export function deleteDataSubjectRequest(id: string): boolean {
  const index = dsRequests.findIndex((r) => r.id === id);
  if (index === -1) return false;

  dsRequests.splice(index, 1);
  return true;
}
