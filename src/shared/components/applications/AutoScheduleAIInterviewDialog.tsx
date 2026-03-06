import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Video, Phone, MessageSquare, Calendar } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';
import type { Application } from '@/shared/types/application';

interface AutoScheduleAIInterviewDialogProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

export function AutoScheduleAIInterviewDialog({ 
  application, 
  open, 
  onOpenChange,
  onScheduled 
}: AutoScheduleAIInterviewDialogProps) {
  const [interviewType, setInterviewType] = useState<'VIDEO' | 'PHONE' | 'IN_PERSON'>('VIDEO');
  const [scheduledDate, setScheduledDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date and time for the interview',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);

    try {
      // Convert datetime-local to ISO string
      const scheduledDateTime = new Date(scheduledDate).toISOString();

      const response = await videoInterviewService.createInterview({
        applicationId: application.id,
        scheduledDate: scheduledDateTime,
        duration,
        type: interviewType,
        interviewerIds: [], // TODO: Get from user context or selection
      });

      if (response.success && response.data) {
        toast({
          title: 'Video Interview scheduled',
          description: `${application.candidateName} will receive an interview invitation`,
        });
        onScheduled?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule interview',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule AI Interview</DialogTitle>
          <DialogDescription>
            Configure and schedule an AI interview for {application.candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interview Type */}
          <div className="space-y-3">
            <Label>Interview Type</Label>
            <RadioGroup value={interviewType} onValueChange={(value) => setInterviewType(value as 'VIDEO' | 'PHONE' | 'IN_PERSON')}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="VIDEO" id="video" />
                <Label htmlFor="video" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Video Interview</div>
                      <div className="text-sm text-muted-foreground">Face-to-face video call</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="PHONE" id="phone" />
                <Label htmlFor="phone" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Phone Interview</div>
                      <div className="text-sm text-muted-foreground">Voice-only call</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="IN_PERSON" id="in-person" />
                <Label htmlFor="in-person" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">In-Person Interview</div>
                      <div className="text-sm text-muted-foreground">Physical meeting</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">
              <Calendar className="h-4 w-4 inline mr-2" />
              Interview Date & Time
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              min={minDate}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Candidate receives interview invitation via email</li>
              <li>• AI conducts structured interview</li>
              <li>• Automatic analysis and scoring</li>
              <li>• Report available for team review</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isScheduling}>
              {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
