/**
 * Delete Staff Dialog Component
 * Confirmation dialog for deleting a staff member
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
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteStaffDialogProps {
    staff: StaffMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteStaffDialog({
    staff,
    open,
    onOpenChange,
    onSuccess,
}: DeleteStaffDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!staff) return;

        try {
            setLoading(true);
            const response = await staffService.delete(staff.id);

            if (response.success) {
                toast.success('Staff member deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(response.error || 'Failed to delete staff member');
            }
        } catch (error) {
            toast.error('An error occurred while deleting staff member');
        } finally {
            setLoading(false);
        }
    };

    if (!staff) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Staff Member
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to delete <strong>{staff.firstName} {staff.lastName}</strong>?
                            </p>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
                                <p className="text-sm text-destructive font-medium">
                                    ⚠️ Warning: This action will set their status to INACTIVE.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    If they have active job assignments, deletion will be prevented.
                                </p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
