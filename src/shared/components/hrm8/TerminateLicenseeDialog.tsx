import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { RegionalLicensee, licenseeService } from "@/shared/lib/hrm8/licenseeService";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/lib/utils";

interface TerminateLicenseeDialogProps {
  licensee: RegionalLicensee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TerminateLicenseeDialog({
  licensee,
  open,
  onOpenChange,
  onSuccess,
}: TerminateLicenseeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [impactData, setImpactData] = useState<{
    regions: number;
    activeJobs: number;
    consultants: number;
    pendingRevenue: number;
  } | null>(null);

  useEffect(() => {
    if (open && licensee) {
      loadImpactPreview();
    } else {
      setImpactData(null);
    }
  }, [open, licensee]);

  const loadImpactPreview = async () => {
    if (!licensee) return;
    try {
      setLoading(true);
      const response = await licenseeService.getImpactPreview(licensee.id);
      if (response.success && response.data) {
        setImpactData(response.data);
      }
    } catch (error) {
      console.error("Failed to load impact preview:", error);
      toast.error("Failed to load termination impact data");
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!licensee) return;
    
    try {
      setTerminating(true);
      const response = await licenseeService.terminate(licensee.id);
      
      if (response.success) {
        toast.success(`Licensee ${licensee.name} terminated successfully`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to terminate licensee");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during termination");
    } finally {
      setTerminating(false);
    }
  };

  if (!licensee) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Terminate Licensee
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to permanently terminate <strong>{licensee.name}</strong>?
              This action <strong>cannot be undone</strong>.
            </p>

            <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-destructive mb-2">
                <AlertTriangle className="h-4 w-4" />
                Impact Analysis
              </div>
              
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing impact...
                </div>
              ) : impactData ? (
                <ul className="space-y-1 text-destructive/90">
                  <li className="flex justify-between">
                    <span>Regions to unassign:</span>
                    <span className="font-medium">{impactData.regions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Active jobs to pause:</span>
                    <span className="font-medium">{impactData.activeJobs}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Active Consultants:</span>
                    <span className="font-medium">{impactData.consultants}</span>
                  </li>
                  {impactData.pendingRevenue > 0 && (
                    <li className="flex justify-between border-t border-destructive/20 pt-1 mt-1 font-semibold">
                      <span>Pending Revenue Settlement:</span>
                      <span>{formatCurrency(impactData.pendingRevenue)}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-muted-foreground">No impact data available.</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              By proceeding, all access for this licensee and their staff will be revoked immediately.
              Outstanding revenues will be flagged for final settlement.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={terminating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleTerminate();
            }}
            disabled={terminating || loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {terminating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Terminating...
              </>
            ) : (
              "Confirm Termination"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
