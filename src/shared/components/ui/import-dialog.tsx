import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
  title: string;
  description?: string;
  sampleHeaders?: string[];
}

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  title,
  description,
  sampleHeaders = [],
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        throw new Error('No data found in CSV file');
      }

      await onImport(data);
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setFile(null);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
      setFile(null);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || 'Upload a CSV file to import data'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {sampleHeaders.length > 0 && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Expected CSV headers:</span>
                <br />
                <code className="text-xs">{sampleHeaders.join(', ')}</code>
              </AlertDescription>
            </Alert>
          )}

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {file ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Click to upload CSV file</p>
                <p className="text-xs text-muted-foreground">
                  or drag and drop
                </p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Import successful!</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isUploading || success}
          >
            {isUploading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
