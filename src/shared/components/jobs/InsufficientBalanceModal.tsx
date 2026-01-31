import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AlertCircle, Wallet } from "lucide-react";

interface InsufficientBalanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    required: number;
    balance: number;
    shortfall: number;
    currency: string;
}

export function InsufficientBalanceModal({
    open,
    onOpenChange,
    required,
    balance,
    shortfall,
    currency = 'USD'
}: InsufficientBalanceModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Insufficient Balance
                    </DialogTitle>
                    <DialogDescription>
                        You don't have enough funds in your wallet to publish this job.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="h-4 w-4" />
                            <span>Current Balance</span>
                        </div>
                        <span className="font-semibold">{balance} {currency}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-muted-foreground">Required Amount</span>
                        <span className="font-semibold">{required} {currency}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-destructive/10 border-destructive/20 border rounded-lg text-destructive">
                        <span className="font-medium">Shortfall</span>
                        <span className="font-bold">{shortfall} {currency}</span>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button className="flex-1">
                        Top Up Wallet
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
