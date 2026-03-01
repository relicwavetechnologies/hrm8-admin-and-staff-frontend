import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Eye, Loader2, Wallet, XCircle } from "lucide-react";

import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";
import { leadConversionAdminService, type ConversionReviewContext } from "@/shared/services/hrm8/leadConversionAdminService";
import { ConversionRequest } from "@/shared/services/leadConversionService";

const formatDate = (value?: string | null) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return format(date, "MMM dd, yyyy p");
};

const compactDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return format(date, "MMM dd, yyyy");
};

export default function ConversionRequestsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<ConversionRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("PENDING");
    const [selectedRequest, setSelectedRequest] = useState<ConversionRequest | null>(null);
    const [reviewContext, setReviewContext] = useState<ConversionReviewContext | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [declineReason, setDeclineReason] = useState("");
    const [credentials, setCredentials] = useState<{ email: string; companyName: string } | null>(null);

    const loadRequests = async () => {
        try {
            const data = await leadConversionAdminService.getAll(
                statusFilter === "ALL" ? undefined : statusFilter
            );
            setRequests(data || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load conversion requests",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        void loadRequests();
    }, [statusFilter]);

    const loadReviewContext = async (request: ConversionRequest) => {
        setSelectedRequest(request);
        setSheetOpen(true);
        setReviewLoading(true);
        setReviewContext(null);
        setAdminNotes("");
        setDeclineReason("");

        try {
            const context = await leadConversionAdminService.getReviewContext(request.id);
            setReviewContext(context);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load conversion review details",
                variant: "destructive",
            });
        } finally {
            setReviewLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            setProcessing(true);
            const result = await leadConversionAdminService.approve(selectedRequest.id, adminNotes);
            setCredentials({
                email: selectedRequest.email,
                companyName: result.company.name,
            });
            toast({ title: "Approved", description: "Conversion request approved successfully." });
            setSheetOpen(false);
            await loadRequests();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to approve request",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDecline = async () => {
        if (!selectedRequest) return;
        if (!declineReason.trim()) {
            toast({
                title: "Decline reason required",
                description: "Please provide a decline reason before continuing.",
                variant: "destructive",
            });
            return;
        }
        try {
            setProcessing(true);
            await leadConversionAdminService.decline(selectedRequest.id, declineReason);
            toast({ title: "Declined", description: "Conversion request declined." });
            setSheetOpen(false);
            await loadRequests();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to decline request",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
            case "APPROVED":
                return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">Approved</Badge>;
            case "DECLINED":
                return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Declined</Badge>;
            case "CONVERTED":
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Converted</Badge>;
            case "CANCELLED":
                return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: Column<ConversionRequest>[] = useMemo(() => [
        {
            key: "company_name",
            label: "Company",
            render: (item) => (
                <div className="space-y-1">
                    <div className="font-medium">{item.company_name}</div>
                    <div className="text-xs text-muted-foreground">{item.email}</div>
                    <div className="text-xs text-muted-foreground">{item.website || "No website provided"}</div>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item) => getStatusBadge(item.status),
        },
        {
            key: "lead_confirmed_at",
            label: "Lead Confirmed",
            render: (item) => <span>{compactDate(item.lead_confirmed_at)}</span>,
        },
        {
            key: "created_at",
            label: "Requested",
            render: (item) => <span>{compactDate(item.created_at)}</span>,
        },
        {
            key: "has_first_payment",
            label: "First Payment",
            render: (item) => (
                <Badge variant="outline" className={item.has_first_payment ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                    {item.has_first_payment ? "Captured" : "Not yet"}
                </Badge>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <Button size="sm" variant="outline" onClick={(event) => {
                    event.stopPropagation();
                    void loadReviewContext(item);
                }}>
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                </Button>
            ),
        },
    ], []);

    const pendingRequest = selectedRequest?.status === "PENDING";

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Lead Conversion Requests</h1>
                <p className="text-muted-foreground">
                    Review conversion requests with full lifecycle and payment evidence before approval.
                </p>
            </div>

            <Card className="p-4 space-y-4 rounded-2xl">
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {["ALL", "PENDING", "APPROVED", "DECLINED", "CONVERTED"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="rounded-full"
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={requests}
                    searchable
                    searchKeys={["company_name", "email", "website"]}
                    onRowClick={(item) => {
                        void loadReviewContext(item);
                    }}
                />
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
                    <div className="flex h-full flex-col">
                        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-background/95 backdrop-blur">
                            <SheetTitle className="text-xl">Conversion Review</SheetTitle>
                            <SheetDescription>
                                {selectedRequest?.company_name
                                    ? `Request for ${selectedRequest.company_name}`
                                    : "Review conversion details"}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {reviewLoading && (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 rounded-2xl" />
                                    <Skeleton className="h-24 rounded-2xl" />
                                    <Skeleton className="h-48 rounded-2xl" />
                                </div>
                            )}

                            {!reviewLoading && reviewContext && (
                                <>
                                    <section className="space-y-3">
                                        <h2 className="text-base font-semibold">Approval Essentials</h2>
                                        <div className="rounded-2xl border p-4 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{reviewContext.request.company_name}</span></div>
                                                <div><span className="text-muted-foreground">Website:</span> <span className="font-medium">{reviewContext.request.website || "Not provided"}</span></div>
                                                <div><span className="text-muted-foreground">Requested:</span> <span className="font-medium">{formatDate(reviewContext.request.created_at)}</span></div>
                                                <div><span className="text-muted-foreground">Lead Confirmed:</span> <span className="font-medium">{formatDate(reviewContext.leadMilestones?.lead_confirmed_at)}</span></div>
                                                <div><span className="text-muted-foreground">Lead Source:</span> <span className="font-medium">{reviewContext.leadMilestones?.lead_source || "Unknown"}</span></div>
                                                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(reviewContext.request.status)}</div>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Sales Notes</p>
                                                <p className="text-sm rounded-xl border bg-muted/20 p-3">
                                                    {reviewContext.request.agent_notes || "No notes provided."}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Intent Snapshot</p>
                                                <div className="rounded-xl border bg-muted/20 p-3 text-sm space-y-1">
                                                    <div>Setup Flow: <span className="font-medium">{String(reviewContext.request.intent_snapshot?.intendedSetupType || "Not specified")}</span></div>
                                                    <div>Service: <span className="font-medium">{String(reviewContext.request.intent_snapshot?.intendedServicePackage || "Not specified")}</span></div>
                                                    <div>Expected Plan: <span className="font-medium">{String(reviewContext.request.intent_snapshot?.expectedSubscriptionPlan || "Not specified")}</span></div>
                                                    <div>Expected First Payment: <span className="font-medium">
                                                        {reviewContext.request.intent_snapshot?.expectedFirstPaymentAmount
                                                            ? `${reviewContext.request.intent_snapshot?.expectedCurrency || ""} ${reviewContext.request.intent_snapshot.expectedFirstPaymentAmount}`
                                                            : "Not specified"}
                                                    </span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-base font-semibold">Post-Conversion Revenue Evidence</h2>
                                        <div className="rounded-2xl border p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>First Job Posted: <span className="font-medium">{formatDate(reviewContext.firstJobEvidence?.posted_at)}</span></div>
                                                <div>Flow: <span className="font-medium">{reviewContext.firstJobEvidence?.setup_type || "Not available yet"}</span></div>
                                                <div>Service: <span className="font-medium">{reviewContext.firstJobEvidence?.service_package || reviewContext.firstJobEvidence?.hiring_mode || "Not available yet"}</span></div>
                                                <div>Job Payment Status: <span className="font-medium">{reviewContext.firstJobEvidence?.payment_status || "Not available yet"}</span></div>
                                                <div>Subscription at First Job: <span className="font-medium">{reviewContext.subscriptionAtFirstJob?.name || "Not available yet"}</span></div>
                                                <div>Subscription Price: <span className="font-medium">
                                                    {reviewContext.subscriptionAtFirstJob
                                                        ? `${reviewContext.subscriptionAtFirstJob.currency} ${reviewContext.subscriptionAtFirstJob.base_price}`
                                                        : "Not available yet"}
                                                </span></div>
                                            </div>

                                            <div className="rounded-xl border bg-muted/20 p-3 text-sm space-y-1">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Wallet className="h-4 w-4" />
                                                    First Payment Evidence
                                                </div>
                                                <div>Source: <span className="font-medium">{reviewContext.firstPaymentEvidence?.source || "Not available yet"}</span></div>
                                                <div>Amount: <span className="font-medium">
                                                    {reviewContext.firstPaymentEvidence
                                                        ? `${reviewContext.firstPaymentEvidence.currency || ""} ${reviewContext.firstPaymentEvidence.amount}`
                                                        : "Not available yet"}
                                                </span></div>
                                                <div>Paid At: <span className="font-medium">{formatDate(reviewContext.firstPaymentEvidence?.paid_at)}</span></div>
                                            </div>

                                            <div className="rounded-xl border bg-muted/20 p-3 text-sm space-y-1">
                                                <div>Commission Eligible: <span className="font-medium">{reviewContext.commissionReadiness?.eligible ? "Yes" : "No"}</span></div>
                                                <div>Reason: <span className="font-medium">{reviewContext.commissionReadiness?.reason}</span></div>
                                                {reviewContext.commissionReadiness?.existing_commission_id && (
                                                    <div>
                                                        Existing Commission: <span className="font-medium">{reviewContext.commissionReadiness.existing_commission_status} ({reviewContext.commissionReadiness.existing_commission_id})</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        <div className="border-t bg-background/95 backdrop-blur px-6 py-4 space-y-3 sticky bottom-0">
                            {pendingRequest && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                                        <Textarea
                                            id="admin-notes"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={2}
                                            placeholder="Context for internal audit trail..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="decline-reason">Decline Reason (required only if declining)</Label>
                                        <Textarea
                                            id="decline-reason"
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                            rows={2}
                                            placeholder="If declining, explain why."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={processing}>
                                    Close
                                </Button>
                                {pendingRequest && (
                                    <>
                                        <Button
                                            variant="destructive"
                                            onClick={() => void handleDecline()}
                                            disabled={processing}
                                            className="rounded-full"
                                        >
                                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Decline
                                        </Button>
                                        <Button
                                            onClick={() => void handleApprove()}
                                            disabled={processing}
                                            className="rounded-full"
                                        >
                                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog open={!!credentials} onOpenChange={(open) => !open && setCredentials(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Sent Successfully</DialogTitle>
                        <DialogDescription>
                            Lead has been converted and an invite link was sent to the company admin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted p-4 rounded-lg space-y-3 mt-4 border">
                        <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted-foreground/10">
                            <span className="text-sm font-medium text-muted-foreground">Company:</span>
                            <span className="text-sm font-bold col-span-2">{credentials?.companyName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1">
                            <span className="text-sm font-medium text-muted-foreground">Email:</span>
                            <span className="text-sm font-mono col-span-2 break-all">{credentials?.email}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setCredentials(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
