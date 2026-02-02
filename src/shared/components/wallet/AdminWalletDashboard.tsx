/**
 * Admin Wallet Dashboard (HRM8 Admin)
 * Global wallet stats, pending approvals, and platform overview
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function AdminWalletDashboard() {
    // Fetch global wallet stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin', 'wallet', 'stats'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/admin/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            return response.json();
        },
    });

    // Fetch pending withdrawals
    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
        queryKey: ['admin', 'withdrawals', 'pending'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/admin/withdrawals/pending?limit=10');
            if (!response.ok) throw new Error('Failed to fetch pending withdrawals');
            return response.json();
        },
    });

    // Fetch pending refunds
    const { data: refundsData, isLoading: refundsLoading } = useQuery({
        queryKey: ['admin', 'refunds', 'pending'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/admin/refunds/pending?limit=10');
            if (!response.ok) throw new Error('Failed to fetch pending refunds');
            return response.json();
        },
    });

    const stats = statsData?.data;
    const withdrawals = withdrawalsData?.data?.withdrawals || [];
    const refunds = refundsData?.data?.refunds || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Wallet Administration</h1>
                <p className="text-muted-foreground mt-1">
                    Platform-wide wallet stats and approval queue
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                {statsLoading ? (
                    <>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </>
                ) : stats ? (
                    <>
                        {/* Total Wallets */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Wallet className="h-4 w-4" />
                                    <p className="text-xs">Total Wallets</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.overall?._count || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across all user types
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Balance */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    <p className="text-xs">Total Balance</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    ${(stats.overall?._sum?.balance || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Platform-wide
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Credits */}
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <p className="text-xs">Total Credits</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    ${(stats.overall?._sum?.total_credits || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All-time
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Debits */}
                        <Card className="border-red-200 dark:border-red-800">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-red-600">
                                    <TrendingDown className="h-4 w-4" />
                                    <p className="text-xs">Total Debits</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-red-600">
                                    ${(stats.overall?._sum?.total_debits || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All-time
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>

            {/* Approval Queue Tabs */}
            <Tabs defaultValue="withdrawals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="withdrawals" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Withdrawals
                        {withdrawals.length > 0 && (
                            <Badge variant="secondary">{withdrawals.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="refunds" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Pending Refunds
                        {refunds.length > 0 && (
                            <Badge variant="secondary">{refunds.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Withdrawals Tab */}
                <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Withdrawal Requests</CardTitle>
                            <CardDescription>
                                Review and approve consultant withdrawal requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {withdrawalsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-20 w-full" />
                                    ))}
                                </div>
                            ) : withdrawals.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        No pending withdrawal requests
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {withdrawals.map((withdrawal: any) => (
                                        <div
                                            key={withdrawal.id}
                                            className="flex items-center gap-3 p-4 border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium">{withdrawal.consultant?.first_name} {withdrawal.consultant?.last_name}</p>
                                                    <Badge variant="secondary">PENDING</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {withdrawal.consultant?.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Method: {withdrawal.payment_method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">${withdrawal.amount.toFixed(2)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="default">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Refunds Tab */}
                <TabsContent value="refunds">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Refund Requests</CardTitle>
                            <CardDescription>
                                Review and approve company refund requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {refundsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-20 w-full" />
                                    ))}
                                </div>
                            ) : refunds.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        No pending refund requests
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {refunds.map((refund: any) => (
                                        <div
                                            key={refund.id}
                                            className="flex items-center gap-3 p-4 border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium">{refund.company?.name}</p>
                                                    <Badge variant="secondary">PENDING</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{refund.reason}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Type: {refund.transaction_type} • {new Date(refund.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">${refund.amount.toFixed(2)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="default">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
