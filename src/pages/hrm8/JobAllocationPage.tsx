/**
 * Job Allocation Page
 * HRM8 Global Admin job allocation management
 */

import { useEffect, useState } from 'react';
import { jobAllocationService, JobForAllocation } from '@/shared/lib/hrm8/jobAllocationService';
import { regionService } from '@/shared/lib/hrm8/regionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { AssignConsultantDrawer } from '@/shared/components/hrm8/AssignConsultantDrawer';
import { Badge } from '@/shared/components/ui/badge';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { toast } from 'sonner';
import { Briefcase, Users, Filter, X } from 'lucide-react';

import { useDebounce } from '@/shared/hooks/use-debounce';

export default function JobAllocationPage() {
  const [jobs, setJobs] = useState<JobForAllocation[]>([]);
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'UNASSIGNED' | 'ASSIGNED' | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedCompany = useDebounce(companyFilter, 500);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [regionFilter, debouncedCompany, industryFilter, assignmentStatusFilter, debouncedSearch]);

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll({ isActive: true });
      if (response.success && response.data?.regions) {
        setRegions(response.data.regions.map((r) => ({ id: r.id, name: r.name })));
      }
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: {
        regionId?: string;
        companyId?: string;
        assignmentStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'ALL';
        search?: string;
      } = {};

      if (regionFilter && regionFilter !== 'all') filters.regionId = regionFilter;
      // Only generic search supported for company name via main search
      if (debouncedCompany) {
        // If strictly need company filter, it assumes ID currently. 
        // If typed text, we might want to use it as search or ignore. 
        // For now, let's treat it as ID or exact match if backend supported it, 
        // but backend expects UUID. Let's skip sending it if not UUID-like to avoid 500s?
        // Or just let it fail/return empty. 
        filters.companyId = debouncedCompany;
      }
      filters.assignmentStatus = assignmentStatusFilter;
      if (debouncedSearch) filters.search = debouncedSearch;

      const response = await jobAllocationService.getJobsForAllocation(filters);
      if (response.success && response.data?.jobs) {
        let filteredJobs = response.data.jobs;

        if (industryFilter) {
          filteredJobs = filteredJobs.filter((job) =>
            job.category?.toLowerCase().includes(industryFilter.toLowerCase())
          );
        }

        setJobs(filteredJobs);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setRegionFilter('all');
    setCompanyFilter('');
    setIndustryFilter('');
    setAssignmentStatusFilter('ALL');
    setSearchTerm('');
  };

  const handleAssignClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setDrawerOpen(true);
  };

  const handleAssignSuccess = () => {
    setDrawerOpen(false);
    setSelectedJobId(null);
    loadJobs();
  };

  const hasActiveFilters = (regionFilter && regionFilter !== 'all') || companyFilter || industryFilter || searchTerm;

  // Client side search removed as backend handles it
  const filteredJobs = jobs;

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'assignedConsultantName',
      label: 'Consultant',
      render: (job: JobForAllocation) => job.assignedConsultantName || <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      key: 'regionId',
      label: 'Assigned Region',
      render: (job: JobForAllocation) => {
        if (!job.regionId) return <span className="text-muted-foreground">Unassigned</span>;
        const region = regions.find(r => r.id === job.regionId);
        return region ? region.name : 'Unknown';
      },
    },
    {
      key: 'category',
      label: 'Industry',
      render: (job: JobForAllocation) => job.category || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (job: JobForAllocation) => {
        const status = job.status || 'UNKNOWN';
        const isOpen = status === 'OPEN';
        const isOnHold = status === 'ON_HOLD';
        return (
          <Badge
            variant={isOpen ? 'default' : isOnHold ? 'secondary' : 'outline'}
            className={isOpen ? 'bg-green-500 hover:bg-green-600' : isOnHold ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            {isOpen ? 'Open' : isOnHold ? 'On Hold' : status}
          </Badge>
        );
      },
    },
    {
      key: 'assignmentMode',
      label: 'Mode',
      render: (job: JobForAllocation) => (
        <Badge variant={job.assignmentMode === 'AUTO' ? 'default' : 'secondary'}>
          {job.assignmentMode === 'AUTO' ? 'Auto' : 'Manual'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (job: JobForAllocation) => new Date(job.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (job: JobForAllocation) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAssignClick(job.id)}
        >
          <Users className="mr-2 h-4 w-4" />
          {job.assignedConsultantId ? 'Reassign' : 'Assign'}
        </Button>
      ),
    },
  ];

  return (
    <Hrm8PageLayout
      title="Job Allocation"
      subtitle="Manage open jobs and assign the best consultant"
    >
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assignment Status</Label>
                <Select value={assignmentStatusFilter} onValueChange={(val: any) => setAssignmentStatusFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="UNASSIGNED">Unassigned Only</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Filter by company..."
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  placeholder="Filter by industry..."
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Open Jobs ({filteredJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={8} />
            ) : (
              <DataTable
                data={filteredJobs}
                columns={columns}
                searchable={false}
                emptyMessage="No unassigned jobs found"
              />
            )}
          </CardContent>
        </Card>

        {/* Assign Drawer */}
        {selectedJobId && (
          <AssignConsultantDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            jobId={selectedJobId}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </Hrm8PageLayout>
  );
}
