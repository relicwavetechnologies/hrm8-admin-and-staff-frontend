/**
 * Consultant Dashboard
 * Main overview page for consultants
 */

import { useState, useEffect, useMemo } from 'react';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { ConsultantDashboardSkeleton } from '@/shared/components/skeletons/ConsultantDashboardSkeleton';
import { StandardChartCard } from '@/shared/components/charts/StandardChartCard';
import { Briefcase, Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
import { useToast } from '@/shared/hooks/use-toast';
import { ActiveJobsWidget } from '@/modules/consultant/dashboard/components/widgets/ActiveJobsWidget';
import { PipelineSnapshotWidget } from '@/modules/consultant/dashboard/components/widgets/PipelineSnapshotWidget';
import { RecentCommissionsWidget } from '@/modules/consultant/dashboard/components/widgets/RecentCommissionsWidget';
import { ConsultantProfileCompletionDialog } from '@/shared/components/consultant/ConsultantProfileCompletionDialog';

export default function ConsultantDashboard() {
  const { consultant } = useConsultantAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getDashboardAnalytics();
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Could not fetch latest analytics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revenueTrendData = useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.map((t: any) => ({
      name: t.name,
      value: t.revenue || 0
    }));
  }, [data]);

  const placementsTrendData = useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.map((t: any) => ({
      name: t.name,
      value: t.placements || 0
    }));
  }, [data]);

  // Use unused variable to prevent build error
  void placementsTrendData;

  const commissionsTrendData = useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.map((t: any) => ({
      name: t.name,
      paid: t.paid || t.revenue || 0, // Fallback if paid not distinct
      pending: t.pending || 0
    }));
  }, [data]);

  if (loading) {
    return <ConsultantDashboardSkeleton />;
  }

  // Calculate totals for stats
  const totalRevenue = data?.trends?.reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0) || 0;
  void totalRevenue;
  const totalPlacements = data?.trends?.reduce((acc: number, curr: any) => acc + (curr.placements || 0), 0) || 0;
  const activeJobsCount = data?.activeJobs?.length || 0;

  // Target calculations
  const monthlyRevenueTarget = data?.targets?.monthlyRevenue || 0;
  const currentMonthRevenue = data?.trends?.[data.trends.length - 1]?.revenue || 0;
  const revenueProgress = monthlyRevenueTarget > 0 ? (currentMonthRevenue / monthlyRevenueTarget) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultant Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {consultant?.firstName}! Here's your overview.
          </p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          title="Active Jobs"
          value={activeJobsCount.toString()}
          icon={<Briefcase className="h-5 w-5" />}
          variant="neutral"
          change="Current open roles"
        />

        <EnhancedStatCard
          title="Total Placements (YY)"
          value={totalPlacements.toString()}
          icon={<Users className="h-5 w-5" />}
          variant="neutral"
          change="Year to date"
        />

        <EnhancedStatCard
          title="Monthly Revenue"
          value={`$${currentMonthRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          variant={revenueProgress >= 100 ? "success" : "neutral"}
          change={monthlyRevenueTarget > 0 ? `Target: $${monthlyRevenueTarget.toLocaleString()} (${revenueProgress.toFixed(0)}%)` : "No target set"}
          trend={revenueProgress >= 100 ? "up" : undefined}
        />

        <EnhancedStatCard
          title="Success Rate"
          value={data?.successRate !== undefined ? `${data.successRate}%` : "--"}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="neutral"
          change="Placement / Assignment Ratio"
        />
      </div>

      {/* Operational Widgets Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveJobsWidget jobs={data?.activeJobs || []} />
        <PipelineSnapshotWidget stages={data?.pipeline || []} />
        <RecentCommissionsWidget commissions={data?.recentCommissions || []} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <StandardChartCard
          title="Revenue Trend"
          description="Monthly revenue performance (Last 12 Months)"
          className="bg-transparent border-0 shadow-none"
          onDownload={() => toast({ title: "Downloading revenue data..." })}
          menuItems={[
            { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } }
          ]}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                width={50}
              />
              <Tooltip cursor={false} formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                name="Revenue"
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </StandardChartCard>

        <StandardChartCard
          title="Overview"
          description="Commissions Breakdown"
          className="bg-transparent border-0 shadow-none"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commissionsTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="pending" fill="#8b5cf6" name="Pending" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </StandardChartCard>
      </div>

      {/* Profile Completion Dialog */}
      <ConsultantProfileCompletionDialog />
    </div>
  );
}
