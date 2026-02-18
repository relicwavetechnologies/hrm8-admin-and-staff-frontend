import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/api';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Building2,
  Briefcase,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsOverview {
  total_jobs: number;
  active_jobs: number;
  total_companies: number;
  total_views: number;
  total_clicks: number;
  total_applications: number;
  conversion_rates: {
    view_to_click: number;
    click_to_apply: number;
    view_to_apply: number;
  };
  by_source: Record<string, { views: number; clicks: number }>;
}

interface TrendData {
  date: string;
  views: number;
  clicks: number;
  applies: number;
}

interface TopCompany {
  company_id: string;
  company_name: string;
  has_career_page: boolean;
  total_jobs: number;
  total_views: number;
  total_clicks: number;
  total_applications: number;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [, setTrends] = useState<TrendData[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, companiesRes] = await Promise.all([
        apiClient.get<AnalyticsOverview>('/api/hrm8/analytics/overview'),
        apiClient.get<{ trends: TrendData[] }>(`/api/hrm8/analytics/trends?period=${period}`),
        apiClient.get<TopCompany[]>('/api/hrm8/analytics/top-companies?limit=10'),
      ]);

      console.debug('[AnalyticsDashboard] overviewRes', overviewRes);
      console.debug('[AnalyticsDashboard] trendsRes', trendsRes);
      console.debug('[AnalyticsDashboard] companiesRes', companiesRes);

      if (!overviewRes.success && overviewRes.error) {
        toast.error(overviewRes.error || 'Failed to load analytics overview');
      }
      if (overviewRes.success && overviewRes.data) {
        const normalizedOverview: AnalyticsOverview = {
          total_jobs: overviewRes.data.total_jobs ?? 0,
          active_jobs: overviewRes.data.active_jobs ?? 0,
          total_companies: overviewRes.data.total_companies ?? 0,
          total_views: overviewRes.data.total_views ?? 0,
          total_clicks: overviewRes.data.total_clicks ?? 0,
          total_applications: overviewRes.data.total_applications ?? 0,
          conversion_rates: {
            view_to_click: overviewRes.data.conversion_rates?.view_to_click ?? 0,
            click_to_apply: overviewRes.data.conversion_rates?.click_to_apply ?? 0,
            view_to_apply: overviewRes.data.conversion_rates?.view_to_apply ?? 0,
          },
          by_source: overviewRes.data.by_source ?? {},
        };
        setOverview(normalizedOverview);
      }
      if (trendsRes.success && trendsRes.data?.trends) {
        setTrends(trendsRes.data.trends);
      }
      if (companiesRes.success && Array.isArray(companiesRes.data)) {
        setTopCompanies(companiesRes.data);
      } else {
        setTopCompanies([]);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    }
    setLoading(false);
  };

  const formatNumber = (num?: number | null) => {
    const value = Number.isFinite(num as number) ? (num as number) : 0;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const sourceLabels: Record<string, string> = {
    HRM8_BOARD: 'HRM8 Job Board',
    CAREER_PAGE: 'Company Careers Page',
    CANDIDATE_PORTAL: 'Candidate Portal',
    EXTERNAL: 'External Sources',
  };

  return (

    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Platform Analytics
          </h1>
          <p className="text-muted-foreground">
            Traffic and conversion metrics across all companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" /> Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-medium">{formatNumber(overview?.total_views || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointer className="h-4 w-4" /> Apply Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-medium">{formatNumber(overview?.total_clicks || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-medium">{formatNumber(overview?.total_applications || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-medium">
                {overview?.active_jobs || 0}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  / {overview?.total_jobs || 0}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rates */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Conversion Rates
          </h2>
          <p className="text-sm text-muted-foreground">Funnel performance metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* View to Click */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">View → Click</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-medium flex items-baseline gap-1">
                    {(overview?.conversion_rates?.view_to_click || 0).toFixed(1)}
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">of views become clicks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Click to Apply */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">Click → Apply</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-medium flex items-baseline gap-1">
                    {(overview?.conversion_rates?.click_to_apply || 0).toFixed(1)}
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">of clicks become applies</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View to Apply */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">View → Apply</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-medium flex items-baseline gap-1">
                    {(overview?.conversion_rates?.view_to_apply || 0).toFixed(1)}
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">overall conversion rate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic by Source</CardTitle>
            <CardDescription>Where your traffic is coming from</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(overview?.by_source || {}).map(([source, data], index) => (
                  <div key={`${source}-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{sourceLabels[source] || source}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(data.views)} views • {formatNumber(data.clicks)} clicks
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Top Companies
            </CardTitle>
            <CardDescription>By views</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topCompanies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {topCompanies.slice(0, 5).map((company, index) => (
                  <div key={`${company.company_id ?? 'company'}-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {company.company_name}
                          {company.has_career_page && (
                            <Badge variant="outline" className="text-xs">Careers Page</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.total_jobs ?? 0} jobs • {formatNumber(company.total_views ?? 0)} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{company.total_applications ?? 0}</p>
                      <p className="text-xs text-muted-foreground">applies</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

  );
}
