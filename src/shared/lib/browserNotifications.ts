import type { Notification as AppNotification } from '@/shared/types/notification';

class BrowserNotificationManager {
  private permission: NotificationPermission = 'default';
  private soundEnabled = true;

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  canSendNotifications(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  async sendNotification(notification: AppNotification) {
    if (!this.canSendNotifications()) {
      console.log('Browser notifications not enabled');
      return;
    }

    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        silent: !this.soundEnabled,
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
        browserNotif.close();
      };

      // Auto-close after 10 seconds (except critical)
      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotif.close(), 10000);
      }

      // Play sound if enabled
      if (this.soundEnabled) {
        this.playNotificationSound(notification.priority);
      }
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  private playNotificationSound(priority: string) {
    // In production, you'd load actual sound files
    // For now, we'll use the system default sound
    // const audio = new Audio();

    // Different frequencies for different priorities
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Set frequency based on priority
    switch (priority) {
      case 'critical':
        oscillator.frequency.value = 880; // A5
        break;
      case 'high':
        oscillator.frequency.value = 660; // E5
        break;
      default:
        oscillator.frequency.value = 440; // A4
    }

    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('browser_notifications_sound', enabled.toString());
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

// Singleton instance
export const browserNotifications = new BrowserNotificationManager();

// Load sound preference from localStorage
if (typeof window !== 'undefined') {
  const soundPref = localStorage.getItem('browser_notifications_sound');
  if (soundPref !== null) {
    browserNotifications.setSoundEnabled(soundPref === 'true');
  }
}
