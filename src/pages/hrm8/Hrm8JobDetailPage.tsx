/**
 * HRM8 Job Detail Page
 * Full job view with analytics and admin controls
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    ArrowLeft,
    Eye,
    MousePointerClick,
    Users,
    TrendingUp,
    Calendar,
    MapPin,
    Building2,
    Pause,
    XCircle,
    CheckCircle,
    EyeOff,
    Activity,
    BarChart3,
    DollarSign,
    UserCheck,
} from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';
import { AssignConsultantToRequestDialog } from '@/shared/components/hrm8/AssignConsultantToRequestDialog';

interface JobDetail {
    id: string;
    title: string;
    company: {
        id: string;
        name: string;
        logo?: string;
    };
    department?: string;
    location: string;
    description: string;
    status: string;
    hrm8_hidden: boolean;
    hrm8_status?: string;
    hrm8_notes?: string;
    posted_at: string;
    expires_at?: string;
    // Managed service & consultant assignment
    managementType?: string;
    servicePackage?: string;
    paymentStatus?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    pendingConsultantAssignment?: boolean;
    companyDefaultConsultantId?: string | null;
    companyDefaultConsultant?: { id: string; firstName: string; lastName: string; email?: string } | null;
    assignedConsultantId?: string | null;
    assignedConsultantName?: string | null;
    consultantAssignmentRequest?: {
        id: string;
        status: string;
        createdAt: string;
        regionId?: string | null;
        region?: { id: string; name: string; code: string } | null;
    } | null;
    financials?: { paymentStatus?: string; paymentAmount?: number; paymentCurrency?: string; servicePackage?: string };
}

interface Analytics {
    total_views: number;
    total_clicks: number;
    total_applications: number;
    conversion_rate: number;
    views_over_time: { date: string; views: number; clicks: number }[];
    source_breakdown: { source: string; count: number }[];
}

interface ActivityItem {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    details?: string;
}

function asNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function pickFirst<T>(...values: Array<T | undefined | null>): T | undefined {
    for (const value of values) {
        if (value !== undefined && value !== null) return value as T;
    }
    return undefined;
}

function normalizeViewsOverTime(raw: unknown): { date: string; views: number; clicks: number }[] {
    if (!Array.isArray(raw)) return [];

    return raw
        .map((item: any, index: number) => {
            const dateValue = pickFirst(
                item?.date,
                item?.day,
                item?.label,
                item?.timestamp,
                item?.created_at,
                item?.createdAt
            );
            const viewsValue = pickFirst(
                item?.views,
                item?.view_count,
                item?.viewCount,
                item?.total_views,
                item?.totalViews,
                item?.impressions
            );
            const clicksValue = pickFirst(
                item?.clicks,
                item?.click_count,
                item?.clickCount,
                item?.total_clicks,
                item?.totalClicks
            );

            return {
                date: String(dateValue ?? `P${index + 1}`),
                views: asNumber(viewsValue),
                clicks: asNumber(clicksValue),
            };
        })
        .filter((item) => item.views > 0 || item.clicks > 0);
}

function normalizeSourceBreakdown(raw: unknown): { source: string; count: number }[] {
    if (!Array.isArray(raw)) return [];

    return raw
        .map((item: any, index: number) => {
            const source = pickFirst(
                item?.source,
                item?.label,
                item?.name,
                item?.channel,
                item?.medium
            );
            const count = pickFirst(
                item?.count,
                item?.value,
                item?.total,
                item?.applications,
                item?.clicks,
                item?.views
            );

            return {
                source: String(source ?? `Source ${index + 1}`),
                count: asNumber(count),
            };
        })
        .filter((item) => item.count > 0);
}

function normalizeJobPayload(payload: any): { job?: JobDetail; analytics?: Analytics; activities?: ActivityItem[] } {
    const root = payload?.data ?? payload ?? {};
    const rawJob = root?.job ?? root?.data?.job ?? root;
    const rawAnalytics = root?.analytics ?? root?.stats ?? root?.overview ?? root?.data?.analytics ?? null;
    const rawActivities = root?.activities ?? root?.timeline ?? root?.history ?? root?.data?.activities ?? [];

    const job: JobDetail | undefined = rawJob
        ? {
            id: rawJob.id ?? rawJob.jobId ?? '',
            title: rawJob.title ?? rawJob.jobTitle ?? 'Untitled Job',
            company: {
                id: rawJob.company?.id ?? rawJob.companyId ?? rawJob.company_id ?? 'unknown',
                name: rawJob.company?.name ?? rawJob.companyName ?? rawJob.company_name ?? 'Unknown Company',
                logo: rawJob.company?.logo ?? rawJob.companyLogo,
            },
            department: rawJob.department ?? rawJob.team,
            location: rawJob.location ?? rawJob.locationText ?? rawJob.city ?? 'N/A',
            description: rawJob.description ?? rawJob.summary ?? '',
            status: rawJob.status ?? rawJob.jobStatus ?? 'OPEN',
            hrm8_hidden: Boolean(rawJob.hrm8_hidden ?? rawJob.hrm8Hidden ?? false),
            hrm8_status: rawJob.hrm8_status ?? rawJob.hrm8Status,
            hrm8_notes: rawJob.hrm8_notes ?? rawJob.hrm8Notes,
            posted_at: rawJob.posted_at ?? rawJob.postedAt ?? rawJob.createdAt ?? '-',
            expires_at: rawJob.expires_at ?? rawJob.expiresAt,
            managementType: rawJob.managementType ?? rawJob.management_type,
            servicePackage: rawJob.servicePackage ?? rawJob.service_package,
            paymentStatus: rawJob.paymentStatus ?? rawJob.payment_status,
            paymentAmount: rawJob.paymentAmount ?? rawJob.payment_amount,
            paymentCurrency: rawJob.paymentCurrency ?? rawJob.payment_currency,
            pendingConsultantAssignment: Boolean(rawJob.pendingConsultantAssignment ?? rawJob.pending_consultant_assignment),
            companyDefaultConsultantId: rawJob.companyDefaultConsultantId ?? rawJob.company_default_consultant_id ?? null,
            companyDefaultConsultant: rawJob.companyDefaultConsultant ?? rawJob.company_default_consultant ?? null,
            assignedConsultantId: rawJob.assignedConsultantId ?? rawJob.assigned_consultant_id ?? null,
            assignedConsultantName: rawJob.assignedConsultantName ?? rawJob.assigned_consultant_name ?? null,
            consultantAssignmentRequest: rawJob.consultantAssignmentRequest ?? rawJob.consultant_assignment_request ?? null,
            financials: rawJob.financials ?? {
                paymentStatus: rawJob.paymentStatus ?? rawJob.payment_status,
                paymentAmount: rawJob.paymentAmount ?? rawJob.payment_amount,
                paymentCurrency: rawJob.paymentCurrency ?? rawJob.payment_currency,
                servicePackage: rawJob.servicePackage ?? rawJob.service_package,
            },
        }
        : undefined;

    const rawViewsOverTime = pickFirst<any[]>(
        rawAnalytics?.views_over_time,
        rawAnalytics?.viewsOverTime,
        rawAnalytics?.viewsTrend,
        rawAnalytics?.trends,
        rawAnalytics?.timeline,
        rawAnalytics?.history
    );
    const rawSourceBreakdown = pickFirst<any[]>(
        rawAnalytics?.source_breakdown,
        rawAnalytics?.sourceBreakdown,
        rawAnalytics?.by_source,
        rawAnalytics?.sources,
        rawAnalytics?.traffic_sources
    );

    const totalViews = asNumber(
        pickFirst(
            rawAnalytics?.total_views,
            rawAnalytics?.totalViews,
            rawAnalytics?.views,
            rawAnalytics?.views_count
        )
    );
    const totalClicks = asNumber(
        pickFirst(
            rawAnalytics?.total_clicks,
            rawAnalytics?.totalClicks,
            rawAnalytics?.clicks,
            rawAnalytics?.clicks_count
        )
    );
    const totalApplications = asNumber(
        pickFirst(
            rawAnalytics?.total_applications,
            rawAnalytics?.totalApplications,
            rawAnalytics?.applications,
            rawAnalytics?.applicants
        )
    );
    const conversionRateRaw = pickFirst(
        rawAnalytics?.conversion_rate,
        rawAnalytics?.conversionRate,
        rawAnalytics?.conversion_rates?.view_to_apply,
        rawAnalytics?.conversion_rates?.viewToApply
    );
    const conversionRate =
        conversionRateRaw !== undefined && conversionRateRaw !== null
            ? asNumber(conversionRateRaw)
            : totalViews > 0
                ? Math.round((totalApplications / totalViews) * 1000) / 10
                : 0;

    const analytics: Analytics | undefined = rawAnalytics
        ? {
            total_views: totalViews,
            total_clicks: totalClicks,
            total_applications: totalApplications,
            conversion_rate: conversionRate,
            views_over_time: normalizeViewsOverTime(rawViewsOverTime),
            source_breakdown: normalizeSourceBreakdown(rawSourceBreakdown),
        }
        : undefined;

    const activities: ActivityItem[] = Array.isArray(rawActivities)
        ? rawActivities.map((item: any, index: number) => ({
            id: item.id ?? item.activityId ?? `activity-${index}`,
            action: item.action ?? item.type ?? 'Updated',
            actor: item.actor ?? item.user ?? item.performedBy ?? 'System',
            timestamp: item.timestamp ?? item.createdAt ?? item.date ?? '-',
            details: item.details ?? item.description ?? '',
        }))
        : [];

    return { job, analytics, activities };
}

export default function Hrm8JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [showAssignDialog, setShowAssignDialog] = useState(false);

    const safeAnalytics = useMemo(() => {
        const totalViews = Number(analytics?.total_views ?? 0);
        const totalClicks = Number(analytics?.total_clicks ?? 0);
        const baseSeries = Array.isArray(analytics?.views_over_time) ? analytics!.views_over_time : [];
        const viewsSeries = baseSeries.length > 0
            ? baseSeries
            : (totalViews > 0 || totalClicks > 0)
                ? [
                    { date: 'Current (1)', views: totalViews, clicks: totalClicks },
                    { date: 'Current (2)', views: totalViews, clicks: totalClicks },
                ]
                : [];

        return {
            total_views: totalViews,
            total_clicks: totalClicks,
            total_applications: Number(analytics?.total_applications ?? 0),
            conversion_rate: Number(analytics?.conversion_rate ?? 0),
            views_over_time: viewsSeries,
            source_breakdown: Array.isArray(analytics?.source_breakdown) ? analytics!.source_breakdown : [],
        };
    }, [analytics]);

    useEffect(() => {
        if (jobId) {
            loadJobDetail();
        }
    }, [jobId]);

    const loadJobDetail = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            let payload: any = null;
            const endpoints = [
                `/api/hrm8/jobs/detail/${jobId}`,
                `/api/hrm8/jobs/${jobId}`,
            ];

            for (const endpoint of endpoints) {
                const response = await apiClient.get<any>(endpoint);
                if (response?.success) {
                    payload = response;
                    break;
                }
            }

            const normalized = normalizeJobPayload(payload);
            if (normalized?.job?.id) {
                setJob(normalized.job);
                setAnalytics(normalized.analytics || {
                    total_views: 0,
                    total_clicks: 0,
                    total_applications: 0,
                    conversion_rate: 0,
                    views_over_time: [],
                    source_breakdown: [],
                });
                setActivities(Array.isArray(normalized.activities) ? normalized.activities : []);
                setNotes(normalized.job.hrm8_notes || '');
            } else {
                setLoadError('Job not found');
                setJob(null);
            }
        } catch (error) {
            console.error('Failed to load job:', error);
            setLoadError('Failed to load job details');
            setJob(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        if (!job) return;
        try {
            await apiClient.put(`/api/hrm8/jobs/${job.id}/visibility`, { hidden: !job.hrm8_hidden });
            setJob({ ...job, hrm8_hidden: !job.hrm8_hidden });
            toast.success(job.hrm8_hidden ? 'Job is now visible' : 'Job hidden from job board');
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const changeStatus = async (newStatus: string) => {
        if (!job) return;
        try {
            await apiClient.put(`/api/hrm8/jobs/${job.id}/status`, { status: newStatus, notes });
            setJob({ ...job, hrm8_status: newStatus, hrm8_notes: notes });
            toast.success(`Job marked as ${newStatus.replace('_', ' ').toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <Badge variant="outline" className="text-foreground">Open</Badge>;
            case 'ON_HOLD':
                return <Badge variant="outline" className="text-foreground">On Hold</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="text-foreground">Cancelled</Badge>;
            case 'FILLED':
                return <Badge variant="outline" className="text-foreground">Filled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-72" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-[260px] w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (loadError || !job) {
        return (
            <div className="p-6 space-y-4">
                <Card>
                    <CardContent className="py-10 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">{loadError || 'Unable to open this job'}</p>
                        <Button variant="outline" onClick={() => navigate('/hrm8/job-board')}>
                            Back to Job Board
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl font-semibold">{job.title}</h1>
                            {getStatusBadge(job.hrm8_status || job.status)}
                            {job.hrm8_hidden && (
                                <Badge variant="outline" className="gap-1">
                                    <EyeOff className="h-3 w-3" /> Hidden
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {job.company?.name || 'Unknown Company'}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Posted {job.posted_at}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-1.5">
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Views</p>
                                        <p className="text-xl font-semibold">{safeAnalytics.total_views.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-1.5">
                                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Detail Clicks</p>
                                        <p className="text-xl font-semibold">{safeAnalytics.total_clicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-1.5">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Applications</p>
                                        <p className="text-xl font-semibold">{safeAnalytics.total_applications}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-1.5">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Conversion</p>
                                        <p className="text-xl font-semibold">{safeAnalytics.conversion_rate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="analytics">
                            <TabsList>
                                <TabsTrigger value="analytics" className="gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="managed" className="gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Managed Service
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="gap-2">
                                    <Activity className="h-4 w-4" />
                                    Activity
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="analytics" className="mt-4 space-y-4">
                                {/* Views Over Time */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Views & Clicks Over Time</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={safeAnalytics.views_over_time}>
                                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Area type="monotone" dataKey="views" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                                <Area type="monotone" dataKey="clicks" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Source Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Traffic Source</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center">
                                            <ResponsiveContainer width="50%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={safeAnalytics.source_breakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="count"
                                                        nameKey="source"
                                                    >
                                                        {safeAnalytics.source_breakdown.map((_entry: { source: string; count: number }, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex-1 space-y-2">
                                                {safeAnalytics.source_breakdown.map((item: { source: string; count: number }, index: number) => (
                                                    <div key={item.source} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                            <span className="text-sm">{item.source}</span>
                                                        </div>
                                                        <span className="text-sm font-medium">{item.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="managed" className="mt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Financials & Consultant
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Job details and payment for admin review before confirming or assigning a consultant.
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {(job.managementType === 'hrm8-managed' || job.servicePackage) && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Service package</p>
                                                        <p className="font-medium">{job.servicePackage ?? job.financials?.servicePackage ?? '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Payment status</p>
                                                        <p className="font-medium">{job.paymentStatus ?? job.financials?.paymentStatus ?? '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Amount</p>
                                                        <p className="font-medium">
                                                            {job.paymentAmount != null || job.financials?.paymentAmount != null
                                                                ? `${job.paymentCurrency ?? job.financials?.paymentCurrency ?? 'USD'} ${(job.paymentAmount ?? job.financials?.paymentAmount ?? 0).toLocaleString()}`
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Assignment status</p>
                                                        <p className="font-medium">
                                                            {job.pendingConsultantAssignment ? (
                                                                <Badge variant="secondary">Pending assignment</Badge>
                                                            ) : job.assignedConsultantId ? (
                                                                <span>{job.assignedConsultantName ?? 'Consultant assigned'}</span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {job.companyDefaultConsultant && (
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground">Company default consultant (suggested)</p>
                                                        <p className="font-medium">
                                                            {job.companyDefaultConsultant.firstName} {job.companyDefaultConsultant.lastName}
                                                            {job.companyDefaultConsultant.email && ` (${job.companyDefaultConsultant.email})`}
                                                        </p>
                                                    </div>
                                                )}
                                                {job.pendingConsultantAssignment && job.consultantAssignmentRequest?.id && (
                                                    <Button
                                                        className="gap-2"
                                                        onClick={() => setShowAssignDialog(true)}
                                                    >
                                                        <Users className="h-4 w-4" />
                                                        Assign consultant
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        {!job.managementType && !job.servicePackage && (
                                            <p className="text-sm text-muted-foreground">This job is not an HRM8 Managed Recruitment job.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity" className="mt-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {activities.map((activity, index) => (
                                                <div key={activity.id} className="flex gap-4">
                                                    <div className="relative">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Activity className="h-4 w-4 text-primary" />
                                                        </div>
                                                        {index < activities.length - 1 && (
                                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <p className="font-medium">{activity.action}</p>
                                                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {activity.actor} • {activity.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Admin Controls */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Visibility Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Show on Job Board</Label>
                                        <p className="text-xs text-muted-foreground">Toggle job visibility</p>
                                    </div>
                                    <Switch checked={!job.hrm8_hidden} onCheckedChange={toggleVisibility} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Status Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-sm font-normal"
                                    onClick={() => changeStatus('ON_HOLD')}
                                >
                                    <Pause className="h-4 w-4 text-muted-foreground" />
                                    Put on Hold
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-sm font-normal"
                                    onClick={() => changeStatus('CANCELLED')}
                                >
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                    Cancel Job
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-sm font-normal"
                                    onClick={() => changeStatus('FILLED')}
                                >
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    Mark as Filled
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Admin Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Add notes about this job..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-24"
                                />
                                <Button className="w-full mt-3" size="sm" onClick={() => toast.success('Notes saved')}>
                                    Save Notes
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {showAssignDialog && job.consultantAssignmentRequest?.id && (
                    <AssignConsultantToRequestDialog
                        open={showAssignDialog}
                        onOpenChange={setShowAssignDialog}
                        requestId={job.consultantAssignmentRequest.id}
                        jobTitle={job.title}
                        companyName={job.company?.name ?? 'Company'}
                        regionId={job.consultantAssignmentRequest.regionId ?? null}
                        suggestedConsultantId={job.companyDefaultConsultantId ?? undefined}
                        onSuccess={() => {
                            setShowAssignDialog(false);
                            loadJobDetail();
                        }}
                    />
                )}
            </div>
        );
}
