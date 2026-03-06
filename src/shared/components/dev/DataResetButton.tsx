import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
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
import { RotateCcw } from 'lucide-react';
import { reinitializeMockData } from '@/shared/lib/aiInterview/initializeMockData';
import { toast } from 'sonner';

/**
 * Development tool for resetting AI Interview mock data
 * Only use during development/testing
 */
export function DataResetButton() {
  const [showDialog, setShowDialog] = useState(false);

  const handleReset = () => {
    reinitializeMockData();
    setShowDialog(false);
    toast.success('AI Interview data has been reset and reinitialized');
    setTimeout(() => window.location.reload(), 1000);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset AI Data
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset AI Interview Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all AI interview sessions, reports, and comments, then generate fresh mock data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground">
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
