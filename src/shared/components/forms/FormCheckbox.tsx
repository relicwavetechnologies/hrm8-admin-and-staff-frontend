import React from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Checkbox } from '@/shared/components/ui/checkbox';

interface FormCheckboxProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
