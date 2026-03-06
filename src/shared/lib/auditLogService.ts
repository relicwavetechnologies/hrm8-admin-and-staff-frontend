import type { AuditLog, AuditAction, AuditCategory } from "@/shared/types/audit";

export type { AuditLog, AuditAction, AuditCategory };

// In-memory storage for audit logs
let auditLogs: AuditLog[] = [];

// Subscribers for real-time updates
type AuditLogSubscriber = (logs: AuditLog[]) => void;
const subscribers: Set<AuditLogSubscriber> = new Set();

// Initialize with some mock logs
const initializeMockLogs = () => {
  const now = new Date();
  const mockLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      userId: 'user-1',
      userName: 'John Doe',
      action: 'update',
      category: 'user_management',
      resource: 'User',
      resourceId: 'user-123',
      description: 'Updated user role to HR Admin',
      metadata: {
        changes: {
          role: { before: 'Employee', after: 'HR Admin' }
        }
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      status: 'success'
    },
    {
      id: 'log-2',
      timestamp: new Date(now.getTime() - 7200000).toISOString(),
      userId: 'user-1',
      userName: 'John Doe',
      action: 'create',
      category: 'system_config',
      resource: 'API Key',
      resourceId: 'api-key-456',
      description: 'Generated new API key for production',
      metadata: {
        keyName: 'Production API Key'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      status: 'success'
    }
  ];
  auditLogs = mockLogs;
};

initializeMockLogs();

/**
 * Subscribe to audit log updates
 */
export function subscribeToAuditLogs(callback: AuditLogSubscriber): () => void {
  subscribers.add(callback);
  // Immediately call with current logs
  callback([...auditLogs]);
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Notify all subscribers of log updates
 */
function notifySubscribers() {
  const logsCopy = [...auditLogs];
  subscribers.forEach(callback => callback(logsCopy));
}

/**
 * Get current user info (mock - in production would come from auth)
 */
function getCurrentUser() {
  return {
    id: 'user-1',
    name: 'John Doe',
    ipAddress: '192.168.1.100',
    userAgent: navigator.userAgent
  };
}

/**
 * Create a new audit log entry
 */
export function createAuditLog(params: {
  action: AuditAction;
  category: AuditCategory;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'failure' | 'pending';
}): AuditLog {
  const user = getCurrentUser();
  
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action: params.action,
    category: params.category,
    resource: params.resource,
    resourceId: params.resourceId,
    description: params.description,
    metadata: params.metadata,
    ipAddress: user.ipAddress,
    userAgent: user.userAgent,
    status: params.status || 'success'
  };

  // Add to beginning of array (newest first)
  auditLogs.unshift(log);
  
  // Notify all subscribers
  notifySubscribers();
  
  return log;
}

/**
 * Helper to log user management actions
 */
export function logUserAction(
  action: AuditAction,
  userId: string,
  description: string,
  changes?: Record<string, { before: any; after: any }>
) {
  return createAuditLog({
    action,
    category: 'user_management',
    resource: 'User',
    resourceId: userId,
    description,
    metadata: changes ? { changes } : undefined
  });
}

/**
 * Helper to log system configuration changes
 */
export function logConfigAction(
  action: AuditAction,
  configType: string,
  description: string,
  changes?: Record<string, { before: any; after: any }>
) {
  return createAuditLog({
    action,
    category: 'system_config',
    resource: configType,
    description,
    metadata: changes ? { changes } : undefined
  });
}

/**
 * Helper to log integration actions
 */
export function logIntegrationAction(
  action: AuditAction,
  integrationName: string,
  description: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    action,
    category: 'integration',
    resource: integrationName,
    description,
    metadata
  });
}

/**
 * Helper to log security actions
 */
export function logSecurityAction(
  action: AuditAction,
  securityType: string,
  description: string,
  changes?: Record<string, { before: any; after: any }>
) {
  return createAuditLog({
    action,
    category: 'security',
    resource: securityType,
    description,
    metadata: changes ? { changes } : undefined
  });
}

/**
 * Get all audit logs with optional filters
 */
export function getAuditLogs(filters?: {
  category?: AuditCategory;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}): AuditLog[] {
  let filtered = [...auditLogs];

  if (filters?.category) {
    filtered = filtered.filter(log => log.category === filters.category);
  }

  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }

  if (filters?.startDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) >= filters.startDate!);
  }

  if (filters?.endDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) <= filters.endDate!);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(log =>
      log.description.toLowerCase().includes(searchLower) ||
      log.userName.toLowerCase().includes(searchLower) ||
      log.resource.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Clear all audit logs (admin only)
 */
export function clearAuditLogs() {
  auditLogs = [];
  notifySubscribers();
}

/**
 * Export audit logs to JSON
 */
export function exportAuditLogs(filters?: Parameters<typeof getAuditLogs>[0]): string {
  const logs = filters ? getAuditLogs(filters) : auditLogs;
  return JSON.stringify(logs, null, 2);
}
