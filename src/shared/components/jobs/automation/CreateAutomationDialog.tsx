import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { createAutomationRule } from "@/shared/lib/jobAutomationService";
import { useToast } from "@/shared/hooks/use-toast";

interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAutomationDialog({
  open,
  onOpenChange,
}: CreateAutomationDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    triggerType: "inactivity_days",
    triggerValue: "30",
    actionType: "close_job",
    actionValue: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Rule name is required.",
        variant: "destructive",
      });
      return;
    }

    // Build trigger and action based on types
    let trigger: any;
    let action: any;

    switch (formData.triggerType) {
      case "inactivity_days":
        trigger = { type: "inactivity_days", days: parseInt(formData.triggerValue) };
        break;
      case "applicant_count":
        trigger = { type: "applicant_count", count: parseInt(formData.triggerValue) };
        break;
      case "closing_soon":
        trigger = { type: "closing_soon", days: parseInt(formData.triggerValue) };
        break;
      default:
        trigger = { type: "offer_accepted" };
    }

    switch (formData.actionType) {
      case "close_job":
        action = { type: "close_job" };
        break;
      case "change_status":
        action = { type: "change_status", status: formData.actionValue };
        break;
      case "notify":
        action = {
          type: "notify",
          recipients: formData.actionValue.split(",").map((e) => e.trim()),
          message: "Automated notification",
        };
        break;
      default:
        action = { type: "archive" };
    }

    createAutomationRule({
      name: formData.name.trim(),
      trigger,
      action,
      isActive: true,
    });

    toast({
      title: "Automation rule created",
      description: `"${formData.name}" has been created and activated.`,
    });

    // Reset form
    setFormData({
      name: "",
      triggerType: "inactivity_days",
      triggerValue: "30",
      actionType: "close_job",
      actionValue: "",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Automation Rule</DialogTitle>
          <DialogDescription>
            Define when and what action should be taken automatically
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Rule Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Auto-close inactive jobs"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Trigger Condition</h3>

            <div className="space-y-2">
              <Label htmlFor="triggerType">When</Label>
              <Select
                value={formData.triggerType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, triggerType: value })
                }
              >
                <SelectTrigger id="triggerType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inactivity_days">
                    Job inactive for X days
                  </SelectItem>
                  <SelectItem value="applicant_count">
                    Applicant count reaches X
                  </SelectItem>
                  <SelectItem value="closing_soon">
                    Job closing in X days
                  </SelectItem>
                  <SelectItem value="offer_accepted">
                    Offer is accepted
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.triggerType === "inactivity_days" ||
              formData.triggerType === "applicant_count" ||
              formData.triggerType === "closing_soon") && (
              <div className="space-y-2">
                <Label htmlFor="triggerValue">
                  {formData.triggerType === "applicant_count" ? "Count" : "Days"}
                </Label>
                <Input
                  id="triggerValue"
                  type="number"
                  value={formData.triggerValue}
                  onChange={(e) =>
                    setFormData({ ...formData, triggerValue: e.target.value })
                  }
                  min="1"
                  max="365"
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Action to Take</h3>

            <div className="space-y-2">
              <Label htmlFor="actionType">Then</Label>
              <Select
                value={formData.actionType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, actionType: value })
                }
              >
                <SelectTrigger id="actionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="close_job">Close the job</SelectItem>
                  <SelectItem value="change_status">Change job status</SelectItem>
                  <SelectItem value="notify">Send notification</SelectItem>
                  <SelectItem value="archive">Archive the job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.actionType === "change_status" && (
              <div className="space-y-2">
                <Label htmlFor="actionValue">New Status</Label>
                <Select
                  value={formData.actionValue}
                  onValueChange={(value) =>
                    setFormData({ ...formData, actionValue: value })
                  }
                >
                  <SelectTrigger id="actionValue">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.actionType === "notify" && (
              <div className="space-y-2">
                <Label htmlFor="actionValue">Email Recipients (comma-separated)</Label>
                <Input
                  id="actionValue"
                  value={formData.actionValue}
                  onChange={(e) =>
                    setFormData({ ...formData, actionValue: e.target.value })
                  }
                  placeholder="email1@example.com, email2@example.com"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
