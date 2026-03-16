/**
 * Consultant Job Simple Setup Page
 * HRM8 Managed jobs: consultant lands here directly when clicking the job (no extra navigation).
 * Simple flow: intake summary and quick actions, then "Continue to pipeline" for full job view.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ArrowLeft, Building2, MapPin, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const MANAGED_SERVICE_TYPES = ['shortlisting', 'full-service', 'executive-search', 'rpo'];

export default function ConsultantJobSimpleSetupPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { consultant } = useConsultantAuth();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) loadJob();
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
      if (response.success && jobDetails) {
        setJob(jobDetails);
        const serviceType = jobDetails.serviceType ?? jobDetails.service_package ?? '';
        const isManaged = MANAGED_SERVICE_TYPES.includes(serviceType);
        if (!isManaged) {
          setError('This job is not an HRM8 Managed job.');
        }
      } else {
        setError('Job not found');
      }
    } catch {
      setError('Failed to load job');
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const goToPipeline = () => {
    if (jobId) navigate(`/consultant/jobs/${jobId}`);
  };

  const basePath = window.location.pathname.startsWith('/consultant360') ? '/consultant360/jobs' : '/consultant/jobs';

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
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

  const serviceType = job.serviceType ?? job.service_package ?? '';
  const title = job.title ?? job.jobTitle ?? 'Untitled';
  const company = job.companyName ?? job.company?.name ?? job.employerName ?? 'Company';
  const location = job.location ?? job.locationText ?? '—';
  const salaryMin = job.salaryMin ?? job.salary_min;
  const salaryMax = job.salaryMax ?? job.salary_max;
  const currency = job.salaryCurrency ?? job.salary_currency ?? 'USD';
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Simple setup</h1>
          <p className="text-sm text-muted-foreground">Review job intake and continue to pipeline</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary">{serviceType || 'Managed'}</Badge>
          </div>
          <CardDescription className="flex items-center gap-2 mt-1">
            <Building2 className="h-4 w-4" />
            {company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location}</span>
          </div>
          {(salaryMin != null || salaryMax != null) && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {salaryMin != null && salaryMax != null
                  ? `${currency} ${Number(salaryMin).toLocaleString()} – ${Number(salaryMax).toLocaleString()}`
                  : salaryMin != null
                    ? `${currency} ${Number(salaryMin).toLocaleString()}+`
                    : `${currency} up to ${Number(salaryMax).toLocaleString()}`}
              </span>
            </div>
          )}
          {requirements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Key requirements
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {requirements.slice(0, 5).map((r: string | { text?: string }, i: number) => (
                  <li key={i}>{typeof r === 'string' ? r : r?.text ?? ''}</li>
                ))}
                {requirements.length > 5 && <li>+{requirements.length - 5} more</li>}
              </ul>
            </div>
          )}
          <div className="pt-4 border-t">
            <Button className="w-full gap-2" onClick={goToPipeline}>
              Continue to pipeline
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You can manage candidates and rounds from the job pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
