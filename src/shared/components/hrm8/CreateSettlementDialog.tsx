
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { settlementService, Settlement } from "@/shared/services/hrm8/settlementService";
import { licenseeService, RegionalLicensee } from "@/shared/services/hrm8/licenseeService";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";

interface CreateSettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSettlementDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSettlementDialogProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [licensees, setLicensees] = useState<RegionalLicensee[]>([]);
  const [loadingLicensees, setLoadingLicensees] = useState(false);
  
  // Form State
  const [selectedLicenseeId, setSelectedLicenseeId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [periodEnd, setPeriodEnd] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSettlement, setPreviewSettlement] = useState<Settlement | null>(null);

  useEffect(() => {
    if (open) {
      loadLicensees();
      setError(null);
      setPreviewSettlement(null);
    }
  }, [open]);

  const loadLicensees = async () => {
    try {
      setLoadingLicensees(true);
      const response = await licenseeService.getAll({ status: 'ACTIVE' });
      if (response.success && response.data?.licensees) {
        setLicensees(response.data.licensees);
      }
    } catch (error) {
      console.error("Failed to load licensees:", error);
      toast({
        title: "Error",
        description: "Failed to load licensees list.",
        variant: "destructive",
      });
    } finally {
      setLoadingLicensees(false);
    }
  };

  const handleGeneratePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLicenseeId) {
      setError("Please select a licensee.");
      return;
    }

    if (!periodStart || !periodEnd) {
      setError("Please select the period range.");
      return;
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
      setError("Start date cannot be after end date.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Generate Preview (commit: false implied or explicit)
      const response = await settlementService.calculate({
        licensee_id: selectedLicenseeId,
        period_start: periodStart,
        period_end: periodEnd,
        commit: false
      });

      if (!response.success || !response.data?.settlement) {
        throw new Error(response.error || "Failed to generate settlement preview.");
      }

      setPreviewSettlement(response.data.settlement);
    } catch (err: any) {
      setError(err?.message || "Unexpected error during settlement generation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommit = async () => {
    if (!previewSettlement) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
        // Step 2: Commit (Save)
        const response = await settlementService.calculate({
            licensee_id: selectedLicenseeId,
            period_start: periodStart,
            period_end: periodEnd,
            commit: true
        });

        if (!response.success) {
            throw new Error(response.error || "Failed to save settlement.");
        }

        toast({
            title: "Settlement Created",
            description: "The settlement has been committed successfully.",
        });

        onSuccess?.();
        onOpenChange(false);
        setPreviewSettlement(null);
        setSelectedLicenseeId("");
    } catch (err: any) {
        setError(err?.message || "Failed to commit settlement.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleReset = () => {
      setPreviewSettlement(null);
      setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate New Settlement</DialogTitle>
            <DialogDescription>
              Calculate revenue share for a specific period and create a settlement record.
            </DialogDescription>
          </DialogHeader>

          {previewSettlement ? (
            <div className="space-y-6 py-4">
                 <div className="p-4 bg-muted/50 rounded-lg space-y-3 border">
                    <h3 className="font-semibold flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Preview Generated
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total Revenue:</span>
                            <div className="font-medium text-lg">{formatCurrency(previewSettlement.total_revenue)}</div>
                        </div>
                        <div>
                             {/* Placeholder for bill count if available in backend response, currently not in type but good to have */}
                             {/* <span className="text-muted-foreground">Transactions:</span>
                             <div className="font-medium">{previewSettlement.billCount}</div> */}
                        </div>
                    </div>
                    <div className="pt-2 border-t grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-muted-foreground">Licensee Share:</span>
                            <div className="font-bold text-green-700 text-lg">{formatCurrency(previewSettlement.licensee_share)}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">HRM8 Share:</span>
                             <div className="font-medium text-lg">{formatCurrency(previewSettlement.hrm8_share)}</div>
                        </div>
                    </div>
                 </div>
                 
                 <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Confirmation Required</AlertTitle>
                    <AlertDescription>
                        Review the figures above. Clicking "Commit Settlement" will save this record effectively finalizing the payout for this period.
                    </AlertDescription>
                </Alert>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
                        Back to Filters
                    </Button>
                    <Button onClick={handleCommit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Commit Settlement
                    </Button>
                </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleGeneratePreview}>
              <div className="space-y-6 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="licensee">Regional Licensee</Label>
                  <Select 
                    value={selectedLicenseeId} 
                    onValueChange={setSelectedLicenseeId}
                    disabled={loadingLicensees || isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingLicensees ? "Loading..." : "Select a licensee"} />
                    </SelectTrigger>
                    <SelectContent>
                      {licensees.map((licensee) => (
                        <SelectItem key={licensee.id} value={licensee.id}>
                          {licensee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period-start">Period Start</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period-end">Period End</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <p>Clicking <strong>Generate Preview</strong> will calculate the potential settlement based on current data without saving it.</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Preview <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )} 
      </DialogContent>
    </Dialog>
  );
}

