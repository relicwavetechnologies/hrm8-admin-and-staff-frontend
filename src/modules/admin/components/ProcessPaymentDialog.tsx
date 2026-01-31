import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { adminWithdrawalService, AdminWithdrawalRequest } from "@/shared/lib/admin/withdrawalService";
import { Loader2 } from "lucide-react";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";

interface ProcessPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withdrawal: AdminWithdrawalRequest;
    onSuccess: () => void;
}

export function ProcessPaymentDialog({ open, onOpenChange, withdrawal, onSuccess }: ProcessPaymentDialogProps) {
    const { toast } = useToast();
    const { formatCurrency } = useCurrencyFormat();
    const [loading, setLoading] = useState(false);
    const [paymentReference, setPaymentReference] = useState("");
    const [adminNotes, setAdminNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentReference.trim()) {
            toast({ title: "Error", description: "Payment reference is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await adminWithdrawalService.processPayment(withdrawal.id, {
                paymentReference: paymentReference.trim(),
                adminNotes: adminNotes.trim() || undefined
            });

            toast({ title: "Success", description: "Payment processed successfully" });
            onSuccess();
            onOpenChange(false);
            setPaymentReference("");
            setAdminNotes("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || error.message || "Failed to process payment",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Process Payment</DialogTitle>
                    <DialogDescription>
                        Mark this withdrawal as paid and provide payment reference
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                        <div className="text-sm text-blue-900">
                            <div className="font-medium">{withdrawal.consultantName}</div>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(withdrawal.amount)}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentReference">Payment Reference / Transaction ID *</Label>
                        <Input
                            id="paymentReference"
                            placeholder="e.g., TXN-123456, Stripe: pi_xxx, Wire: REF-xxx"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the transaction ID from your payment system
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                        <Textarea
                            id="adminNotes"
                            placeholder="Any additional notes about this payment..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
