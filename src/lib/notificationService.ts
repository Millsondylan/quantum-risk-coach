/**
 * Notification Service for Quantum Risk Coach
 * Handles push notifications, permission requests, and notification center integration
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

export interface NotificationConfig {
  title: string;
  body: string;
  id?: number;
  icon?: string;
  badge?: number;
  data?: any;
  silent?: boolean;
  priority?: 'low' | 'normal' | 'high';
  category?: 'trade' | 'market' | 'ai' | 'general';
}

export interface NotificationPermissions {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  local: boolean;
  push: boolean;
}

class NotificationService {
  private permissionStatus: NotificationPermissions = {
    granted: false,
    denied: false,
    prompt: true,
    local: false,
    push: false
  };

  private notificationQueue: NotificationConfig[] = [];
  private isInitialized = false;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        // Initialize native notifications
        await this.initializeNativeNotifications();
      } else {
        // Initialize web notifications
        await this.initializeWebNotifications();
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  /**
   * Request notification permissions (no top-screen dialogs)
   */
  async requestPermissions(): Promise<NotificationPermissions> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Request native permissions
        const localResult = await LocalNotifications.requestPermissions();
        const pushResult = await PushNotifications.requestPermissions();

        this.permissionStatus = {
          granted: localResult.display === 'granted' && pushResult.receive === 'granted',
          denied: localResult.display === 'denied' || pushResult.receive === 'denied',
          prompt: false,
          local: localResult.display === 'granted',
          push: pushResult.receive === 'granted'
        };
      } else {
        // Request web permissions
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          
          this.permissionStatus = {
            granted: permission === 'granted',
            denied: permission === 'denied',
            prompt: permission === 'default',
            local: permission === 'granted',
            push: permission === 'granted'
          };
        } else {
          this.permissionStatus = {
            granted: false,
            denied: true,
            prompt: false,
            local: false,
            push: false
          };
        }
      }

      return this.permissionStatus;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return this.permissionStatus;
    }
  }

  /**
   * Check current permission status without requesting
   */
  async checkPermissions(): Promise<NotificationPermissions> {
    try {
      if (Capacitor.isNativePlatform()) {
        const localPerms = await LocalNotifications.checkPermissions();
        const pushPerms = await PushNotifications.checkPermissions();

        this.permissionStatus = {
          granted: localPerms.display === 'granted' && pushPerms.receive === 'granted',
          denied: localPerms.display === 'denied' || pushPerms.receive === 'denied',
          prompt: localPerms.display === 'prompt' || pushPerms.receive === 'prompt',
          local: localPerms.display === 'granted',
          push: pushPerms.receive === 'granted'
        };
      } else {
        if ('Notification' in window) {
          const permission = Notification.permission;
          
          this.permissionStatus = {
            granted: permission === 'granted',
            denied: permission === 'denied',
            prompt: permission === 'default',
            local: permission === 'granted',
            push: permission === 'granted'
          };
        }
      }

      return this.permissionStatus;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return this.permissionStatus;
    }
  }

  /**
   * Send notification to user's notification center (no top-screen overlay)
   */
  async sendNotification(config: NotificationConfig): Promise<boolean> {
    try {
      // Check permissions first
      const permissions = await this.checkPermissions();
      if (!permissions.granted) {
        console.warn('Notifications not permitted');
        return false;
      }

      const notificationId = config.id || Date.now();

      if (Capacitor.isNativePlatform()) {
        // Send native notification
        await LocalNotifications.schedule({
          notifications: [{
            id: notificationId,
            title: config.title,
            body: config.body,
            iconColor: '#00d9ff',
            sound: config.silent ? undefined : 'beep.wav',
            attachments: config.icon ? [{ id: 'icon', url: config.icon }] : undefined,
            extra: config.data || {},
            schedule: { at: new Date(Date.now() + 100) }, // Immediate delivery
          }]
        });
      } else {
        // Send web notification (goes directly to notification center)
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(config.title, {
            body: config.body,
            icon: config.icon || '/favicon.ico',
            badge: config.badge?.toString(),
            data: config.data,
            silent: config.silent || false,
            requireInteraction: false, // Don't keep notification on screen
            tag: `quantum-risk-coach-${notificationId.toString()}`, // Unique tag
          });

          // Auto-close web notification after 5 seconds (goes to notification center)
          setTimeout(() => notification.close(), 5000);
        }
      }

      console.log(`📱 Notification sent: ${config.title}`);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send trade-related notification
   */
  async sendTradeNotification(
    type: 'opened' | 'closed' | 'profit' | 'loss',
    symbol: string,
    pnl?: number
  ): Promise<boolean> {
    const notifications = {
      opened: {
        title: '📈 Trade Opened',
        body: `New ${symbol} trade has been opened`,
        category: 'trade' as const
      },
      closed: {
        title: '📊 Trade Closed',
        body: `${symbol} trade has been closed${pnl ? ` (PnL: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)})` : ''}`,
        category: 'trade' as const
      },
      profit: {
        title: '💰 Profitable Trade',
        body: `${symbol} trade closed with profit: +$${pnl?.toFixed(2) || '0.00'}`,
        category: 'trade' as const
      },
      loss: {
        title: '📉 Trade Loss',
        body: `${symbol} trade closed with loss: -$${Math.abs(pnl || 0).toFixed(2)}`,
        category: 'trade' as const
      }
    };

    return this.sendNotification(notifications[type]);
  }

  /**
   * Send market-related notification
   */
  async sendMarketNotification(
    title: string,
    message: string,
    symbol?: string
  ): Promise<boolean> {
    return this.sendNotification({
      title: `📊 ${title}`,
      body: message,
      category: 'market',
      data: { symbol }
    });
  }

  /**
   * Send AI coach notification
   */
  async sendAINotification(
    insight: string,
    recommendation?: string
  ): Promise<boolean> {
    return this.sendNotification({
      title: '🤖 AI Coach Insight',
      body: insight,
      category: 'ai',
      data: { recommendation }
    });
  }

  /**
   * Schedule recurring notifications (daily, weekly, etc.)
   */
  async scheduleRecurringNotification(
    config: NotificationConfig & { 
      interval: 'daily' | 'weekly' | 'monthly';
      time: { hour: number; minute: number } 
    }
  ): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.warn('Recurring notifications only supported on native platforms');
        return false;
      }

      const now = new Date();
      const scheduleTime = new Date();
      scheduleTime.setHours(config.time.hour, config.time.minute, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduleTime.getTime() <= now.getTime()) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
      }

      const repeatInterval = config.interval === 'daily' ? 'day' : 
                          config.interval === 'weekly' ? 'week' : 'month';
      
      await LocalNotifications.schedule({
        notifications: [{
          id: config.id || Date.now(),
          title: config.title,
          body: config.body,
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: repeatInterval as any
          }
        }]
      });

      return true;
    } catch (error) {
      console.error('Error scheduling recurring notification:', error);
      return false;
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({ notifications: [] });
      }
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    permissionsGranted: boolean;
    totalSent: number;
    queuedCount: number;
  } {
    return {
      permissionsGranted: this.permissionStatus.granted,
      totalSent: 0, // Would track this in a real implementation
      queuedCount: this.notificationQueue.length
    };
  }

  /**
   * Initialize native notifications (mobile)
   */
  private async initializeNativeNotifications(): Promise<void> {
    // Set up local notification listeners
    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received:', notification);
    });

    await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('Local notification action performed:', action);
    });

    // Set up push notification listeners
    await PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed:', action);
    });

    // Register for push notifications
    await PushNotifications.register();
  }

  /**
   * Initialize web notifications
   */
  private async initializeWebNotifications(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered:', registration);
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<boolean> {
    return this.sendNotification({
      title: '🧪 Test Notification',
      body: 'This is a test notification from Quantum Risk Coach',
      category: 'general',
      id: 999999
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Auto-initialize when imported
notificationService.initialize(); 