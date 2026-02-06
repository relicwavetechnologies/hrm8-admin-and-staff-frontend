import { useEffect, useState } from 'react';
import { jobAllocationService, JobForAllocation } from '@/shared/lib/hrm8/jobAllocationService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { AssignConsultantDrawer } from '@/shared/components/hrm8/AssignConsultantDrawer';
import { Badge } from '@/shared/components/ui/badge';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { toast } from 'sonner';
import { Briefcase, Users, Filter, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useRegionStore } from '@/shared/stores/useRegionStore';

export default function JobAllocationPage() {
  const [jobs, setJobs] = useState<JobForAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filters
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'UNASSIGNED' | 'ASSIGNED' | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedCompany = useDebounce(companyFilter, 500);
  const debouncedIndustry = useDebounce(industryFilter, 500);
  const { selectedRegionId, regions } = useRegionStore();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegionId, debouncedCompany, debouncedIndustry, assignmentStatusFilter, debouncedSearch]);

  useEffect(() => {
    loadJobs();
  }, [selectedRegionId, debouncedCompany, debouncedIndustry, assignmentStatusFilter, debouncedSearch, currentPage, pageSize]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: {
        regionId?: string;
        companySearch?: string;
        industry?: string;
        assignmentStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'ALL';
        search?: string;
        limit?: number;
        offset?: number;
      } = {};

      if (selectedRegionId && selectedRegionId !== 'all') filters.regionId = selectedRegionId;
      if (debouncedCompany) {
        filters.companySearch = debouncedCompany;
      }
      if (debouncedIndustry) {
        filters.industry = debouncedIndustry;
      }
      filters.assignmentStatus = assignmentStatusFilter;
      if (debouncedSearch) filters.search = debouncedSearch;
      filters.limit = pageSize;
      filters.offset = (currentPage - 1) * pageSize;

      const response = await jobAllocationService.getJobsForAllocation(filters);
      if (response.success && response.data?.jobs) {
        setJobs(response.data.jobs);
        setTotalJobs(response.data.total ?? response.data.jobs.length);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
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

  const hasActiveFilters = companyFilter || industryFilter || searchTerm;

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
    
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Allocation</h1>
          <p className="text-muted-foreground">Manage open jobs and assign the best consultant</p>
        </div>

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
              Open Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={8} />
            ) : (
              <DataTable
                data={jobs}
                columns={columns}
                searchable={false}
                serverPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalJobs}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
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
    
  );
}
