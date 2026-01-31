import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/tables/DataTable";
import { Plus, Users, DollarSign, Target, TrendingUp, Eye, Download, BarChart3, Mail } from "lucide-react";
// import { getAllSalesAgents, getSalesAgentStats } from "@/shared/lib/salesAgentStorage"; 
import type { SalesAgent } from "@/shared/types/salesAgent";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import { createSalesAgentColumns } from "@/modules/sales/components/SalesAgentTableColumns";
import { SalesTeamFilterBar } from "@/modules/sales/components/SalesTeamFilterBar";
import { SalesAgentBulkActions } from "@/modules/sales/components/SalesAgentBulkActions";
import { salesService } from "@/shared/services/salesService";

export default function SalesTeamPage() {
  const navigate = useNavigate();
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, active: 0, totalRevenue: 0, totalQuota: 0, avgConversionRate: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [agentsRes, statsRes] = await Promise.all([
          salesService.getSalesAgents(),
          salesService.getSalesAgentStats()
        ]);
        if (agentsRes.success && agentsRes.data) {
          setSalesAgents(agentsRes.data.agents);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Failed to load sales team data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const quotaAttainment = stats.totalQuota > 0
    ? (stats.totalRevenue / stats.totalQuota * 100).toFixed(1)
    : '0';

  const columns = useMemo(() => createSalesAgentColumns(), []);

  const filteredAgents = useMemo(() => {
    return salesAgents.filter((agent) => {
      const matchesSearch =
        search === "" ||
        `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        agent.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
      const matchesRole = roleFilter === "all" || agent.salesRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [salesAgents, search, statusFilter, roleFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  const handleExport = (selectedIds: string[]) => {
    console.log("Exporting selected agents:", selectedIds);
  };

  const handleDelete = (selectedIds: string[]) => {
    console.log("Deleting selected agents:", selectedIds);
  };

  const handleSendEmail = (selectedIds: string[]) => {
    console.log("Sending email to selected agents:", selectedIds);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Team</h1>
            <p className="text-muted-foreground mt-2">Manage your sales team and track performance</p>
          </div>
          <Button onClick={() => navigate("/sales/team/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Agent
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/sales">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Agents"
            value={stats.total.toString()}
            change={`${stats.active} active`}
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All Agents",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/sales/team')
              },
              {
                label: "Add Sales Agent",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => navigate('/sales/team/new')
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Total Revenue"
            value={stats.totalRevenue.toString()}
            change="All-time"
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            isCurrency={true}
            rawValue={stats.totalRevenue}
            showMenu={true}
            menuItems={[
              {
                label: "View Report",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Avg Win Rate"
            value={`${stats.avgConversionRate.toFixed(1)}%`}
            change="Conversion rate"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View Analytics",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Quota Attainment"
            value={`${quotaAttainment}%`}
            change="Team average"
            icon={<Target className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              {
                label: "View Details",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "Send Report",
                icon: <Mail className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
        </div>

        <SalesTeamFilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onClearFilters={handleClearFilters}
        />

        <DataTable
          columns={columns}
          data={filteredAgents}
          selectable
          renderBulkActions={(selectedIds) => (
            <SalesAgentBulkActions
              selectedCount={selectedIds.length}
              onExport={() => handleExport(selectedIds)}
              onDelete={() => handleDelete(selectedIds)}
              onSendEmail={() => handleSendEmail(selectedIds)}
              onClearSelection={() => { }}
            />
          )}
          exportable
          exportFilename="sales-team"
        />
      </div>
    </div>
  );
}
