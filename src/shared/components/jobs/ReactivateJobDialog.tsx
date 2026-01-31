import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Job } from "@/shared/types/job";

interface ReactivateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onConfirm: () => Promise<void>;
  isProcessing?: boolean;
}

export function ReactivateJobDialog({
  open,
  onOpenChange,
  job,
  onConfirm,
  isProcessing = false,
}: ReactivateJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Reactivate Job Posting
          </DialogTitle>
          <DialogDescription>
            Reactivating this job will restore it to active status and repost it on all selected job boards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens when you reactivate:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Job status will change back to "Open"</li>
                <li>Job will reappear on HRM8 Job Board and Careers Page</li>
                <li>Job will be reposted to all previously selected external job boards</li>
                <li>New applications can be received</li>
                <li>Existing candidates remain in the pipeline</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{job.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {job.department} • {job.location}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "Reactivating..." : "Reactivate Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

