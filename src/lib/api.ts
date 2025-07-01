import axios from 'axios';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

// API service for external integrations

// Get API keys from localStorage or environment variables
const getApiKeys = () => {
  const storedKeys = localStorage.getItem('apiKeys');
  const keys = storedKeys ? JSON.parse(storedKeys) : {};
  
  return {
    openai: keys.openai || import.meta.env.VITE_OPENAI_API_KEY,
    groq: keys.groq || import.meta.env.VITE_GROQ_API_KEY,
    news: keys.news || import.meta.env.VITE_NEWS_API_KEY,
    alphaVantage: keys.alphaVantage || import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
    tradingView: keys.tradingView || import.meta.env.VITE_TRADINGVIEW_API_KEY,
    telegram: keys.telegram || import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    binance: keys.binance || import.meta.env.VITE_BINANCE_API_KEY,
    bybit: keys.bybit || import.meta.env.VITE_BYBIT_API_KEY,
    kucoin: keys.kucoin || import.meta.env.VITE_KUCOIN_API_KEY,
    okx: keys.okx || import.meta.env.VITE_OKX_API_KEY,
    mexc: keys.mexc || import.meta.env.VITE_MEXC_API_KEY
  };
};

// ===== BROKER INTEGRATION & SYNC =====

export interface BrokerConnection {
  id: string;
  name: string;
  type: 'mt4' | 'mt5' | 'binance' | 'bybit' | 'ctrader' | 'kucoin' | 'okx' | 'mexc';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    server?: string;
    login?: string;
    password?: string;
  };
}

export interface TradeImportResult {
  success: boolean;
  tradesImported: number;
  tradesUpdated: number;
  errors: string[];
  lastSyncTime: string;
}

