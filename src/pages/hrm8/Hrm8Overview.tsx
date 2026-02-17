import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/components/ui/chart';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { AlertCircle, Briefcase, DollarSign, Activity, Users, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { formatCurrency } from '@/shared/lib/utils';
import { RegionalAnalyticsService, RegionalOperationalStats } from '@/shared/lib/hrm8/regionalAnalyticsService';
import { regionalSalesService, RegionalOpportunity, RegionalPipelineStats } from '@/shared/services/hrm8/regionalSalesService';
import { ComplianceAlertsWidget } from '@/shared/components/hrm8/ComplianceAlertsWidget';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';

type TabKey = 'operations' | 'pipeline' | 'revenue' | 'risk';
type TrendPoint = { name: string; value: number };

type OverviewSummary = {
  kpis: {
    openJobs: number;
    unassignedJobs: number;
    activeConsultants: number;
    placementsThisMonth: number;
    pipelineTotal: number;
    pipelineWeighted: number;
  };
  finance: {
    totalSettled: number;
    hrm8Share: number;
    licenseeShare: number;
    paidSettlementCount: number;
  };
  queues: {
    pendingConversionRequests: number;
    pendingRefundRequests: number;
    pendingCareersRequests: number;
    pendingSettlements: number;
  };
  charts: {
    jobsTrend: TrendPoint[];
    placementsTrend: TrendPoint[];
    complianceSeverity: Array<{ severity: string; value: number }>;
  };
};

type OperationsData = {
  stats: RegionalOperationalStats;
  allocation: { total: number; unassigned: number; assigned: number };
  topCompanies: Array<{ company_name: string; total_jobs: number; total_views: number; total_applications: number }>;
};

type PipelineData = {
  stats: RegionalPipelineStats;
  opportunities: RegionalOpportunity[];
};

type RevenueData = {
  stats: { totalSettled: number; hrm8Share: number; licenseeShare: number; count: number };
  settlements: Array<{ id: string; status: string; total_revenue: number; licensee?: { name?: string } }>;
};

type RiskData = {
  compliance: { total: number; critical: number; high: number; medium: number; low: number };
  capacity: { summary: { total: number; overloaded: number; warning: number } };
  queues: {
    pendingConversionRequests: number;
    pendingRefundRequests: number;
    pendingCareersRequests: number;
    pendingSettlements: number;
  };
};

const USE_OVERVIEW_V2 = import.meta.env.VITE_HRM8_OVERVIEW_V2 !== 'false';



