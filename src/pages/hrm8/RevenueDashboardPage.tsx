import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Users, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { revenueAnalyticsService, type DashboardData } from '@/shared/lib/hrm8/revenueAnalyticsService';
import { format, subMonths } from 'date-fns';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RevenueDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: subMonths(new Date(), 12),
        end: new Date(),
    });

    useEffect(() => {
        loadDashboard();
    }, [dateRange]);

    const loadDashboard = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const filters = {
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString(),
            };

            const dashboardData = await revenueAnalyticsService.getDashboard(filters);
            setData(dashboardData);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load revenue dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadDashboard(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    if (loading) {
        return (

            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>

        );
    }

    if (!data) {
        return (

            <div className="p-6">
                <div className="text-center text-muted-foreground">
                    No data available
                </div>
            </div>

        );
    }

    const { summary, byRegion, byCommissionType, topConsultants, timeline } = data;

    return (

        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h1>
                    <p className="text-muted-foreground">
                        Platform-wide revenue analytics and commission tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(dateRange.start, 'MMM d, yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.start}
                                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(dateRange.end, 'MMM d, yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.end}
                                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button onClick={handleRefresh} disabled={refreshing}>
                        {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary.billCount} paid bills
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalCommissions)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatPercentage(summary.commissionRate)} of revenue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.netRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            After commissions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Consultants Paid</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.paidCommissionCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Commission payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Region */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Region</CardTitle>
                        <CardDescription>Regional revenue distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byRegion}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="regionName" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                                <Bar dataKey="commissions" fill="#FF8042" name="Commissions" />
                                <Bar dataKey="netRevenue" fill="#00C49F" name="Net Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Commission Type Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Commission Types</CardTitle>
                        <CardDescription>Breakdown by commission type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {byCommissionType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={byCommissionType}
                                        dataKey="amount"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={(entry) => `${entry.type}: ${formatPercentage(entry.percentage)}`}
                                    >
                                        {byCommissionType.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No commission data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Timeline</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Revenue" strokeWidth={2} />
                            <Line type="monotone" dataKey="commissions" stroke="#FF8042" name="Commissions" strokeWidth={2} />
                            <Line type="monotone" dataKey="netRevenue" stroke="#00C49F" name="Net Revenue" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Consultants */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Earning Consultants</CardTitle>
                    <CardDescription>Highest commission earners</CardDescription>
                </CardHeader>
                <CardContent>
                    {topConsultants.length > 0 ? (
                        <div className="space-y-4">
                            {topConsultants.map((consultant, index) => (
                                <div key={consultant.consultantId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{consultant.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {consultant.regionName} • {consultant.commissionCount} commissions
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-semibold">{formatCurrency(consultant.totalCommissions)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No consultants found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    );
}
