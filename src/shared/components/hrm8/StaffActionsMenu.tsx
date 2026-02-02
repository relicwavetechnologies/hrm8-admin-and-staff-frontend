/**
 * Staff Actions Menu Component
 * Dropdown menu with staff management actions
 */

import { useState } from 'react';
import { StaffMember } from '@/shared/services/hrm8/staffService';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MoreVertical, Edit, RefreshCw, Pause, Play, Trash2, UserCog, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StaffActionsMenuProps {
    staff: StaffMember;
    canEdit: boolean;
    canSuspend: boolean;
    canDelete: boolean;
    onEdit: (staff: StaffMember) => void;
    onChangeRole: (staff: StaffMember) => void;
    onSuspend: (staff: StaffMember) => void;
    onReactivate: (staff: StaffMember) => void;
    onDelete: (staff: StaffMember) => void;
}

export function StaffActionsMenu({
    staff,
    canEdit,
    canSuspend,
    canDelete,
    onEdit,
    onChangeRole,
    onSuspend,
    onReactivate,
    onDelete,
}: StaffActionsMenuProps) {
    const [open, setOpen] = useState(false);

    const handleAction = (action: () => void) => {
        setOpen(false);
        action();
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const navigate = useNavigate();
    const isSuspended = staff.status === 'SUSPENDED';
    const isActive = staff.status === 'ACTIVE';

    return (
        <div onClick={handleMenuClick} onKeyDown={handleMenuClick} className="relative z-50">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[100]">
                <DropdownMenuItem onClick={() => navigate(`/hrm8/consultants/${staff.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>

                {canEdit && (
                    <DropdownMenuItem onClick={() => handleAction(() => onEdit(staff))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Staff
                    </DropdownMenuItem>
                )}

                {canEdit && (
                    <DropdownMenuItem onClick={() => handleAction(() => onChangeRole(staff))}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Change Role
                    </DropdownMenuItem>
                )}

                {canSuspend && (
                    <>
                        <DropdownMenuSeparator />
                        {isSuspended ? (
                            <DropdownMenuItem onClick={() => handleAction(() => onReactivate(staff))}>
                                <Play className="mr-2 h-4 w-4" />
                                Reactivate
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleAction(() => onSuspend(staff))}>
                                <Pause className="mr-2 h-4 w-4" />
                                Suspend
                            </DropdownMenuItem>
                        )}
                    </>
                )}

                {canDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleAction(() => onDelete(staff))}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Staff
                        </DropdownMenuItem>
                    </>
                )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
