import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { JobRoundType } from "@/shared/lib/api/jobRoundService";

interface CreateRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  jobId: string;
}

export function CreateRoundDialog({ open, onOpenChange, onSuccess, jobId }: CreateRoundDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<JobRoundType>("ASSESSMENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { jobRoundService } = await import("@/shared/lib/api/jobRoundService");
      const response = await jobRoundService.createRound(jobId, {
        name: name.trim(),
        type,
      });

      if (response.success) {
        setName("");
        setType("ASSESSMENT");
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Failed to create round");
      }
    } catch (error) {
      console.error("Failed to create round:", error);
      alert(error instanceof Error ? error.message : "Failed to create round");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Round</DialogTitle>
          <DialogDescription>
            Add a new round to the interview pipeline. Each round can be either an assessment or an interview.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="round-name">Round Name *</Label>
            <Input
              id="round-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Technical Assessment, Final Interview"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="round-type">Round Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as JobRoundType)}>
              <SelectTrigger id="round-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Round"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

