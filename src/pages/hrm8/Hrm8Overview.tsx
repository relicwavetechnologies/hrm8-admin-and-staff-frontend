/**
 * HRM8 Overview Dashboard
 * Main overview page for HRM8 Global Admin and Regional Licensees
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Users, Briefcase, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { regionService, Region } from '@/shared/lib/hrm8/regionService';
import { RegionalAnalyticsService, RegionalOperationalStats } from '@/shared/lib/hrm8/regionalAnalyticsService';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { ComplianceAlertsWidget } from '@/shared/components/hrm8/ComplianceAlertsWidget';

export default function Hrm8Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [stats, setStats] = useState<RegionalOperationalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      loadStats(selectedRegionId);
    }
  }, [selectedRegionId]);

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll();
      if (response.success && response.data?.regions) {
        setRegions(response.data.regions);
        // Auto-select first region if available
        if (response.data.regions.length > 0) {
          setSelectedRegionId(response.data.regions[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load regions", err);
    }
  };

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
    <Hrm8PageLayout
      title="Dashboard"
      subtitle={
        isGlobalAdmin
          ? 'Global system overview'
          : 'Regional operational overview'
      }
      actions={
        <div className="flex items-center gap-2">
          <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="p-6 space-y-6">

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
            value={stats ? stats.openJobsCount.toString() : "-"}
            icon={<Briefcase className="h-6 w-6" />}
            variant="primary"
            loading={loading}
            change="Active requisitions"
            onClick={() => navigate('/hrm8/jobs')}
            chartData={stats?.trends?.openJobs}
          />

          <EnhancedStatCard
            title="Active Consultants"
            value={stats ? stats.activeConsultantsCount.toString() : "-"}
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            loading={loading}
            change="Assigned to region"
            onClick={() => navigate('/hrm8/staff')}
            chartData={stats?.trends?.activeConsultants}
          />

          <EnhancedStatCard
            title="Placements (Mo)"
            value={stats ? stats.placementsThisMonth.toString() : "-"}
            icon={<Activity className="h-6 w-6" />}
            variant="success"
            loading={loading}
            change="This month"
            onClick={() => navigate('/hrm8/commissions')}
            chartData={stats?.trends?.placements}
          />

          {/* Placeholder for Revenue (Could use RegionalSalesService later) */}
          <EnhancedStatCard
            title="Pipeline Value"
            value="-"
            // We could fetch this from RegionalSalesService if we want strict parity
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
              value={stats ? stats.activeEmployerCount?.toString() : "-"}
              icon={<Briefcase className="h-6 w-6" />}
              variant="primary"
              loading={loading}
              change="Companies hiring now"
              onClick={() => navigate('/hrm8/companies?status=active')}
            />
            <EnhancedStatCard
              title="New Employers"
              value={stats ? stats.newEmployerCount?.toString() : "-"}
              icon={<Activity className="h-6 w-6" />}
              variant="success"
              loading={loading}
              change="Joined this month"
              onClick={() => navigate('/hrm8/companies?sort=newest')}
            />
            <EnhancedStatCard
              title="Inactive Employers"
              value={stats ? stats.inactiveEmployerCount?.toString() : "-"}
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
            <CardTitle>Regional Overview: {regions.find(r => r.id === selectedRegionId)?.name}</CardTitle>
            <CardDescription>
              {isGlobalAdmin ? "You are viewing this region as a Global Admin." : "Manage your region's operations."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Compliance Alerts - Global Admin Only */}
        {isGlobalAdmin && (
          <ComplianceAlertsWidget />
        )}
      </div>
    </Hrm8PageLayout>
  );
}

