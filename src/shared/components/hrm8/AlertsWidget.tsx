/**
 * Alerts Widget
 * Dashboard component showing critical system alerts
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';

interface Alert {
  id: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

interface AlertsData {
  alerts: Alert[];
  counts: {
    CRITICAL: number;
    WARNING: number;
    INFO: number;
  };
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  WARNING: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  INFO: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
};

export function AlertsWidget() {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await apiClient.get<AlertsData>('/api/hrm8/alerts');
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No active alerts
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlerts = data.counts.CRITICAL + data.counts.WARNING + data.counts.INFO;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          System Alerts
        </CardTitle>
        <div className="flex gap-2">
          {data.counts.CRITICAL > 0 && (
            <Badge className="bg-red-100 text-red-800">{data.counts.CRITICAL} Critical</Badge>
          )}
          {data.counts.WARNING > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">{data.counts.WARNING} Warning</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.alerts.slice(0, 5).map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${config.bgColor}`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })}
          {totalAlerts > 5 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              +{totalAlerts - 5} more alerts
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
