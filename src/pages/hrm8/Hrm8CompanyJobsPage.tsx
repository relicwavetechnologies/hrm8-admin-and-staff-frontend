/**
 * HRM8 Company Jobs Page
 * View all jobs for a specific company
 */

import { useState, useEffect, useMemo } from 'react';
import { SafeExternalLink } from '@/shared/components/SafeExternalLink';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DataTable } from '@/shared/components/tables/DataTable';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { ArrowLeft, Briefcase, Search, MapPin, Calendar, Building2, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';

interface CompanyJob {
  id: string;
  title: string;
  location: string;
  status: string;
  posted_at: string;
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
  page_size: number;
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
  const [sortBy, setSortBy] = useState<'most_applicants' | 'most_views' | 'most_clicks' | 'newest' | 'oldest'>('most_applicants');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minApplicants, setMinApplicants] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'none' | 'high_intent' | 'unseen'>('none');

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
        setJobs(Array.isArray(jobsRes.data.jobs) ? jobsRes.data.jobs : []);
        setTotalJobs(typeof jobsRes.data.total === 'number' ? jobsRes.data.total : 0);
        setCurrentPage(typeof jobsRes.data.page === 'number' ? jobsRes.data.page : 1);
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

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minApplicantsValue = minApplicants === 'all' ? 0 : Number(minApplicants);

    const base = jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const matchesSearch = !q || title.includes(q) || location.includes(q);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesApplicants = (job.applicants || 0) >= minApplicantsValue;

      const matchesQuick =
        quickFilter === 'none'
          ? true
          : quickFilter === 'high_intent'
            ? (job.applicants || 0) >= 10
            : (job.views || 0) > 0 && (job.clicks || 0) === 0;

      return matchesSearch && matchesStatus && matchesApplicants && matchesQuick;
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'most_applicants') return (b.applicants || 0) - (a.applicants || 0);
      if (sortBy === 'most_views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'most_clicks') return (b.clicks || 0) - (a.clicks || 0);
      if (sortBy === 'newest') return new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime();
      return new Date(a.posted_at || 0).getTime() - new Date(b.posted_at || 0).getTime();
    });
  }, [jobs, searchQuery, statusFilter, minApplicants, quickFilter, sortBy]);

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
      key: 'posted_at',
      label: 'Posted',
      render: (job: CompanyJob) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {job.posted_at}
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

      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
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
                <SafeExternalLink href={company.website} className="hover:underline">
                  {company.website}
                </SafeExternalLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
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

            <div className="flex flex-wrap items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[210px]">
                  <SelectValue placeholder="Sort jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most_applicants">Most applicants</SelectItem>
                  <SelectItem value="most_views">Most views</SelectItem>
                  <SelectItem value="most_clicks">Most clicks</SelectItem>
                  <SelectItem value="newest">Newest posted</SelectItem>
                  <SelectItem value="oldest">Oldest posted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="FILLED">Filled</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={minApplicants} onValueChange={setMinApplicants}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Min applicants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any applicants</SelectItem>
                  <SelectItem value="1">1+ applicants</SelectItem>
                  <SelectItem value="5">5+ applicants</SelectItem>
                  <SelectItem value="10">10+ applicants</SelectItem>
                  <SelectItem value="25">25+ applicants</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant={quickFilter === 'high_intent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter((prev) => (prev === 'high_intent' ? 'none' : 'high_intent'))}
              >
                High intent (10+ applicants)
              </Button>

              <Button
                type="button"
                variant={quickFilter === 'unseen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter((prev) => (prev === 'unseen' ? 'none' : 'unseen'))}
              >
                Unseen jobs (views, no clicks)
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSortBy('most_applicants');
                  setStatusFilter('all');
                  setMinApplicants('all');
                  setQuickFilter('none');
                }}
              >
                Reset filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            data={filteredJobs}
            columns={columns}
            emptyMessage="No jobs found for this company"
            resizable={false}
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
