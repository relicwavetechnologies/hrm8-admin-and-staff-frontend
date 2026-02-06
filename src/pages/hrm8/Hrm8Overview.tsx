import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { Users, Briefcase, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { RegionalAnalyticsService, RegionalOperationalStats } from '@/shared/lib/hrm8/regionalAnalyticsService';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { ComplianceAlertsWidget } from '@/shared/components/hrm8/ComplianceAlertsWidget';
import { useRegionStore } from '@/shared/stores/useRegionStore';

export default function Hrm8Overview() {
  const { hrm8User } = useHrm8Auth();
  const navigate = useNavigate();
  const { selectedRegionId, regions } = useRegionStore();
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  const [stats, setStats] = useState<RegionalOperationalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (selectedRegionId) {
      loadStats(selectedRegionId);
    }
  }, [selectedRegionId]);


  const loadStats = async (regionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegionalAnalyticsService.getOperationalStats(regionId);
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats", err);
      // If 403, it means they don't have access (Licensee trying to view another region)
      setError("Failed to load operational statistics. You may not have access to this region.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {isGlobalAdmin ? 'Global system overview' : 'Regional operational overview'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Operational Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          title="Open Jobs"
          value={stats?.open_jobs_count !== undefined ? stats.open_jobs_count.toString() : "-"}
          icon={<Briefcase className="h-6 w-6" />}
          variant="primary"
          loading={loading}
          change="Active requisitions"
          onClick={() => navigate('/hrm8/allocations')}
          chartData={stats?.trends?.open_jobs}
        />

        <EnhancedStatCard
          title="Active Consultants"
          value={stats?.active_consultants_count !== undefined ? stats.active_consultants_count.toString() : "-"}
          icon={<Users className="h-6 w-6" />}
          variant="neutral"
          loading={loading}
          change="Assigned to region"
          onClick={() => navigate('/hrm8/staff')}
          chartData={stats?.trends?.active_consultants}
        />

        <EnhancedStatCard
          title="Placements (Mo)"
          value={stats?.placements_this_month !== undefined ? stats.placements_this_month.toString() : "-"}
          icon={<Activity className="h-6 w-6" />}
          variant="success"
          loading={loading}
          change="This month"
          onClick={() => navigate('/hrm8/commissions')}
          chartData={stats?.trends?.placements}
        />

        <EnhancedStatCard
          title="Pipeline Value"
          value="-"
          icon={<DollarSign className="h-6 w-6" />}
          variant="warning"
          change="See Sales Dashboard"
          onClick={() => navigate('/hrm8/sales-pipeline')}
        />
      </div>

      {/* Employer Health Section */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Employer Health</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <EnhancedStatCard
            title="Active Employers"
            value={stats ? stats.active_employer_count?.toString() : "-"}
            icon={<Briefcase className="h-6 w-6" />}
            variant="primary"
            loading={loading}
            change="Companies hiring now"
            onClick={() => navigate('/hrm8/companies?status=active')}
          />
          <EnhancedStatCard
            title="New Employers"
            value={stats ? stats.new_employer_count?.toString() : "-"}
            icon={<Activity className="h-6 w-6" />}
            variant="success"
            loading={loading}
            change="Joined this month"
            onClick={() => navigate('/hrm8/companies?sort=newest')}
          />
          <EnhancedStatCard
            title="Inactive Employers"
            value={stats ? stats.inactive_employer_count?.toString() : "-"}
            icon={<AlertCircle className="h-6 w-6" />}
            variant="warning"
            loading={loading}
            change="No open jobs"
            onClick={() => navigate('/hrm8/companies?status=inactive')}
          />
        </div>
      </div>

      {/* Quick Actions / Welcome */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedRegionId === 'all'
              ? 'Global Overview'
              : `Regional Overview: ${regions.find((r) => r.id === selectedRegionId)?.name || 'Unknown'}`}
          </CardTitle>
          <CardDescription>
            {isGlobalAdmin
              ? 'You are viewing system-wide analytics as a Global Admin.'
              : "Manage your region's operations."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Compliance Alerts - Global Admin Only */}
      {isGlobalAdmin && (
        <ComplianceAlertsWidget />
      )}
    </div>
  );
}
