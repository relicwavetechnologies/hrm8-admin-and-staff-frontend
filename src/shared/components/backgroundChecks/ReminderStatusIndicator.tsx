import { Bell, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useAutomatedReminders } from '@/shared/hooks/useAutomatedReminders';
import { useEffect, useState } from 'react';

export function ReminderStatusIndicator() {
  const { getStats, manualCheck, lastCheck } = useAutomatedReminders({ enabled: true });
  const [stats, setStats] = useState({
    pendingReminders: 0,
    overdueCount: 0,
    pendingConsents: 0,
    overdueConsents: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getStats]);

  const totalPending = stats.pendingReminders + stats.pendingConsents;
  const totalOverdue = stats.overdueCount + stats.overdueConsents;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Automated Reminders</CardTitle>
          </div>
          <Badge variant={totalOverdue > 0 ? "destructive" : "secondary"} className="text-xs">
            Active
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {lastCheck ? `Last checked: ${new Date(lastCheck).toLocaleTimeString()}` : 'Checking...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-amber-500" />
            <div>
              <div className="font-medium">{totalPending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div>
              <div className="font-medium">{totalOverdue}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-1.5 border-t text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Referee Reminders:</span>
            <span className="font-medium">{stats.pendingReminders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consent Reminders:</span>
            <span className="font-medium">{stats.pendingConsents}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>Overdue Referees:</span>
            <span className="font-medium">{stats.overdueCount}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>Overdue Consents:</span>
            <span className="font-medium">{stats.overdueConsents}</span>
          </div>
        </div>

        <Button 
          onClick={manualCheck} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          <Bell className="h-3 w-3 mr-1.5" />
          Send Reminders Now
        </Button>
      </CardContent>
    </Card>
  );
}
