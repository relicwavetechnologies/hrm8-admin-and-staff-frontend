
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Activity,
    Server,
    Database,
    Cpu,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SystemOverview {
    system: {
        health: 'healthy' | 'degraded' | 'critical';
        uptime: number;
        version: string;
        environment: string;
    };
    integrations: {
        total: number;
        active: number;
        failed: number;
        syncStatus: {
            success: number;
            failed: number;
            in_progress: number;
        };
    };
    auditLogs: {
        todayCount: number;
        recentEvents: Array<{
            id: string;
            action: string;
            entity_type: string;
            performed_by_email: string | null;
            performed_at: string;
            status: 'success' | 'failed';
        }>;
    };
    pendingActions: {
        emailTemplates: number;
        integrationSyncs: number;
        systemAlerts: number;
    };
    services: {
        api: 'online' | 'offline';
        database: 'online' | 'offline';
        redis: 'online' | 'offline';
    };
}

export default function SystemOverviewPage() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<SystemOverview>('/api/hrm8/settings/overview');
            if (response.success && response.data) {
                setOverview(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch system overview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-80" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-5 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-44" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-14 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold">Unable to load system status</h2>
                <Button onClick={fetchOverview} variant="outline" className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-emerald-500 bg-emerald-500/10';
            case 'degraded': return 'text-yellow-500 bg-yellow-500/10';
            case 'critical': return 'text-red-500 bg-red-500/10';
            default: return 'text-muted-foreground bg-muted';
        }
    };

    const getStatusIcon = (status: string) => {
        return status === 'online'
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <XCircle className="h-4 w-4 text-red-500" />;
    };

    return (
        <div className="space-y-6">
            {/* Health Status Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getHealthColor(overview.system.health)}`}>
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Status: {overview.system.health.toUpperCase()}</h2>
                        <p className="text-muted-foreground">
                            v{overview.system.version} • {overview.system.environment}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOverview}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Service Status Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Server</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusIcon(overview.services.api)}
                            <span className="font-bold capitalize">{overview.services.api}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusIcon(overview.services.database)}
                            <span className="font-bold capitalize">{overview.services.database}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusIcon(overview.services.redis)}
                            <span className="font-bold capitalize">{overview.services.redis}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Integrations Stats */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Integration Health</CardTitle>
                        <CardDescription>Status of connected 3rd party services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <div className="text-2xl font-bold">{overview.integrations.active}</div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Failed Syncs</p>
                                <div className={`text-2xl font-bold ${overview.integrations.failed > 0 ? 'text-red-500' : ''}`}>
                                    {overview.integrations.failed}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <div className="text-2xl font-bold">{overview.integrations.total}</div>
                            </div>
                        </div>
                        {overview.integrations.failed > 0 && (
                            <div className="mt-6 flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-100">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div className="text-sm text-red-900">
                                        <span className="font-semibold">{overview.integrations.failed} integrations</span> failing to sync
                                    </div>
                                </div>
                                <Button size="sm" variant="destructive" onClick={() => navigate('/hrm8/settings/integrations')}>
                                    View Failed
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pending Actions</CardTitle>
                        <CardDescription>Items requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-orange-500" />
                                <span className="text-sm font-medium">Security Alerts</span>
                            </div>
                            <Badge variant={overview.pendingActions.systemAlerts > 0 ? "destructive" : "secondary"}>
                                {overview.pendingActions.systemAlerts}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium">Sync Issues</span>
                            </div>
                            <Badge variant={overview.pendingActions.integrationSyncs > 0 ? "destructive" : "secondary"}>
                                {overview.pendingActions.integrationSyncs}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Audit Logs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Audit Logs</CardTitle>
                        <CardDescription>Latest system activities ({overview.auditLogs.todayCount} today)</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/settings/audit-logs')}>
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {overview.auditLogs.recentEvents.map((log) => (
                            <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {log.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.entity_type} • {log.performed_by_email || 'System'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(log.performed_at), 'MMM d, h:mm a')}
                                </div>
                            </div>
                        ))}
                        {overview.auditLogs.recentEvents.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No recent activity</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
