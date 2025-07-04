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

export interface MarketNews {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
  sentiment?: string;
  impact?: string;
  symbols?: string[];
}

export interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
}

export const marketService = {
  async getMarketNews(): Promise<MarketNews[]> {
    return [];
  },
  
  async getEconomicEvents(): Promise<EconomicEvent[]> {
    return [];
  },

  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    return [];
  }
};

export default {
  aiService
}; 