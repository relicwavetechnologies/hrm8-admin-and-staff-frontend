import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    ArrowDownToLine,
    RotateCcw,
    HandCoins,
    BarChart3,
    BookOpen,
    ArrowUpRight,
    ArrowDownRight,
    ArrowRight,
    Wallet,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { apiClient } from '@/shared/lib/api';

interface FinanceOverview {
    totalRevenue: number;
    totalCommissions: number;
    totalWithdrawals: number;
    totalRefunds: number;
    totalSettlements: number;
    revenueGrowth: number;
    commissionsGrowth: number;
    pendingWithdrawals: {
        count: number;
        totalAmount: number;
    };
    pendingRefunds: {
        count: number;
        totalAmount: number;
    };
    pendingSettlements: {
        count: number;
        totalAmount: number;
    };
    revenueBySource: {
        subscriptions: number;
        placements: number;
        other: number;
    };
    commissionsByType: {
        recruitment: number;
        sales: number;
    };
    netCashFlow: number;
    projectedPayouts: number;
    period: {
        start: string;
        end: string;
    };
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

/* ─── Skeleton ────────────────────────────────────────────────── */
function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
            </CardContent>
        </Card>
    );
}

function BreakdownSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    );
}

/* ─── Stat Card ───────────────────────────────────────────────── */
function FinanceStatCard({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon,
    colorClass = 'text-primary',
    bgClass = 'bg-primary/5',
    onClick,
}: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    icon: React.ReactNode;
    colorClass?: string;
    bgClass?: string;
    onClick?: () => void;
}) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                onClick && 'cursor-pointer hover:scale-[1.02]'
            )}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                        {trendValue && (
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs font-medium mt-2',
                                    trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                                )}
                            >
                                {trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                <span>{trendValue} vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className={cn('p-3 rounded-xl', bgClass)}>
                        <div className={cn('h-6 w-6', colorClass)}>{icon}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─── Revenue Progress Bar ────────────────────────────────────── */
function RevenueBar({
    label,
    amount,
    total,
    color,
}: {
    label: string;
    amount: number;
    total: number;
    color: string;
}) {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', color)}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                />
            </div>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function FinanceOverviewPage() {
    const navigate = useNavigate();
    const { selectedRegionId } = useRegionStore();
    const [overview, setOverview] = useState<FinanceOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, [selectedRegionId]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const url = selectedRegionId
                ? `/api/hrm8/finance/overview?regionId=${selectedRegionId}`
                : '/api/hrm8/finance/overview';
            const response = await apiClient.get<FinanceOverview>(url);
            if (response.success && response.data) {
                setOverview(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch finance overview:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPendingItems =
        (overview?.pendingWithdrawals.count || 0) +
        (overview?.pendingRefunds.count || 0) +
        (overview?.pendingSettlements.count || 0);

    /* ── Loading ────────── */
    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
                    <p className="text-muted-foreground mt-1">Loading financial metrics…</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <BreakdownSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold">Unable to load finance data</h2>
                <p className="text-muted-foreground mt-1">Please try refreshing the page.</p>
            </div>
        );
    }

    /* ── Render ────────── */
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive view of all revenue and financial operations
                    </p>
                </div>
                {totalPendingItems > 0 && (
                    <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                        {totalPendingItems} pending action{totalPendingItems !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {/* ── Key Metrics (4-column grid) ── */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FinanceStatCard
                    title="Total Revenue"
                    value={formatCurrency(overview.totalRevenue)}
                    subtitle="Current month"
                    trend={overview.revenueGrowth >= 0 ? 'up' : 'down'}
                    trendValue={formatPercentage(overview.revenueGrowth)}
                    icon={<DollarSign className="h-6 w-6" />}
                    colorClass="text-chart-1"
                    bgClass="bg-chart-1/10"
                    onClick={() => navigate('/hrm8/finance/revenue')}
                />
                <FinanceStatCard
                    title="Total Commissions"
                    value={formatCurrency(overview.totalCommissions)}
                    subtitle="Current month"
                    trend={overview.commissionsGrowth >= 0 ? 'up' : 'down'}
                    trendValue={formatPercentage(overview.commissionsGrowth)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    colorClass="text-chart-2"
                    bgClass="bg-chart-2/10"
                    onClick={() => navigate('/hrm8/finance/commissions')}
                />
                <FinanceStatCard
                    title="Net Cash Flow"
                    value={formatCurrency(overview.netCashFlow)}
                    subtitle="Revenue minus payouts"
                    icon={<BarChart3 className="h-6 w-6" />}
                    colorClass="text-chart-4"
                    bgClass="bg-chart-4/10"
                    onClick={() => navigate('/hrm8/finance/revenue-analytics')}
                />
                <FinanceStatCard
                    title="Projected Payouts"
                    value={formatCurrency(overview.projectedPayouts)}
                    subtitle="Pending items total"
                    icon={<Wallet className="h-6 w-6" />}
                    colorClass="text-chart-3"
                    bgClass="bg-chart-3/10"
                />
            </div>

            {/* ── Breakdown Row (3-column) ── */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Revenue by Source */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Revenue by Source</CardTitle>
                        <CardDescription>Current month breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RevenueBar
                            label="Subscriptions"
                            amount={overview.revenueBySource.subscriptions}
                            total={overview.totalRevenue}
                            color="bg-chart-1"
                        />
                        <RevenueBar
                            label="Placements"
                            amount={overview.revenueBySource.placements}
                            total={overview.totalRevenue}
                            color="bg-chart-2"
                        />
                        <RevenueBar
                            label="Other"
                            amount={overview.revenueBySource.other}
                            total={overview.totalRevenue}
                            color="bg-chart-3"
                        />
                    </CardContent>
                </Card>

                {/* Commission Breakdown */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Commissions by Type</CardTitle>
                        <CardDescription>Current month breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RevenueBar
                            label="Recruitment"
                            amount={overview.commissionsByType.recruitment}
                            total={overview.totalCommissions}
                            color="bg-chart-2"
                        />
                        <RevenueBar
                            label="Sales"
                            amount={overview.commissionsByType.sales}
                            total={overview.totalCommissions}
                            color="bg-chart-4"
                        />
                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Total</span>
                                <span className="font-semibold">{formatCurrency(overview.totalCommissions)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cash Flow Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Cash Flow Summary</CardTitle>
                        <CardDescription>Outgoing payments this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <ArrowDownToLine className="h-3.5 w-3.5" />
                                    Withdrawals
                                </div>
                                <span className="font-medium text-red-500">
                                    -{formatCurrency(overview.totalWithdrawals)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Refunds
                                </div>
                                <span className="font-medium text-red-500">
                                    -{formatCurrency(overview.totalRefunds)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <HandCoins className="h-3.5 w-3.5" />
                                    Settlements
                                </div>
                                <span className="font-medium text-red-500">
                                    -{formatCurrency(overview.totalSettlements)}
                                </span>
                            </div>
                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Net Cash Flow</span>
                                    <span
                                        className={cn(
                                            'text-base font-bold',
                                            overview.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-500'
                                        )}
                                    >
                                        {formatCurrency(overview.netCashFlow)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Pending Actions Row ── */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-chart-1/50"
                        onClick={() => navigate('/hrm8/finance/withdrawals')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-chart-1/10">
                                    <ArrowDownToLine className="h-5 w-5 text-chart-1" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pending Withdrawals
                                    </p>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-2xl font-bold">
                                            {overview.pendingWithdrawals.count}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            · {formatCurrency(overview.pendingWithdrawals.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-chart-3/50"
                        onClick={() => navigate('/hrm8/finance/refunds')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-chart-3/10">
                                    <RotateCcw className="h-5 w-5 text-chart-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pending Refunds
                                    </p>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-2xl font-bold">
                                            {overview.pendingRefunds.count}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            · {formatCurrency(overview.pendingRefunds.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-chart-2/50"
                        onClick={() => navigate('/hrm8/finance/settlements')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-chart-2/10">
                                    <HandCoins className="h-5 w-5 text-chart-2" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pending Settlements
                                    </p>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-2xl font-bold">
                                            {overview.pendingSettlements.count}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            · {formatCurrency(overview.pendingSettlements.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Quick Navigation ── */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
                <div className="grid gap-3 md:grid-cols-4">
                    {[
                        {
                            label: 'Revenue',
                            description: 'Detailed revenue tracking',
                            icon: <TrendingUp className="h-5 w-5" />,
                            path: '/hrm8/finance/revenue',
                            color: 'text-chart-1',
                            bg: 'bg-chart-1/10',
                        },
                        {
                            label: 'Analytics',
                            description: 'Revenue insights & trends',
                            icon: <BarChart3 className="h-5 w-5" />,
                            path: '/hrm8/finance/revenue-analytics',
                            color: 'text-chart-4',
                            bg: 'bg-chart-4/10',
                        },
                        {
                            label: 'Commissions',
                            description: 'Manage payouts',
                            icon: <DollarSign className="h-5 w-5" />,
                            path: '/hrm8/finance/commissions',
                            color: 'text-chart-2',
                            bg: 'bg-chart-2/10',
                        },
                        {
                            label: 'Pricing',
                            description: 'Configure plans',
                            icon: <BookOpen className="h-5 w-5" />,
                            path: '/hrm8/finance/pricing',
                            color: 'text-chart-3',
                            bg: 'bg-chart-3/10',
                        },
                    ].map((item) => (
                        <Card
                            key={item.label}
                            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={cn('p-2.5 rounded-xl', item.bg)}>
                                    <div className={item.color}>{item.icon}</div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
