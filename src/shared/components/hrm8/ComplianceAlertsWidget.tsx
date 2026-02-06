/**
 * Compliance Alerts Widget
 * Displays compliance alerts on the HRM8 Admin dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, AlertCircle, Clock, DollarSign, TrendingDown, FileWarning, RefreshCw } from 'lucide-react';
import { complianceService, ComplianceAlert, AlertSummary } from '@/shared/services/hrm8/complianceService';
import { Skeleton } from '@/shared/components/ui/skeleton';

const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
};

const typeIcons = {
    OVERDUE_PAYOUT: DollarSign,
    INACTIVE_REGION: Clock,
    REVENUE_DECLINE: TrendingDown,
    EXPIRED_AGREEMENT: FileWarning,
};

export function ComplianceAlertsWidget() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
    const [summary, setSummary] = useState<AlertSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const [alertsRes, summaryRes] = await Promise.all([
                complianceService.getAlerts(),
                complianceService.getAlertSummary(),
            ]);

            if (alertsRes.data?.alerts) {
                setAlerts(alertsRes.data.alerts.slice(0, 5)); // Show top 5
            }
            if (summaryRes.data) {
                setSummary(summaryRes.data);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Compliance Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Compliance Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadAlerts} className="mt-2">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Compliance Alerts
                    </CardTitle>
                    <CardDescription>Issues requiring attention</CardDescription>
                </div>
                {summary && summary.total > 0 && (
                    <div className="flex items-center gap-2">
                        {summary.critical > 0 && (
                            <Badge variant="destructive">{summary.critical} Critical</Badge>
                        )}
                        {summary.high > 0 && (
                            <Badge className="bg-orange-500">{summary.high} High</Badge>
                        )}
                        {summary.medium > 0 && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                {summary.medium} Medium
                            </Badge>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <AlertCircle className="h-10 w-10 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-green-600">All Clear</p>
                        <p className="text-xs text-muted-foreground">No compliance issues detected</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert) => {
                            const Icon = typeIcons[alert.type] || AlertTriangle;
                            return (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div
                                        className={`p-2 rounded-full ${alert.severity === 'CRITICAL'
                                                ? 'bg-red-100 text-red-600'
                                                : alert.severity === 'HIGH'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-yellow-100 text-yellow-600'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">{alert.title}</p>
                                            <Badge variant="outline" className={severityColors[alert.severity]}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {alert.entity_type}: {alert.entity_name}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {summary && summary.total > 5 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => navigate('/hrm8/notifications?tab=alerts')}
                            >
                                View all {summary.total} alerts
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
