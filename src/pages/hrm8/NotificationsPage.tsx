import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Check, AlertTriangle, AlertCircle, Info, Bell, X, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  read: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface Alert {
  id: string | number;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadAlerts();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      // Mock notifications for now - replace with API call
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading
      setNotifications([
        {
          id: 1,
          title: 'New Commission',
          message: 'You have a new commission pending approval.',
          read: false,
          category: 'approval',
          priority: 'high',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'System Update',
          message: 'HRM8 was updated successfully with new features.',
          read: true,
          category: 'system',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          title: 'Document Expiry',
          message: 'A staff member\'s license is expiring in 30 days.',
          read: false,
          category: 'expiry',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 4,
          title: 'Team Assignment',
          message: 'You have been assigned to a new project team.',
          read: true,
          category: 'assignment',
          priority: 'medium',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoadingAlerts(true);
      // Mock alerts for now - replace with API call
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading
      setAlerts([
        {
          id: 'alert-1',
          title: 'Compliance Issue',
          message: 'A staff member\'s background check is overdue. Immediate action required.',
          severity: 'critical',
          category: 'compliance',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'alert-2',
          title: 'Operational Warning',
          message: 'Multiple job allocations are pending review (5 items).',
          severity: 'high',
          category: 'operational',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'alert-3',
          title: 'System Health',
          message: 'API response times are higher than normal. Monitoring ongoing.',
          severity: 'medium',
          category: 'system',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'alert-4',
          title: 'Revenue Alert',
          message: 'Revenue goal tracking indicates 15% below target this month.',
          severity: 'high',
          category: 'revenue',
          read: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 dark:bg-red-900/20 dark:border-red-700/50 text-red-600 dark:text-red-400';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 dark:bg-orange-900/20 dark:border-orange-700/50 text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-900/20 dark:border-yellow-700/50 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-900/20 dark:border-blue-700/50 text-blue-600 dark:text-blue-400';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const handleMarkAsRead = (type: 'notification' | 'alert', id: string | number) => {
    if (type === 'notification') {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
    }
  };

  const handleMarkAllAsRead = (type: 'notification' | 'alert') => {
    if (type === 'notification') {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    }
  };

  const handleDismiss = (type: 'notification' | 'alert', id: string | number) => {
    if (type === 'notification') {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const NotificationItem = ({
    item,
    type,
    onMarkAsRead,
    onDismiss,
  }: {
    item: Notification | Alert;
    type: 'notification' | 'alert';
    onMarkAsRead: () => void;
    onDismiss: () => void;
  }) => {
    const isSeverity = 'severity' in item;
    const severity = isSeverity ? (item as Alert).severity : undefined;
    const priority = !isSeverity ? (item as Notification).priority : undefined;

    return (
      <div
        className={cn(
          'group relative rounded-lg border-l-4 transition-all duration-200',
          item.read
            ? 'border-l-gray-300 bg-gray-50 dark:border-l-gray-700 dark:bg-gray-900/50'
            : severity
            ? {
                'border-l-red-500 bg-red-50 dark:border-l-red-600 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30':
                  severity === 'critical',
                'border-l-orange-500 bg-orange-50 dark:border-l-orange-600 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30':
                  severity === 'high',
                'border-l-yellow-500 bg-yellow-50 dark:border-l-yellow-600 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30':
                  severity === 'medium',
                'border-l-blue-500 bg-blue-50 dark:border-l-blue-600 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30':
                  severity === 'info' || severity === 'low',
              }
            : priority
            ? {
                'border-l-red-500 bg-red-50 dark:border-l-red-600 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30':
                  priority === 'critical' || priority === 'high',
                'border-l-blue-500 bg-blue-50 dark:border-l-blue-600 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30':
                  priority === 'medium' || priority === 'low',
              }
            : 'border-l-gray-300 dark:border-l-gray-700',
          'p-4'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'mt-1 rounded-full p-2.5 flex-shrink-0',
              item.read
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : severity
                ? {
                    'bg-red-500/20 text-red-600 dark:text-red-400':
                      severity === 'critical',
                    'bg-orange-500/20 text-orange-600 dark:text-orange-400':
                      severity === 'high',
                    'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400':
                      severity === 'medium',
                    'bg-blue-500/20 text-blue-600 dark:text-blue-400':
                      severity === 'info' || severity === 'low',
                  }
                : priority
                ? {
                    'bg-red-500/20 text-red-600 dark:text-red-400':
                      priority === 'critical' || priority === 'high',
                    'bg-blue-500/20 text-blue-600 dark:text-blue-400':
                      priority === 'medium' || priority === 'low',
                  }
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            {isSeverity ? getSeverityIcon(severity!) : <Bell className="h-4 w-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={cn(
                    'font-semibold text-sm',
                    item.read
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'text-xs mt-1',
                    item.read
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {getTimeAgo(item.createdAt)}
                </p>
              </div>
              {!item.read && (
                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
              )}
            </div>

            <p
              className={cn(
                'text-sm mt-2 leading-relaxed',
                item.read
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-700 dark:text-gray-200'
              )}
            >
              {item.message}
            </p>

            {item.category && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  )}
                >
                  {item.category}
                </span>
                {isSeverity && severity && (
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      getSeverityColor(severity)
                    )}
                  >
                    {severity}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!item.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onMarkAsRead}
                title="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onDismiss}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications & Alerts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay informed with system updates and compliance alerts
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="shadow-sm">
          <Tabs defaultValue="notifications" className="w-full">
            <div className="border-b px-6">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="notifications"
                  className="relative h-auto px-4 py-3 data-[state=active]:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="alerts"
                  className="relative h-auto px-4 py-3 data-[state=active]:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Alerts</span>
                    {alerts.filter((a) => !a.read).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                        {alerts.filter((a) => !a.read).length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications.filter((n) => !n.read).length} unread
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleMarkAllAsRead('notification')}
                      className="ml-3 h-auto p-0 text-blue-600 dark:text-blue-400"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              {loadingNotifications ? (
                <LoadingSkeleton />
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    You're all caught up!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    No new notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      item={notification}
                      type="notification"
                      onMarkAsRead={() =>
                        handleMarkAsRead('notification', notification.id)
                      }
                      onDismiss={() =>
                        handleDismiss('notification', notification.id)
                      }
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {alerts.filter((a) => !a.read).length} unread
                  {alerts.filter((a) => !a.read).length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleMarkAllAsRead('alert')}
                      className="ml-3 h-auto p-0 text-blue-600 dark:text-blue-400"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              {loadingAlerts ? (
                <LoadingSkeleton />
              ) : alerts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No active alerts
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    All systems running smoothly
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <NotificationItem
                      key={alert.id}
                      item={alert}
                      type="alert"
                      onMarkAsRead={() => handleMarkAsRead('alert', alert.id)}
                      onDismiss={() => handleDismiss('alert', alert.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Help Text */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <Clock className="inline h-4 w-4 mr-2" />
            Notifications are automatically archived after 30 days of being marked as read.
          </p>
        </div>
      </div>
    </div>
  );
}
