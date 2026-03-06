import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Target, DollarSign, TrendingUp, UserCheck, Users, ListFilter } from 'lucide-react';
import { regionalSalesService } from '@/shared/lib/hrm8/regionalSalesService';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/shared/lib/utils';

interface LeadsOverviewData {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    totalPipelineValue: number;
    weightedPipelineValue: number;
    pendingConversionRequests: number;
    dealCount: number;
}

function LeadsOverviewSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-5 w-80" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <Card key={item}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <Card key={item}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function LeadsOverviewPage() {
    const navigate = useNavigate();
    const { selectedRegionId, regions } = useRegionStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<LeadsOverviewData | null>(null);

    const effectiveRegionId = selectedRegionId === 'all' || !selectedRegionId
        ? regions[0]?.id
        : selectedRegionId;

    useEffect(() => {
        const loadOverview = async () => {
            if (!effectiveRegionId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [leadsResponse, statsResponse, conversionResponse] = await Promise.all([
                    regionalSalesService.getLeads(effectiveRegionId),
                    regionalSalesService.getStats(effectiveRegionId),
                    // Fetch conversion requests count - you may need to add this endpoint
                    fetch(`/api/hrm8/conversion-requests?status=PENDING&region=${effectiveRegionId}`).then(r => r.json()).catch(() => ({ requests: [] }))
                ]);

                const leads = leadsResponse || [];
                const stats = statsResponse || { totalPipelineValue: 0, weightedPipelineValue: 0, dealCount: 0 };

                // Calculate lead status counts
                const newLeads = leads.filter((l: any) => l.status === 'NEW').length;
                const qualifiedLeads = leads.filter((l: any) => l.status === 'QUALIFIED').length;
                const convertedLeads = leads.filter((l: any) => l.status === 'CONVERTED').length;

                setData({
                    totalLeads: leads.length,
                    newLeads,
                    qualifiedLeads,
                    convertedLeads,
                    totalPipelineValue: stats.totalPipelineValue || 0,
                    weightedPipelineValue: stats.weightedPipelineValue || 0,
                    dealCount: stats.dealCount || 0,
                    pendingConversionRequests: conversionResponse?.requests?.length || 0,
                });
            } catch (error) {
                console.error('Failed to load leads overview:', error);
                toast.error('Failed to load leads overview');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [effectiveRegionId]);

    if (loading) {
        return <LeadsOverviewSkeleton />;
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    Unable to load leads overview.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads Overview</h1>
                <p className="text-muted-foreground">Summary of sales pipeline, lead activity, and conversion requests</p>
            </div>

            {/* Pipeline Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Leads</CardDescription>
                        <CardTitle className="text-2xl">{data.totalLeads}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <Users className="inline h-4 w-4 mr-1" />
                        All regional leads
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pipeline Value</CardDescription>
                        <CardTitle className="text-2xl">{formatCurrency(data.totalPipelineValue)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        {data.dealCount} opportunities
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Weighted Value</CardDescription>
                        <CardTitle className="text-2xl">{formatCurrency(data.weightedPipelineValue)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <TrendingUp className="inline h-4 w-4 mr-1" />
                        Risk adjusted
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate('/hrm8/leads/conversion')}
                >
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Requests</CardDescription>
                        <CardTitle className="text-2xl">{data.pendingConversionRequests}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <UserCheck className="inline h-4 w-4 mr-1" />
                        Conversion requests
                    </CardContent>
                </Card>
            </div>

            {/* Lead Status Breakdown */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 dark:text-blue-400">New Leads</CardDescription>
                        <CardTitle className="text-2xl">{data.newLeads}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Recently created
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-purple-600 dark:text-purple-400">Qualified Leads</CardDescription>
                        <CardTitle className="text-2xl">{data.qualifiedLeads}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        In qualification
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-600 dark:text-green-400">Converted</CardDescription>
                        <CardTitle className="text-2xl">{data.convertedLeads}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Successfully converted
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Conversion Rate</CardDescription>
                        <CardTitle className="text-2xl">
                            {data.totalLeads > 0 ? Math.round((data.convertedLeads / data.totalLeads) * 100) : 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Lead to customer
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">View All Leads</CardTitle>
                        <CardDescription>Browse and manage all regional leads</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => navigate('/hrm8/leads/list')}>
                            <ListFilter className="h-4 w-4 mr-2" />
                            View Leads
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sales Pipeline</CardTitle>
                        <CardDescription>Visualize opportunities in the pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => navigate('/hrm8/sales-pipeline')}>
                            <Target className="h-4 w-4 mr-2" />
                            View Pipeline
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Conversion Requests</CardTitle>
                        <CardDescription>Review and approve lead conversion requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => navigate('/hrm8/leads/conversion')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Review Requests
                            {data.pendingConversionRequests > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {data.pendingConversionRequests}
                                </span>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
