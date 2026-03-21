import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date and time',
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [selectedHour, setSelectedHour] = React.useState<string>(
    date ? format(date, 'HH') : '09'
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    date ? format(date, 'mm') : '00'
  );

  // Update parent when date/time changes
  React.useEffect(() => {
    if (selectedDate && selectedHour && selectedMinute) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
      onDateChange?.(newDate);
    } else {
      onDateChange?.(undefined);
    }
  }, [selectedDate, selectedHour, selectedMinute]);

  // Update local state when prop changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setSelectedHour(format(date, 'HH'));
      setSelectedMinute(format(date, 'mm'));
    }
  }, [date]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal h-8 text-xs',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {selectedDate ? (
            format(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                parseInt(selectedHour),
                parseInt(selectedMinute)
              ),
              'PPP p'
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
        <div className="border-t p-3 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Select Time</div>
          <div className="flex items-center gap-2">
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour} className="text-xs">
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs font-medium">:</span>
            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute} className="text-xs">
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