function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-[320px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex-shrink-0 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini Metric Card with Chart (like the reference design)
function MiniMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = 'up',
  colorClass = "text-primary",
  bgClass = "bg-primary/5"
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  colorClass?: string;
  bgClass?: string;
}) {
  // Generate simple trend data
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    value: Math.random() * 20 + (trend === 'up' ? i * 5 : 100 - i * 5)
  }));

  const sparklineConfig = {
    value: {
      label: "Value",
      color: colorClass.includes('chart-1') ? 'hsl(var(--chart-1))' :
        colorClass.includes('chart-2') ? 'hsl(var(--chart-2))' :
          colorClass.includes('chart-3') ? 'hsl(var(--chart-3))' :
            colorClass.includes('chart-4') ? 'hsl(var(--chart-4))' :
              'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with icon */}
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn("p-2 rounded-lg", bgClass)}>
                <div className={cn("h-5 w-5", colorClass)}>
                  {icon}
                </div>
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>

          {/* Value */}
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {/* Mini trend chart */}
          <div className="h-16 -mb-6 -mx-6">
            <ChartContainer config={sparklineConfig} className="h-full w-full">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={`mini-gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill={`url(#mini-gradient-${title})`}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function LegacyOverview() {
  const { hrm8User } = useHrm8Auth();
  const navigate = useNavigate();
  const { selectedRegionId, regions } = useRegionStore();
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';
  const [stats, setStats] = useState<RegionalOperationalStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRegionId) return;
    (async () => {
      try {
        setError(null);
        const data = await RegionalAnalyticsService.getOperationalStats(selectedRegionId);
        setStats(data);
      } catch {
        setError('Failed to load operational statistics. You may not have access to this region.');
      }
    })();
  }, [selectedRegionId]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">{isGlobalAdmin ? 'Global system overview' : 'Regional operational overview'}</p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Open Jobs"
          value={(stats?.open_jobs_count ?? 0).toString()}
          icon={Briefcase}
          description="Operational jobs"
          trend="up"
          trendValue="+8.2%"
          onClick={() => navigate('/hrm8/jobs/allocation')}
        />
        <DashboardStatCard
          title="Active Consultants"
          value={(stats?.active_consultants_count ?? 0).toString()}
          icon={Users}
          description="Currently active"
          trend="up"
          trendValue="+12.5%"
          onClick={() => navigate('/hrm8/staff')}
        />
        <DashboardStatCard
          title="Placements (Mo)"
          value={(stats?.placements_this_month ?? 0).toString()}
          icon={Activity}
          description="This month"
          trend="up"
          trendValue="+4.3%"
          onClick={() => navigate('/hrm8/commissions')}
        />
        <DashboardStatCard
          title="Pipeline Value"
          value="-"
          icon={DollarSign}
          description="Sales pipeline"
          trend="up"
          trendValue="+5.1%"
          onClick={() => navigate('/hrm8/regional-sales-dashboard')}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{selectedRegionId === 'all' ? 'Global Overview' : `Regional Overview: ${regions.find((r) => r.id === selectedRegionId)?.name || 'Unknown'}`}</CardTitle>
        </CardHeader>
      </Card>
      {isGlobalAdmin && <ComplianceAlertsWidget />}
    </div>
  );
}

