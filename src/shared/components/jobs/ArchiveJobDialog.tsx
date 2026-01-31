import { WarningConfirmationDialog } from "@/shared/components/ui/warning-confirmation-dialog";
import { Job } from "@/shared/types/job";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ArchiveJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onConfirm: () => Promise<void>;
  isProcessing?: boolean;
  isArchive: boolean; // true = archive, false = unarchive
}

export function ArchiveJobDialog({
  open,
  onOpenChange,
  job,
  onConfirm,
  isProcessing = false,
  isArchive,
}: ArchiveJobDialogProps) {
  const archiveWarningPoints = [
    "Job will be hidden from active job listings",
    "Job will not appear in default job searches",
    "Job details and all associated data will be preserved",
    "You can view archived jobs by filtering",
    "Job can be unarchived at any time",
    "Job status will remain unchanged (e.g., Closed, Filled)",
  ];

  const unarchiveWarningPoints = [
    "Job will be visible in active job listings again",
    "Job will appear in default job searches",
    "All job details and data remain unchanged",
    "Job status remains as-is (job will not automatically reopen)",
  ];

  const alertContent = (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>
          {isArchive ? "What happens when you archive:" : "What happens when you unarchive:"}
        </strong>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          {(isArchive ? archiveWarningPoints : unarchiveWarningPoints).map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );

  const items = [
    {
      label: job.title,
      value: `${job.department} • ${job.location} • Status: ${job.status}`,
    },
  ];

  return (
    <WarningConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      type={isArchive ? "archive" : "unarchive"}
      severity={isArchive ? "warning" : "info"}
      title={isArchive ? "Archive Job" : "Unarchive Job"}
      description={
        isArchive
          ? "Archive this job to hide it from active job listings. It will remain accessible in archived jobs."
          : "Restore this job to make it visible in active job listings again."
      }
      confirmLabel={isArchive ? "Archive Job" : "Unarchive Job"}
      isProcessing={isProcessing}
      alertContent={alertContent}
      items={items}
    />
  );
}

