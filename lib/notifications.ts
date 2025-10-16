import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { TimeFormat } from './timeFormat';

export interface NotificationSettings {
  clockInReminder: boolean;
  clockOutReminder: boolean;
  breakReminder: boolean;
  overtimeAlert: boolean;
  reminderTime: number; // minutes before end of workday
  breakReminderTime: number; // minutes for break reminders
}

export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      
      if (this.permissionGranted && messaging) {
        try {
          // Register service worker first
          await this.registerServiceWorker();
          await this.getFCMToken();
          this.setupMessageListener();
        } catch (error) {
          console.warn('FCM setup failed, using browser notifications only:', error);
        }
      }
      
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      
      console.log('Service worker registered successfully:', registration);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    if (!messaging) return null;

    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private setupMessageListener(): void {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Handle foreground messages
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || 'Time Tracker',
          payload.notification.body || 'You have a new notification'
        );
      }
    });
  }

  showNotification(title: string, body: string, options?: NotificationOptions): void {
    if (!this.permissionGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    if ('Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Time-based notifications
  scheduleClockInReminder(time: Date): void {
    const now = new Date();
    const delay = time.getTime() - now.getTime();
    
    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(
          'Time to Clock In!',
          'Don\'t forget to clock in for your work day.',
          { tag: 'clock-in-reminder' }
        );
      }, delay);
    }
  }

  scheduleClockOutReminder(time: Date): void {
    const now = new Date();
    const delay = time.getTime() - now.getTime();
    
    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(
          'Time to Clock Out!',
          'Don\'t forget to clock out at the end of your work day.',
          { tag: 'clock-out-reminder' }
        );
      }, delay);
    }
  }

  scheduleBreakReminder(intervalMinutes: number): void {
    setInterval(() => {
      this.showNotification(
        'Break Reminder',
        'Consider taking a break to stay productive.',
        { tag: 'break-reminder' }
      );
    }, intervalMinutes * 60 * 1000);
  }

  scheduleOvertimeAlert(thresholdHours: number, currentHours: number): void {
    if (currentHours >= thresholdHours) {
      this.showNotification(
        'Overtime Alert',
        `You've worked ${currentHours.toFixed(1)} hours today. Consider clocking out soon.`,
        { tag: 'overtime-alert' }
      );
    }
  }

  // Browser notification helpers
  showClockInSuccess(): void {
    this.showNotification(
      'Clocked In Successfully!',
      'Your work day has started. Have a productive day!',
      { tag: 'clock-in-success' }
    );
  }

  showClockOutSuccess(): void {
    this.showNotification(
      'Clocked Out Successfully!',
      'Your work day has ended. Great job today!',
      { tag: 'clock-out-success' }
    );
  }

  showBreakStartSuccess(): void {
    this.showNotification(
      'Break Started',
      'Enjoy your break! Don\'t forget to clock back in.',
      { tag: 'break-start-success' }
    );
  }

  showBreakEndSuccess(): void {
    this.showNotification(
      'Break Ended',
      'Welcome back! Your break has ended.',
      { tag: 'break-end-success' }
    );
  }

  showLateClockIn(expectedTime: Date): void {
    this.showNotification(
      'Late Clock In',
      `You're clocking in late. Expected time was ${TimeFormat.formatDisplayTime(expectedTime)}.`,
      { tag: 'late-clock-in' }
    );
  }

  showEarlyClockOut(expectedTime: Date): void {
    this.showNotification(
      'Early Clock Out',
      `You're clocking out early. Expected time was ${TimeFormat.formatDisplayTime(expectedTime)}.`,
      { tag: 'early-clock-out' }
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
