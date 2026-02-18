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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Briefcase,
    MapPin,
    Mail,
    Phone,
    Target,
    Trophy,
    TrendingUp,
    Clock,
    Building2,
    Star,
    DollarSign,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { staffService, type StaffMember } from '@/shared/lib/hrm8/staffService';
import { cn } from '@/shared/lib/utils';

interface StaffProfileSheetProps {
    staffId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StaffProfileSheet({
    staffId,
    open,
    onOpenChange
}: StaffProfileSheetProps) {
    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [pendingTasks, setPendingTasks] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && staffId) {
            fetchStaffData(staffId);
        } else {
            setStaff(null);
            setStats(null);
            setPendingTasks(null);
        }
    }, [open, staffId]);

    const fetchStaffData = async (id: string) => {
        try {
            setLoading(true);
            const [staffRes, statsRes, tasksRes] = await Promise.all([
                staffService.getById(id),
                staffService.getStats(id),
                staffService.getPendingTasks(id)
            ]);

            setStaff(staffRes.data?.consultant || null);
            setStats(statsRes.data?.stats || null);
            setPendingTasks(tasksRes.data || null);
        } catch (error) {
            console.error('Failed to fetch staff data', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock performance data (replace with real API data if available later)
    const performanceData = [
        { month: 'Jan', revenue: 45000, placements: 2 },
        { month: 'Feb', revenue: 52000, placements: 3 },
        { month: 'Mar', revenue: 48000, placements: 2 },
        { month: 'Apr', revenue: 61000, placements: 4 },
        { month: 'May', revenue: 55000, placements: 3 },
        { month: 'Jun', revenue: 67000, placements: 5 },
    ];

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (!staff && !loading) return null;

    const isSales = staff?.role === 'SALES_AGENT';
    const isRecruiter = staff?.role === 'RECRUITER';
    const is360 = staff?.role === 'CONSULTANT_360';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Staff Profile</SheetTitle>
                    <SheetDescription>Detailed performance metrics and activity</SheetDescription>
                </SheetHeader>

                {loading ? (
                    <ProfileSkeleton />
                ) : staff ? (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-20 w-20 border-2 border-muted">
                                <AvatarImage src={staff.photo} />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                    {staff.firstName[0]}{staff.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        {staff.firstName} {staff.lastName}
                                    </h2>
                                    <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {staff.status}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>{staff.role.replace('_', ' ')}</span>
                                    <span className="mx-1">•</span>
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{staff.city || 'Remote'}, {staff.country}</span>
                                </div>
                                <div className="flex gap-4 pt-1 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        {staff.email}
                                    </div>
                                    {staff.phone && (
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5" />
                                            {staff.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Performance Graph */}
                        <Card className="border-none shadow-none bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Performance Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(value) => `$${value / 1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="hsl(var(--primary))"
                                                radius={[4, 4, 0, 0]}
                                                barSize={32}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics Grid - Dynamic based on Role */}
                        <div className="grid grid-cols-2 gap-4">
                            <MetricCard
                                label="Total Revenue"
                                value={formatMoney(staff.totalRevenue)}
                                icon={<DollarSign className="h-3 w-3" />}
                                trend="+12.5% vs last month"
                                trendUp
                            />

                            {(isRecruiter || is360) && (
                                <MetricCard
                                    label="Total Placements"
                                    value={staff.totalPlacements.toString()}
                                    icon={<Trophy className="h-3 w-3" />}
                                    subtext="High Performer"
                                />
                            )}

                            {(isRecruiter || is360) && (
                                <MetricCard
                                    label="Success Rate"
                                    value={`${staff.successRate}%`}
                                    icon={<Star className="h-3 w-3" />}
                                    trend="Top 10%"
                                    trendUp
                                />
                            )}

                            {(isSales || is360) && (
                                <MetricCard
                                    label="Lead Conversion"
                                    value={`${stats?.conversionRate || 0}%`}
                                    icon={<Target className="h-3 w-3" />}
                                    subtext={`${stats?.leadsCount || 0} Total Leads`}
                                />
                            )}

                            <MetricCard
                                label={isSales ? "Active Leads" : "Active Jobs"}
                                value={isSales ? (stats?.leadsCount || 0).toString() : (stats?.activeAssignments || 0).toString()}
                                icon={isSales ? <Users className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                                subtext="Current Workload"
                            />
                        </div>

                        {/* Recent Work / Current Assignments */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Activity</h3>

                            <Tabs defaultValue={isSales ? "leads" : "jobs"} className="w-full">
                                <TabsList className="w-full justify-start h-9 bg-transparent p-0 border-b rounded-none space-x-6">
                                    {(isRecruiter || is360) && (
                                        <TabsTrigger
                                            value="jobs"
                                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                                        >
                                            Active Jobs ({pendingTasks?.jobs?.length || 0})
                                        </TabsTrigger>
                                    )}
                                    {(isSales || is360) && (
                                        <TabsTrigger
                                            value="leads"
                                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                                        >
                                            Active Leads ({pendingTasks?.leads?.length || 0})
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger
                                        value="history"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                                    >
                                        Recent History
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="jobs" className="pt-4 space-y-3">
                                    {pendingTasks?.jobs?.length > 0 ? (
                                        pendingTasks.jobs.map((job: any) => (
                                            <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{job.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Building2 className="h-3 w-3" />
                                                        {job.companyName}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {job.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No active jobs assignments
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="leads" className="pt-4 space-y-3">
                                    {pendingTasks?.leads?.length > 0 ? (
                                        pendingTasks.leads.map((lead: any) => (
                                            <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{lead.companyName}</div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        Lead
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {lead.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No active leads
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="history" className="pt-4 space-y-3">
                                    {/* Mock history items */}
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="space-y-1">
                                            <div className="font-medium">Placed Senior React Developer</div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Building2 className="h-3 w-3" />
                                                TechCorp Solutions
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-emerald-600">+$12,500</div>
                                            <div className="text-xs text-muted-foreground">2 days ago</div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Staff member not found
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function MetricCard({ label, value, icon, trend, subtext, trendUp }: any) {
    return (
        <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">{label}</span>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendUp ? "text-emerald-600" : "text-muted-foreground")}>
                        {icon}
                        <span>{trend}</span>
                    </div>
                )}
                {subtext && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {icon}
                        <span>{subtext}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-4 pt-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
            <Separator />
            <Skeleton className="h-[200px] w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
            </div>
        </div>
    );
}
