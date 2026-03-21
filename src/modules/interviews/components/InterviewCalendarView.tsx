// @ts-nocheck
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Users,
  Video,
  Phone,
  MapPin,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO, addMinutes, isWithinInterval } from "date-fns";
import type { Interview } from "@/shared/types/interview";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface InterviewCalendarViewProps {
  interviews: Interview[];
  onViewDetails?: (interview: Interview) => void;
  onReschedule?: (interview: Interview, newDate: Date, newTime: string) => void;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

const timeSlots: TimeSlot[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  return {
    time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    hour,
    minute,
  };
}).filter((slot) => slot.hour >= 8 && slot.hour < 20); // 8 AM to 8 PM

export function InterviewCalendarView({
  interviews,
  onViewDetails,
  onReschedule,
}: InterviewCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [draggedInterview, setDraggedInterview] = useState<Interview | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: Date; time: string } | null>(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const getInterviewsForDay = (date: Date) => {
    return interviews.filter((interview) =>
      isSameDay(parseISO(interview.scheduledDate), date)
    );
  };

  const getInterviewAtSlot = (date: Date, timeSlot: TimeSlot) => {
    const dayInterviews = getInterviewsForDay(date);
    return dayInterviews.find((interview) => {
      const [hour, minute] = interview.scheduledTime
        .replace(/AM|PM/i, "")
        .trim()
        .split(":")
        .map((n) => parseInt(n));
      const isPM = interview.scheduledTime.toLowerCase().includes("pm");
      const interviewHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
      return interviewHour === timeSlot.hour && (minute || 0) === timeSlot.minute;
    });
  };

  const checkConflicts = (date: Date, timeSlot: TimeSlot, interview: Interview) => {
    const dayInterviews = getInterviewsForDay(date);
    const targetStartTime = new Date(date);
    targetStartTime.setHours(timeSlot.hour, timeSlot.minute, 0);
    const targetEndTime = addMinutes(targetStartTime, interview.duration);

    return dayInterviews.some((existingInterview) => {
      if (existingInterview.id === interview.id) return false;

      const [hour, minute] = existingInterview.scheduledTime
        .replace(/AM|PM/i, "")
        .trim()
        .split(":")
        .map((n) => parseInt(n));
      const isPM = existingInterview.scheduledTime.toLowerCase().includes("pm");
      const existingHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

      const existingStartTime = new Date(date);
      existingStartTime.setHours(existingHour, minute || 0, 0);
      const existingEndTime = addMinutes(existingStartTime, existingInterview.duration);

      return (
        isWithinInterval(targetStartTime, {
          start: existingStartTime,
          end: existingEndTime,
        }) ||
        isWithinInterval(existingStartTime, {
          start: targetStartTime,
          end: targetEndTime,
        })
      );
    });
  };

  const checkInterviewerConflicts = (interview: Interview, date: Date, timeSlot: TimeSlot) => {
    const allInterviews = interviews.filter((i) => i.id !== interview.id);
    const targetStartTime = new Date(date);
    targetStartTime.setHours(timeSlot.hour, timeSlot.minute, 0);
    const targetEndTime = addMinutes(targetStartTime, interview.duration);

    const conflictingInterviewers = interview.interviewers.filter((interviewer) => {
      return allInterviews.some((otherInterview) => {
        const hasInterviewer = otherInterview.interviewers.some(
          (i) => i.email === interviewer.email
        );
        if (!hasInterviewer) return false;

        const [hour, minute] = otherInterview.scheduledTime
          .replace(/AM|PM/i, "")
          .trim()
          .split(":")
          .map((n) => parseInt(n));
        const isPM = otherInterview.scheduledTime.toLowerCase().includes("pm");
        const existingHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

        const existingStartTime = parseISO(otherInterview.scheduledDate);
        existingStartTime.setHours(existingHour, minute || 0, 0);
        const existingEndTime = addMinutes(existingStartTime, otherInterview.duration);

        return (
          isSameDay(existingStartTime, date) &&
          (isWithinInterval(targetStartTime, {
            start: existingStartTime,
            end: existingEndTime,
          }) ||
            isWithinInterval(existingStartTime, {
              start: targetStartTime,
              end: targetEndTime,
            }))
        );
      });
    });

    return conflictingInterviewers;
  };

  const handleDragStart = (interview: Interview) => {
    setDraggedInterview(interview);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, timeSlot: TimeSlot) => {
    e.preventDefault();
    setHoveredSlot({ date, time: timeSlot.time });
  };

  const handleDrop = (e: React.DragEvent, date: Date, timeSlot: TimeSlot) => {
    e.preventDefault();
    if (!draggedInterview) return;

    const hasConflict = checkConflicts(date, timeSlot, draggedInterview);
    const conflictingInterviewers = checkInterviewerConflicts(
      draggedInterview,
      date,
      timeSlot
    );

    if (hasConflict || conflictingInterviewers.length > 0) {
      return;
    }

    const hour = timeSlot.hour;
    const minute = timeSlot.minute;
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const newTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;

    onReschedule?.(draggedInterview, date, newTime);
    setDraggedInterview(null);
    setHoveredSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedInterview(null);
    setHoveredSlot(null);
  };

  const getTypeIcon = (type: Interview["type"]) => {
    const icons = {
      phone: <Phone className="h-3 w-3" />,
      video: <Video className="h-3 w-3" />,
      "in-person": <MapPin className="h-3 w-3" />,
      panel: <Users className="h-3 w-3" />,
    };
    return icons[type];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isSlotHovered = (date: Date, timeSlot: TimeSlot) => {
    if (!hoveredSlot || !draggedInterview) return false;
    return (
      isSameDay(hoveredSlot.date, date) && hoveredSlot.time === timeSlot.time
    );
  };

  const getSlotStatus = (date: Date, timeSlot: TimeSlot) => {
    if (!draggedInterview || !isSlotHovered(date, timeSlot)) return null;

    const hasConflict = checkConflicts(date, timeSlot, draggedInterview);
    const conflictingInterviewers = checkInterviewerConflicts(
      draggedInterview,
      date,
      timeSlot
    );

    if (hasConflict) return "conflict";
    if (conflictingInterviewers.length > 0) return "interviewer-conflict";
    return "available";
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Interview Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 bg-muted rounded-md font-medium min-w-[200px] text-center">
                {format(currentWeekStart, "MMM d")} -{" "}
                {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <ScrollArea className="h-[600px]">
          <div className="p-4">
            <div className="grid grid-cols-8 gap-2">
              {/* Time Column */}
              <div className="space-y-2">
                <div className="h-16 border-b" />
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className="h-16 flex items-center justify-end pr-2 text-xs text-muted-foreground"
                  >
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="space-y-2">
                  {/* Day Header */}
                  <div className="h-16 flex flex-col items-center justify-center border-b bg-muted/50 rounded-t-lg">
                    <div className="text-xs text-muted-foreground">
                      {format(day, "EEE")}
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-semibold",
                        isSameDay(day, new Date()) &&
                          "bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((slot) => {
                    const existingInterview = getInterviewAtSlot(day, slot);
                    const slotStatus = getSlotStatus(day, slot);

                    return (
                      <div
                        key={slot.time}
                        className={cn(
                          "h-16 border rounded-md relative transition-all",
                          existingInterview && "p-1",
                          slotStatus === "available" && "bg-success/20 border-success",
                          slotStatus === "conflict" && "bg-destructive/20 border-destructive",
                          slotStatus === "interviewer-conflict" &&
                            "bg-warning/20 border-warning",
                          !existingInterview && "hover:bg-muted/50"
                        )}
                        onDragOver={(e) => handleDragOver(e, day, slot)}
                        onDrop={(e) => handleDrop(e, day, slot)}
                      >
                        {existingInterview ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  draggable
                                  onDragStart={() => handleDragStart(existingInterview)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => onViewDetails?.(existingInterview)}
                                  className={cn(
                                    "h-full cursor-move rounded p-2 space-y-1 hover:shadow-md transition-shadow",
                                    existingInterview.status === "scheduled" &&
                                      "bg-primary/10 border border-primary/20",
                                    existingInterview.status === "completed" &&
                                      "bg-success/10 border border-success/20",
                                    existingInterview.status === "cancelled" &&
                                      "bg-muted border border-muted-foreground/20",
                                    existingInterview.status === "no-show" &&
                                      "bg-destructive/10 border border-destructive/20"
                                  )}
                                >
                                  <div className="flex items-center gap-1">
                                    {getTypeIcon(existingInterview.type)}
                                    <span className="text-xs font-medium truncate">
                                      {existingInterview.candidateName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="h-2.5 w-2.5" />
                                    {existingInterview.duration}m
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-2">
                                  <div>
                                    <p className="font-semibold">
                                      {existingInterview.candidateName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {existingInterview.jobTitle}
                                    </p>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <p>
                                      <strong>Time:</strong> {existingInterview.scheduledTime}
                                    </p>
                                    <p>
                                      <strong>Duration:</strong> {existingInterview.duration}{" "}
                                      minutes
                                    </p>
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      <span className="capitalize">{existingInterview.type}</span>
                                    </p>
                                  </div>
                                  {existingInterview.interviewers.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium mb-1">Interviewers:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {existingInterview.interviewers.map((interviewer, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-[10px]">
                                            {interviewer.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          slotStatus === "interviewer-conflict" &&
                          draggedInterview && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-semibold text-xs">
                                      Interviewer Conflicts:
                                    </p>
                                    {checkInterviewerConflicts(
                                      draggedInterview,
                                      day,
                                      slot
                                    ).map((interviewer, idx) => (
                                      <p key={idx} className="text-xs">
                                        • {interviewer.name}
                                      </p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium">Drag & Drop Instructions:</p>
              <p className="text-xs text-muted-foreground">
                Drag interview cards to reschedule them to different time slots
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success/20 border-success border rounded" />
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-warning/20 border-warning border rounded" />
                <span className="text-xs">Interviewer Busy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive/20 border-destructive border rounded" />
                <span className="text-xs">Time Conflict</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
