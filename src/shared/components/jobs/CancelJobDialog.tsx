import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, XCircle } from "lucide-react";
import { Job } from "@/shared/types/job";

interface CancelJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onConfirm: (reason?: string) => Promise<void>;
  isProcessing?: boolean;
}

export function CancelJobDialog({
  open,
  onOpenChange,
  job: _job,
  onConfirm,
  isProcessing = false,
}: CancelJobDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== "cancel") {
      return;
    }
    await onConfirm(reason || undefined);
    setReason("");
    setConfirmText("");
  };

  const handleCancel = () => {
    setReason("");
    setConfirmText("");
    onOpenChange(false);
  };

  const isConfirmValid = confirmText.toLowerCase() === "cancel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Cancel Job Posting
          </DialogTitle>
          <DialogDescription>
            Canceling this job posting means the position will no longer be filled.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens when a job is cancelled:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Job posting will be permanently cancelled</li>
                <li>Removed from all job boards immediately</li>
                <li>No new applications can be received</li>
                <li>Existing candidates will be notified</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Required)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Position eliminated, budget constraints, role no longer needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Please provide a reason for cancelling this position.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <strong>"CANCEL"</strong> to confirm
            </Label>
            <input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CANCEL"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !isConfirmValid || !reason.trim()}
            variant="destructive"
          >
            {isProcessing ? "Cancelling..." : "Cancel Job Posting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

