/**
 * Assign Licensee Dialog
 * Dialog for assigning/unassigning licensees to regions
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { licenseeService, RegionalLicensee } from '@/shared/lib/hrm8/licenseeService';
import { regionService, Region } from '@/shared/lib/hrm8/regionService';
import { toast } from 'sonner';
import { Loader2, Building2, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface AssignLicenseeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
  onSuccess: () => void;
}

export function AssignLicenseeDialog({ open, onOpenChange, region, onSuccess }: AssignLicenseeDialogProps) {
  const [licensees, setLicensees] = useState<RegionalLicensee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLicensees, setLoadingLicensees] = useState(true);
  const [selectedLicenseeId, setSelectedLicenseeId] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadLicensees();
      if (region?.licenseeId) {
        setSelectedLicenseeId(region.licenseeId);
      } else {
        setSelectedLicenseeId('');
      }
    }
  }, [open, region]);

  const loadLicensees = async () => {
    try {
      setLoadingLicensees(true);
      const response = await licenseeService.getAll({ status: 'ACTIVE' });
      if (response.success && response.data?.licensees) {
        setLicensees(response.data.licensees);
      }
    } catch (error) {
      toast.error('Failed to load licensees');
    } finally {
      setLoadingLicensees(false);
    }
  };

  const handleAssign = async () => {
    if (!region || !selectedLicenseeId) return;

    try {
      setLoading(true);
      const response = await regionService.assignLicensee(region.id, selectedLicenseeId);
      if (response.success) {
        toast.success('Licensee assigned successfully');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.error || 'Failed to assign licensee');
      }
    } catch (error) {
      toast.error('Failed to assign licensee');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!region) return;

    try {
      setLoading(true);
      const response = await regionService.unassignLicensee(region.id);
      if (response.success) {
        toast.success('Licensee unassigned successfully');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.error || 'Failed to unassign licensee');
      }
    } catch (error) {
      toast.error('Failed to unassign licensee');
    } finally {
      setLoading(false);
    }
  };

  if (!region) return null;

  // const currentLicensee = licensees.find(l => l.id === region.licenseeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Manage Licensee Assignment
          </DialogTitle>
          <DialogDescription>
            Assign or unassign a regional licensee to <strong>{region.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Assignment */}
          {region.licensee && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Licensee</Label>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">{region.licensee.name}</div>
                  <div className="text-sm text-muted-foreground">{region.licensee.legalEntityName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{region.licensee.email}</div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  Assigned
                </Badge>
              </div>
            </div>
          )}

          {!region.licensee && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Licensee</Label>
              <div className="p-3 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                No licensee assigned
              </div>
            </div>
          )}

          {/* Assign New Licensee */}
          <div className="space-y-2">
            <Label htmlFor="licensee" className="text-sm font-medium">
              {region.licensee ? 'Change Licensee' : 'Select Licensee'}
            </Label>
            {loadingLicensees ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedLicenseeId}
                onValueChange={setSelectedLicenseeId}
                disabled={loading}
              >
                <SelectTrigger id="licensee">
                  <SelectValue placeholder="Select a licensee" />
                </SelectTrigger>
                <SelectContent>
                  {licensees.map((licensee) => (
                    <SelectItem key={licensee.id} value={licensee.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{licensee.name}</span>
                        <span className="text-xs text-muted-foreground">{licensee.legalEntityName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {licensees.length === 0 && !loadingLicensees && (
              <p className="text-xs text-muted-foreground">
                No active licensees available. Create a licensee first.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {region.licensee && (
              <Button
                variant="outline"
                onClick={handleUnassign}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unassigning...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Unassign Licensee
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={loading || !selectedLicenseeId || selectedLicenseeId === region.licenseeId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  {region.licensee ? 'Change Licensee' : 'Assign Licensee'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



