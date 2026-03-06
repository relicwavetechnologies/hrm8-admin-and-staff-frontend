// import React from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/shared/lib/utils';

interface FormDateRangePickerProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  fromName: FieldPath<TFieldValues>;
  toName: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormDateRangePicker<TFieldValues extends FieldValues = FieldValues>({
  form,
  fromName,
  toName,
  label,
  placeholder = 'Pick a date range',
  description,
  className,
  disabled,
  required,
}: FormDateRangePickerProps<TFieldValues>) {
  const fromValue = form.watch(fromName);
  const toValue = form.watch(toName);

  const dateRange: DateRange | undefined =
    fromValue || toValue
      ? {
        from: fromValue ? new Date(fromValue) : undefined,
        to: toValue ? new Date(toValue) : undefined,
      }
      : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    form.setValue(fromName, range?.from?.toISOString().split('T')[0] as any, { shouldValidate: true });
    form.setValue(toName, range?.to?.toISOString().split('T')[0] as any, { shouldValidate: true });
  };

  return (
    <FormItem className={cn("flex flex-col", className)}>
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
