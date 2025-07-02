import { toast } from 'sonner';

export interface PushNotificationConfig {
  vapidKey?: string;
  serverKey?: string;
  endpoint?: string;
}

export interface NotificationPreferences {
  priceAlerts: boolean;
  newsAlerts: boolean;
  aiInsights: boolean;
  tradeSignals: boolean;
  economicEvents: boolean;
  portfolioAlerts: boolean;
  riskWarnings: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  weekends: boolean;
  minimumImpact: 'low' | 'medium' | 'high';
  frequency: 'instant' | 'batched' | 'daily';
  personalizedSymbols: string[];
  tradingStyle: 'day' | 'swing' | 'position' | 'scalping';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface PersonalizationProfile {
  userId: string;
  preferences: NotificationPreferences;
  watchlist: string[];
  tradingHistory: any[];
  performanceMetrics: {
    winRate: number;
    avgReturn: number;
    riskScore: number;
    preferredTimeframes: string[];
  };
  aiPersonality: 'conservative' | 'balanced' | 'aggressive' | 'custom';
  learningMode: boolean;
  customAlerts: CustomAlert[];
}

export interface CustomAlert {
  id: string;
  name: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AlertCondition {
  type: 'price' | 'volume' | 'indicator' | 'news' | 'time';
  symbol?: string;
  operator: 'above' | 'below' | 'equals' | 'crosses';
  value: number | string;
  timeframe?: string;
}

export interface AlertAction {
  type: 'notification' | 'email' | 'telegram' | 'webhook';
  config: any;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private preferences: NotificationPreferences;
  private personalization: PersonalizationProfile | null = null;
  private isInitialized = false;

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.initializeService();
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      priceAlerts: true,
      newsAlerts: true,
      aiInsights: true,
      tradeSignals: true,
      economicEvents: true,
      portfolioAlerts: true,
      riskWarnings: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      weekends: true,
      minimumImpact: 'medium',
      frequency: 'instant',
      personalizedSymbols: ['BTCUSDT', 'EURUSD', 'GBPUSD', 'USDJPY'],
      tradingStyle: 'day',
      riskTolerance: 'moderate',
      experience: 'intermediate'
    };
  }

  async initializeService(): Promise<boolean> {
    try {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered for push notifications');

      // Load user preferences
      await this.loadUserPreferences();
      
      // Set up message listener
      this.setupMessageListener();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribe();
      toast.success('Push notifications enabled successfully!');
    } else {
      toast.error('Push notification permission denied');
    }

    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      // Default VAPID key - replace with your actual key
      const vapidKey = 'BNJxPGLYGTvQ3j1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      console.log('Push subscription successful');
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      
      // Remove subscription from server
      await this.removeSubscriptionFromServer();
      
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async sendNotification(notification: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: NotificationAction[];
    data?: any;
    type?: string;
  }): Promise<void> {
    // Check if notifications should be sent based on preferences
    if (!this.shouldSendNotification(notification)) {
      return;
    }

    // Personalize notification content
    const personalizedNotification = this.personalizeNotification(notification);

    if (Notification.permission === 'granted') {
      // Send immediate notification
      new Notification(personalizedNotification.title, {
        body: personalizedNotification.body,
        icon: personalizedNotification.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: personalizedNotification.tag || 'qlarity',
        requireInteraction: personalizedNotification.requireInteraction || false,
        actions: personalizedNotification.actions,
        data: personalizedNotification.data
      });

      // Also send via service worker for background notifications
      if (this.registration) {
        this.registration.showNotification(personalizedNotification.title, {
          body: personalizedNotification.body,
          icon: personalizedNotification.icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: personalizedNotification.tag || 'qlarity',
          requireInteraction: personalizedNotification.requireInteraction || false,
          actions: personalizedNotification.actions,
          data: personalizedNotification.data
        });
      }

      // Log notification for analytics
      this.logNotification(personalizedNotification);
    }
  }