function OverviewV2() {
  const { hrm8User } = useHrm8Auth();
  const navigate = useNavigate();
  const { selectedRegionId, regions } = useRegionStore();
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';
  const regionId = selectedRegionId || 'all';

  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<TabKey>('operations');

  // Summary data (loaded once on mount)
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Tab-specific data (loaded on demand)
  const [tabLoading, setTabLoading] = useState<Record<TabKey, boolean>>({
    operations: false,
    pipeline: false,
    revenue: false,
    risk: false
  });
  const [tabError, setTabError] = useState<Record<TabKey, string | null>>({
    operations: null,
    pipeline: null,
    revenue: null,
    risk: null
  });
  const [loadedTabs, setLoadedTabs] = useState<Record<TabKey, boolean>>({
    operations: false,
    pipeline: false,
    revenue: false,
    risk: false
  });

  const [operationsData, setOperationsData] = useState<OperationsData | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  // Load summary data (for stat cards)
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const response = await apiClient.get<OverviewSummary>(
          `/api/hrm8/overview?regionId=${encodeURIComponent(regionId)}&period=${period}&summaryOnly=1`
        );
        setSummary(response.data || null);
      } catch (error: any) {
        setSummaryError(error?.message || 'Failed to load overview summary');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [regionId, period]);

  // Reset and reload when region or period changes
  useEffect(() => {
    setLoadedTabs({ operations: false, pipeline: false, revenue: false, risk: false });
    setOperationsData(null);
    setPipelineData(null);
    setRevenueData(null);
    setRiskData(null);
    // Force reload the active tab
    loadTab(activeTab, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, period]);

  // Load tab data on demand
  const loadTab = async (tab: TabKey, force: boolean = false) => {
    if (loadedTabs[tab] && !force) return;

    setTabLoading((prev) => ({ ...prev, [tab]: true }));
    setTabError((prev) => ({ ...prev, [tab]: null }));

    try {
      if (tab === 'operations') {
        const [stats, allocationRes, topCompaniesRes] = await Promise.all([
          RegionalAnalyticsService.getOperationalStats(regionId),
          apiClient.get<{ total: number; unassigned: number; assigned: number }>('/api/hrm8/job-allocation/stats'),
          apiClient.get<Array<{ company_name: string; total_jobs: number; total_views: number; total_applications: number }>>(
            `/api/hrm8/analytics/top-companies?limit=8${regionId !== 'all' ? `&regionId=${encodeURIComponent(regionId)}` : ''}`
          )
        ]);

        setOperationsData({
          stats,
          allocation: allocationRes.data || { total: 0, unassigned: 0, assigned: 0 },
          topCompanies: topCompaniesRes.data || []
        });
      }

      if (tab === 'pipeline') {
        const [stats, opportunities] = await Promise.all([
          regionalSalesService.getStats(regionId),
          regionalSalesService.getOpportunities(regionId)
        ]);
        setPipelineData({ stats, opportunities });
      }

      if (tab === 'revenue') {
        const [statsRes, settlementsRes] = await Promise.all([
          apiClient.get<{ totalSettled: number; hrm8Share: number; licenseeShare: number; count: number }>(
            `/api/hrm8/admin/billing/settlements/stats?regionId=${encodeURIComponent(regionId)}`
          ),
          apiClient.get<{ settlements: Array<{ id: string; status: string; total_revenue: number; licensee?: { name?: string } }> }>(
            `/api/hrm8/admin/billing/settlements?regionId=${encodeURIComponent(regionId)}&status=all`
          )
        ]);

        setRevenueData({
          stats: statsRes.data || { totalSettled: 0, hrm8Share: 0, licenseeShare: 0, count: 0 },
          settlements: settlementsRes.data?.settlements || []
        });
      }

      if (tab === 'risk') {
        const [complianceRes, capacityRes, conversionRes, refundRes, careersRes, settlementRes] = await Promise.all([
          apiClient.get<{ total: number; critical: number; high: number; medium: number; low: number }>('/api/hrm8/compliance/summary'),
          apiClient.get<{ summary: { total: number; overloaded: number; warning: number } }>('/api/hrm8/consultants/capacity-warnings'),
          apiClient.get<{ requests: unknown[] }>('/api/hrm8/conversion-requests?status=PENDING'),
          apiClient.get<{ refundRequests: unknown[] }>('/api/hrm8/refund-requests?status=PENDING'),
          apiClient.get<{ requests: unknown[] }>('/api/hrm8/careers/requests'),
          apiClient.get<{ settlements: unknown[] }>(
            `/api/hrm8/admin/billing/settlements?regionId=${encodeURIComponent(regionId)}&status=CONFIRMED`
          )
        ]);

        setRiskData({
          compliance: complianceRes.data || { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
          capacity: capacityRes.data || { summary: { total: 0, overloaded: 0, warning: 0 } },
          queues: {
            pendingConversionRequests: conversionRes.data?.requests?.length || 0,
            pendingRefundRequests: refundRes.data?.refundRequests?.length || 0,
            pendingCareersRequests: careersRes.data?.requests?.length || 0,
            pendingSettlements: settlementRes.data?.settlements?.length || 0
          }
        });
      }

      setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
    } catch (error: any) {
      setTabError((prev) => ({ ...prev, [tab]: error?.message || `Failed to load ${tab} data` }));
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  // Load active tab data when tab changes
  useEffect(() => {
    loadTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const operationsTrend = useMemo(() => {
    const summaryJobs = summary?.charts?.jobsTrend;
    const summaryPlacements = summary?.charts?.placementsTrend;
    const jobs = Array.isArray(summaryJobs) && summaryJobs.length > 0
      ? summaryJobs
      : (operationsData?.stats?.trends?.open_jobs || []);
    const placements = Array.isArray(summaryPlacements) && summaryPlacements.length > 0
      ? summaryPlacements
      : (operationsData?.stats?.trends?.placements || []);
    const placementsMap = new Map(placements.map((p: TrendPoint) => [p.name, p.value]));
    return jobs.map((j: TrendPoint) => ({ name: j.name, openJobs: j.value, placements: placementsMap.get(j.name) || 0 }));
  }, [summary, operationsData]);

  const stageRows = useMemo(() => {
    const byStage = pipelineData?.stats?.byStage || {};
    return Object.entries(byStage).map(([stage, v]) => ({ stage, count: v.count, value: v.value }));
  }, [pipelineData]);

  const showTabError = tabError[activeTab];
  const showTabLoading = tabLoading[activeTab];

  // Chart configurations
  const operationsChartConfig = {
    openJobs: {
      label: "Open Jobs",
      color: "hsl(var(--chart-1))",
    },
    placements: {
      label: "Placements",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const pipelineChartConfig = {
    value: {
      label: "Pipeline Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {isGlobalAdmin ? 'Global ecosystem summary' : 'Regional ecosystem summary'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v: '7d' | '30d' | '90d') => setPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="px-3 py-1.5">
            {regionId === 'all' ? 'All Regions' : regions.find((r) => r.id === regionId)?.name || 'Region'}
          </Badge>
          {(summaryLoading || showTabLoading) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {summaryError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed To Load Summary</AlertTitle>
          <AlertDescription>{summaryError}</AlertDescription>
        </Alert>
      )}

      {/* Stat Cards Grid - Loaded from summary endpoint */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Open Jobs"
          value={(summary?.kpis?.openJobs ?? 0).toString()}
          icon={Briefcase}
          description={`${summary?.kpis?.unassignedJobs ?? 0} unassigned`}
          trend="up"
          trendValue="+8.2%"
          onClick={() => navigate('/hrm8/jobs/allocation')}
          loading={summaryLoading}
        />
        <DashboardStatCard
          title="Active Consultants"
          value={(summary?.kpis?.activeConsultants ?? 0).toString()}
          icon={Users}
          description="Currently active"
          trend="up"
          trendValue="+12.5%"
          onClick={() => navigate('/hrm8/staff')}
          loading={summaryLoading}
        />
        <DashboardStatCard
          title="Placements"
          value={(summary?.kpis?.placementsThisMonth ?? 0).toString()}
          icon={Activity}
          description="This month"
          trend="up"
          trendValue="+4.3%"
          onClick={() => navigate('/hrm8/commissions')}
          loading={summaryLoading}
        />
        <DashboardStatCard
          title="Settled Revenue"
          value={formatCurrency(summary?.finance?.totalSettled || 0)}
          icon={DollarSign}
          description="Total settlements"
          trend="up"
          trendValue="+15.8%"
          onClick={() => navigate('/hrm8/settlements')}
          loading={summaryLoading}
        />
      </div>

      {showTabError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed To Load</AlertTitle>
          <AlertDescription>{showTabError}</AlertDescription>
        </Alert>
      )}

      {/* Tabs Section - Loaded on demand */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="operations" className="data-[state=active]:bg-background">
            Operations
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-background">
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-background">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-background">
            Risk & Compliance
          </TabsTrigger>
        </TabsList>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          {showTabLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ListItemSkeleton key={i} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Operational Trends</CardTitle>
                  <CardDescription>Open jobs vs placements over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={operationsChartConfig} className="h-[320px] w-full">
                    <AreaChart data={operationsTrend}>
                      <defs>
                        <linearGradient id="fillOpenJobs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-openJobs)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-openJobs)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillPlacements" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-placements)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-placements)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="openJobs"
                        stroke="var(--color-openJobs)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#fillOpenJobs)"
                      />
                      <Area
                        type="monotone"
                        dataKey="placements"
                        stroke="var(--color-placements)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#fillPlacements)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Companies</CardTitle>
                  <CardDescription>Companies with most job activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(operationsData?.topCompanies || []).slice(0, 6).map((company, idx) => (
                      <div key={company.company_name} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{company.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.total_jobs} jobs · {company.total_applications} applications
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold">{company.total_views}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          {showTabLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 pb-3 border-b last:border-0">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex-shrink-0 space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline by Stage</CardTitle>
                  <CardDescription>Opportunity value across sales stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={pipelineChartConfig} className="h-[320px] w-full">
                    <BarChart data={stageRows}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="stage"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Opportunities</CardTitle>
                  <CardDescription>Latest pipeline opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(pipelineData?.opportunities || []).slice(0, 6).map((opp) => (
                      <div key={opp.id} className="flex items-center gap-4 pb-3 border-b last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{opp.name}</p>
                          <p className="text-xs text-muted-foreground">{opp.company?.name || 'Unknown'}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <Badge variant="outline" className="mb-1">{opp.stage}</Badge>
                          <p className="text-sm font-semibold">{formatCurrency(opp.amount || 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {showTabLoading ? (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-9 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <TableSkeleton rows={8} />
            </>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <MiniMetricCard
                  title="Total Settled"
                  value={formatCurrency(revenueData?.stats.totalSettled || 0)}
                  subtitle={`${revenueData?.stats.count || 0} settlements`}
                  icon={<DollarSign className="h-5 w-5" />}
                  trend="up"
                  colorClass="text-chart-1"
                  bgClass="bg-chart-1/10"
                />
                <MiniMetricCard
                  title="HRM8 Share"
                  value={formatCurrency(revenueData?.stats.hrm8Share || 0)}
                  subtitle="Platform revenue"
                  icon={<Activity className="h-5 w-5" />}
                  trend="up"
                  colorClass="text-chart-2"
                  bgClass="bg-chart-2/10"
                />
                <MiniMetricCard
                  title="Licensee Share"
                  value={formatCurrency(revenueData?.stats.licenseeShare || 0)}
                  subtitle="Partner revenue"
                  icon={<Users className="h-5 w-5" />}
                  trend="up"
                  colorClass="text-chart-3"
                  bgClass="bg-chart-3/10"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Settlements</CardTitle>
                  <CardDescription>Latest settlement transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Settlement ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Licensee</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(revenueData?.settlements || []).slice(0, 8).map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs">{s.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.status}</Badge>
                          </TableCell>
                          <TableCell>{s.licensee?.name || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(s.total_revenue || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk" className="space-y-6">
          {showTabLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-56 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MiniMetricCard
                  title="Critical Alerts"
                  value={riskData?.compliance.critical || 0}
                  subtitle="Immediate attention"
                  icon={<AlertCircle className="h-5 w-5" />}
                  trend="down"
                  colorClass="text-destructive"
                  bgClass="bg-destructive/10"
                />
                <MiniMetricCard
                  title="High Priority"
                  value={riskData?.compliance.high || 0}
                  subtitle="Requires review"
                  icon={<AlertCircle className="h-5 w-5" />}
                  trend="down"
                  colorClass="text-chart-3"
                  bgClass="bg-chart-3/10"
                />
                <MiniMetricCard
                  title="Pending Requests"
                  value={(riskData?.queues.pendingConversionRequests || 0) + (riskData?.queues.pendingRefundRequests || 0) + (riskData?.queues.pendingCareersRequests || 0)}
                  subtitle="Total queue items"
                  icon={<Activity className="h-5 w-5" />}
                  trend="down"
                  colorClass="text-chart-1"
                  bgClass="bg-chart-1/10"
                />
                <MiniMetricCard
                  title="Overloaded Staff"
                  value={riskData?.capacity.summary.overloaded || 0}
                  subtitle="Capacity warnings"
                  icon={<Users className="h-5 w-5" />}
                  trend="down"
                  colorClass="text-chart-4"
                  bgClass="bg-chart-4/10"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Queues</CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Requests</span>
                      <Badge variant="secondary">{riskData?.queues.pendingConversionRequests || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Refund Requests</span>
                      <Badge variant="secondary">{riskData?.queues.pendingRefundRequests || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Careers Requests</span>
                      <Badge variant="secondary">{riskData?.queues.pendingCareersRequests || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Settlements</span>
                      <Badge variant="secondary">{riskData?.queues.pendingSettlements || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Summary</CardTitle>
                    <CardDescription>Alert distribution by severity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical</span>
                      <Badge variant="destructive">{riskData?.compliance.critical || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High</span>
                      <Badge className="bg-warning">{riskData?.compliance.high || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium</span>
                      <Badge variant="secondary">{riskData?.compliance.medium || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low</span>
                      <Badge variant="outline">{riskData?.compliance.low || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {isGlobalAdmin && <ComplianceAlertsWidget />}
    </div>
  );
}

export default function Hrm8Overview() {
  return USE_OVERVIEW_V2 ? <OverviewV2 /> : <LegacyOverview />;
}
