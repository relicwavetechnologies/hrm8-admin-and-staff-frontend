export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'execute';
export type AuditCategory = 'user_management' | 'system_config' | 'integration' | 'security' | 'data_access' | 'billing';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  category: AuditCategory;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'pending';
}
