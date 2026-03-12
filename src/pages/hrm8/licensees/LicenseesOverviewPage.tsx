import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { BriefcaseBusiness, DollarSign, Globe2, Users } from 'lucide-react';
import { licenseeService, type LicenseeOverviewData } from '@/shared/lib/hrm8/licenseeService';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { isAllRegionsSelected } from '@/shared/lib/regionScope';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  SUSPENDED: '#f59e0b',
  TERMINATED: '#ef4444',
};

function LicenseesOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
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
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function LicenseesOverviewPage() {
  const { selectedRegionId } = useRegionStore();
  const [overview, setOverview] = useState<LicenseeOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  if (!isAllRegionsSelected(selectedRegionId)) {
    return <Navigate to="/hrm8/licensees/list" replace />;
  }

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const response = await licenseeService.getOverview();
        if (!response.success || !response.data) {
          toast.error(response.error || 'Failed to load licensees overview');
          setOverview(null);
          return;
        }
        setOverview(response.data);
      } catch {
        toast.error('Failed to load licensees overview');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const statusData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: 'Active', value: overview.summary.activeLicensees, key: 'ACTIVE' },
      { name: 'Suspended', value: overview.summary.suspendedLicensees, key: 'SUSPENDED' },
      { name: 'Terminated', value: overview.summary.terminatedLicensees, key: 'TERMINATED' },
    ].filter((item) => item.value > 0);
  }, [overview]);

  if (loading) return <LicenseesOverviewSkeleton />;

  if (!overview) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No licensee overview data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Licensees Overview</h1>
        <p className="text-muted-foreground">Performance, revenue-share contribution, and regional coverage across licensees.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Licensees</CardDescription>
            <CardTitle className="text-2xl">{overview.summary.totalLicensees}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Users className="inline h-4 w-4 mr-1" />
            {overview.summary.activeLicensees} active
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Region Coverage</CardDescription>
            <CardTitle className="text-2xl">{overview.summary.totalRegions}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Globe2 className="inline h-4 w-4 mr-1" />
            Assigned regions
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(overview.summary.totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Settled revenue
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Jobs</CardDescription>
            <CardTitle className="text-2xl">{overview.summary.totalActiveJobs}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BriefcaseBusiness className="inline h-4 w-4 mr-1" />
            Across managed regions
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Share Breakdown</CardTitle>
            <CardDescription>Licensee share vs HRM8 share by partner</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview.revenueShareBreakdown.map((item) => ({
                name: item.licenseeName.length > 12 ? `${item.licenseeName.slice(0, 12)}…` : item.licenseeName,
                licenseeShare: item.licenseeShare,
                hrm8Share: item.hrm8Share,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="licenseeShare" stackId="share" fill="#6366f1" name="Licensee Share" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hrm8Share" stackId="share" fill="#14b8a6" name="HRM8 Share" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Licensee Status Mix</CardTitle>
            <CardDescription>Current operational status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95} label>
                  {statusData.map((item) => (
                    <Cell key={item.key} fill={STATUS_COLORS[item.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Licensees</CardTitle>
          <CardDescription>Sorted by settled revenue contribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.topPerformers.length === 0 && (
            <p className="text-sm text-muted-foreground">No performance data yet.</p>
          )}
          {overview.topPerformers.map((item) => (
            <div key={item.licenseeId} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.regionsCount} regions • {item.activeJobs} active jobs • {item.activeConsultants} active consultants
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(item.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">{item.revenueSharePercent}% share</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
