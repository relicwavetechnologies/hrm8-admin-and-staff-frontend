import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Briefcase, Building2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { jobAllocationService } from '@/shared/lib/hrm8/jobAllocationService';
import { apiClient } from '@/shared/lib/apiClient';
import { useRegionStore } from '@/shared/stores/useRegionStore';

interface CompanyJobStats {
  id: string;
  name: string;
  total_jobs: number;
  active_jobs: number;
  on_hold_jobs: number;
}

interface JobsOverviewData {
  total_jobs: number;
  assigned_jobs: number;
  unassigned_jobs: number;
  total_companies: number;
  top_companies: CompanyJobStats[];
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

function JobsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function JobsOverviewPage() {
  const navigate = useNavigate();
  const { selectedRegionId } = useRegionStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JobsOverviewData | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const region = selectedRegionId && selectedRegionId !== 'all' ? selectedRegionId : undefined;

        const [statsResponse, companiesResponse] = await Promise.all([
          jobAllocationService.getStats(),
          apiClient.get<{ companies: CompanyJobStats[]; total: number }>(
            `/api/hrm8/jobs/companies?page=1&limit=8${region ? `&region=${region}` : ''}`
          ),
        ]);

        if (!statsResponse.success || !statsResponse.data) {
          toast.error(statsResponse.error || 'Failed to load jobs overview');
          setData(null);
          return;
        }

        if (!companiesResponse.success || !companiesResponse.data) {
          toast.error(companiesResponse.error || 'Failed to load company insights');
          setData(null);
          return;
        }

        setData({
          total_jobs: statsResponse.data.total || 0,
          assigned_jobs: statsResponse.data.assigned || 0,
          unassigned_jobs: statsResponse.data.unassigned || 0,
          total_companies: companiesResponse.data.total || 0,
          top_companies: companiesResponse.data.companies || [],
        });
      } catch (error) {
        toast.error('Failed to load jobs overview');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedRegionId]);

  const assignmentChart = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Assigned', value: data.assigned_jobs },
      { name: 'Unassigned', value: data.unassigned_jobs },
      { name: 'Remaining', value: Math.max(data.total_jobs - data.assigned_jobs - data.unassigned_jobs, 0) },
    ];
  }, [data]);

  if (loading) {
    return <JobsOverviewSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load jobs overview.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs Overview</h1>
        <p className="text-muted-foreground">High-level view of job activity, assignment coverage, and company demand.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Open Jobs</CardDescription>
            <CardTitle className="text-2xl">{data.total_jobs}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Briefcase className="inline h-4 w-4 mr-1" />
            Active allocation pool
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('/hrm8/jobs/allocation?assignmentStatus=ASSIGNED')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Assigned Jobs</CardDescription>
            <CardTitle className="text-2xl">{data.assigned_jobs}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <UserCheck className="inline h-4 w-4 mr-1" />
            Consultant mapped
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('/hrm8/jobs/allocation?assignmentStatus=UNASSIGNED')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Unassigned Jobs</CardDescription>
            <CardTitle className="text-2xl">{data.unassigned_jobs}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <UserX className="inline h-4 w-4 mr-1" />
            Needs allocation
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Companies with Jobs</CardDescription>
            <CardTitle className="text-2xl">{data.total_companies}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Building2 className="inline h-4 w-4 mr-1" />
            Talent demand coverage
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Health</CardTitle>
            <CardDescription>Current distribution across allocation states</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={assignmentChart} dataKey="value" nameKey="name" outerRadius={88} label>
                  {assignmentChart.map((_entry, index) => (
                    <Cell key={`status-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Companies by Jobs</CardTitle>
            <CardDescription>Highest current job volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.top_companies.map((company) => ({ name: company.name, jobs: company.total_jobs }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="jobs" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
