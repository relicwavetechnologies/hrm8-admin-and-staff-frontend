import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, MousePointer, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";

interface JobAnalyticsDashboardProps {
  jobId: string;
}

interface AnalyticsBreakdown {
  views: { total: number; bySource: Record<string, number> };
  clicks: { total: number; bySource: Record<string, number> };
  applies: { total: number; bySource: Record<string, number> };
}

interface TrendDataPoint {
  date: string;
  views: number;
  clicks: number;
  applies?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#94a3b8'];
const SOURCE_COLORS: Record<string, string> = {
  'HRM8_BOARD': '#3b82f6',
  'CAREER_PAGE': '#10b981',
  'EXTERNAL': '#f59e0b',
  'CANDIDATE_PORTAL': '#6366f1',
  'UNKNOWN': '#94a3b8',
};

const SOURCE_LABELS: Record<string, string> = {
  'HRM8_BOARD': 'HRM8 Job Board',
  'CAREER_PAGE': 'Company Careers Page',
  'EXTERNAL': 'External Sources',
  'CANDIDATE_PORTAL': 'Candidate Portal',
  'UNKNOWN': 'Direct / Unknown',
};

export function JobAnalyticsDashboard({ jobId }: JobAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState<AnalyticsBreakdown | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  useEffect(() => {
    loadAnalytics();
  }, [jobId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics breakdown and trends in parallel
      const [breakdownResponse, trendsResponse] = await Promise.all([
        apiClient.get<{
          jobId: string;
          jobTitle: string;
          breakdown: AnalyticsBreakdown;
        }>(`/api/analytics/jobs/${jobId}/breakdown`),
        apiClient.get<{
          jobId: string;
          days: number;
          trends: TrendDataPoint[];
        }>(`/api/analytics/jobs/${jobId}/trends?days=30`),
      ]);

      if (breakdownResponse.success && breakdownResponse.data) {
        setBreakdown(breakdownResponse.data.breakdown);
      }

      if (trendsResponse.success && trendsResponse.data?.trends) {
        // Format dates for display
        const formattedTrends = trendsResponse.data.trends.map(t => ({
          ...t,
          date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setTrends(formattedTrends);
      }
    } catch (error) {
      console.error('Failed to load job analytics:', error);
      // Fallback to zero data
      setBreakdown({
        views: { total: 0, bySource: {} },
        clicks: { total: 0, bySource: {} },
        applies: { total: 0, bySource: {} },
      });
      setTrends([]);
    }
    setLoading(false);
  };

  // Prepare source data for pie chart
  const sourceData = breakdown ? Object.entries(breakdown.views.bySource)
    .filter(([_, value]) => value > 0)
    .map(([source, value]) => ({
      name: SOURCE_LABELS[source] || source,
      value,
      source,
    })) : [];

  // Prepare conversion funnel data
  const funnelData = breakdown ? [
    { name: 'Views', value: breakdown.views.total },
    { name: 'Apply Clicks', value: breakdown.clicks.total },
    { name: 'Applications', value: breakdown.applies.total },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">{breakdown?.views.total || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detail Clicks</p>
                <p className="text-3xl font-bold">{breakdown?.clicks.total || 0}</p>
                {breakdown && breakdown.views.total > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {((breakdown.clicks.total / breakdown.views.total) * 100).toFixed(1)}% CTR
                  </p>
                )}
              </div>
              <MousePointer className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{breakdown?.applies.total || 0}</p>
                {breakdown && breakdown.clicks.total > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {((breakdown.applies.total / breakdown.clicks.total) * 100).toFixed(1)}% apply rate
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Views & Clicks Over Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Views & Clicks Over Time</CardTitle>
              <Button variant="ghost" size="icon" onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Source */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex justify-center">
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                        >
                          {sourceData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={SOURCE_COLORS[entry.source] || COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No source data available
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    {sourceData.length > 0 ? sourceData.map((item, index) => (
                      <div key={item.source} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: SOURCE_COLORS[item.source] || COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                        No traffic source data yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {funnelData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Activity feed coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
