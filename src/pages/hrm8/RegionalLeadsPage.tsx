import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { regionalSalesService, RegionalLead } from '@/shared/lib/hrm8/regionalSalesService';
import { regionService, Region } from '@/shared/lib/hrm8/regionService';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import {
  Mail,
  Phone,
  Globe,
  UserPlus,
  Loader2,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { apiClient } from '@/shared/lib/api';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';

interface Consultant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function RegionalLeadsPage() {
  const { } = useHrm8Auth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<RegionalLead[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  // Reassign Dialog State
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<RegionalLead | null>(null);
  const [targetConsultantId, setTargetConsultantId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      fetchLeads(selectedRegionId);
      fetchConsultants(selectedRegionId);
    }
  }, [selectedRegionId]);

  const fetchRegions = async () => {
    try {
      const response = await regionService.getAll();
      if (response && response.data?.regions && response.data.regions.length > 0) {
        setRegions(response.data.regions);
        // Default to first region or from URL
        const urlRegionId = searchParams.get('region');

        let defaultRegionId = urlRegionId;

        if (!defaultRegionId) {
          defaultRegionId = response.data.regions[0].id;
        }

        if (defaultRegionId) {
          setSelectedRegionId(defaultRegionId);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch regions');
    }
  };

  const fetchLeads = async (regionId: string) => {
    setLoading(true);
    try {
      const data = await regionalSalesService.getLeads(regionId);
      setLeads(data);
    } catch (error) {
      toast.error('Failed to fetch regional leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async (regionId: string) => {
    try {
      // Use existing endpoint for consultants in region
      const response = await apiClient.get<{ consultants: Consultant[] }>(`/api/hrm8/consultants?regionId=${regionId}`);
      if (response.success && response.data?.consultants) {
        setConsultants(response.data.consultants);
      }
    } catch (error) {
      console.error('Failed to fetch consultants', error);
    }
  };

  const handleReassign = async () => {
    if (!selectedLead || !targetConsultantId) return;

    setReassigning(true);
    try {
      const response = await regionalSalesService.reassignLead(selectedLead.id, targetConsultantId);
      if (response.success) {
        toast.success('Lead reassigned successfully');
        setReassignDialogOpen(false);
        fetchLeads(selectedRegionId);
      } else {
        toast.error(response.error || 'Failed to reassign lead');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reassign lead');
    } finally {
      setReassigning(false);
    }
  };

  const columns: Column<RegionalLead>[] = [
    {
      key: 'company_name',
      label: 'Company',
      render: (lead) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{lead.company_name}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" /> {lead.country}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (lead) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (lead) => (
        <Badge
          variant={lead.status === 'CONVERTED' ? 'default' : 'secondary'}
          className={
            lead.status === 'NEW' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
              lead.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                lead.status === 'CONVERTED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                  ''
          }
        >
          {lead.status}
        </Badge>
      ),
    },
    {
      key: 'creator',
      label: 'Created By',
      render: (lead) => (
        <div className="flex items-center gap-2">
          {lead.creator ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {lead.creator.first_name} {lead.creator.last_name}
              </span>
              <span className="text-xs text-muted-foreground">{lead.creator.email}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground italic">System</span>
          )}
        </div>
      ),
    },
    {
      key: 'consultant',
      label: 'Assigned To',
      render: (lead) => (
        <div className="flex items-center gap-2">
          {lead.consultant ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {lead.consultant.first_name} {lead.consultant.last_name}
              </span>
              <span className="text-xs text-muted-foreground">{lead.consultant.email}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (lead) => (
        <span className="text-sm text-muted-foreground">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedLead(lead);
            setTargetConsultantId(lead.assigned_consultant_id || '');
            setReassignDialogOpen(true);
          }}
          disabled={lead.status === 'CONVERTED'}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Reassign
        </Button>
      ),
    },
  ];

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regional Leads</h1>
            <p className="text-muted-foreground">Manage and reassign sales leads across your region.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedRegionId}
                onValueChange={(val) => {
                  setSelectedRegionId(val);
                  const params = new URLSearchParams(searchParams);
                  params.set('region', val);
                  setSearchParams(params);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Leads</CardTitle>
                <CardDescription>
                  Total leads in this region: {leads.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={7} />
            ) : (
              <DataTable
                data={leads}
                columns={columns}
                searchable
                searchKeys={['company_name', 'email', 'country']}
                emptyMessage="No leads found for this region"
              />
            )}
          </CardContent>
        </Card>

        {/* Reassign Lead Dialog */}
        <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reassign Lead</DialogTitle>
              <DialogDescription>
                Select a new sales agent for {selectedLead?.company_name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Sales Agent</label>
                <Select
                  value={targetConsultantId}
                  onValueChange={setTargetConsultantId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.first_name} {agent.last_name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleReassign}
                disabled={reassigning || !targetConsultantId || targetConsultantId === selectedLead?.assigned_consultant_id}
              >
                {reassigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reassigning...
                  </>
                ) : (
                  'Confirm Reassignment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  );
}
