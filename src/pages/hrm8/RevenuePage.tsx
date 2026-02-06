import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { revenueService, RegionalRevenue } from '@/shared/services/hrm8/revenueService';
import { regionService, Region } from '@/shared/services/hrm8/regionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';

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
    render: (revenue: RegionalRevenue) => (
      <span>
        {new Date(revenue.period_start).toLocaleDateString()} - {new Date(revenue.period_end).toLocaleDateString()}
      </span>
    ),
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
      <span className="text-blue-600 font-medium">${(revenue.hrm8_share || 0).toLocaleString()}</span>
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
        CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-50' },
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
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  // Regional admins can only see company breakdown
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';
  const [activeTab, setActiveTab] = useState(isGlobalAdmin ? 'overview' : 'companies');

  useEffect(() => {
    // Only load regional revenue data for global admins
    if (isGlobalAdmin) {
      loadRevenues();
      loadRegions();
    }
    loadCompanyRevenues(); // Load company data on mount for stats
  }, [statusFilter, regionFilter, isGlobalAdmin]);

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
      if (regionFilter !== 'all') {
        filters.region_id = regionFilter;
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

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll();
      if (response.success && response.data?.regions) {
        setRegions(response.data.regions);
      }
    } catch (error) {
      console.error('Failed to load regions:', error);
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
                  <Label>Filter by Region:</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-32 lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
          <EnhancedStatCard
            title="Total Revenue"
            value=""
            isCurrency={true}
            rawValue={totalRevenue}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            change="Overall"
          />

          <EnhancedStatCard
            title="HRM8 Share"
            value=""
            isCurrency={true}
            rawValue={totalHRM8Share}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="primary"
            change="Total"
          />

          <EnhancedStatCard
            title="Licensee Share"
            value=""
            isCurrency={true}
            rawValue={totalLicenseeShare}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            change="Total"
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
