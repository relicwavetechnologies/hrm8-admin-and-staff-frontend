import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import { StandardChartCard } from "@/shared/components/charts/StandardChartCard";
import { DataTable } from "@/shared/components/tables/DataTable";
import { DollarSign, Target, Users, Eye, Plus, Building2 } from "lucide-react";
import { salesService, SalesDashboardStats } from "@/shared/services/salesService";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { SalesDashboardSkeleton } from "@/modules/sales/components/SalesDashboardSkeleton";
import { Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";


type ActivityItem = SalesDashboardStats['recentActivity'][number] & { id: string };

export default function SalesDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SalesDashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await salesService.getDashboardStats();
        if (response.success && response.data) {
          // Add IDs to recent activity for DataTable keys
          const activityWithIds = response.data.recentActivity.map((item: any, index: number) => ({
            ...item,
            id: `activity-${index}-${item.date}-${item.type}`,
          } as ActivityItem));

          setStats({
            ...response.data,
            recentActivity: activityWithIds as unknown as SalesDashboardStats['recentActivity']
          });
        } else {
          toast({
            title: "Error fetching dashboard",
            description: response.error || "Could not load stats",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  // Activity Columns
  const activityColumns: Column<ActivityItem>[] = [
    {
      key: "description",
      label: "Description",
      render: (item) => <span className="font-medium">{item.description}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <Badge variant={item.type === 'COMMISSION' ? 'success' : 'default'}>
          {item.type}
        </Badge>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: "amount",
      label: "Amount",
      render: (item) => item.amount ? formatCurrency(item.amount) : '-',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SalesDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">Monitor sales performance and commissions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          title="Total Revenue"
          value={stats ? Math.round(stats.commissions.total).toString() : "0"}
          isCurrency={true}
          rawValue={stats?.commissions.total || 0}
          change={`${stats?.commissions.pending || 0} pending`}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          variant="success"
          showMenu={false}
        />

        <EnhancedStatCard
          title="Active Leads"
          value={stats ? stats.leads.total.toString() : "0"}
          change={`${stats?.leads.converted || 0} converted`}
          trend="up"
          icon={<Users className="h-5 w-5" />}
          variant="primary"
          showMenu={true}
          menuItems={[
            {
              label: "View Leads",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => navigate('/sales-agent/leads')
            },
            {
              label: "Add Lead",
              icon: <Plus className="h-4 w-4" />,
              onClick: () => navigate('/sales-agent/leads?action=new')
            }
          ]}
        />

        <EnhancedStatCard
          title="Active Companies"
          value={stats ? stats.companies.total.toString() : "0"}
          change={`${stats?.companies.activeSubscriptions || 0} subscribed`}
          trend="up"
          icon={<Building2 className="h-5 w-5" />}
          variant="neutral"
          showMenu={true}
          menuItems={[
            {
              label: "View All Clients",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => navigate('/sales-agent/companies')
            }
          ]}
        />

        <EnhancedStatCard
          title="Conversion Rate"
          value={stats ? `${stats.leads.conversionRate}%` : "0%"}
          change="Lead to Company"
          trend={stats && stats.leads.conversionRate > 20 ? "up" : "down"}
          icon={<Target className="h-5 w-5" />}
          variant="warning"
          showMenu={false}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-1">
        <StandardChartCard
          title="Recent Activity"
          menuItems={[
            { label: "View All", onClick: () => { } }
          ]}
        >
          <div className="overflow-x-auto -mx-1 px-1">
            <DataTable
              columns={activityColumns}
              data={(stats?.recentActivity as ActivityItem[]) || []}
              searchable={false}
            />
          </div>
        </StandardChartCard>
      </div>
    </div>
  );
}
