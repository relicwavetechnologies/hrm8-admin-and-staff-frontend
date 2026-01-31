/**
 * Staff Status Badge Component
 * Displays colored status badges for staff members
 */

import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, Clock, XCircle, Pause } from 'lucide-react';

interface StaffStatusBadgeProps {
    status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'SUSPENDED';
}

export function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
    const statusConfig = {
        ACTIVE: {
            icon: CheckCircle,
            label: 'Active',
            className: 'bg-green-50 text-green-700 border-green-200',
        },
        ON_LEAVE: {
            icon: Clock,
            label: 'On Leave',
            className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        },
        INACTIVE: {
            icon: XCircle,
            label: 'Inactive',
            className: 'bg-gray-50 text-gray-700 border-gray-200',
        },
        SUSPENDED: {
            icon: Pause,
            label: 'Suspended',
            className: 'bg-red-50 text-red-700 border-red-200',
        },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={config.className}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
}
