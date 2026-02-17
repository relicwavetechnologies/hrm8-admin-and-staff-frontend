import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { commissionService } from "@/shared/services/hrm8/commissionService";
import { toast } from "sonner";

interface ResolveDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commissionId: string | null;
  onSuccess: () => void;
}

export function ResolveDisputeDialog({
  open,
  onOpenChange,
  commissionId,
  onSuccess,
}: ResolveDisputeDialogProps) {
  const [resolution, setResolution] = useState<'VALID' | 'INVALID'>('VALID');
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionId) return;

    setIsSubmitting(true);
    try {
      const response = await commissionService.resolveDispute(commissionId, resolution, notes);
      if (response.success) {
        toast.success(`Dispute resolved as ${resolution}.`);
        onSuccess();
        onOpenChange(false);
        setNotes("");
        setResolution('VALID');
      } else {
        toast.error(response.error || "Failed to resolve dispute.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Decide the outcome of this dispute. Valid commissions are restored; invalid ones are reversed (clawback).
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <RadioGroup 
              value={resolution} 
              onValueChange={(v) => setResolution(v as 'VALID' | 'INVALID')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="VALID" id="valid" className="peer sr-only" />
                <Label
                  htmlFor="valid"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CheckCircle2 className="mb-3 h-6 w-6 text-green-500" />
                  <div className="text-center font-semibold text-green-700">Valid Commission</div>
                  <div className="text-xs text-muted-foreground text-center">Dismiss dispute, restore to confirmed</div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="INVALID" id="invalid" className="peer sr-only" />
                <Label
                  htmlFor="invalid"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive"
                >
                  <XCircle className="mb-3 h-6 w-6 text-red-500" />
                  <div className="text-center font-semibold text-red-700">Invalid Commission</div>
                  <div className="text-xs text-muted-foreground text-center">Accept dispute, reverse/clawback funds</div>
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add details about the resolution decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              disabled={isSubmitting}
              className={resolution === 'INVALID' ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Resolving..." : "Confirm Resolution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
