import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { WarningConfirmationDialog } from "@/shared/components/ui/warning-confirmation-dialog";
import { Job } from "@/shared/types/job";
import {
  MoreVertical,
  Edit,
  CheckCircle,
  Calendar,
  X,
  ArrowUpCircle,
  Pause,
  XCircle,
  Play
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";

import { ExtendJobDurationDialog } from "./ExtendJobDurationDialog";
import { UpgradeServiceDialog } from "./UpgradeServiceDialog";
import { OnHoldJobDialog } from "./OnHoldJobDialog";
import { CancelJobDialog } from "./CancelJobDialog";
import { ReactivateJobDialog } from "./ReactivateJobDialog";

interface JobLifecycleActionsProps {
  job: Job;
  onJobUpdate: () => void;
  onEdit: () => void;
}

export function JobLifecycleActions({ job, onJobUpdate, onEdit }: JobLifecycleActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [markFilledDialogOpen, setMarkFilledDialogOpen] = useState(false);
  const [closeJobDialogOpen, setCloseJobDialogOpen] = useState(false);
  const [onHoldDialogOpen, setOnHoldDialogOpen] = useState(false);
  const [cancelJobDialogOpen, setCancelJobDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [upgradeServiceDialogOpen, setUpgradeServiceDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkAsFilled = async () => {
    setIsProcessing(true);
    try {
      const response = await jobService.updateJob(job.id, {
        status: 'FILLED' as any,
        closeDate: new Date().toISOString(),
      });
      if (response.success) {
        toast({
          title: "Job marked as filled",
          description: "The job posting has been marked as filled.",
        });
        onJobUpdate();
        setMarkFilledDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to mark job as filled",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark job as filled",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseJob = async () => {
    setIsProcessing(true);
    try {
      const response = await jobService.updateJob(job.id, {
        status: 'CLOSED' as any,
        closeDate: new Date().toISOString(),
      });
      if (response.success) {
        toast({
          title: "Job closed",
          description: "The job posting has been closed.",
        });
        onJobUpdate();
        setCloseJobDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to close job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close job",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnHold = async (_reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await jobService.updateJob(job.id, {
        status: 'ON_HOLD' as any,
        // When on hold, remove from job boards by clearing distribution
        // Note: This is a simplified approach - in production, you'd want to track
        // the original distribution to restore on reactivation
        jobBoardDistribution: [],
      });
      if (response.success) {
        toast({
          title: "Job placed on hold",
          description: "The job has been removed from all job boards and applications are paused.",
        });
        onJobUpdate();
        setOnHoldDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to place job on hold",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place job on hold",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelJob = async (_reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await jobService.updateJob(job.id, {
        status: 'CANCELLED' as any,
        closeDate: new Date().toISOString(),
        // Remove from all job boards when cancelled
        jobBoardDistribution: [],
      });
      if (response.success) {
        toast({
          title: "Job cancelled",
          description: "The job posting has been permanently cancelled.",
        });
        onJobUpdate();
        setCancelJobDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to cancel job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    try {
      // Restore to OPEN status and restore job board distribution
      // Note: In production, you'd restore the original jobBoardDistribution
      // For now, we'll restore to default distribution
      const response = await jobService.updateJob(job.id, {
        status: 'OPEN' as any,
        jobBoardDistribution: job.jobBoardDistribution.length > 0
          ? job.jobBoardDistribution
          : ['HRM8 Job Board'],
      });
      if (response.success) {
        toast({
          title: "Job reactivated",
          description: "The job has been reactivated and reposted to job boards.",
        });
        onJobUpdate();
        setReactivateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to reactivate job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reactivate job",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleServiceUpgrade = (serviceType: 'shortlisting' | 'full-service' | 'executive-search') => {
    // For now, redirect to the managed recruitment mock checkout
    navigate(`/jobs/${job.id}/managed-recruitment-checkout?serviceType=${serviceType}`);
    setUpgradeServiceDialogOpen(false);
  };

  const canEdit = job.status !== 'filled' && job.status !== 'closed' && job.status !== 'cancelled';
  const canMarkFilled = job.status === 'open';
  const canClose = job.status === 'open' || job.status === 'draft';
  const canPlaceOnHold = job.status === 'open' || job.status === 'draft';
  const canCancel = job.status === 'open' || job.status === 'draft' || job.status === 'on-hold';
  const canReactivate = job.status === 'on-hold';
  const canUpgrade = job.serviceType === 'self-managed' && (job.status === 'open' || job.status === 'draft');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {canEdit && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setExtendDialogOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Extend Posting Duration
          </DropdownMenuItem>
          {canMarkFilled && (
            <DropdownMenuItem onClick={() => setMarkFilledDialogOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Filled
            </DropdownMenuItem>
          )}
          {canClose && (
            <DropdownMenuItem
              onClick={() => setCloseJobDialogOpen(true)}
              className="text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Close Job Posting
            </DropdownMenuItem>
          )}
          {canPlaceOnHold && (
            <DropdownMenuItem onClick={() => setOnHoldDialogOpen(true)}>
              <Pause className="h-4 w-4 mr-2" />
              Place on Hold
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem
              onClick={() => setCancelJobDialogOpen(true)}
              className="text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Job Posting
            </DropdownMenuItem>
          )}
          {canReactivate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReactivateDialogOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Reactivate Job
              </DropdownMenuItem>
            </>
          )}
          {canUpgrade && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setUpgradeServiceDialogOpen(true)}>
                <ArrowUpCircle className="h-4 w-4 mr-2 text-primary" />
                <span className="flex flex-col">
                  <span>Upgrade to HRM8 Recruitment Service</span>
                  <span className="text-xs text-muted-foreground">
                    Move this role into a managed recruitment workflow
                  </span>
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Extend Duration Dialog */}
      <ExtendJobDurationDialog
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        job={job}
        onSuccess={() => {
          onJobUpdate();
          setExtendDialogOpen(false);
        }}
      />

      {/* Mark as Filled Dialog */}
      <WarningConfirmationDialog
        open={markFilledDialogOpen}
        onOpenChange={setMarkFilledDialogOpen}
        onConfirm={handleMarkAsFilled}
        type="warning"
        title="Mark Job as Filled"
        description="Are you sure you want to mark this job as filled? This will close the job posting and prevent new applications."
        confirmLabel="Mark as Filled"
        isProcessing={isProcessing}
      />

      {/* Close Job Dialog */}
      <WarningConfirmationDialog
        open={closeJobDialogOpen}
        onOpenChange={setCloseJobDialogOpen}
        onConfirm={handleCloseJob}
        type="warning"
        severity="destructive"
        title="Close Job Posting"
        description="Are you sure you want to close this job posting? This will prevent new applications and mark the job as closed."
        confirmLabel="Close Job"
        confirmVariant="destructive"
        isProcessing={isProcessing}
      />

      {/* On Hold Dialog */}
      <OnHoldJobDialog
        open={onHoldDialogOpen}
        onOpenChange={setOnHoldDialogOpen}
        job={job}
        onConfirm={handleOnHold}
        isProcessing={isProcessing}
      />

      {/* Cancel Job Dialog */}
      <CancelJobDialog
        open={cancelJobDialogOpen}
        onOpenChange={setCancelJobDialogOpen}
        job={job}
        onConfirm={handleCancelJob}
        isProcessing={isProcessing}
      />

      {/* Reactivate Job Dialog */}
      <ReactivateJobDialog
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
        job={job}
        onConfirm={handleReactivate}
        isProcessing={isProcessing}
      />

      {/* Upgrade Service Dialog */}
      <UpgradeServiceDialog
        open={upgradeServiceDialogOpen}
        onServiceTypeSelect={handleServiceUpgrade}
        onCancel={() => setUpgradeServiceDialogOpen(false)}
      />
    </>
  );
}

