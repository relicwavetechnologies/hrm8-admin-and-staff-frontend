import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, ArrowRightLeft, Briefcase } from "lucide-react";
import { staffService, StaffMember } from "@/shared/lib/hrm8/staffService";
import { toast } from "sonner";

interface ReassignAssetsDialogProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReassignAssetsDialog({
  staff,
  open,
  onOpenChange,
  onSuccess,
}: ReassignAssetsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetConsultantId, setTargetConsultantId] = useState<string>("");
  const [targetConsultants, setTargetConsultants] = useState<
    { id: string; firstName: string; lastName: string; email: string }[]
  >([]);

  useEffect(() => {
    if (open && staff) {
      loadOptions();
      setTargetConsultantId("");
    }
  }, [open, staff]);

  const loadOptions = async () => {
    if (!staff) return;
    try {
      setLoading(true);
      const response = await staffService.getReassignmentOptions(staff.id);
      if (response.success && response.data) {
        setTargetConsultants(response.data.consultants);
      }
    } catch (error) {
      console.error("Failed to load reassignment options:", error);
      toast.error("Failed to load available consultants");
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!staff || !targetConsultantId) return;

    try {
      setSubmitting(true);
      const response = await staffService.reassignJobs(staff.id, targetConsultantId);

      if (response.success) {
        toast.success(
          `Successfully reassigned ${response.data?.count || 0} jobs/assets`
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to reassign assets");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Reassign Assets
          </DialogTitle>
          <DialogDescription>
            Transfer all active jobs, candidates, and pipeline items from{" "}
            <strong>
              {staff.firstName} {staff.lastName}
            </strong>{" "}
            to another consultant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-4 rounded-md space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Active Jobs:
              </span>
              <span className="font-medium">{staff.currentJobs}</span>
            </div>
            {/* Add more stats if available in staff object */}
          </div>

          <div className="space-y-2">
            <Label>Transfer to Consultant</Label>
            <Select
              value={targetConsultantId}
              onValueChange={setTargetConsultantId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a consultant..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading available staff...
                  </div>
                ) : targetConsultants.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No eligible consultants found in this region.
                  </div>
                ) : (
                  targetConsultants.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only active consultants with the same role in the same region are listed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            disabled={!targetConsultantId || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              "Confirm Reassignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
