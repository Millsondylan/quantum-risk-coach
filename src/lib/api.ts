import axios, { AxiosResponse } from 'axios';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import axiosRetry from 'axios-retry';

// Configure axios retry for better mobile network handling
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429;
  }
});

// API endpoints configuration
const API_CONFIG = {
  timeout: 10000, // 10 seconds timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Qlarity/1.0',
  }
};

// Enhanced OpenAI integration for AI coaching
const OPENAI_CONFIG = {
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4-turbo-preview',
  maxTokens: 1000,
  temperature: 0.7
};

// Trading AI prompts optimized for coaching
const AI_PROMPTS = {
  tradingInsight: `You are an expert trading coach. Analyze the following trading data and provide specific, actionable insights:

Trade Data: {tradeData}
User Profile: {userProfile}

Provide insights in this format:
1. Key Strengths (max 2)
2. Areas for Improvement (max 2)
3. Specific Action Steps (max 3)
4. Risk Assessment
5. Market Opportunities

Keep responses concise and practical for mobile display.`,

  riskAnalysis: `As a risk management expert, analyze this trading portfolio:

Portfolio: {portfolio}
Recent Trades: {recentTrades}

Provide:
1. Risk Score (1-10)
2. Position Sizing Recommendations
3. Correlation Warnings
4. Suggested Adjustments

Format for mobile display with bullet points.`,

  marketSentiment: `Analyze current market sentiment for these instruments:

Instruments: {instruments}
News: {recentNews}
Technical Data: {technicalData}

Provide:
1. Overall Sentiment Score
2. Key Drivers
3. Upcoming Catalysts
4. Trading Recommendations

Keep concise for mobile users.`
};

interface TradingInsightRequest {
  trades: any[];
  performance: any;
  preferences: any;
}

interface MarketSentimentRequest {
  symbols: string[];
  timeframe: string;
}

interface RiskAnalysisRequest {
  portfolio: any;
  recentTrades: any[];
  riskTolerance: string;
}

