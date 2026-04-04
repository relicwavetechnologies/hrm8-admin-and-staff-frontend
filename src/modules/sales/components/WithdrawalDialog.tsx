import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { Loader2 } from "lucide-react";
import { WithdrawalBalance } from "@/shared/types/withdrawal";
import { salesService } from "@/shared/services/salesService";
import { useToast } from "@/shared/hooks/use-toast";

interface WithdrawalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balance: WithdrawalBalance;
    onSuccess: () => void;
}

export function WithdrawalDialog({ open, onOpenChange, balance, onSuccess }: WithdrawalDialogProps) {
    const { formatCurrency } = useCurrencyFormat();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);

    const currency = balance.currency || 'USD';

    const toggleCommissionSelection = (commissionId: string) => {
        setSelectedCommissions((current) =>
            current.includes(commissionId)
                ? current.filter((id) => id !== commissionId)
                : [...current, commissionId]
        );
    };

    const selectAllAvailable = () => {
        setSelectedCommissions(balance.availableCommissions.map((commission) => commission.id));
    };

    const selectedAmount = balance.availableCommissions
        .filter((commission) => selectedCommissions.includes(commission.id))
        .reduce((sum, commission) => sum + Number(commission.payoutAmount ?? commission.amount ?? 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (selectedCommissions.length === 0) {
                toast({ title: "Error", description: "Select at least one commission to withdraw", variant: "destructive" });
                return;
            }

            if (selectedAmount <= 0) {
                toast({ title: "Error", description: "Selected commissions do not have a valid payout amount", variant: "destructive" });
                return;
            }

            if (selectedAmount > balance.availableBalance) {
                toast({ title: "Error", description: "Amount exceeds available balance", variant: "destructive" });
                return;
            }

            await salesService.requestWithdrawal({
                amount: selectedAmount,
                paymentMethod: "BANK_TRANSFER",
                commissionIds: selectedCommissions,
                notes,
            });

            toast({ title: "Success", description: "Withdrawal request submitted" });
            setSelectedCommissions([]);
            setNotes("");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || error.message || "Failed to submit request", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                        Select the confirmed commissions you want to reserve for finance review and Airwallex payout.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Available Balance</Label>
                        <div className="text-2xl font-bold text-success-600">
                            {formatCurrency(balance.availableBalance, currency)}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Select Commissions</Label>
                            <Button type="button" variant="outline" size="sm" onClick={selectAllAvailable}>
                                Select All Available
                            </Button>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                            {balance.availableCommissions.length === 0 ? (
                                <p className="text-center py-4 text-sm text-muted-foreground">
                                    No commissions available for withdrawal
                                </p>
                            ) : (
                                balance.availableCommissions.map((commission) => (
                                    <div
                                        key={commission.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                                        onClick={() => toggleCommissionSelection(commission.id)}
                                    >
                                        <Checkbox
                                            checked={selectedCommissions.includes(commission.id)}
                                            onCheckedChange={() => toggleCommissionSelection(commission.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{commission.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">Sales</Badge>
                                                <span>{new Date(commission.createdAt || commission.date || new Date().toISOString()).toLocaleDateString()}</span>
                                            </div>
                                            {commission.fxRate ? (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {`${formatCurrency(commission.amount ?? 0, commission.currency || currency)} -> ${formatCurrency(commission.payoutAmount ?? commission.amount ?? 0, commission.payoutCurrency || currency)} at ${Number(commission.fxRate).toFixed(4)}`}
                                                    {commission.fxRateLockedAt ? ` on ${new Date(commission.fxRateLockedAt).toLocaleDateString()}` : ''}
                                                </p>
                                            ) : commission.currency ? (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Source {formatCurrency(commission.amount ?? 0, commission.currency)}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="font-bold text-green-600">
                                            {formatCurrency(commission.payoutAmount ?? commission.amount ?? 0, commission.payoutCurrency || currency)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Selected payout total: {formatCurrency(selectedAmount, currency)}
                        </p>
                    </div>

                    <div className="rounded-md border px-3 py-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Payout rail</span>
                            <span className="font-medium">Airwallex bank payout</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Each commission already carries a locked payout amount and currency. This request only reserves the selected earnings for approval and payout.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional information..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || selectedCommissions.length === 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Request Withdrawal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
