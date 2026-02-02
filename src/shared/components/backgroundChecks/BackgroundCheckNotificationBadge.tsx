import { Bell } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useBackgroundCheckNotifications } from '@/shared/hooks/useBackgroundCheckNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { markAsRead } from '@/shared/lib/notificationStorage';

/**
 * Notification badge specifically for background check notifications
 * Shows unread count and dropdown with recent notifications
 */
export function BackgroundCheckNotificationBadge() {
  const { notifications, unreadCount, refresh } = useBackgroundCheckNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
      refresh();
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Background Check Updates</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/notification-center')}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
