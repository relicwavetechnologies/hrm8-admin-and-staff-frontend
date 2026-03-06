import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, BriefcaseBusiness, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { staffService, type StaffOverviewData } from '@/shared/lib/hrm8/staffService';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

const CAPACITY_COLORS = ['#94a3b8', '#60a5fa', '#f59e0b', '#ef4444'];

const roleLabelMap: Record<string, string> = {
  RECRUITER: 'Recruiter',
  SALES_AGENT: 'Sales Agent',
  CONSULTANT_360: 'Consultant 360',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

function StaffOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
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
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function StaffOverviewPage() {
  const { selectedRegionId } = useRegionStore();
  const [overview, setOverview] = useState<StaffOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const regionId = selectedRegionId && selectedRegionId !== 'all' ? selectedRegionId : undefined;
        const response = await staffService.getOverview({ regionId });
        if (!response.success || !response.data) {
          toast.error(response.error || 'Failed to load staff overview');
          setOverview(null);
          return;
        }
        setOverview(response.data);
      } catch (error) {
        toast.error('Failed to load staff overview');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedRegionId]);

  const capacityChartData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: 'Under Utilized', value: overview.capacity_distribution.under_utilized },
      { name: 'Optimal', value: overview.capacity_distribution.optimal },
      { name: 'Near Capacity', value: overview.capacity_distribution.near_capacity },
      { name: 'Over Capacity', value: overview.capacity_distribution.over_capacity },
    ];
  }, [overview]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);

  if (loading) {
    return <StaffOverviewSkeleton />;
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No staff overview data available.
        </CardContent>
      </Card>
    );
  }

  const { summary } = overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Overview</h1>
        <p className="text-muted-foreground">Team capacity, performance, and operational signals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Staff</CardDescription>
            <CardTitle className="text-2xl">{summary.total_staff}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Users className="inline h-4 w-4 mr-1" />
            {summary.active_staff} active
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.total_revenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            {summary.total_placements} placements
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Success Rate</CardDescription>
            <CardTitle className="text-2xl">{summary.avg_success_rate}%</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across all current staff members
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Capacity Utilization</CardDescription>
            <CardTitle className="text-2xl">{summary.avg_utilization_percent}%</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BriefcaseBusiness className="inline h-4 w-4 mr-1" />
            Team average workload
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overview.role_distribution.map((r) => ({ name: roleLabelMap[r.role] || r.role, count: r.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={capacityChartData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {capacityChartData.map((_entry, index) => (
                    <Cell key={`capacity-${index}`} fill={CAPACITY_COLORS[index % CAPACITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Sorted by total revenue contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.top_performers.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {roleLabelMap[member.role] || member.role} • {member.total_placements} placements
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(member.total_revenue)}</p>
                  <p className="text-xs text-muted-foreground">{member.success_rate}% success</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workload Alerts</CardTitle>
            <CardDescription>Near/over capacity or non-active status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.workload_alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No immediate workload alerts.</p>
            )}
            {overview.workload_alerts.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.current_jobs}/{member.max_jobs} jobs • {roleLabelMap[member.role] || member.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{member.utilization_percent}%</p>
                  <p className="text-xs text-muted-foreground">{statusLabelMap[member.status] || member.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Snapshot</CardTitle>
          <CardDescription>Current staffing state breakdown</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.status_distribution.map((item) => (
            <div key={item.status} className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{statusLabelMap[item.status] || item.status}</p>
              <p className="text-xl font-semibold mt-1">{item.count}</p>
            </div>
          ))}
          <div className="rounded-md border p-3 sm:col-span-2 lg:col-span-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Recently joined
            </p>
            <p className="mt-2 text-sm">
              {overview.recently_joined.map((member) => member.name).join(', ') || 'No recent joins'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
