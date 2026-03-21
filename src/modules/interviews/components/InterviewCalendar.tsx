// @ts-nocheck
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronLeft, ChevronRight, Video, Phone, Users, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { Interview } from '@/shared/types/interview';

interface InterviewCalendarProps {
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
}

export function InterviewCalendar({ interviews, onInterviewClick }: InterviewCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getInterviewsForDay = (date: Date) => {
    return interviews.filter(interview => 
      isSameDay(parseISO(interview.scheduledDate), date)
    ).sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  };

  const getInterviewTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'phone':
        return <Phone className="h-3 w-3" />;
      case 'panel':
        return <Users className="h-3 w-3" />;
      case 'in-person':
        return <MapPin className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'no-show':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setCurrentWeekStart(startOfWeek(new Date()))}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayInterviews = getInterviewsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toISOString()} className="min-h-[200px]">
              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-primary' : 'border-border'}`}>
                <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-2">
                {dayInterviews.map(interview => (
                  <Button
                    key={interview.id}
                    variant="ghost"
                    onClick={() => onInterviewClick(interview)}
                    className={`w-full text-left p-2 h-auto rounded-lg border transition-colors hover:shadow-md justify-start flex-col items-start space-y-0 ${getStatusColor(interview.status)}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {getInterviewTypeIcon(interview.type)}
                      <span className="text-xs font-medium truncate">
                        {interview.scheduledTime}
                      </span>
                    </div>
                    <div className="text-xs truncate font-medium">{interview.candidateName}</div>
                    <div className="text-xs truncate text-muted-foreground">{interview.jobTitle}</div>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
