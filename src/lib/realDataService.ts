import axios from 'axios';

// Real API endpoints for financial data
const API_ENDPOINTS = {
  // Alpha Vantage for real-time forex data
  alphaVantage: 'https://www.alphavantage.co/query',
  // News API for real market news
  newsApi: 'https://newsapi.org/v2',
  // Economic calendar API
  economicCalendar: 'https://api.tradingeconomics.com/calendar',
  // Crypto data
  coinGecko: 'https://api.coingecko.com/api/v3',
  // Forex data
  forexApi: 'https://api.exchangerate-api.com/v4/latest',
  // Stock data
  yahooFinance: 'https://query1.finance.yahoo.com/v8/finance/chart',
  // Real-time forex quotes
  fxcm: 'https://api-demo.fxcm.com',
  // Economic indicators
  fred: 'https://api.stlouisfed.org/fred/series/observations',
  // Polygon.io for stocks and crypto
  polygon: 'https://api.polygon.io',
  // Fixer.io for forex
  fixer: 'http://data.fixer.io/api',
  // Financial Modeling Prep
  fmp: 'https://financialmodelingprep.com/api/v3',
  // Etherscan for Ethereum data
  etherscan: 'https://api.etherscan.io/api',
  // Finnhub for market data
  finnhub: 'https://finnhub.io/api/v1'
};

// API Keys configuration
const getApiKeys = () => ({
  // AI Providers
  openai: import.meta.env.VITE_OPENAI_API_KEY,
  groq: import.meta.env.VITE_GROQ_API_KEY,
  gemini: import.meta.env.VITE_GEMINI_API_KEY,
  
  // Market Data
  yfinance: import.meta.env.VITE_YFINANCE_API_KEY,
  coinGecko: import.meta.env.VITE_COINGECKO_API_KEY,
  alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  polygon: import.meta.env.VITE_POLYGON_API_KEY,
  exchangeRate: import.meta.env.VITE_EXCHANGERATE_API_KEY,
  fixer: import.meta.env.VITE_FIXER_API_KEY,
  fmp: import.meta.env.VITE_FMP_API_KEY,
  etherscan: import.meta.env.VITE_ETHERSCAN_API_KEY,
  finnhub: import.meta.env.VITE_FINNHUB_API_KEY,
  newsApi: import.meta.env.VITE_NEWS_API_KEY,
  
  // Additional Services
  tradingEconomics: import.meta.env.VITE_TRADING_ECONOMICS_API_KEY,
  fred: import.meta.env.VITE_FRED_API_KEY,
  fxcm: import.meta.env.VITE_FXCM_API_KEY
});

export interface RealMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
  source: string;
}

export interface RealEconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual?: string;
  category: string;
}

export interface RealNewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
}

export interface RealTradeData {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  profit?: number;
  status: 'open' | 'closed';
}

export interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  rank: number;
  timestamp: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  dividendYield: number;
  timestamp: string;
}

class RealDataService {
  private apiKeys = getApiKeys();

  // Get real-time forex data from multiple sources
  async getRealForexData(symbols: string[]): Promise<RealMarketData[]> {
    try {
      const results: RealMarketData[] = [];
      
      // Try Alpha Vantage first
      if (this.apiKeys.alphaVantage) {
        try {
          const alphaVantageData = await this.getAlphaVantageForexData(symbols);
          results.push(...alphaVantageData);
        } catch (error) {
          console.warn('Alpha Vantage failed, trying alternative sources');
        }
      }

      // Try Fixer.io as backup
      if (this.apiKeys.fixer && results.length === 0) {
        try {
          const fixerData = await this.getFixerForexData(symbols);
          results.push(...fixerData);
        } catch (error) {
          console.warn('Fixer.io failed');
        }
      }

      // Try ExchangeRate API as final backup
      if (this.apiKeys.exchangeRate && results.length === 0) {
        try {
          const exchangeRateData = await this.getExchangeRateForexData(symbols);
          results.push(...exchangeRateData);
        } catch (error) {
          console.warn('ExchangeRate API failed');
        }
      }

      if (results.length === 0) {
        throw new Error('All forex data sources failed');
      }

      return results;
    } catch (error) {
      console.error('Error fetching real forex data:', error);
      throw error;
    }
  }

