import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Check, AlertTriangle, Info, Bell, X, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { useUniversalNotifications } from '@/shared/hooks/useUniversalNotifications';
import { formatDistanceToNow } from 'date-fns';

export default function ConsultantNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasMore,
    loadMore,
  } = useUniversalNotifications({
    autoFetch: true,
    limit: 20,
    showToasts: false,
  });

  // Separate notifications into alerts (high priority/warnings) and regular notifications
  const alerts = notifications.filter(
    (n) =>
      n.type?.includes('WITHDRAWAL_REJECTED') ||
      n.type?.includes('REFUND') ||
      n.type?.includes('LOW_BALANCE') ||
      n.type?.includes('COMMISSION_EARNED')
  );

  const regularNotifications = notifications.filter(
    (n) => !alerts.find((a) => a.id === n.id)
  );

  const getNotificationIcon = (type: string) => {
    if (
      type?.includes('WITHDRAWAL') ||
      type?.includes('REFUND') ||
      type?.includes('LOW_BALANCE')
    ) {
      return <AlertTriangle className="h-5 w-5" />;
    }
    if (type?.includes('COMMISSION')) {
      return <Info className="h-5 w-5" />;
    }
    return <Bell className="h-5 w-5" />;
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) {
      return 'border-l-gray-300 bg-gray-50 dark:border-l-gray-700 dark:bg-gray-900/50';
    }
    if (
      type?.includes('WITHDRAWAL_REJECTED') ||
      type?.includes('LOW_BALANCE')
    ) {
      return 'border-l-red-500 bg-red-50 dark:border-l-red-600 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30';
    }
    if (type?.includes('REFUND') || type?.includes('WITHDRAWAL_APPROVED') || type?.includes('COMMISSION_EARNED')) {
      return 'border-l-green-500 bg-green-50 dark:border-l-green-600 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30';
    }
    return 'border-l-blue-500 bg-blue-50 dark:border-l-blue-600 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30';
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDismiss = async (id: string) => {
    await deleteNotification(id);
  };

  const NotificationItem = ({
    item,
    onMarkAsRead,
    onDismiss,
  }: {
    item: typeof notifications[0];
    onMarkAsRead: () => void;
    onDismiss: () => void;
  }) => {
    return (
      <div
        className={cn(
          'group relative rounded-lg border-l-4 transition-all duration-200',
          getNotificationColor(item.type, item.read),
          'p-4'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'mt-1 rounded-full p-2.5 flex-shrink-0',
              item.read
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : item.type?.includes('WITHDRAWAL_REJECTED') ||
                  item.type?.includes('LOW_BALANCE')
                ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                : item.type?.includes('COMMISSION_EARNED')
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
            )}
          >
            {getNotificationIcon(item.type)}
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
                  {(() => {
                    try {
                      if (!item.createdAt) return 'Just now';
                      const date = new Date(item.createdAt);
                      if (isNaN(date.getTime())) return 'Just now';
                      return formatDistanceToNow(date, { addSuffix: true });
                    } catch (e) {
                      return 'Just now';
                    }
                  })()}
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

            {item.type && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  )}
                >
                  {item.type.replace(/_/g, ' ').toLowerCase()}
                </span>
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
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay informed with job assignments, commissions, and updates
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
                    {regularNotifications.filter((n) => !n.read).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                        {regularNotifications.filter((n) => !n.read).length}
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
                    <span>Important</span>
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
                  {unreadCount} unread
                  {unreadCount > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="ml-3 h-auto p-0 text-blue-600 dark:text-blue-400"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : regularNotifications.length === 0 ? (
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
                <>
                  <div className="space-y-3">
                    {regularNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        item={notification}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onDismiss={() => handleDismiss(notification.id)}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Load more'}
                      </Button>
                    </div>
                  )}
                </>
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
                      onClick={handleMarkAllAsRead}
                      className="ml-3 h-auto p-0 text-blue-600 dark:text-blue-400"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : alerts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No important notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    All caught up
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <NotificationItem
                        key={alert.id}
                        item={alert}
                        onMarkAsRead={() => handleMarkAsRead(alert.id)}
                        onDismiss={() => handleDismiss(alert.id)}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Load more'}
                      </Button>
                    </div>
                  )}
                </>
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
