// @ts-nocheck
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Textarea } from "@/shared/components/ui/textarea";
import { scheduleInterview } from "@/shared/lib/interviewService";
import { useToast } from "@/shared/hooks/use-toast";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  candidateId?: string;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  jobId,
  candidateId,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState<"phone" | "video" | "in-person" | "technical" | "panel">(
    "video"
  );
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Validation error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes);

    scheduleInterview({
      jobId: jobId || "1",
      jobTitle: "Senior Software Engineer",
      candidateId: candidateId || "c1",
      candidateName: "Sample Candidate",
      candidateEmail: "candidate@email.com",
      interviewerIds: ["i1"],
      interviewerNames: ["Interviewer"],
      type,
      round: 1,
      scheduledDate: scheduledDate.toISOString(),
      duration: parseInt(duration),
      status: "scheduled",
      notes,
      meetingLink: type === "video" ? "https://meet.google.com/sample-link" : undefined,
    });

    toast({
      title: "Interview scheduled",
      description: "The interview has been scheduled successfully.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule a new interview with a candidate
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Interview Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Screen</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="panel">Panel Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
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
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
