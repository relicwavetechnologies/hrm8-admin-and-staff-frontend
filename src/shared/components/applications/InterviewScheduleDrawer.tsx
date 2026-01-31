import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Video, Phone, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';

interface InterviewScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  jobId?: string;
  candidateName?: string;
  jobTitle?: string;
}

export function InterviewScheduleDrawer({
  open,
  onOpenChange,
  applicationId,
  jobId: _jobId,
  candidateName,
  jobTitle,

}: InterviewScheduleDrawerProps) {
  const [interviewType, setInterviewType] = useState<'VIDEO' | 'PHONE' | 'IN_PERSON'>('VIDEO');
  const [scheduledDate, setScheduledDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [isScheduling, setIsScheduling] = useState(false);

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setInterviewType('VIDEO');
      setScheduledDate('');
      setDuration(60);
    }
  }, [open]);

  const handleSchedule = async () => {
    if (!applicationId) {
      toast.error('Application ID is required');
      return;
    }

    if (!scheduledDate) {
      toast.error('Please select a date and time for the interview');
      return;
    }

    setIsScheduling(true);

    try {
      // Convert datetime-local to ISO string
      const scheduledDateTime = new Date(scheduledDate).toISOString();

      const response = await videoInterviewService.createInterview({
        applicationId,
        scheduledDate: scheduledDateTime,
        duration,
        type: interviewType,
        interviewerIds: [], // TODO: Get from user context or selection
      });

      if (response.success && response.data) {
        toast.success('Interview scheduled successfully', {
          description: candidateName
            ? `${candidateName} will receive an interview invitation`
            : 'The candidate will receive an interview invitation',
        });
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);

  if (!applicationId) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Schedule Interview</DrawerTitle>
          <DrawerDescription>
            {candidateName && jobTitle
              ? `Schedule an interview for ${candidateName} - ${jobTitle}`
              : candidateName
                ? `Schedule an interview for ${candidateName}`
                : 'Schedule an interview'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Interview Type */}
            <div className="space-y-3">
              <Label>Interview Type</Label>
              <RadioGroup
                value={interviewType}
                onValueChange={(value) => setInterviewType(value as 'VIDEO' | 'PHONE' | 'IN_PERSON')}
              >
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
                <li>• Interview details are added to calendar</li>
                <li>• Meeting link will be generated (for video interviews)</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSchedule} disabled={isScheduling || !scheduledDate}>
                {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
