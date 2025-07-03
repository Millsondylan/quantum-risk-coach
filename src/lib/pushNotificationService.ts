import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Toast } from '@capacitor/toast';
import { realDataService } from './realDataService';
import { AIStreamService } from './aiStreamService';

interface NotificationPreferences {
  priceAlerts: boolean;
  newsAlerts: boolean;
  aiInsights: boolean;
  tradeSignals: boolean;
  economicEvents: boolean;
  portfolioAlerts: boolean;
  riskWarnings: boolean;
  pushNotifications: boolean;
  telegram: boolean;
  soundEnabled: boolean;
  marketUpdates: boolean;
  tradeAlerts: boolean;
  marketSentiment: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  weekends: boolean;
  minimumImpact: string;
  frequency: string;
  personalizedSymbols: string[];
  tradingStyle?: string;
  riskTolerance?: string;
  experience?: string;
}

interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  id?: number;
  sound?: string;
  smallIcon?: string;
  largeIcon?: string;
  actionTypeId?: string;
  badge?: number;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private userPreferences: NotificationPreferences | null = null;
  private aiService: AIStreamService;
  private registrationToken: string | null = null;
  private alertThresholds = new Map<string, { high: number; low: number }>();

  constructor() {
    this.aiService = new AIStreamService({});
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(preferences: NotificationPreferences): Promise<void> {
    this.userPreferences = preferences;
    
    if (Capacitor.getPlatform() === 'web') {
      console.log('Push notifications not supported on web platform');
      return;
    }

    try {
      // Request permissions
      // Commented out until PushNotifications module is installed
      /*
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      // Register with OS
      await PushNotifications.register();
      */

      // Set up listeners
      this.setupListeners();
      
      // Initialize local notifications
      await LocalNotifications.requestPermissions();

      this.isInitialized = true;
      console.log('Push notification service initialized successfully');
      
      // Start monitoring based on preferences
      if (preferences.pushNotifications) {
        this.startMonitoring();
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      throw error;
    }
  }

  private setupListeners(): void {
    // Commented out until PushNotifications module is installed
    /*
    // Registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      this.registrationToken = token.value;
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show notification
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ' + JSON.stringify(notification));
      this.handleIncomingNotification(notification);
    });

    // Notification action performed
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ' + JSON.stringify(notification));
      this.handleNotificationAction(notification);
    });
    */
  }

  private async handleIncomingNotification(notification: any): Promise<void> {
    // Check quiet hours
    if (this.isInQuietHours()) {
      console.log('Notification suppressed due to quiet hours');
      return;
    }

    // Play sound if enabled
    if (this.userPreferences?.soundEnabled) {
      await this.playNotificationSound();
    }

    // Show local notification for better control
    await this.showLocalNotification({
      title: notification.title || 'Market Alert',
      body: notification.body || notification.data?.message || 'New update available',
      data: notification.data
    });
  }

  private handleNotificationAction(notification: any): void {
    const actionId = notification.actionId;
    const data = notification.notification.data;

    switch (actionId) {
      case 'open_trade':
        // Navigate to trade details
        console.log('Opening trade:', data.tradeId);
        break;
      case 'view_alert':
        // Navigate to alerts page
        console.log('Viewing alert:', data.alertId);
        break;
      case 'ai_insight':
        // Navigate to AI coach
        console.log('Viewing AI insight:', data.insightId);
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }

  async startMonitoring(): Promise<void> {
    if (!this.isInitialized || !this.userPreferences) return;

    // Monitor price alerts
    if (this.userPreferences.priceAlerts) {
      this.startPriceMonitoring();
    }

    // Monitor news
    if (this.userPreferences.newsAlerts) {
      this.startNewsMonitoring();
    }

    // Monitor AI insights
    if (this.userPreferences.aiInsights) {
      this.startAIInsightsMonitoring();
    }

    // Monitor economic events
    if (this.userPreferences.economicEvents) {
      this.startEconomicEventMonitoring();
    }

    // Monitor market sentiment
    if (this.userPreferences.marketSentiment) {
      this.startSentimentMonitoring();
    }
  }

  private async startPriceMonitoring(): Promise<void> {
    const checkPrices = async () => {
      if (!this.userPreferences?.personalizedSymbols?.length) return;

      try {
        // Get forex rates
        const forexRates = await realDataService.getForexRates();
        
        // Get crypto prices
        const cryptoPrices = await realDataService.getCryptoPrices();

        // Check for significant price movements
        this.userPreferences.personalizedSymbols.forEach(symbol => {
          const threshold = this.alertThresholds.get(symbol);
          if (!threshold) return;

          // Check forex
          const forexRate = forexRates.find(r => 
            `${r.base}/${r.target}` === symbol || `${r.target}/${r.base}` === symbol
          );
          
          if (forexRate) {
            if (forexRate.rate >= threshold.high) {
              this.sendNotification({
                title: `🔔 Price Alert: ${symbol}`,
                body: `${symbol} reached ${forexRate.rate.toFixed(4)} (High alert)`,
                data: { type: 'price_alert', symbol, price: forexRate.rate }
              });
            } else if (forexRate.rate <= threshold.low) {
              this.sendNotification({
                title: `🔔 Price Alert: ${symbol}`,
                body: `${symbol} dropped to ${forexRate.rate.toFixed(4)} (Low alert)`,
                data: { type: 'price_alert', symbol, price: forexRate.rate }
              });
            }
          }

          // Check crypto
          const cryptoSymbol = symbol.split('/')[0];
          const crypto = cryptoPrices.find(c => c.symbol === cryptoSymbol);
          
          if (crypto) {
            if (crypto.current_price >= threshold.high) {
              this.sendNotification({
                title: `🔔 Price Alert: ${symbol}`,
                body: `${symbol} reached $${crypto.current_price.toFixed(2)} (High alert)`,
                data: { type: 'price_alert', symbol, price: crypto.current_price }
              });
            } else if (crypto.current_price <= threshold.low) {
              this.sendNotification({
                title: `🔔 Price Alert: ${symbol}`,
                body: `${symbol} dropped to $${crypto.current_price.toFixed(2)} (Low alert)`,
                data: { type: 'price_alert', symbol, price: crypto.current_price }
              });
            }
          }
        });
      } catch (error) {
        console.error('Error monitoring prices:', error);
      }
    };

    // Check prices based on frequency setting
    const interval = this.getCheckInterval();
    setInterval(checkPrices, interval);
    
    // Initial check
    checkPrices();
  }

  private async startNewsMonitoring(): Promise<void> {
    const checkNews = async () => {
      try {
        const news = await realDataService.getFinancialNews();
        
        // Filter by impact level
        const filteredNews = news.filter(item => {
          if (this.userPreferences?.minimumImpact === 'high') {
            return item.impact === 'high';
          } else if (this.userPreferences?.minimumImpact === 'medium') {
            return item.impact === 'high' || item.impact === 'medium';
          }
          return true;
        });

        // Send notifications for important news
        filteredNews.slice(0, 3).forEach(item => {
          this.sendNotification({
            title: `📰 ${item.impact === 'high' ? '🔴' : '🟡'} Market News`,
            body: item.title,
            data: { type: 'news', url: item.url, impact: item.impact }
          });
        });
      } catch (error) {
        console.error('Error monitoring news:', error);
      }
    };

    // Check news every hour
    setInterval(checkNews, 60 * 60 * 1000);
    
    // Initial check
    checkNews();
  }

  private async startAIInsightsMonitoring(): Promise<void> {
    const generateInsights = async () => {
      try {
        // Get market data
        const marketData = {
          forex: await realDataService.getForexRates(),
          crypto: await realDataService.getCryptoPrices(),
          news: await realDataService.getFinancialNews()
        };

        // Get AI analysis
        const analysis = await realDataService.getAIMarketAnalysis(marketData);

        // Send AI insight notification
        this.sendNotification({
          title: '🤖 AI Trading Insight',
          body: this.extractKeyInsight(analysis),
          data: { type: 'ai_insight', fullAnalysis: analysis }
        });

        // Check for specific trading opportunities
        if (analysis.includes('buy') || analysis.includes('sell')) {
          this.sendNotification({
            title: '💡 Trading Opportunity Detected',
            body: 'AI has identified a potential trading opportunity. Tap to view.',
            data: { type: 'trade_signal', analysis }
          });
        }
      } catch (error) {
        console.error('Error generating AI insights:', error);
      }
    };

    // Generate insights based on user's trading style
    const interval = this.userPreferences?.tradingStyle === 'scalping' 
      ? 30 * 60 * 1000  // 30 minutes for scalpers
      : 2 * 60 * 60 * 1000; // 2 hours for others
      
    setInterval(generateInsights, interval);
    
    // Initial generation
    generateInsights();
  }

  private async startEconomicEventMonitoring(): Promise<void> {
    const checkEvents = async () => {
      try {
        const events = await realDataService.getEconomicCalendar();
        
        // Filter upcoming high-impact events
        const upcomingEvents = events.filter(event => {
          const eventTime = new Date(`${event.date} ${event.time}`);
          const now = new Date();
          const timeDiff = eventTime.getTime() - now.getTime();
          
          // Events in the next 30 minutes
          return timeDiff > 0 && timeDiff < 30 * 60 * 1000 && event.impact === 'high';
        });

        upcomingEvents.forEach(event => {
          this.sendNotification({
            title: '📅 Economic Event Alert',
            body: `${event.title} (${event.country}) in 30 minutes - High Impact`,
            data: { type: 'economic_event', event }
          });
        });
      } catch (error) {
        console.error('Error monitoring economic events:', error);
      }
    };

    // Check every 15 minutes
    setInterval(checkEvents, 15 * 60 * 1000);
    
    // Initial check
    checkEvents();
  }

  private async startSentimentMonitoring(): Promise<void> {
    const checkSentiment = async () => {
      try {
        const sentiment = await realDataService.getMarketSentiment();
        
        // Alert on significant sentiment changes
        if (Math.abs(sentiment.score) > 50) {
          this.sendNotification({
            title: `📊 Market Sentiment: ${sentiment.sentiment.toUpperCase()}`,
            body: `Market sentiment score: ${sentiment.score} (${sentiment.confidence}% confidence)`,
            data: { type: 'sentiment', sentiment }
          });
        }
      } catch (error) {
        console.error('Error monitoring sentiment:', error);
      }
    };

    // Check every 2 hours
    setInterval(checkSentiment, 2 * 60 * 60 * 1000);
    
    // Initial check
    checkSentiment();
  }

  private extractKeyInsight(analysis: string): string {
    // Extract the first sentence or key recommendation
    const sentences = analysis.split('.');
    return sentences[0] + '.';
  }

  private isInQuietHours(): boolean {
    if (!this.userPreferences?.quietHours?.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = this.userPreferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.userPreferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private getCheckInterval(): number {
    switch (this.userPreferences?.frequency) {
      case 'instant':
        return 1 * 60 * 1000; // 1 minute
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      default:
        return 5 * 60 * 1000; // 5 minutes default
    }
  }

  private async playNotificationSound(): Promise<void> {
    // Implementation depends on platform
    console.log('Playing notification sound');
  }

  async sendNotification(notification: PushNotificationData): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Push notification service not initialized');
      return;
    }

    // Check if it's weekend and notifications are disabled
    if (!this.userPreferences?.weekends && this.isWeekend()) {
      console.log('Weekend notifications disabled');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: notification.title,
          body: notification.body,
          id: notification.id || Date.now(),
          schedule: { at: new Date(Date.now() + 100) }, // Slight delay
          sound: this.userPreferences?.soundEnabled ? 'default' : undefined,
          attachments: undefined,
          actionTypeId: notification.actionTypeId,
          extra: notification.data
        }]
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Fallback to console log until Toast module is installed
      console.log(`Notification: ${notification.title}: ${notification.body}`);
      /*
      await Toast.show({
        text: `${notification.title}: ${notification.body}`,
        duration: 'long',
        position: 'top'
      });
      */
    }
  }

  private isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  async setPriceAlert(symbol: string, high: number, low: number): Promise<void> {
    this.alertThresholds.set(symbol, { high, low });
  }

  async clearPriceAlert(symbol: string): Promise<void> {
    this.alertThresholds.delete(symbol);
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    this.userPreferences = preferences;
    
    if (!preferences.pushNotifications) {
      // Cancel all scheduled notifications
      await LocalNotifications.cancel({ notifications: [] });
    }
  }

  async getRegistrationToken(): Promise<string | null> {
    return this.registrationToken;
  }

  private async showLocalNotification(notification: PushNotificationData): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: notification.title,
          body: notification.body,
          id: notification.id || Date.now(),
          schedule: { at: new Date(Date.now() + 100) }, // Slight delay
          sound: this.userPreferences?.soundEnabled ? 'default' : undefined,
          attachments: undefined,
          actionTypeId: notification.actionTypeId,
          extra: notification.data
        }]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance(); 