export const brokerService = {
  // Connect to various brokers
  async connectToBroker(brokerType: string, credentials: any): Promise<BrokerConnection> {
    try {
      // Simulate connection to different brokers
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `broker_${Date.now()}`,
        name: brokerType.toUpperCase(),
        type: brokerType as any,
        status: 'connected',
        lastSync: new Date().toISOString(),
        credentials
      };
    } catch (error) {
      throw new Error(`Failed to connect to ${brokerType}: ${error}`);
    }
  },

  // Import trades from connected brokers
  async importTrades(brokerId: string): Promise<TradeImportResult> {
    try {
      // Simulate trade import
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        tradesImported: Math.floor(Math.random() * 50) + 10,
        tradesUpdated: Math.floor(Math.random() * 20) + 5,
        errors: [],
        lastSyncTime: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to import trades: ${error}`);
    }
  },

  // Auto-sync trades periodically
  async startAutoSync(brokerId: string, intervalMinutes: number = 15): Promise<void> {
    // This would set up a background sync process
    console.log(`Auto-sync started for broker ${brokerId} every ${intervalMinutes} minutes`);
  },

  // Get reconciliation report
  async getReconciliationReport(brokerId: string): Promise<any> {
    return {
      totalTrades: 150,
      matchedTrades: 145,
      unmatchedTrades: 5,
      discrepancies: [
        { tradeId: '12345', issue: 'Price mismatch', brokerPrice: 1.0850, localPrice: 1.0851 },
        { tradeId: '12346', issue: 'Missing trade', brokerTrade: true, localTrade: false }
      ]
    };
  }
};

// ===== ADVANCED ANALYTICS =====

export interface AnalyticsMetrics {
  riskRewardRatio: number;
  profitFactor: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
}

export interface TimeBasedMetrics {
  hourlyPerformance: { [hour: string]: number };
  dailyPerformance: { [day: string]: number };
  monthlyPerformance: { [month: string]: number };
  tradeDurationAnalysis: {
    shortTerm: { count: number; profit: number };
    mediumTerm: { count: number; profit: number };
    longTerm: { count: number; profit: number };
  };
}

export const analyticsService = {
  // Calculate comprehensive trading metrics
  async calculateMetrics(trades: any[]): Promise<AnalyticsMetrics> {
    const profitableTrades = trades.filter((t: any) => (t.profit_loss || 0) > 0);
    const losingTrades = trades.filter((t: any) => (t.profit_loss || 0) < 0);
    
    const totalProfit = profitableTrades.reduce((sum: number, t: any) => sum + (t.profit_loss || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum: number, t: any) => sum + (t.profit_loss || 0), 0));
    
    return {
      riskRewardRatio: totalLoss > 0 ? totalProfit / totalLoss : 0,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      winRate: trades.length > 0 ? (profitableTrades.length / trades.length) * 100 : 0,
      averageWin: profitableTrades.length > 0 ? totalProfit / profitableTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      maxDrawdown: this.calculateMaxDrawdown(trades),
      sharpeRatio: this.calculateSharpeRatio(trades),
      totalTrades: trades.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length
    };
  },

  // Calculate time-based performance metrics
  async calculateTimeBasedMetrics(trades: any[]): Promise<TimeBasedMetrics> {
    const hourlyPerformance: { [hour: string]: number } = {};
    const dailyPerformance: { [day: string]: number } = {};
    const monthlyPerformance: { [month: string]: number } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.opened_at);
      const hour = date.getHours().toString();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      
      hourlyPerformance[hour] = (hourlyPerformance[hour] || 0) + (trade.profit_loss || 0);
      dailyPerformance[day] = (dailyPerformance[day] || 0) + (trade.profit_loss || 0);
      monthlyPerformance[month] = (monthlyPerformance[month] || 0) + (trade.profit_loss || 0);
    });

    return {
      hourlyPerformance,
      dailyPerformance,
      monthlyPerformance,
      tradeDurationAnalysis: this.analyzeTradeDuration(trades)
    };
  },

  // Compare long vs short positions
  async comparePositions(trades: any[]): Promise<any> {
    const longTrades = trades.filter(t => t.trade_type === 'buy');
    const shortTrades = trades.filter(t => t.trade_type === 'sell');
    
    return {
      long: {
        count: longTrades.length,
        totalProfit: longTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
        winRate: longTrades.length > 0 ? 
          (longTrades.filter(t => t.profit_loss > 0).length / longTrades.length) * 100 : 0
      },
      short: {
        count: shortTrades.length,
        totalProfit: shortTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
        winRate: shortTrades.length > 0 ? 
          (shortTrades.filter(t => t.profit_loss > 0).length / shortTrades.length) * 100 : 0
      }
    };
  },

  // Analyze symbol-specific performance
  async analyzeSymbolPerformance(trades: any[]): Promise<any> {
    const symbolStats: { [symbol: string]: any } = {};
    
    trades.forEach(trade => {
      const symbol = trade.instrument;
      if (!symbolStats[symbol]) {
        symbolStats[symbol] = {
          totalTrades: 0,
          totalProfit: 0,
          wins: 0,
          losses: 0
        };
      }
      
      symbolStats[symbol].totalTrades++;
      symbolStats[symbol].totalProfit += trade.profit_loss || 0;
      if ((trade.profit_loss || 0) > 0) {
        symbolStats[symbol].wins++;
      } else {
        symbolStats[symbol].losses++;
      }
    });

    return Object.entries(symbolStats).map(([symbol, stats]: [string, any]) => ({
      symbol,
      ...stats,
      winRate: stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0
    }));
  },

  calculateMaxDrawdown(trades: any[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    trades.forEach(trade => {
      runningTotal += trade.profit_loss || 0;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown;
  },

  calculateSharpeRatio(trades: any[]): number {
    if (trades.length === 0) return 0;
    
    const returns = trades.map(t => t.profit_loss || 0);
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? meanReturn / stdDev : 0;
  },

  analyzeTradeDuration(trades: any[]): any {
    const shortTerm = trades.filter(t => {
      const duration = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
      return duration <= 24 * 60 * 60 * 1000; // 24 hours
    });
    
    const mediumTerm = trades.filter(t => {
      const duration = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
      return duration > 24 * 60 * 60 * 1000 && duration <= 7 * 24 * 60 * 60 * 1000; // 1-7 days
    });
    
    const longTerm = trades.filter(t => {
      const duration = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
      return duration > 7 * 24 * 60 * 60 * 1000; // > 7 days
    });

    return {
      shortTerm: {
        count: shortTerm.length,
        profit: shortTerm.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
      },
      mediumTerm: {
        count: mediumTerm.length,
        profit: mediumTerm.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
      },
      longTerm: {
        count: longTerm.length,
        profit: longTerm.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
      }
    };
  }
};

// ===== CALENDAR VIEW =====

export interface CalendarData {
  date: string;
  profit: number;
  trades: number;
  winRate: number;
  color: string;
}

export const calendarService = {
  // Generate heatmap data for calendar view
  async generateHeatmapData(trades: any[], startDate: Date, endDate: Date): Promise<CalendarData[]> {
    const calendarData: CalendarData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTrades = trades.filter(t => 
        new Date(t.opened_at).toISOString().split('T')[0] === dateStr
      );
      
      const totalProfit = dayTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const wins = dayTrades.filter(t => (t.profit_loss || 0) > 0).length;
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
      
      // Determine color based on profit
      let color = '#374151'; // neutral
      if (totalProfit > 0) {
        color = totalProfit > 100 ? '#059669' : '#10b981'; // green
      } else if (totalProfit < 0) {
        color = totalProfit < -100 ? '#dc2626' : '#ef4444'; // red
      }
      
      calendarData.push({
        date: dateStr,
        profit: totalProfit,
        trades: dayTrades.length,
        winRate,
        color
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendarData;
  },

  // Get monthly breakdown
  async getMonthlyBreakdown(trades: any[]): Promise<any[]> {
    const monthlyStats: { [month: string]: any } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.opened_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          totalTrades: 0,
          totalProfit: 0,
          wins: 0,
          losses: 0,
          avgTradeSize: 0
        };
      }
      
      monthlyStats[monthKey].totalTrades++;
      monthlyStats[monthKey].totalProfit += trade.profit_loss || 0;
      if ((trade.profit_loss || 0) > 0) {
        monthlyStats[monthKey].wins++;
      } else {
        monthlyStats[monthKey].losses++;
      }
    });

    return Object.values(monthlyStats).map((stats: any) => ({
      ...stats,
      winRate: stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0,
      avgTradeSize: stats.totalTrades > 0 ? stats.totalProfit / stats.totalTrades : 0
    }));
  }
};

// ===== STRATEGY ANALYSIS =====

export interface Strategy {
  id: string;
  name: string;
  description: string;
  tags: string[];
  trades: any[];
  metrics: AnalyticsMetrics;
}

export const strategyService = {
  // Analyze trading strategy
  async analyzeStrategy(strategyId: string, trades: any[]): Promise<Strategy> {
    const strategyTrades = trades.filter(t => t.strategy_id === strategyId);
    const metrics = await analyticsService.calculateMetrics(strategyTrades);
    
    return {
      id: strategyId,
      name: `Strategy ${strategyId}`,
      description: 'Trading strategy analysis',
      tags: ['forex', 'scalping'],
      trades: strategyTrades,
      metrics
    };
  },

  // Get AI insights for strategy
  async getStrategyInsights(strategy: Strategy): Promise<string> {
    const keys = getApiKeys();
    const openai = new OpenAI({ apiKey: keys.openai });
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a trading strategy analyst. Provide insights on trading performance and suggestions for improvement."
          },
          {
            role: "user",
            content: `Analyze this trading strategy: Win Rate: ${strategy.metrics.winRate}%, Profit Factor: ${strategy.metrics.profitFactor}, Total Trades: ${strategy.metrics.totalTrades}. Provide actionable insights.`
          }
        ],
        max_tokens: 300
      });
      
      return response.choices[0]?.message?.content || 'Unable to generate insights';
    } catch (error) {
      return 'AI insights temporarily unavailable';
    }
  }
};

// ===== ENHANCED TRADING JOURNAL =====

export interface JournalEntry {
  id: string;
  tradeId: string;
  notes: string;
  screenshots: string[];
  emotionalState: string;
  strategy: string;
  lessons: string;
  rating: number;
  createdAt: string;
}

export const journalService = {
  // Create journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    return {
      ...entry,
      id: `journal_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  },

  // Export journal to CSV
  async exportToCSV(entries: JournalEntry[]): Promise<string> {
    const headers = ['Date', 'Trade ID', 'Notes', 'Emotional State', 'Strategy', 'Lessons', 'Rating'];
    const rows = entries.map(entry => [
      new Date(entry.createdAt).toLocaleDateString(),
      entry.tradeId,
      entry.notes,
      entry.emotionalState,
      entry.strategy,
      entry.lessons,
      entry.rating
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
};

// ===== NOTIFICATIONS & ALERTS =====

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered' | 'cancelled';
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'price_alert' | 'trade_entry' | 'trade_exit' | 'market_event';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  // Create price alert
  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'status' | 'createdAt'>): Promise<PriceAlert> {
    return {
      ...alert,
      id: `alert_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  },

  // Send Telegram notification
  async sendTelegramNotification(message: string, chatId?: string): Promise<void> {
    const keys = getApiKeys();
    const defaultChatId = chatId || 'your_chat_id';
    
    try {
      await axios.post(`https://api.telegram.org/bot${keys.telegram}/sendMessage`, {
        chat_id: defaultChatId,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  },

  // Send push notification
  async sendPushNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    // This would integrate with a push notification service
    console.log('Push notification:', notification);
  }
};

// ===== MARKET COVERAGE & SENTIMENT =====

export interface MarketNews {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
}

export interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  forecast: string;
  previous: string;
  actual?: string;
}

