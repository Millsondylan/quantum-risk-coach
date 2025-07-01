import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { apiRateLimiter } from './apiRateLimiter';

// Real API endpoints for financial data
const API_ENDPOINTS = {
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  POLYGON: 'https://api.polygon.io',
  EXCHANGERATE: 'https://v6.exchangerate-api.com/v6',
  FIXER: 'https://api.fixer.io/v1',
  FMP: 'https://financialmodelingprep.com/api/v3',
  ETHERSCAN: 'https://api.etherscan.io/api',
  FINNHUB: 'https://finnhub.io/api/v1',
  COINGECKO: 'https://api.coingecko.com/api/v3',
  NEWS: 'https://newsapi.org/v2'
};

// API Configuration with environment variables
const API_KEYS = {
  YFINANCE: import.meta.env.VITE_YFINANCE_API_KEY || 'C7wD6OmWJ_xzKSMZy0Vhpffs3hpyaYJU',
  COINGECKO: import.meta.env.VITE_COINGECKO_API_KEY || 'CG-nCXJTWBdFGw2TdzhBdPgi7uH',
  ALPHA_VANTAGE: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'DSPSF5OFTDBPT0Q3',
  POLYGON: import.meta.env.VITE_POLYGON_API_KEY || 'iLvuzznF8yhGvWFxk_Dt7vr2ykM8p6BM',
  EXCHANGERATE: import.meta.env.VITE_EXCHANGERATE_API_KEY || '82b2f90230ac56fe9e1ac7e1',
  FIXER: import.meta.env.VITE_FIXER_API_KEY || 'b86ef5114855abba3c2ad0d1776fdfe6',
  FMP: import.meta.env.VITE_FMP_API_KEY || 'a8BaUPMXsbNfUmOeVMBVoaogf6oQzOQP',
  ETHERSCAN: import.meta.env.VITE_ETHERSCAN_API_KEY || '923QMUQKQ2IKXUTZGRFBCZ8IM84QZUD7Y6',
  FINNHUB: import.meta.env.VITE_FINNHUB_API_KEY || 'd1elql1r01qghj41ko20d1elql1r01qghj41ko2g',
  NEWS: import.meta.env.VITE_NEWS_API_KEY || 'd555ac49f0db4edeac533af9a7232345'
};

// AI API Configuration with environment variables
const AI_KEYS = {
  OPENAI: import.meta.env.VITE_OPENAI_API_KEY || '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',
  GROQ: import.meta.env.VITE_GROQ_API_KEY || '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',
  GEMINI: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD3jSvbP_AntLSgc5vRJXMpVvPAJ0LBBb4'
};

// Interfaces
interface MarketDataPoint {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: number;
  source: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  urlToImage?: string;
  category?: string;
  impact?: 'high' | 'medium' | 'low';
}

interface EconomicEvent {
  title: string;
  country: string;
  date: string;
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
}

interface ForexRate {
  base: string;
  target: string;
  rate: number;
  timestamp: number;
  change_24h?: number;
}

// Cache for reducing API calls
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

class RealDataService {
  private static instance: RealDataService;
  private wsConnections: Map<string, WebSocket> = new Map();

