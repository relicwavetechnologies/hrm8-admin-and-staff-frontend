import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { adminWithdrawalService, AdminWithdrawalRequest } from "@/shared/lib/admin/withdrawalService";
import { format } from "date-fns";
import { CheckCircle, XCircle, DollarSign, Eye, Loader2 } from "lucide-react";
import { ProcessPaymentDialog } from "@/modules/admin/components/ProcessPaymentDialog";
import { RejectWithdrawalDialog } from "@/modules/admin/components/RejectWithdrawalDialog";
import { WithdrawalDetailsDialog } from "@/modules/admin/components/WithdrawalDetailsDialog";

export default function WithdrawalsPage() {
    const { toast } = useToast();
    const { formatCurrency } = useCurrencyFormat();
    const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRequest[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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

    const handleApprove = async (withdrawal: AdminWithdrawalRequest) => {
        if (!confirm(`Approve withdrawal of ${formatCurrency(withdrawal.amount)} for ${withdrawal.consultantName}?`)) {
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

    const handleProcessClick = (withdrawal: AdminWithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setProcessOpen(true);
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
            key: "consultantName",
            label: "Sales Agent",
            render: (item) => (
                <div>
                    <div className="font-medium">{item.consultantName}</div>
                    <div className="text-xs text-muted-foreground">{item.consultantEmail}</div>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (item) => <span className="font-semibold text-lg">{formatCurrency(item.amount)}</span>,
        },
        {
            key: "paymentMethod",
            label: "Method",
            render: (item) => <span className="capitalize">{item.paymentMethod.replace('_', ' ').toLowerCase()}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (item) => getStatusBadge(item.status),
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
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProcessClick(item)}
                            disabled={!!actionLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Process Payment
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (

        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Withdrawal Management</h1>
                <p className="text-muted-foreground">Manage sales agent commission withdrawal requests</p>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-1">
                <DataTable
                    columns={columns}
                    data={withdrawals}
                    searchable={true}
                    searchKeys={['consultantName', 'consultantEmail']}
                />
            </div>

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