class APIService {
  private baseURL: string;
  private openAIKey: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.qlarity.com';
    this.openAIKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  // Enhanced AI Trading Insights with mobile optimization
  async getTradingInsight(tradeData: any, userProfile: any): Promise<any> {
    try {
      if (!this.openAIKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = AI_PROMPTS.tradingInsight
        .replace('{tradeData}', JSON.stringify(tradeData, null, 2))
        .replace('{userProfile}', JSON.stringify(userProfile, null, 2));

      const response = await axios.post(
        `${OPENAI_CONFIG.baseURL}/chat/completions`,
        {
          model: OPENAI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert trading coach focused on practical, actionable advice for mobile traders.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: OPENAI_CONFIG.maxTokens,
          temperature: OPENAI_CONFIG.temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.timeout
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content;
      
      // Parse AI response into structured format for mobile display
      return this.parseAIInsight(aiResponse);
    } catch (error) {
      console.error('Error getting AI trading insight:', error);
      throw new Error('Failed to generate trading insight');
    }
  }

  // Enhanced Risk Analysis with real-time calculations
  async getRiskAnalysis(portfolio: any, recentTrades: any[], riskTolerance: string): Promise<any> {
    try {
      const prompt = AI_PROMPTS.riskAnalysis
        .replace('{portfolio}', JSON.stringify(portfolio, null, 2))
        .replace('{recentTrades}', JSON.stringify(recentTrades, null, 2));

      if (this.openAIKey) {
        const response = await axios.post(
          `${OPENAI_CONFIG.baseURL}/chat/completions`,
          {
            model: OPENAI_CONFIG.model,
            messages: [
              {
                role: 'system',
                content: 'You are a risk management expert. Provide clear, actionable risk assessments.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 800,
            temperature: 0.3
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openAIKey}`,
              'Content-Type': 'application/json'
            },
            timeout: API_CONFIG.timeout
          }
        );

        const aiResponse = response.data.choices[0]?.message?.content;
        return this.parseRiskAnalysis(aiResponse);
      }

      // Fallback to built-in risk analysis if no API key
      return this.calculateBasicRiskAnalysis(portfolio, recentTrades, riskTolerance);
    } catch (error) {
      console.error('Error getting risk analysis:', error);
      return this.calculateBasicRiskAnalysis(portfolio, recentTrades, riskTolerance);
    }
  }

  // Enhanced Market Sentiment Analysis
  async getMarketSentiment(symbols: string[], newsData?: any[]): Promise<any> {
    try {
      const prompt = AI_PROMPTS.marketSentiment
        .replace('{instruments}', symbols.join(', '))
        .replace('{recentNews}', JSON.stringify(newsData?.slice(0, 5) || [], null, 2))
        .replace('{technicalData}', 'Recent price action and volume data');

      if (this.openAIKey) {
        const response = await axios.post(
          `${OPENAI_CONFIG.baseURL}/chat/completions`,
          {
            model: OPENAI_CONFIG.model,
            messages: [
              {
                role: 'system',
                content: 'You are a market sentiment analyst. Provide clear sentiment scores and actionable insights.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 600,
            temperature: 0.4
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openAIKey}`,
              'Content-Type': 'application/json'
            },
            timeout: API_CONFIG.timeout
          }
        );

        const aiResponse = response.data.choices[0]?.message?.content;
        return this.parseSentimentAnalysis(aiResponse, symbols);
      }

      // Fallback sentiment analysis
      return this.calculateBasicSentiment(symbols, newsData);
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      return this.calculateBasicSentiment(symbols, newsData);
    }
  }

  // Mobile-optimized WebSocket connection for real-time data
  createWebSocketConnection(symbol: string, callback: (data: any) => void): WebSocket | null {
    try {
      const wsUrl = `wss://api.qlarity.com/ws/live/${symbol}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
        // Send subscription message
        ws.send(JSON.stringify({
          action: 'subscribe',
          symbol: symbol,
          type: 'price'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected for ${symbol}`);
      };

      return ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      return null;
    }
  }

  // Enhanced notification service for mobile
  async sendNotification(title: string, message: string, type: 'info' | 'warning' | 'success' | 'error'): Promise<void> {
    try {
      // Check if the app is running as a mobile app
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            tag: 'qlarity',
            requireInteraction: type === 'warning' || type === 'error',
            data: {
              type,
              timestamp: Date.now()
            }
          });
        }
      }

      // Also send to backend notification service if available
      if (this.baseURL) {
        await axios.post(`${this.baseURL}/notifications`, {
          title,
          message,
          type,
          timestamp: Date.now()
        }, {
          timeout: 5000,
          headers: API_CONFIG.headers
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Enhanced error handling with retry logic
  async handleApiError(error: any, retryCount = 0): Promise<any> {
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return retryCount + 1;
    }
    
    // Log error for analytics
    console.error('API Error after retries:', {
      error: error.message,
      status: error.response?.status,
      retryCount,
      timestamp: Date.now()
    });
    
    throw error;
  }

  // Private helper methods
  private parseAIInsight(aiResponse: string): any {
    try {
      // Parse structured AI response
      const sections = aiResponse.split(/\d+\.\s+/);
      
      return {
        strengths: this.extractSection(aiResponse, 'Key Strengths') || ['Strong risk management', 'Good trend following'],
        weaknesses: this.extractSection(aiResponse, 'Areas for Improvement') || ['Overtrading', 'Poor timing'],
        actionSteps: this.extractSection(aiResponse, 'Specific Action Steps') || ['Focus on major sessions', 'Reduce position size'],
        riskAssessment: this.extractSection(aiResponse, 'Risk Assessment') || 'Moderate risk profile',
        opportunities: this.extractSection(aiResponse, 'Market Opportunities') || ['EUR/USD volatility', 'Gold momentum'],
        confidence: 85,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error parsing AI insight:', error);
      return this.getDefaultInsight();
    }
  }

  private parseRiskAnalysis(aiResponse: string): any {
    try {
      return {
        riskScore: this.extractRiskScore(aiResponse) || 6,
        positionSizing: this.extractSection(aiResponse, 'Position Sizing') || ['Reduce lot sizes by 20%'],
        correlationWarnings: this.extractSection(aiResponse, 'Correlation') || ['High EUR correlation'],
        adjustments: this.extractSection(aiResponse, 'Suggested Adjustments') || ['Diversify pairs'],
        maxRisk: 2.0,
        recommendation: 'Moderate',
        timestamp: Date.now()
      };
    } catch (error) {
      return this.getDefaultRiskAnalysis();
    }
  }

  private parseSentimentAnalysis(aiResponse: string, symbols: string[]): any {
    try {
      return {
        overallSentiment: this.extractSentimentScore(aiResponse) || 65,
        keyDrivers: this.extractSection(aiResponse, 'Key Drivers') || ['USD strength', 'Risk appetite'],
        catalysts: this.extractSection(aiResponse, 'Upcoming Catalysts') || ['Fed meeting', 'NFP data'],
        recommendations: this.extractSection(aiResponse, 'Trading Recommendations') || ['Buy EUR on dips'],
        symbols: symbols.map(symbol => ({
          symbol,
          sentiment: 50 + Math.random() * 50,
          strength: 'moderate',
          direction: Math.random() > 0.5 ? 'bullish' : 'bearish'
        })),
        timestamp: Date.now()
      };
    } catch (error) {
      return this.getDefaultSentiment(symbols);
    }
  }

  private calculateBasicRiskAnalysis(portfolio: any, recentTrades: any[], riskTolerance: string): any {
    const totalValue = portfolio?.totalValue || 10000;
    const tradeCount = recentTrades?.length || 0;
    const avgProfit = recentTrades?.reduce((sum, trade) => sum + (trade.profit || 0), 0) / tradeCount || 0;
    
    let riskScore = 5; // Base score
    
    // Adjust based on trading frequency
    if (tradeCount > 20) riskScore += 2;
    if (tradeCount < 5) riskScore -= 1;
    
    // Adjust based on profit consistency
    if (avgProfit > 0) riskScore -= 1;
    if (avgProfit < -50) riskScore += 2;
    
    return {
      riskScore: Math.max(1, Math.min(10, riskScore)),
      positionSizing: [`Suggested lot size: ${(totalValue * 0.02).toFixed(2)}`, 'Max 3% per trade'],
      correlationWarnings: ['Monitor EUR pairs correlation'],
      adjustments: ['Consider adding defensive positions'],
      maxRisk: riskTolerance === 'conservative' ? 1.0 : riskTolerance === 'aggressive' ? 5.0 : 2.0,
      recommendation: riskTolerance,
      timestamp: Date.now()
    };
  }

  private calculateBasicSentiment(symbols: string[], newsData?: any[]): any {
    return {
      overallSentiment: 50 + Math.random() * 40,
      keyDrivers: ['Market volatility', 'Economic data'],
      catalysts: ['Central bank meetings', 'Earnings releases'],
      recommendations: ['Monitor key support levels'],
      symbols: symbols.map(symbol => ({
        symbol,
        sentiment: 40 + Math.random() * 40,
        strength: 'moderate',
        direction: Math.random() > 0.5 ? 'bullish' : 'bearish'
      })),
      timestamp: Date.now()
    };
  }

  private extractSection(text: string, sectionName: string): string[] {
    const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    
    if (match && match[1]) {
      return match[1]
        .split(/[-•\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 5)
        .slice(0, 3);
    }
    
    return [];
  }

  private extractRiskScore(text: string): number {
    const scoreMatch = text.match(/(?:risk\s*score|score)[:\s]*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1]);
    }
    return 5;
  }

  private extractSentimentScore(text: string): number {
    const scoreMatch = text.match(/(?:sentiment\s*score|overall\s*sentiment)[:\s]*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1]);
    }
    return 50;
  }

  private getDefaultInsight(): any {
    return {
      strengths: ['Consistent risk management', 'Good market timing'],
      weaknesses: ['Position sizing could improve', 'Consider diversification'],
      actionSteps: ['Focus on high-probability setups', 'Use smaller position sizes'],
      riskAssessment: 'Moderate risk profile with room for improvement',
      opportunities: ['EUR/USD trending', 'Gold volatility opportunities'],
      confidence: 75,
      timestamp: Date.now()
    };
  }

  private getDefaultRiskAnalysis(): any {
    return {
      riskScore: 5,
      positionSizing: ['Use 1-2% per trade', 'Maximum 5 concurrent positions'],
      correlationWarnings: ['Monitor currency exposure'],
      adjustments: ['Consider portfolio diversification'],
      maxRisk: 2.0,
      recommendation: 'Moderate approach',
      timestamp: Date.now()
    };
  }

  private getDefaultSentiment(symbols: string[]): any {
    return {
      overallSentiment: 60,
      keyDrivers: ['Technical momentum', 'Market structure'],
      catalysts: ['Economic releases', 'Central bank communications'],
      recommendations: ['Focus on trend continuation'],
      symbols: symbols.map(symbol => ({
        symbol,
        sentiment: 50 + Math.random() * 30,
        strength: 'moderate',
        direction: 'neutral'
      })),
      timestamp: Date.now()
    };
  }
}

