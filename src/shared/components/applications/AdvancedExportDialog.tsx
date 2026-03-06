import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText, FileSpreadsheet, File, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, selectedFields: string[]) => void;
  availableFields: string[];
  totalRecords: number;
}

export function AdvancedExportDialog({ 
  open, 
  onOpenChange, 
  onExport,
  availableFields,
  totalRecords
}: AdvancedExportDialogProps) {
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(availableFields);
  const [useTemplate, setUseTemplate] = useState<string | null>(null);

  const exportTemplates = [
    {
      id: 'basic',
      name: 'Basic Info',
      fields: ['name', 'email', 'status', 'appliedDate'],
    },
    {
      id: 'full',
      name: 'Full Details',
      fields: availableFields,
    },
    {
      id: 'recruiter',
      name: 'Recruiter Report',
      fields: ['name', 'email', 'phone', 'status', 'score', 'appliedDate', 'notes'],
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = exportTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedFields(template.fields.filter(f => availableFields.includes(f)));
      setUseTemplate(templateId);
    }
  };

  const handleFieldToggle = (field: string) => {
    setUseTemplate(null); // Clear template selection when manually changing fields
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(availableFields);
    setUseTemplate(null);
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
    setUseTemplate(null);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    onExport(format, selectedFields);
    toast.success(`Exporting ${totalRecords} records as ${format.toUpperCase()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Export</DialogTitle>
          <DialogDescription>
            Customize your export with specific fields and format. Exporting {totalRecords} records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  CSV (Comma-separated values)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="excel" className="flex-1 cursor-pointer">
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                  PDF Document
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="json" id="json" />
                <File className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Templates */}
          <div className="space-y-3">
            <Label>Quick Templates</Label>
            <div className="flex gap-2">
              {exportTemplates.map(template => (
                <Button
                  key={template.id}
                  variant={useTemplate === template.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Fields to Export</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg max-h-[300px] overflow-y-auto">
              {availableFields.map(field => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label
                    htmlFor={field}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedFields.length} of {availableFields.length} fields selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export {totalRecords} Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
