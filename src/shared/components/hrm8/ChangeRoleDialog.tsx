/**
 * Change Role Dialog Component
 * Production-grade dialog for changing staff role with task handling options
 * Shows pending tasks and allows reassignment or termination before role change
 */

import { useState, useEffect } from 'react';
import { StaffMember, staffService } from '@/shared/lib/hrm8/staffService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Briefcase, Users, FileText, /* DollarSign, */ ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
// import { Alert /*, AlertDescription, AlertTitle */ } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';

interface PendingTasks {
    jobs: { id: string; title: string; companyName: string; status: string }[];
    leads: { id: string; companyName: string; status: string }[];
    conversionRequests: { id: string; companyName: string; status: string }[];
    pendingCommissions: { id: string; amount: number; status: string }[];
    totalCount: number;
}

interface ReassignmentOption {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface ChangeRoleDialogProps {
    staff: StaffMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ChangeRoleDialog({
    staff,
    open,
    onOpenChange,
    onSuccess,
}: ChangeRoleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360'>('RECRUITER');
    const [pendingTasks, setPendingTasks] = useState<PendingTasks | null>(null);
    const [taskAction, setTaskAction] = useState<'REASSIGN' | 'TERMINATE' | 'KEEP'>('KEEP');
    const [targetConsultantId, setTargetConsultantId] = useState<string>('');
    const [reassignmentOptions, setReassignmentOptions] = useState<ReassignmentOption[]>([]);

    useEffect(() => {
        if (staff && open) {
            setSelectedRole(staff.role);
            setTaskAction('KEEP');
            setTargetConsultantId('');
            fetchPendingTasks();
            fetchReassignmentOptions();
        }
    }, [staff, open]);

    const fetchPendingTasks = async () => {
        if (!staff) return;
        try {
            setLoadingTasks(true);
            const response = await staffService.getPendingTasks(staff.id);
            if (response.success && response.data) {
                setPendingTasks(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const fetchReassignmentOptions = async () => {
        if (!staff) return;
        try {
            setLoadingOptions(true);
            const response = await staffService.getReassignmentOptions(staff.id);
            if (response.success && response.data) {
                setReassignmentOptions(response.data.consultants);
            }
        } catch (error) {
            console.error('Failed to fetch reassignment options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleChangeRole = async () => {
        if (!staff) return;

        if (selectedRole === staff.role) {
            toast.info('Role is already set to this value');
            return;
        }

        // Validate reassignment target if reassign is selected
        if (taskAction === 'REASSIGN' && !targetConsultantId) {
            toast.warning('Please select a consultant to reassign tasks to');
            return;
        }

        try {
            setLoading(true);
            const response = await staffService.changeRoleWithTasks(
                staff.id,
                selectedRole,
                taskAction,
                taskAction === 'REASSIGN' ? targetConsultantId : undefined
            );

            if (response.success) {
                const taskInfo = response.data?.taskResult;
                if (taskInfo) {
                    if (taskAction === 'REASSIGN') {
                        toast.success(`Role updated! Reassigned ${taskInfo.reassigned?.jobs || 0} jobs and ${taskInfo.reassigned?.leads || 0} leads`);
                    } else if (taskAction === 'TERMINATE') {
                        toast.success(`Role updated! Released ${taskInfo.terminated?.jobs || 0} jobs and ${taskInfo.terminated?.leads || 0} leads`);
                    } else {
                        toast.success('Role updated successfully');
                    }
                } else {
                    toast.success('Staff role updated successfully');
                }
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(response.error || 'Failed to update staff role');
            }
        } catch (error) {
            toast.error('An error occurred while updating staff role');
        } finally {
            setLoading(false);
        }
    };

    if (!staff) return null;

    const hasPendingTasks = pendingTasks && pendingTasks.totalCount > 0;
    const hasReassignmentOptions = reassignmentOptions.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Change Staff Role</DialogTitle>
                    <DialogDescription>
                        Update the role for <strong>{staff.firstName} {staff.lastName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="role">New Role</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                                <SelectItem value="SALES_AGENT">Sales Agent</SelectItem>
                                <SelectItem value="CONSULTANT_360">360 Consultant</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Current role: <strong>{staff.role.replace('_', ' ')}</strong>
                        </p>
                    </div>

                    <Separator />

                    {/* Pending Tasks Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Active Work</Label>

                        {loadingTasks ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking active work...
                            </div>
                        ) : hasPendingTasks ? (
                            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium text-sm">{pendingTasks.totalCount} Active Item(s)</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {pendingTasks.jobs.length > 0 && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            <span>{pendingTasks.jobs.length} Job(s)</span>
                                        </div>
                                    )}
                                    {pendingTasks.leads.length > 0 && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{pendingTasks.leads.length} Lead(s)</span>
                                        </div>
                                    )}
                                    {pendingTasks.conversionRequests.length > 0 && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span>{pendingTasks.conversionRequests.length} Conversion(s)</span>
                                        </div>
                                    )}
                                    {pendingTasks.pendingCommissions.length > 0 && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            {/* <DollarSign className="h-3.5 w-3.5" /> */}
                                            <span>{pendingTasks.pendingCommissions.length} Commission(s)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                                <CheckCircle2 className="h-4 w-4" />
                                No active work assigned
                            </div>
                        )}
                    </div>

                    {/* Task Action Selection */}
                    {hasPendingTasks && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">How to handle active work?</Label>

                                <RadioGroup value={taskAction} onValueChange={(v) => setTaskAction(v as any)} className="space-y-2">
                                    <div className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${taskAction === 'KEEP' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                                        <RadioGroupItem value="KEEP" id="keep" className="mt-0.5" />
                                        <div className="space-y-1">
                                            <Label htmlFor="keep" className="cursor-pointer font-medium">Keep with this consultant</Label>
                                            <p className="text-xs text-muted-foreground">Tasks remain assigned after role change</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${taskAction === 'REASSIGN' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'} ${!hasReassignmentOptions ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <RadioGroupItem value="REASSIGN" id="reassign" className="mt-0.5" disabled={!hasReassignmentOptions} />
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="reassign" className={`cursor-pointer font-medium ${!hasReassignmentOptions ? 'cursor-not-allowed' : ''}`}>
                                                    <ArrowRight className="h-4 w-4 inline mr-1" />
                                                    Reassign to another consultant
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {hasReassignmentOptions
                                                    ? `Transfer all work to a consultant with the same role & region`
                                                    : 'No other consultants available in same role & region'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${taskAction === 'TERMINATE' ? 'border-destructive bg-destructive/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                                        <RadioGroupItem value="TERMINATE" id="terminate" className="mt-0.5" />
                                        <div className="space-y-1">
                                            <Label htmlFor="terminate" className="cursor-pointer font-medium text-destructive">
                                                <XCircle className="h-4 w-4 inline mr-1" />
                                                Release all work
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Jobs released, leads unassigned, conversion requests cancelled</p>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </>
                    )}

                    {/* Reassignment Target Selection */}
                    {taskAction === 'REASSIGN' && hasReassignmentOptions && (
                        <div className="space-y-2 ml-6">
                            <Label htmlFor="target">Select Target Consultant</Label>
                            {loadingOptions ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading consultants...
                                </div>
                            ) : (
                                <Select value={targetConsultantId} onValueChange={setTargetConsultantId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a consultant..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reassignmentOptions.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.firstName} {c.lastName} ({c.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangeRole}
                        disabled={loading || (taskAction === 'REASSIGN' && !targetConsultantId)}
                        variant={taskAction === 'TERMINATE' ? 'destructive' : 'default'}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {taskAction === 'TERMINATE' ? 'Release & Update Role' : 'Update Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
