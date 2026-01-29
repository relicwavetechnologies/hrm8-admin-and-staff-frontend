import { Notification, NotificationPriority } from '@/shared/types/notification';
import { NotificationEventType } from '@/shared/types/notificationPreferences';
import { 
  createNotification, 
  getNotifications,
  markAsRead,
  deleteNotification 
} from './notificationStorage';
import { shouldSendNotification } from './notificationPreferencesStorage';
import { generateMockNotification, NOTIFICATION_TEMPLATES } from '@/shared/data/mockNotifications';
import { toast } from 'sonner';

interface NotificationQueue {
  notification: Omit<Notification, 'id' | 'createdAt'>;
  priority: NotificationPriority;
  scheduledFor?: Date;
}

class NotificationManager {
  private queue: NotificationQueue[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 2000; // 2 seconds
  private readonly MAX_BATCH_SIZE = 10;
  private recentNotifications = new Map<string, number>(); // For deduplication

  /**
   * Trigger a notification based on platform event
   */
  triggerNotification(
    eventType: NotificationEventType,
    data: any,
    userId: string
  ): Notification | null {
    // Check if user preferences allow this notification
    if (!shouldSendNotification(userId, eventType, 'in-app')) {
      console.log(`Notification blocked by user preferences: ${eventType}`);
      return null;
    }

    // Check for duplicates (within 5 minutes)
    const dedupeKey = `${userId}-${eventType}-${JSON.stringify(data)}`;
    const lastSent = this.recentNotifications.get(dedupeKey);
    if (lastSent && Date.now() - lastSent < 5 * 60 * 1000) {
      console.log(`Duplicate notification prevented: ${eventType}`);
      return null;
    }

    // Map event type to template key
    const templateKey = eventType as keyof typeof NOTIFICATION_TEMPLATES;
    if (!NOTIFICATION_TEMPLATES[templateKey]) {
      console.warn(`No template found for event type: ${eventType}`);
      return null;
    }

    const notificationData = generateMockNotification(templateKey, data, userId);
    
    // Add to queue
    this.addToQueue({
      notification: notificationData,
      priority: notificationData.priority,
    });

    // Update deduplication map
    this.recentNotifications.set(dedupeKey, Date.now());

    // Clean up old deduplication entries
    this.cleanupDeduplicationMap();

    return notificationData as Notification;
  }

  /**
   * Add notification to batch queue
   */
  private addToQueue(item: NotificationQueue) {
    // Check if queue is full
    if (this.queue.length >= this.MAX_BATCH_SIZE) {
      this.processQueue();
    }

    // Add to queue based on priority
    if (item.priority === 'critical' || item.priority === 'high') {
      // Process critical/high priority immediately
      this.processImmediately(item.notification);
      return;
    }

    this.queue.push(item);

    // Start batch timer if not already running
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processQueue();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * Process a single notification immediately
   */
  private processImmediately(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const created = createNotification(notification);
    
    // Show toast for high priority notifications
    if (notification.priority === 'critical' || notification.priority === 'high') {
      toast.error(notification.title, {
        description: notification.message,
        action: notification.link ? {
          label: 'View',
          onClick: () => window.location.href = notification.link!,
        } : undefined,
      });
    }

    return created;
  }

  /**
   * Process queued notifications in batch
   */
  private processQueue() {
    if (this.queue.length === 0) return;

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    this.queue.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Process all queued notifications
    const processed = this.queue.map(item => 
      createNotification(item.notification)
    );

    // Show summary toast for batched notifications
    if (processed.length > 1) {
      toast.info(`${processed.length} new notifications`, {
        description: 'Click the bell icon to view all notifications',
      });
    }

    // Clear queue and timeout
    this.queue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  scheduleNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>,
    scheduledFor: Date
  ) {
    const delay = scheduledFor.getTime() - Date.now();
    
    if (delay <= 0) {
      // Send immediately if scheduled time has passed
      return this.processImmediately(notification);
    }

    // Schedule for future
    setTimeout(() => {
      this.processImmediately(notification);
    }, delay);

    return null;
  }

  /**
   * Bulk operations
   */
  markMultipleAsRead(notificationIds: string[]): number {
    let count = 0;
    notificationIds.forEach(id => {
      if (markAsRead(id)) count++;
    });
    return count;
  }

  deleteMultiple(notificationIds: string[]): number {
    let count = 0;
    notificationIds.forEach(id => {
      if (deleteNotification(id)) count++;
    });
    return count;
  }

  /**
   * Auto-archive old notifications (30+ days)
   */
  autoArchiveOld(userId: string): number {
    const notifications = getNotifications(userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let count = 0;
    notifications.forEach(notification => {
      const createdAt = new Date(notification.createdAt);
      if (createdAt < thirtyDaysAgo && !notification.archived) {
        // In a real app, we'd update the notification
        // For now, we'll just count them
        count++;
      }
    });

    return count;
  }

  /**
   * Cleanup deduplication map (remove entries older than 1 hour)
   */
  private cleanupDeduplicationMap() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, timestamp] of this.recentNotifications.entries()) {
      if (timestamp < oneHourAgo) {
        this.recentNotifications.delete(key);
      }
    }
  }

  /**
   * Get queue status (for debugging)
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      hasPendingBatch: this.batchTimeout !== null,
      deduplicationEntries: this.recentNotifications.size,
    };
  }

  /**
   * Clear all queues (for testing)
   */
  clearQueues() {
    this.queue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.recentNotifications.clear();
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Convenience functions
export function triggerNotification(
  eventType: NotificationEventType,
  data: any,
  userId: string = 'user-1'
) {
  return notificationManager.triggerNotification(eventType, data, userId);
}

export function scheduleNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>,
  scheduledFor: Date
) {
  return notificationManager.scheduleNotification(notification, scheduledFor);
}