  private shouldSendNotification(notification: any): boolean {
    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= this.preferences.quietHours.start || currentTime <= this.preferences.quietHours.end) {
        // Only send high priority notifications during quiet hours
        if (notification.priority !== 'high') {
          return false;
        }
      }
    }

    // Check weekend preferences
    if (!this.preferences.weekends) {
      const now = new Date();
      if (now.getDay() === 0 || now.getDay() === 6) {
        return false;
      }
    }

    // Check notification type preferences
    const type = notification.type;
    switch (type) {
      case 'price_alert':
        return this.preferences.priceAlerts;
      case 'news_alert':
        return this.preferences.newsAlerts;
      case 'ai_insight':
        return this.preferences.aiInsights;
      case 'trade_signal':
        return this.preferences.tradeSignals;
      case 'economic_event':
        return this.preferences.economicEvents;
      case 'portfolio_alert':
        return this.preferences.portfolioAlerts;
      case 'risk_warning':
        return this.preferences.riskWarnings;
      default:
        return true;
    }
  }

  private personalizeNotification(notification: any): any {
    if (!this.personalization) {
      return notification;
    }

    const { preferences, performanceMetrics, aiPersonality } = this.personalization;
    const personalizedContent = { ...notification };

    // Personalize based on trading style
    if (notification.type === 'trade_signal') {
      switch (preferences.tradingStyle) {
        case 'scalping':
          personalizedContent.title = `⚡ Quick ${notification.title}`;
          break;
        case 'swing':
          personalizedContent.title = `📊 Swing ${notification.title}`;
          break;
        case 'position':
          personalizedContent.title = `📈 Long-term ${notification.title}`;
          break;
      }
    }

    // Personalize based on experience level
    if (preferences.experience === 'beginner') {
      personalizedContent.body += '\n💡 Tip: Consider your risk management strategy';
    } else if (preferences.experience === 'professional') {
      // Add technical details for professionals
      if (notification.technicalData) {
        personalizedContent.body += `\nTechnical: ${notification.technicalData}`;
      }
    }

    // Personalize based on performance
    if (performanceMetrics.winRate < 0.5 && notification.type === 'trade_signal') {
      personalizedContent.body += '\n⚠️ Consider your recent performance when making decisions';
    }

    // AI personality adjustment
    switch (aiPersonality) {
      case 'conservative':
        if (notification.riskLevel === 'high') {
          personalizedContent.body = `🛡️ Conservative Alert: ${personalizedContent.body}`;
        }
        break;
      case 'aggressive':
        if (notification.opportunity) {
          personalizedContent.body = `🚀 Opportunity: ${personalizedContent.body}`;
        }
        break;
    }

    return personalizedContent;
  }

  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    
    // Save to localStorage
    localStorage.setItem('pushNotificationPreferences', JSON.stringify(this.preferences));
    
    // Update personalization profile
    if (this.personalization) {
      this.personalization.preferences = this.preferences;
      await this.savePersonalizationProfile();
    }

    toast.success('Notification preferences updated successfully!');
  }

  async loadUserPreferences(): Promise<void> {
    try {
      // Load from localStorage
      const stored = localStorage.getItem('pushNotificationPreferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }

      // Load personalization profile
      await this.loadPersonalizationProfile();
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  async createPersonalizationProfile(userId: string): Promise<PersonalizationProfile> {
    const profile: PersonalizationProfile = {
      userId,
      preferences: this.preferences,
      watchlist: ['BTCUSDT', 'EURUSD', 'GBPUSD', 'USDJPY'],
      tradingHistory: [],
      performanceMetrics: {
        winRate: 0.5,
        avgReturn: 0,
        riskScore: 50,
        preferredTimeframes: ['1h', '4h', '1d']
      },
      aiPersonality: 'balanced',
      learningMode: true,
      customAlerts: []
    };

    this.personalization = profile;
    await this.savePersonalizationProfile();
    
    return profile;
  }

  async updatePersonalizationProfile(updates: Partial<PersonalizationProfile>): Promise<void> {
    if (!this.personalization) {
      return;
    }

    this.personalization = { ...this.personalization, ...updates };
    await this.savePersonalizationProfile();
    
    toast.success('Personalization profile updated!');
  }

  private async loadPersonalizationProfile(): Promise<void> {
    try {
      const stored = localStorage.getItem('personalizationProfile');
      if (stored) {
        this.personalization = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load personalization profile:', error);
    }
  }

  private async savePersonalizationProfile(): Promise<void> {
    if (!this.personalization) {
      return;
    }

    try {
      localStorage.setItem('personalizationProfile', JSON.stringify(this.personalization));
    } catch (error) {
      console.error('Failed to save personalization profile:', error);
    }
  }

  async createCustomAlert(alert: Omit<CustomAlert, 'id'>): Promise<CustomAlert> {
    const newAlert: CustomAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!this.personalization) {
      throw new Error('Personalization profile not initialized');
    }

    this.personalization.customAlerts.push(newAlert);
    await this.savePersonalizationProfile();

    toast.success(`Custom alert "${newAlert.name}" created successfully!`);
    return newAlert;
  }

  async removeCustomAlert(alertId: string): Promise<void> {
    if (!this.personalization) {
      return;
    }

    this.personalization.customAlerts = this.personalization.customAlerts.filter(
      alert => alert.id !== alertId
    );
    
    await this.savePersonalizationProfile();
    toast.success('Custom alert removed');
  }

  async sendTestNotification(): Promise<void> {
    const testNotification = {
      title: '🧪 Test Notification',
      body: 'Your Qlarity notifications are working perfectly! This is a personalized test message.',
      icon: '/favicon.ico',
      tag: 'test-notification',
      type: 'test',
      priority: 'medium',
      data: {
        type: 'test',
        timestamp: Date.now(),
        userId: this.personalization?.userId
      }
    };

    await this.sendNotification(testNotification);
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // In a real implementation, send this to your backend server
    console.log('Subscription to send to server:', JSON.stringify(subscription));
    
    // Store subscription locally for now
    localStorage.setItem('pushSubscription', JSON.stringify(subscription));
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    // In a real implementation, remove this from your backend server
    console.log('Removing subscription from server');
    
    // Remove local storage
    localStorage.removeItem('pushSubscription');
  }

  private setupMessageListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'notification_click') {
          this.handleNotificationClick(event.data.data);
        }
      });
    }
  }

  private handleNotificationClick(data: any): void {
    console.log('Notification clicked:', data);
    
    // Handle different notification types
    switch (data.type) {
      case 'price_alert':
        // Navigate to price chart
        window.location.hash = '#/chart';
        break;
      case 'trade_signal':
        // Navigate to trade builder
        window.location.hash = '#/trade-builder';
        break;
      case 'news_alert':
        // Navigate to news section
        window.location.hash = '#/news';
        break;
      default:
        // Navigate to dashboard
        window.location.hash = '#/';
    }
  }

  private logNotification(notification: any): void {
    // Log notification for analytics and personalization improvement
    const log = {
      timestamp: Date.now(),
      type: notification.type,
      title: notification.title,
      userId: this.personalization?.userId,
      preferences: this.preferences
    };

    // Store in local analytics
    const logs = JSON.parse(localStorage.getItem('notificationLogs') || '[]');
    logs.push(log);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('notificationLogs', JSON.stringify(logs));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Getters
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  getPersonalization(): PersonalizationProfile | null {
    return this.personalization;
  }

  // Legacy alias for verification tests
  get userProfile(): PersonalizationProfile | null {
    return this.personalization;
  }

  isSubscribed(): boolean {
    return !!this.subscription;
  }

  getPermissionStatus(): NotificationPermission {
    return 'Notification' in window ? Notification.permission : 'denied';
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Export types
export type { 
  PushNotificationConfig, 
  NotificationPreferences, 
  PersonalizationProfile,
  CustomAlert,
  AlertCondition,
  AlertAction
}; 