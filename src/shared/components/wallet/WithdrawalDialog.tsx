/**
 * Withdrawal Request Dialog
 * Dialog for consultants to request commission withdrawals
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { walletService } from "@/shared/services/walletService";
import { useToast } from "@/shared/hooks/use-toast";

interface WithdrawalDialogProps {
    open: boolean;
    onClose: () => void;
    availableBalance: number;
    minWithdrawal?: number;
}

export function WithdrawalDialog({
    open,
    onClose,
    availableBalance,
    minWithdrawal = 50,
}: WithdrawalDialogProps) {
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [notes, setNotes] = useState("");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const withdrawalMutation = useMutation({
        mutationFn: async () => {
            const numericAmount = parseFloat(amount);

            const paymentDetails: Record<string, any> = {};
            if (paymentMethod === 'bank_transfer') {
                paymentDetails.bankName = bankName;
                paymentDetails.accountNumber = accountNumber;
                paymentDetails.accountName = accountName;
                paymentDetails.ifscCode = ifscCode;
            } else if (paymentMethod === 'paypal') {
                paymentDetails.email = paypalEmail;
            }

            return walletService.requestWithdrawal({
                amount: numericAmount,
                paymentMethod,
                paymentDetails,
                notes,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultant', 'wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['consultant', 'earnings'] });
            queryClient.invalidateQueries({ queryKey: ['consultant', 'wallet', 'transactions'] });

            toast({
                title: "Withdrawal Requested",
                description: "Your withdrawal request has been submitted for admin approval.",
            });

            handleClose();
        },
        onError: (error: Error) => {
            toast({
                title: "Request Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleClose = () => {
        setAmount("");
        setPaymentMethod("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
        setIfscCode("");
        setPaypalEmail("");
        setNotes("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid withdrawal amount.",
                variant: "destructive",
            });
            return;
        }

        if (numericAmount < minWithdrawal) {
            toast({
                title: "Amount Too Low",
                description: `Minimum withdrawal amount is $${minWithdrawal}.`,
                variant: "destructive",
            });
            return;
        }

        if (numericAmount > availableBalance) {
            toast({
                title: "Insufficient Balance",
                description: `You can withdraw up to $${availableBalance.toFixed(2)}.`,
                variant: "destructive",
            });
            return;
        }

        if (!paymentMethod) {
            toast({
                title: "Payment Method Required",
                description: "Please select a payment method.",
                variant: "destructive",
            });
            return;
        }

        withdrawalMutation.mutate();
    };

    const numericAmount = parseFloat(amount) || 0;
    const canWithdraw = numericAmount >= minWithdrawal && numericAmount <= availableBalance;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                        Withdraw your earnings from your virtual wallet
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Available Balance */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Available Balance: <span className="font-semibold">${availableBalance.toFixed(2)}</span>
                        </AlertDescription>
                    </Alert>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min={minWithdrawal}
                            max={availableBalance}
                            placeholder={`Min. $${minWithdrawal}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum withdrawal: ${minWithdrawal}
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="wise">Wise (TransferWise)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bank Transfer Details */}
                    {paymentMethod === 'bank_transfer' && (
                        <div className="space-y-3 p-3 border rounded-lg bg-accent/50">
                            <p className="text-sm font-medium">Bank Account Details</p>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Bank Name"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder="Account Holder Name"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder="Account Number"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder="IFSC Code / Routing Number"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* PayPal Details */}
                    {paymentMethod === 'paypal' && (
                        <div className="space-y-2">
                            <Label htmlFor="paypalEmail">PayPal Email</Label>
                            <Input
                                id="paypalEmail"
                                type="email"
                                placeholder="your@email.com"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional information..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Success/Error Feedback */}
                    {!canWithdraw && numericAmount > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {numericAmount > availableBalance
                                    ? `Amount exceeds available balance ($${availableBalance.toFixed(2)})`
                                    : `Minimum withdrawal amount is $${minWithdrawal}`}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={withdrawalMutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canWithdraw || withdrawalMutation.isPending}>
                            {withdrawalMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Request Withdrawal
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
