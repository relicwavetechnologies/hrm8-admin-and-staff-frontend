
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Loader2, /* Plus, */ AlertCircle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { settlementService } from "@/shared/lib/hrm8/settlementService";
import { licenseeService, RegionalLicensee } from "@/shared/lib/hrm8/licenseeService";
import { startOfMonth, endOfMonth, format } from "date-fns";

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

  useEffect(() => {
    if (open) {
      loadLicensees();
      setError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await settlementService.calculate({
        licenseeId: selectedLicenseeId,
        periodStart,
        periodEnd,
      });

      if (!response.success) {
        // Handle specific error messages from backend
        const errorMessage = response.error || "Failed to generate settlement.";
        setError(errorMessage);
        return;
      }

      toast({
        title: "Settlement Generated",
        description: "The settlement has been calculated and created successfully.",
      });

      // Reset form
      setSelectedLicenseeId("");
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Unexpected error during settlement generation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generate New Settlement</DialogTitle>
            <DialogDescription>
              Calculate revenue share for a specific period and create a settlement record.
            </DialogDescription>
          </DialogHeader>

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
              <p>Note: This will aggregate all <strong>Confirmed</strong> revenue for the selected period and calculate the revenue split.</p>
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
              {isSubmitting ? "Generating..." : "Generate Settlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
