import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getNotifications, 
  getUnreadNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  searchNotifications,
  filterNotifications,
  NotificationFilters
} from '@/shared/lib/notificationStorage';
import { Notification } from '@/shared/types/notification';

export function useNotifications(userId: string) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const notifications = useMemo(() => {
    let results = getNotifications(userId);
    
    if (searchQuery) {
      results = searchNotifications(userId, searchQuery);
    }
    
    if (Object.keys(filters).length > 0) {
      results = filterNotifications(results, filters);
    }
    
    return results;
  }, [userId, refreshKey, filters, searchQuery]);

  const unreadNotifications = useMemo(() => 
    getUnreadNotifications(userId),
    [userId, refreshKey]
  );

  const stats = useMemo(() => 
    getNotificationStats(userId),
    [userId, refreshKey]
  );

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsRead(notificationId);
    refresh();
  }, [refresh]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead(userId);
    refresh();
  }, [userId, refresh]);

  const handleDelete = useCallback((notificationId: string) => {
    deleteNotification(notificationId);
    refresh();
  }, [refresh]);

  const updateFilters = useCallback((newFilters: NotificationFilters) => {
    setFilters(newFilters);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    notifications,
    unreadNotifications,
    stats,
    filters,
    searchQuery,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    updateFilters,
    updateSearchQuery,
    clearFilters,
    refresh,
  };
}
