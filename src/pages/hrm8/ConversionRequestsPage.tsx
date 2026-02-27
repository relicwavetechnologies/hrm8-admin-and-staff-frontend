import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { leadConversionAdminService } from "@/shared/services/hrm8/leadConversionAdminService";
import { ConversionRequest } from "@/shared/services/leadConversionService";
import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Card } from "@/shared/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";

export default function ConversionRequestsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<ConversionRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    
    // Action states
    const [selectedRequest, setSelectedRequest] = useState<ConversionRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null);
    const [processing, setProcessing] = useState(false);
    
    // Form states
    const [adminNotes, setAdminNotes] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    
    // Credentials display
    const [credentials, setCredentials] = useState<{ email: string; password?: string; companyName: string } | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewContext, setReviewContext] = useState<any | null>(null);

    const formatDateTime = (value?: string | null) => {
        if (!value) return 'Not available yet';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Not available yet';
        return format(date, 'MMM dd, yyyy HH:mm');
    };

    const formatMoney = (amount?: number | null, currency?: string | null) => {
        if (amount === null || amount === undefined) return 'Not available yet';
        return `${currency || ''} ${Number(amount).toLocaleString()}`.trim();
    };

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const loadRequests = async () => {
        try {
            const data = await leadConversionAdminService.getAll(statusFilter === '' || statusFilter === 'ALL' ? undefined : statusFilter);
            setRequests(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load conversion requests",
                variant: 'destructive'
            });
        } finally {
            // no-op
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const result = await leadConversionAdminService.approve(selectedRequest.id, adminNotes);

            setCredentials({
                email: selectedRequest.email,
                companyName: result.company.name
            });

            toast({ title: "Success", description: "Conversion request approved!" });
            closeDialog();
            loadRequests();
        } catch (error: any) {
             toast({
                title: "Error",
                description: error.message || "Failed to approve request",
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDecline = async () => {
        if (!selectedRequest || !declineReason.trim()) {
            toast({
                title: "Error",
                description: "Decline reason is required",
                variant: 'destructive'
            });
            return;
        }

        try {
            setProcessing(true);
            await leadConversionAdminService.decline(selectedRequest.id, declineReason);
            toast({ title: "Success", description: "Conversion request declined" });
            closeDialog();
            loadRequests();
        } catch (error: any) {
             toast({
                title: "Error",
                description: error.message || "Failed to decline request",
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    const openDialog = (request: ConversionRequest, type: 'approve' | 'decline') => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminNotes('');
        setDeclineReason('');
    };

    const closeDialog = () => {
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
        setDeclineReason('');
    };

    const openReview = async (request: ConversionRequest) => {
        try {
            setReviewOpen(true);
            setReviewLoading(true);
            setReviewContext(null);
            const context = await leadConversionAdminService.getReviewContext(request.id);
            setReviewContext(context);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load review context',
                variant: 'destructive'
            });
            setReviewOpen(false);
        } finally {
            setReviewLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
            case 'DECLINED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
            case 'CONVERTED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Converted</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: Column<ConversionRequest>[] = [
        {
            key: "company_name",
            label: "Company",
            render: (item) => <span className="font-medium">{item.company_name}</span>
        },
        {
            key: "email",
            label: "Email",
            render: (item) => <span>{item.email}</span>
        },
        {
            key: "country",
            label: "Country",
            render: (item) => <span>{item.country}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (item) => getStatusBadge(item.status)
        },
        {
            key: "created_at",
            label: "Submitted",
            render: (item) => {
                const date = item.created_at ? new Date(item.created_at) : null;
                return <span>{date && !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '-'}</span>;
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            openReview(item);
                        }}
                    >
                        View Details
                    </Button>
                    {item.status === 'PENDING' ? (
                        <>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openDialog(item, 'approve');
                                }}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openDialog(item, 'decline');
                                }}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                            </Button>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">No actions</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Lead Conversion Requests</h1>
                <p className="text-muted-foreground">Review and approve conversion requests from sales agents</p>
            </div>

            <Card className="p-4 space-y-4">
                 <div className="flex justify-end gap-2">
                    <Button
                        variant={statusFilter === '' || statusFilter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('ALL')}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('PENDING')}
                        size="sm"
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('APPROVED')}
                        size="sm"
                    >
                        Approved
                    </Button>
                    <Button
                        variant={statusFilter === 'DECLINED' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('DECLINED')}
                        size="sm"
                    >
                        Declined
                    </Button>
                </div>

                <DataTable 
                    columns={columns} 
                    data={requests}
                    searchable={true} 
                    searchKeys={["company_name", "email"]}
                    onRowClick={openReview}
                />
            </Card>

            <Sheet open={reviewOpen} onOpenChange={setReviewOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Conversion Request Review</SheetTitle>
                        <SheetDescription>
                            Full company and commercial context for approval.
                        </SheetDescription>
                    </SheetHeader>

                    {reviewLoading ? (
                        <div className="py-6 text-sm text-muted-foreground">Loading review context...</div>
                    ) : reviewContext ? (
                        <div className="space-y-6 py-4">
                            <Card className="p-4 space-y-3">
                                <h3 className="font-semibold">Approval Essentials</h3>
                                {reviewContext.companyContext?.id ? (
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate(`/hrm8/companies/${reviewContext.companyContext.id}`)}
                                        >
                                            Open Company Detail
                                        </Button>
                                    </div>
                                ) : null}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Company</div>
                                        <div>{reviewContext.request?.company_name || reviewContext.companyContext?.name || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Website</div>
                                        <div>{reviewContext.request?.website || reviewContext.companyContext?.website || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Email</div>
                                        <div>{reviewContext.request?.email || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Phone</div>
                                        <div>{reviewContext.request?.phone || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Lead Confirmed</div>
                                        <div>{formatDateTime(reviewContext.leadMilestones?.lead_confirmed_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Submitted</div>
                                        <div>{formatDateTime(reviewContext.request?.created_at)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground">Intent Snapshot</div>
                                        <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap">
{JSON.stringify(reviewContext.request?.intent_snapshot || {}, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground">Agent Notes</div>
                                        <div>{reviewContext.request?.agent_notes || 'Not available yet'}</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 space-y-3">
                                <h3 className="font-semibold">Post-Conversion Revenue Evidence</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">First Job Posted</div>
                                        <div>{formatDateTime(reviewContext.firstJobEvidence?.posted_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Flow</div>
                                        <div>{reviewContext.firstJobEvidence?.setup_type || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Service</div>
                                        <div>{reviewContext.firstJobEvidence?.service_package || reviewContext.firstJobEvidence?.hiring_mode || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Subscription</div>
                                        <div>{reviewContext.subscriptionAtFirstJob?.name || reviewContext.subscriptionAtFirstJob?.plan_type || 'Not available yet'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">First Payment</div>
                                        <div>{formatMoney(reviewContext.firstPaymentEvidence?.amount, reviewContext.firstPaymentEvidence?.currency)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Payment Date</div>
                                        <div>{formatDateTime(reviewContext.firstPaymentEvidence?.paid_at)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground">Commission Readiness</div>
                                        <div>{reviewContext.commissionReadiness?.reason || 'Not available yet'}</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="py-6 text-sm text-muted-foreground">No review context available.</div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Action Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve Conversion Request' : 'Decline Conversion Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && (
                                <div className="mt-4 space-y-2 text-sm text-foreground">
                                    <div>
                                        <strong>Company:</strong> {selectedRequest.company_name}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {selectedRequest.email}
                                    </div>
                                    {selectedRequest.agent_notes && (
                                        <div>
                                            <strong>Agent Notes:</strong>
                                            <p className="mt-1 text-muted-foreground">{selectedRequest.agent_notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {actionType === 'approve' ? (
                            <div className="space-y-2">
                                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                                <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add any notes about this approval..."
                                    rows={3}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="declineReason" className="text-destructive">Decline Reason *</Label>
                                <Textarea
                                    id="declineReason"
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    placeholder="Provide a reason for declining this request..."
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            variant={actionType === 'approve' ? 'default' : 'destructive'}
                            onClick={actionType === 'approve' ? handleApprove : handleDecline}
                            disabled={processing}
                        >
                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {actionType === 'approve' ? 'Approve & Convert' : 'Decline Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credentials Dialog */}
            <Dialog open={!!credentials} onOpenChange={(open) => !open && setCredentials(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Sent Successfully</DialogTitle>
                        <DialogDescription>
                            The lead has been converted to a company account. A secure invite link was sent to the company admin to set their password.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted p-4 rounded-lg space-y-3 mt-4 border">
                        <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted-foreground/10">
                            <span className="text-sm font-medium text-muted-foreground">Company:</span>
                            <span className="text-sm font-bold col-span-2">{credentials?.companyName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted-foreground/10">
                            <span className="text-sm font-medium text-muted-foreground">Email:</span>
                            <span className="text-sm font-mono col-span-2 break-all">{credentials?.email}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1">
                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                            <span className="text-sm font-mono text-primary font-bold col-span-2">
                                Invite link sent
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-700 mt-2">
                        <strong>Next step:</strong> The admin should set their password using the emailed link.
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setCredentials(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
