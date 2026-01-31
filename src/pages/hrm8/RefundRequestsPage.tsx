import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { hrm8RefundRequestService, RefundRequest } from '@/shared/lib/hrm8/refundRequestService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Label } from '@/shared/components/ui/label';

export default function RefundRequestsPage() {
    const navigate = useNavigate();
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadRefundRequests();
    }, [statusFilter]);

    const loadRefundRequests = async () => {
        setLoading(true);
        try {
            const filters = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined;
            const result = await hrm8RefundRequestService.getAll(filters);
            if (result.success && result.data) {
                setRefundRequests(result.data.refundRequests);
            } else {
                toast.error(result.error || 'Failed to load refund requests');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load refund requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const result = await hrm8RefundRequestService.approve(selectedRequest.id, adminNotes);
            if (result.success) {
                toast.success('Refund request approved');
                closeDialog();
                loadRefundRequests();
            } else {
                toast.error(result.error || 'Failed to approve refund request');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to approve refund request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }

        setActionLoading(true);
        try {
            const result = await hrm8RefundRequestService.reject(selectedRequest.id, rejectionReason);
            if (result.success) {
                toast.success('Refund request rejected');
                closeDialog();
                loadRefundRequests();
            } else {
                toast.error(result.error || 'Failed to reject refund request');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to reject refund request');
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

    const getStatusBadge = (status: RefundRequest['status']) => {
        const variants: Record<typeof status, 'default' | 'success' | 'warning' | 'destructive'> = {
            PENDING: 'warning',
            APPROVED: 'success',
            REJECTED: 'destructive',
            COMPLETED: 'success',
            CANCELLED: 'default',
        };

        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (request: RefundRequest) => format(new Date(request.createdAt), 'MMM dd, yyyy'),
        },
        {
            key: 'companyId',
            label: 'Company',
            render: (request: RefundRequest) => request.companyId,
        },
        {
            key: 'details',
            label: 'Details',
            render: (request: RefundRequest) => {
                const isJob = request.transactionType === 'JOB_PAYMENT';
                const displayText = isJob
                    ? (request.transactionContext?.title || request.transactionId)
                    : (request.transactionContext?.billNumber || request.transactionId);

                return (
                    <div className="flex flex-col">
                        {isJob ? (
                            <span
                                onClick={() => navigate(`/jobs/${request.transactionId}`)}
                                className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                                {displayText}
                            </span>
                        ) : (
                            <span className="font-medium text-sm">
                                {displayText}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {isJob ? 'Job Payment' : 'Subscription'}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'transactionType',
            label: 'Type',
            render: (request: RefundRequest) =>
                request.transactionType === 'JOB_PAYMENT' ? 'Job Payment' : 'Subscription',
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (request: RefundRequest) => `$${request.amount.toFixed(2)}`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (request: RefundRequest) => getStatusBadge(request.status),
        },
        {
            key: 'reason',
            label: 'Reason',
            render: (request: RefundRequest) => (
                <div className="max-w-xs truncate" title={request.reason}>
                    {request.reason}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (request: RefundRequest) => (
                <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                        <>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => openDialog(request, 'approve')}
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
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Awaiting Company Withdrawal
                        </Badge>
                    )}
                </div>
            ),
        },
    ];

    return (
        
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
                    <p className="text-muted-foreground">Manage transaction refund requests from employers</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Label>Status:</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading refund requests...</div>
                        ) : (
                            <DataTable
                                data={refundRequests}
                                columns={columns}
                                searchable
                                emptyMessage="No refund requests found"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Action Dialog (Keep existing simplified modal for now, or consider migrating to Shadcn Dialog) */}
                {selectedRequest && actionType && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {actionType === 'approve' && 'Approve Refund Request'}
                                {actionType === 'reject' && 'Reject Refund Request'}
                            </h2>

                            <div className="mb-4 p-3 bg-muted rounded">
                                <p className="text-sm text-muted-foreground">Transaction</p>
                                {selectedRequest.transactionType === 'JOB_PAYMENT' ? (
                                    <span
                                        onClick={() => navigate(`/jobs/${selectedRequest.transactionId}`)}
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    >
                                        Job: {selectedRequest.transactionContext?.title || selectedRequest.transactionId}
                                    </span>
                                ) : (
                                    <p className="font-medium">
                                        Bill: {selectedRequest.transactionContext?.billNumber || selectedRequest.transactionId}
                                    </p>
                                )}

                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="font-semibold">${selectedRequest.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">{format(new Date(selectedRequest.createdAt), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mt-2">Reason</p>
                                <p className="text-sm">{selectedRequest.reason}</p>
                            </div>

                            {actionType === 'approve' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">
                                        Admin Notes (Optional)
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                                        placeholder="Add any notes for this approval..."
                                    />
                                </div>
                            )}

                            {actionType === 'reject' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">
                                        Rejection Reason *
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                                        placeholder="Explain why this refund is being rejected..."
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <Button variant="secondary" onClick={closeDialog} disabled={actionLoading}>
                                    Cancel
                                </Button>
                                <Button
                                    variant={actionType === 'reject' ? 'destructive' : 'default'}
                                    onClick={() => {
                                        if (actionType === 'approve') handleApprove();
                                        else if (actionType === 'reject') handleReject();
                                    }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        
    );
}
