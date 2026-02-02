/**
 * Transaction List Component
 * Reusable component to display wallet transactions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Briefcase,
    CreditCard,
    DollarSign,
    FileText,
    RefreshCw,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    balance_after: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    created_at: string;
    metadata?: Record<string, any>;
}

interface TransactionListProps {
    transactions: Transaction[];
    isLoading?: boolean;
    showLoadMore?: boolean;
    onLoadMore?: () => void;
    onTransactionClick?: (transaction: Transaction) => void;
    emptyMessage?: string;
    className?: string;
}

function getTransactionIcon(type: string) {
    const iconMap: Record<string, React.ReactNode> = {
        'SUBSCRIPTION_PURCHASE': <CreditCard className="h-4 w-4" />,
        'JOB_POSTING_DEDUCTION': <Briefcase className="h-4 w-4" />,
        'COMMISSION_EARNED': <DollarSign className="h-4 w-4" />,
        'COMMISSION_WITHDRAWAL': <ArrowDownCircle className="h-4 w-4" />,
        'ADDON_SERVICE': <FileText className="h-4 w-4" />,
        'JOB_REFUND': <RefreshCw className="h-4 w-4" />,
        'SUBSCRIPTION_REFUND': <RefreshCw className="h-4 w-4" />,
        'ADMIN_ADJUSTMENT': <DollarSign className="h-4 w-4" />,
    };
    return iconMap[type] || <FileText className="h-4 w-4" />;
}

function getTransactionTypeLabel(type: string): string {
    const labelMap: Record<string, string> = {
        'SUBSCRIPTION_PURCHASE': 'Subscription',
        'JOB_POSTING_DEDUCTION': 'Job Posting',
        'COMMISSION_EARNED': 'Commission',
        'COMMISSION_WITHDRAWAL': 'Withdrawal',
        'ADDON_SERVICE': 'Add-on Service',
        'JOB_REFUND': 'Refund',
        'SUBSCRIPTION_REFUND': 'Subscription Refund',
        'ADMIN_ADJUSTMENT': 'Admin Adjustment',
        'TRANSFER_IN': 'Transfer In',
        'TRANSFER_OUT': 'Transfer Out',
    };
    return labelMap[type] || type.replace(/_/g, ' ');
}

export function TransactionList({
    transactions,
    isLoading = false,
    showLoadMore = false,
    onLoadMore,
    onTransactionClick,
    emptyMessage = "No transactions yet",
    className,
}: TransactionListProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-5 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Transaction History</CardTitle>
                    <CardDescription>Recent wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <CardDescription>
                    Recent wallet activity • {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {transactions.map((transaction) => {
                        const isCredit = transaction.direction === 'CREDIT';
                        const statusColor = transaction.status === 'COMPLETED' ? 'text-green-600' : transaction.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600';

                        return (
                            <div
                                key={transaction.id}
                                onClick={() => onTransactionClick?.(transaction)}
                                className={cn(
                                    "flex items-center gap-3 p-3 border rounded-lg transition-colors",
                                    onTransactionClick && "cursor-pointer hover:bg-accent"
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex items-center justify-center h-10 w-10 rounded-full",
                                    isCredit ? "bg-green-100 dark:bg-green-950 text-green-600" : "bg-red-100 dark:bg-red-950 text-red-600"
                                )}>
                                    {isCredit ? (
                                        <ArrowUpCircle className="h-5 w-5" />
                                    ) : (
                                        <ArrowDownCircle className="h-5 w-5" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">
                                            {getTransactionTypeLabel(transaction.type)}
                                        </p>
                                        <Badge variant="outline" className="text-xs h-5">
                                            {transaction.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {transaction.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isCredit ? "text-green-600" : "text-red-600"
                                    )}>
                                        {isCredit ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        ${transaction.balance_after.toFixed(2)}
                                    </p>
                                </div>

                                {onTransactionClick && (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {showLoadMore && onLoadMore && (
                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={onLoadMore}
                    >
                        Load More
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
