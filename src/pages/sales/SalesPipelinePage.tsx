import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Plus, Target, DollarSign, TrendingUp, Award, LayoutGrid, List, Download, BarChart3, Loader2, Briefcase, Users, ChevronsUpDown, Check } from "lucide-react";
import { DataTable } from "@/shared/components/tables/DataTable";
import { salesService, PipelineStats } from "@/shared/services/salesService";
import { regionalSalesService, RegionalOpportunity } from "@/shared/lib/hrm8/regionalSalesService";
import { consultant360Service } from "@/shared/lib/consultant360/consultant360Service";
import type { SalesOpportunity, OpportunityStage, OpportunityType } from "@/shared/types/salesOpportunity";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import { createOpportunityColumns } from "@/modules/sales/components/SalesOpportunityTableColumns";
import { OpportunitiesFilterBar } from "@/modules/sales/components/OpportunitiesFilterBar";
import { OpportunityBulkActions } from "@/modules/sales/components/OpportunityBulkActions";
import { useToast } from "@/shared/hooks/use-toast";
import { exportOpportunities } from "@/shared/lib/salesExportService";
import { SalesExportDialog, ExportConfig } from "@/modules/sales/components/SalesExportDialog";
import { formatCurrency, cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { regionService, Region } from '@/shared/services/hrm8/regionService';

// Types for recruiting pipeline
interface RecruitingStats {
  activeJobs: number;
  totalPlacements: number;
  recruiterEarnings: number;
  pendingBalance: number;
}

// Unified Opportunity Type for internal state
interface Opportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: string;
  salesAgentId: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
  salesAgentName: string;
  employerName: string;
  company?: {
    id: string;
    name: string;
    domain: string;
  };
}

