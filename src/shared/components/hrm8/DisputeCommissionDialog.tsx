import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { commissionService } from "@/shared/services/hrm8/commissionService";
import { toast } from "sonner";

interface DisputeCommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commissionId: string | null;
  onSuccess: () => void;
}

export function DisputeCommissionDialog({
  open,
  onOpenChange,
  commissionId,
  onSuccess,
}: DisputeCommissionDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionId) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for the dispute.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await commissionService.dispute(commissionId, reason);
      if (response.success) {
        toast.success("Commission disputed successfully.");
        onSuccess();
        onOpenChange(false);
        setReason("");
      } else {
        toast.error(response.error || "Failed to dispute commission.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Dispute Commission
            </DialogTitle>
            <DialogDescription>
              Flag this commission as disputed. This will prevent payout until resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Dispute</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this commission is being disputed..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
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
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Dispute Commission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
