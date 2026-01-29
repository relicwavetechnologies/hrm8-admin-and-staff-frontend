import React from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';

interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormTextarea<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  rows = 3,
  className,
  disabled,
  required,
}: FormTextareaProps<TFieldValues>) {
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
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