  public static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  // Cache utilities
  private getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMinutes: number = 5): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  // Forex rates from multiple sources
  async getForexRates(): Promise<ForexRate[]> {
    return apiRateLimiter.makeRequest(
      'exchangerate',
      async () => {
        // Primary: ExchangeRate API
        const response = await fetch(
          `${API_ENDPOINTS.EXCHANGERATE}/${API_KEYS.EXCHANGERATE}/latest/USD`
        );
        
        if (response.ok) {
          const data = await response.json();
          const rates: ForexRate[] = Object.entries(data.conversion_rates)
            .filter(([currency]) => ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'].includes(currency))
            .map(([target, rate]) => ({
              base: 'USD',
              target,
              rate: rate as number,
              timestamp: Date.now()
            }));
          
          return rates;
        }

        // Fallback: Fixer API
        const fixerResponse = await fetch(
          `${API_ENDPOINTS.FIXER}/latest?access_key=${API_KEYS.FIXER}&base=USD&symbols=EUR,GBP,JPY,CHF,CAD,AUD,NZD`
        );
        
        if (fixerResponse.ok) {
          const fixerData = await fixerResponse.json();
          const rates: ForexRate[] = Object.entries(fixerData.rates).map(([target, rate]) => ({
            base: 'USD',
            target,
            rate: rate as number,
            timestamp: Date.now()
          }));
          
          return rates;
        }

        throw new Error('All forex API sources failed');
      },
      'forex_rates'
    ).catch(error => {
      console.error('Error fetching forex rates:', error);
      return this.getFallbackForexRates();
    });
  }

  // Cryptocurrency prices from CoinGecko
  async getCryptoPrices(): Promise<CryptoPrice[]> {
    return apiRateLimiter.makeRequest(
      'coingecko',
      async () => {
        const response = await fetch(
          `${API_ENDPOINTS.COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
          {
            headers: {
              'x-cg-demo-api-key': API_KEYS.COINGECKO
            }
          }
        );

        if (!response.ok) throw new Error('CoinGecko API failed');

        const data = await response.json();
        const prices: CryptoPrice[] = data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_24h: coin.price_change_24h || 0,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          market_cap: coin.market_cap,
          volume_24h: coin.total_volume,
          last_updated: coin.last_updated
        }));

        return prices;
      },
      'crypto_prices'
    ).catch(error => {
      console.error('Error fetching crypto prices:', error);
      return this.getFallbackCryptoPrices();
    });
  }

  // Stock market data from multiple sources
  async getStockQuotes(symbols: string[]): Promise<MarketDataPoint[]> {
    const cacheKey = `stocks_${symbols.join('_')}`;
    const cached = this.getCached<MarketDataPoint[]>(cacheKey);
    if (cached) return cached;

    const quotes: MarketDataPoint[] = [];

    try {
      // Primary: Finnhub
      for (const symbol of symbols) {
        try {
          const response = await fetch(
            `${API_ENDPOINTS.FINNHUB}/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB}`
          );
          
          if (response.ok) {
            const data = await response.json();
            quotes.push({
              symbol,
              price: data.c || 0,
              change: data.d || 0,
              changePercent: data.dp || 0,
              timestamp: Date.now(),
              source: 'Finnhub'
            });
          }
        } catch (error) {
          console.error(`Error fetching ${symbol} from Finnhub:`, error);
        }
      }

      // Fallback: Alpha Vantage for missing symbols
      for (const symbol of symbols) {
        if (!quotes.find(q => q.symbol === symbol)) {
          try {
            const response = await fetch(
              `${API_ENDPOINTS.ALPHA_VANTAGE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const quote = data['Global Quote'];
              if (quote) {
                quotes.push({
                  symbol,
                  price: parseFloat(quote['05. price']) || 0,
                  change: parseFloat(quote['09. change']) || 0,
                  changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
                  volume: parseInt(quote['06. volume']) || 0,
                  timestamp: Date.now(),
                  source: 'Alpha Vantage'
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching ${symbol} from Alpha Vantage:`, error);
          }
        }
      }

      this.setCache(cacheKey, quotes, 2);
      return quotes;
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
      return this.getFallbackStockQuotes(symbols);
    }
  }

  // Economic calendar and news
  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    const cacheKey = 'economic_calendar';
    const cached = this.getCached<EconomicEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      // Using FMP for economic calendar
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_ENDPOINTS.FMP}/economic_calendar?apikey=${API_KEYS.FMP}&from=${today}&to=${today}`
      );

      if (!response.ok) throw new Error('FMP Economic Calendar API failed');

      const data = await response.json();
      const events: EconomicEvent[] = data.slice(0, 10).map((event: any) => ({
        title: event.event || 'Economic Event',
        country: event.country || 'Unknown',
        date: event.date || today,
        time: event.time || '00:00',
        currency: event.currency || 'USD',
        impact: this.mapImpact(event.impact),
        forecast: event.estimate || '',
        previous: event.previous || '',
        actual: event.actual || ''
      }));

      this.setCache(cacheKey, events, 60);
      return events;
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      return this.getFallbackEconomicCalendar();
    }
  }

  // Financial news from NewsAPI with rate limiting
  async getFinancialNews(): Promise<NewsItem[]> {
    return apiRateLimiter.makeRequest(
      'newsapi',
      async () => {
        const response = await fetch(
          `${API_ENDPOINTS.NEWS}/everything?q=trading OR forex OR cryptocurrency OR stocks&sortBy=publishedAt&language=en&pageSize=20&apiKey=${API_KEYS.NEWS}`,
          {
            headers: {
              'User-Agent': 'QuantumRiskCoach/1.0'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`NewsAPI failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'error') {
          throw new Error(`NewsAPI error: ${data.message}`);
        }

        const news: NewsItem[] = data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          urlToImage: article.urlToImage,
          category: 'financial',
          impact: this.determineNewsImpact(article.title, article.description)
        }));

        return news;
      },
      'financial_news'
    ).catch(error => {
      console.error('Error fetching financial news:', error);
      return this.getFallbackNews();
    });
  }

  // Market sentiment analysis
  async getMarketSentiment(): Promise<{ sentiment: string; score: number; confidence: number }> {
    try {
      const news = await this.getFinancialNews();
      const cryptoPrices = await this.getCryptoPrices();
      const forexRates = await this.getForexRates();

      // Simple sentiment analysis based on price movements and news
      let sentimentScore = 0;
      let totalWeight = 0;

      // Crypto sentiment (30% weight)
      const btcData = cryptoPrices.find(c => c.symbol === 'BTC');
      if (btcData) {
        sentimentScore += (btcData.price_change_percentage_24h / 100) * 0.3;
        totalWeight += 0.3;
      }

      // News sentiment (40% weight)
      const positiveKeywords = ['bull', 'rise', 'gain', 'positive', 'growth', 'surge'];
      const negativeKeywords = ['bear', 'fall', 'loss', 'negative', 'decline', 'crash'];
      
      let newsScore = 0;
      news.slice(0, 10).forEach(item => {
        const text = (item.title + ' ' + item.description).toLowerCase();
        positiveKeywords.forEach(word => {
          if (text.includes(word)) newsScore += 0.1;
        });
        negativeKeywords.forEach(word => {
          if (text.includes(word)) newsScore -= 0.1;
        });
      });
      
      sentimentScore += newsScore * 0.4;
      totalWeight += 0.4;

      // Forex sentiment (30% weight)
      const eurUsd = forexRates.find(r => r.target === 'EUR');
      if (eurUsd) {
        // Simplified: if EUR is strong against USD, positive sentiment
        sentimentScore += (eurUsd.rate > 1.1 ? 0.1 : -0.1) * 0.3;
        totalWeight += 0.3;
      }

      const finalScore = totalWeight > 0 ? sentimentScore / totalWeight : 0;
      const sentiment = finalScore > 0.1 ? 'bullish' : finalScore < -0.1 ? 'bearish' : 'neutral';
      
      return {
        sentiment,
        score: Math.round(finalScore * 100),
        confidence: Math.min(totalWeight * 100, 85)
      };
    } catch (error) {
      console.error('Error calculating market sentiment:', error);
      return { sentiment: 'neutral', score: 0, confidence: 50 };
    }
  }

  // WebSocket connections for real-time data
  connectWebSocket(type: 'forex' | 'crypto' | 'stocks', callback: (data: any) => void): void {
    try {
      if (type === 'crypto') {
        // Binance WebSocket for crypto
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          callback({
            symbol: data.s,
            price: parseFloat(data.c),
            change: parseFloat(data.P),
            volume: parseFloat(data.v),
            timestamp: Date.now()
          });
        };
        this.wsConnections.set('crypto', ws);
      }
      
      if (type === 'forex') {
        // Finnhub WebSocket for forex
        const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEYS.FINNHUB}`);
        ws.onopen = () => {
          ws.send(JSON.stringify({'type':'subscribe','symbol':'OANDA:EUR_USD'}));
          ws.send(JSON.stringify({'type':'subscribe','symbol':'OANDA:GBP_USD'}));
          ws.send(JSON.stringify({'type':'subscribe','symbol':'OANDA:USD_JPY'}));
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'trade') {
            callback({
              symbol: data.s,
              price: data.p,
              timestamp: data.t
            });
          }
        };
        this.wsConnections.set('forex', ws);
      }
    } catch (error) {
      console.error(`Error connecting ${type} WebSocket:`, error);
    }
  }

  disconnectWebSocket(type: string): void {
    const ws = this.wsConnections.get(type);
    if (ws) {
      ws.close();
      this.wsConnections.delete(type);
    }
  }

  // AI-powered analysis using OpenAI
  async getAIMarketAnalysis(marketData: { forex: ForexRate[]; crypto: CryptoPrice[]; news: NewsItem[] }): Promise<string> {
    try {
      const prompt = `Analyze the following market data and provide trading insights:
      
      Forex Rates: ${JSON.stringify(marketData.forex.slice(0, 5))}
      Crypto Prices: ${JSON.stringify(marketData.crypto.slice(0, 5))}
      Recent News: ${JSON.stringify(marketData.news.slice(0, 3))}
      
      Provide a concise market analysis with trading recommendations.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_KEYS.OPENAI}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        throw new Error('OpenAI API failed');
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      return 'Market analysis temporarily unavailable. Please check market data manually.';
    }
  }

  // Save data to Supabase
  async saveMarketData(type: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('market_data')
        .insert({
          type,
          data,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving market data:', error);
    }
  }

  // Get historical data from Supabase
  async getHistoricalData(type: string, limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('type', type)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Utility methods
  private mapImpact(impact: string): 'high' | 'medium' | 'low' {
    if (!impact) return 'low';
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('high') || impactLower.includes('3')) return 'high';
    if (impactLower.includes('medium') || impactLower.includes('2')) return 'medium';
    return 'low';
  }

  private determineNewsImpact(title: string, description: string): 'high' | 'medium' | 'low' {
    const text = (title + ' ' + description).toLowerCase();
    const highImpactWords = ['fed', 'interest rate', 'inflation', 'gdp', 'unemployment', 'central bank'];
    const mediumImpactWords = ['earnings', 'profit', 'revenue', 'merger', 'acquisition'];
    
    if (highImpactWords.some(word => text.includes(word))) return 'high';
    if (mediumImpactWords.some(word => text.includes(word))) return 'medium';
    return 'low';
  }

  // Fallback data methods
  private getFallbackForexRates(): ForexRate[] {
    return [
      { base: 'USD', target: 'EUR', rate: 0.85, timestamp: Date.now() },
      { base: 'USD', target: 'GBP', rate: 0.75, timestamp: Date.now() },
      { base: 'USD', target: 'JPY', rate: 110, timestamp: Date.now() },
      { base: 'USD', target: 'CHF', rate: 0.92, timestamp: Date.now() }
    ];
  }

  private getFallbackCryptoPrices(): CryptoPrice[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_24h: 1200,
        price_change_percentage_24h: 2.7,
        market_cap: 850000000000,
        volume_24h: 25000000000,
        last_updated: new Date().toISOString()
      }
    ];
  }

  private getFallbackStockQuotes(symbols: string[]): MarketDataPoint[] {
    return symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      timestamp: Date.now(),
      source: 'Fallback'
    }));
  }

  private getFallbackEconomicCalendar(): EconomicEvent[] {
    return [
      {
        title: 'Federal Reserve Meeting',
        country: 'United States',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        currency: 'USD',
        impact: 'high',
        forecast: 'TBD',
        previous: '',
        actual: ''
      }
    ];
  }

  private getFallbackNews(): NewsItem[] {
    return [
      {
        title: 'Market Update: Trading Continues',
        description: 'Financial markets show mixed signals as traders assess economic data.',
        url: 'https://example.com',
        publishedAt: new Date().toISOString(),
        source: 'Financial News',
        category: 'financial',
        impact: 'medium'
      }
    ];
  }

  // Health check for all APIs
  async healthCheck(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    try {
      // Test CoinGecko
      const cryptoResponse = await fetch(`${API_ENDPOINTS.COINGECKO}/ping`);
      results.coingecko = cryptoResponse.ok;
    } catch {
      results.coingecko = false;
    }

    try {
      // Test Finnhub
      const finnhubResponse = await fetch(`${API_ENDPOINTS.FINNHUB}/stock/symbol?exchange=US&token=${API_KEYS.FINNHUB}`);
      results.finnhub = finnhubResponse.ok;
    } catch {
      results.finnhub = false;
    }

    try {
      // Test ExchangeRate API
      const forexResponse = await fetch(`${API_ENDPOINTS.EXCHANGERATE}/${API_KEYS.EXCHANGERATE}/latest/USD`);
      results.exchangerate = forexResponse.ok;
    } catch {
      results.exchangerate = false;
    }

    try {
      // Test NewsAPI
      const newsResponse = await fetch(`${API_ENDPOINTS.NEWS}/sources?apiKey=${API_KEYS.NEWS}`);
      results.news = newsResponse.ok;
    } catch {
      results.news = false;
    }

    try {
      // Test Supabase
      const { error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
      results.supabase = !error;
    } catch {
      results.supabase = false;
    }

    return results;
  }
}

export const realDataService = RealDataService.getInstance();
export type { MarketDataPoint, NewsItem, EconomicEvent, CryptoPrice, ForexRate }; 