export const marketService = {
  // Get market news
  async getMarketNews(): Promise<MarketNews[]> {
    const keys = getApiKeys();
    
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: 'forex trading',
          apiKey: keys.news,
          sortBy: 'publishedAt',
          pageSize: 20
        }
      });
      
      return response.data.articles.map((article: any, index: number) => ({
        id: `news_${index}`,
        title: article.title,
        description: article.description,
        source: article.source.name,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        impact: 'medium',
        symbols: this.extractSymbols(article.title + ' ' + article.description)
      }));
    } catch (error) {
      // Return mock data if API fails
      return [
        {
          id: 'news_1',
          title: 'EUR/USD Reaches Key Resistance Level',
          description: 'The euro-dollar pair has reached a significant resistance level...',
          source: 'Forex.com',
          publishedAt: new Date().toISOString(),
          sentiment: 'neutral',
          impact: 'medium',
          symbols: ['EURUSD']
        }
      ];
    }
  },

  // Get economic calendar
  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    // This would integrate with an economic calendar API
    return [
      {
        id: 'event_1',
        title: 'US Non-Farm Payrolls',
        date: new Date().toISOString().split('T')[0],
        time: '13:30',
        currency: 'USD',
        impact: 'high',
        forecast: '180K',
        previous: '175K'
      }
    ];
  },

  analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bullish', 'gain', 'rise', 'positive', 'strong'];
    const negativeWords = ['bearish', 'fall', 'drop', 'negative', 'weak'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  },

  extractSymbols(text: string): string[] {
    const symbolPattern = /[A-Z]{6}/g;
    return text.match(symbolPattern) || [];
  }
};

