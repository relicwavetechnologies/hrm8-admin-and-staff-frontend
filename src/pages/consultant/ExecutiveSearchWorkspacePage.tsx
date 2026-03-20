/**
 * Executive Search Workspace
 * Consultant workspace for executive-search jobs: prospect search, longlist, invite, convert.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { executiveSearchService, Prospect, ProspectSearchResult } from '@/shared/lib/consultant/executiveSearchService';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ArrowLeft, Mail, Search, UserPlus, Users, FileDown, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';

export default function ExecutiveSearchWorkspacePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProspectSearchResult[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importForm, setImportForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    linkedInUrl: '',
    sourceProfileUrl: '',
    sourceSystem: 'LOXO',
  });

  const basePath = window.location.pathname.startsWith('/consultant360')
    ? '/consultant360/jobs'
    : '/consultant/jobs';

  useEffect(() => {
    if (jobId) {
      void loadJob();
      void loadProspects();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await consultantService.getJobDetails(jobId);
      const jobDetails = res.data?.job ?? res.data;
      if (!res.success || !jobDetails) {
        toast.error('Job not found');
        navigate(basePath);
        return;
      }
      const raw = (jobDetails.serviceType ?? jobDetails.service_package ?? '').toString();
      const st = raw.toLowerCase().replace(/_/g, '-');
      if (st !== 'executive-search') {
        toast.error('This job is not an executive-search job');
        navigate(`${basePath}/${jobId}/setup-simple`);
        return;
      }
      setJob(jobDetails);
    } catch (e) {
      toast.error('Failed to load job');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  };

  const loadProspects = async () => {
    if (!jobId) return;
    try {
      setLoadingProspects(true);
      const res = await executiveSearchService.listProspects(jobId);
      if (res.success && res.data?.prospects) {
        setProspects(res.data.prospects);
      }
    } catch (e) {
      console.error('Failed to load prospects', e);
    } finally {
      setLoadingProspects(false);
    }
  };

  const handleSearch = async () => {
    if (!jobId) return;
    try {
      setSearching(true);
      const res = await executiveSearchService.prospectSearch(jobId, {
        search: searchQuery.trim() || undefined,
        limit: 25,
        offset: 0,
        excludeApplied: true,
        excludeProspected: true,
      });
      if (res.success && res.data) {
        setSearchResults(res.data.candidates);
        setSearchTotal(res.data.total);
      } else {
        toast.error(res.error || 'Search failed');
      }
    } catch (e) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddToLonglist = async (candidateId: string) => {
    if (!jobId) return;
    try {
      setAddingId(candidateId);
      const res = await executiveSearchService.importExisting(jobId, candidateId);
      if (res.success) {
        toast.success('Added to longlist');
        await loadProspects();
        setSearchResults((prev) => prev.filter((c) => c.id !== candidateId));
        setSearchTotal((t) => Math.max(0, t - 1));
      } else {
        toast.error(res.error || 'Failed to add');
      }
    } catch (e) {
      toast.error('Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  const handleSendInvite = async (prospectId: string) => {
    if (!jobId) return;
    try {
      setSendingId(prospectId);
      const res = await executiveSearchService.sendInvite(jobId, prospectId);
      if (res.success) {
        toast.success(res.data?.message || 'Invitation sent');
        await loadProspects();
        setSelectedProspect(null);
      } else {
        toast.error(res.error || 'Failed to send invite');
      }
    } catch (e) {
      toast.error('Failed to send invite');
    } finally {
      setSendingId(null);
    }
  };

  const handleImportExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !importForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    try {
      setImporting(true);
      const res = await executiveSearchService.importExternal(jobId, {
        email: importForm.email.trim(),
        firstName: importForm.firstName.trim() || undefined,
        lastName: importForm.lastName.trim() || undefined,
        linkedInUrl: importForm.linkedInUrl.trim() || undefined,
        sourceSystem: importForm.sourceSystem || 'LOXO',
        sourceProfileUrl: importForm.sourceProfileUrl.trim() || undefined,
      });
      if (res.success) {
        toast.success('Prospect added to longlist');
        setImportForm({ email: '', firstName: '', lastName: '', linkedInUrl: '', sourceProfileUrl: '', sourceSystem: 'LOXO' });
        setImportDialogOpen(false);
        await loadProspects();
      } else {
        toast.error(res.error || 'Failed to import');
      }
    } catch (e) {
      toast.error('Failed to import');
    } finally {
      setImporting(false);
    }
  };

  const handleConvert = async (prospectId: string) => {
    if (!jobId) return;
    try {
      setConvertingId(prospectId);
      const res = await executiveSearchService.convertToApplication(jobId, prospectId);
      if (res.success) {
        toast.success(res.data?.created ? 'Candidate added to pipeline' : 'Already in pipeline');
        await loadProspects();
        setSelectedProspect(null);
        if (res.data?.applicationId) {
          navigate(`${basePath}/${jobId}/setup-simple`);
        }
      } else {
        toast.error(res.error || 'Failed to convert');
      }
    } catch (e) {
      toast.error('Failed to convert');
    } finally {
      setConvertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(basePath)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Executive Search</h1>
            <p className="text-muted-foreground">{job?.title || 'Job'}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`${basePath}/${jobId}/setup-simple`)}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          View pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search pane */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Candidates
            </CardTitle>
            <CardDescription>Find HRM8 candidates or import from Loxo/external sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Name, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="default">
                    <FileDown className="h-4 w-4 mr-2" />
                    Import from Loxo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import external prospect</DialogTitle>
                    <DialogDescription>
                      Add a prospect sourced from Loxo or another external tool. Paste or enter details below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleImportExternal} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="import-email">Email *</Label>
                      <Input
                        id="import-email"
                        type="email"
                        required
                        placeholder="candidate@example.com"
                        value={importForm.email}
                        onChange={(e) => setImportForm((f) => ({ ...f, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="import-firstName">First name</Label>
                        <Input
                          id="import-firstName"
                          placeholder="Jane"
                          value={importForm.firstName}
                          onChange={(e) => setImportForm((f) => ({ ...f, firstName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="import-lastName">Last name</Label>
                        <Input
                          id="import-lastName"
                          placeholder="Smith"
                          value={importForm.lastName}
                          onChange={(e) => setImportForm((f) => ({ ...f, lastName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="import-linkedIn">LinkedIn URL</Label>
                      <Input
                        id="import-linkedIn"
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={importForm.linkedInUrl}
                        onChange={(e) => setImportForm((f) => ({ ...f, linkedInUrl: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="import-sourceUrl">Loxo / source profile URL</Label>
                      <Input
                        id="import-sourceUrl"
                        type="url"
                        placeholder="https://app.loxo.co/..."
                        value={importForm.sourceProfileUrl}
                        onChange={(e) => setImportForm((f) => ({ ...f, sourceProfileUrl: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={importing}>
                        {importing ? 'Importing...' : 'Add to longlist'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <ScrollArea className="h-[300px]">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {searching ? 'Searching...' : 'Enter a search term and click Search'}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{c.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToLonglist(c.id)}
                        disabled={addingId === c.id || c.hasApplied}
                      >
                        {addingId === c.id ? 'Adding...' : c.hasApplied ? 'Applied' : 'Add to longlist'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Longlist / Prospects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Longlist ({prospects.length})
            </CardTitle>
            <CardDescription>Prospects added for this job</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProspects ? (
              <Skeleton className="h-[300px]" />
            ) : prospects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No prospects yet. Search and add candidates above.
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {prospects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedProspect(p)}
                    >
                      <div>
                        <p className="font-medium">
                          {p.candidate
                            ? `${p.candidate.firstName} ${p.candidate.lastName}`
                            : p.email || 'External prospect'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {p.candidate?.email || p.email}
                        </p>
                      </div>
                      <Badge variant="outline">{p.stage}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prospect drawer */}
      <Sheet open={!!selectedProspect} onOpenChange={(open) => !open && setSelectedProspect(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedProspect?.candidate
                ? `${selectedProspect.candidate.firstName} ${selectedProspect.candidate.lastName}`
                : selectedProspect?.email || 'Prospect'}
            </SheetTitle>
          </SheetHeader>
          {selectedProspect && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedProspect.candidate?.email || selectedProspect.email}
              </p>
              <p className="text-sm">
                Stage: <Badge>{selectedProspect.stage}</Badge>
              </p>
              {selectedProspect.notes && (
                <p className="text-sm">Notes: {selectedProspect.notes}</p>
              )}
              <div className="flex flex-col gap-2 pt-4">
                {selectedProspect.stage === 'LONGLISTED' && (
                  <Button
                    onClick={() => handleSendInvite(selectedProspect.id)}
                    disabled={sendingId === selectedProspect.id}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {sendingId === selectedProspect.id ? 'Sending...' : 'Send invite'}
                  </Button>
                )}
                {selectedProspect.candidateId && (
                  <Button
                    variant="outline"
                    onClick={() => handleConvert(selectedProspect.id)}
                    disabled={convertingId === selectedProspect.id}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {convertingId === selectedProspect.id ? 'Converting...' : 'Convert to application'}
                  </Button>
                )}
                {!selectedProspect.candidateId && (
                  <p className="text-xs text-muted-foreground">
                    External prospect — ask them to apply to convert.
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
