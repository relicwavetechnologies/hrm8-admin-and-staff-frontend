import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { revenueService, RegionalRevenue } from '@/shared/services/hrm8/revenueService';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { formatCurrency } from '@/shared/lib/utils';

import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { CompanyRevenueTable } from '@/shared/components/hrm8/CompanyRevenueTable';

const columns = [
  {
    key: 'region_id',
    label: 'Region',
    render: (revenue: RegionalRevenue) => revenue.region_name || revenue.region_id?.substring(0, 8) + '...' || 'Unknown',
  },
  {
    key: 'period_start',
    label: 'Period',
    render: (revenue: RegionalRevenue) => {
      const start = revenue.period_start ? new Date(revenue.period_start) : null;
      const end = revenue.period_end ? new Date(revenue.period_end) : null;
      const startStr = start && !isNaN(start.getTime()) ? start.toLocaleDateString() : '—';
      const endStr = end && !isNaN(end.getTime()) ? end.toLocaleDateString() : '—';
      return <span>{startStr} - {endStr}</span>;
    },
  },
  {
    key: 'total_revenue',
    label: 'Total Revenue',
    render: (revenue: RegionalRevenue) => (
      <span className="font-semibold">${(revenue.total_revenue || 0).toLocaleString()}</span>
    ),
  },
  {
    key: 'hrm8_share',
    label: 'HRM8 Share',
    render: (revenue: RegionalRevenue) => (
      <span className="text-primary font-medium">${(revenue.hrm8_share || 0).toLocaleString()}</span>
    ),
  },
  {
    key: 'licensee_share',
    label: 'Licensee Share',
    render: (revenue: RegionalRevenue) => (
      <span className="text-purple-600 font-medium">${(revenue.licensee_share || 0).toLocaleString()}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (revenue: RegionalRevenue) => {
      const statusConfig = {
        PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
        CONFIRMED: { color: 'text-primary', bg: 'bg-primary/10' },
        PAID: { color: 'text-green-600', bg: 'bg-green-50' },
      };
      const config = statusConfig[revenue.status] || statusConfig.PENDING;

      return (
        <Badge className={`${config.color} ${config.bg}`}>
          {revenue.status}
        </Badge>
      );
    },
  },
];

export default function RevenuePage() {
  const { hrm8User } = useHrm8Auth();
  const [revenues, setRevenues] = useState<RegionalRevenue[]>([]);
  const [companyRevenues, setCompanyRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { selectedRegionId } = useRegionStore();
  const effectiveRegionFilter = selectedRegionId === 'all' || !selectedRegionId ? 'all' : selectedRegionId;

  // Regional admins can only see company breakdown
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';
  const [activeTab, setActiveTab] = useState(isGlobalAdmin ? 'overview' : 'companies');

  useEffect(() => {
    if (isGlobalAdmin) {
      loadRevenues();
    }
    loadCompanyRevenues();
  }, [statusFilter, effectiveRegionFilter, isGlobalAdmin]);

  useEffect(() => {
    if (activeTab === 'companies') {
      loadCompanyRevenues();
    }
  }, [activeTab]);

  const loadRevenues = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (effectiveRegionFilter !== 'all') {
        filters.region_id = effectiveRegionFilter;
      }

      const response = await revenueService.getAll(filters);
      if (response.success && response.data?.revenues) {
        setRevenues(response.data.revenues);
      }
    } catch (error) {
      toast.error('Failed to load revenue records');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyRevenues = async () => {
    try {
      setCompanyLoading(true);
      const response = await revenueService.getCompanyRevenueBreakdown();
      if (response.success && response.data?.companies) {
        setCompanyRevenues(response.data.companies);
      }
    } catch (error) {
      console.error('Error loading company revenues:', error);
      toast.error('Failed to load company revenue breakdown');
    } finally {
      setCompanyLoading(false);
    }
  };

  // Compute stats from real-time company data (not pre-computed RegionalRevenue table)
  const totalRevenue = companyRevenues.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const totalHRM8Share = companyRevenues.reduce((sum, c) => sum + (c.hrm8_share || 0), 0);
  const totalLicenseeShare = companyRevenues.reduce((sum, c) => sum + (c.licensee_share || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Tracking</h1>
          <p className="text-muted-foreground">Track regional revenue and shares</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'overview' && (
            <>
              <Label>Filter by Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          variant="primary"
          description="Overall"
        />

        <DashboardStatCard
          title="HRM8 Share"
          value={formatCurrency(totalHRM8Share)}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
          description="Total"
        />

        <DashboardStatCard
          title="Licensee Share"
          value={formatCurrency(totalLicenseeShare)}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
          description="Total"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isGlobalAdmin ? (
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="companies">Company Breakdown</TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid w-full grid-cols-1 lg:w-[200px]">
            <TabsTrigger value="companies">Company Breakdown</TabsTrigger>
          </TabsList>
        )}

        {isGlobalAdmin && (
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Revenue Records</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton columns={6} />
                ) : (
                  <DataTable
                    data={revenues}
                    columns={columns}
                    searchable
                    searchKeys={['status']}
                    emptyMessage="No revenue records found"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="companies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyRevenueTable
                data={companyRevenues}
                loading={companyLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
