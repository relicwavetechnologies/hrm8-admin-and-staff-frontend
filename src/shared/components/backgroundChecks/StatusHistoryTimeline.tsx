import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Clock, User, Download, Bot } from 'lucide-react';
import { getCheckStatusHistory, exportStatusHistory } from '@/shared/lib/backgroundChecks/statusHistoryService';
import type { StatusChangeRecord } from '@/types/statusHistory';
import { formatDistanceToNow } from 'date-fns';

interface StatusHistoryTimelineProps {
  checkId: string;
}

const statusColors = {
  'not-started': 'secondary',
  'pending-consent': 'warning',
  'in-progress': 'default',
  'completed': 'success',
  'issues-found': 'destructive',
  'cancelled': 'outline',
} as const;

export function StatusHistoryTimeline({ checkId }: StatusHistoryTimelineProps) {
  const history = getCheckStatusHistory(checkId);

  const handleExport = () => {
    const csv = exportStatusHistory({ checkId });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `status-history-${checkId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>No status changes recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Status History</CardTitle>
            <CardDescription>Complete timeline of all status changes</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record, index) => (
            <StatusHistoryItem
              key={record.id}
              record={record}
              isLast={index === history.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusHistoryItemProps {
  record: StatusChangeRecord;
  isLast: boolean;
}

function StatusHistoryItem({ record, isLast }: StatusHistoryItemProps) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
      )}

      {/* Timeline dot */}
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
          {record.automated ? (
            <Bot className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusColors[record.previousStatus]}>
                {record.previousStatus}
              </Badge>
              <span className="text-sm text-muted-foreground">→</span>
              <Badge variant={statusColors[record.newStatus]}>
                {record.newStatus}
              </Badge>
              {record.automated && (
                <Badge variant="outline" className="text-xs">
                  Automated
                </Badge>
              )}
            </div>
            
            {record.reason && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Reason:</span> {record.reason}
              </p>
            )}
            
            {record.notes && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Notes:</span> {record.notes}
              </p>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{record.changedByName}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          {new Date(record.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
