import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { leadConversionAdminService } from '@/shared/lib/hrm8/leadConversionAdminService';
import { ConversionRequest } from '@/shared/lib/sales/leadConversionService';
import { format } from 'date-fns';

export default function ConversionRequestsPage() {
    const [requests, setRequests] = useState<ConversionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ConversionRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    // Credentials Dialog
    const [credentials, setCredentials] = useState<{ email: string; password?: string; companyName: string } | null>(null);

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await leadConversionAdminService.getAll(statusFilter === '' ? undefined : statusFilter);
            setRequests(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load conversion requests');
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

            toast.success(`Conversion request approved!`);
            closeDialog();
            loadRequests();
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleDecline = async () => {
        if (!selectedRequest || !declineReason.trim()) {
            toast.error('Decline reason is required');
            return;
        }

        try {
            setProcessing(true);
            await leadConversionAdminService.decline(selectedRequest.id, declineReason);
            toast.success('Conversion request declined');
            closeDialog();
            loadRequests();
        } catch (error: any) {
            toast.error(error.message || 'Failed to decline request');
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
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | null | undefined; label: string }> = {
            PENDING: { variant: 'default', label: 'Pending Review' },
            APPROVED: { variant: 'secondary', label: 'Approved' },
            DECLINED: { variant: 'destructive', label: 'Declined' },
            CONVERTED: { variant: 'success', label: 'Converted' },
            CANCELLED: { variant: 'outline', label: 'Cancelled' },
        };

        const config = variants[status] || variants.PENDING;
        // @ts-ignore - variant success might not be in standard badge types but handled by custom styles or just fallback
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Lead Conversion Requests</h1>
                    <p className="text-muted-foreground">Review and approve conversion requests from sales agents</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Conversion Requests</CardTitle>
                                <CardDescription>Manage lead conversion approval workflow</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={statusFilter === '' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('')}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('PENDING')}
                                >
                                    Pending
                                </Button>
                                <Button
                                    variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('APPROVED')}
                                >
                                    Approved
                                </Button>
                                <Button
                                    variant={statusFilter === 'DECLINED' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('DECLINED')}
                                >
                                    Declined
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No conversion requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        requests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.companyName}</TableCell>
                                                <TableCell>{request.email}</TableCell>
                                                <TableCell>{request.country}</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    {request.status === 'PENDING' ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => openDialog(request, 'approve')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => openDialog(request, 'decline')}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Decline
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No actions</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Action Dialog */}
                <Dialog open={!!actionType} onOpenChange={() => closeDialog()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'approve' ? 'Approve Conversion Request' : 'Decline Conversion Request'}
                            </DialogTitle>
                            <DialogDescription asChild>
                                {selectedRequest && (
                                    <div className="mt-4 space-y-2">
                                        <div>
                                            <strong>Company:</strong> {selectedRequest.companyName}
                                        </div>
                                        <div>
                                            <strong>Email:</strong> {selectedRequest.email}
                                        </div>
                                        {selectedRequest.agentNotes && (
                                            <div>
                                                <strong>Agent Notes:</strong>
                                                <p className="text-sm mt-1">{selectedRequest.agentNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {actionType === 'approve' ? (
                                <div>
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
                                <div>
                                    <Label htmlFor="declineReason">Decline Reason *</Label>
                                    <Textarea
                                        id="declineReason"
                                        value={declineReason}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                        placeholder="Provide a reason for declining this request..."
                                        rows={3}
                                        required
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
