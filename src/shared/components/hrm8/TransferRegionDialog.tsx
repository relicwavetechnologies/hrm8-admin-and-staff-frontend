/**
 * Transfer Region Dialog
 * Multi-step wizard for transferring region ownership to another licensee
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { licenseeService, RegionalLicensee } from '@/shared/services/hrm8/licenseeService';
import { regionService, Region } from '@/shared/services/hrm8/regionService';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Building2, Briefcase, Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';

interface TransferRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
  onSuccess: () => void;
}

type Step = 'select' | 'review' | 'confirm' | 'complete';

export function TransferRegionDialog({ open, onOpenChange, region, onSuccess }: TransferRegionDialogProps) {
  const [step, setStep] = useState<Step>('select');
  const [licensees, setLicensees] = useState<RegionalLicensee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLicensees, setLoadingLicensees] = useState(true);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [selectedLicenseeId, setSelectedLicenseeId] = useState<string>('');
  const [auditNote, setAuditNote] = useState('');
  const [impact, setImpact] = useState<{
    companies: number;
    jobs: number;
    consultants: number;
    openInvoices: number;
    opportunities: number;
  } | null>(null);
  const [transferResult, setTransferResult] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedLicenseeId('');
      setAuditNote('');
      setImpact(null);
      setTransferResult(null);
      loadLicensees();
    }
  }, [open]);

  const loadLicensees = async () => {
    try {
      setLoadingLicensees(true);
      const response = await licenseeService.getAll({ status: 'ACTIVE' });
      if (response.success && response.data?.licensees) {
        // Filter out current licensee if any
        const filteredLicensees = response.data.licensees.filter(
          (l) => l.id !== region?.licenseeId
        );
        setLicensees(filteredLicensees);
      }
    } catch (error) {
      toast.error('Failed to load licensees');
    } finally {
      setLoadingLicensees(false);
    }
  };

  const loadImpact = async () => {
    if (!region) return;
    try {
      setLoadingImpact(true);
      const response = await regionService.getTransferImpact(region.id);
      if (response.success && response.data) {
        setImpact(response.data);
      } else {
        // Fallback to mock data if API not ready
        setImpact({
          companies: 0,
          jobs: 0,
          consultants: 0,
          openInvoices: 0,
          opportunities: 0,
        });
      }
    } catch (error) {
      // Fallback for dev
      setImpact({
        companies: 0,
        jobs: 0,
        consultants: 0,
        openInvoices: 0,
        opportunities: 0,
      });
    } finally {
      setLoadingImpact(false);
    }
  };

  const handleNext = async () => {
    if (step === 'select') {
      await loadImpact();
      setStep('review');
    } else if (step === 'review') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'review') setStep('select');
    else if (step === 'confirm') setStep('review');
  };

  const handleTransfer = async () => {
    if (!region || !selectedLicenseeId) return;

    try {
      setLoading(true);
      const response = await regionService.transferOwnership(region.id, {
        targetLicenseeId: selectedLicenseeId,
        auditNote: auditNote || undefined,
      });

      if (response.success) {
        setTransferResult(response.data?.transferredCounts || {});
        setStep('complete');
        toast.success('Region ownership transferred successfully');
      } else {
        toast.error(response.error || 'Failed to transfer region');
      }
    } catch (error) {
      toast.error('Failed to transfer region ownership');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'complete') {
      onSuccess();
    }
    onOpenChange(false);
  };

  if (!region) return null;

  const selectedLicensee = licensees.find((l) => l.id === selectedLicenseeId);
  const currentOwner = region.ownerType === 'HRM8' ? 'HRM8 (Direct)' : region.licensee?.name || 'Unknown';
  const totalImpactItems = impact
    ? (impact.companies || 0) + (impact.jobs || 0) + (impact.consultants || 0) + (impact.openInvoices || 0) + (impact.opportunities || 0)
    : 0;

  const stepProgress = step === 'select' ? 25 : step === 'review' ? 50 : step === 'confirm' ? 75 : 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transfer Region Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer <strong>{region.name}</strong> to a different licensee
          </DialogDescription>
        </DialogHeader>

        <Progress value={stepProgress} className="h-1" />

        <div className="py-4 min-h-[300px]">
          {/* Step 1: Select Target Licensee */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Owner</Label>
                <div className="p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currentOwner}</div>
                    <div className="text-sm text-muted-foreground">
                      {region.ownerType === 'LICENSEE' && region.licensee?.email}
                    </div>
                  </div>
                  <Badge variant="secondary">{region.ownerType}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-licensee" className="text-sm font-medium">
                  Transfer To
                </Label>
                {loadingLicensees ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select value={selectedLicenseeId} onValueChange={setSelectedLicenseeId}>
                    <SelectTrigger id="target-licensee">
                      <SelectValue placeholder="Select target licensee" />
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
                    No other active licensees available for transfer.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review Impact */}
          {step === 'review' && (
            <div className="space-y-6">
              <Alert variant="default" className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Transfer Impact</AlertTitle>
                <AlertDescription className="text-amber-700">
                  The following entities will be transferred to {selectedLicensee?.name}
                </AlertDescription>
              </Alert>

              {loadingImpact ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : impact ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{impact.companies}</div>
                          <div className="text-sm text-muted-foreground">Companies</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{impact.jobs}</div>
                          <div className="text-sm text-muted-foreground">Open Jobs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="text-2xl font-bold">{impact.consultants}</div>
                          <div className="text-sm text-muted-foreground">Consultants</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-orange-500" />
                        <div>
                          <div className="text-2xl font-bold">{impact.openInvoices || 0}</div>
                          <div className="text-sm text-muted-foreground">Open Invoices</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              <div className="text-center text-sm text-muted-foreground">
                Total: <strong>{totalImpactItems}</strong> entities will be transferred
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Confirm Transfer</AlertTitle>
                <AlertDescription>
                  This action will transfer all {totalImpactItems} entities from{' '}
                  <strong>{currentOwner}</strong> to <strong>{selectedLicensee?.name}</strong>.
                  This action is logged and can be audited.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="audit-note">Audit Note (Optional)</Label>
                <Textarea
                  id="audit-note"
                  placeholder="Reason for transfer, approvals, etc."
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">{currentOwner}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{selectedLicensee?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entities:</span>
                  <span className="font-medium">{totalImpactItems}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Transfer Complete</h3>
                <p className="text-muted-foreground">
                  Region ownership has been successfully transferred to {selectedLicensee?.name}
                </p>
              </div>
              {transferResult && Object.keys(transferResult).length > 0 && (
                <div className="p-4 border rounded-lg bg-muted/30 text-left">
                  <div className="text-sm font-medium mb-2">Transferred:</div>
                  {Object.entries(transferResult).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {step !== 'complete' && step !== 'select' && (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              {step === 'complete' ? 'Close' : 'Cancel'}
            </Button>
            {step === 'select' && (
              <Button onClick={handleNext} disabled={!selectedLicenseeId || loadingLicensees}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 'review' && (
              <Button onClick={handleNext} disabled={loadingImpact}>
                Continue to Confirm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 'confirm' && (
              <Button onClick={handleTransfer} disabled={loading} variant="destructive">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  'Confirm Transfer'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
