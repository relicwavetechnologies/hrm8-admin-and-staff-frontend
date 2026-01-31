/**
 * HRM8 Admin Consultant Detail Page
 * A production-ready, simple detail page for viewing consultants from the Admin perspective.
 * Uses StaffMember data from the backend API.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    DollarSign,
    Activity,
    MoreVertical,
    Pause,
    Play,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
} from 'lucide-react';
import { ReassignJobsDialog } from '@/modules/admin/components/ReassignJobsDialog';
import { staffService, StaffMember } from '@/shared/lib/hrm8/staffService';
import { toast } from 'sonner';

export default function Hrm8ConsultantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadConsultant();
    }, [id]);

    const loadConsultant = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await staffService.getById(id);
            if (response?.data?.consultant) {
                setConsultant(response.data.consultant);
            } else {
                toast.error('Consultant not found');
                navigate('/hrm8/staff');
            }
        } catch (error) {
            console.error('Failed to load consultant', error);
            toast.error('Failed to load consultant details');
            navigate('/hrm8/staff');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!consultant) return;
        try {
            setActionLoading(true);
            await staffService.suspend(consultant.id);
            toast.success('Consultant suspended');
            loadConsultant();
        } catch (e) {
            toast.error('Failed to suspend consultant');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        if (!consultant) return;
        try {
            setActionLoading(true);
            await staffService.reactivate(consultant.id);
            toast.success('Consultant reactivated');
            loadConsultant();
        } catch (e) {
            toast.error('Failed to reactivate consultant');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-muted-foreground">Loading consultant...</div>
            </div>
        );
    }

    if (!consultant) {
        return <Navigate to="/hrm8/staff" replace />;
    }

    const getStatusBadge = (status: StaffMember['status']) => {
        const config = {
            ACTIVE: { variant: 'default' as const, icon: CheckCircle, label: 'Active', className: 'bg-green-100 text-green-800' },
            SUSPENDED: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Suspended', className: '' },
            INACTIVE: { variant: 'secondary' as const, icon: Clock, label: 'Inactive', className: '' },
            ON_LEAVE: { variant: 'outline' as const, icon: Clock, label: 'On Leave', className: 'border-yellow-500 text-yellow-700' },
        };
        const { icon: Icon, label, variant, className } = config[status] || config.INACTIVE;
        return (
            <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
                <Icon className="h-3 w-3" />
                {label}
            </Badge>
        );
    };

    const getRoleBadge = (role: StaffMember['role']) => {
        const labels = {
            RECRUITER: 'Recruiter',
            SALES_AGENT: 'Sales Agent',
            CONSULTANT_360: '360 Consultant',
        };
        return <Badge variant="outline">{labels[role] || role}</Badge>;
    };

    const jobsPercentage = consultant.maxJobs > 0 ? (consultant.currentJobs / consultant.maxJobs) * 100 : 0;
    const employersPercentage = consultant.maxEmployers > 0 ? (consultant.currentEmployers / consultant.maxEmployers) * 100 : 0;

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/hrm8/staff">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {consultant.firstName} {consultant.lastName}
                            </h1>
                            <p className="text-muted-foreground">{consultant.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(consultant.status)}
                        {getRoleBadge(consultant.role)}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" disabled={actionLoading}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setReassignDialogOpen(true)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reassign Jobs
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {consultant.status === 'SUSPENDED' ? (
                                    <DropdownMenuItem onClick={handleReactivate}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Reactivate
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={handleSuspend} className="text-destructive">
                                        <Pause className="h-4 w-4 mr-2" />
                                        Suspend
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src={consultant.photo} alt={`${consultant.firstName} ${consultant.lastName}`} />
                                <AvatarFallback className="text-2xl">
                                    {consultant.firstName?.[0]}{consultant.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle>{consultant.firstName} {consultant.lastName}</CardTitle>
                            <CardDescription>{consultant.role.replace('_', ' ')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{consultant.email}</span>
                                </div>
                                {consultant.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{consultant.phone}</span>
                                    </div>
                                )}
                                {(consultant.city || consultant.country) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{[consultant.city, consultant.stateProvince, consultant.country].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Capacity */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Job Capacity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Jobs Assigned</span>
                                        <span className="font-medium">{consultant.currentJobs} / {consultant.maxJobs}</span>
                                    </div>
                                    <Progress value={jobsPercentage} className="h-2" />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Employers</span>
                                        <span className="font-medium">{consultant.currentEmployers} / {consultant.maxEmployers}</span>
                                    </div>
                                    <Progress value={employersPercentage} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Total Placements</span>
                                    <span className="font-medium">{consultant.totalPlacements}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Success Rate</span>
                                    <span className="font-medium">{consultant.successRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Avg. Days to Fill</span>
                                    <span className="font-medium">{consultant.averageDaysToFill || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Commissions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Commissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Total Paid</span>
                                    <span className="font-medium text-green-600">
                                        ${consultant.totalCommissionsPaid.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Pending</span>
                                    <span className="font-medium text-yellow-600">
                                        ${consultant.pendingCommissions.toLocaleString()}
                                    </span>
                                </div>
                                {consultant.defaultCommissionRate && (
                                    <div className="flex justify-between text-sm">
                                        <span>Base Rate</span>
                                        <span className="font-medium">{consultant.defaultCommissionRate}%</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Revenue */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Total Revenue</span>
                                    <span className="font-medium text-primary">
                                        ${consultant.totalRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Availability</span>
                                    <Badge variant={consultant.availability === 'AVAILABLE' ? 'default' : 'secondary'}>
                                        {consultant.availability.replace('_', ' ')}
                                    </Badge>
                                </div>
                                {consultant.lastLoginAt && (
                                    <div className="flex justify-between text-sm">
                                        <span>Last Login</span>
                                        <span className="text-muted-foreground">
                                            {new Date(consultant.lastLoginAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reassign Jobs Dialog */}
            <ReassignJobsDialog
                open={reassignDialogOpen}
                onOpenChange={setReassignDialogOpen}
                consultant={consultant}
                onSuccess={() => {
                    loadConsultant();
                }}
            />
        </>
    );
}
