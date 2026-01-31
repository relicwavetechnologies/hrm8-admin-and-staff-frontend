/**
 * Consultant 360 Dashboard
 * Unified dashboard showing combined stats from both recruiter and sales activities
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { EnhancedStatCard } from "@/shared/components/dashboard/EnhancedStatCard";
import {
    DollarSign,
    Briefcase,
    Target,
    TrendingUp,
    Users,
    Wallet,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import { consultant360Service, type DashboardData } from "@/shared/services/consultant360/consultant360Service";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { format } from "date-fns";

export default function Consultant360Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            setLoading(true);
            const response = await consultant360Service.getDashboard();
            if (response.success && response.data) {
                setData(response.data);
                setError(null);
            } else {
                setError(response.error || "Failed to load dashboard");
            }
            setLoading(false);
        }
        loadDashboard();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
                        <CardDescription className="text-red-500">{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const stats = data?.stats;
    const chartData = data?.monthlyTrend?.map((t) => ({
        name: `${t.month} ${t.year}`,
        recruiter: t.recruiterEarnings,
        sales: t.salesEarnings,
        total: t.total,
    })) || [];

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Consultant 360 Dashboard</h1>
                    <p className="text-muted-foreground">
                        Your unified view of recruitment and sales performance
                    </p>
                </div>
                <Button asChild>
                    <Link to="/consultant360/earnings">
                        <Wallet className="h-4 w-4 mr-2" />
                        View Earnings
                    </Link>
                </Button>
            </div>

            {/* Main Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedStatCard
                    title="Total Earnings"
                    value={stats?.totalEarnings?.toLocaleString() || "0"}
                    rawValue={stats?.totalEarnings || 0}
                    isCurrency={true}
                    change={`$${stats?.availableBalance?.toLocaleString() || 0} available`}
                    trend="up"
                    icon={<DollarSign className="h-5 w-5" />}
                    variant="success"
                />
                <EnhancedStatCard
                    title="Active Jobs"
                    value={stats?.activeJobs?.toString() || "0"}
                    rawValue={stats?.activeJobs || 0}
                    change={`${stats?.totalPlacements || 0} placements`}
                    trend="up"
                    icon={<Briefcase className="h-5 w-5" />}
                    variant="neutral"
                />
                <EnhancedStatCard
                    title="Active Leads"
                    value={stats?.activeLeads?.toString() || "0"}
                    rawValue={stats?.activeLeads || 0}
                    change={`${stats?.conversionRate || 0}% conversion rate`}
                    trend="up"
                    icon={<Target className="h-5 w-5" />}
                    variant="primary"
                />
                <EnhancedStatCard
                    title="Total Sales"
                    value={stats?.totalSubscriptionSales?.toString() || "0"}
                    rawValue={stats?.totalSubscriptionSales || 0}
                    change={`$${stats?.salesEarnings?.toLocaleString() || 0} earned`}
                    trend="up"
                    icon={<TrendingUp className="h-5 w-5" />}
                    variant="warning"
                />
            </div>

            {/* Earnings Breakdown + Chart */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Earnings Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            Earnings Breakdown
                        </CardTitle>
                        <CardDescription>Revenue by source</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Recruiter Earnings</p>
                                    <p className="text-sm text-muted-foreground">From placements</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-blue-600">
                                ${stats?.recruiterEarnings?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Target className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Sales Earnings</p>
                                    <p className="text-sm text-muted-foreground">From subscriptions & services</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-green-600">
                                ${stats?.salesEarnings?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-full">
                                    <DollarSign className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Pending Balance</p>
                                    <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-amber-600">
                                ${stats?.pendingBalance?.toLocaleString() || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly earnings breakdown (last 12 months)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRecruiter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="recruiter"
                                    name="Recruiter"
                                    stroke="#3B82F6"
                                    fill="url(#colorRecruiter)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    name="Sales"
                                    stroke="#22C55E"
                                    fill="url(#colorSales)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Active Jobs + Active Leads */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Active Jobs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Active Jobs
                            </CardTitle>
                            <CardDescription>Your assigned recruitment jobs</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/consultant360/jobs">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data?.activeJobs && data.activeJobs.length > 0 ? (
                            <div className="space-y-3">
                                {data.activeJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{job.title}</p>
                                            <p className="text-sm text-muted-foreground">{job.companyName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{job.location}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(job.assignedAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No active jobs</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Leads */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Active Leads
                            </CardTitle>
                            <CardDescription>Your sales pipeline leads</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/consultant360/leads">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data?.activeLeads && data.activeLeads.length > 0 ? (
                            <div className="space-y-3">
                                {data.activeLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{lead.companyName}</p>
                                            <p className="text-sm text-muted-foreground">{lead.contactEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${lead.status === "QUALIFIED"
                                                    ? "bg-green-100 text-green-700"
                                                    : lead.status === "CONTACTED"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {lead.status}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(lead.createdAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No active leads</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
