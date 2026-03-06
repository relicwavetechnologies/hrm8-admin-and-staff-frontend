import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { CommissionWithdrawal, WithdrawalStatus } from "@/shared/types/withdrawal";
import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { salesService } from "@/shared/services/salesService";
import { useToast } from "@/shared/hooks/use-toast";

interface WithdrawalHistoryProps {
    withdrawals: CommissionWithdrawal[];
    isLoading: boolean;
    onrefresh: () => void;
}

export function WithdrawalHistory({ withdrawals, isLoading, onrefresh }: WithdrawalHistoryProps) {
    const { formatCurrency } = useCurrencyFormat();
    const { toast } = useToast();
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const getStatusBadge = (status: WithdrawalStatus) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
            case 'PROCESSING':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Processing</Badge>;
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleWithdraw = async (id: string) => {
        setProcessingId(id);
        try {
            const response = await salesService.executeWithdrawal(id);
            if (response.success) {
                toast({ title: "Success", description: "Payout initiated successfully" });
                onrefresh();
            } else {
                toast({ title: "Error", description: "Failed to initiate payout", variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to initiate payout", variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this withdrawal request?")) return;

        setCancellingId(id);
        try {
            await salesService.cancelWithdrawal(id);
            toast({ title: "Success", description: "Withdrawal cancelled" });
            onrefresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || "Failed to cancel withdrawal", variant: "destructive" });
        } finally {
            setCancellingId(null);
        }
    };

    if (isLoading) {
        return <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;
    }

    if (withdrawals.length === 0) {
        return <div className="text-center py-10 text-muted-foreground border rounded-md">No withdrawal history found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                            <TableCell>{format(new Date(withdrawal.createdAt), "MMM d, yyyy")}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                            <TableCell className="capitalize">{withdrawal.paymentMethod.replace('_', ' ').toLowerCase()}</TableCell>
                            <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                                {withdrawal.paymentReference || (withdrawal.status === 'REJECTED' ? withdrawal.rejectionReason : '-')}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                                {withdrawal.status === 'APPROVED' && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleWithdraw(withdrawal.id)}
                                        disabled={!!processingId || !!cancellingId}
                                        className="bg-green-600 hover:bg-green-700 h-8"
                                    >
                                        {processingId === withdrawal.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Withdraw Now"
                                        )}
                                    </Button>
                                )}
                                {withdrawal.status === 'PENDING' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCancel(withdrawal.id)}
                                        disabled={!!cancellingId || !!processingId}
                                        title="Cancel Request"
                                        className="h-8 w-8"
                                    >
                                        {cancellingId === withdrawal.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                        )}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
