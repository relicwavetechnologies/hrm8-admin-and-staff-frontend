import React, { useCallback, useState } from 'react';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const validateFiles = (files: File[]): boolean => {
    setError('');
    
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    if (validateFiles(fileArray)) {
      setSelectedFiles(fileArray);
      onFilesSelected(fileArray);
    }
  }, [onFilesSelected, maxSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            {accept || 'All files'} • Max {Math.round(maxSize / 1024 / 1024)}MB • Up to {maxFiles} files
          </p>
        </label>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30"
            >
              <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFile(index)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}