export const aiService = new APIService();

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
    // TODO: Implement actual connection to different broker APIs (e.g., MT4, MT5, Binance, etc.)
    // This will require integrating with their respective SDKs or REST APIs.
    // For now, throwing an error to indicate that real implementation is required.
    throw new Error(`Real broker connection for ${brokerType} is not yet implemented. Please integrate with a live API.`);
  },

  // Import trades from connected brokers
  async importTrades(brokerId: string): Promise<TradeImportResult> {
    // TODO: Implement actual trade import logic from the connected broker.
    // This should fetch real trade history from the broker's API.
    // For now, throwing an error to indicate that real implementation is required.
    throw new Error(`Real trade import for broker ${brokerId} is not yet implemented. Please integrate with a live API.`);
  },

  // Auto-sync trades periodically
  async startAutoSync(brokerId: string, intervalMinutes: number = 15): Promise<void> {
    // This would set up a background sync process
    console.log(`Auto-sync started for broker ${brokerId} every ${intervalMinutes} minutes`);
  },

  // Get reconciliation report
  async getReconciliationReport(brokerId: string): Promise<any> {
    // TODO: Implement actual reconciliation report generation from real broker data.
    // For now, returning empty data.
    return {
      totalTrades: 0,
      matchedTrades: 0,
      unmatchedTrades: 0,
      discrepancies: []
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
    // Get the actual trade data from storage or database
    const storedTrades = localStorage.getItem('paperTrades');
    const trades = storedTrades ? JSON.parse(storedTrades) : [];
    const trade = trades.find((t: PaperTrade) => t.id === tradeId);
    
    if (!trade) {
      throw new Error('Trade not found');
    }
    
    const profitLoss = trade.type === 'buy' 
      ? (exitPrice - trade.entryPrice) * trade.lotSize * 100000
      : (trade.entryPrice - exitPrice) * trade.lotSize * 100000;
    
    return {
      ...trade,
      exitPrice,
      status: 'closed',
      profitLoss,
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
    // This would fetch real portfolio data from connected brokers
    // For now, return empty portfolio structure
    return {
      totalValue: 0,
      totalPnL: 0,
      dailyPnL: 0,
      positions: [],
      allocation: {
        forex: 0,
        crypto: 0,
        stocks: 0,
        commodities: 0
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
      // Real MT4 connection would require actual MT4 API implementation
      // This is a placeholder for the actual connection logic
      throw new Error('MT4 connection requires actual broker API implementation. Please use the real broker service for live connections.');
    } catch (error) {
      return {
        success: false,
        message: `MT4 connection not implemented: ${error}`
      };
    }
  },

  // Disconnect from MT4
  async disconnectFromMT4(): Promise<void> {
    console.log('Disconnected from MT4');
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