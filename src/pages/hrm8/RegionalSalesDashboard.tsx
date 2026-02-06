
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { regionalSalesService, RegionalOpportunity, RegionalPipelineStats } from '@/shared/services/hrm8/regionalSalesService';
import { formatCurrency } from '@/shared/lib/utils';
import { Loader2, TrendingUp, Users, DollarSign, Activity, Target, Check, ChevronsUpDown } from 'lucide-react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { regionService, Region } from '@/shared/services/hrm8/regionService';
import { cn } from '@/shared/lib/utils';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';

// Pipeline Stages Color Map
const STAGE_COLORS: Record<string, string> = {
  NEW: '#3b82f6', // blue
  QUALIFICATION: '#8b5cf6', // violet
  PROPOSAL: '#f59e0b', // amber
  NEGOTIATION: '#ec4899', // pink
  CLOSED_WON: '#10b981', // emerald
  CLOSED_LOST: '#ef4444', // red
};

interface Agent {
  id: string;
  name: string;
}

export default function RegionalSalesDashboard() {
  useHrm8Auth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState<RegionalPipelineStats | null>(null);
  const [opportunities, setOpportunities] = useState<RegionalOpportunity[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [agentComboOpen, setAgentComboOpen] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // Initialize from URL query params
  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      // Update URL params
      const params = new URLSearchParams(searchParams);
      params.set('region', selectedRegionId);
      if (selectedAgentId !== 'all') {
        params.set('agent', selectedAgentId);
      } else {
        params.delete('agent');
      }
      setSearchParams(params, { replace: true });

      // Fetch data
      fetchData(selectedRegionId, selectedAgentId);
    }
  }, [selectedRegionId, selectedAgentId]);

  const fetchRegions = async () => {
    try {
      // If user is Global Admin, fetch all regions.
      // If Licensee, they might be restricted, but for now we fetch all available.
      const response = await regionService.getAll();
      const regionsList = response.data?.regions || [];
      setRegions(regionsList);

      // Restore from URL params or use first region
      const regionFromUrl = searchParams.get('region');
      const agentFromUrl = searchParams.get('agent');

      if (regionFromUrl && regionsList.find(r => r.id === regionFromUrl)) {
        setSelectedRegionId(regionFromUrl);
      } else if (regionsList.length > 0) {
        setSelectedRegionId(regionsList[0].id);
      } else {
        setLoading(false);
      }

      if (agentFromUrl) {
        setSelectedAgentId(agentFromUrl);
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      setLoading(false);
    }
  };

  const fetchData = async (regionId: string, agentId: string) => {
    // Use dataLoading for subsequent fetches, loading only for initial load
    if (stats || opportunities.length > 0) {
      setDataLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const filters = agentId !== 'all' ? { salesAgentId: agentId } : undefined;

      // Fetch stats and opportunities independently to prevent one failure from blocking the other
      const fetchStatsPromise = regionalSalesService.getStats(regionId)
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch stats:', err));

      const fetchOppsPromise = regionalSalesService.getOpportunities(regionId, filters)
        .then(data => {
            console.log('Opportunities fetched:', data);
            setOpportunities(data || []);
        })
        .catch(err => {
            console.error('Failed to fetch opportunities:', err);
            setOpportunities([]);
        });

      await Promise.allSettled([fetchStatsPromise, fetchOppsPromise]);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  // Extract unique agents from opportunities for the filter dropdown
  const uniqueAgents: Agent[] = Array.from(
    new Map(
      (opportunities || [])
        .filter(o => o.sales_agent_id && o.sales_agent)
        .map(o => [
          o.sales_agent_id,
          {
            id: o.sales_agent_id,
            name: `${o.sales_agent?.first_name} ${o.sales_agent?.last_name}`.trim()
          }
        ])
    ).values()
  );

  // Filter agents based on search query
  const filteredAgents = uniqueAgents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  // Get selected agent name for display
  const selectedAgentName = selectedAgentId === 'all'
    ? 'All Agents'
    : uniqueAgents.find(a => a.id === selectedAgentId)?.name || 'Select Agent';


  // Prepare chart data
  const chartData = stats ? Object.entries(stats.byStage).map(([stage, data]) => ({
    name: (stage || '').replace('_', ' '),
    value: data.value,
    count: data.count,
    color: STAGE_COLORS[stage] || '#94a3b8'
  })) : [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regional Sales Pipeline</h1>
            <p className="text-muted-foreground">
              Monitor sales performance and forecast for your region
            </p>
          </div>

          <div className="flex items-center gap-2">
            {regions.length === 0 && !loading && (
               <div className="text-sm text-amber-600 font-medium mr-2">No regions found</div>
            )}
            <Select value={selectedRegionId} onValueChange={setSelectedRegionId} disabled={regions.length === 0 || dataLoading}>
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
            <Button
              variant="outline"
              onClick={() => selectedRegionId && fetchData(selectedRegionId, selectedAgentId)}
              disabled={!selectedRegionId || dataLoading}
            >
              {dataLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>

        {/* Agent Filter - Searchable Combobox */}
        {uniqueAgents.length > 0 && (
          <div className="flex items-center gap-3 bg-muted/40 p-4 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by Agent:</span>
            <Popover open={agentComboOpen} onOpenChange={setAgentComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={agentComboOpen}
                  className="w-[280px] justify-between"
                  disabled={dataLoading}
                >
                  {dataLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading agents...
                    </>
                  ) : (
                    <>
                      {selectedAgentName}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search agents..."
                    value={agentSearchQuery}
                    onValueChange={setAgentSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No agent found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedAgentId('all');
                          setAgentComboOpen(false);
                          setAgentSearchQuery('');
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedAgentId === 'all' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Agents ({uniqueAgents.length})
                      </CommandItem>
                      {filteredAgents.slice(0, 10).map((agent) => (
                        <CommandItem
                          key={agent.id}
                          value={agent.id}
                          onSelect={() => {
                            setSelectedAgentId(agent.id);
                            setAgentComboOpen(false);
                            setAgentSearchQuery('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedAgentId === agent.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {agent.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedAgentId !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAgentId('all')}
                className="text-xs"
                disabled={dataLoading}
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards with Loading Overlay */}
      <div className="relative">
        {dataLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Updating data...</span>
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Pipeline Value"
            value={formatCurrency(stats?.totalPipelineValue || 0)}
            rawValue={stats?.totalPipelineValue || 0}
            change={`Across ${stats?.dealCount || 0} active deal${stats?.dealCount !== 1 ? 's' : ''}`}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            isCurrency={true}
            showMenu={false}
          />
          <EnhancedStatCard
            title="Weighted Forecast"
            value={formatCurrency(stats?.weightedPipelineValue || 0)}
            rawValue={stats?.weightedPipelineValue || 0}
            change="Risk-adjusted projection"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            isCurrency={true}
            showMenu={false}
          />
          <EnhancedStatCard
            title="Active Sales Agents"
            value={(stats?.activeAgents || 0).toString()}
            change="Contributing to pipeline"
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={false}
          />
          <EnhancedStatCard
            title="Avg. Deal Size"
            value={formatCurrency((stats?.totalPipelineValue || 0) / (stats?.dealCount || 1))}
            rawValue={(stats?.totalPipelineValue || 0) / (stats?.dealCount || 1)}
            change="Per opportunity"
            icon={<Target className="h-6 w-6" />}
            variant="warning"
            isCurrency={true}
            showMenu={false}
          />
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="relative grid gap-4 md:grid-cols-7">
        {dataLoading && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 rounded-lg pointer-events-none" />
        )}

        {/* Pipeline Chart */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>
              Distribution of opportunities across the sales funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[340px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => {
                        const count = props?.payload?.count ?? 0;
                        return [formatCurrency(value), `${count} deal${count !== 1 ? 's' : ''}`];
                      }}
                      cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No pipeline data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deals Table */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Opportunities</CardTitle>
            <CardDescription>
              Latest deals added by your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
              {opportunities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">No opportunities found</p>
                  <p className="text-xs text-muted-foreground">Try selecting a different region or agent filter.</p>
                </div>
              ) : (
                opportunities.slice(0, 5).map((opp) => (
                  <div key={opp.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-md transition-colors">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{opp.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {opp.company?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {opp.sales_agent?.first_name} {opp.sales_agent?.last_name}
                      </p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="text-sm font-bold whitespace-nowrap">{formatCurrency(opp.amount || 0)}</div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] mt-1.5"
                        style={{
                          backgroundColor: STAGE_COLORS[opp.stage] + '15',
                          color: STAGE_COLORS[opp.stage],
                          borderColor: STAGE_COLORS[opp.stage] + '30'
                        }}
                      >
                        {(opp.stage || '').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <div className="relative">
        {dataLoading && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 rounded-lg pointer-events-none" />
        )}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Opportunities</CardTitle>
              <CardDescription className="mt-1">
                Complete list of {opportunities.length} opportunit{opportunities.length !== 1 ? 'ies' : 'y'} in the pipeline
              </CardDescription>
            </div>
            {opportunities.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {opportunities.length} Total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Opportunity Name</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Sales Agent</TableHead>
                  <TableHead className="font-semibold">Stage</TableHead>
                  <TableHead className="font-semibold">Probability</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
                          <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No opportunities found</p>
                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or selecting a different region.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  opportunities.map((opp) => (
                    <TableRow key={opp.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{opp.name}</TableCell>
                      <TableCell>{opp.company?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {opp.sales_agent?.first_name} {opp.sales_agent?.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: STAGE_COLORS[opp.stage] + '15',
                            color: STAGE_COLORS[opp.stage],
                            borderColor: STAGE_COLORS[opp.stage] + '40'
                          }}
                          variant="outline"
                          className="font-medium"
                        >
                          {(opp.stage || '').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5 w-12">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${opp.probability}%`,
                                backgroundColor: STAGE_COLORS[opp.stage]
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{opp.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(opp.amount || 0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
