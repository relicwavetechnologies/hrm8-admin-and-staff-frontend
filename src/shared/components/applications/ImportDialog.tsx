import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X as _X } from 'lucide-react';
import { parseCSVFile, parseExcelFile, validateData, getFieldSuggestions, FieldMapping } from '@/shared/lib/importService';
import { toast } from 'sonner';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
  requiredFields: string[];
}

export function ImportDialog({ open, onOpenChange, onImport, requiredFields }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error('Please select a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      let data: any[];
      if (fileExtension === 'csv') {
        data = await parseCSVFile(selectedFile);
      } else {
        data = await parseExcelFile(selectedFile);
      }

      setParsedData(data);

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const suggestedMappings = getFieldSuggestions(headers);
        setFieldMappings(suggestedMappings);
        setStep('mapping');
      }
    } catch (error) {
      toast.error('Failed to parse file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
    const newMappings = [...fieldMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setFieldMappings(newMappings);
  };

  const handleValidate = () => {
    const result = validateData(parsedData, fieldMappings);
    setValidationResult(result);
    if (result.success) {
      setStep('preview');
    } else {
      toast.error(`Found ${result.errors.length} errors. Please review.`);
    }
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.success) {
      toast.error('Please fix validation errors first');
      return;
    }

    setIsUploading(true);
    try {
      await onImport(validationResult.data);
      toast.success(`Successfully imported ${validationResult.data.length} records`);
      handleClose();
    } catch (error) {
      toast.error('Failed to import data: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setParsedData([]);
    setFieldMappings([]);
    setValidationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV or Excel file to import data'}
            {step === 'mapping' && 'Map your file columns to fields'}
            {step === 'preview' && 'Review and confirm import'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Click to upload CSV or Excel file</p>
                  <p className="text-xs text-muted-foreground">
                    or drag and drop
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Found {parsedData.length} rows. Map the columns from your file to the application fields.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {fieldMappings.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Source Column</Label>
                      <p className="font-medium">{mapping.sourceField}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Target Field</Label>
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => handleMappingChange(index, 'targetField', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {requiredFields.map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={mapping.required ? 'default' : 'secondary'}>
                        {mapping.required ? 'Required' : 'Optional'}
                      </Badge>
                      <Badge variant="outline">{mapping.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview & Validation */}
          {step === 'preview' && validationResult && (
            <div className="space-y-4">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Found {validationResult.errors.length} errors:</div>
                    <ul className="list-disc list-inside max-h-32 overflow-y-auto text-sm">
                      {validationResult.errors.slice(0, 10).map((error: any, i: number) => (
                        <li key={i}>Row {error.row}: {error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">{validationResult.warnings.length} warnings:</div>
                    <ul className="list-disc list-inside max-h-32 overflow-y-auto text-sm">
                      {validationResult.warnings.slice(0, 5).map((warning: any, i: number) => (
                        <li key={i}>Row {warning.row}: {warning.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    Ready to import {validationResult.data.length} valid records
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Data */}
              <div className="border rounded-lg p-4 max-h-[300px] overflow-auto">
                <h4 className="font-medium mb-3">Preview (first 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {fieldMappings.slice(0, 5).map((mapping, i) => (
                          <th key={i} className="text-left p-2 font-medium">{mapping.targetField}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.data.slice(0, 5).map((row: any, i: number) => (
                        <tr key={i} className="border-b">
                          {fieldMappings.slice(0, 5).map((mapping, j) => (
                            <td key={j} className="p-2">{row[mapping.targetField]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleValidate}>Validate & Preview</Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
              <Button
                onClick={handleImport}
                disabled={!validationResult?.success || isUploading}
              >
                {isUploading ? 'Importing...' : `Import ${validationResult?.data.length || 0} Records`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
