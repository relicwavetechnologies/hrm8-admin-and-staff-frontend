import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { adminWithdrawalService, AdminWithdrawalRequest } from "@/shared/lib/admin/withdrawalService";
import { Loader2 } from "lucide-react";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";

interface RejectWithdrawalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withdrawal: AdminWithdrawalRequest;
    onSuccess: () => void;
}

export function RejectWithdrawalDialog({ open, onOpenChange, withdrawal, onSuccess }: RejectWithdrawalDialogProps) {
    const { toast } = useToast();
    const { formatCurrency } = useCurrencyFormat();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast({ title: "Error", description: "Rejection reason is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await adminWithdrawalService.rejectWithdrawal(withdrawal.id, {
                reason: reason.trim()
            });

            toast({ title: "Success", description: "Withdrawal rejected" });
            onSuccess();
            onOpenChange(false);
            setReason("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || error.message || "Failed to reject withdrawal",
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
                    <DialogTitle>Reject Withdrawal Request</DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting this withdrawal request
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                        <div className="text-sm text-red-900">
                            <div className="font-medium">{withdrawal.consultantName}</div>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(withdrawal.amount)}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Rejection Reason *</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Invalid bank details, Insufficient documentation, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            This reason will be visible to the sales agent
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-900">
                        <strong>Note:</strong> Rejecting this withdrawal will return the commissions to the agent's available balance.
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} variant="destructive">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject Withdrawal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
