import { Button } from '@/shared/components/ui/button';
import { Edit3, Save, RotateCcw, Plus, Lock } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
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
import { useState } from 'react';

interface LayoutControlsProps {
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onReset: () => void;
  onAddWidget: () => void;
}

export function LayoutControls({
  isEditMode,
  hasUnsavedChanges,
  onToggleEditMode,
  onSave,
  onReset,
  onAddWidget
}: LayoutControlsProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-3 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-20">
        <Button
          variant={isEditMode ? "default" : "outline-primary"}
          size="sm"
          onClick={onToggleEditMode}
          className="gap-2"
        >
          {isEditMode ? (
            <>
              <Lock className="h-4 w-4" />
              Exit Edit Mode
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" />
              Edit Layout
            </>
          )}
        </Button>

        {isEditMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWidget}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>

            <div className="flex-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              size="sm"
              onClick={onSave}
              disabled={!hasUnsavedChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Layout
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full">
                  <span className="sr-only">Unsaved changes</span>
                </Badge>
              )}
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Dashboard Layout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the default dashboard layout and remove all customizations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset Layout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
