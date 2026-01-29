import React from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  options,
  className,
  disabled,
  required,
}: FormSelectProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
