import { WarningConfirmationDialog } from "@/shared/components/ui/warning-confirmation-dialog";
import { Job } from "@/shared/types/job";

interface DeleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onConfirm: () => Promise<void>;
  isProcessing?: boolean;
}

export function DeleteJobDialog({
  open,
  onOpenChange,
  job,
  onConfirm,
  isProcessing = false,
}: DeleteJobDialogProps) {
  const warningPoints = [
    "Job posting will be permanently deleted",
    "All applications associated with this job will be deleted",
    "All candidate data linked to this job will be removed",
    "Interview schedules and assessments will be deleted",
    "This action cannot be undone",
  ];

  const items = [
    {
      label: job.title,
      value: `${job.department} • ${job.location} • Status: ${job.status}`,
    },
  ];

  const detailsContent = job.applicantsCount > 0 ? (
    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
      <p className="text-sm text-destructive font-medium">
        ⚠️ This job has {job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''} - deleting will remove all application data
      </p>
    </div>
  ) : undefined;

  return (
    <WarningConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      type="delete"
      severity="destructive"
      title="Delete Job Posting"
      description="This action cannot be undone. This will permanently delete the job posting and all associated data."
      confirmLabel="Delete Job Permanently"
      isProcessing={isProcessing}
      requireTextConfirmation="DELETE"
      requireCheckboxConfirmation="I understand that this action is permanent and cannot be undone. I confirm that I want to delete this job posting and all associated data."
      requireBothConfirmations={true}
      warningPoints={warningPoints}
      items={items}
      detailsContent={detailsContent}
    />
  );
}

