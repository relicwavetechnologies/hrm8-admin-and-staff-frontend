import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { ApplicationStage } from "@/shared/types/application";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface StageTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: ApplicationStage;
  newStage: ApplicationStage;
  candidateName: string;
  onConfirm: () => void;
}

// Major stage transitions that should trigger confirmation
const majorTransitions: Record<string, ApplicationStage[]> = {
  "Offer Extended": ["Phone Screen", "Technical Interview", "Manager Interview", "Final Round"],
  "Offer Accepted": ["Offer Extended"],
  "Rejected": ["Phone Screen", "Technical Interview", "Manager Interview", "Final Round", "Resume Review"],
  "Withdrawn": ["Phone Screen", "Technical Interview", "Manager Interview", "Final Round"],
};

// Check if transition should trigger confirmation
function isMajorTransition(from: ApplicationStage, to: ApplicationStage): boolean {
  if (to === "Offer Extended" || to === "Offer Accepted" || to === "Rejected" || to === "Withdrawn") {
    const requiresConfirmation = majorTransitions[to] || [];
    return requiresConfirmation.some(stage =>
      from.includes(stage) || stage.includes(from)
    );
  }
  return false;
}

export function StageTransitionDialog({
  open,
  onOpenChange,
  currentStage,
  newStage,
  candidateName,
  onConfirm,
}: StageTransitionDialogProps) {
  const shouldConfirm = isMajorTransition(currentStage, newStage);

  // Only show dialog for major transitions
  if (!shouldConfirm) {
    // For non-major transitions, just call onConfirm directly
    if (open && !shouldConfirm) {
      onConfirm();
      onOpenChange(false);
    }
    return null;
  }

  const getTransitionMessage = () => {
    if (newStage === "Offer Extended") {
      return `This will move ${candidateName} to the offer stage. Make sure all interviews are completed and feedback is collected.`;
    }
    if (newStage === "Offer Accepted") {
      return `This will mark ${candidateName} as hired. This action should only be taken after the candidate has officially accepted the offer.`;
    }
    if (newStage === "Rejected") {
      return `This will reject ${candidateName}'s application. This action cannot be easily undone.`;
    }
    if (newStage === "Withdrawn") {
      return `This will mark ${candidateName}'s application as withdrawn. This action cannot be easily undone.`;
    }
    return `Are you sure you want to move ${candidateName} from ${currentStage} to ${newStage}?`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Stage Transition</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <Badge variant="outline">{currentStage}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge>{newStage}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getTransitionMessage()}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Transition
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

