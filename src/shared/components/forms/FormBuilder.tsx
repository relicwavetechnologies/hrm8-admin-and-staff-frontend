import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { FormTextarea } from './FormTextarea';
import { FormCheckbox } from './FormCheckbox';
import { FormMultiSelect } from './FormMultiSelect';
import { FormDatePicker } from './FormDatePicker';
import { FormDateRangePicker } from './FormDateRangePicker';
import { FormFileUpload } from './FormFileUpload';

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'daterange'
  | 'file';

export interface FormFieldSchema {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  validation?: z.ZodTypeAny;
  // Select/MultiSelect specific
  options?: Array<{ value: string; label: string }>;
  suggestions?: string[];
  // Textarea specific
  rows?: number;
  // Number specific
  min?: number;
  max?: number;
  step?: number;
  // DateRange specific
  fromName?: string;
  toName?: string;
  // File specific
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onUpload?: (files: File[]) => Promise<string[]>;
  // Layout
  className?: string;
  gridSpan?: number; // 1-12 for grid layout
}

export interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  fields: FormFieldSchema[];
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'two-column';
}

interface FormBuilderProps {
  schema: FormSchema;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

/**
 * Dynamic form builder that generates forms from JSON schemas
 * Perfect for CMS-driven forms and rapid prototyping
 */
export function FormBuilder({
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  className,
}: FormBuilderProps) {
  // Build Zod schema from field definitions
  const zodSchema = React.useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    schema.fields.forEach((field) => {
      if (field.validation) {
        shape[field.name] = field.validation;
      } else {
        // Auto-generate validation based on type
        let fieldSchema: z.ZodTypeAny;

        switch (field.type) {
          case 'email':
            fieldSchema = z.string().email('Invalid email address');
            break;
          case 'url':
            fieldSchema = z.string().url('Invalid URL');
            break;
          case 'number':
            fieldSchema = z.number();
            if (field.min !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).min(field.min);
            if (field.max !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).max(field.max);
            break;
          case 'checkbox':
            fieldSchema = z.boolean();
            break;
          case 'select':
          case 'multiselect':
            fieldSchema = field.type === 'multiselect' ? z.array(z.string()) : z.string();
            break;
          case 'date':
          case 'daterange':
            fieldSchema = z.string();
            break;
          case 'file':
            fieldSchema = field.multiple ? z.array(z.string()) : z.string().nullable();
            break;
          default:
            fieldSchema = z.string();
        }

        if (field.required && field.type !== 'checkbox') {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
        } else if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }

        shape[field.name] = fieldSchema;
      }
    });

    return z.object(shape);
  }, [schema.fields]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      ...schema.fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue ?? (
          field.type === 'checkbox' ? false :
          field.type === 'multiselect' ? [] :
          field.type === 'number' ? 0 :
          ''
        ),
      }), {}),
      ...defaultValues,
    },
  });

  // Render field based on type
  const renderField = (field: FormFieldSchema) => {
    const commonProps = {
      form: form as UseFormReturn<any>,
      name: field.name,
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      required: field.required,
      disabled: field.disabled,
      className: field.className,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'number':
        return <FormInput {...commonProps} type={field.type} />;
      
      case 'date':
        return <FormDatePicker {...commonProps} />;
      
      case 'select':
        return <FormSelect {...commonProps} options={field.options || []} />;
      
      case 'multiselect':
        return (
          <FormMultiSelect
            {...commonProps}
            suggestions={field.suggestions}
          />
        );
      
      case 'textarea':
        return <FormTextarea {...commonProps} rows={field.rows} />;
      
      case 'checkbox':
        return <FormCheckbox {...commonProps} />;
      
      case 'daterange':
        return (
          <FormDateRangePicker
            {...commonProps}
            fromName={field.fromName || `${field.name}From`}
            toName={field.toName || `${field.name}To`}
          />
        );
      
      case 'file':
        return (
          <FormFileUpload
            {...commonProps}
            accept={field.accept}
            maxSize={field.maxSize}
            multiple={field.multiple}
            onUpload={field.onUpload}
          />
        );
      
      default:
        return <FormInput {...commonProps} />;
    }
  };

  const gridClass = schema.layout === 'two-column' 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
    : 'space-y-4';

  return (
    <div className={className}>
      {schema.title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{schema.title}</h2>
          {schema.description && (
            <p className="text-muted-foreground mt-2">{schema.description}</p>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className={gridClass}>
            {schema.fields.map((field) => (
              <div
                key={field.name}
                className={
                  schema.layout === 'two-column' && field.gridSpan === 2
                    ? 'md:col-span-2'
                    : ''
                }
              >
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {schema.cancelLabel || 'Cancel'}
              </Button>
            )}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Submitting...'
                : schema.submitLabel || 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