export default function SalesPipelinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Admin / Regional Context
  const isHrm8 = location.pathname.startsWith('/hrm8');
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  // Recruiting stats for Consultant360 unified view
  const [recruitingStats, setRecruitingStats] = useState<RecruitingStats | null>(null);

  // Check if we're in Consultant360 context
  const isConsultant360 = location.pathname.startsWith('/consultant360');

  // Filter state for table view
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<OpportunityStage | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'all'>('all');

  const stages: OpportunityStage[] = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

  useEffect(() => {
    if (isHrm8) {
      fetchRegions();
    } else {
      fetchData();
    }
  }, [isHrm8]);

  // For Admin: Fetch data when region changes
  useEffect(() => {
    if (isHrm8 && selectedRegionId) {
      // Update URL params
      const params = new URLSearchParams(searchParams);
      params.set('region', selectedRegionId);
      setSearchParams(params, { replace: true });
      fetchData();
    }
  }, [selectedRegionId, isHrm8]);

  const fetchRegions = async () => {
    try {
      const response = await regionService.getAll();
      const regionsList = response.data?.regions || [];
      setRegions(regionsList);

      // Restore from URL params or use first region
      const regionFromUrl = searchParams.get('region');

      if (regionFromUrl && regionsList.find(r => r.id === regionFromUrl)) {
        setSelectedRegionId(regionFromUrl);
      } else if (regionsList.length > 0) {
        setSelectedRegionId(regionsList[0].id);
      } else {
        // No regions found, stop loading
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load regions.",
        variant: "destructive"
      });
    }
  };

  const fetchData = async () => {
    try {
      console.log('[SalesPipelinePage] 🚀 Starting data fetch...');
      console.log('[SalesPipelinePage] 📍 Is Consultant360:', isConsultant360, 'Is Admin:', isHrm8);
      setLoading(true);

      let oppsData: any[] = [];
      let statsData: PipelineStats | null = null;

      if (isHrm8) {
        if (!selectedRegionId) {
            setLoading(false);
            return;
        }
        // Admin: Use regionalSalesService
        const [oppsResponse, statsResponse] = await Promise.all([
          regionalSalesService.getOpportunities(selectedRegionId),
          regionalSalesService.getStats(selectedRegionId)
        ]);

        // Map RegionalOpportunity to internal Opportunity type
        oppsData = oppsResponse.map((opp: RegionalOpportunity) => ({
            id: opp.id,
            name: opp.name,
            stage: opp.stage,
            amount: opp.amount || 0,
            estimatedValue: opp.amount || 0,
            probability: opp.probability || 0,
            expectedCloseDate: opp.expected_close_date,
            salesAgentId: opp.sales_agent_id,
            companyId: opp.company.id,
            salesAgentName: opp.sales_agent ? `${opp.sales_agent.first_name} ${opp.sales_agent.last_name}` : 'Unassigned',
            employerName: opp.company.name,
            company: opp.company,
            createdAt: new Date().toISOString(), // Fallback as regional svc might not return created_at
            updatedAt: new Date().toISOString()
        }));

        statsData = statsResponse ? {
            totalPipelineValue: statsResponse.totalPipelineValue,
            weightedPipelineValue: statsResponse.weightedPipelineValue,
            dealCount: statsResponse.dealCount,
            byStage: statsResponse.byStage
        } : null;

      } else {
        // Consultant/Sales Agent: Use salesService
        const [oppsResponse, statsResponse] = await Promise.all([
          salesService.getOpportunities(),
          salesService.getPipelineStats()
        ]);

        if (oppsResponse.data) {
          oppsData = oppsResponse.data.opportunities;
        }
        if (statsResponse.data) {
           statsData = statsResponse.data;
        }
      }

      setOpportunities(oppsData);
      setStats(statsData);

      // If Consultant360, also fetch recruiting stats
      if (isConsultant360) {
        try {
          const dashboardResponse = await consultant360Service.getDashboard();
          if (dashboardResponse.success && dashboardResponse.data?.stats) {
            const s = dashboardResponse.data.stats;
            setRecruitingStats({
              activeJobs: s.activeJobs || 0,
              totalPlacements: s.totalPlacements || 0,
              recruiterEarnings: s.recruiterEarnings || 0,
              pendingBalance: s.pendingBalance || 0,
            });
            console.log('[SalesPipelinePage] ✅ Recruiting stats:', s);
          }
        } catch (err) {
          console.error('[SalesPipelinePage] ⚠️ Failed to fetch recruiting stats:', err);
        }
      }

      console.log('[SalesPipelinePage] ✅ Data fetch complete');
    } catch (error) {
      console.error("[SalesPipelinePage] ❌ Failed to fetch pipeline data:", error);
      toast({
        title: "Error",
        description: "Failed to load pipeline data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  // Helper function to map backend stages to frontend stages
  const mapStageToFrontend = (backendStage: string): OpportunityStage => {
    const stageMap: Record<string, OpportunityStage> = {
      'NEW': 'prospecting',
      'QUALIFICATION': 'qualification',
      'PROPOSAL': 'proposal',
      'NEGOTIATION': 'negotiation',
      'CLOSED_WON': 'closed-won',
      'CLOSED_LOST': 'closed-lost',
    };
    const mappedStage = stageMap[backendStage] || 'prospecting';
    return mappedStage;
  };

  // Transform API opportunities to match UI expected format
  const mappedOpportunities: SalesOpportunity[] = opportunities.map(opp => {
    return {
      id: opp.id,
      employerId: opp.companyId, // Map companyId to employerId
      employerName: opp.employerName || 'Unknown Company',
      salesAgentId: opp.salesAgentId,
      salesAgentName: opp.salesAgentName || 'Me',

      // Opportunity Details
      name: opp.name,
      type: 'new-business', // Default
      productType: 'ats-subscription', // Default

      // Financial
      estimatedValue: opp.estimatedValue || opp.amount || 0,
      probability: opp.probability || 0,
      expectedCloseDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toISOString() : new Date().toISOString(),

      // Sales Pipeline
      stage: mapStageToFrontend(opp.stage),
      priority: 'medium',

      // Tracking
      leadSource: 'outbound', // Default

      createdAt: opp.createdAt ? new Date(opp.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: opp.updatedAt ? new Date(opp.updatedAt).toISOString() : new Date().toISOString(),
    };
  });

  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage] = mappedOpportunities.filter(opp => opp.stage === stage);
    return acc;
  }, {} as Record<OpportunityStage, SalesOpportunity[]>);

  // Filter opportunities for table view
  const filteredOpportunities = mappedOpportunities.filter((opp) => {
    const matchesSearch =
      search === '' ||
      opp.name.toLowerCase().includes(search.toLowerCase()) ||
      opp.employerName.toLowerCase().includes(search.toLowerCase());

    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    // const matchesType = typeFilter === 'all' || opp.type === typeFilter;

    return matchesSearch && matchesStage;
  });

  const handleClearFilters = () => {
    setSearch("");
    setStageFilter('all');
    setTypeFilter('all');
  };

  const handleExport = (selectedIds: string[], format: 'csv' | 'excel' = 'excel') => {
    const dataToExport = selectedIds.length > 0
      ? mappedOpportunities.filter(opp => selectedIds.includes(opp.id))
      : filteredOpportunities;

    exportOpportunities(dataToExport, format, 'sales-pipeline');

    toast({
      title: "Export Complete",
      description: `Exported ${dataToExport.length} opportunities as ${format.toUpperCase()}`,
    });
  };

  const handleDelete = (selectedIds: string[]) => {
    toast({
      title: "Delete Opportunities",
      description: `Deleting ${selectedIds.length} opportunities...`,
    });
  };

  const handleChangeStage = (selectedIds: string[]) => {
    toast({
      title: "Change Stage",
      description: `Updating stage for ${selectedIds.length} opportunities...`,
    });
  };

  const handleExportDialog = (config: ExportConfig) => {
    exportOpportunities(filteredOpportunities, config.format, 'sales-pipeline', {
      fields: config.fields,
      dateRange: config.dateRange,
    });

    toast({
      title: "Export Complete",
      description: `Exported ${filteredOpportunities.length} opportunities as ${config.format.toUpperCase()}`,
    });
  };

  if (loading && !opportunities.length && (!isHrm8 || (isHrm8 && !regions.length))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate combined pipeline value for Consultant360
  const totalPipelineValue = (stats?.totalPipelineValue || 0) + (recruitingStats?.recruiterEarnings || 0);
  const salesPipelineValue = stats?.totalPipelineValue || 0;
  const recruitingPipelineValue = recruitingStats?.recruiterEarnings || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isConsultant360 ? "Unified Pipeline" : isHrm8 ? "Regional Sales Pipeline" : "Sales Pipeline"}
            </h1>
            <p className="text-muted-foreground">
              {isConsultant360 ? "Combined view of your recruiting and sales pipeline" : isHrm8 ? "Manage opportunities across your region" : "Visualize and manage your sales opportunities"}
            </p>
          </div>
          <div className="text-base font-semibold flex items-center gap-2 flex-wrap">
              {isHrm8 && (
                 <Select value={selectedRegionId} onValueChange={setSelectedRegionId} disabled={regions.length === 0 || loading}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

            <div className="flex items-center border rounded-lg p-1 gap-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate(isConsultant360 ? "/consultant360/leads" : isHrm8 ? "/hrm8/leads" : "/sales/opportunities/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {isHrm8 ? "View Leads" : "New Opportunity"}
            </Button>
            <Button variant="outline" asChild>
              <Link to={isConsultant360 ? "/consultant360/dashboard" : isHrm8 ? "/hrm8/regional-sales" : "/sales-agent/dashboard"}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Stats for Consultant360 */}
      {isConsultant360 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <EnhancedStatCard
            title="Total Pipeline Value"
            value={formatCurrency(totalPipelineValue)}
            change="Combined recruiting + sales"
            icon={<DollarSign className="h-6 w-6" />}
            variant="success"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Recruiting Pipeline"
            value={formatCurrency(recruitingPipelineValue)}
            change={`${recruitingStats?.totalPlacements || 0} placements`}
            icon={<Briefcase className="h-6 w-6" />}
            variant="primary"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Sales Pipeline"
            value={formatCurrency(salesPipelineValue)}
            change={`${stats?.dealCount || 0} opportunities`}
            icon={<Target className="h-6 w-6" />}
            variant="warning"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Active Jobs"
            value={(recruitingStats?.activeJobs || 0).toString()}
            change="Assigned to you"
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Pending Earnings"
            value={formatCurrency(recruitingStats?.pendingBalance || 0)}
            change="Awaiting confirmation"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="neutral"
            showMenu={false}
          />
        </div>
      )}

      {/* Original Sales-only Stats (when NOT in Consultant360) */}
      {!isConsultant360 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Opportunities"
            value={(stats?.dealCount || 0).toString()}
            change="Active in pipeline"
            icon={<Target className="h-6 w-6" />}
            variant="neutral"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Pipeline Value"
            value={formatCurrency(stats?.totalPipelineValue || 0)}
            change="Total value"
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Weighted Value"
            value={formatCurrency(stats?.weightedPipelineValue || 0)}
            change="Risk adjusted"
            icon={<Award className="h-6 w-6" />}
            variant="success"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Avg Deal Size"
            value={formatCurrency((stats?.totalPipelineValue || 0) / (stats?.dealCount || 1))}
            change="Per opportunity"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="warning"
            showMenu={false}
          />
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageOpps = opportunitiesByStage[stage];
            const stageValue = stageOpps.reduce((sum, opp) => sum + opp.estimatedValue, 0);

            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <Card>
                  <div className="p-4 border-b">
                    <h3 className="text-base font-semibold capitalize">
                      {stage.replace('-', ' ')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stageOpps.length} opportunities • ${stageValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                    {stageOpps.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No opportunities
                      </p>
                    ) : (
                      stageOpps.map(opp => (
                        <Card key={opp.id} className="p-3 cursor-pointer">
                          <h4 className="font-medium text-sm">{opp.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{opp.employerName}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-semibold">${opp.estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{opp.salesAgentName}</p>
                        </Card>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <OpportunitiesFilterBar
            search={search}
            onSearchChange={setSearch}
            stageFilter={stageFilter}
            onStageFilterChange={(value) => setStageFilter(value as OpportunityStage | 'all')}
            typeFilter={typeFilter}
            onTypeFilterChange={(value) => setTypeFilter(value as OpportunityType | 'all')}
            onClearFilters={handleClearFilters}
          />
          <div className="overflow-x-auto -mx-1 px-1">
            <DataTable
              columns={createOpportunityColumns()}
              data={filteredOpportunities}
              selectable
              onSelectedRowsChange={() => { }}
              renderBulkActions={(selectedIds) => (
                <OpportunityBulkActions
                  selectedCount={selectedIds.length}
                  onExport={() => handleExport(selectedIds)}
                  onDelete={() => handleDelete(selectedIds)}
                  onChangeStage={() => handleChangeStage(selectedIds)}
                  onClearSelection={() => { }}
                />
              )}
              exportable
              exportFilename="sales-pipeline"
            />
          </div>
        </div>
      )}

      <SalesExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        exportType="opportunities"
        onExport={handleExportDialog}
        totalRecords={filteredOpportunities.length}
      />
    </div>
  );
}
