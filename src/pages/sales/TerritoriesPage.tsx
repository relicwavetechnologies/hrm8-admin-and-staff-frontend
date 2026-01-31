import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/tables/DataTable";
import { Plus, MapPin, Users, Building2, DollarSign, Eye, Download } from "lucide-react";
import { getAllTerritories, getTerritoryStats } from "@/shared/lib/salesTerritoryStorage";
import type { SalesTerritory } from "@/shared/types/salesTerritory";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import { createTerritoryColumns } from "@/modules/sales/components/SalesTerritoryTableColumns";
import { TerritoriesFilterBar } from "@/modules/sales/components/TerritoriesFilterBar";
import { TerritoryBulkActions } from "@/modules/sales/components/TerritoryBulkActions";

export default function TerritoriesPage() {
  const [territories] = useState<SalesTerritory[]>(getAllTerritories());
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const stats = getTerritoryStats();

  const columns = useMemo(() => createTerritoryColumns(), []);

  const filteredTerritories = useMemo(() => {
    return territories.filter((territory) => {
      const matchesSearch =
        search === "" ||
        territory.name.toLowerCase().includes(search.toLowerCase()) ||
        (territory.primarySalesAgentName && territory.primarySalesAgentName.toLowerCase().includes(search.toLowerCase()));

      const matchesRegion = regionFilter === "all" || territory.region === regionFilter;
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && territory.isActive) ||
        (statusFilter === "inactive" && !territory.isActive);

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [territories, search, regionFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setRegionFilter("all");
    setStatusFilter("all");
  };

  const handleExport = (selectedIds: string[]) => {
    console.log("Exporting selected territories:", selectedIds);
  };

  const handleDelete = (selectedIds: string[]) => {
    console.log("Deleting selected territories:", selectedIds);
  };

  const handleAssignAgents = (selectedIds: string[]) => {
    console.log("Assigning agents to territories:", selectedIds);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Territories</h1>
            <p className="text-muted-foreground">Manage sales territories and assignments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Territory
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Territories"
            value={stats.total.toString()}
            change={`${stats.active} active`}
            icon={<MapPin className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All Territories",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "New Territory",
                icon: <Plus className="h-4 w-4" />,
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
            title="Active Employers"
            value={stats.activeEmployers.toString()}
            change="Across territories"
            icon={<Building2 className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View Employers",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Total Employers"
            value={stats.totalEmployers.toString()}
            change="All employers"
            icon={<Users className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              {
                label: "View All",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Total Revenue"
            value={stats.totalRevenue.toString()}
            change="All territories"
            icon={<DollarSign className="h-6 w-6" />}
            variant="warning"
            isCurrency={true}
            rawValue={stats.totalRevenue}
            showMenu={true}
            menuItems={[
              {
                label: "View Report",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
        </div>

        <TerritoriesFilterBar
          search={search}
          onSearchChange={setSearch}
          regionFilter={regionFilter}
          onRegionFilterChange={setRegionFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
        />

        <div className="overflow-x-auto -mx-1 px-1">
          <DataTable
            columns={columns}
            data={filteredTerritories}
            selectable
            renderBulkActions={(selectedIds) => (
              <TerritoryBulkActions
                selectedCount={selectedIds.length}
                onExport={() => handleExport(selectedIds)}
                onDelete={() => handleDelete(selectedIds)}
                onAssignAgents={() => handleAssignAgents(selectedIds)}
                onClearSelection={() => { }}
              />
            )}
            exportable
            exportFilename="territories"
          />
        </div>
      </div>
    </div>
  );
}