  // Get real crypto data from multiple sources
  async getRealCryptoData(symbols: string[]): Promise<CryptoData[]> {
    try {
      const results: CryptoData[] = [];
      
      // Try CoinGecko first (no API key required)
      try {
        const coinGeckoData = await this.getCoinGeckoCryptoData(symbols);
        results.push(...coinGeckoData);
      } catch (error) {
        console.warn('CoinGecko failed, trying alternative sources');
      }

      // Try Polygon.io as backup
      if (this.apiKeys.polygon && results.length === 0) {
        try {
          const polygonData = await this.getPolygonCryptoData(symbols);
          results.push(...polygonData);
        } catch (error) {
          console.warn('Polygon.io failed');
        }
      }

      // Try Etherscan for Ethereum data
      if (this.apiKeys.etherscan && results.length === 0) {
        try {
          const etherscanData = await this.getEtherscanCryptoData(symbols);
          results.push(...etherscanData);
        } catch (error) {
          console.warn('Etherscan failed');
        }
      }

      if (results.length === 0) {
        throw new Error('All crypto data sources failed');
      }

      return results;
    } catch (error) {
      console.error('Error fetching real crypto data:', error);
      throw error;
    }
  }

  // Get real stock data from multiple sources
  async getRealStockData(symbols: string[]): Promise<StockData[]> {
    try {
      const results: StockData[] = [];
      
      // Try Yahoo Finance first
      try {
        const yahooData = await this.getYahooFinanceStockData(symbols);
        results.push(...yahooData);
      } catch (error) {
        console.warn('Yahoo Finance failed, trying alternative sources');
      }

      // Try Polygon.io as backup
      if (this.apiKeys.polygon && results.length === 0) {
        try {
          const polygonData = await this.getPolygonStockData(symbols);
          results.push(...polygonData);
        } catch (error) {
          console.warn('Polygon.io failed');
        }
      }

      // Try Financial Modeling Prep as backup
      if (this.apiKeys.fmp && results.length === 0) {
        try {
          const fmpData = await this.getFMPStockData(symbols);
          results.push(...fmpData);
        } catch (error) {
          console.warn('FMP failed');
        }
      }

      // Try Finnhub as final backup
      if (this.apiKeys.finnhub && results.length === 0) {
        try {
          const finnhubData = await this.getFinnhubStockData(symbols);
          results.push(...finnhubData);
        } catch (error) {
          console.warn('Finnhub failed');
        }
      }

      if (results.length === 0) {
        throw new Error('All stock data sources failed');
      }

      return results;
    } catch (error) {
      console.error('Error fetching real stock data:', error);
      throw error;
    }
  }

