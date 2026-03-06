import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";
import { Job } from "@/shared/types/job";
import { EyeOff, Globe, AlertCircle, CheckCircle } from "lucide-react";

interface JobBoardVisibilityControlProps {
  job: Job;
  onUpdate: () => void;
}

export function JobBoardVisibilityControl({ job, onUpdate }: JobBoardVisibilityControlProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReapproveDialog, setShowReapproveDialog] = useState(false);

  // Check if job is hidden from boards (simplified check - in production would check a specific field)
  const isHiddenFromBoards = job.status === 'on-hold' || (job as any).hiddenFromBoards === true;
  const requiresReapproval = (job as any).requiresReapproval === true;

  const handleToggleVisibility = async (visible: boolean) => {
    if (!visible && job.status === 'open') {
      // If hiding, show confirmation
      setShowReapproveDialog(true);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await jobService.updateJob(job.id, {
        hiddenFromBoards: !visible,
        requiresReapproval: !visible,
      } as any);

      if (response.success) {
        toast({
          title: visible ? "Job visible on boards" : "Job hidden from boards",
          description: visible
            ? "The job is now visible on all selected job boards."
            : "The job has been hidden from all job boards. It can be re-approved to make it visible again.",
        });
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update job board visibility",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job board visibility",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReapprove = async () => {
    setIsUpdating(true);
    try {
      const response = await jobService.updateJob(job.id, {
        hiddenFromBoards: false,
        requiresReapproval: false,
      } as any);

      if (response.success) {
        toast({
          title: "Job re-approved",
          description: "The job has been re-approved and is now visible on all selected job boards.",
        });
        onUpdate();
        setShowReapproveDialog(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to re-approve job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to re-approve job",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Job Board Visibility
          </CardTitle>
          <CardDescription>
            Control whether this job is visible on external job boards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="board-visibility" className="text-base font-medium">
                  Visible on Job Boards
                </Label>
                {isHiddenFromBoards && (
                  <Badge variant="outline" className="h-5 px-2 text-xs rounded-full">
                    Hidden
                  </Badge>
                )}
                {requiresReapproval && (
                  <Badge variant="warning" className="h-5 px-2 text-xs rounded-full">
                    Awaiting Re-approval
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isHiddenFromBoards
                  ? "This job is currently hidden from all job boards"
                  : "This job is visible on all selected job boards"
                }
              </p>
            </div>
            <Switch
              id="board-visibility"
              checked={!isHiddenFromBoards}
              onCheckedChange={handleToggleVisibility}
              disabled={isUpdating || job.status !== 'open'}
            />
          </div>

          {isHiddenFromBoards && (
            <Alert>
              <EyeOff className="h-4 w-4" />
              <AlertDescription>
                <strong>Hidden from job boards:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Not visible on HRM8 Job Board</li>
                  <li>Not visible on Careers Page</li>
                  <li>Removed from all external job board integrations</li>
                  <li>Job details remain accessible internally</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {requiresReapproval && !isHiddenFromBoards && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This job requires re-approval before it can be posted to job boards.
                Review the job details and re-approve to make it visible.
              </AlertDescription>
            </Alert>
          )}

          {job.status !== 'open' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Job board visibility can only be changed for jobs with "Open" status.
              </AlertDescription>
            </Alert>
          )}

          {!isHiddenFromBoards && job.jobBoardDistribution && job.jobBoardDistribution.length > 0 && (
            <div className="space-y-2">
              <Label>Active on Job Boards</Label>
              <div className="flex flex-wrap gap-2">
                {job.jobBoardDistribution.map((board) => (
                  <Badge key={board} variant="outline" className="h-6 px-2 text-xs rounded-full">
                    {board}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {requiresReapproval && (
            <Button
              onClick={handleReapprove}
              disabled={isUpdating}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Re-approve and Publish to Job Boards
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Re-approval Confirmation Dialog */}
      <Dialog open={showReapproveDialog} onOpenChange={setShowReapproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide from Job Boards?</DialogTitle>
            <DialogDescription>
              Hiding this job will remove it from all job boards. You'll need to re-approve it to make it visible again.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove the job from HRM8 Job Board</li>
                <li>Remove the job from Careers Page</li>
                <li>Remove the job from all external job boards</li>
                <li>Require re-approval before reposting</li>
              </ul>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReapproveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleToggleVisibility(false);
                setShowReapproveDialog(false);
              }}
              disabled={isUpdating}
            >
              Hide from Boards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

