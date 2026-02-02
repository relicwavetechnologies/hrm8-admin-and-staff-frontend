/**
 * HRM8 Company Jobs Page
 * View all jobs for a specific company
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/tables/DataTable';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { ArrowLeft, Briefcase, Search, MapPin, Calendar, Building2, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';

interface CompanyJob {
  id: string;
  title: string;
  location: string;
  status: string;
  postedAt: string;
  applicants: number;
  views: number;
  clicks: number;
}

interface CompanyDetails {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
}

interface PaginatedJobsResponse {
  jobs: CompanyJob[];
  total: number;
  page: number;
  pageSize: number;
}

export default function Hrm8CompanyJobsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      loadJobs(currentPage);
    }
  }, [currentPage, companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const companyRes = await apiClient.get<{ company: CompanyDetails }>(`/api/hrm8/companies/${companyId}`);

      if (companyRes.data) {
        setCompany(companyRes.data.company);
      }

      // Load first page of jobs
      loadJobs(1);
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async (page: number = 1, size: number = pageSize) => {
    if (!companyId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', size.toString());

      const endpoint = `/api/hrm8/companies/${companyId}/jobs?${params.toString()}`;
      const jobsRes = await apiClient.get<PaginatedJobsResponse>(endpoint);

      if (jobsRes.data) {
        setJobs(jobsRes.data.jobs);
        setTotalJobs(jobsRes.data.total);
        setCurrentPage(jobsRes.data.page);
      } else {
        // Fallback for non-paginated endpoints
        const legacyRes = await apiClient.get<{ jobs: CompanyJob[] }>(`/api/hrm8/companies/${companyId}/jobs`);
        if (legacyRes.data) {
          setJobs(legacyRes.data.jobs);
          setTotalJobs(legacyRes.data.jobs.length);
        }
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      sortable: true,
      render: (job: CompanyJob) => (
        <div className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/hrm8/job-board/job/${job.id}`)}>
          {job.title}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (job: CompanyJob) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {job.location}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (job: CompanyJob) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          OPEN: 'default',
          FILLED: 'secondary',
          CLOSED: 'outline',
          CANCELLED: 'destructive'
        };
        return <Badge variant={variants[job.status] || 'secondary'}>{job.status}</Badge>;
      }
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (job: CompanyJob) => (
        <div className="text-sm text-muted-foreground">
          {job.views} views • {job.clicks} clicks • {job.applicants} applicants
        </div>
      )
    },
    {
      key: 'postedAt',
      label: 'Posted',
      render: (job: CompanyJob) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {job.postedAt}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (job: CompanyJob) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/hrm8/job-board/job/${job.id}`)}>
          View
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse text-muted-foreground">Loading company...</div>
        </div>
      
    );
  }

  if (!company) {
    return (
      
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hrm8/job-board')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Company Not Found</h1>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hrm8/job-board')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-10 rounded" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {company.industry && <span>{company.industry}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {company.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Jobs
                </CardTitle>
                <span className="text-sm text-muted-foreground">({totalJobs} total)</span>
                {loading && currentPage > 1 && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable
              data={filteredJobs}
              columns={columns}
              emptyMessage="No jobs found for this company"
            />

            {/* Pagination */}
            {totalJobs > pageSize && (
              <div className="border-t pt-4">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalJobs / pageSize)}
                  pageSize={pageSize}
                  totalItems={totalJobs}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                    loadJobs(1, size);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}
