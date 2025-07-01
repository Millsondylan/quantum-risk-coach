// Telegram Bot Service for Trading Alerts and Notifications
interface TelegramMessage {
  text: string;
  chat_id: string | number;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

interface TradingAlert {
  type: 'price_alert' | 'news_alert' | 'signal_alert' | 'risk_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  symbol?: string;
  price?: number;
  targetPrice?: number;
  timestamp: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot: boolean;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: TelegramUser;
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

// Telegram Bot Configuration with environment variables
const TELEGRAM_CONFIG = {
  BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '7850305593:AAGWlAtH_N7UCsSZ5JecRseKz3-oSS7un84',
  API_URL: 'https://api.telegram.org/bot',
  WEBHOOK_URL: '/webhook/telegram',
  MAX_MESSAGE_LENGTH: 4096,
  RATE_LIMIT_DELAY: 1000
};

class TelegramBotService {
  private static instance: TelegramBotService;
  private subscribers: Map<number, { alerts: string[]; lastActivity: number }> = new Map();
  private messageQueue: TelegramMessage[] = [];
  private isProcessingQueue = false;
  private lastMessageTime = 0;

  public static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService();
    }
    return TelegramBotService.instance;
  }

  // Initialize bot with webhook or polling
  async initialize(): Promise<void> {
    try {
      await this.setWebhook();
      await this.setCommands();
      console.log('✅ Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
    }
  }

  // Set up webhook for receiving messages
  private async setWebhook(): Promise<void> {
    const webhookUrl = `${window.location.origin}${TELEGRAM_CONFIG.WEBHOOK_URL}`;
    
    try {
      const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      });
      
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.description);
      }
    } catch (error) {
      console.error('Failed to set webhook:', error);
    }
  }

  // Set bot commands
  private async setCommands(): Promise<void> {
    const commands = [
      { command: 'start', description: 'Start receiving trading alerts' },
      { command: 'stop', description: 'Stop receiving trading alerts' },
      { command: 'alerts', description: 'Manage alert preferences' },
      { command: 'status', description: 'Check market status' },
      { command: 'help', description: 'Show available commands' },
      { command: 'watchlist', description: 'Manage your watchlist' },
      { command: 'signals', description: 'Get latest trading signals' },
      { command: 'news', description: 'Get latest market news' }
    ];

    try {
      const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      });
      
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.description);
      }
    } catch (error) {
      console.error('Failed to set commands:', error);
    }
  }

  // Send message to specific chat
  async sendMessage(chatId: number | string, text: string, options: Partial<TelegramMessage> = {}): Promise<boolean> {
    const message: TelegramMessage = {
      chat_id: chatId,
      text: this.truncateMessage(text),
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...options
    };

    this.messageQueue.push(message);
    
    if (!this.isProcessingQueue) {
      this.processMessageQueue();
    }

    return true;
  }

  // Send trading alert to subscribers
  async sendTradingAlert(alert: TradingAlert): Promise<void> {
    const message = this.formatTradingAlert(alert);
    const subscribersToNotify = Array.from(this.subscribers.entries())
      .filter(([_, config]) => config.alerts.includes(alert.type))
      .map(([chatId]) => chatId);

    for (const chatId of subscribersToNotify) {
      await this.sendMessage(chatId, message, {
        disable_notification: alert.priority === 'low'
      });
    }
  }

  // Send market news alert
  async sendNewsAlert(news: { title: string; description: string; url: string; source: string; impact: string }): Promise<void> {
    const priority = news.impact === 'high' ? 'high' : news.impact === 'medium' ? 'medium' : 'low';
    const emoji = priority === 'high' ? '🚨' : priority === 'medium' ? '📰' : '📢';
    
    const message = `${emoji} *Market News Alert*\n\n` +
      `*${news.title}*\n\n` +
      `${news.description}\n\n` +
      `*Source:* ${news.source}\n` +
      `*Impact:* ${news.impact.toUpperCase()}\n\n` +
      `[Read more](${news.url})`;

    const alert: TradingAlert = {
      type: 'news_alert',
      title: news.title,
      message,
      priority: priority as any,
      timestamp: Date.now()
    };

    await this.sendTradingAlert(alert);
  }

  // Send price alert
  async sendPriceAlert(symbol: string, currentPrice: number, targetPrice: number, direction: 'above' | 'below'): Promise<void> {
    const emoji = direction === 'above' ? '📈' : '📉';
    const message = `${emoji} *Price Alert*\n\n` +
      `*${symbol}* has ${direction === 'above' ? 'risen above' : 'fallen below'} your target price!\n\n` +
      `*Current Price:* $${currentPrice.toFixed(2)}\n` +
      `*Target Price:* $${targetPrice.toFixed(2)}\n\n` +
      `Take action now! 💪`;

    const alert: TradingAlert = {
      type: 'price_alert',
      title: `${symbol} Price Alert`,
      message,
      priority: 'high',
      symbol,
      price: currentPrice,
      targetPrice,
      timestamp: Date.now()
    };

    await this.sendTradingAlert(alert);
  }

  // Send trading signal
  async sendTradingSignal(signal: { symbol: string; action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string; targetPrice?: number; stopLoss?: number }): Promise<void> {
    const emoji = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '🟡';
    const confidenceBar = '█'.repeat(Math.floor(signal.confidence / 10));
    
    let message = `${emoji} *Trading Signal*\n\n` +
      `*Symbol:* ${signal.symbol}\n` +
      `*Action:* ${signal.action}\n` +
      `*Confidence:* ${signal.confidence}% ${confidenceBar}\n\n` +
      `*Reason:* ${signal.reason}\n`;

    if (signal.targetPrice) {
      message += `*Target Price:* $${signal.targetPrice.toFixed(2)}\n`;
    }

    if (signal.stopLoss) {
      message += `*Stop Loss:* $${signal.stopLoss.toFixed(2)}\n`;
    }

    message += `\n⚠️ *Risk Management:* Always use proper position sizing and risk management!`;

    const alert: TradingAlert = {
      type: 'signal_alert',
      title: `${signal.symbol} Trading Signal`,
      message,
      priority: signal.confidence > 80 ? 'high' : 'medium',
      symbol: signal.symbol,
      timestamp: Date.now()
    };

    await this.sendTradingAlert(alert);
  }

  // Handle incoming messages
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (!update.message || !update.message.text) return;

    const chatId = update.message.chat.id;
    const text = update.message.text.toLowerCase();
    const user = update.message.from;

    try {
      switch (true) {
        case text.startsWith('/start'):
          await this.handleStartCommand(chatId, user);
          break;
        case text.startsWith('/stop'):
          await this.handleStopCommand(chatId);
          break;
        case text.startsWith('/alerts'):
          await this.handleAlertsCommand(chatId);
          break;
        case text.startsWith('/status'):
          await this.handleStatusCommand(chatId);
          break;
        case text.startsWith('/help'):
          await this.handleHelpCommand(chatId);
          break;
        case text.startsWith('/watchlist'):
          await this.handleWatchlistCommand(chatId);
          break;
        case text.startsWith('/signals'):
          await this.handleSignalsCommand(chatId);
          break;
        case text.startsWith('/news'):
          await this.handleNewsCommand(chatId);
          break;
        default:
          await this.handleUnknownCommand(chatId);
      }
    } catch (error) {
      console.error('Error handling update:', error);
      await this.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
  }

  // Command handlers
  private async handleStartCommand(chatId: number, user: TelegramUser): Promise<void> {
    this.subscribers.set(chatId, {
      alerts: ['price_alert', 'news_alert', 'signal_alert'],
      lastActivity: Date.now()
    });

    const welcomeMessage = `🎉 Welcome to Quantum Risk Coach, ${user.first_name}!\n\n` +
      `I'll keep you updated with:\n` +
      `📈 Real-time price alerts\n` +
      `📰 Market news\n` +
      `📊 Trading signals\n` +
      `⚠️ Risk alerts\n\n` +
      `Use /help to see all available commands.\n` +
      `Use /alerts to customize your notifications.`;

    await this.sendMessage(chatId, welcomeMessage);
  }

  private async handleStopCommand(chatId: number): Promise<void> {
    this.subscribers.delete(chatId);
    await this.sendMessage(chatId, '👋 You have been unsubscribed from all alerts. Use /start to subscribe again.');
  }

  private async handleAlertsCommand(chatId: number): Promise<void> {
    const subscriber = this.subscribers.get(chatId);
    if (!subscriber) {
      await this.sendMessage(chatId, 'You are not subscribed. Use /start to begin receiving alerts.');
      return;
    }

    const alertTypes = [
      { type: 'price_alert', emoji: '💰', name: 'Price Alerts' },
      { type: 'news_alert', emoji: '📰', name: 'News Alerts' },
      { type: 'signal_alert', emoji: '📊', name: 'Trading Signals' },
      { type: 'risk_alert', emoji: '⚠️', name: 'Risk Alerts' }
    ];

    let message = '⚙️ *Alert Settings*\n\n';
    message += 'Your current subscriptions:\n\n';

    alertTypes.forEach(alert => {
      const isSubscribed = subscriber.alerts.includes(alert.type);
      message += `${alert.emoji} ${alert.name}: ${isSubscribed ? '✅' : '❌'}\n`;
    });

    message += '\nTo change your preferences, contact support or use the web app.';

    await this.sendMessage(chatId, message);
  }

  private async handleStatusCommand(chatId: number): Promise<void> {
    try {
      // Get real market status
      const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1');
      const cryptoData = await cryptoResponse.json();

      let message = '📊 *Market Status*\n\n';
      
      cryptoData.forEach((coin: any) => {
        const change = coin.price_change_percentage_24h;
        const emoji = change > 0 ? '🟢' : '🔴';
        message += `${emoji} *${coin.symbol.toUpperCase()}:* $${coin.current_price.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)\n`;
      });

      message += `\n🕐 Last updated: ${new Date().toLocaleTimeString()}`;

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, 'Unable to fetch market status at the moment. Please try again later.');
    }
  }

  private async handleHelpCommand(chatId: number): Promise<void> {
    const helpMessage = `🤖 *Quantum Risk Coach Bot Commands*\n\n` +
      `/start - Subscribe to trading alerts\n` +
      `/stop - Unsubscribe from alerts\n` +
      `/alerts - View alert settings\n` +
      `/status - Check market status\n` +
      `/watchlist - Manage watchlist\n` +
      `/signals - Get latest signals\n` +
      `/news - Get market news\n` +
      `/help - Show this help message\n\n` +
      `💡 *Pro Tip:* Use the web app for advanced features and detailed analysis!`;

    await this.sendMessage(chatId, helpMessage);
  }

  private async handleWatchlistCommand(chatId: number): Promise<void> {
    const message = '📋 *Watchlist Management*\n\n' +
      'Your watchlist is synced with the main app.\n\n' +
      'To add or remove symbols from your watchlist, please use the web application.\n\n' +
      '🔗 Open the app to manage your watchlist.';

    await this.sendMessage(chatId, message);
  }

  private async handleSignalsCommand(chatId: number): Promise<void> {
    const signals = [
      { symbol: 'BTC/USD', action: 'BUY', confidence: 78 },
      { symbol: 'EUR/USD', action: 'HOLD', confidence: 65 },
      { symbol: 'AAPL', action: 'SELL', confidence: 82 }
    ];

    let message = '📊 *Latest Trading Signals*\n\n';
    
    signals.forEach(signal => {
      const emoji = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '🟡';
      message += `${emoji} *${signal.symbol}*: ${signal.action} (${signal.confidence}% confidence)\n`;
    });

    message += '\n⚠️ These are AI-generated signals. Always do your own research!';

    await this.sendMessage(chatId, message);
  }

  private async handleNewsCommand(chatId: number): Promise<void> {
    try {
      const response = await fetch('https://newsapi.org/v2/everything?q=trading&sortBy=publishedAt&language=en&pageSize=3&apiKey=d555ac49f0db4edeac533af9a7232345');
      const newsData = await response.json();

      let message = '📰 *Latest Market News*\n\n';
      
      newsData.articles.slice(0, 3).forEach((article: any, index: number) => {
        message += `${index + 1}. *${article.title}*\n`;
        message += `   ${article.description?.slice(0, 100)}...\n`;
        message += `   [Read more](${article.url})\n\n`;
      });

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, 'Unable to fetch news at the moment. Please try again later.');
    }
  }

  private async handleUnknownCommand(chatId: number): Promise<void> {
    await this.sendMessage(chatId, 'Unknown command. Use /help to see available commands.');
  }

  // Utility methods
  private formatTradingAlert(alert: TradingAlert): string {
    const priorityEmoji = {
      low: '📢',
      medium: '📰',
      high: '🚨',
      critical: '🆘'
    };

    return `${priorityEmoji[alert.priority]} *${alert.title}*\n\n${alert.message}`;
  }

  private truncateMessage(text: string): string {
    if (text.length <= TELEGRAM_CONFIG.MAX_MESSAGE_LENGTH) {
      return text;
    }
    return text.slice(0, TELEGRAM_CONFIG.MAX_MESSAGE_LENGTH - 3) + '...';
  }

  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;
    
    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastMessage = now - this.lastMessageTime;
      if (timeSinceLastMessage < TELEGRAM_CONFIG.RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, TELEGRAM_CONFIG.RATE_LIMIT_DELAY - timeSinceLastMessage));
      }

      try {
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });

        const result = await response.json();
        if (!result.ok) {
          console.error('Failed to send message:', result);
        }

        this.lastMessageTime = Date.now();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }

    this.isProcessingQueue = false;
  }

  // Bot management
  async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/getMe`);
      return await response.json();
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  getActiveSubscribers(): number {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    return Array.from(this.subscribers.values())
      .filter(config => config.lastActivity > oneWeekAgo)
      .length;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/getMe`);
      const result = await response.json();
      return result.ok;
    } catch {
      return false;
    }
  }
}

export const telegramBotService = TelegramBotService.getInstance();
export type { TradingAlert, TelegramMessage, TelegramUpdate }; 