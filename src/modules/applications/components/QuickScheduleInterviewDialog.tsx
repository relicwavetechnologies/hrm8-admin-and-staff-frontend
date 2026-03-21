// @ts-nocheck
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Video, Phone, Users, MapPin, Loader2, Calendar, Clock } from 'lucide-react';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';
import { toast } from 'sonner';

interface QuickScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  candidateName: string;
  jobId: string;
  roundId: string;
  onSuccess?: () => void;
}

type InterviewType = 'VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL';

const interviewTypes: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
  { value: 'VIDEO', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'PHONE', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
  { value: 'IN_PERSON', label: 'In-Person', icon: <MapPin className="h-4 w-4" /> },
  { value: 'PANEL', label: 'Panel', icon: <Users className="h-4 w-4" /> },
];

const durationOptions = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

export function QuickScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId,
  candidateName,
  jobId,
  roundId,
  onSuccess,
}: QuickScheduleInterviewDialogProps) {
  const [interviewType, setInterviewType] = useState<InterviewType>('VIDEO');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDate = new Date(`${date}T${time}`);
      
      await videoInterviewService.createInterview({
        applicationId,
        jobRoundId: roundId,
        scheduledDate: scheduledDate.toISOString(),
        duration: parseInt(duration),
        type: interviewType,
      });

      toast.success(`Interview scheduled for ${candidateName}`);
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setDate('');
      setTime('');
      setInterviewType('VIDEO');
      setDuration('30');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Schedule an interview for <strong>{candidateName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {interviewTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={interviewType === type.value ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-16 gap-1"
                  onClick={() => setInterviewType(type.value)}
                >
                  {type.icon}
                  <span className="text-xs">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Interview
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
