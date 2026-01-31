import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getInterviewers } from '@/shared/lib/interviewAvailability';

interface BulkScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSchedule: (data: BulkInterviewData) => void;
}

export interface BulkInterviewData {
  type: string;
  duration: number;
  interviewerId: string;
  startDate: Date;
  timeSlots: string[];
}

export function BulkScheduleInterviewDialog({
  open,
  onOpenChange,
  selectedCount,
  onSchedule,
}: BulkScheduleInterviewDialogProps) {
  const [type, setType] = useState('video');
  const [duration, setDuration] = useState(60);
  const [interviewerId, setInterviewerId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  // const [autoAssign, setAutoAssign] = useState(true); // Removed unused state

  const interviewers = getInterviewers();

  const handleSchedule = () => {
    if (!startDate || !interviewerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data: BulkInterviewData = {
      type,
      duration,
      interviewerId,
      startDate,
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Sample time slots
    };

    onSchedule(data);
    toast.success(`Scheduling ${selectedCount} interviews`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Schedule Interviews</DialogTitle>
          <DialogDescription>
            Schedule interviews for {selectedCount} selected candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Screen</SelectItem>
                <SelectItem value="video">Video Interview</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="technical">Technical Round</SelectItem>
                <SelectItem value="panel">Panel Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interviewer</Label>
            <Select value={interviewerId} onValueChange={setInterviewerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select interviewer" />
              </SelectTrigger>
              <SelectContent>
                {interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-2" />
            Interviews will be automatically assigned to available time slots, avoiding conflicts.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>
            Schedule {selectedCount} Interviews
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
