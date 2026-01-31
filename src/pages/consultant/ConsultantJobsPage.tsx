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
import { Button } from '@/shared/components/ui/button';
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

  useEffect(() => {
    loadJobs();
  }, [activeStatus]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = activeStatus !== 'ALL' ? { status: activeStatus } : undefined;
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
      render: (job: any) => (
        <div>
          <div className="text-sm font-semibold">{job.title}</div>
          {job.department && (
            <div className="text-xs text-muted-foreground">{job.department}</div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (job: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm">{job.location}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (job: any) => {
        if (job.status === 'ACTIVE') {
          return (
            <Badge variant="outline" className="h-6 px-2 text-xs rounded-full bg-success/10 text-success border-success/20">
              Active
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
            {job.status}
          </Badge>
        );
      },
    },
    {
      key: 'pipeline',
      label: 'Pipeline',
      render: (job: any) => {
        const currentStage: JobPipelineStage = job.pipeline?.stage || 'INTAKE';
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
              {currentStage}
            </Badge>
            <Select
              value={currentStage}
              onValueChange={(value) => handleStageChange(job.id, value as JobPipelineStage)}
              disabled={updatingJobId === job.id}
            >
              <SelectTrigger className="h-8 w-36">
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
      render: (job: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(job.createdAt).toLocaleDateString()}
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
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED'].map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStatus(status)}
              className="capitalize"
            >
              {status.toLowerCase()}
            </Button>
          ))}
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
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">Loading jobs...</div>
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
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
