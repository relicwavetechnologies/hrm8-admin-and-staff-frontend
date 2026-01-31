import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { staffService, StaffMember } from '@/shared/lib/hrm8/staffService';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Briefcase, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';

interface ReassignJobsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    consultant: { id: string; firstName: string; lastName: string; regionId?: string };
    onSuccess: () => void;
}

export function ReassignJobsDialog({ open, onOpenChange, consultant, onSuccess }: ReassignJobsDialogProps) {
    const [targetConsultants, setTargetConsultants] = useState<StaffMember[]>([]);
    const [selectedTargetId, setSelectedTargetId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingTargets, setLoadingTargets] = useState(false);
    const [reassignCount, setReassignCount] = useState<number | null>(null);

    useEffect(() => {
        if (open && consultant.regionId) {
            loadTargetConsultants();
            setReassignCount(null);
            setSelectedTargetId('');
        }
    }, [open, consultant]);

    const loadTargetConsultants = async () => {
        try {
            setLoadingTargets(true);
            // Fetch consultants in the same region
            const response = await staffService.getAll({
                regionId: consultant.regionId,
                status: 'ACTIVE'
            });

            if (response.data?.consultants) {
                // Filter out the current consultant
                setTargetConsultants(response.data.consultants.filter(c => c.id !== consultant.id));
            }
        } catch (error) {
            toast.error('Failed to load available consultants');
        } finally {
            setLoadingTargets(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedTargetId) return;

        try {
            setLoading(true);
            const response = await staffService.reassignJobs(consultant.id, selectedTargetId);

            if (response.success && response.data) {
                setReassignCount(response.data.count);
                toast.success(`Successfully reassigned ${response.data.count} jobs`);
                if (response.data.count === 0) {
                    onSuccess();
                    onOpenChange(false);
                }
            } else {
                toast.error(response.error || 'Failed to reassign jobs');
            }
        } catch (error) {
            toast.error('Failed to reassign jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (reassignCount !== null) {
            onSuccess();
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Reassign Active Jobs
                    </DialogTitle>
                    <DialogDescription>
                        Transfer ownership of all active jobs from <strong>{consultant.firstName} {consultant.lastName}</strong> to another consultant.
                    </DialogDescription>
                </DialogHeader>

                {reassignCount !== null ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Reassignment Complete</h3>
                            <p className="text-muted-foreground">
                                Successfully transferred <strong>{reassignCount}</strong> jobs.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <Alert>
                            <AlertTitle>Note</AlertTitle>
                            <AlertDescription>
                                This action will move all jobs currently in OPEN or ON_HOLD status. Closed or Draft jobs will not be affected.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label>Select Target Consultant</Label>
                            {loadingTargets ? (
                                <div className="flex items-center justify-center p-4 border rounded-md">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading consultants...
                                </div>
                            ) : (
                                <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a consultant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetConsultants.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.firstName} {c.lastName} ({c.currentJobs} jobs)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {targetConsultants.length === 0 && !loadingTargets && (
                                <p className="text-sm text-amber-600">
                                    No other active consultants found in this region.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {reassignCount !== null ? (
                        <Button onClick={handleClose}>Close</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleReassign} disabled={!selectedTargetId || loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Reassigning...
                                    </>
                                ) : (
                                    <>
                                        Reassign Jobs
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
