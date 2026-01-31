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
import { AlertCircle, Pause } from "lucide-react";
import { Job } from "@/shared/types/job";

interface OnHoldJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onConfirm: (reason?: string) => Promise<void>;
  isProcessing?: boolean;
}

export function OnHoldJobDialog({
  open,
  onOpenChange,
  job: _job,
  onConfirm,
  isProcessing = false,
}: OnHoldJobDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirm(reason || undefined);
    setReason(""); // Reset on success
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5" />
            Place Job on Hold
          </DialogTitle>
          <DialogDescription>
            Placing this job on hold will remove it from all job boards and prevent new applications.
            You can reactivate it at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens when a job is on hold:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Job remains active in the system</li>
                <li>Removed from HRM8 Job Board and Careers Page</li>
                <li>Removed from all external job board postings</li>
                <li>No new applications can be received</li>
                <li>Existing candidates remain in the pipeline</li>
                <li>Can be reactivated at any time</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Budget review, organizational changes, waiting for approval..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Add a note about why this job is being placed on hold for your records.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            variant="default"
          >
            {isProcessing ? "Processing..." : "Place on Hold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

