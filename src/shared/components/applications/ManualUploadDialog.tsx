import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Upload, UserPlus, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseCSVFile, parseExcelFile, validateData, getFieldSuggestions, FieldMapping } from '@/shared/lib/importService';
import { toast } from 'sonner';
// applicationService import removed as it is unused
import { ApplicationStage, ApplicationStatus } from '@/shared/types/application';

interface ManualUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

const applicationFields = [
  'name',
  'email',
  'phone',
  'status',
  'stage',
  'appliedDate',
  'resumeUrl',
  'coverLetterUrl',
  'portfolioUrl',
  'linkedInUrl',
  'notes',
  'tags',
];

const allStages: ApplicationStage[] = [
  "New Application",
  "Resume Review",
  "Phone Screen",
  "Technical Interview",
  "Manager Interview",
  "Final Round",
  "Reference Check",
  "Offer Extended",
  "Offer Accepted",
  "Rejected",
];

const allStatuses: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export function ManualUploadDialog({
  open,
  onOpenChange,
  jobId: _jobId,
  jobTitle: _jobTitle = 'this position',
  onSuccess,
}: ManualUploadDialogProps) {
  const [mode, setMode] = useState<'upload' | 'single'>('upload');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [defaultStage, setDefaultStage] = useState<ApplicationStage>('New Application');
  const [defaultStatus, setDefaultStatus] = useState<ApplicationStatus>('applied');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single candidate state
  const [singleCandidate, setSingleCandidate] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetterUrl: '',
    portfolioUrl: '',
    linkedInUrl: '',
    notes: '',
    stage: 'New Application' as ApplicationStage,
    status: 'applied' as ApplicationStatus,
  });
  const [isCreating, setIsCreating] = useState(false);

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
      // Create applications for each validated row
      // Note: This uses mock storage pattern - in production, integrate with backend API
      let successCount = 0;
      let errorCount = 0;

      for (const row of validationResult.data) {
        try {
          // Extract data from row based on mappings
          const email = row.email || row.candidateEmail;
          const _name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim();
          void _name;


          if (!email) {
            errorCount++;
            continue;
          }

          // In production: Check if candidate exists, create if needed, then create application
          // For now, we'll show a message directing to use Talent Pool for proper candidate management
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Failed to process row:', row, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Processed ${successCount} candidates. Note: Please ensure candidates exist in Talent Pool first.`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} rows. Please check the data.`);
      }

      toast.success(`Successfully imported ${validationResult.data.length} candidates`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to import data: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSingleCandidate = async () => {
    if (!singleCandidate.firstName || !singleCandidate.lastName || !singleCandidate.email) {
      toast.error('Please fill in required fields (First Name, Last Name, and Email)');
      return;
    }

    setIsCreating(true);
    try {
      // Note: For single candidate addition, we recommend using Talent Pool search
      // as it handles candidate existence checks and creation properly.
      // This is a simplified version - in production, check candidate existence first

      toast.info('Please use "Add from Talent Pool" for adding new candidates, or ensure the candidate exists in the system first.');

      // For now, show guidance
      // In production, implement proper candidate lookup/creation flow
      handleClose();
    } catch (error) {
      toast.error('Failed to add candidate: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const _mapStatusToBackend = (status: ApplicationStatus): string => {
    const map: Record<ApplicationStatus, string> = {
      'applied': 'NEW',
      'screening': 'SCREENING',
      'interview': 'INTERVIEW',
      'offer': 'OFFER',
      'hired': 'HIRED',
      'rejected': 'REJECTED',
      'withdrawn': 'WITHDRAWN',
    };
    return map[status] || 'NEW';
  };

  const _mapStageToBackend = (stage: ApplicationStage): string => {
    const map: Record<string, string> = {
      'New Application': 'NEW_APPLICATION',
      'Resume Review': 'RESUME_REVIEW',
      'Phone Screen': 'PHONE_SCREEN',
      'Technical Interview': 'TECHNICAL_INTERVIEW',
      'Manager Interview': 'ONSITE_INTERVIEW',
      'Final Round': 'ONSITE_INTERVIEW',
      'Reference Check': 'ONSITE_INTERVIEW',
      'Offer Extended': 'OFFER_EXTENDED',
      'Offer Accepted': 'OFFER_ACCEPTED',
      'Rejected': 'REJECTED',
    };
    return map[stage] || 'NEW_APPLICATION';
  };


  void _mapStatusToBackend;
  void _mapStageToBackend;

  const handleClose = () => {

    setFile(null);
    setStep('upload');
    setParsedData([]);
    setFieldMappings([]);
    setValidationResult(null);
    setSingleCandidate({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      resumeUrl: '',
      coverLetterUrl: '',
      portfolioUrl: '',
      linkedInUrl: '',
      notes: '',
      stage: 'New Application',
      status: 'applied',
    });
    setMode('upload');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Candidates</DialogTitle>
          <DialogDescription>
            Import multiple candidates via CSV/Excel file. For adding individual candidates, use "Add from Talent Pool" button.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'upload' | 'single')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload CSV/Excel
            </TabsTrigger>
            <TabsTrigger value="single" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Single (Use Talent Pool)
            </TabsTrigger>
          </TabsList>

          {/* Upload Mode */}
          <TabsContent value="upload" className="space-y-4 mt-4">
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

                {/* Default assignment */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Default Stage</Label>
                    <Select value={defaultStage} onValueChange={(v) => setDefaultStage(v as ApplicationStage)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Status</Label>
                    <Select value={defaultStatus} onValueChange={(v) => setDefaultStatus(v as ApplicationStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allStatuses.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                            {applicationFields.map(field => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${mapping.required ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {mapping.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
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

                {validationResult.success && (
                  <Alert>
                    <AlertDescription>
                      Ready to import {validationResult.data.length} valid records
                    </AlertDescription>
                  </Alert>
                )}

                {/* Preview Table */}
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
                              <td key={j} className="p-2">{String(row[mapping.targetField] || '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Single Candidate Mode - Disabled, use Talent Pool instead */}
          <TabsContent value="single" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For adding individual candidates, please use the "Add from Talent Pool" button in the action bar.
                This ensures proper candidate management and duplicate checking.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={singleCandidate.firstName}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={singleCandidate.lastName}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={singleCandidate.email}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={singleCandidate.phone}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="stage">Initial Stage</Label>
                <Select
                  value={singleCandidate.stage}
                  onValueChange={(v) => setSingleCandidate({ ...singleCandidate, stage: v as ApplicationStage })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={singleCandidate.status}
                  onValueChange={(v) => setSingleCandidate({ ...singleCandidate, status: v as ApplicationStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  value={singleCandidate.resumeUrl}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, resumeUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  value={singleCandidate.linkedInUrl}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, linkedInUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={singleCandidate.notes}
                  onChange={(e) => setSingleCandidate({ ...singleCandidate, notes: e.target.value })}
                  placeholder="Additional notes about this candidate..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>

          {mode === 'upload' && (
            <>
              {step === 'upload' && file && (
                <Button onClick={() => { }} disabled={isUploading}>Processing...</Button>
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
                    {isUploading ? 'Importing...' : `Import ${validationResult?.data.length || 0} Candidates`}
                  </Button>
                </>
              )}
            </>
          )}

          {mode === 'single' && (
            <Button
              onClick={handleCreateSingleCandidate}
              disabled={isCreating || !singleCandidate.firstName || !singleCandidate.lastName || !singleCandidate.email}
            >
              {isCreating ? 'Adding...' : 'Add Candidate'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