  // Get real economic calendar
  async getRealEconomicCalendar(): Promise<RealEconomicEvent[]> {
    try {
      if (!this.apiKeys.tradingEconomics) {
        throw new Error('Trading Economics API key not configured');
      }

      const response = await axios.get(API_ENDPOINTS.economicCalendar, {
        params: {
          c: this.apiKeys.tradingEconomics,
          d1: new Date().toISOString().split('T')[0],
          d2: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      return response.data.map((event: any) => ({
        id: event.Id.toString(),
        date: event.Date,
        time: event.Time,
        country: event.Country,
        currency: event.Currency,
        event: event.Event,
        impact: this.mapImpact(event.Impact),
        previous: event.Previous?.toString() || 'N/A',
        forecast: event.Forecast?.toString() || 'N/A',
        actual: event.Actual?.toString(),
        category: event.Category
      }));
    } catch (error) {
      console.error('Error fetching real economic calendar:', error);
      throw error;
    }
  }

  // Get real market news
  async getRealMarketNews(): Promise<RealNewsItem[]> {
    try {
      if (!this.apiKeys.newsApi) {
        throw new Error('News API key not configured');
      }

      const response = await axios.get(`${API_ENDPOINTS.newsApi}/everything`, {
        params: {
          q: 'forex trading OR cryptocurrency OR stock market',
          apiKey: this.apiKeys.newsApi,
          sortBy: 'publishedAt',
          pageSize: 20,
          language: 'en'
        }
      });

      return response.data.articles.map((article: any, index: number) => ({
        id: `news_${index}`,
        title: article.title,
        description: article.description,
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        impact: this.analyzeImpact(article.title + ' ' + article.description),
        symbols: this.extractSymbols(article.title + ' ' + article.description)
      }));
    } catch (error) {
      console.error('Error fetching real market news:', error);
      throw error;
    }
  }

  // Get real trading data from connected brokers
  async getRealTradeData(brokerId: string, symbol?: string): Promise<RealTradeData[]> {
    try {
      // This would integrate with actual broker APIs
      // For now, we'll return an empty array as this requires broker-specific implementation
      return [];
    } catch (error) {
      console.error('Error fetching real trade data:', error);
      throw error;
    }
  }

  // Get real market sentiment data
  async getRealMarketSentiment(symbols: string[]): Promise<any[]> {
    try {
      // This would integrate with sentiment analysis APIs
      // For now, we'll return basic sentiment data
      return symbols.map(symbol => ({
        symbol,
        sentiment: 'neutral',
        strength: 50,
        confidence: 75,
        sources: ['Social Media', 'News Analysis'],
        lastUpdate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching real market sentiment:', error);
      throw error;
    }
  }

  // Private methods for different data sources

  private async getAlphaVantageForexData(symbols: string[]): Promise<RealMarketData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(API_ENDPOINTS.alphaVantage, {
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: symbol.substring(0, 3),
          to_currency: symbol.substring(3, 6),
          apikey: this.apiKeys.alphaVantage
        }
      });

      const data = response.data['Realtime Currency Exchange Rate'];
      if (!data) {
        throw new Error(`No data received for ${symbol}`);
      }

      return {
        symbol,
        price: parseFloat(data['5. Exchange Rate']),
        change: 0,
        changePercent: 0,
        volume: 0,
        high: parseFloat(data['5. Exchange Rate']),
        low: parseFloat(data['5. Exchange Rate']),
        open: parseFloat(data['5. Exchange Rate']),
        timestamp: data['6. Last Refreshed'],
        source: 'Alpha Vantage'
      };
    });

    return await Promise.all(promises);
  }

  private async getFixerForexData(symbols: string[]): Promise<RealMarketData[]> {
    const response = await axios.get(API_ENDPOINTS.fixer, {
      params: {
        access_key: this.apiKeys.fixer,
        base: 'USD'
      }
    });

    return symbols.map(symbol => {
      const rate = response.data.rates[symbol.substring(3, 6)];
      return {
        symbol,
        price: rate,
        change: 0,
        changePercent: 0,
        volume: 0,
        high: rate,
        low: rate,
        open: rate,
        timestamp: new Date().toISOString(),
        source: 'Fixer.io'
      };
    });
  }

  private async getExchangeRateForexData(symbols: string[]): Promise<RealMarketData[]> {
    const response = await axios.get(`${API_ENDPOINTS.forexApi}/USD`);

    return symbols.map(symbol => {
      const rate = response.data.rates[symbol.substring(3, 6)];
      return {
        symbol,
        price: rate,
        change: 0,
        changePercent: 0,
        volume: 0,
        high: rate,
        low: rate,
        open: rate,
        timestamp: response.data.date,
        source: 'ExchangeRate API'
      };
    });
  }

  private async getCoinGeckoCryptoData(symbols: string[]): Promise<CryptoData[]> {
    const response = await axios.get(`${API_ENDPOINTS.coinGecko}/simple/price`, {
      params: {
        ids: symbols.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true,
        include_circulating_supply: true,
        include_total_supply: true,
        include_last_updated_at: true
      }
    });

    return symbols.map(symbol => {
      const data = response.data[symbol];
      return {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        change24h: data.usd_24h_change,
        changePercent24h: data.usd_24h_change,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
        circulatingSupply: data.circulating_supply || 0,
        totalSupply: data.total_supply || 0,
        rank: 0, // Would need additional API call
        timestamp: new Date(data.last_updated_at * 1000).toISOString()
      };
    });
  }

  private async getPolygonCryptoData(symbols: string[]): Promise<CryptoData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(`${API_ENDPOINTS.polygon}/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          apikey: this.apiKeys.polygon
        }
      });

      const data = response.data.results[0];
      return {
        symbol: symbol.toUpperCase(),
        price: data.c,
        change24h: data.c - data.o,
        changePercent24h: ((data.c - data.o) / data.o) * 100,
        volume24h: data.v,
        marketCap: 0, // Would need additional API call
        circulatingSupply: 0,
        totalSupply: 0,
        rank: 0,
        timestamp: new Date(data.t).toISOString()
      };
    });

    return await Promise.all(promises);
  }

  private async getEtherscanCryptoData(symbols: string[]): Promise<CryptoData[]> {
    // Etherscan is primarily for Ethereum data
    const ethSymbols = symbols.filter(s => s.toLowerCase().includes('eth'));
    
    const promises = ethSymbols.map(async (symbol) => {
      const response = await axios.get(API_ENDPOINTS.etherscan, {
        params: {
          module: 'stats',
          action: 'ethsupply',
          apikey: this.apiKeys.etherscan
        }
      });

      // This is a simplified example - would need more API calls for full data
      return {
        symbol: symbol.toUpperCase(),
        price: 0, // Would need price API
        change24h: 0,
        changePercent24h: 0,
        volume24h: 0,
        marketCap: 0,
        circulatingSupply: parseFloat(response.data.result),
        totalSupply: parseFloat(response.data.result),
        rank: 2, // Ethereum is typically #2
        timestamp: new Date().toISOString()
      };
    });

    return await Promise.all(promises);
  }

  private async getYahooFinanceStockData(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(`${API_ENDPOINTS.yahooFinance}/${symbol}`, {
        params: {
          interval: '1d',
          range: '1d'
        }
      });

      const data = response.data.chart.result[0];
      const quote = data.indicators.quote[0];
      const timestamp = data.timestamp[data.timestamp.length - 1];
      const currentPrice = quote.close[quote.close.length - 1];
      const openPrice = quote.open[0];

      return {
        symbol,
        price: currentPrice,
        change: currentPrice - openPrice,
        changePercent: ((currentPrice - openPrice) / openPrice) * 100,
        volume: quote.volume[quote.volume.length - 1] || 0,
        marketCap: 0, // Would need additional API call
        pe: 0,
        dividend: 0,
        dividendYield: 0,
        timestamp: new Date(timestamp * 1000).toISOString()
      };
    });

    return await Promise.all(promises);
  }

  private async getPolygonStockData(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(`${API_ENDPOINTS.polygon}/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          apikey: this.apiKeys.polygon
        }
      });

