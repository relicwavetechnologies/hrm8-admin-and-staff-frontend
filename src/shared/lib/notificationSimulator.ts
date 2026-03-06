import { generateRandomNotification } from '@/shared/data/mockNotifications';
import { createNotification } from './notificationStorage';
import { toast } from 'sonner';

class NotificationSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly MIN_DELAY = 30000; // 30 seconds
  private readonly MAX_DELAY = 120000; // 2 minutes

  start(userId: string = 'user-1') {
    if (this.isRunning) {
      console.log('Notification simulator is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting notification simulator...');

    const scheduleNext = () => {
      const delay = Math.random() * (this.MAX_DELAY - this.MIN_DELAY) + this.MIN_DELAY;
      
      this.intervalId = setTimeout(() => {
        if (!this.isRunning) return;

        // Generate and create notification
        const notification = generateRandomNotification(userId);
        const created = createNotification(notification);

        // Show toast for high priority notifications only
        if (notification.priority === 'critical' || notification.priority === 'high') {
          toast[notification.type === 'error' ? 'error' : 'warning'](
            notification.title,
            {
              description: notification.message,
              duration: 5000,
            }
          );
        }

        console.log('Simulated notification:', created);

        // Schedule next notification
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  stop() {
    if (!this.isRunning) {
      console.log('Notification simulator is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('Notification simulator stopped');
  }

  toggle(userId: string = 'user-1') {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start(userId);
    }
    return this.isRunning;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      minDelay: this.MIN_DELAY,
      maxDelay: this.MAX_DELAY,
    };
  }
}

// Singleton instance
export const notificationSimulator = new NotificationSimulator();

// Auto-start on page load (can be disabled in settings)
if (typeof window !== 'undefined') {
  const autoStart = localStorage.getItem('notification_simulator_enabled');
  if (autoStart !== 'false') {
    // Start after 5 seconds
    setTimeout(() => {
      notificationSimulator.start();
    }, 5000);
  }
}
