import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { adminWithdrawalService, AdminWithdrawalRequest, type PayoutConfigResponse } from "@/shared/lib/admin/withdrawalService";
import { format } from "date-fns";
import { CheckCircle, XCircle, DollarSign, Eye, Loader2 } from "lucide-react";
import { ProcessPaymentDialog } from "@/modules/admin/components/ProcessPaymentDialog";
import { RejectWithdrawalDialog } from "@/modules/admin/components/RejectWithdrawalDialog";
import { WithdrawalDetailsDialog } from "@/modules/admin/components/WithdrawalDetailsDialog";
import { Card } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

export default function WithdrawalsPage() {
    const { toast } = useToast();
    const { formatCurrency } = useCurrencyFormat();
    const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRequest[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [payoutConfig, setPayoutConfig] = useState<PayoutConfigResponse | null>(null);
    const [activeBucket, setActiveBucket] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SECONDARY' | 'PROCESSING' | 'BENEFICIARY' | 'FAILED'>('ALL');

    // Dialog states
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalRequest | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [processOpen, setProcessOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const fetchWithdrawals = useCallback(async () => {
        try {
            const response = await adminWithdrawalService.getPendingWithdrawals();
            // Checking response structure. The service already extracts .data if strictly following my previous migration, 
            // but let's be safe. If service returns { withdrawals: ... }, then we use it.
            // Looking at withdrawalService.ts migration, it returns response.data directly.
            // So if api returns { withdrawals: [] }, then setWithdrawals(data.withdrawals).
            if (response && response.withdrawals) {
                setWithdrawals(response.withdrawals);
            } else {
                setWithdrawals([]);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to fetch withdrawals",
                variant: "destructive"
            });
            setWithdrawals([]);
        } finally {
            // Loading state removed
        }
    }, [toast]);

    useEffect(() => {
        fetchWithdrawals();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchWithdrawals, 30000);
        return () => clearInterval(interval);
    }, [fetchWithdrawals]);

    useEffect(() => {
        adminWithdrawalService.getPayoutConfig().then(setPayoutConfig).catch(() => setPayoutConfig(null));
    }, []);

    const handleApprove = async (withdrawal: AdminWithdrawalRequest) => {
        if (
            !confirm(
                `Approve withdrawal of ${formatCurrency(withdrawal.payoutAmount ?? withdrawal.amount, withdrawal.payoutCurrency || withdrawal.currency || undefined)} for ${withdrawal.recipientName || withdrawal.consultantName || withdrawal.companyName || 'recipient'}?`
            )
        ) {
            return;
        }

        setActionLoading(withdrawal.id);
        try {
            await adminWithdrawalService.approveWithdrawal(withdrawal.id);
            toast({ title: "Success", description: "Withdrawal approved" });
            fetchWithdrawals();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to approve withdrawal",
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleSecondaryApprove = async (withdrawal: AdminWithdrawalRequest) => {
        if (
            !confirm(
                `Record the second approval for ${formatCurrency(withdrawal.payoutAmount ?? withdrawal.amount, withdrawal.payoutCurrency || withdrawal.currency || undefined)}?`
            )
        ) {
            return;
        }

        setActionLoading(withdrawal.id);
        try {
            await adminWithdrawalService.secondaryApproveWithdrawal(withdrawal.id);
            toast({ title: "Success", description: "Second approval recorded" });
            fetchWithdrawals();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to record second approval",
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleProcessClick = (withdrawal: AdminWithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setProcessOpen(true);
    };

    const handleExecuteAirwallex = async (withdrawal: AdminWithdrawalRequest) => {
        if (
            !confirm(
                `Execute Airwallex transfer for ${formatCurrency(withdrawal.payoutAmount ?? withdrawal.amount, withdrawal.payoutCurrency || withdrawal.currency || undefined)} to ${withdrawal.recipientName || withdrawal.consultantName || withdrawal.companyName || 'recipient'}?`
            )
        ) {
            return;
        }
        setActionLoading(withdrawal.id);
        try {
            await adminWithdrawalService.executeAirwallexPayout(withdrawal.id);
            toast({ title: "Payout initiated", description: "Airwallex transfer pipeline completed or started." });
            fetchWithdrawals();
        } catch (error: any) {
            toast({
                title: "Payout failed",
                description: error.response?.data?.error || error.message || "Execute Airwallex payout failed",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectClick = (withdrawal: AdminWithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setRejectOpen(true);
    };

    const handleDetailsClick = (withdrawal: AdminWithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setDetailsOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
            case 'PROCESSING':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Processing</Badge>;
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: Column<AdminWithdrawalRequest>[] = [
        {
            key: "createdAt",
            label: "Date",
            render: (item) => <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>,
        },
        {
            key: "recipientName",
            label: "Recipient",
            render: (item) => (
                <div>
                    <div className="font-medium">{item.recipientName || item.consultantName || item.companyName}</div>
                    <div className="text-xs text-muted-foreground">
                        {item.requestKind === 'COMPANY' ? 'Company refund balance' : item.consultantEmail}
                    </div>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (item) => (
                <span className="font-semibold text-lg">
                    {formatCurrency(item.payoutAmount ?? item.amount, item.payoutCurrency || item.currency || undefined)}
                </span>
            ),
        },
        {
            key: "paymentMethod",
            label: "Method",
            render: (item) => <span className="capitalize">{item.paymentMethod.replace('_', ' ').toLowerCase()}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (item) => {
                const itemNeedsSecondApproval = item.secondaryApprovalRequired && !item.secondaryApprovedAt;
                switch (item.status) {
                    case 'APPROVED':
                        return <Badge variant="outline" className={itemNeedsSecondApproval ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}>{itemNeedsSecondApproval ? 'Awaiting second approval' : 'Approved'}</Badge>;
                    default:
                        return getStatusBadge(item.status);
                }
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDetailsClick(item)}
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    {item.status === 'PENDING' && (
                        <>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(item)}
                                disabled={!!actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {actionLoading === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectClick(item)}
                                disabled={!!actionLoading}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                        </>
                    )}

                    {item.status === 'APPROVED' && (
                        <>
                            {item.secondaryApprovalRequired && !item.secondaryApprovedAt ? (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSecondaryApprove(item)}
                                    disabled={!!actionLoading}
                                    className="bg-amber-600 hover:bg-amber-700"
                                >
                                    {actionLoading === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Second approval
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleExecuteAirwallex(item)}
                                    disabled={!!actionLoading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {actionLoading === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            Execute Airwallex
                                        </>
                                    )}
                                </Button>
                            )}
                            {payoutConfig?.MANUAL_OFFLINE_PAYOUT_MODE || payoutConfig?.BILLING_PROVIDER_MODE === "mock" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProcessClick(item)}
                                    disabled={!!actionLoading || !!(item.secondaryApprovalRequired && !item.secondaryApprovedAt)}
                                >
                                    Offline / manual
                                </Button>
                            ) : null}
                        </>
                    )}
                </div>
            ),
        },
    ];

    const summary = useMemo(() => ({
        pending: withdrawals.filter((item) => item.status === 'PENDING').length,
        approved: withdrawals.filter((item) => item.status === 'APPROVED').length,
        awaitingSecondApproval: withdrawals.filter((item) => item.status === 'APPROVED' && item.secondaryApprovalRequired && !item.secondaryApprovedAt).length,
        processing: withdrawals.filter((item) => item.status === 'PROCESSING').length,
        beneficiaryAttention: withdrawals.filter((item) => item.beneficiaryStatus && item.beneficiaryStatus.status !== 'READY').length,
        failed: withdrawals.filter((item) => item.status === 'REJECTED' || !!item.transferFailedReason).length,
    }), [withdrawals]);

    const filteredWithdrawals = useMemo(() => {
        switch (activeBucket) {
            case 'PENDING':
                return withdrawals.filter((item) => item.status === 'PENDING');
            case 'APPROVED':
                return withdrawals.filter((item) => item.status === 'APPROVED');
            case 'SECONDARY':
                return withdrawals.filter((item) => item.status === 'APPROVED' && item.secondaryApprovalRequired && !item.secondaryApprovedAt);
            case 'PROCESSING':
                return withdrawals.filter((item) => item.status === 'PROCESSING');
            case 'BENEFICIARY':
                return withdrawals.filter((item) => item.beneficiaryStatus && item.beneficiaryStatus.status !== 'READY');
            case 'FAILED':
                return withdrawals.filter((item) => item.status === 'REJECTED' || !!item.transferFailedReason);
            default:
                return withdrawals;
        }
    }, [activeBucket, withdrawals]);

    return (

        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Withdrawal Management</h1>
                <p className="text-muted-foreground">Manage staff payouts and company refund-balance withdrawals</p>
            </div>

            {payoutConfig ? (
                <Alert
                    variant="default"
                    className={
                        payoutConfig.BILLING_PROVIDER_MODE === "live"
                            ? undefined
                            : "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
                    }
                >
                    <AlertTitle>Billing mode</AlertTitle>
                    <AlertDescription className="text-sm space-y-1">
                        <div>
                            Provider: <strong>{payoutConfig.BILLING_PROVIDER_MODE}</strong>
                            {payoutConfig.BILLING_STRICT_LIVE ? (
                                <span> — live Airwallex errors will fail hard (no mock fallback).</span>
                            ) : payoutConfig.BILLING_PROVIDER_MODE === "live" ? (
                                <span className="text-amber-700 dark:text-amber-300">
                                    {" "}
                                    — mock fallback on errors is <strong>enabled</strong> (dev/sandbox only; disable in
                                    production).
                                </span>
                            ) : (
                                <span> — synthetic checkout and transfers (no real money).</span>
                            )}
                        </div>
                        <div>
                            Manual offline completion:{" "}
                            {payoutConfig.MANUAL_OFFLINE_PAYOUT_MODE || payoutConfig.BILLING_PROVIDER_MODE === "mock"
                                ? "allowed"
                                : "disabled — use Execute Airwallex only"}
                        </div>
                    </AlertDescription>
                </Alert>
            ) : null}

            <Card className="p-1">
                <div className="grid gap-4 p-4 md:grid-cols-7">
                    {[
                        { key: 'ALL', label: 'All requests', value: withdrawals.length },
                        { key: 'PENDING', label: 'Pending review', value: summary.pending },
                        { key: 'APPROVED', label: 'Ready to send', value: summary.approved },
                        { key: 'SECONDARY', label: 'Second approval', value: summary.awaitingSecondApproval },
                        { key: 'PROCESSING', label: 'Provider processing', value: summary.processing },
                        { key: 'BENEFICIARY', label: 'Beneficiary issues', value: summary.beneficiaryAttention },
                        { key: 'FAILED', label: 'Failed / reversed', value: summary.failed },
                    ].map((item) => (
                        <Button
                            key={item.key}
                            type="button"
                            variant={activeBucket === item.key ? "default" : "outline"}
                            className="h-auto flex-col items-start gap-1 p-4"
                            onClick={() => setActiveBucket(item.key as typeof activeBucket)}
                        >
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</span>
                            <span className="text-2xl font-semibold">{item.value}</span>
                        </Button>
                    ))}
                </div>
                <DataTable
                    columns={columns}
                    data={filteredWithdrawals}
                    searchable={true}
                    searchKeys={['recipientName', 'consultantName', 'consultantEmail', 'companyName']}
                />
            </Card>

            {/* Dialogs */}
            {selectedWithdrawal && (
                <>
                    <WithdrawalDetailsDialog
                        open={detailsOpen}
                        onOpenChange={setDetailsOpen}
                        withdrawal={selectedWithdrawal}
                    />

                    <ProcessPaymentDialog
                        open={processOpen}
                        onOpenChange={setProcessOpen}
                        withdrawal={selectedWithdrawal}
                        onSuccess={fetchWithdrawals}
                    />

                    <RejectWithdrawalDialog
                        open={rejectOpen}
                        onOpenChange={setRejectOpen}
                        withdrawal={selectedWithdrawal}
                        onSuccess={fetchWithdrawals}
                    />
                </>
            )}
        </div>

    );
}
