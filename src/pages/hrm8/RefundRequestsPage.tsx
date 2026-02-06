import { useState, useEffect } from "react";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrencyFormat } from "@/contexts/CurrencyFormatContext";
import { hrm8RefundRequestService, RefundRequest } from "@/shared/services/hrm8/refundRequestService";
import { format } from "date-fns";
import { CheckCircle, XCircle, Filter, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

export default function RefundRequestsPage() {
    const { toast } = useToast();
    const { formatCurrency } = useCurrencyFormat();
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Dialog states
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadRefundRequests();
    }, [statusFilter]);

    const loadRefundRequests = async () => {
        try {
            const filters = statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : undefined;
            const result = await hrm8RefundRequestService.getAll(filters);
            if (result.success && result.data) {
                setRefundRequests(result.data.refundRequests);
            } else {
                setRefundRequests([]);
                // Don't toast error on empty/initial load unless explicit error, purely to avoid noise
                if (result.error) {
                    toast({
                        title: "Error",
                        description: result.error,
                        variant: "destructive"
                    });
                }
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to load refund requests",
                variant: "destructive"
            });
            setRefundRequests([]);
        } finally {
            // no-op
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const result = await hrm8RefundRequestService.approve(selectedRequest.id, adminNotes);
            if (result.success) {
                toast({ title: "Success", description: "Refund request approved" });
                closeDialog();
                loadRefundRequests();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to approve refund request",
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to approve refund request",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast({
                title: "Error",
                description: "Rejection reason is required",
                variant: "destructive"
            });
            return;
        }

        setActionLoading(true);
        try {
            const result = await hrm8RefundRequestService.reject(selectedRequest.id, rejectionReason);
            if (result.success) {
                toast({ title: "Success", description: "Refund request rejected" });
                closeDialog();
                loadRefundRequests();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to reject refund request",
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to reject refund request",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const openDialog = (request: RefundRequest, type: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminNotes('');
        setRejectionReason('');
    };

    const closeDialog = () => {
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
        setRejectionReason('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: Column<RefundRequest>[] = [
        {
            key: "created_at",
            label: "Date",
            render: (request) => {
                try {
                    return <span>{request.created_at ? format(new Date(request.created_at), 'MMM dd, yyyy') : '-'}</span>;
                } catch (e) {
                    return <span>Invalid Date</span>;
                }
            },
        },
        {
            key: "company_id",
            label: "Company",
            render: (request) => (
                <div className="flex flex-col">
                   <span className="font-medium">{request.company_id}</span>
                </div>
            )
        },
        {
            key: "details",
            label: "Details",
            render: (request) => {
                const isJob = request.transaction_type === 'JOB_PAYMENT';
                const title = request.transaction_context?.title || request.reason || "Payment";

                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[200px]">
                            {title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isJob ? 'Job Payment' : 'Subscription'}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "amount",
            label: "Amount",
            render: (request) => <span className="font-semibold">{formatCurrency(request.amount)}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (request) => getStatusBadge(request.status),
        },
        {
            key: "actions",
            label: "Actions",
            render: (request) => (
                <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                        <>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => openDialog(request, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle size={14} className="mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDialog(request, 'reject')}
                            >
                                <XCircle size={14} className="mr-1" />
                                Reject
                            </Button>
                        </>
                    )}
                     {request.status === 'APPROVED' && (
                        <span className="text-xs text-muted-foreground italic">
                            Approved
                        </span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
                    <p className="text-muted-foreground">Manage transaction refund requests from employers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-1">
                <DataTable
                    columns={columns}
                    data={refundRequests}
                    searchable={true}
                    searchKeys={['company_id', 'reason']}
                />
            </div>

             <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && `For amount ${formatCurrency(selectedRequest.amount)}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted/50 p-3 rounded-md space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Company:</span>
                                    <span className="font-medium">{selectedRequest.company_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reason:</span>
                                    <span className="font-medium">{selectedRequest.reason}</span>
                                </div>
                            </div>

                            {actionType === 'approve' && (
                                <div className="space-y-2">
                                    <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="admin-notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add confirmation notes..."
                                        rows={3}
                                    />
                                </div>
                            )}

                            {actionType === 'reject' && (
                                <div className="space-y-2">
                                    <Label htmlFor="rejection-reason" className="text-destructive">Rejection Reason *</Label>
                                    <Textarea
                                        id="rejection-reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why this request is rejected..."
                                        rows={3}
                                        className="border-red-200 focus-visible:ring-red-500"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button 
                            variant={actionType === 'reject' ? "destructive" : "default"}
                            onClick={actionType === 'approve' ? handleApprove : handleReject}
                            disabled={actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
