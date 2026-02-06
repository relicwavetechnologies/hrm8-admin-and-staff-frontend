import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Progress } from '@/shared/components/ui/progress';
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

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
              <div className="text-3xl font-bold">{formatNumber(overview?.total_views || 0)}</div>
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
              <div className="text-3xl font-bold">{formatNumber(overview?.total_clicks || 0)}</div>
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
              <div className="text-3xl font-bold">{formatNumber(overview?.total_applications || 0)}</div>
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
              <div className="text-3xl font-bold">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Conversion Rates
          </CardTitle>
          <CardDescription>Funnel performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">View → Click</span>
                  <span className="text-sm font-bold">{overview?.conversion_rates.view_to_click || 0}%</span>
                </div>
                <Progress value={overview?.conversion_rates.view_to_click || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Click → Apply</span>
                  <span className="text-sm font-bold">{overview?.conversion_rates.click_to_apply || 0}%</span>
                </div>
                <Progress value={overview?.conversion_rates.click_to_apply || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">View → Apply</span>
                  <span className="text-sm font-bold">{overview?.conversion_rates.view_to_apply || 0}%</span>
                </div>
                <Progress value={overview?.conversion_rates.view_to_apply || 0} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                {Object.entries(overview?.by_source || {}).map(([source, data]) => (
                  <div key={source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
                  <div key={company.company_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
                          {company.total_jobs} jobs • {formatNumber(company.total_views)} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{company.total_applications}</p>
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
