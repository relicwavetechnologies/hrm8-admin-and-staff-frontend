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
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { Job } from "@/shared/types/job";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";
import { Calendar, RefreshCw, Info } from "lucide-react";

interface ExtendJobDurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onSuccess: () => void;
}

export function ExtendJobDurationDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: ExtendJobDurationDialogProps) {
  const { toast } = useToast();
  const [days, setDays] = useState<string>("30");
  const [autoRenew, setAutoRenew] = useState(false);
  const [autoRenewDays, setAutoRenewDays] = useState<string>("30");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtend = async () => {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid number of days.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Calculate new expiry date
      const currentCloseDate = job.closeDate ? new Date(job.closeDate) : new Date();
      const newCloseDate = new Date(currentCloseDate);
      newCloseDate.setDate(newCloseDate.getDate() + daysNum);

      const updateData: any = {
        closeDate: newCloseDate.toISOString(),
      };

      // Add auto-renewal settings if enabled
      if (autoRenew) {
        updateData.autoRenewEnabled = true;
        updateData.autoRenewDays = parseInt(autoRenewDays, 10) || 30;
      } else {
        updateData.autoRenewEnabled = false;
      }

      const response = await jobService.updateJob(job.id, updateData);

      if (response.success) {
        toast({
          title: "Job posting extended",
          description: `The job posting has been extended by ${daysNum} days.`,
        });
        onSuccess();
        setDays("30"); // Reset to default
        setAutoRenew(false);
        setAutoRenewDays("30");
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to extend job posting",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend job posting",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate preview date
  const previewDate = (() => {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum <= 0) return null;
    const currentCloseDate = job.closeDate ? new Date(job.closeDate) : new Date();
    const newDate = new Date(currentCloseDate);
    newDate.setDate(newDate.getDate() + daysNum);
    return newDate;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Extend Job Posting Duration
          </DialogTitle>
          <DialogDescription>
            Extend the closing date for this job posting to keep it active longer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="days">Extend by (days)</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Enter the number of days to extend the job posting duration.
            </p>
          </div>

          {previewDate && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">New closing date:</p>
              <p className="font-semibold">
                {previewDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          {job.closeDate && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Current closing date:</p>
              <p className="font-medium">
                {new Date(job.closeDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-renew" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Auto-Renew Job Posting
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically extend the posting when it expires
                </p>
              </div>
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            {autoRenew && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This job will automatically renew by extending the closing date. 
                    You can disable auto-renewal at any time.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="auto-renew-days">Extend by (days) when renewing</Label>
                  <Input
                    id="auto-renew-days"
                    type="number"
                    min="1"
                    value={autoRenewDays}
                    onChange={(e) => setAutoRenewDays(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days to extend each time the job auto-renews
                  </p>
                </div>
              </>
            )}
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
          <Button onClick={handleExtend} disabled={isProcessing}>
            {isProcessing ? "Extending..." : "Extend Posting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

