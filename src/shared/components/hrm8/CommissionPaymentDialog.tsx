import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { commissionService, Commission } from "@/shared/lib/hrm8/commissionService";
import { cn } from "@/shared/lib/utils";
import { format, parseISO, isValid } from "date-fns";

// Safe date formatting helper
const safeFormatDate = (dateStr: string | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr);
  } catch {
    return '-';
  }
};

interface CommissionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commissions: Commission[];
  onSuccess?: () => void;
}

export function CommissionPaymentDialog({
  open,
  onOpenChange,
  commissions,
  onSuccess,
}: CommissionPaymentDialogProps) {
  const { toast } = useToast();
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [paymentReference, setPaymentReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleCommission = useCallback((id: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCommissions(commissions.map((c) => c.id));
  }, [commissions]);

  const deselectAll = useCallback(() => {
    setSelectedCommissions([]);
  }, []);

  const selectedTotal = useMemo(() => 
    commissions
      .filter((c) => selectedCommissions.includes(c.id))
      .reduce((sum, c) => sum + (c.amount || 0), 0),
    [commissions, selectedCommissions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedCommissions.length === 0) {
      setError("Please select at least one commission to process.");
      return;
    }

    if (!paymentReference.trim()) {
      setError("Please enter a payment reference.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Process payments for selected commissions
      const paymentPromises = selectedCommissions.map((commissionId) =>
        commissionService.markAsPaid(commissionId, paymentReference)
      );

      const results = await Promise.all(paymentPromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        setError(`Failed to process ${failed.length} payment(s).`);
        toast({
          title: "Payment partially failed",
          description: `Some payments could not be processed.`,
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Payments processed",
        description: `Processed ${selectedCommissions.length} commission payment(s).`,
      });

      setTimeout(() => {
        setSuccess(false);
        setPaymentReference("");
        setSelectedCommissions([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Process Commission Payments</DialogTitle>
            <DialogDescription>
              Select commissions to pay and enter payment details
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
                  Commission payments have been processed successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Commission Selection */}
            {commissions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No pending or confirmed commissions available for payment.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Select Commissions</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={deselectAll}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-3">
                    {commissions.map((commission) => {
                      const isSelected = selectedCommissions.includes(commission.id);
                      return (
                        <div
                          key={commission.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            isSelected
                              ? "bg-primary/5 border-primary"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => toggleCommission(commission.id)}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {commission.description || `Commission #${commission.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Consultant: {commission.consultantId?.slice(0, 8) || 'N/A'}... •{" "}
                              {safeFormatDate(commission.createdAt)} • {commission.status}
                            </p>
                          </div>
                          <span className="font-semibold text-sm whitespace-nowrap">
                            ${commission.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCommissions.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-semibold">Total Selected:</span>
                      <span className="text-xl font-bold text-primary">
                        ${selectedTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold">Payment Details</h4>

                  <div className="space-y-2">
                    <Label htmlFor="payment-reference">Payment Reference *</Label>
                    <Input
                      id="payment-reference"
                      placeholder="e.g., PMT-2025-001"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      required
                      disabled={isSubmitting || success}
                    />
                  </div>

                </div>
              </>
            )}
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
              disabled={isSubmitting || success || selectedCommissions.length === 0 || commissions.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Processing..." : "Process Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
