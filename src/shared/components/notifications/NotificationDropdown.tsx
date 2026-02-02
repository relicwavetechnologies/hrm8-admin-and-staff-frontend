/**
 * NotificationDropdown Component
 * Displays a dropdown list of notifications with actions
 */

import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
    Bell,
    Briefcase,
    Users,
    Calendar,
    AlertCircle,
    CheckCheck,
    Loader2,
    ExternalLink,
    Coins,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    UserPlus,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Notification } from '@/shared/lib/notificationService';
import { cn } from '@/shared/lib/utils';

interface NotificationDropdownProps {
    notifications: Notification[];
    isLoading: boolean;
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'NEW_APPLICATION':
        case 'APPLICATION_STATUS_CHANGED':
        case 'APPLICATION_SHORTLISTED':
        case 'APPLICATION_REJECTED':
            return <Users className="h-4 w-4 text-blue-500" />;
        case 'JOB_CREATED':
        case 'JOB_STATUS_CHANGED':
        case 'JOB_ASSIGNED':
        case 'JOB_FILLED':
        case 'JOB_ASSIGNMENT_RECEIVED':
            return <Briefcase className="h-4 w-4 text-green-500" />;
        case 'INTERVIEW_SCHEDULED':
        case 'CANDIDATE_STAGE_CHANGED':
        case 'OFFER_EXTENDED':
            return <Calendar className="h-4 w-4 text-purple-500" />;
        case 'NEW_LEAD':
        case 'LEAD_CONVERSION_REQUESTED':
            return <UserPlus className="h-4 w-4 text-blue-500" />;
        case 'LEAD_CONVERSION_DECLINED':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'LEAD_CONVERTED':
            return <TrendingUp className="h-4 w-4 text-indigo-600" />;
        case 'COMMISSION_EARNED':
            return <Coins className="h-4 w-4 text-green-500" />;
        case 'WITHDRAWAL_APPROVED':
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'WITHDRAWAL_REJECTED':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'SUBSCRIPTION_RENEWAL_FAILED':
        case 'LOW_BALANCE_WARNING':
            return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'SUBSCRIPTION_PURCHASED':
        case 'SERVICE_PURCHASED':
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'SYSTEM_ANNOUNCEMENT':
        default:
            return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

export function NotificationDropdown({
    notifications,
    isLoading,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose,
}: NotificationDropdownProps) {
    const navigate = useNavigate();

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Navigate to notifications page
        navigate('/hrm8/notifications');
        // Close after navigation is triggered
        setTimeout(() => onClose(), 0);
    };

    const handleViewAll = () => {
        navigate('/hrm8/notifications');
        // Close after navigation is triggered
        setTimeout(() => onClose(), 0);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-[450px] z-50 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-gray-900 dark:text-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 py-5">
                <h3 className="text-2xl font-bold tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-slate-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
                        <Bell className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-slate-800/50">
                        {notifications.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={cn(
                                    'w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group relative',
                                    !notification.read && 'bg-blue-50 dark:bg-slate-900/20'
                                )}
                            >
                                {!notification.read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                )}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="p-2 rounded-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-800 transition-colors">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                'text-sm transition-colors',
                                                !notification.read ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'
                                            )}>
                                                {notification.title}
                                            </p>
                                            {notification.actionUrl && (
                                                <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-400 dark:text-slate-600 group-hover:text-gray-600 dark:group-hover:text-slate-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-slate-600 mt-2">
                                            {(() => {
                                                try {
                                                    const date = new Date(notification.createdAt);
                                                    if (isNaN(date.getTime())) return 'Just now';
                                                    return formatDistanceToNow(date, { addSuffix: true });
                                                } catch (e) {
                                                    return 'Just now';
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAll}
                    className="w-full text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 h-10 font-medium"
                >
                    View all notifications
                </Button>
            </div>
        </div>
    );
}
