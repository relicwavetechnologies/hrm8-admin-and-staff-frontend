// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, RefreshCw, Calendar, WifiOff } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { format, addHours } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/components/ui/label';

interface InterviewerInfo {
  userId: string;
  name: string;
}

interface BusySlot {
  start: string;
  end: string;
}

interface AvailabilityResult {
  [userId: string]: {
    connected: boolean;
    busy: BusySlot[];
  };
}

interface AvailabilityGridProps {
  interviewers: InterviewerInfo[];
  /** The proposed meeting start time */
  proposedTime?: Date;
  /** Meeting duration in minutes */
  duration?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isTimeBusy(busySlots: BusySlot[], start: Date, end: Date): boolean {
  return busySlots.some((slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    return start < slotEnd && end > slotStart;
  });
}

export function AvailabilityGrid({ interviewers, proposedTime, duration = 60 }: AvailabilityGridProps) {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleCheckAvailability = async () => {
    if (!proposedTime || interviewers.length === 0) return;

    setIsLoading(true);
    try {
      const timeMin = new Date(proposedTime.getTime() - 60 * 60 * 1000); // 1h before
      const timeMax = addHours(proposedTime, Math.ceil(duration / 60) + 1);

      const response = await apiClient.post<AvailabilityResult>(
        '/api/auth/google/interviewers-availability',
        {
          interviewerIds: interviewers.map((i) => i.userId),
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
        }
      );

      if (response.success && response.data) {
        setAvailability(response.data);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (interviewers.length === 0) return null;

  const meetingEnd = proposedTime ? addHours(proposedTime, duration / 60) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          Interviewer Availability
        </Label>
        {proposedTime && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1"
            onClick={handleCheckAvailability}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {availability ? 'Refresh' : 'Check Availability'}
          </Button>
        )}
      </div>

      {!proposedTime && (
        <p className="text-[10px] text-muted-foreground italic ml-1">
          Select a date & time first to check availability.
        </p>
      )}

      {availability && proposedTime && meetingEnd && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/40 px-3 py-1.5 border-b flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {format(proposedTime, 'MMM d, h:mm a')} – {format(meetingEnd, 'h:mm a')}
            </span>
            {lastChecked && (
              <span className="text-[9px] text-muted-foreground ml-auto">
                Checked {format(lastChecked, 'h:mm a')}
              </span>
            )}
          </div>
          <div className="divide-y">
            {interviewers.map((interviewer) => {
              const data = availability[interviewer.userId];
              if (!data) return null;

              const busy = data.connected
                ? isTimeBusy(data.busy, proposedTime, meetingEnd)
                : null;

              return (
                <div key={interviewer.userId} className="flex items-center gap-2.5 px-3 py-2">
                  {/* Avatar */}
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-primary">{getInitials(interviewer.name)}</span>
                  </div>

                  {/* Name */}
                  <span className="text-[11px] font-medium flex-1 truncate">{interviewer.name}</span>

                  {/* Status */}
                  {!data.connected ? (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 gap-1 text-muted-foreground border-dashed"
                    >
                      <WifiOff className="h-2.5 w-2.5" />
                      Not connected
                    </Badge>
                  ) : busy ? (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 bg-red-50 text-red-600 border-red-200"
                    >
                      ● Busy
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 bg-green-50 text-green-600 border-green-200"
                    >
                      ○ Available
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
