import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { auditLogService, AuditLogEntry, AuditLogStats } from '@/shared/lib/hrm8/auditLogService';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { FileText, Activity, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  SUSPEND: 'bg-yellow-100 text-yellow-800',
  REACTIVATE: 'bg-emerald-100 text-emerald-800',
  TRANSFER: 'bg-purple-100 text-purple-800',
  ASSIGN: 'bg-indigo-100 text-indigo-800',
};

export default function AuditLogsPage() {
  const { hrm8User } = useHrm8Auth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [entityTypeFilter, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getRecent({
        entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 100,
      });
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setTotal(response.data.total);
      }
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await auditLogService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load audit stats:', error);
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'performedAt',
      label: 'Time',
      render: (log: AuditLogEntry) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(log.performed_at), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLogEntry) => (
        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
          {log.action}
        </Badge>
      ),
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (log: AuditLogEntry) => (
        <div>
          <span className="font-medium">{log.entity_type}</span>
          <span className="text-xs text-muted-foreground block">
            {log.entity_id.substring(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (log: AuditLogEntry) => (
        <span className="text-sm">{log.description || '-'}</span>
      ),
    },
    {
      key: 'performedByEmail',
      label: 'Performed By',
      render: (log: AuditLogEntry) => (
        <div>
          <span className="text-sm">{log.performed_by_email}</span>
          <span className="text-xs text-muted-foreground block">
            {log.performed_by_role.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: (log: AuditLogEntry) => (
        <span className="text-xs text-muted-foreground">
          {log.ip_address || '-'}
        </span>
      ),
    },
  ];

  if (!isGlobalAdmin) {
    return (
      
        <div className="p-6">
          <Card>
            <CardContent className="py-10 text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                Only Global Administrators can access the audit logs.
              </p>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">Track all administrative actions across the platform</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Entity:</Label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Region">Region</SelectItem>
                  <SelectItem value="Licensee">Licensee</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Job">Job</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Action:</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="SUSPEND">Suspend</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Logs"
            value={stats?.total_logs?.toLocaleString() || '0'}
            change="All time"
            icon={<FileText className="h-6 w-6" />}
            variant="neutral"
          />
          <EnhancedStatCard
            title="Today's Activity"
            value={stats?.today_logs?.toLocaleString() || '0'}
            change="Last 24 hours"
            icon={<Activity className="h-6 w-6" />}
            variant="success"
          />
          <EnhancedStatCard
            title="Showing"
            value={logs.length.toString()}
            change={`of ${total} total`}
            icon={<Clock className="h-6 w-6" />}
            variant="neutral"
          />
          <EnhancedStatCard
            title="Top Action"
            value={stats?.top_actions?.[0]?.action || '-'}
            change={stats?.top_actions?.[0]?.count ? `${stats.top_actions[0].count} times` : ''}
            icon={<User className="h-6 w-6" />}
            variant="neutral"
          />
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : (
              <DataTable
                data={logs}
                columns={columns}
                searchable
                searchKeys={['performed_by_email', 'entity_type', 'action', 'description']}
                emptyMessage="No audit logs found"
              />
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}