// ===== PAPER TRADING =====

export interface PaperTrade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  status: 'open' | 'closed';
  profitLoss?: number;
  openedAt: string;
  closedAt?: string;
}

export const paperTradingService = {
  // Open paper trade
  async openPaperTrade(trade: Omit<PaperTrade, 'id' | 'status' | 'openedAt'>): Promise<PaperTrade> {
    return {
      ...trade,
      id: `paper_${Date.now()}`,
      status: 'open',
      openedAt: new Date().toISOString()
    };
  },

  // Close paper trade
  async closePaperTrade(tradeId: string, exitPrice: number): Promise<PaperTrade> {
    // This would update the trade in the database
    return {
      id: tradeId,
      symbol: 'EURUSD',
      type: 'buy',
      entryPrice: 1.0850,
      exitPrice,
      lotSize: 0.1,
      status: 'closed',
      profitLoss: (exitPrice - 1.0850) * 0.1 * 100000,
      openedAt: new Date(Date.now() - 3600000).toISOString(),
      closedAt: new Date().toISOString()
    };
  }
};

// ===== PORTFOLIO MANAGEMENT =====

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  dailyPnL: number;
  positions: {
    symbol: string;
    size: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
  }[];
  allocation: {
    forex: number;
    crypto: number;
    stocks: number;
    commodities: number;
  };
}

