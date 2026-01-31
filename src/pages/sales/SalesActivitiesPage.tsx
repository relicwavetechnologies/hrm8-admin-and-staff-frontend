import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/tables/DataTable";
import { Plus, ListChecks, Calendar, AlertCircle, CheckCircle, Eye, Download, BarChart3 } from "lucide-react";
// import { getAllActivities, getActivityStats } from "@/shared/lib/salesActivityStorage";
import type { SalesActivity } from "@/shared/types/salesActivity";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import { createActivityColumns } from "@/modules/sales/components/SalesActivityTableColumns";
import { ActivitiesFilterBar } from "@/modules/sales/components/ActivitiesFilterBar";
import { ActivityBulkActions } from "@/modules/sales/components/ActivityBulkActions";
import { salesService } from "@/shared/services/salesService";

export default function SalesActivitiesPage() {
  const [activities, setActivities] = useState<SalesActivity[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, completed: 0, upcoming: 0, followUpNeeded: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activitiesRes, statsRes] = await Promise.all([
          salesService.getActivities(),
          salesService.getActivityStats()
        ]);
        if (activitiesRes.success && activitiesRes.data) {
          setActivities(activitiesRes.data.activities);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Failed to load sales activities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(() => createActivityColumns(), []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        search === "" ||
        activity.subject.toLowerCase().includes(search.toLowerCase()) ||
        activity.salesAgentName.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || activity.activityType === typeFilter;
      const matchesOutcome = outcomeFilter === "all" || activity.outcome === outcomeFilter;

      return matchesSearch && matchesType && matchesOutcome;
    });
  }, [activities, search, typeFilter, outcomeFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setOutcomeFilter("all");
  };

  const handleExport = (selectedIds: string[]) => {
    console.log("Exporting selected activities:", selectedIds);
  };

  const handleDelete = (selectedIds: string[]) => {
    console.log("Deleting selected activities:", selectedIds);
  };

  const handleMarkComplete = (selectedIds: string[]) => {
    console.log("Marking activities as complete:", selectedIds);
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
            <h1 className="text-3xl font-bold">Sales Activities</h1>
            <p className="text-muted-foreground mt-2">Track and log all sales activities</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
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
            title="Total Activities"
            value={stats.total.toString()}
            change="All time"
            icon={<ListChecks className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All Activities",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "Log Activity",
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
            title="Completed"
            value={stats.completed.toString()}
            change="Finished tasks"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View Completed",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Upcoming"
            value={stats.upcoming.toString()}
            change="Scheduled"
            icon={<Calendar className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              {
                label: "View Schedule",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="Follow-ups"
            value={stats.followUpNeeded.toString()}
            change="Need attention"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              {
                label: "View Follow-ups",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { }
              },
              {
                label: "Mark Complete",
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
        </div>

        <ActivitiesFilterBar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          outcomeFilter={outcomeFilter}
          onOutcomeFilterChange={setOutcomeFilter}
          onClearFilters={handleClearFilters}
        />

        <DataTable
          columns={columns}
          data={filteredActivities}
          selectable
          renderBulkActions={(selectedIds) => (
            <ActivityBulkActions
              selectedCount={selectedIds.length}
              onExport={() => handleExport(selectedIds)}
              onDelete={() => handleDelete(selectedIds)}
              onMarkComplete={() => handleMarkComplete(selectedIds)}
              onClearSelection={() => { }}
            />
          )}
          exportable
          exportFilename="sales-activities"
        />
      </div>
    </div>
  );
}
