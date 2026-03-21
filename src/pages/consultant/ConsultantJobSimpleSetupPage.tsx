/**
 * Consultant Job Simple Setup Page
 * HRM8-managed jobs open directly into a consultant-owned simple setup surface.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  MapPin,
  Save,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const MANAGED_SERVICE_TYPES = ['shortlisting', 'full-service', 'executive-search', 'rpo'];

export default function ConsultantJobSimpleSetupPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [priorityFocus, setPriorityFocus] = useState('');
  const [candidateSignals, setCandidateSignals] = useState('');
  const [setupNotes, setSetupNotes] = useState('');
  const [intakeConfirmed, setIntakeConfirmed] = useState(false);
  const [roleUnderstood, setRoleUnderstood] = useState(false);
  const [searchReady, setSearchReady] = useState(false);

  const basePath = window.location.pathname.startsWith('/consultant360')
    ? '/consultant360/jobs'
    : '/consultant/jobs';

  useEffect(() => {
    if (jobId) {
      void loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      const cleanId = jobId.includes(' ') && !jobId.includes('-') ? jobId.replace(/\s/g, '-') : jobId;
      const response = await consultantService.getJobDetails(cleanId);
      const payload = response.data;
      const jobDetails = payload?.job ?? payload;
      const pipelineDetails = payload?.pipeline ?? null;

      if (!response.success || !jobDetails) {
        setError('Job not found');
        return;
      }

      const serviceType = jobDetails.serviceType ?? jobDetails.service_package ?? '';
      const isManaged = MANAGED_SERVICE_TYPES.includes(serviceType);
      if (!isManaged) {
        setError('This job is not an HRM8 Managed Recruitment job.');
        return;
      }

      setJob(jobDetails);
      setPipeline(pipelineDetails);

      const requirementSummary = Array.isArray(jobDetails.requirements)
        ? jobDetails.requirements
            .slice(0, 3)
            .map((entry: string | { text?: string }) => (typeof entry === 'string' ? entry : entry?.text ?? ''))
            .filter(Boolean)
            .join('\n')
        : '';

      setPriorityFocus(jobDetails.department ?? jobDetails.category ?? '');
      setCandidateSignals(requirementSummary);
      setSetupNotes(pipelineDetails?.note ?? '');
      setIntakeConfirmed(Boolean(pipelineDetails?.note));
      setRoleUnderstood(Boolean(requirementSummary));
    } catch (loadError) {
      console.error('[ConsultantJobSimpleSetupPage] Failed to load job', loadError);
      setError('Failed to load job');
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const requirements = useMemo(() => {
    if (!Array.isArray(job?.requirements)) return [];
    return job.requirements
      .map((entry: string | { text?: string }) => (typeof entry === 'string' ? entry : entry?.text ?? ''))
      .filter(Boolean);
  }, [job]);

  const handleSave = async () => {
    if (!jobId) return;

    try {
      setSaving(true);
      const note = [
        '[Simple setup]',
        `Priority focus: ${priorityFocus || 'Not specified'}`,
        `Candidate signals: ${candidateSignals || 'Not specified'}`,
        `Intake confirmed: ${intakeConfirmed ? 'Yes' : 'No'}`,
        `Role understood: ${roleUnderstood ? 'Yes' : 'No'}`,
        `Search ready: ${searchReady ? 'Yes' : 'No'}`,
        '',
        setupNotes.trim() || 'No additional notes',
      ].join('\n');

      const response = await consultantService.updateJobPipeline(jobId, {
        stage: 'INTAKE',
        note,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save setup');
      }

      toast.success('Simple setup saved');
      setPipeline((prev: any) => ({
        ...(prev || {}),
        stage: 'INTAKE',
        note,
        updatedAt: new Date().toISOString(),
      }));
    } catch (saveError) {
      console.error('[ConsultantJobSimpleSetupPage] Failed to save setup', saveError);
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to save setup');
    } finally {
      setSaving(false);
    }
  };

  const goToPipeline = () => {
    if (jobId) {
      navigate(`${basePath}/${jobId}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="mb-4">{error ?? 'Job not found'}</p>
            <Button variant="outline" onClick={() => navigate(basePath)}>
              Back to My Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serviceType = job.serviceType ?? job.service_package ?? 'Managed';
  const title = job.title ?? job.jobTitle ?? 'Untitled';
  const company = job.companyName ?? job.company?.name ?? job.employerName ?? 'Company';
  const location = job.location ?? job.locationText ?? '—';
  const salaryMin = job.salaryMin ?? job.salary_min;
  const salaryMax = job.salaryMax ?? job.salary_max;
  const currency = job.salaryCurrency ?? job.salary_currency ?? 'USD';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(basePath)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Simple setup</h1>
            <p className="text-sm text-muted-foreground">
              Finalize intake for this HRM8-managed job before you move into candidate execution.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {serviceType}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {company}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
              {(salaryMin != null || salaryMax != null) && (
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  {salaryMin != null && salaryMax != null
                    ? `${currency} ${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()}`
                    : salaryMin != null
                      ? `${currency} ${Number(salaryMin).toLocaleString()}+`
                      : `${currency} up to ${Number(salaryMax).toLocaleString()}`}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priorityFocus">Priority focus</Label>
              <Input
                id="priorityFocus"
                value={priorityFocus}
                onChange={(event) => setPriorityFocus(event.target.value)}
                placeholder="e.g. Backend-heavy shortlist, urgent interviews, niche market"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidateSignals">Candidate signals to prioritise</Label>
              <Textarea
                id="candidateSignals"
                value={candidateSignals}
                onChange={(event) => setCandidateSignals(event.target.value)}
                placeholder="List the skills, industries, achievements, or signals you want to prioritize."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setupNotes">Consultant intake notes</Label>
              <Textarea
                id="setupNotes"
                value={setupNotes}
                onChange={(event) => setSetupNotes(event.target.value)}
                placeholder="Capture anything useful before you begin sourcing and screening."
                rows={8}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save setup'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={goToPipeline}>
                <Sparkles className="h-4 w-4" />
                Open pipeline
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">Kickoff checklist</CardTitle>
                <CardDescription>
                  Keep this lean. The goal is to get you straight into delivery without an extra screen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox checked={intakeConfirmed} onCheckedChange={(value) => setIntakeConfirmed(Boolean(value))} />
                  <span>Intake is confirmed with the company</span>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox checked={roleUnderstood} onCheckedChange={(value) => setRoleUnderstood(Boolean(value))} />
                  <span>Role scope and must-haves are clear</span>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox checked={searchReady} onCheckedChange={(value) => setSearchReady(Boolean(value))} />
                  <span>Search strategy is ready to start</span>
                </label>
                {pipeline?.updatedAt && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Last pipeline update: {new Date(pipeline.updatedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Key requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requirements.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    {requirements.slice(0, 6).map((requirement: string, index: number) => (
                      <li key={`${requirement}-${index}`}>{requirement}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No structured requirements were saved on this job yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <p className="text-muted-foreground">
                  Once you save this setup, the job stays in your consultant workflow and you can move straight into the candidate pipeline from here.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
