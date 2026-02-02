/**
 * Subscription Management Page (Company Dashboard)
 * REPLACES the old "Pay As You Go" UI
 * Shows subscription details, usage, wallet balance, and upgrade options
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    Sparkles,
    Check,
    Briefcase,
    Calendar,
    TrendingUp,
    AlertCircle,
    CreditCard,
} from "lucide-react";
import { WalletBalance } from "@/shared/components/wallet/WalletBalance";
import { TransactionList } from "@/shared/components/wallet/TransactionList";
import { SubscriptionUpgradeDialog } from "@/shared/components/wallet/SubscriptionUpgradeDialog";
import { WalletRechargeDialog } from "@/shared/components/wallet/WalletRechargeDialog";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";

export function SubscriptionManagementPage() {
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showRechargeDialog, setShowRechargeDialog] = useState(false);

    // Fetch wallet balance
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['wallet', 'balance'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/balance');
            if (!response.ok) throw new Error('Failed to fetch wallet balance');
            return response.json();
        },
    });

    // Fetch active subscription
    const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
        queryKey: ['wallet', 'subscription', 'active'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/subscriptions');
            if (!response.ok) throw new Error('Failed to fetch subscriptions');
            const result = await response.json();
            // Get the active subscription
            return result.data?.find((sub: any) => sub.status === 'ACTIVE') || null;
        },
    });

    // Fetch recent transactions
    const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
        queryKey: ['wallet', 'transactions'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/transactions?limit=10');
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
    });

    const handleRecharge = () => {
        setShowRechargeDialog(true);
    };

    const handleUpgrade = () => {
        setShowUpgradeDialog(true);
    };

    const subscription = subscriptionData;
    const wallet = walletData?.data;
    const transactions = transactionsData?.data?.transactions || [];

    const jobsUsagePercent = subscription?.jobs_used && subscription?.job_quota
        ? (subscription.jobs_used / subscription.job_quota) * 100
        : 0;

    const isNearingLimit = jobsUsagePercent >= 80;
    const hasExceededLimit = subscription?.job_quota && subscription?.jobs_used >= subscription?.job_quota;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Subscription & Wallet</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your subscription, wallet balance, and billing
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Wallet Balance */}
                <WalletBalance
                    balance={wallet?.balance || 0}
                    totalCredits={wallet?.totalCredits || 0}
                    totalDebits={wallet?.totalDebits || 0}
                    status={wallet?.status || 'ACTIVE'}
                    isLoading={walletLoading}
                    showRechargeButton
                    onRechargeClick={handleRecharge}
                />

                {/* Current Subscription */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Current Subscription
                                </CardTitle>
                                <CardDescription>Your active plan and usage</CardDescription>
                            </div>
                            {subscription && (
                                <Badge variant="default">
                                    {subscription.status}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscriptionLoading ? (
                            <>
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </>
                        ) : subscription ? (
                            <>
                                {/* Plan Name & Price */}
                                <div>
                                    <p className="text-2xl font-bold">{subscription.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        ${subscription.base_price} / {subscription.billing_cycle.toLowerCase()}
                                    </p>
                                </div>

                                {/* Jobs Usage */}
                                {subscription.job_quota && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Jobs Used</span>
                                            <span className="font-medium">
                                                {subscription.jobs_used} / {subscription.job_quota}
                                            </span>
                                        </div>
                                        <Progress value={jobsUsagePercent} className={cn(
                                            hasExceededLimit && "bg-red-200",
                                            isNearingLimit && !hasExceededLimit && "bg-yellow-200"
                                        )} />
                                        {hasExceededLimit && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <p className="text-xs text-red-700 dark:text-red-400">
                                                    Job quota exceeded. Upgrade to post more jobs.
                                                </p>
                                            </div>
                                        )}
                                        {isNearingLimit && !hasExceededLimit && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                    Nearing job quota limit. Consider upgrading.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Renewal Date */}
                                {subscription.renewal_date && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Renews on:</span>
                                        <span className="font-medium">
                                            {format(new Date(subscription.renewal_date), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                )}

                                {/* Prepaid Balance */}
                                {subscription.prepaid_balance !== null && (
                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Prepaid Balance</span>
                                            <span className="text-sm font-semibold">
                                                ${subscription.prepaid_balance.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Upgrade Button */}
                                <Button
                                    onClick={() => setShowUpgradeDialog(true)}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Upgrade Plan
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground mb-4">No active subscription</p>
                                <Button onClick={() => setShowUpgradeDialog(true)}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Choose a Plan
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <TransactionList
                transactions={transactions}
                isLoading={transactionsLoading}
                emptyMessage="No transactions yet. Your billing activity will appear here."
            />

            {/* Upgrade Dialog */}
            <SubscriptionUpgradeDialog
                open={showUpgradeDialog}
                onClose={() => setShowUpgradeDialog(false)}
                currentPlan={subscription?.name}
            />

            {/* Recharge Dialog */}
            <WalletRechargeDialog
                open={showRechargeDialog}
                onClose={() => setShowRechargeDialog(false)}
                currentBalance={wallet?.balance || 0}
            />
        </div>
    );
}
