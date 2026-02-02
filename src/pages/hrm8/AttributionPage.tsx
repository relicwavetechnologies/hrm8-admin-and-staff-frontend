/**
 * Attribution Management Page
 * HRM8 Admin page for managing sales agent attribution on companies
 */

import { useState } from 'react';
import { billingApiService, AttributionData, AttributionHistoryEntry } from '@/shared/services/hrm8/billingApiService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Lock, 
  Unlock, 
  UserCheck, 
  History, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { isValid, parseISO } from 'date-fns';

// Safe date format helper
const safeFormatDate = (dateStr: string | null | undefined, formatStr: string = 'MMM dd, yyyy HH:mm'): string => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr);
  } catch {
    return '-';
  }
};

export default function AttributionPage() {
  const [companyId, setCompanyId] = useState('');
  const [attribution, setAttribution] = useState<AttributionData | null>(null);
  const [history, setHistory] = useState<AttributionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Override dialog state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [newConsultantId, setNewConsultantId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const handleSearch = async () => {
    if (!companyId.trim()) {
      toast.error('Please enter a Company ID');
      return;
    }

    setLoading(true);
    try {
      const response = await billingApiService.getAttribution(companyId);
      if (response.success && response.data?.attribution) {
        setAttribution(response.data.attribution);
        toast.success('Attribution data loaded');
        // Load history too
        loadHistory();
      } else {
        toast.error(response.error || 'Company not found');
        setAttribution(null);
      }
    } catch (error) {
      toast.error('Failed to load attribution data');
      setAttribution(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!companyId) return;
    
    setHistoryLoading(true);
    try {
      const response = await billingApiService.getAttributionHistory(companyId);
      if (response.success && response.data?.history) {
        setHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLock = async () => {
    if (!companyId) return;
    
    try {
      const response = await billingApiService.lockAttribution(companyId);
      if (response.success) {
        toast.success('Attribution locked successfully');
        handleSearch(); // Refresh data
      } else {
        toast.error(response.error || 'Failed to lock attribution');
      }
    } catch (error) {
      toast.error('Failed to lock attribution');
    }
  };

  const handleOverride = async () => {
    if (!newConsultantId.trim()) {
      toast.error('Please enter a Consultant ID');
      return;
    }
    if (!overrideReason.trim()) {
      toast.error('Please provide a reason for the override');
      return;
    }

    try {
      const response = await billingApiService.overrideAttribution(
        companyId,
        newConsultantId,
        overrideReason
      );
      if (response.success) {
        toast.success('Attribution overridden successfully');
        setOverrideDialogOpen(false);
        setNewConsultantId('');
        setOverrideReason('');
        handleSearch(); // Refresh data
      } else {
        toast.error(response.error || 'Failed to override attribution');
      }
    } catch (error) {
      toast.error('Failed to override attribution');
    }
  };

  return (
    <Hrm8PageLayout
      title="Attribution Management"
      subtitle="Manage sales agent attribution for companies"
    >
      <div className="p-6 space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lookup Company Attribution
            </CardTitle>
            <CardDescription>
              Enter a Company ID to view and manage its sales attribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter Company ID..."
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attribution Details */}
        {attribution && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Attribution Details
                </span>
                <Badge 
                  variant={attribution.attributionLocked ? "default" : "outline"}
                  className={attribution.attributionLocked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {attribution.attributionLocked ? (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlocked
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Company ID</Label>
                  <p className="font-mono text-sm">{attribution.companyId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sales Agent ID</Label>
                  <p className="font-mono text-sm">{attribution.salesAgentId || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referred By</Label>
                  <p className="font-mono text-sm">{attribution.referredBy || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-mono text-sm">{attribution.createdBy || 'Unknown'}</p>
                </div>
                {attribution.attributionLockedAt && (
                  <div>
                    <Label className="text-muted-foreground">Locked At</Label>
                    <p className="text-sm">
                      {safeFormatDate(attribution.attributionLockedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {!attribution.attributionLocked && (
                  <Button onClick={handleLock} variant="default">
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Attribution
                  </Button>
                )}
                <Button 
                  onClick={() => setOverrideDialogOpen(true)} 
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Override Attribution
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attribution History */}
        {attribution && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Attribution History
              </CardTitle>
              <CardDescription>
                Audit trail of attribution changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p className="text-center py-4 text-muted-foreground">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No attribution changes recorded</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="mt-1">
                        {entry.attachments?.action === 'LOCKED' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.subject}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {safeFormatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Override Dialog */}
        <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Override Attribution
              </DialogTitle>
              <DialogDescription>
                This action will change the sales agent attribution for this company. 
                This is an audited action and requires a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>New Consultant ID</Label>
                <Input
                  placeholder="Enter consultant ID..."
                  value={newConsultantId}
                  onChange={(e) => setNewConsultantId(e.target.value)}
                />
              </div>
              <div>
                <Label>Reason for Override</Label>
                <Textarea
                  placeholder="Enter the reason for this change..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleOverride} className="bg-orange-600 hover:bg-orange-700">
                Confirm Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Hrm8PageLayout>
  );
}
