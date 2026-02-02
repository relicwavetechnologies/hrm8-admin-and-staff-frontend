/**
 * Wallet Recharge Dialog
 * Dialog for companies to add funds directly to their wallet
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
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Wallet, AlertCircle, CreditCard } from "lucide-react";
import { walletService } from "@/shared/services/walletService";
import { useToast } from "@/shared/hooks/use-toast";
import { useStripeIntegration } from "@/shared/hooks/useStripeIntegration";

interface WalletRechargeDialogProps {
    open: boolean;
    onClose: () => void;
    currentBalance?: number;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export function WalletRechargeDialog({
    open,
    onClose,
    currentBalance = 0,
}: WalletRechargeDialogProps) {
    const [amount, setAmount] = useState("");
    const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { showPrompt, checkStripeRequired } = useStripeIntegration();

    const rechargeMutation = useMutation({
        mutationFn: async (rechargeAmount: number) => {
            return walletService.rechargeWallet({
                amount: rechargeAmount,
                paymentMethod: 'stripe',
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });

            toast({
                title: "Recharge Successful",
                description: data.message || `Your wallet has been credited with $${parseFloat(amount).toFixed(2)}`,
            });

            handleClose();
        },
        onError: (error: any) => {
            // Check if error is due to Stripe not connected (402)
            if (error.response?.status === 402 || error.errorCode === 'STRIPE_NOT_CONNECTED') {
                // StripePromptDialog will be shown automatically
                return;
            }

            toast({
                title: "Recharge Failed",
                description: error.message || "Failed to recharge wallet.",
                variant: "destructive",
            });
        },
    });

    const handleClose = () => {
        setAmount("");
        setSelectedPreset(null);
        onClose();
    };

    const handlePresetClick = (preset: number) => {
        setSelectedPreset(preset);
        setAmount(preset.toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid recharge amount.",
                variant: "destructive",
            });
            return;
        }

        if (numericAmount < 10) {
            toast({
                title: "Minimum Amount Required",
                description: "Minimum recharge amount is $10.",
                variant: "destructive",
            });
            return;
        }

        rechargeMutation.mutate(numericAmount);
    };

    const numericAmount = parseFloat(amount) || 0;
    const newBalance = currentBalance + numericAmount;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Add Funds to Wallet
                    </DialogTitle>
                    <DialogDescription>
                        Recharge your wallet to continue using our services
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Balance */}
                    <Alert>
                        <Wallet className="h-4 w-4" />
                        <AlertDescription>
                            Current Balance: <span className="font-semibold">${currentBalance.toFixed(2)}</span>
                        </AlertDescription>
                    </Alert>

                    {/* Preset Amounts */}
                    <div className="space-y-2">
                        <Label>Quick Select Amount (USD)</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESET_AMOUNTS.map((preset) => (
                                <Button
                                    key={preset}
                                    type="button"
                                    variant={selectedPreset === preset ? "default" : "outline"}
                                    onClick={() => handlePresetClick(preset)}
                                    className="w-full"
                                >
                                    ${preset}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Or Enter Custom Amount (USD)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="10"
                            placeholder="Enter amount (min. $10)"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setSelectedPreset(null);
                            }}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum recharge: $10
                        </p>
                    </div>

                    {/* New Balance Preview */}
                    {numericAmount > 0 && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                New Balance: <span className="font-semibold">${newBalance.toFixed(2)}</span>
                                {' '}(+${numericAmount.toFixed(2)})
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Payment Method Info */}
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription>
                            Payment will be processed securely via Stripe
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={rechargeMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!numericAmount || numericAmount < 10 || rechargeMutation.isPending}
                        >
                            {rechargeMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Add ${numericAmount.toFixed(2)}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
