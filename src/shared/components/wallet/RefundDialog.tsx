/**
 * Refund Request Dialog
 * Dialog for companies to request refunds
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

interface RefundDialogProps {
    open: boolean;
    onClose: () => void;
}

export function RefundDialog({ open, onClose }: RefundDialogProps) {
    const [transactionId, setTransactionId] = useState("");
    const [transactionType, setTransactionType] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const refundMutation = useMutation({
        mutationFn: async () => {
            return walletService.requestRefund({
                transactionId,
                transactionType: transactionType as 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL' | 'ADDON_SERVICE',
                amount: parseFloat(amount),
                reason,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });

            toast({
                title: "Refund Requested",
                description: "Your refund request has been submitted for admin review.",
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
        setTransactionId("");
        setTransactionType("");
        setAmount("");
        setReason("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid refund amount.",
                variant: "destructive",
            });
            return;
        }

        if (!transactionType || !transactionId || !reason.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        refundMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>
                        Submit a refund request for admin review
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Refund requests are subject to admin approval and our refund policy.
                        </AlertDescription>
                    </Alert>

                    {/* Transaction Type */}
                    <div className="space-y-2">
                        <Label htmlFor="transactionType">Transaction Type</Label>
                        <Select value={transactionType} onValueChange={setTransactionType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="JOB_PAYMENT">Job Posting Payment</SelectItem>
                                <SelectItem value="SUBSCRIPTION_BILL">Subscription Bill</SelectItem>
                                <SelectItem value="ADDON_SERVICE">Add-on Service</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Transaction ID */}
                    <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input
                            id="transactionId"
                            placeholder="Enter transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Find this in your transaction history
                        </p>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Refund Amount (USD)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Refund *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please explain why you're requesting this refund..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Provide detailed information to help us process your request
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={refundMutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={refundMutation.isPending}>
                            {refundMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
