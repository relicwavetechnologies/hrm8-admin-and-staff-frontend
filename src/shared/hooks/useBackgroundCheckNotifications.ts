import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '@/shared/lib/notificationStorage';
import { Notification } from '@/shared/types/notification';

/**
 * Hook for real-time background check notifications
 * Polls for new notifications and provides filtering
 */
export function useBackgroundCheckNotifications(userId: string = 'user-1') {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    const allNotifications = getNotifications(userId);
    
    // Filter for background check notifications (document category with background check metadata)
    const bgCheckNotifications = allNotifications.filter(
      n => n.category === 'document' && n.metadata?.checkId
    );

    setNotifications(bgCheckNotifications);
    setUnreadCount(bgCheckNotifications.filter(n => !n.read).length);
    setLoading(false);
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications by event type
  const getByEvent = useCallback((event: string) => {
    return notifications.filter(n => n.metadata?.event === event);
  }, [notifications]);

  // Get critical notifications (requiring immediate action)
  const getCritical = useCallback(() => {
    return notifications.filter(n => n.priority === 'critical' && !n.read);
  }, [notifications]);

  // Get notifications requiring review
  const getRequiringReview = useCallback(() => {
    return notifications.filter(
      n => !n.read && 
      (n.metadata?.event === 'check_requires_review' || 
       n.metadata?.event === 'check_issues_found' ||
       n.metadata?.event === 'all_referees_completed')
    );
  }, [notifications]);

  // Get notifications by check ID
  const getByCheckId = useCallback((checkId: string) => {
    return notifications.filter(n => n.metadata?.checkId === checkId);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    getByEvent,
    getCritical,
    getRequiringReview,
    getByCheckId,
  };
}
