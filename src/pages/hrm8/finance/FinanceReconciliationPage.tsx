import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type Column } from '@/shared/components/tables/DataTable';
import { Timeline } from '@/shared/components/ui/timeline';
import {
    financeOpsService,
    type OutboxDispatchResult,
    type ReconciliationOverview,
    type ReconciliationRunResult,
} from '@/shared/services/hrm8/financeOpsService';
import { useCurrencyFormat } from '@/shared/contexts/CurrencyFormatContext';
import { useToast } from '@/shared/hooks/use-toast';

type TimelineRow = {
    id: string;
    owner: string;
    kind: string;
    status: string;
    timeline: ReconciliationOverview['refunds'][number]['timeline'];
};

export default function FinanceReconciliationPage() {
    const { formatCurrency } = useCurrencyFormat();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<ReconciliationOverview | null>(null);
    const [runResult, setRunResult] = useState<ReconciliationRunResult | null>(null);
    const [outboxResult, setOutboxResult] = useState<OutboxDispatchResult | null>(null);
    const [selectedTimeline, setSelectedTimeline] = useState<TimelineRow | null>(null);
    const [running, setRunning] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const result = await financeOpsService.getReconciliationOverview();
            setOverview(result);
        } catch (error: any) {
            toast({
                title: 'Could not load reconciliation',
                description: error.message || 'Failed to fetch reconciliation overview',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const summary = useMemo(() => {
        if (!overview) {
            return {
                missingProviderRefs: 0,
                missingAccountingRefs: 0,
                companyWithdrawals: 0,
                staffWithdrawals: 0,
            };
        }

        return {
            missingProviderRefs: overview.bills.filter((bill) => bill.mismatchFlags.includes('MISSING_PROVIDER_REFERENCE')).length,
            missingAccountingRefs: overview.bills.filter((bill) => bill.mismatchFlags.includes('MISSING_ACCOUNTING_REFERENCE')).length,
            companyWithdrawals: overview.companyWithdrawals.filter((row) => row.status !== 'COMPLETED').length,
            staffWithdrawals: overview.staffWithdrawals.filter((row) => row.status !== 'COMPLETED').length,
            deadLetterEvents: overview.outbox.summary.deadLetter,
            ledgerDrifts: overview.ledgerChecks.filter((row) => row.status === 'DRIFT').length,
            highRiskItems: overview.riskFlags.length,
        };
    }, [overview]);

    const billColumns: Column<ReconciliationOverview['bills'][number]>[] = [
        {
            key: 'billNumber',
            label: 'Bill',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.billNumber}</div>
                    <div className="text-xs text-muted-foreground">{row.companyName}</div>
                </div>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (row) => formatCurrency(row.amount, row.currency || undefined),
        },
        {
            key: 'refs',
            label: 'Refs',
            render: (row) => (
                <div className="text-xs space-y-1">
                    <div>Provider: {row.providerReference || 'Missing'}</div>
                    <div>Accounting: {row.accountingReference || 'Missing'}</div>
                </div>
            ),
        },
        {
            key: 'mismatch',
            label: 'Flags',
            render: (row) => (
                row.mismatchFlags.length ? (
                    <div className="flex flex-wrap gap-1">
                        {row.mismatchFlags.map((flag) => <Badge key={flag} variant="outline">{flag}</Badge>)}
                    </div>
                ) : <Badge variant="outline">OK</Badge>
            ),
        },
    ];

    const timelineColumns: Column<TimelineRow>[] = [
        {
            key: 'owner',
            label: 'Entity',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.owner}</div>
                    <div className="text-xs text-muted-foreground">{row.kind}</div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge variant="outline">{row.status}</Badge>,
        },
        {
            key: 'actions',
            label: 'Timeline',
            render: (row) => (
                <Button size="sm" variant="ghost" onClick={() => setSelectedTimeline(row)}>
                    View timeline
                </Button>
            ),
        },
    ];

    type LedgerCheckRow = ReconciliationOverview['ledgerChecks'][number] & { id: string };

    const ledgerColumns: Column<LedgerCheckRow>[] = [
        {
            key: 'ownerLabel',
            label: 'Wallet',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.ownerLabel}</div>
                    <div className="text-xs text-muted-foreground">{row.ownerType}</div>
                </div>
            ),
        },
        {
            key: 'actualBalance',
            label: 'Actual',
            render: (row) => formatCurrency(row.actualBalance, row.currency || undefined),
        },
        {
            key: 'projectedBalance',
            label: 'Projected',
            render: (row) => formatCurrency(row.projectedBalance, row.currency || undefined),
        },
        {
            key: 'delta',
            label: 'Delta',
            render: (row) => (
                <span className={row.status === 'DRIFT' ? 'font-medium text-red-600' : 'text-muted-foreground'}>
                    {formatCurrency(row.delta, row.currency || undefined)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge variant={row.status === 'DRIFT' ? 'destructive' : 'outline'}>{row.status}</Badge>,
        },
    ];

    const outboxColumns: Column<ReconciliationOverview['outbox']['events'][number]>[] = [
        {
            key: 'eventType',
            label: 'Event',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.eventType}</div>
                    <div className="text-xs text-muted-foreground">{row.ownerLabel}</div>
                </div>
            ),
        },
        {
            key: 'publishStatus',
            label: 'Queue',
            render: (row) => <Badge variant={row.publishStatus === 'DEAD_LETTER' ? 'destructive' : 'outline'}>{row.publishStatus}</Badge>,
        },
        {
            key: 'publishAttempts',
            label: 'Attempts',
            render: (row) => row.publishAttempts,
        },
        {
            key: 'lastPublishError',
            label: 'Last Error',
            render: (row) => <span className="text-xs text-muted-foreground">{row.lastPublishError || '-'}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    {row.publishStatus === 'DEAD_LETTER' ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                                try {
                                    await financeOpsService.replayOutboxEvent(row.id);
                                    toast({ title: 'Outbox event replayed', description: `${row.eventType} was cloned back into the publish queue.` });
                                    await load();
                                } catch (error: any) {
                                    toast({
                                        title: 'Replay failed',
                                        description: error.message || 'Could not replay outbox event',
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            Replay
                        </Button>
                    ) : null}
                    {row.publishStatus === 'RETRYING' ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                                try {
                                    await financeOpsService.retryOutboxEvent(row.id);
                                    toast({ title: 'Outbox event re-queued', description: `${row.eventType} is ready for replay.` });
                                    await load();
                                } catch (error: any) {
                                    toast({
                                        title: 'Retry failed',
                                        description: error.message || 'Could not retry outbox event',
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            Retry
                        </Button>
                    ) : null}
                    {(row.publishStatus === 'PENDING' || row.publishStatus === 'RETRYING') ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                                const reason = window.prompt(`Mark ${row.eventType} as dead letter. Add a short reason:`, row.lastPublishError || 'Manual operator hold');
                                if (!reason) return;
                                try {
                                    await financeOpsService.markOutboxEventDeadLetter(row.id, reason);
                                    toast({ title: 'Event moved to dead letter', description: `${row.eventType} now needs manual recovery.` });
                                    await load();
                                } catch (error: any) {
                                    toast({
                                        title: 'Dead-letter update failed',
                                        description: error.message || 'Could not move outbox event to dead letter',
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            Dead-letter
                        </Button>
                    ) : null}
                </div>
            ),
        },
    ];

    const riskColumns: Column<ReconciliationOverview['riskFlags'][number]>[] = [
        {
            key: 'title',
            label: 'Risk',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-xs text-muted-foreground">{row.entityLabel}</div>
                </div>
            ),
        },
        {
            key: 'severity',
            label: 'Severity',
            render: (row) => <Badge variant={row.severity === 'HIGH' ? 'destructive' : 'outline'}>{row.severity}</Badge>,
        },
        {
            key: 'description',
            label: 'Description',
            render: (row) => <span className="text-sm text-muted-foreground">{row.description}</span>,
        },
    ];

    const timelineItems = (selectedTimeline?.timeline || [])
        .filter((entry) => entry.at)
        .map((entry) => ({
            id: entry.key,
            title: entry.label,
            description: entry.description,
            timestamp: new Date(entry.at as string),
            variant: (
                entry.tone === 'success'
                    ? 'success'
                    : entry.tone === 'warning'
                        ? 'warning'
                        : entry.tone === 'danger'
                            ? 'destructive'
                            : 'default'
            ) as 'default' | 'success' | 'warning' | 'destructive',
        }));

    const runNow = async () => {
        setRunning(true);
        try {
            const result = await financeOpsService.runReconciliation();
            setRunResult(result);
            toast({ title: 'Reconciliation complete', description: `${result.summary.totalIssues} issue(s) found.` });
            await load();
        } catch (error: any) {
            toast({
                title: 'Run failed',
                description: error.message || 'Could not run reconciliation',
                variant: 'destructive',
            });
        } finally {
            setRunning(false);
        }
    };

    const runOutbox = async () => {
        setDispatching(true);
        try {
            const result = await financeOpsService.runOutboxDispatch();
            setOutboxResult(result);
            toast({ title: 'Finance outbox processed', description: `${result.publishedCount} event(s) published.` });
            await load();
        } catch (error: any) {
            toast({
                title: 'Outbox dispatch failed',
                description: error.message || 'Could not run finance outbox dispatch',
                variant: 'destructive',
            });
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading reconciliation…</div>;
    }

    if (!overview) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="py-10 flex flex-col items-center text-center gap-3">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Reconciliation overview unavailable</p>
                            <p className="text-sm text-muted-foreground">Refresh and try again.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
                    <p className="text-muted-foreground">Cross-check bills, refunds, payouts, provider references, and accounting references.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={runOutbox} disabled={dispatching}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${dispatching ? 'animate-spin' : ''}`} />
                        Run outbox dispatch
                    </Button>
                    <Button onClick={runNow} disabled={running}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
                        Run provider reconciliation
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Missing provider refs</p>
                    <p className="text-2xl font-semibold mt-1">{summary.missingProviderRefs}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Missing accounting refs</p>
                    <p className="text-2xl font-semibold mt-1">{summary.missingAccountingRefs}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Open company withdrawals</p>
                    <p className="text-2xl font-semibold mt-1">{summary.companyWithdrawals}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Open staff withdrawals</p>
                    <p className="text-2xl font-semibold mt-1">{summary.staffWithdrawals}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Dead-letter events</p>
                    <p className="text-2xl font-semibold mt-1">{summary.deadLetterEvents}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Ledger drifts</p>
                    <p className="text-2xl font-semibold mt-1">{summary.ledgerDrifts}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">High-risk items</p>
                    <p className="text-2xl font-semibold mt-1">{summary.highRiskItems}</p>
                </Card>
            </div>

            {runResult ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Latest provider run</CardTitle>
                        <CardDescription>Run at {new Date(runResult.runAt).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Total issues</p>
                            <p className="text-2xl font-semibold">{runResult.summary.totalIssues}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Wallet mismatches</p>
                            <p className="text-2xl font-semibold">{runResult.summary.walletMismatches}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Stale transfers</p>
                            <p className="text-2xl font-semibold">{runResult.summary.staleTransfers}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {outboxResult ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Latest outbox dispatch</CardTitle>
                        <CardDescription>Run at {new Date(outboxResult.processedAt).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Processed</p>
                            <p className="text-2xl font-semibold">{outboxResult.processedCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Published</p>
                            <p className="text-2xl font-semibold">{outboxResult.publishedCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Retrying</p>
                            <p className="text-2xl font-semibold">{outboxResult.retryingCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Dead letter</p>
                            <p className="text-2xl font-semibold">{outboxResult.deadLetterCount}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Bills missing reconciliation references</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={billColumns} data={overview.bills} searchable searchKeys={['billNumber', 'companyName']} />
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Refund timelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={timelineColumns}
                            data={overview.refunds.map((row) => ({
                                id: row.id,
                                owner: row.companyName,
                                kind: `Refund · ${row.destination === 'ORIGINAL_METHOD' ? 'original method' : 'wallet credit'}`,
                                status: row.status,
                                timeline: row.timeline,
                            }))}
                            searchable
                            searchKeys={['owner', 'kind']}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Withdrawal timelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={timelineColumns}
                            data={[
                                ...overview.companyWithdrawals.map((row) => ({
                                    id: row.id,
                                    owner: row.companyName || 'Company',
                                    kind: 'Company withdrawal',
                                    status: row.status,
                                    timeline: row.timeline,
                                })),
                                ...overview.staffWithdrawals.map((row) => ({
                                    id: row.id,
                                    owner: row.consultantName || 'Consultant',
                                    kind: 'Staff withdrawal',
                                    status: row.status,
                                    timeline: row.timeline,
                                })),
                            ]}
                            searchable
                            searchKeys={['owner', 'kind']}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Outbox queue</CardTitle>
                        <CardDescription>Financial events waiting for publish, retry, or manual recovery.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={outboxColumns}
                            data={overview.outbox.events}
                            searchable
                            searchKeys={['eventType', 'ownerLabel', 'sourceType']}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Ledger projection checks</CardTitle>
                        <CardDescription>Compare live wallet balances to the additive ledger projection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={ledgerColumns}
                            data={overview.ledgerChecks
                                .filter((row) => row.status === 'DRIFT')
                                .map((row) => ({
                                    ...row,
                                    id: row.accountId,
                                }))}
                            searchable
                            searchKeys={['ownerLabel', 'ownerType']}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Risk flags</CardTitle>
                    <CardDescription>High-value and operational finance items that need extra review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={riskColumns}
                        data={overview.riskFlags}
                        searchable
                        searchKeys={['title', 'entityLabel', 'kind']}
                    />
                </CardContent>
            </Card>

            {selectedTimeline ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{selectedTimeline.owner}</CardTitle>
                        <CardDescription>{selectedTimeline.kind}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {timelineItems.length > 0 ? (
                            <Timeline items={timelineItems} />
                        ) : (
                            <p className="text-sm text-muted-foreground">No lifecycle data recorded yet.</p>
                        )}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
