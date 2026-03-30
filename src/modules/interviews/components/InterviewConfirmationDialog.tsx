// @ts-nocheck
import { useState } from 'react';
import { SafeExternalLink } from '@/shared/components/SafeExternalLink';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, XCircle, Calendar, Clock, Video, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InterviewConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: {
    id: string;
    candidateName: string;
    jobTitle: string;
    type: string;
    scheduledDate: string;
    duration: number;
    location?: string;
    meetingLink?: string;
  };
  onConfirm: (status: 'accepted' | 'declined', notes?: string) => void;
}

export function InterviewConfirmationDialog({
  open,
  onOpenChange,
  interview,
  onConfirm,
}: InterviewConfirmationDialogProps) {
  const [notes, setNotes] = useState('');
  const [requestReschedule, setRequestReschedule] = useState(false);

  const handleAccept = () => {
    onConfirm('accepted', notes);
    toast.success('Interview confirmed!');
    onOpenChange(false);
  };

  const handleDecline = () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    onConfirm('declined', notes);
    toast.success('Interview declined');
    onOpenChange(false);
  };

  const handleRequestReschedule = () => {
    if (!notes.trim()) {
      toast.error('Please provide your preferred times');
      return;
    }
    toast.success('Reschedule request sent');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Interview Confirmation</DialogTitle>
          <DialogDescription>
            Please confirm your interview details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{interview.jobTitle}</h3>
              <p className="text-sm text-muted-foreground">with {interview.candidateName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(interview.scheduledDate), 'h:mm a')} ({interview.duration} min)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {interview.type}
              </Badge>
            </div>

            {interview.meetingLink && (
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-muted-foreground" />
                <SafeExternalLink href={interview.meetingLink} className="text-primary hover:underline">
                  Join Video Call
                </SafeExternalLink>
              </div>
            )}

            {interview.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{interview.location}</span>
              </div>
            )}
          </div>

          {!requestReschedule ? (
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any questions or special requirements?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reschedule-notes">Preferred Alternative Times</Label>
              <Textarea
                id="reschedule-notes"
                placeholder="Please suggest your preferred times for rescheduling..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {!requestReschedule ? (
            <>
              <Button variant="outline" onClick={() => setRequestReschedule(true)}>
                Request Reschedule
              </Button>
              <Button variant="outline" onClick={handleDecline}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={handleAccept}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Interview
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setRequestReschedule(false)}>
                Back
              </Button>
              <Button onClick={handleRequestReschedule}>
                Send Reschedule Request
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
