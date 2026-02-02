/**
 * Reactivate Staff Dialog Component
 * Confirmation dialog for reactivating a suspended staff member
 */

import { useState } from 'react';
import { StaffMember, staffService } from '@/shared/services/hrm8/staffService';
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

interface ReactivateStaffDialogProps {
    staff: StaffMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ReactivateStaffDialog({
    staff,
    open,
    onOpenChange,
    onSuccess,
}: ReactivateStaffDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleReactivate = async () => {
        if (!staff) return;

        try {
            setLoading(true);
            const response = await staffService.reactivate(staff.id);

            if (response.success) {
                toast.success('Staff member reactivated successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(response.error || 'Failed to reactivate staff member');
            }
        } catch (error) {
            toast.error('An error occurred while reactivating staff member');
        } finally {
            setLoading(false);
        }
    };

    if (!staff) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reactivate Staff Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to reactivate <strong>{staff.firstName} {staff.lastName}</strong>?
                        <br /><br />
                        This will restore their access to the system and allow them to log in again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleReactivate}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reactivate
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
