/**
 * Consultant Earnings Dashboard
 * Shows earnings, wallet balance, and withdrawal options
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    FileText,
    Download,
} from "lucide-react";
import { WalletBalance } from "@/shared/components/wallet/WalletBalance";
import { TransactionList } from "@/shared/components/wallet/TransactionList";
import { cn } from "@/shared/lib/utils";

export function ConsultantEarningsDashboard() {

    // Fetch wallet balance
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['consultant', 'wallet', 'balance'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/balance');
            if (!response.ok) throw new Error('Failed to fetch wallet balance');
            return response.json();
        },
    });

    // Fetch earnings summary
    const { data: earningsData, isLoading: earningsLoading } = useQuery({
        queryKey: ['consultant', 'earnings'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/earnings');
            if (!response.ok) throw new Error('Failed to fetch earnings');
            return response.json();
        },
    });

    // Fetch transaction history
    const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
        queryKey: ['consultant', 'wallet', 'transactions'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/transactions?limit=10');
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
    });


    const wallet = walletData?.data;
    const earnings = earningsData?.data;
    const transactions = transactionsData?.data?.transactions || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Earnings & Wallet</h1>
                <p className="text-muted-foreground mt-1">
                    Track your commissions, balance, and withdrawal history
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
                />

                {/* Earnings Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Earnings Summary
                        </CardTitle>
                        <CardDescription>Your commission breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {earningsLoading ? (
                            <>
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </>
                        ) : earnings ? (
                            <>
                                {/* Total Earned */}
                                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-muted-foreground">Total Earned</p>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${earnings.totalEarned?.toFixed(2) || '0.00'}
                                    </p>
                                </div>

                                {/* Pending Commissions */}
                                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <p className="text-xs text-muted-foreground">Pending Commissions</p>
                                    </div>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        ${earnings.pendingCommissions?.toFixed(2) || '0.00'}
                                    </p>
                                    {earnings.commissions?.pending?.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {earnings.commissions.pending.length} pending commission{earnings.commissions.pending.length !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Total Withdrawn */}
                                <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Download className="h-4 w-4 text-blue-600" />
                                        <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${earnings.totalWithdrawn?.toFixed(2) || '0.00'}
                                    </p>
                                </div>

                                {/* Withdraw Button */}
                                <Button
                                    onClick={() => { }}
                                    className="w-full"
                                    disabled={!wallet?.balance || wallet.balance <= 0 || wallet.status !== 'ACTIVE'}
                                >
                                    {wallet?.balance && wallet.balance > 0 ? (
                                        <>
                                            <Download className="h-4 w-4 mr-2" />
                                            Request Withdrawal
                                        </>
                                    ) : (
                                        'Insufficient Balance'
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground">
                                    No earnings data available
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Withdrawals */}
            {earnings?.withdrawals && earnings.withdrawals.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Withdrawals</CardTitle>
                        <CardDescription>Your withdrawal request history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {earnings.withdrawals.map((withdrawal: any) => (
                                <div
                                    key={withdrawal.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                    <div className={cn(
                                        "flex items-center justify-center h-10 w-10 rounded-full",
                                        withdrawal.status === 'APPROVED' ? "bg-green-100 dark:bg-green-950 text-green-600" :
                                            withdrawal.status === 'PENDING' ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600" :
                                                "bg-red-100 dark:bg-red-950 text-red-600"
                                    )}>
                                        {withdrawal.status === 'APPROVED' ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : withdrawal.status === 'PENDING' ? (
                                            <Clock className="h-5 w-5" />
                                        ) : (
                                            <FileText className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">
                                                ${withdrawal.amount.toFixed(2)}
                                            </p>
                                            <Badge variant={
                                                withdrawal.status === 'APPROVED' ? 'default' :
                                                    withdrawal.status === 'PENDING' ? 'secondary' :
                                                        'destructive'
                                            }>
                                                {withdrawal.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {withdrawal.payment_method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Transaction History */}
            <TransactionList
                transactions={transactions}
                isLoading={transactionsLoading}
                emptyMessage="No transactions yet. Your earnings will appear here."
            />

            {/* TODO: Add Withdrawal Dialog */}
            {/* {showWithdrawDialog && <WithdrawalDialog onClose={() => setShowWithdrawDialog(false)} />} */}
        </div>
    );
}
