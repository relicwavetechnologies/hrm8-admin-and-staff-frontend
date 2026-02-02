import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { settlementService, Settlement } from "@/shared/services/hrm8/settlementService";
import { useCurrencyFormat } from "@/contexts/CurrencyFormatContext";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

interface MarkSettlementPaidDialogProps {
  settlement: Settlement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkSettlementPaidDialog({
  settlement,
  open,
  onOpenChange,
  onSuccess,
}: MarkSettlementPaidDialogProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!settlement) {
      setError("No settlement selected.");
      return;
    }

    if (!paymentDate) {
      setError("Please select a payment date.");
      return;
    }

    if (!reference.trim()) {
      setError("Please enter a payment reference.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await settlementService.markAsPaid(settlement.id, {
        paymentDate,
        reference,
      });

      if (!response.success) {
        setError(response.error || "Failed to mark settlement as paid.");
        toast({
          title: "Payment failed",
          description: response.error || "Failed to mark settlement as paid.",
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Payment processed",
        description: "Settlement marked as paid successfully.",
      });

      setTimeout(() => {
        setSuccess(false);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setReference("");
        onSuccess?.();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Unexpected error during payment processing.");
      toast({
        title: "Payment error",
        description: err?.message || "Unexpected error during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settlement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mark Settlement as Paid</DialogTitle>
            <DialogDescription>
              Enter payment details to mark this settlement as paid
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Payment error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-200">
                  Payment successful
                </AlertTitle>
                <AlertDescription className="text-emerald-700/90 dark:text-emerald-200/90">
                  Settlement has been marked as paid.
                </AlertDescription>
              </Alert>
            )}

            {/* Settlement Details */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold">Settlement Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licensee:</span>
                  <span className="font-medium">{settlement.licensee?.name || settlement.licenseeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {new Date(settlement.periodStart).toLocaleDateString()} -{' '}
                    {new Date(settlement.periodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(settlement.totalRevenue)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground font-semibold">Licensee Share:</span>
                  <span className="font-bold text-primary">{formatCurrency(settlement.licenseeShare)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h4 className="font-semibold">Payment Details</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="payment-date">Payment Date *</Label>
                    <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="payment-reference">Payment Reference *</Label>
                    <Input
                    id="payment-reference"
                    placeholder="e.g., TXN-2025-001, Wire-12345"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || success}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Processing..." : "Mark as Paid"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
