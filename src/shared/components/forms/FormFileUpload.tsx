import React, { useRef, useState } from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Upload, X, File } from 'lucide-react';


interface FormFileUploadProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  onUpload?: (files: File[]) => Promise<string[]>; // Returns URLs
}

export function FormFileUpload<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  required,
  accept,
  maxSize = 5,
  multiple = false,
  onUpload,
}: FormFileUploadProps<TFieldValues>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const files = form.watch(name) || (multiple ? [] : null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError(null);

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > maxSize * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(`Files must be less than ${maxSize}MB`);
      return;
    }

    if (onUpload) {
      try {
        setUploading(true);
        const urls = await onUpload(selectedFiles);

        if (multiple) {
          const currentFiles = Array.isArray(files) ? files : [];
          form.setValue(name, [...currentFiles, ...urls] as any, { shouldValidate: true });
        } else {
          form.setValue(name, urls[0] as any, { shouldValidate: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    } else {
      // Store file names if no upload handler
      const fileNames = selectedFiles.map((f) => f.name);
      if (multiple) {
        const currentFiles = Array.isArray(files) ? files : [];
        form.setValue(name, [...currentFiles, ...fileNames] as any, { shouldValidate: true });
      } else {
        form.setValue(name, fileNames[0] as any, { shouldValidate: true });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index?: number) => {
    if (multiple && typeof index === 'number') {
      const currentFiles = Array.isArray(files) ? files : [];
      form.setValue(
        name,
        currentFiles.filter((_, i) => i !== index) as any,
        { shouldValidate: true }
      );
    } else {
      form.setValue(name, null as any, { shouldValidate: true });
    }
  };

  const displayFiles = (multiple ? (Array.isArray(files) ? files : []) : (files ? [files] : [])) as unknown as string[];

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Choose files'}
              </Button>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {displayFiles.length > 0 && (
                <div className="space-y-2">
                  {displayFiles.map((fileName: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{fileName}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(multiple ? index : undefined)}
                        disabled={disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