      const data = response.data.results[0];
      return {
        symbol,
        price: data.c,
        change: data.c - data.o,
        changePercent: ((data.c - data.o) / data.o) * 100,
        volume: data.v,
        marketCap: 0,
        pe: 0,
        dividend: 0,
        dividendYield: 0,
        timestamp: new Date(data.t).toISOString()
      };
    });

    return await Promise.all(promises);
  }

  private async getFMPStockData(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(`${API_ENDPOINTS.fmp}/quote/${symbol}`, {
        params: {
          apikey: this.apiKeys.fmp
        }
      });

      const data = response.data[0];
      return {
        symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changesPercentage,
        volume: data.volume,
        marketCap: data.marketCap,
        pe: data.pe,
        dividend: data.dividend,
        dividendYield: data.dividendYield,
        timestamp: new Date().toISOString()
      };
    });

    return await Promise.all(promises);
  }

  private async getFinnhubStockData(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await axios.get(`${API_ENDPOINTS.finnhub}/quote`, {
        params: {
          symbol,
          token: this.apiKeys.finnhub
        }
      });

      const data = response.data;
      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: data.v,
        marketCap: 0,
        pe: 0,
        dividend: 0,
        dividendYield: 0,
        timestamp: new Date(data.t * 1000).toISOString()
      };
    });

    return await Promise.all(promises);
  }

  // Helper methods
  private mapImpact(impact: string): 'high' | 'medium' | 'low' {
    switch (impact?.toLowerCase()) {
      case 'high':
      case '3':
        return 'high';
      case 'medium':
      case '2':
        return 'medium';
      case 'low':
      case '1':
        return 'low';
      default:
        return 'medium';
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bullish', 'surge', 'rally', 'gain', 'profit', 'positive', 'up', 'higher'];
    const negativeWords = ['bearish', 'drop', 'fall', 'loss', 'decline', 'negative', 'down', 'lower'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private analyzeImpact(text: string): 'high' | 'medium' | 'low' {
    const highImpactWords = ['fed', 'ecb', 'boe', 'nfp', 'cpi', 'gdp', 'interest rate'];
    const mediumImpactWords = ['employment', 'inflation', 'retail sales', 'manufacturing'];
    
    const lowerText = text.toLowerCase();
    if (highImpactWords.some(word => lowerText.includes(word))) return 'high';
    if (mediumImpactWords.some(word => lowerText.includes(word))) return 'medium';
    return 'low';
  }

  private extractSymbols(text: string): string[] {
    const forexPattern = /[A-Z]{6}/g;
    const cryptoPattern = /[A-Z]{3,4}USD/g;
    const stockPattern = /[A-Z]{1,5}\.[A-Z]{2}/g;
    
    const symbols = [
      ...text.match(forexPattern) || [],
      ...text.match(cryptoPattern) || [],
      ...text.match(stockPattern) || []
    ];
    
    return [...new Set(symbols)];
  }

  // Validate API keys
  validateApiKeys(): { valid: boolean; missing: string[]; available: string[] } {
    const missing = [];
    const available = [];
    const required = ['alphaVantage', 'newsApi'];
    
    for (const [key, value] of Object.entries(this.apiKeys)) {
      if (value && value !== 'your_' + key + '_here') {
        available.push(key);
      } else if (required.includes(key)) {
        missing.push(key);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
      available
    };
  }

  // Get available data sources
  getAvailableDataSources(): string[] {
    const validation = this.validateApiKeys();
    return validation.available;
  }
}

export const realDataService = new RealDataService(); 