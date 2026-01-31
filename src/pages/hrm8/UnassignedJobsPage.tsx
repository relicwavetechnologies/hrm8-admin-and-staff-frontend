/**
 * Unassigned Jobs Page
 * Shows list of jobs without assigned consultants
 */

import { useState, useEffect } from 'react';
import { jobAllocationService, UnassignedJob } from '@/shared/lib/hrm8/jobAllocationService';
import { regionService } from '@/shared/lib/hrm8/regionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { Briefcase, Users, MapPin, Filter, X } from 'lucide-react';
import { AssignConsultantDrawer } from '@/shared/components/hrm8/AssignConsultantDrawer';
import { Badge } from '@/shared/components/ui/badge';

export default function UnassignedJobsPage() {
    const [jobs, setJobs] = useState<UnassignedJob[]>([]);
    const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filters
    const [regionFilter, setRegionFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('');
    const [industryFilter, setIndustryFilter] = useState<string>('');

    useEffect(() => {
        loadRegions();
        loadJobs();
    }, []);

    useEffect(() => {
        loadJobs();
    }, [regionFilter, companyFilter, industryFilter]);

    const loadRegions = async () => {
        try {
            const response = await regionService.getAll({ isActive: true });
            if (response.success && response.data?.regions) {
                setRegions(response.data.regions.map(r => ({ id: r.id, name: r.name })));
            }
        } catch (error) {
            console.error('Failed to load regions:', error);
        }
    };

    const loadJobs = async () => {
        try {
            setLoading(true);
            const filters: { regionId?: string; companyId?: string } = {};
            if (regionFilter && regionFilter !== 'all') filters.regionId = regionFilter;
            if (companyFilter) filters.companyId = companyFilter;

            const response = await jobAllocationService.getUnassignedJobs(filters);
            if (response.success && response.data?.jobs) {
                let filteredJobs = response.data.jobs;

                // Client-side industry filter
                if (industryFilter) {
                    filteredJobs = filteredJobs.filter(job =>
                        job.category?.toLowerCase().includes(industryFilter.toLowerCase())
                    );
                }

                setJobs(filteredJobs);
            }
        } catch (error) {
            toast.error('Failed to load unassigned jobs');
        } finally {
            setLoading(false);
        }
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

    const clearFilters = () => {
        setRegionFilter('all');
        setCompanyFilter('');
        setIndustryFilter('');
    };

    const hasActiveFilters = (regionFilter && regionFilter !== 'all') || companyFilter || industryFilter;

    const columns = [
        {
            key: 'title',
            label: 'Job Title',
            sortable: true,
        },
        {
            key: 'location',
            label: 'Location',
            render: (job: UnassignedJob) => (
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{job.location}</span>
                </div>
            ),
        },
        {
            key: 'companyName',
            label: 'Company',
            render: (job: UnassignedJob) => job.companyName || 'Unknown',
        },
        {
            key: 'regionId',
            label: 'Region',
            render: (job: UnassignedJob) => {
                if (!job.regionId) return <span className="text-muted-foreground">Unassigned</span>;
                const region = regions.find(r => r.id === job.regionId);
                return region ? region.name : 'Unknown';
            },
        },
        {
            key: 'category',
            label: 'Industry',
            render: (job: UnassignedJob) => job.category || '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (job: UnassignedJob) => {
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
            render: (job: UnassignedJob) => (
                <Badge variant={job.assignmentMode === 'AUTO' ? 'default' : 'secondary'}>
                    {job.assignmentMode === 'AUTO' ? 'Auto' : 'Manual'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (job: UnassignedJob) => new Date(job.createdAt).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (job: UnassignedJob) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignClick(job.id)}
                >
                    <Users className="mr-2 h-4 w-4" />
                    Assign
                </Button>
            ),
        },
    ];

    return (
        
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Unassigned Jobs</h1>
                    <p className="text-muted-foreground">Jobs waiting for consultant assignment</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                            <div className="space-y-2 flex items-end">
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jobs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Unassigned Jobs ({jobs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading jobs...</div>
                        ) : (
                            <DataTable
                                data={jobs}
                                columns={columns}
                                searchable
                                searchKeys={['title', 'location', 'companyName']}
                                emptyMessage="No unassigned jobs found"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Assign Consultant Drawer */}
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
