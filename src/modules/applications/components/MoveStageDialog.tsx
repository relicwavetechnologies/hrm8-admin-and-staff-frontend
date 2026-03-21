// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";

interface MoveStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  nextStageName: string;
  onConfirm: (comment: string) => void;
  isSubmitting?: boolean;
}

export function MoveStageDialog({
  open,
  onOpenChange,
  candidateName,
  nextStageName,
  onConfirm,
  isSubmitting = false,
}: MoveStageDialogProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment);
    setComment(""); // Reset after confirm
  };

  const handleOpenChangeInternal = (newOpen: boolean) => {
    if (!newOpen) {
      setComment(""); // Reset on close
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Candidate</DialogTitle>
          <DialogDescription>
            You are moving <strong>{candidateName}</strong> to <strong>{nextStageName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="comment" className="text-left font-medium">
              Reason / Team Review (Required)
            </Label>
            <Textarea
              id="comment"
              placeholder="Add a comment about this transition..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This comment will be visible in the Team Reviews tab.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChangeInternal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!comment.trim() || isSubmitting}>
            {isSubmitting ? "Moving..." : "Move & Add Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
