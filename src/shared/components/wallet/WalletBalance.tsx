/**
 * Wallet Balance Display Component
 * Reusable component to display wallet balance across dashboards
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Plus } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface WalletBalanceProps {
    balance: number;
    totalCredits: number;
    totalDebits: number;
    status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
    isLoading?: boolean;
    showRechargeButton?: boolean;
    onRechargeClick?: () => void;
    className?: string;
}

export function WalletBalance({
    balance,
    totalCredits,
    totalDebits,
    status,
    isLoading = false,
    showRechargeButton = false,
    onRechargeClick,
    className,
}: WalletBalanceProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isLowBalance = balance < 100 && status === 'ACTIVE';
    const statusVariant = status === 'ACTIVE' ? 'default' : status === 'FROZEN' ? 'secondary' : 'destructive';

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Virtual Wallet
                        </CardTitle>
                        <CardDescription>Your account balance in USD</CardDescription>
                    </div>
                    <Badge variant={statusVariant}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Balance */}
                <div className={cn(
                    "p-4 rounded-lg border",
                    isLowBalance ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800" : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                )}>
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
                        {isLowBalance && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Low Balance
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Credits & Debits */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-xs text-muted-foreground">Total Credits</p>
                        </div>
                        <p className="text-lg font-semibold text-green-600">${totalCredits.toFixed(2)}</p>
                    </div>

                    <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <p className="text-xs text-muted-foreground">Total Debits</p>
                        </div>
                        <p className="text-lg font-semibold text-red-600">${totalDebits.toFixed(2)}</p>
                    </div>
                </div>

                {/* Recharge Button */}
                {showRechargeButton && status === 'ACTIVE' && (
                    <Button
                        onClick={onRechargeClick}
                        className="w-full"
                        variant={isLowBalance ? "default" : "outline"}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {isLowBalance ? "Recharge Now" : "Add Funds"}
                    </Button>
                )}

                {status !== 'ACTIVE' && (
                    <div className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                {status === 'FROZEN' ? 'Your wallet is temporarily frozen. Contact support.' : 'Your wallet is suspended.'}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
