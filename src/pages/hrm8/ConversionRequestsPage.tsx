import { useState, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { leadConversionAdminService } from "@/shared/services/hrm8/leadConversionAdminService";
import { ConversionRequest } from "@/shared/services/sales/leadConversionService";
import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { DataTable, Column } from "@/shared/components/tables/DataTable";

export default function ConversionRequestsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<ConversionRequest[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await leadConversionAdminService.getAll(statusFilter === '' || statusFilter === 'ALL' ? undefined : statusFilter);
            setRequests(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load conversion requests",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const result = await leadConversionAdminService.approve(selectedRequest.id, adminNotes);

            // Show credentials to admin
            setCredentials({
                email: selectedRequest.email,
                password: result.tempPassword,
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
            key: "companyName",
            label: "Company",
            render: (item) => <span className="font-medium">{item.companyName}</span>
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
            key: "createdAt",
            label: "Submitted",
            render: (item) => {
                const date = item.createdAt ? new Date(item.createdAt) : null;
                return <span>{date && !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '-'}</span>;
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <div className="flex gap-2">
                    {item.status === 'PENDING' ? (
                        <>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => openDialog(item, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDialog(item, 'decline')}
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

            <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
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
                    searchKeys={["companyName", "email"]}
                />
            </div>

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
                                        <strong>Company:</strong> {selectedRequest.companyName}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {selectedRequest.email}
                                    </div>
                                    {selectedRequest.agentNotes && (
                                        <div>
                                            <strong>Agent Notes:</strong>
                                            <p className="mt-1 text-muted-foreground">{selectedRequest.agentNotes}</p>
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
                        <DialogTitle>Account Created Successfully</DialogTitle>
                        <DialogDescription>
                            The lead has been converted to a company account. Please share these login details with the user.
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
                            <span className="text-sm font-medium text-muted-foreground">Password:</span>
                            <span className="text-sm font-mono text-primary font-bold col-span-2">
                                {credentials?.password || '******** (Manually set by agent)'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-700 mt-2">
                        <strong>Security Note:</strong> This password will not be shown again. Please ensure you copy it now.
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setCredentials(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
