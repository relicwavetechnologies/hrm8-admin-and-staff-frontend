import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { WithdrawalBalance } from "@/shared/types/withdrawal";
import { Wallet, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface BalanceCardProps {
    balance: WithdrawalBalance;
    onRequestWithdrawal: () => void;
    isLoading?: boolean;
}

export function BalanceCard({ balance, onRequestWithdrawal, isLoading }: BalanceCardProps) {
    const { formatCurrency } = useCurrencyFormat();

    return (

        <>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(balance.availableBalance)}</div>
                    <p className="text-xs text-muted-foreground pb-4 pt-1">
                        Ready to withdraw
                    </p>
                    <Button
                        className="w-full"
                        size="sm"
                        onClick={onRequestWithdrawal}
                        disabled={balance.availableBalance <= 0 || isLoading}
                    >
                        Request Withdrawal
                    </Button>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(balance.pendingBalance)}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Awaiting confirmation
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(balance.totalEarned)}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Lifetime commissions
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(balance.totalWithdrawn)}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Successfully paid
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
