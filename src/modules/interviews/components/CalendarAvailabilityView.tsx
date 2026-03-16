// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { generateAvailableSlots } from '@/shared/lib/interviewAvailability';
import { InterviewSlot } from '@/shared/types/interviewConfirmation';
import { cn } from '@/shared/lib/utils';

interface CalendarAvailabilityViewProps {
  interviewerId: string;
  duration: number;
  onSelectSlot: (slot: InterviewSlot) => void;
  selectedSlot?: InterviewSlot;
}

export function CalendarAvailabilityView({
  interviewerId,
  duration,
  onSelectSlot,
  selectedSlot,
}: CalendarAvailabilityViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const slots = generateAvailableSlots(interviewerId, selectedDate, duration);
  const availableSlots = slots.filter(slot => slot.isAvailable);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Time Slots</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className={cn("pointer-events-auto")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No available slots for this date</p>
                  </div>
                ) : (
                  availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => onSelectSlot(slot)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No available slots</p>
                </div>
              ) : (
                availableSlots.slice(0, 10).map((slot, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                      selectedSlot?.startTime === slot.startTime && "bg-primary/10 border-primary"
                    )}
                    onClick={() => onSelectSlot(slot)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(slot.startTime), 'EEEE, MMM d')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts Warning */}
      {slots.some(s => !s.isAvailable) && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Some time slots have conflicts
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                {slots.filter(s => !s.isAvailable).length} slots are unavailable due to existing interviews
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