export const portfolioService = {
  // Get portfolio overview
  async getPortfolio(): Promise<Portfolio> {
    return {
      totalValue: 25000,
      totalPnL: 1250,
      dailyPnL: 45,
      positions: [
        {
          symbol: 'EURUSD',
          size: 0.5,
          entryPrice: 1.0850,
          currentPrice: 1.0870,
          unrealizedPnL: 100
        },
        {
          symbol: 'GBPUSD',
          size: 0.3,
          entryPrice: 1.2650,
          currentPrice: 1.2630,
          unrealizedPnL: -60
        }
      ],
      allocation: {
        forex: 70,
        crypto: 20,
        stocks: 5,
        commodities: 5
      }
    };
  }
};

// ===== MT4 CONNECTION =====

export interface MT4ConnectionParams {
  server: string;
  login: string;
  password: string;
}

export interface MT4AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  profit: number;
}

export interface MT4ConnectionResult {
  success: boolean;
  message?: string;
  accountInfo?: MT4AccountInfo;
}

export const mt4Service = {
  // Connect to MT4
  async connectToMT4(params: MT4ConnectionParams): Promise<MT4ConnectionResult> {
    try {
      // Simulate MT4 connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        message: 'Successfully connected to MT4',
        accountInfo: {
          balance: 10000,
          equity: 10150,
          margin: 500,
          freeMargin: 9650,
          profit: 150
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect: ${error}`
      };
    }
  },

  // Disconnect from MT4
  async disconnectFromMT4(): Promise<void> {
    console.log('Disconnected from MT4');
  }
};

// ===== AI COACHING =====

export const aiService = {
  // Get trading insight using OpenAI
  async getTradingInsight(tradeData: any, userProfile: any): Promise<any> {
    const keys = getApiKeys();
    const openai = new OpenAI({ apiKey: keys.openai });
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert trading coach. Analyze the trade data and provide personalized insights and recommendations."
          },
          {
            role: "user",
            content: `Analyze this trade: ${JSON.stringify(tradeData)}. User profile: ${JSON.stringify(userProfile)}`
          }
        ],
        max_tokens: 500
      });
      
      return {
        insight: response.choices[0]?.message?.content,
        confidence: 0.85
      };
    } catch (error) {
      return {
        insight: 'Unable to generate insight at this time',
        confidence: 0
      };
    }
  },

  // Get insight using Groq
  async getGroqInsight(prompt: string): Promise<string> {
    const keys = getApiKeys();
    const groq = new Groq({ apiKey: keys.groq });
    
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response.choices[0]?.message?.content || 'No insight available';
    } catch (error) {
      return 'Groq insight temporarily unavailable';
    }
  },

  // Analyze trade strategy
  async analyzeTradeStrategy(strategy: any): Promise<any> {
    const keys = getApiKeys();
    const openai = new OpenAI({ apiKey: keys.openai });
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a trading strategy analyst. Provide detailed analysis and improvement suggestions."
          },
          {
            role: "user",
            content: `Analyze this trading strategy: ${JSON.stringify(strategy)}`
          }
        ],
        max_tokens: 400
      });
      
      return {
        analysis: response.choices[0]?.message?.content,
        recommendations: ['Consider reducing position size', 'Add more stop losses'],
        riskLevel: 'medium'
      };
    } catch (error) {
      return {
        analysis: 'Strategy analysis unavailable',
        recommendations: [],
        riskLevel: 'unknown'
      };
    }
  }
};

export default {
  brokerService,
  analyticsService,
  calendarService,
  strategyService,
  journalService,
  notificationService,
  marketService,
  paperTradingService,
  portfolioService,
  mt4Service,
  aiService
}; 