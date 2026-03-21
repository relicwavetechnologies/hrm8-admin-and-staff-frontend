// @ts-nocheck
/**
 * Reschedule Interview Dialog
 * Allows admin to manually reschedule an interview
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { interviewService, Interview } from '@/shared/lib/interviewService';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';

interface RescheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  onReschedule?: (newDate: Date, reason?: string) => void;
  onSuccess?: () => void;
}

export function RescheduleInterviewDialog({
  open,
  onOpenChange,
  interview,
  onReschedule,
  onSuccess,
}: RescheduleInterviewDialogProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form when dialog opens
  useEffect(() => {
    if (interview && open) {
      const interviewDate = new Date(interview.scheduledDate);
      setNewDate(interviewDate.toISOString().split('T')[0]);
      setNewTime(interviewDate.toTimeString().slice(0, 5));
      setReason('');
    }
  }, [interview, open]);

  const handleReschedule = async () => {
    if (!interview || !newDate || !newTime) {
      toast.error('Please select both date and time');
      return;
    }

    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${newDate}T${newTime}`);
      
      // If onReschedule callback is provided, use it (for parent component handling)
      if (onReschedule) {
        onReschedule(scheduledDateTime, reason || undefined);
        onOpenChange(false);
        setSaving(false);
        return;
      }

      // Otherwise, handle directly
      const response = await interviewService.rescheduleInterview(
        interview.id,
        scheduledDateTime.toISOString(),
        reason || undefined
      );

      if (response.success) {
        toast.success('Interview rescheduled successfully');
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to reschedule');
      }
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule interview');
    } finally {
      setSaving(false);
    }
  };

  if (!interview) return null;

  const currentDate = new Date(interview.scheduledDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reschedule Interview
          </DialogTitle>
          <DialogDescription>
            Select a new date and time for this interview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Current Schedule</Label>
            <div className="mt-1 text-sm font-medium">
              {currentDate.toLocaleDateString()} at {currentDate.toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-date">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-time">New Time</Label>
              <Input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rescheduling..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={saving || !newDate || !newTime}>
              {saving ? 'Rescheduling...' : 'Reschedule Interview'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

