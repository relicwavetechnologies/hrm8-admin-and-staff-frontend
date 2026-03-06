import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Wallet, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InsufficientBalanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requiredAmount: number;
    currentBalance: number;
    shortfall: number;
    currency?: string;
}

export function InsufficientBalanceModal({
    open,
    onOpenChange,
    requiredAmount,
    currentBalance,
    shortfall,
    currency = "USD"
}: InsufficientBalanceModalProps) {
    const navigate = useNavigate();

    const handleTopUp = () => {
        onOpenChange(false);
        navigate("/subscriptions"); // Redirect to wallet/subscription page
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto bg-red-100 p-3 rounded-full mb-2">
                        <Wallet className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Insufficient Wallet Balance</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        You don't have enough funds in your company wallet to post this job.
                        All job payments must be made through your virtual wallet.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Required</span>
                            <div className="text-lg font-bold text-slate-900">{formatMoney(requiredAmount)}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Available</span>
                            <div className="text-lg font-bold text-slate-900">{formatMoney(currentBalance)}</div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-medium text-red-900">Shortfall</span>
                        <span className="font-bold text-red-700 text-lg">{formatMoney(shortfall)}</span>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:justify-center gap-2">
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 gap-2"
                        onClick={handleTopUp}
                    >
                        <CreditCard className="h-4 w-4" />
                        Top Up Wallet
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full text-muted-foreground"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
