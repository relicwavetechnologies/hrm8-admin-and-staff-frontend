/**
 * Auto Assignment Override Modal
 * Confirmation modal when overriding an auto-assigned job
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface AutoAssignmentOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  currentConsultantName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AutoAssignmentOverrideModal({
  open,
  onOpenChange,
  jobTitle,
  currentConsultantName,
  onConfirm,
  onCancel,
}: AutoAssignmentOverrideModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            This job was auto-assigned
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 pt-2">
            <p>
              This job was automatically assigned to <strong>{currentConsultantName || 'a consultant'}</strong> based on availability and matching rules.
            </p>
            <p>
              You are about to override that assignment.
            </p>
            <p className="font-medium text-foreground">
              Are you sure you want to change the assigned consultant?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continue & Change Consultant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


















