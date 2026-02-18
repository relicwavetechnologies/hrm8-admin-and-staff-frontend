import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    MapPin,
    Globe,
    Building2,
    Users,
    Briefcase,
    TrendingUp,
    DollarSign,
    Award,
    Target,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { regionService, type Region } from '@/shared/lib/hrm8/regionService';
import { formatCurrency } from '@/shared/lib/utils'; // Ensure this utility is available or define locally

interface RegionProfileSheetProps {
    regionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RegionProfileSheet({
    regionId,
    open,
    onOpenChange
}: RegionProfileSheetProps) {
    const [region, setRegion] = useState<Region | null>(null);
    const [stats, setStats] = useState<any>(null); // Mock stats for now
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && regionId) {
            fetchRegionData(regionId);
        } else {
            setRegion(null);
            setStats(null);
        }
    }, [open, regionId]);

    const fetchRegionData = async (id: string) => {
        try {
            setLoading(true);
            // Fetch basic region info
            const regionRes = await regionService.getById(id);
            if (regionRes.success && regionRes.data?.region) {
                setRegion(regionRes.data.region);
            }

            // Mock advanced stats for the UI demo
            // In a real scenario, this would come from a dedicated endpoint like regionService.getStats(id)
            setTimeout(() => {
                setStats({
                    totalRevenue: 1250000,
                    revenueGrowth: 15.4,
                    activeCompanies: 45,
                    activeJobs: 12,
                    totalConsultants: 8,
                    avgDealSize: 12500,
                    pipelineValue: 450000,
                    topConsultants: [
                        { id: '1', name: 'Sarah Jenkins', role: 'Senior Recruiter', revenue: 154000, deals: 12, avatar: '' },
                        { id: '2', name: 'Mike Ross', role: 'Sales Manager', revenue: 142000, deals: 8, avatar: '' },
                        { id: '3', name: 'Jessica Pearson', role: 'Director', revenue: 98000, deals: 5, avatar: '' },
                        { id: '4', name: 'Harvey Specter', role: 'Closer', revenue: 88000, deals: 4, avatar: '' },
                        { id: '5', name: 'Louis Litt', role: 'Talent Acquisition', revenue: 76000, deals: 9, avatar: '' },
                    ],
                    revenueTrend: [
                        { month: 'Jan', revenue: 65000 },
                        { month: 'Feb', revenue: 59000 },
                        { month: 'Mar', revenue: 80000 },
                        { month: 'Apr', revenue: 81000 },
                        { month: 'May', revenue: 96000 },
                        { month: 'Jun', revenue: 110000 },
                        { month: 'Jul', revenue: 105000 },
                        { month: 'Aug', revenue: 125000 },
                    ]
                });
                setLoading(false);
            }, 800); // Simulate network delay

        } catch (error) {
            console.error('Failed to fetch region data', error);
            setLoading(false);
        }
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!open) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Region Analytics</SheetTitle>
                    <SheetDescription>Comprehensive performance overview</SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="space-y-6">
                        {/* Header Skeleton */}
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-16 w-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </div>
                        <Separator />
                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                        {/* Graph Skeleton */}
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        {/* List Skeleton */}
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-40" />
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    </div>
                ) : region && stats ? (
                    <div className="space-y-8">
                        {/* Region Header */}
                        <div className="flex items-start gap-5">
                            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <Globe className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold tracking-tight">{region.name}</h2>
                                    <Badge variant={region.isActive ? 'default' : 'secondary'} className="text-[10px] h-5 px-2">
                                        {region.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground flex items-center gap-3 text-sm mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{region.country}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5" />
                                        <span>{region.code}</span>
                                    </div>
                                </div>
                                {region.licensee ? (
                                    <div className="mt-3 flex items-center gap-2 text-sm bg-muted/40 p-2 rounded-md border border-border/50">
                                        <Badge variant="outline" className="text-[10px] h-5 bg-background">ABC Ownership</Badge>
                                        <span className="font-medium text-foreground">{region.licensee.name}</span>
                                        <span className="text-muted-foreground text-xs">({region.licensee.legalEntityName})</span>
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-sm bg-muted/40 p-2 rounded-md border border-border/50">
                                        <Badge variant="secondary" className="text-[10px] h-5">HRM8 Owned</Badge>
                                        <span className="text-muted-foreground text-xs">Directly managed region</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-card border-border/50 shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Revenue</span>
                                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    </div>
                                    <div className="text-xl font-semibold mt-1 tracking-tight">{formatMoney(stats.totalRevenue)}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600/90 font-medium">
                                        <TrendingUp className="h-2.5 w-2.5" />
                                        <span>+{stats.revenueGrowth}% YTD</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border/50 shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active Companies</span>
                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    </div>
                                    <div className="text-xl font-semibold mt-1 tracking-tight">{stats.activeCompanies}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <span>Across all sectors</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border/50 shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active Jobs</span>
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    </div>
                                    <div className="text-xl font-semibold mt-1 tracking-tight">{stats.activeJobs}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <span>Current openings</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border/50 shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Consultants</span>
                                        <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    </div>
                                    <div className="text-xl font-semibold mt-1 tracking-tight">{stats.totalConsultants}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <span>Active staff members</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Trend Graph */}
                        <Card className="border border-border/50 shadow-sm bg-card">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <Activity className="h-3.5 w-3.5" />
                                    Revenue Trajectory
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.revenueTrend}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(value) => `$${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                formatter={(value: number) => [formatMoney(value), 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performing Staff */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Target className="h-3.5 w-3.5" />
                                    Top Performers
                                </h3>
                                {/* <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button> */}
                            </div>
                            <div className="space-y-3">
                                {stats.topConsultants.map((consultant: any, index: number) => (
                                    <div key={consultant.id} className="group flex items-center justify-between p-2.5 rounded-lg border border-transparent bg-muted/20 hover:bg-muted/40 hover:border-border/50 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background text-[10px] font-medium text-muted-foreground border">
                                                {index + 1}
                                            </div>
                                            <Avatar className="h-8 w-8 border border-border">
                                                <AvatarImage src={consultant.avatar} />
                                                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                                    {consultant.name.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <div className="font-medium text-sm text-foreground/90">{consultant.name}</div>
                                                <div className="text-[11px] text-muted-foreground">{consultant.role}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-sm text-foreground/90">{formatMoney(consultant.revenue)}</div>
                                            <div className="text-[11px] text-muted-foreground">{consultant.deals} deals</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                        <Globe className="h-12 w-12 opacity-20" />
                        <p>Select a region to view detailed analytics</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
