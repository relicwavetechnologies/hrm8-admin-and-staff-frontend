/**
 * HRM8 Job Detail Page
 * Full job view with analytics and admin controls
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
} from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';

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
    hrm8Hidden: boolean;
    hrm8Status?: string;
    hrm8Notes?: string;
    postedAt: string;
    expiresAt?: string;
}

interface Analytics {
    totalViews: number;
    totalClicks: number;
    totalApplications: number;
    conversionRate: number;
    viewsOverTime: { date: string; views: number; clicks: number }[];
    sourceBreakdown: { source: string; count: number }[];
}

interface ActivityItem {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    details?: string;
}

export default function Hrm8JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (jobId) {
            loadJobDetail();
        }
    }, [jobId]);

    const loadJobDetail = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ job: JobDetail; analytics: Analytics; activities: ActivityItem[] }>(`/api/hrm8/jobs/detail/${jobId}`);
            if (response.data) {
                setJob(response.data.job);
                setAnalytics(response.data.analytics);
                setActivities(response.data.activities || []);
                setNotes(response.data.job.hrm8Notes || '');
            } else {
                console.error('Failed to load job');
                // Navigate back if job not found
                navigate('/hrm8/job-board');
            }
        } catch (error) {
            console.error('Failed to load job:', error);
            navigate('/hrm8/job-board');
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        if (!job) return;
        try {
            await apiClient.put(`/api/hrm8/jobs/${job.id}/visibility`, { hidden: !job.hrm8Hidden });
            setJob({ ...job, hrm8Hidden: !job.hrm8Hidden });
            toast.success(job.hrm8Hidden ? 'Job is now visible' : 'Job hidden from job board');
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const changeStatus = async (newStatus: string) => {
        if (!job) return;
        try {
            await apiClient.put(`/api/hrm8/jobs/${job.id}/status`, { status: newStatus, notes });
            setJob({ ...job, hrm8Status: newStatus });
            toast.success(`Job marked as ${newStatus.replace('_', ' ').toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <Badge className="bg-green-500/10 text-green-600">Open</Badge>;
            case 'ON_HOLD':
                return <Badge className="bg-amber-500/10 text-amber-600">On Hold</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-red-500/10 text-red-600">Cancelled</Badge>;
            case 'FILLED':
                return <Badge className="bg-blue-500/10 text-blue-600">Filled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading || !job) {
        return (
            
                <div className="p-6">Loading...</div>
            
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
                            <h1 className="text-2xl font-bold">{job.title}</h1>
                            {getStatusBadge(job.hrm8Status || job.status)}
                            {job.hrm8Hidden && (
                                <Badge variant="outline" className="gap-1">
                                    <EyeOff className="h-3 w-3" /> Hidden
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {job.company.name}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Posted {job.postedAt}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Eye className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Views</p>
                                        <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
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
                                        <p className="text-sm text-muted-foreground">Detail Clicks</p>
                                        <p className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <Users className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Applications</p>
                                        <p className="text-2xl font-bold">{analytics.totalApplications}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversion</p>
                                        <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
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
                                            <AreaChart data={analytics?.viewsOverTime}>
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
                                                        data={analytics?.sourceBreakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="count"
                                                        nameKey="source"
                                                    >
                                                        {analytics?.sourceBreakdown.map((_entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex-1 space-y-2">
                                                {analytics?.sourceBreakdown.map((item, index) => (
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
                                    <Switch checked={!job.hrm8Hidden} onCheckedChange={toggleVisibility} />
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
                                    className="w-full justify-start gap-2"
                                    onClick={() => changeStatus('ON_HOLD')}
                                >
                                    <Pause className="h-4 w-4 text-amber-500" />
                                    Put on Hold
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => changeStatus('CANCELLED')}
                                >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Cancel Job
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => changeStatus('FILLED')}
                                >
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
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
            </div>
        
    );
}
