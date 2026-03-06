import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
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
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
    const [notes, setNotes] = useState<string>("");
    const [paymentDetails, setPaymentDetails] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        email: "" // For PayPal
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const amountValue = parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
                return;
            }

            if (amountValue > balance.availableBalance) {
                toast({ title: "Error", description: "Amount exceeds available balance", variant: "destructive" });
                return;
            }

            // Collect available commission IDs to cover the amount
            // In a real scenario, you might let user select specific commissions
            // Here we auto-select commissions until amount is covered (or all available)
            // Actually backend validation checks totalSelected vs amount.
            // So we must select commissions that sum up to amount?
            // Or we just send ALL available IDs and let backend partial withdraw?
            // The implementation plan said: "Verify total amount matches selected commissions"
            // This implies we must select entire commissions.
            // To simplify, let's allow partial withdrawal against the pool, but the backend requires matching IDs.
            // Let's modify the frontend to just send all available commission IDs and let backend handle logic?
            // No, backend said "Amount does not match selected commissions".
            // This means we can ONLY withdraw exact sum of commissions.
            // That's restrictive.

            // ALTERNATIVE: Backend Logic Check
            // Backend: const totalSelected = selectedCommissions.reduce((sum, c) => sum + c.amount, 0);
            // IF Math.abs(totalSelected - data.amount) > 0.01 return error

            // So yes, we can only withdraw EXACT commission amounts.
            // This is a bit user-unfriendly.
            // USUALLY, systems allow withdrawing from a "Balance" without tying to specific commission lines 1:1 for the user.
            // But preserving traceablity is good.

            // Let's auto-select commissions that sum up EQUAL or LESS than requested?
            // Or better: Let's assume the user wants to withdraw EVERYTHING available typically.
            // Or we change backend to support partial.

            // For now, let's just select ALL available commissions and set amount to total.
            // If user inputs custom amount, it's hard to match.
            // Let's force amount to be "Full Balance" or "Specific Commissions"?

            // Let's assume for this MVP, the user withdraws the TOTAL available balance.
            // Or we filter commissions.

            // Let's auto-select commissions to match the amount if possible.
            // If not possible to match exactly, we warn user?

            // To make it robust: I will select ALL available commissions and set amount = availableBalance
            // And maybe disable custom amount for now?
            // Or validation: "You can currently only withdraw the full available balance of {formatCurrency(balance.availableBalance)}"

            // Let's restrict amount input to be read-only total balance for simplicity and data integrity.
            // Or allow selecting specific commissions in a table (Advanced).

            // MVP Approach: Withdraw Full Available Balance.

            if (Math.abs(amountValue - balance.availableBalance) > 0.01) {
                // If they try to withdraw less, we can't easily map to specific commissions without a picker.
                // Let's warn them.
                toast({
                    title: "Note",
                    description: "Currently only full balance withdrawal is supported to ensure accurate tracking.",
                    variant: "default"
                });
                setAmount(balance.availableBalance.toString());
                // Proceed? No return to let them see.
                setLoading(false);
                return;
            }

            const commissionIds = balance.availableCommissions.map(c => c.id);

            await salesService.requestWithdrawal({
                amount: amountValue,
                paymentMethod,
                commissionIds,
                paymentDetails,
                notes
            });

            toast({ title: "Success", description: "Withdrawal request submitted" });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || "Failed to submit request", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                        Withdraw your available commission balance.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Available Balance</Label>
                        <div className="text-2xl font-bold text-success-600">
                            {formatCurrency(balance.availableBalance)}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Withdrawal Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            max={balance.availableBalance}
                        // For MVP, maybe suggest full balance?
                        />
                        <p className="text-xs text-muted-foreground">
                            For accurate tracking, please withdraw the full available balance.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                <SelectItem value="PAYPAL">PayPal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {paymentMethod === 'BANK_TRANSFER' && (
                        <div className="space-y-3 border p-3 rounded-md bg-slate-50">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Bank Name</Label>
                                    <Input
                                        placeholder="Bank Name"
                                        className="h-8 text-sm"
                                        value={paymentDetails.bankName}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Account Name</Label>
                                    <Input
                                        placeholder="Account Name"
                                        className="h-8 text-sm"
                                        value={paymentDetails.accountName}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Account Number</Label>
                                    <Input
                                        placeholder="************"
                                        className="h-8 text-sm"
                                        value={paymentDetails.accountNumber}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Routing / Swift</Label>
                                    <Input
                                        placeholder="Routing Number"
                                        className="h-8 text-sm"
                                        value={paymentDetails.routingNumber}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, routingNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'PAYPAL' && (
                        <div className="space-y-2 border p-3 rounded-md bg-slate-50">
                            <Label className="text-xs">PayPal Email</Label>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={paymentDetails.email}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                                required
                            />
                        </div>
                    )}

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
                        <Button type="submit" disabled={loading || balance.availableBalance <= 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Request Withdrawal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
