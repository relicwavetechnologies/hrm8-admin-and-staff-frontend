/**
 * Executive Search Workspace
 * Consultant workspace for executive-search jobs: prospect search, longlist, invite, convert.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  executiveSearchService,
  Prospect,
  ProspectSearchResult,
  SavedSearch,
  SequenceTemplate,
  SequenceStep,
} from '@/shared/lib/consultant/executiveSearchService';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ArrowLeft, Mail, Search, UserPlus, Users, FileDown, GitBranch, PlayCircle, Pause, Sparkles, Plus, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';
import { JobAutomationSection } from '@/shared/components/executive-search/JobAutomationSection';
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
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

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
    sourceSystem: 'EXTERNAL',
  });
  const [sequenceTemplates, setSequenceTemplates] = useState<SequenceTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [useAIMatch, setUseAIMatch] = useState(false);
  const [matchScore, setMatchScore] = useState<{
    matchScore: number;
    matchReasons: string[];
    gaps: string[];
    message?: string;
  } | null>(null);
  const [loadingMatchScore, setLoadingMatchScore] = useState(false);
  const [matchScoreError, setMatchScoreError] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [savingEmailId, setSavingEmailId] = useState<string | null>(null);
  const [customTemplateOpen, setCustomTemplateOpen] = useState(false);
  const [customTemplateForm, setCustomTemplateForm] = useState<{ name: string; steps: SequenceStep[] }>({
    name: '',
    steps: [{ dayOffset: 0, subjectTemplate: '', bodyTemplate: '' }],
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [selectedSavedSearchId, setSelectedSavedSearchId] = useState<string>('');
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);

  const basePath = window.location.pathname.startsWith('/consultant360')
    ? '/consultant360/jobs'
    : '/consultant/jobs';

  const loadSavedSearches = async () => {
    if (!jobId) return;
    try {
      const res = await executiveSearchService.listSavedSearches(jobId);
      if (res.success && res.data?.savedSearches) {
        setSavedSearches(res.data.savedSearches);
      }
    } catch (e) {
      console.error('Failed to load saved searches', e);
    }
  };

  useEffect(() => {
    if (jobId) {
      void loadJob();
      void loadProspects();
      void loadSequenceTemplates();
      void loadSavedSearches();
    }
  }, [jobId]);

  useEffect(() => {
    setManualEmail('');
  }, [selectedProspect?.id]);

  useEffect(() => {
    if (!jobId || !selectedProspect?.candidateId) {
      setMatchScore(null);
      setMatchScoreError(null);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoadingMatchScore(false);
        setMatchScoreError('Taking longer than expected. Match score may appear shortly.');
      }
    }, 25000);
    const fetchMatch = async () => {
      setLoadingMatchScore(true);
      setMatchScoreError(null);
      try {
        const res = await executiveSearchService.getProspectMatchScore(jobId, selectedProspect!.id);
        if (cancelled) return;
        if (res.success && res.data) {
          setMatchScore(res.data);
          setMatchScoreError(res.data.message || null);
        } else {
          setMatchScore(null);
          setMatchScoreError(res.error || 'Could not load match score');
        }
      } catch (e) {
        if (!cancelled) {
          setMatchScore(null);
          setMatchScoreError(e instanceof Error ? e.message : 'Match score unavailable');
        }
      } finally {
        if (!cancelled) {
          setLoadingMatchScore(false);
          clearTimeout(timeoutId);
        }
      }
    };
    void fetchMatch();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [jobId, selectedProspect?.id, selectedProspect?.candidateId]);

  const loadSequenceTemplates = async () => {
    if (!jobId) return;
    try {
      setLoadingTemplates(true);
      const res = await executiveSearchService.listSequenceTemplates(jobId);
      if (res.success && res.data?.templates) {
        const seen = new Set<string>();
        const deduped = res.data.templates.filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        setSequenceTemplates(deduped);
      }
    } catch (e) {
      console.error('Failed to load sequence templates', e);
    } finally {
      setLoadingTemplates(false);
    }
  };

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

  const handleSearch = async (savedSearchId?: string) => {
    if (!jobId) return;
    try {
      setSearching(true);
      const res = await executiveSearchService.prospectSearch(jobId, {
        search: searchQuery.trim() || undefined,
        limit: 25,
        offset: 0,
        excludeApplied: true,
        excludeProspected: true,
        useSemanticRerank: useAIMatch,
        savedSearchId: savedSearchId || selectedSavedSearchId || undefined,
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
        sourceSystem: importForm.sourceSystem || 'EXTERNAL',
        sourceProfileUrl: importForm.sourceProfileUrl.trim() || undefined,
      });
      if (res.success) {
        toast.success('Prospect added to longlist');
        setImportForm({ email: '', firstName: '', lastName: '', linkedInUrl: '', sourceProfileUrl: '', sourceSystem: 'EXTERNAL' });
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

  const DEFAULT_STEPS: SequenceStep[] = [
    {
      dayOffset: 0,
      subjectTemplate: "You're invited: {{jobTitle}} at {{companyName}}",
      bodyTemplate:
        'Hi {{candidateName}},<br/><br/>I came across your profile and thought you\'d be a great fit for the <strong>{{jobTitle}}</strong> role at <strong>{{companyName}}</strong>.<br/><br/>This is a private opportunity — we\'re reaching out directly rather than posting publicly. If you\'re open to a conversation, I\'d love to share more.',
    },
    {
      dayOffset: 3,
      subjectTemplate: 'Re: {{jobTitle}} at {{companyName}}',
      bodyTemplate:
        'Hi {{candidateName}},<br/><br/>Just circling back on my note about the <strong>{{jobTitle}}</strong> opportunity at <strong>{{companyName}}</strong>.<br/><br/>I know your inbox can get busy — if the timing isn\'t right, no worries at all. Just wanted to make sure it didn\'t slip through.',
    },
    {
      dayOffset: 7,
      subjectTemplate: 'One more note: {{jobTitle}}',
      bodyTemplate:
        'Hi {{candidateName}},<br/><br/>Last note from me about the <strong>{{jobTitle}}</strong> role at <strong>{{companyName}}</strong>.<br/><br/>If it\'s not for you right now, I completely understand. The door stays open — feel free to reach out anytime if things change.',
    },
  ];

  const handleCreateDefaultTemplate = async () => {
    if (!jobId) return;
    try {
      setCreatingTemplate(true);
      const res = await executiveSearchService.createSequenceTemplate(jobId, {
        name: 'Standard Outreach (Day 1, 3, 7)',
        steps: DEFAULT_STEPS,
      });
      if (res.success && res.data) {
        toast.success('Sequence template created');
        setCreateTemplateOpen(false);
        await loadSequenceTemplates();
      } else {
        toast.error(res.error || 'Failed to create template');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create template';
      toast.error(msg);
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleCreateCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    const name = customTemplateForm.name.trim();
    const steps = customTemplateForm.steps.filter((s) => s.subjectTemplate.trim() || s.bodyTemplate.trim());
    if (!name) {
      toast.error('Template name is required');
      return;
    }
    if (steps.length === 0 || steps.every((s) => !s.subjectTemplate.trim() && !s.bodyTemplate.trim())) {
      toast.error('Add at least one step with subject or body');
      return;
    }
    try {
      setCreatingTemplate(true);
      const res = await executiveSearchService.createSequenceTemplate(jobId, { name, steps });
      if (res.success && res.data) {
        toast.success('Custom template created');
        setCustomTemplateOpen(false);
        setCustomTemplateForm({ name: '', steps: [{ dayOffset: 0, subjectTemplate: '', bodyTemplate: '' }] });
        await loadSequenceTemplates();
      } else {
        toast.error(res.error || 'Failed to create template');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleEnrollInSequence = async (prospectId: string, templateId: string) => {
    if (!jobId) return;
    try {
      setEnrollingId(prospectId);
      const res = await executiveSearchService.enrollInSequence(jobId, prospectId, templateId);
      if (res.success) {
        toast.success(res.data?.message || 'Enrolled in sequence');
        setEnrollDialogOpen(false);
        setSelectedProspect(null);
        await loadProspects();
      } else {
        toast.error(res.error || 'Failed to enroll');
      }
    } catch (e) {
      toast.error('Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handlePauseSequence = async (prospectId: string) => {
    if (!jobId) return;
    try {
      setPausingId(prospectId);
      const res = await executiveSearchService.pauseSequence(jobId, prospectId);
      if (res.success) {
        toast.success(res.data?.message || 'Sequence paused');
        await loadProspects();
        if (selectedProspect?.id === prospectId) {
          setSelectedProspect((p) => (p ? { ...p, sequencePaused: true, hasActiveSequence: false } : null));
        }
      } else {
        toast.error(res.error || 'Failed to pause');
      }
    } catch (e) {
      toast.error('Failed to pause');
    } finally {
      setPausingId(null);
    }
  };

  const handleEnrichProspect = async (prospectId: string) => {
    if (!jobId) return;
    try {
      setEnrichingId(prospectId);
      const res = await executiveSearchService.enrichProspect(jobId, prospectId);
      if (res.success && res.data) {
        if (res.data.found) {
          toast.success(res.data.message + (res.data.email ? `: ${res.data.email}` : ''));
          await loadProspects();
          if (selectedProspect?.id === prospectId) {
            const updated = await executiveSearchService.listProspects(jobId);
            const list = updated.success ? updated.data?.prospects : undefined;
            const p = list?.find((x) => x.id === prospectId);
            if (p) setSelectedProspect(p);
          }
        } else {
          toast.info(res.data.message || 'Email not found');
        }
      } else {
        toast.error(res.error || 'Enrichment failed');
      }
    } catch (e) {
      toast.error('Failed to find email');
    } finally {
      setEnrichingId(null);
    }
  };

  const handleSaveManualEmail = async (prospectId: string) => {
    if (!jobId || !manualEmail.trim()) return;
    const email = manualEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    try {
      setSavingEmailId(prospectId);
      const res = await executiveSearchService.updateProspect(jobId, prospectId, { email });
      if (res.success && res.data) {
        toast.success('Email saved');
        setSelectedProspect(res.data);
        setManualEmail('');
        await loadProspects();
      } else {
        toast.error(res.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Failed to save email');
    } finally {
      setSavingEmailId(null);
    }
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !saveSearchName.trim()) return;
    try {
      setSavingSearch(true);
      const res = await executiveSearchService.createSavedSearch(jobId, {
        name: saveSearchName.trim(),
        query: searchQuery.trim() || undefined,
        filters: { excludeApplied: true, excludeProspected: true, useSemanticRerank: useAIMatch },
      });
      if (res.success) {
        toast.success('Search saved');
        setSaveSearchDialogOpen(false);
        setSaveSearchName('');
        await loadSavedSearches();
      } else {
        toast.error(res.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Failed to save search');
    } finally {
      setSavingSearch(false);
    }
  };

  const handleLoadSavedSearch = async (id: string) => {
    if (!id) return;
    const saved = savedSearches.find((s) => s.id === id);
    if (saved) {
      setSearchQuery(saved.query || '');
      setUseAIMatch(saved.filters?.useSemanticRerank ?? false);
      setSelectedSavedSearchId(id);
      await handleSearch(id);
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    if (!jobId) return;
    try {
      const res = await executiveSearchService.deleteSavedSearch(jobId, id);
      if (res.success) {
        toast.success('Saved search deleted');
        if (selectedSavedSearchId === id) setSelectedSavedSearchId('');
        await loadSavedSearches();
      }
    } catch (e) {
      toast.error('Failed to delete');
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
        <div className="flex gap-2">
          {jobId && <JobAutomationSection jobId={jobId} />}
          <Dialog open={createTemplateOpen} onOpenChange={(open) => { setCreateTemplateOpen(open); if (open) void loadSequenceTemplates(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={loadingTemplates}>
                {sequenceTemplates.length === 0 ? 'Create sequence template' : `Templates (${sequenceTemplates.length})`}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Sequence templates</DialogTitle>
                <DialogDescription>
                  Create or view outreach sequences. Templates define when follow-up emails are sent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {sequenceTemplates.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Your templates</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {sequenceTemplates.map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-1">
                          <span>{t.name}</span>
                          <span className="text-xs">{(t.steps?.length || 0)} steps</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleCreateDefaultTemplate}
                    disabled={creatingTemplate}
                    variant="outline"
                    className="w-full"
                  >
                    {creatingTemplate ? 'Creating...' : 'Create default template (Day 1, 3, 7)'}
                  </Button>
                  <Button
                    onClick={() => setCustomTemplateOpen(true)}
                    disabled={creatingTemplate}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create custom template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={customTemplateOpen} onOpenChange={setCustomTemplateOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create custom sequence</DialogTitle>
                <DialogDescription>
                  Add plain text for each step. Use placeholders: {'{{jobTitle}}'}, {'{{companyName}}'}, {'{{candidateName}}'} — they will be replaced when sending.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCustomTemplate} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="template-name">Template name</Label>
                  <Input
                    id="template-name"
                    value={customTemplateForm.name}
                    onChange={(e) => setCustomTemplateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Senior PM Outreach"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Steps</Label>
                  {customTemplateForm.steps.map((step, idx) => (
                    <div key={idx} className="mb-4 p-4 rounded-lg border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Step {idx + 1}</span>
                        {customTemplateForm.steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCustomTemplateForm((f) => ({
                                ...f,
                                steps: f.steps.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Day offset</Label>
                          <Input
                            type="number"
                            min={0}
                            value={step.dayOffset}
                            onChange={(e) =>
                              setCustomTemplateForm((f) => ({
                                ...f,
                                steps: f.steps.map((s, i) =>
                                  i === idx ? { ...s, dayOffset: Math.max(0, parseInt(e.target.value, 10) || 0) } : s
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Subject</Label>
                        <Input
                          value={step.subjectTemplate}
                          onChange={(e) =>
                            setCustomTemplateForm((f) => ({
                              ...f,
                              steps: f.steps.map((s, i) => (i === idx ? { ...s, subjectTemplate: e.target.value } : s)),
                            }))
                          }
                          placeholder="Re: {{jobTitle}} at {{companyName}}"
                          className="mt-1"
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email body</Label>
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Plain text only. Line breaks will be preserved. No code or HTML.
                        </p>
                        <Textarea
                          value={step.bodyTemplate}
                          onChange={(e) =>
                            setCustomTemplateForm((f) => ({
                              ...f,
                              steps: f.steps.map((s, i) => (i === idx ? { ...s, bodyTemplate: e.target.value } : s)),
                            }))
                          }
                          placeholder="Hi {{candidateName}}, I came across your profile and thought you'd be a great fit for {{jobTitle}} at {{companyName}}."
                          className="mt-1 min-h-[100px]"
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCustomTemplateForm((f) => ({
                        ...f,
                        steps: [...f.steps, { dayOffset: 7, subjectTemplate: '', bodyTemplate: '' }],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add step
                  </Button>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCustomTemplateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingTemplate}>
                    {creatingTemplate ? 'Creating...' : 'Create template'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={() => navigate(`${basePath}/${jobId}/setup-simple`)}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            View pipeline
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search pane */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Candidates
            </CardTitle>
            <CardDescription>Find HRM8 candidates or import external prospects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Name, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={() => handleSearch()} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAIMatch}
                  onChange={(e) => setUseAIMatch(e.target.checked)}
                  className="rounded"
                />
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI match score
              </label>
              {savedSearches.length > 0 && (
                <div className="flex items-center gap-1">
                  <Select value={selectedSavedSearchId || 'none'} onValueChange={(v) => { if (v === 'none') setSelectedSavedSearchId(''); else if (v) void handleLoadSavedSearch(v); }}>
                    <SelectTrigger className="w-[180px]">
                      <Bookmark className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Load saved search" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— No saved search —</SelectItem>
                      {savedSearches.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSavedSearchId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSavedSearch(selectedSavedSearchId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <Dialog open={saveSearchDialogOpen} onOpenChange={setSaveSearchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Save search
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save current search</DialogTitle>
                    <DialogDescription>
                      Save the current query and filters to reuse later.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveSearch} className="space-y-4 pt-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={saveSearchName}
                        onChange={(e) => setSaveSearchName(e.target.value)}
                        placeholder="e.g. Senior PMs in NYC"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setSaveSearchDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={savingSearch || !saveSearchName.trim()}>
                        {savingSearch ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="default">
                    <FileDown className="h-4 w-4 mr-2" />
                    Import external
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import external prospect</DialogTitle>
                    <DialogDescription>
                      Add a prospect sourced externally. Paste or enter details below.
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
                      <Label htmlFor="import-sourceUrl">Source profile URL</Label>
                      <Input
                        id="import-sourceUrl"
                        type="url"
                        placeholder="https://..."
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
            {searchResults.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2">{searchTotal} result{searchTotal !== 1 ? 's' : ''}</p>
            )}
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
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{c.email}</p>
                        {c.matchScore != null && c.matchScore > 0 && (
                          <p className="text-xs mt-1">
                            <span className="font-medium text-amber-600">{c.matchScore}%</span> match
                            {c.matchReasons?.[0] && (
                              <span className="text-muted-foreground"> — {c.matchReasons[0]}</span>
                            )}
                          </p>
                        )}
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
                            : p.externalDisplayName || p.email || 'External prospect'}
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
                : selectedProspect?.externalDisplayName || selectedProspect?.email || 'Prospect'}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Prospect details and outreach actions
            </SheetDescription>
          </SheetHeader>
          {selectedProspect && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedProspect.candidate?.email || selectedProspect.email || 'No email'}
              </p>
              {!(selectedProspect.candidate?.email || selectedProspect.email) && (
                <div className="space-y-2">
                  {(selectedProspect.linkedInUrl || selectedProspect.sourceProfileUrl) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnrichProspect(selectedProspect.id)}
                      disabled={enrichingId === selectedProspect.id}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {enrichingId === selectedProspect.id ? 'Finding...' : 'Find email (Hunter.io)'}
                    </Button>
                  )}
                  <div className="flex gap-2 items-center">
                    <Input
                      type="email"
                      placeholder="Or add email manually"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveManualEmail(selectedProspect.id)}
                      disabled={savingEmailId === selectedProspect.id || !manualEmail.trim()}
                    >
                      {savingEmailId === selectedProspect.id ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
              <div className="text-sm flex items-center gap-2">
                <span>Stage:</span> <Badge>{selectedProspect.stage}</Badge>
              </div>
              {selectedProspect.candidateId && (
                <div className="rounded-lg border p-3 bg-muted/30">
                  {loadingMatchScore ? (
                    <p className="text-sm text-muted-foreground">Loading AI match score…</p>
                  ) : matchScoreError && !matchScore ? (
                    <p className="text-sm text-muted-foreground">{matchScoreError}</p>
                  ) : matchScore ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        <Sparkles className="inline h-4 w-4 mr-1 text-amber-500" />
                        Match: {matchScore.matchScore}%
                      </p>
                      {matchScore.matchReasons?.length > 0 && (
                        <ul className="text-xs space-y-0.5 text-muted-foreground">
                          {matchScore.matchReasons.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      )}
                      {matchScore.gaps?.length > 0 && (
                        <ul className="text-xs space-y-0.5 text-amber-700">
                          {matchScore.gaps.map((g, i) => (
                            <li key={i}>• {g}</li>
                          ))}
                        </ul>
                      )}
                      {matchScore.message && (
                        <p className="text-xs text-muted-foreground">{matchScore.message}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              {selectedProspect.notes && (
                <p className="text-sm">Notes: {selectedProspect.notes}</p>
              )}
              <div className="flex flex-col gap-2 pt-4">
                {selectedProspect.stage === 'LONGLISTED' && (
                  <>
                    <Button
                      onClick={() => handleSendInvite(selectedProspect.id)}
                      disabled={sendingId === selectedProspect.id}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {sendingId === selectedProspect.id ? 'Sending...' : 'Send invite now'}
                    </Button>
                    {sequenceTemplates.length > 0 ? (
                      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" disabled={enrollingId === selectedProspect.id}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            {enrollingId === selectedProspect.id ? 'Enrolling...' : 'Enroll in sequence'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enroll in sequence</DialogTitle>
                            <DialogDescription>
                              Choose a sequence template. Emails will be sent automatically (Day 1, 3, 7, etc.).
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 pt-4">
                            {sequenceTemplates.map((t) => (
                              <Button
                                key={t.id}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleEnrollInSequence(selectedProspect.id, t.id)}
                                disabled={enrollingId === selectedProspect.id}
                              >
                                {t.name} ({t.steps?.length || 0} steps)
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Create a sequence template above to use automated follow-ups.
                      </p>
                    )}
                  </>
                )}
                {selectedProspect.stage === 'INVITED' && (selectedProspect.hasActiveSequence || selectedProspect.sequencePaused) && (
                  selectedProspect.sequencePaused ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Sequence paused
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePauseSequence(selectedProspect.id)}
                      disabled={pausingId === selectedProspect.id}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      {pausingId === selectedProspect.id ? 'Pausing…' : 'Pause sequence'}
                    </Button>
                  )
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
