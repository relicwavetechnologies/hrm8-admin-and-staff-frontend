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
import { Building2, Briefcase, Eye, MousePointerClick, Search, ArrowRight } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';

interface CompanyJobStats {
    id: string;
    name: string;
    logo?: string;
    domain?: string;
    totalJobs: number;
    activeJobs: number;
    onHoldJobs: number;
    totalViews: number;
    totalClicks: number;
}

export default function Hrm8JobBoardPage() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyJobStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ companies: CompanyJobStats[] }>('/api/hrm8/jobs/companies');
            if (response.data && response.data.companies) {
                setCompanies(response.data.companies);
            } else {
                console.error('Failed to load companies or invalid format');
                setCompanies([]);
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company =>
        (company.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStats = companies.reduce(
        (acc, company) => ({
            totalJobs: acc.totalJobs + company.totalJobs,
            activeJobs: acc.activeJobs + company.activeJobs,
            totalViews: acc.totalViews + company.totalViews,
            totalClicks: acc.totalClicks + company.totalClicks,
        }),
        { totalJobs: 0, activeJobs: 0, totalViews: 0, totalClicks: 0 }
    );

    return (
        
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Job Board Management</h1>
                    <p className="text-muted-foreground">Manage jobs across all companies with visibility controls and analytics</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Companies</p>
                                    <p className="text-2xl font-bold">{companies.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                                    <p className="text-2xl font-bold">{totalStats.activeJobs}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Eye className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Views</p>
                                    <p className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <MousePointerClick className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                                    <p className="text-2xl font-bold">{totalStats.totalClicks.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 max-w-sm"
                    />
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
                        {filteredCompanies.map((company) => (
                            <Card
                                key={company.id}
                                className="hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/hrm8/job-board/${company.id}`)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="h-8 w-8 rounded" />
                                                ) : (
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{company.name}</h3>
                                                {company.domain && (
                                                    <p className="text-xs text-muted-foreground">{company.domain}</p>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Active Jobs</p>
                                            <p className="text-lg font-semibold">{company.activeJobs}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Jobs</p>
                                            <p className="text-lg font-semibold">{company.totalJobs}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>{company.totalViews.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MousePointerClick className="h-3.5 w-3.5" />
                                            <span>{company.totalClicks.toLocaleString()}</span>
                                        </div>
                                        {company.onHoldJobs > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {company.onHoldJobs} on hold
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && filteredCompanies.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No companies match your search' : 'No companies with jobs found'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        
    );
}
