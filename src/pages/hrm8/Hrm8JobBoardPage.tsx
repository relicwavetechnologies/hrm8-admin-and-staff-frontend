/**
 * HRM8 Job Board Page
 * Global admin view of all companies with job counts
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Building2, Briefcase, Eye, MousePointerClick, Search, Filter } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { toast } from 'sonner';

interface CompanyJobStats {
    id: string;
    name: string;
    logo?: string;
    domain?: string;
    total_jobs: number;
    active_jobs: number;
    on_hold_jobs: number;
    total_views: number;
    total_clicks: number;
}

interface PaginatedCompaniesResponse {
    companies: CompanyJobStats[];
    total: number;
    page: number;
    page_size: number;
}

export default function Hrm8JobBoardPage() {
    const navigate = useNavigate();
    const { selectedRegionId, regions } = useRegionStore();

    const [companies, setCompanies] = useState<CompanyJobStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCompanies, setTotalCompanies] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCompanies(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when region changes
        loadCompanies(1);
    }, [selectedRegionId]);

    const loadCompanies = async (page: number = currentPage, size: number = pageSize) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', size.toString());

            // Add search query if present
            if (searchQuery) {
                params.append('search', searchQuery);
            }

            // Add region filter if selected
            if (selectedRegionId) {
                params.append('region', selectedRegionId);
            }

            const endpoint = `/api/hrm8/jobs/companies?${params.toString()}`;
            const response = await apiClient.get<PaginatedCompaniesResponse>(endpoint);

            if (response.success && response.data) {
                const data = response.data;
                setCompanies(Array.isArray(data.companies) ? data.companies : []);
                setTotalCompanies(typeof data.total === 'number' ? data.total : 0);
                setCurrentPage(typeof data.page === 'number' ? data.page : 1);
            } else {
                if (!response.success && response.error) toast.error(response.error || 'Failed to load companies');
                setCompanies([]);
                setTotalCompanies(0);
            }
        } catch (error) {
            toast.error('Failed to load companies');
            setCompanies([]);
            setTotalCompanies(0);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats only from current page companies
    const totalStats = companies.reduce(
        (acc, company) => ({
            totalJobs: acc.totalJobs + (company.total_jobs || 0),
            activeJobs: acc.activeJobs + (company.active_jobs || 0),
            totalViews: acc.totalViews + (company.total_views || 0),
            totalClicks: acc.totalClicks + (company.total_clicks || 0),
        }),
        { totalJobs: 0, activeJobs: 0, totalViews: 0, totalClicks: 0 }
    );

    const totalPages = Math.ceil(totalCompanies / pageSize);
    const selectedRegion = (regions || []).find((r) => r.id === selectedRegionId);

    return (
        <Hrm8PageLayout
            title="Job Board Management"
            subtitle="Manage jobs across all companies with visibility controls and analytics"
            actions={
                selectedRegion && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{selectedRegion.name}</span>
                    </div>
                )
            }
        >
            <div className="p-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Companies</p>
                                    <p className="text-xl font-bold">{totalCompanies}</p>
                                    {totalCompanies > pageSize && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Page: {currentPage}/{totalPages}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-green-500/10 rounded-lg">
                                    <Briefcase className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                                    <p className="text-xl font-bold">{totalStats.activeJobs}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Views</p>
                                    <p className="text-xl font-bold">{totalStats.totalViews.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                    <MousePointerClick className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                                    <p className="text-xl font-bold">{totalStats.totalClicks.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search companies by name or domain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 max-w-sm"
                    />
                    {!loading && searchQuery && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Found {totalCompanies} results for "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* Companies Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-24 mb-4" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map((company) => (
                            <Card
                                key={company.id}
                                className="group overflow-hidden hover:shadow-lg transition-values duration-200 cursor-pointer border-muted/60"
                                onClick={() => navigate(`/hrm8/job-board/${company.id}`)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex min-w-0 flex-1 items-center gap-3.5">
                                            <div className="h-12 w-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="h-8 w-8 rounded-lg object-contain" />
                                                ) : (
                                                    <Building2 className="h-6 w-6 text-primary/70" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate pr-2 text-base font-semibold leading-tight" title={company.name}>{company.name}</h3>
                                                {company.domain && (
                                                    <p className="mt-1 max-w-full truncate text-xs text-muted-foreground transition-colors hover:text-primary" title={company.domain}>
                                                        {company.domain}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="bg-muted/30 rounded-lg p-3 border border-muted/50">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Active</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-foreground">{company.active_jobs}</span>
                                                <span className="text-xs text-muted-foreground">jobs</span>
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3 border border-muted/50">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Total</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-foreground">{company.total_jobs}</span>
                                                <span className="text-xs text-muted-foreground">jobs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-auto">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                                <Eye className="h-3.5 w-3.5" />
                                                <span className="font-medium">{(company.total_views || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                                <MousePointerClick className="h-3.5 w-3.5" />
                                                <span className="font-medium">{(company.total_clicks || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {company.on_hold_jobs > 0 && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                                                {company.on_hold_jobs} hold
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && companies.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No companies match your search' : 'No companies with jobs found'}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {!loading && companies.length > 0 && totalPages > 1 && (
                    <div className="border-t pt-6">
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalCompanies}
                            onPageChange={(page) => loadCompanies(page, pageSize)}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                                loadCompanies(1, size);
                            }}
                        />
                    </div>
                )}
            </div>
        </Hrm8PageLayout>
    );
}
