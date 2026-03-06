import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";
import { format as formatDate } from "date-fns";
import { cn } from "@/shared/lib/utils";

export type ExportType = 'opportunities' | 'commissions' | 'forecast';

interface ExportField {
  id: string;
  label: string;
  defaultSelected: boolean;
}

interface SalesExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  onExport: (config: ExportConfig) => void;
  totalRecords: number;
}

export interface ExportConfig {
  format: 'csv' | 'excel';
  fields: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const FIELD_CONFIGS: Record<ExportType, ExportField[]> = {
  opportunities: [
    { id: 'name', label: 'Opportunity Name', defaultSelected: true },
    { id: 'employerName', label: 'Employer', defaultSelected: true },
    { id: 'salesAgentName', label: 'Sales Agent', defaultSelected: true },
    { id: 'type', label: 'Type', defaultSelected: true },
    { id: 'productType', label: 'Product Type', defaultSelected: true },
    { id: 'estimatedValue', label: 'Estimated Value', defaultSelected: true },
    { id: 'probability', label: 'Probability', defaultSelected: true },
    { id: 'stage', label: 'Stage', defaultSelected: true },
    { id: 'priority', label: 'Priority', defaultSelected: false },
    { id: 'leadSource', label: 'Lead Source', defaultSelected: false },
    { id: 'expectedCloseDate', label: 'Expected Close Date', defaultSelected: true },
    { id: 'createdAt', label: 'Created Date', defaultSelected: false },
    { id: 'nextSteps', label: 'Next Steps', defaultSelected: false },
    { id: 'notes', label: 'Notes', defaultSelected: false },
  ],
  commissions: [
    { id: 'salesAgentName', label: 'Sales Agent', defaultSelected: true },
    { id: 'opportunityName', label: 'Opportunity', defaultSelected: true },
    { id: 'employerName', label: 'Employer', defaultSelected: true },
    { id: 'dealValue', label: 'Deal Value', defaultSelected: true },
    { id: 'commissionRate', label: 'Commission Rate', defaultSelected: true },
    { id: 'commissionAmount', label: 'Commission Amount', defaultSelected: true },
    { id: 'status', label: 'Status', defaultSelected: true },
    { id: 'calculatedAt', label: 'Calculated Date', defaultSelected: true },
    { id: 'approvedAt', label: 'Approved Date', defaultSelected: false },
    { id: 'paidAt', label: 'Paid Date', defaultSelected: false },
    { id: 'paymentMethod', label: 'Payment Method', defaultSelected: false },
    { id: 'notes', label: 'Notes', defaultSelected: false },
  ],
  forecast: [
    { id: 'name', label: 'Opportunity', defaultSelected: true },
    { id: 'employerName', label: 'Employer', defaultSelected: true },
    { id: 'salesAgentName', label: 'Sales Agent', defaultSelected: true },
    { id: 'estimatedValue', label: 'Estimated Value', defaultSelected: true },
    { id: 'weightedValue', label: 'Weighted Value', defaultSelected: true },
    { id: 'probability', label: 'Probability', defaultSelected: true },
    { id: 'stage', label: 'Stage', defaultSelected: true },
    { id: 'expectedCloseDate', label: 'Expected Close', defaultSelected: true },
    { id: 'priority', label: 'Priority', defaultSelected: false },
  ],
};

export function SalesExportDialog({
  open,
  onOpenChange,
  exportType,
  onExport,
  totalRecords,
}: SalesExportDialogProps) {
  const availableFields = FIELD_CONFIGS[exportType];
  
  const [format, setFormat] = useState<'csv' | 'excel'>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.filter(f => f.defaultSelected).map(f => f.id)
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const handleToggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields(availableFields.filter(f => f.defaultSelected).map(f => f.id));
    } else {
      setSelectedFields(availableFields.map(f => f.id));
    }
  };

  const handleClearDates = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleExport = () => {
    onExport({
      format,
      fields: selectedFields,
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    });
    onOpenChange(false);
  };

  const isAllSelected = selectedFields.length === availableFields.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
          <DialogDescription>
            Customize your export by selecting fields and date range
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'excel')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-blue-600" />
                  CSV (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Date Range Filter (Optional)</Label>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={handleClearDates}>
                  Clear dates
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-sm text-muted-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? formatDate(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-2">
                <Label className="text-sm text-muted-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? formatDate(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Fields to Export</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {isAllSelected ? 'Reset to defaults' : 'Select all'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg max-h-64 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleToggleField(field.id)}
                  />
                  <Label
                    htmlFor={field.id}
                    className="text-sm cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="text-sm font-medium">Export Summary</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Format: {format.toUpperCase()}</div>
              <div>• Fields: {selectedFields.length} of {availableFields.length} selected</div>
              <div>• Records: {totalRecords} total</div>
              {(dateFrom || dateTo) && (
                <div>
                  • Date range: {dateFrom ? formatDate(dateFrom, "MMM d, yyyy") : "Any"} to {dateTo ? formatDate(dateTo, "MMM d, yyyy") : "Any"}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedFields.length === 0}>
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
