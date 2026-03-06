import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAllHealthAlerts } from '@/shared/lib/addons/customerHealthAnalytics';
import { AlertSeverity } from '@/types/customerHealth';

export function HealthAlertsCard() {
  const alerts = getAllHealthAlerts().slice(0, 10);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Alerts</CardTitle>
          <CardDescription>
            Active alerts requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">All Clear!</p>
            <p className="text-sm text-muted-foreground">
              No active health alerts at this time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Alerts</CardTitle>
        <CardDescription>
          {alerts.length} active alerts requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Badge className={getSeverityColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                </Badge>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  
                  {alert.recommendedAction && (
                    <div className="bg-muted p-2 rounded text-sm">
                      <span className="font-medium">Action: </span>
                      {alert.recommendedAction}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="default" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
