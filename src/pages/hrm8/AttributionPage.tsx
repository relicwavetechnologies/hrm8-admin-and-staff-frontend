/**
 * Attribution Management Page
 * HRM8 Admin page for managing sales agent attribution on companies
 */

import { useEffect, useState } from 'react';
import { billingApiService, AttributionData, AttributionCompanySearchResult, AttributionHistoryEntry } from '@/shared/services/hrm8/billingApiService';
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
  const [companyQuery, setCompanyQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<AttributionCompanySearchResult | null>(null);
  const [companyResults, setCompanyResults] = useState<AttributionCompanySearchResult[]>([]);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [attribution, setAttribution] = useState<AttributionData | null>(null);
  const [history, setHistory] = useState<AttributionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Override dialog state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [newConsultantId, setNewConsultantId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    const query = companyQuery.trim();
    if (selectedCompany && query === selectedCompany.name) {
      return;
    }
    if (query.length < 2) {
      setCompanyResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearchingCompanies(true);
      try {
        const response = await billingApiService.searchAttributionCompanies(query, 10);
        setCompanyResults(response.success ? (response.data?.companies || []) : []);
      } catch {
        setCompanyResults([]);
      } finally {
        setSearchingCompanies(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [companyQuery, selectedCompany]);

  const activeCompanyId = selectedCompany?.company_id || attribution?.company_id || null;

  const loadAttributionForCompany = async (company: AttributionCompanySearchResult) => {
    setSelectedCompany(company);
    setCompanyQuery(company.name);
    setLoading(true);
    try {
      const response = await billingApiService.getAttribution(company.company_id);
      if (response.success && response.data?.attribution) {
        setAttribution(response.data.attribution);
        toast.success('Attribution data loaded');
        // Load history too
        loadHistory(company.company_id);
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

  const handleSearch = async () => {
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }
    await loadAttributionForCompany(selectedCompany);
  };

  const loadHistory = async (companyId?: string) => {
    const targetCompanyId = companyId || activeCompanyId;
    if (!targetCompanyId) return;
    
    setHistoryLoading(true);
    try {
      const response = await billingApiService.getAttributionHistory(targetCompanyId);
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
    if (!activeCompanyId) return;
    
    try {
      const response = await billingApiService.lockAttribution(activeCompanyId);
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
    if (!activeCompanyId) {
      toast.error('Please select a company');
      return;
    }
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
        activeCompanyId,
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
      subtitle="Manage sales agent attribution for leads companies"
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
              Search by company name to view and manage its sales attribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Search company name..."
                  value={companyQuery}
                  onChange={(e) => {
                    setCompanyQuery(e.target.value);
                    setSelectedCompany(null);
                    setAttribution(null);
                    setHistory([]);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="mt-2 rounded-md border bg-background">
                  {selectedCompany ? (
                    <div
                      role="button"
                      tabIndex={0}
                      className="w-full text-left px-3 py-2 hover:bg-accent cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => {
                        setSelectedCompany(null);
                        setAttribution(null);
                        setHistory([]);
                      }}
                    >
                      <div className="font-medium">{selectedCompany.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedCompany.domain}</div>
                    </div>
                  ) : companyQuery.trim().length < 2 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Type at least 2 characters</div>
                  ) : searchingCompanies ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Searching companies...</div>
                  ) : companyResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No matching company found</div>
                  ) : (
                    companyResults.map((company) => (
                      <div
                        key={company.company_id}
                        role="button"
                        tabIndex={0}
                        className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-b-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => {
                          loadAttributionForCompany(company);
                        }}
                      >
                        <div className="font-medium">{company.name}</div>
                        <div className="text-xs text-muted-foreground">{company.domain}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading || !selectedCompany}>
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
                  variant={attribution.attribution_locked ? "default" : "outline"}
                  className={attribution.attribution_locked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {attribution.attribution_locked ? (
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
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="text-sm">{attribution.company_name || selectedCompany?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company ID</Label>
                  <p className="font-mono text-sm">{attribution.company_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sales Agent ID</Label>
                  <p className="font-mono text-sm">{attribution.sales_agent_id || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referred By</Label>
                  <p className="font-mono text-sm">{attribution.referred_by || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-mono text-sm">{attribution.created_by || 'Unknown'}</p>
                </div>
                {attribution.attribution_locked_at && (
                  <div>
                    <Label className="text-muted-foreground">Locked At</Label>
                    <p className="text-sm">
                      {safeFormatDate(attribution.attribution_locked_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {!attribution.attribution_locked && (
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
                          {safeFormatDate(entry.created_at)}
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
