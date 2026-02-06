/**
 * Consultant 360 Earnings Page
 * Unified view of commissions and withdrawals from both recruiter and sales activities
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";

import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    DollarSign,
    Briefcase,
    Target,
    Wallet,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowDownToLine,
    ExternalLink,
} from "lucide-react";
import {
    consultant360Service,
    type UnifiedEarnings,
    type Commission,
    type Withdrawal,
    type StripeAccountStatus,
} from "@/shared/services/consultant360/consultant360Service";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { format } from "date-fns";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "sonner";

export default function Consultant360EarningsPage() {
    const [earnings, setEarnings] = useState<UnifiedEarnings | null>(null);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commissionFilter, setCommissionFilter] = useState<"ALL" | "RECRUITER" | "SALES">("ALL");

    // Withdrawal dialog state
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
    const [withdrawalNotes, setWithdrawalNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("stripe_success") === "true") {
            toast.success("Stripe account connected successfully!");
            // Remove the query param to prevent double toasts on reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
            loadData();
        } else if (searchParams.get("stripe_refresh") === "true") {
             // Just reload if they refreshed the onboarding form
             loadData();
        } else {
             loadData();
        }
    }, [searchParams]);

    async function loadData() {
        setLoading(true);
        try {
            const [earningsRes, withdrawalsRes, stripeRes] = await Promise.all([
                consultant360Service.getEarnings(),
                consultant360Service.getWithdrawals(),
                consultant360Service.getStripeStatus(),
            ]);

            if (earningsRes.success && earningsRes.data) {
                setEarnings(earningsRes.data);
            }
            if (withdrawalsRes.success && withdrawalsRes.data) {
                setWithdrawals(withdrawalsRes.data.withdrawals);
            }
            if (stripeRes.success && stripeRes.data) {
                setStripeStatus(stripeRes.data);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load data");
        }
        setLoading(false);
    }

    function getFilteredCommissions(): Commission[] {
        if (!earnings) return [];
        if (commissionFilter === "RECRUITER") {
            return earnings.recruiterEarnings?.commissions || [];
        }
        if (commissionFilter === "SALES") {
            return earnings.salesEarnings?.commissions || [];
        }
        const recruiterCommissions = earnings.recruiterEarnings?.commissions || [];
        const salesCommissions = earnings.salesEarnings?.commissions || [];
        return [...recruiterCommissions, ...salesCommissions].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    function toggleCommissionSelection(id: string) {
        setSelectedCommissions((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }

    function selectAllAvailable() {
        const availableIds = earnings?.combined?.availableCommissions?.map((c) => c.id) || [];
        setSelectedCommissions(availableIds);
    }

    function getSelectedAmount(): number {
        const available = earnings?.combined?.availableCommissions || [];
        return available
            .filter((c) => selectedCommissions.includes(c.id))
            .reduce((sum, c) => sum + c.amount, 0);
    }

    async function handleWithdrawalSubmit() {
        if (selectedCommissions.length === 0) {
            toast.error("Please select at least one commission");
            return;
        }

        const amount = getSelectedAmount();
        if (amount <= 0) {
            toast.error("Invalid withdrawal amount");
            return;
        }

        setSubmitting(true);
        const response = await consultant360Service.requestWithdrawal({
            amount,
            paymentMethod: "stripe",
            commissionIds: selectedCommissions,
            notes: withdrawalNotes,
        });

        if (response.success) {
            toast.success("Withdrawal request submitted successfully");
            setWithdrawDialogOpen(false);
            setSelectedCommissions([]);
            setWithdrawalNotes("");
            loadData(); // Refresh data
        } else {
            toast.error(response.error || "Failed to submit withdrawal");
        }
        setSubmitting(false);
    }

    async function handleStripeOnboard() {
        const response = await consultant360Service.stripeOnboard();
        if (response.success && response.data?.accountLink?.url) {
            window.location.href = response.data.accountLink.url;
        } else {
            toast.error(response.error || "Failed to start Stripe onboarding");
        }
    }

    async function handleStripeLogin() {
        const response = await consultant360Service.getStripeLoginLink();
        if (response.success && response.data?.url) {
            window.open(response.data.url, "_blank");
        } else {
            toast.error(response.error || "Failed to get Stripe login link");
        }
    }

    if (loading) {
        return <EarningsSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error Loading Earnings</CardTitle>
                        <CardDescription className="text-red-500">{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const combined = earnings?.combined;
    const availableCommissions = earnings?.combined?.availableCommissions || [];

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Earnings</h1>
                    <p className="text-muted-foreground">
                        Unified view of your commissions from all sources
                    </p>
                </div>

                {/* Withdraw Button */}
                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={(combined?.availableBalance || 0) <= 0}>
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            Request Withdrawal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Request Withdrawal</DialogTitle>
                            <DialogDescription>
                                Select the commissions you want to withdraw. Total available: $
                                {combined?.availableBalance?.toLocaleString() || 0}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Stripe Status Check */}
                            {!stripeStatus?.payoutsEnabled && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-amber-800 font-medium mb-2">
                                        Stripe Connect Required
                                    </p>
                                    <p className="text-sm text-amber-700 mb-3">
                                        You need to complete Stripe onboarding to receive payouts.
                                    </p>
                                    <Button onClick={handleStripeOnboard} variant="outline" size="sm">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Complete Stripe Setup
                                    </Button>
                                </div>
                            )}

                            {/* Select All */}
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" onClick={selectAllAvailable}>
                                    Select All Available
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Selected: ${getSelectedAmount().toLocaleString()}
                                </p>
                            </div>

                            {/* Commission List */}
                            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                                {availableCommissions.length === 0 ? (
                                    <p className="text-center py-4 text-muted-foreground">
                                        No commissions available for withdrawal
                                    </p>
                                ) : (
                                    availableCommissions.map((commission) => (
                                        <div
                                            key={commission.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedCommissions.includes(commission.id)
                                                ? "bg-primary/10 border-primary"
                                                : "hover:bg-muted/50"
                                                }`}
                                            onClick={() => toggleCommissionSelection(commission.id)}
                                        >
                                            <Checkbox
                                                checked={selectedCommissions.includes(commission.id)}
                                                onCheckedChange={() => toggleCommissionSelection(commission.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{commission.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {commission.type === "PLACEMENT" ? "Recruiter" : "Sales"}
                                                    </Badge>
                                                    <span>
                                                        {(() => {
                                                            try {
                                                                return commission.createdAt ? format(new Date(commission.createdAt), "MMM d, yyyy") : 'N/A';
                                                            } catch (e) {
                                                                return 'Invalid Date';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="font-bold text-green-600">
                                                +${commission.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes for this withdrawal request..."
                                    value={withdrawalNotes}
                                    onChange={(e) => setWithdrawalNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleWithdrawalSubmit}
                                disabled={submitting || selectedCommissions.length === 0 || !stripeStatus?.payoutsEnabled}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit (${getSelectedAmount().toLocaleString()})
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Balance Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedStatCard
                    title="Available Balance"
                    value={combined?.availableBalance ?? 0}
                    change="Available now"
                    icon={<Wallet className="h-5 w-5" />}
                    variant="success"
                    isCurrency
                    rawValue={combined?.availableBalance ?? 0}
                />

                <EnhancedStatCard
                    title="Pending"
                    value={combined?.pendingBalance ?? 0}
                    change="Awaiting approval"
                    icon={<Clock className="h-5 w-5" />}
                    variant="warning"
                    isCurrency
                    rawValue={combined?.pendingBalance ?? 0}
                />

                <EnhancedStatCard
                    title="Total Earned"
                    value={combined?.totalEarned ?? 0}
                    change="All time"
                    icon={<DollarSign className="h-5 w-5" />}
                    variant="primary"
                    isCurrency
                    rawValue={combined?.totalEarned ?? 0}
                />

                <EnhancedStatCard
                    title="Total Withdrawn"
                    value={combined?.totalWithdrawn ?? 0}
                    change="All time"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    variant="neutral"
                    isCurrency
                    rawValue={combined?.totalWithdrawn ?? 0}
                />
            </div>

            {/* Earnings Breakdown */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Recruiter Earnings
                        </CardTitle>
                        <CardDescription>From job placements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Placements</span>
                            <span className="font-medium">{earnings?.recruiterEarnings?.totalPlacements || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Revenue</span>
                            <span className="font-medium text-green-600">
                                ${earnings?.recruiterEarnings?.totalRevenue?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-amber-600">
                                ${earnings?.recruiterEarnings?.pendingCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Confirmed</span>
                            <span className="font-medium text-blue-600">
                                ${earnings?.recruiterEarnings?.confirmedCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Paid</span>
                            <span className="font-medium text-purple-600">
                                ${earnings?.recruiterEarnings?.paidCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Sales Earnings
                        </CardTitle>
                        <CardDescription>From subscriptions & services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subscription Sales</span>
                            <span className="font-medium text-green-600">
                                ${earnings?.salesEarnings?.totalSubscriptionSales?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Fees</span>
                            <span className="font-medium text-green-600">
                                ${earnings?.salesEarnings?.totalServiceFees?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-amber-600">
                                ${earnings?.salesEarnings?.pendingCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Confirmed</span>
                            <span className="font-medium text-blue-600">
                                ${earnings?.salesEarnings?.confirmedCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Paid</span>
                            <span className="font-medium text-purple-600">
                                ${earnings?.salesEarnings?.paidCommissions?.toLocaleString() || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stripe Connect Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Stripe Connect
                    </CardTitle>
                    <CardDescription>Manage your payout settings</CardDescription>
                </CardHeader>
                <CardContent>
                    {stripeStatus?.hasAccount ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {stripeStatus.payoutsEnabled ? (
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-amber-100 rounded-full">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">
                                        {stripeStatus.payoutsEnabled
                                            ? "Stripe Connected"
                                            : "Setup Incomplete"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {stripeStatus.payoutsEnabled
                                            ? "You can receive payouts"
                                            : "Complete setup to receive payouts"}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleStripeLogin}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {stripeStatus.payoutsEnabled ? "Stripe Dashboard" : "Complete Setup"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-full">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">Not Connected</p>
                                    <p className="text-sm text-muted-foreground">
                                        Connect Stripe to receive payouts
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleStripeOnboard}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Connect Stripe
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Commission History & Withdrawal History Tabs */}
            <Tabs defaultValue="commissions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="commissions">Commission History</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
                </TabsList>

                <TabsContent value="commissions">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Commission History</CardTitle>
                                    <CardDescription>All your earnings from placements and sales</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={commissionFilter === "ALL" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCommissionFilter("ALL")}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={commissionFilter === "RECRUITER" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCommissionFilter("RECRUITER")}
                                    >
                                        Recruiter
                                    </Button>
                                    <Button
                                        variant={commissionFilter === "SALES" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCommissionFilter("SALES")}
                                    >
                                        Sales
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {getFilteredCommissions().length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No commissions found
                                    </div>
                                ) : (
                                    getFilteredCommissions().map((commission) => (
                                        <div
                                            key={commission.id}
                                            className="flex items-center justify-between p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full ${commission.type === "PLACEMENT"
                                                        ? "bg-blue-100"
                                                        : "bg-green-100"
                                                        }`}
                                                >
                                                    {commission.type === "PLACEMENT" ? (
                                                        <Briefcase className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Target className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {commission.description || "Commission"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(() => {
                                                            try {
                                                                return commission.createdAt ? format(new Date(commission.createdAt), "MMMM d, yyyy") : 'N/A';
                                                            } catch (e) {
                                                                return 'Invalid Date';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${commission.amount.toLocaleString()}</p>
                                                <Badge
                                                    variant={
                                                        commission.status === "PAID"
                                                            ? "default"
                                                            : commission.status === "CONFIRMED"
                                                                ? "secondary"
                                                                : commission.status === "PENDING"
                                                                    ? "outline"
                                                                    : "destructive"
                                                    }
                                                >
                                                    {commission.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Withdrawal History</CardTitle>
                            <CardDescription>Your withdrawal requests and payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {withdrawals.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No withdrawals found
                                    </div>
                                ) : (
                                    withdrawals.map((withdrawal) => (
                                        <div
                                            key={withdrawal.id}
                                            className="flex items-center justify-between p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full ${withdrawal.status === "COMPLETED"
                                                        ? "bg-green-100"
                                                        : withdrawal.status === "PENDING"
                                                            ? "bg-amber-100"
                                                            : withdrawal.status === "REJECTED"
                                                                ? "bg-red-100"
                                                                : "bg-blue-100"
                                                        }`}
                                                >
                                                    {withdrawal.status === "COMPLETED" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : withdrawal.status === "REJECTED" ? (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-amber-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        Withdrawal #{withdrawal.id.slice(0, 8)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(() => {
                                                            try {
                                                                return withdrawal.createdAt ? format(new Date(withdrawal.createdAt), "MMMM d, yyyy") : 'N/A';
                                                            } catch (e) {
                                                                return 'Invalid Date';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${withdrawal.amount.toLocaleString()}</p>
                                                <Badge
                                                    variant={
                                                        withdrawal.status === "COMPLETED"
                                                            ? "default"
                                                            : withdrawal.status === "APPROVED"
                                                                ? "secondary"
                                                                : withdrawal.status === "PENDING"
                                                                    ? "outline"
                                                                    : "destructive"
                                                    }
                                                >
                                                    {withdrawal.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EarningsSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[...Array(5)].map((_, j) => (
                                <Skeleton key={j} className="h-5 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
