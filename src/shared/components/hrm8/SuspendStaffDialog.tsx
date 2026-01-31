/**
 * Suspend Staff Dialog Component
 * Confirmation dialog for suspending a staff member
 */

import { useState } from 'react';
import { StaffMember, staffService } from '@/shared/lib/hrm8/staffService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SuspendStaffDialogProps {
    staff: StaffMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function SuspendStaffDialog({
    staff,
    open,
    onOpenChange,
    onSuccess,
}: SuspendStaffDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleSuspend = async () => {
        if (!staff) return;

        try {
            setLoading(true);
            const response = await staffService.suspend(staff.id);

            if (response.success) {
                toast.success('Staff member suspended successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(response.error || 'Failed to suspend staff member');
            }
        } catch (error) {
            toast.error('An error occurred while suspending staff member');
        } finally {
            setLoading(false);
        }
    };

    if (!staff) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Suspend Staff Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to suspend <strong>{staff.firstName} {staff.lastName}</strong>?
                        <br /><br />
                        This will prevent them from logging in and accessing the system. You can reactivate them later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSuspend}
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Suspend
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
