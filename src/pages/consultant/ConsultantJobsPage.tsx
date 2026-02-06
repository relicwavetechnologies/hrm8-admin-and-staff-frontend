/**
 * Consultant Jobs Page
 * View assigned jobs for consultants
 */

import { useState, useEffect } from 'react';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Briefcase, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { JobPipelineStage } from '@/shared/types/job';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function ConsultantJobsPage() {
  const { consultant } = useConsultantAuth();
  // Use consultant data for future features
  void consultant;
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const { selectedRegionId } = useRegionStore();

  useEffect(() => {
    loadJobs();
  }, [activeStatus, selectedRegionId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (activeStatus !== 'ALL') filters.status = activeStatus;
      if (selectedRegionId && selectedRegionId !== 'all') filters.region_id = selectedRegionId;

      const response = await consultantService.getJobs(filters);
      console.log('[JobsPage] Jobs response:', response);

      // Handle both response formats - backend returns array directly in data
      const jobsData = Array.isArray(response.data) ? response.data : response.data?.jobs;
      console.log('[JobsPage] Jobs data:', jobsData);

      if (response.success && jobsData && Array.isArray(jobsData)) {
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('[JobsPage] Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const pipelineStages: JobPipelineStage[] = [
    'INTAKE',
    'SOURCING',
    'SCREENING',
    'SHORTLIST_SENT',
    'INTERVIEW',
    'OFFER',
    'PLACED',
    'ON_HOLD',
    'CLOSED',
  ];

  const handleStageChange = async (jobId: string, stage: JobPipelineStage) => {
    try {
      setUpdatingJobId(jobId);
      const response = await consultantService.updateJobPipeline(jobId, { stage });
      if (!response.success) {
        toast.error(response.error || 'Failed to update pipeline');
        return;
      }
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
              ...job,
              pipeline: {
                ...(job.pipeline || {}),
                stage,
                updatedAt: new Date().toISOString(),
              },
            }
            : job
        )
      );
      toast.success('Pipeline updated');
    } catch (error) {
      toast.error('Failed to update pipeline');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      sortable: true,
      width: '260px',
      render: (job: any) => (
        <div className="max-w-[260px]">
          <div className="text-sm font-semibold truncate" title={job.title}>
            {job.title}
          </div>
          {job.department && (
            <div className="text-xs text-muted-foreground truncate" title={job.department}>
              {job.department}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '280px',
      render: (job: any) => (
        <div className="flex items-center gap-1 max-w-[280px]">
          <span className="text-sm truncate" title={job.location}>
            {job.location}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (job: any) => {
        const status = job.status || 'UNKNOWN';
        const statusStyles: Record<string, string> = {
          ACTIVE: "bg-success/10 text-success border-success/20",
          OPEN: "bg-primary/10 text-primary border-primary/20",
          PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          ON_HOLD: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          CLOSED: "bg-muted text-muted-foreground border-border",
          CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
        };
        return (
          <Badge
            variant="outline"
            className={`h-6 px-2 text-xs rounded-full ${statusStyles[status] || "bg-muted/30 text-muted-foreground"}`}
          >
            {String(status).replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'pipeline',
      label: 'Pipeline',
      width: '220px',
      render: (job: any) => {
        const currentStage: JobPipelineStage = job.pipeline?.stage || 'INTAKE';
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
              {currentStage.replace(/_/g, ' ')}
            </Badge>
            <Select
              value={currentStage}
              onValueChange={(value) => handleStageChange(job.id, value as JobPipelineStage)}
              disabled={updatingJobId === job.id}
            >
              <SelectTrigger
                className="h-8 w-32"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: '120px',
      render: (job: any) => (
        <span className="text-sm text-muted-foreground">
          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Jobs</h1>
          <p className="text-muted-foreground">View and manage your assigned jobs</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <div className="rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <EnhancedStatCard
              title="Total Jobs"
              value={jobs.length.toString()}
              change="All time"
              icon={<Briefcase className="h-5 w-5" />}
              variant="neutral"
            />

            <EnhancedStatCard
              title="Active Jobs"
              value={jobs.filter(j => j.status === 'ACTIVE' || j.status === 'OPEN').length.toString()}
              change="Currently active"
              icon={<Clock className="h-5 w-5" />}
              variant="neutral"
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </>
          ) : (
            ['ALL', 'ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED'].map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStatus(status)}
                className="capitalize"
              >
                {status.toLowerCase()}
              </Button>
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Assigned Jobs</CardTitle>
            <CardDescription className="text-sm">
              {jobs.length} total job{jobs.length !== 1 ? 's' : ''} assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No jobs found for this filter</p>
              </div>
            ) : (
              <DataTable
                data={jobs}
                columns={columns}
                searchable
                searchKeys={['title', 'location', 'department']}
                emptyMessage="No jobs found"
                onRowClick={(row) => navigate(`${row.id}`)}
                resizable={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
