import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SyncNotification } from './tradeSyncService';

interface PushNotificationConfig {
  tradeSync: boolean;
  balanceAlerts: boolean;
  connectionErrors: boolean;
  priceAlerts: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private config: PushNotificationConfig = {
    tradeSync: true,
    balanceAlerts: true,
    connectionErrors: true,
    priceAlerts: true
  };

  private constructor() {
    this.initializePushNotifications();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async initializePushNotifications() {
    // Only initialize on mobile platforms
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Request permissions
      await LocalNotifications.requestPermissions();

      // Add listener for notification interactions
      LocalNotifications.addListener('localNotificationActionPerformed', this.handleNotificationAction);
    } catch (error) {
      console.error('Failed to initialize local notifications:', error);
    }
  }

  private handleNotificationAction = async (action: any) => {
    console.log('Notification action performed:', action);
    // Handle notification tap actions
    switch (action.notification.extra?.type) {
      case 'trade_sync':
        // Navigate to trade sync details
        break;
      case 'balance_update':
        // Navigate to account details
        break;
      case 'connection_error':
        // Navigate to connection settings
        break;
    }
  }

  public async sendNotification(notification: SyncNotification) {
    // Check if notification type is enabled in config
    if (!this.shouldSendNotification(notification)) return;

    // Only send on mobile platforms
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: this.getNotificationTitle(notification),
          body: notification.message,
          id: Date.now(), // Unique ID for each notification
          schedule: { at: new Date(Date.now()) }, // Send immediately
          sound: notification.severity === 'error' ? 'default' : undefined,
          extra: {
            type: notification.type,
            severity: notification.severity
          }
        }]
      });
    } catch (error) {
      console.error('Failed to send local notification', error);
    }
  }

  private shouldSendNotification(notification: SyncNotification): boolean {
    switch (notification.type) {
      case 'trade_sync':
        return this.config.tradeSync;
      case 'balance_update':
        return this.config.balanceAlerts;
      case 'connection_error':
        return this.config.connectionErrors;
      default:
        return true;
    }
  }

  private getNotificationTitle(notification: SyncNotification): string {
    switch (notification.type) {
      case 'trade_sync':
        return 'Trade Sync Complete';
      case 'balance_update':
        return 'Account Balance Updated';
      case 'connection_error':
        return 'Connection Error';
      case 'api_expiry':
        return 'API Key Expiring';
      default:
        return 'Quantum Risk Coach Notification';
    }
  }

  public updateNotificationConfig(config: Partial<PushNotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  public getNotificationConfig(): PushNotificationConfig {
    return { ...this.config };
  }
} 