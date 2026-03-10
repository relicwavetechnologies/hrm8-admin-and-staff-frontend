import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { regionService, type RegionsOverviewData } from '@/shared/lib/hrm8/regionService';
import { Badge } from '@/shared/components/ui/badge';
import { Building2, DollarSign, Globe2, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RegionProfileSheet } from '../components/RegionProfileSheet';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { isAllRegionsSelected } from '@/shared/lib/regionScope';

const OWNERSHIP_COLORS: Record<string, string> = {
  HRM8: '#6366f1',
  LICENSEE: '#14b8a6',
};

function RegionsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
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
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegionsOverviewPage() {
  const { selectedRegionId: activeRegionId } = useRegionStore();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<RegionsOverviewData | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  if (!isAllRegionsSelected(activeRegionId)) {
    return <Navigate to="/hrm8/regions/list" replace />;
  }

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const response = await regionService.getOverview();
        if (!response.success || !response.data) {
          toast.error(response.error || 'Failed to load regions overview');
          setOverview(null);
          return;
        }
        setOverview(response.data);
      } catch {
        toast.error('Failed to load regions overview');
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

  const handleViewProfile = (regionId: string) => {
    setSelectedRegionId(regionId);
    setProfileSheetOpen(true);
  };

  const ownershipData = useMemo(() => {
    if (!overview) return [];
    return overview.ownership_distribution.map((item) => ({
      ...item,
      name: item.owner_type === 'HRM8' ? 'HRM8 Managed' : 'Licensee Managed',
    }));
  }, [overview]);

  if (loading) return <RegionsOverviewSkeleton />;

  if (!overview) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No regional overview data available.
        </CardContent>
      </Card>
    );
  }

  const { summary } = overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regions Overview</h1>
        <p className="text-muted-foreground">Regional ownership, active demand, and revenue-share performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Regions</CardDescription>
            <CardTitle className="text-2xl">{summary.total_regions}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Globe2 className="inline h-4 w-4 mr-1" />
            {summary.active_regions} active
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assigned Licensees</CardDescription>
            <CardTitle className="text-2xl">{summary.assigned_licensees}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Users className="inline h-4 w-4 mr-1" />
            {summary.licensee_owned_regions} managed regions
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-2xl">{summary.total_companies}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Building2 className="inline h-4 w-4 mr-1" />
            {summary.open_jobs} open jobs
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Settled Revenue</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.total_revenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <DollarSign className="inline h-4 w-4 mr-1" />
            {summary.active_consultants} active consultants
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ownership Mix</CardTitle>
            <CardDescription>HRM8-managed vs licensee-managed regions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ownershipData} dataKey="count" nameKey="name" outerRadius={95} label>
                  {ownershipData.map((item) => (
                    <Cell key={item.owner_type} fill={OWNERSHIP_COLORS[item.owner_type]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Region Footprint by Country</CardTitle>
            <CardDescription>Count of configured regions per country</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview.country_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Regions</CardTitle>
          <CardDescription>Ranked by settled revenue, then open demand</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.top_regions.length === 0 && (
            <p className="text-sm text-muted-foreground">No regional metrics available yet.</p>
          )}
          {overview.top_regions.map((region) => (
            <div
              key={region.id}
              className="group flex items-center justify-between py-3 border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors -mx-2 px-2 rounded-sm"
              onClick={() => handleViewProfile(region.id)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">{region.name}</p>
                  <Badge variant={region.owner_type === 'LICENSEE' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5 font-normal">
                    {region.owner_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/70">{region.country}</span>
                  <span>•</span>
                  <span>{region.companies} companies</span>
                  <span>•</span>
                  <span>{region.open_jobs} jobs</span>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <p className="font-semibold text-sm">{formatCurrency(region.total_revenue)}</p>
                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                  <span>Lic. {formatCurrency(region.licensee_share)}</span>
                  <span className="w-px h-2 bg-border"></span>
                  <span>HRM8 {formatCurrency(region.hrm8_share)}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <RegionProfileSheet
        regionId={selectedRegionId}
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
      />
    </div>
  );
}
