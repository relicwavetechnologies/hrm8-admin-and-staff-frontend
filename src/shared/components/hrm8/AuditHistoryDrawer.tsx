/**
 * Audit History Drawer Component
 * Shows governance audit trail for licensees and regions
 */

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/shared/components/ui/sheet';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Loader2, History, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { complianceService, AuditLogEntry } from '@/shared/lib/hrm8/complianceService';
import { format } from 'date-fns';

interface AuditHistoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityType: 'LICENSEE' | 'REGION';
    entityId: string;
    entityName: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'CREATE': { label: 'Created', variant: 'default' },
    'UPDATE': { label: 'Updated', variant: 'secondary' },
    'SUSPEND': { label: 'Suspended', variant: 'destructive' },
    'REACTIVATE': { label: 'Reactivated', variant: 'default' },
    'TERMINATE': { label: 'Terminated', variant: 'destructive' },
    'ASSIGN_REGION': { label: 'Region Assigned', variant: 'secondary' },
    'UNASSIGN_REGION': { label: 'Region Unassigned', variant: 'outline' },
    'TRANSFER': { label: 'Transferred', variant: 'secondary' },
};

export function AuditHistoryDrawer({
    open,
    onOpenChange,
    entityType,
    entityId,
    entityName,
}: AuditHistoryDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && entityId) {
            loadHistory();
        }
    }, [open, entityId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await complianceService.getAuditHistory(entityType, entityId, 50);
            if (response.success && response.data) {
                setEntries(response.data.history || []);
            } else {
                setError('Failed to load audit history');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load audit history');
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        const config = ACTION_LABELS[action] || { label: action, variant: 'outline' as const };
        return (
            <Badge variant={config.variant} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    const formatValue = (value: Record<string, unknown> | null): string => {
        if (!value) return '-';

        // Show only key changes, not entire object
        const keys = Object.keys(value);
        if (keys.length === 0) return '-';

        if (keys.length <= 3) {
            return keys.map(k => `${k}: ${value[k]}`).join(', ');
        }

        return `${keys.length} fields changed`;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:w-[600px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Audit History
                    </SheetTitle>
                    <SheetDescription>
                        {entityType === 'LICENSEE' ? 'Licensee' : 'Region'}: <strong>{entityName}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <History className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No audit history found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Actions like suspend, terminate, and updates will appear here
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="space-y-4 pr-4">
                                {entries.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className="relative border-l-2 border-muted pl-4 pb-4 last:pb-0"
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary" />

                                        {/* Entry header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {getActionBadge(entry.action)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(entry.performedAt), 'MMM d, yyyy h:mm a')}
                                            </div>
                                        </div>

                                        {/* Performed by */}
                                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span>{entry.performedBy || 'System'}</span>
                                        </div>

                                        {/* Notes */}
                                        {entry.notes && (
                                            <div className="mt-2 p-2 bg-muted rounded-md">
                                                <div className="flex items-start gap-1">
                                                    <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                                    <p className="text-sm">{entry.notes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Changes */}
                                        {(entry.oldValue || entry.newValue) && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {entry.oldValue && (
                                                    <div className="line-through">{formatValue(entry.oldValue)}</div>
                                                )}
                                                {entry.newValue && (
                                                    <div className="text-foreground">{formatValue(entry.newValue)}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
