// Comprehensive Health Check Service for All Live Integrations
import { realDataService } from './realDataService';
import { AIStreamService } from './aiStreamService';
import { EnhancedWebSocketService } from './enhancedWebSocketService';
// Supabase import removed - using local storage instead

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: number;
  error?: string;
  details?: any;
}

interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthStatus[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  timestamp: number;
}

class HealthCheckService {
  private static instance: HealthCheckService;
  private lastHealthCheck: SystemHealthReport | null = null;
  private isChecking = false;
  private aiService: AIStreamService;
  private wsService: EnhancedWebSocketService;

  constructor() {
    this.aiService = new AIStreamService({});
    this.wsService = EnhancedWebSocketService.getInstance();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  // Run comprehensive health check
  async runFullHealthCheck(): Promise<SystemHealthReport> {
    if (this.isChecking) {
      return this.lastHealthCheck || this.getDefaultReport();
    }

    this.isChecking = true;
    console.log('🔍 Running comprehensive health check...');

    try {
      const services: HealthStatus[] = await Promise.all([
        this.checkLocalStorage(),
        this.checkCryptoDataAPI(),
        this.checkForexDataAPI(),
        this.checkStockDataAPI(),
        this.checkNewsAPI(),
        this.checkEconomicDataAPI(),
        this.checkOpenAIAPI(),
        this.checkGroqAPI(),
        this.checkGeminiAPI(),
        this.checkTelegramBot(),
        this.checkWebSocketConnections()
      ]);

      const summary = this.calculateSummary(services);
      const overall = this.determineOverallHealth(summary);

      const report: SystemHealthReport = {
        overall,
        services,
        summary,
        timestamp: Date.now()
      };

      this.lastHealthCheck = report;
      this.logHealthReport(report);
      
      return report;
    } catch (error) {
      console.error('Health check failed:', error);
      return this.getErrorReport(error);
    } finally {
      this.isChecking = false;
    }
  }

  // Individual service checks
  private async checkLocalStorage(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Test local storage functionality
      const testKey = 'health_check_test';
      const testValue = 'test_data';
      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const isWorking = retrievedValue === testValue;
      const responseTime = Date.now() - start;

      return {
        service: 'Local Storage',
        status: isWorking ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        details: { working: isWorking }
      };
    } catch (error) {
      return {
        service: 'Local Storage',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkCryptoDataAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const cryptoPrices = await realDataService.getCryptoPrices();
      const responseTime = Date.now() - start;

      return {
        service: 'Crypto Data (CoinGecko)',
        status: cryptoPrices.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { pricesReceived: cryptoPrices.length }
      };
    } catch (error) {
      return {
        service: 'Crypto Data (CoinGecko)',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkForexDataAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const forexRates = await realDataService.getForexRates();
      const responseTime = Date.now() - start;

      return {
        service: 'Forex Data (ExchangeRate-API)',
        status: forexRates.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { ratesReceived: forexRates.length }
      };
    } catch (error) {
      return {
        service: 'Forex Data (ExchangeRate-API)',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkStockDataAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const stockQuotes = await realDataService.getStockQuotes(['AAPL', 'GOOGL']);
      const responseTime = Date.now() - start;

      return {
        service: 'Stock Data (Finnhub/Alpha Vantage)',
        status: stockQuotes.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { quotesReceived: stockQuotes.length }
      };
    } catch (error) {
      return {
        service: 'Stock Data (Finnhub/Alpha Vantage)',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkNewsAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const news = await realDataService.getFinancialNews();
      const responseTime = Date.now() - start;

      return {
        service: 'Financial News (NewsAPI)',
        status: news.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { newsItemsReceived: news.length }
      };
    } catch (error) {
      return {
        service: 'Financial News (NewsAPI)',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkEconomicDataAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const events = await realDataService.getEconomicCalendar();
      const responseTime = Date.now() - start;

      return {
        service: 'Economic Calendar (FMP)',
        status: events.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { eventsReceived: events.length }
      };
    } catch (error) {
      return {
        service: 'Economic Calendar (FMP)',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkOpenAIAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const analysis = await this.aiService.getMarketAnalysis({
        marketData: { forex: [], crypto: [], stocks: [], news: [] },
        analysisType: 'sentiment'
      }, { provider: 'openai' });
      
      const responseTime = Date.now() - start;

      return {
        service: 'OpenAI API',
        status: analysis.analysis ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        details: { confidence: analysis.confidence }
      };
    } catch (error) {
      return {
        service: 'OpenAI API',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkGroqAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const healthResults = await this.aiService.healthCheck();
      const responseTime = Date.now() - start;

      return {
        service: 'Groq API',
        status: healthResults.groq ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        details: { available: healthResults.groq }
      };
    } catch (error) {
      return {
        service: 'Groq API',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkGeminiAPI(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const healthResults = await this.aiService.healthCheck();
      const responseTime = Date.now() - start;

      return {
        service: 'Google Gemini API',
        status: healthResults.gemini ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        details: { available: healthResults.gemini }
      };
    } catch (error) {
      return {
        service: 'Google Gemini API',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkTelegramBot(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Simple check for Telegram Bot API accessibility
      const response = await fetch('https://api.telegram.org/bot7850305593:AAGWlAtH_N7UCsSZ5JecRseKz3-oSS7un84/getMe');
      const result = await response.json();
      const responseTime = Date.now() - start;

      return {
        service: 'Telegram Bot',
        status: result.ok ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        details: { botActive: result.ok, botUsername: result.result?.username }
      };
    } catch (error) {
      return {
        service: 'Telegram Bot',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkWebSocketConnections(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // WebSocket health check not implemented
      const responseTime = Date.now() - start;
      
      return {
        service: 'WebSocket Connections',
        status: 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        details: { 
          healthy: 0, 
          total: 0,
          connections: {} 
        }
      };
    } catch (error) {
      return {
        service: 'WebSocket Connections',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility methods
  private calculateSummary(services: HealthStatus[]) {
    return {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length
    };
  }

  private determineOverallHealth(summary: { healthy: number; degraded: number; unhealthy: number; total: number }): 'healthy' | 'degraded' | 'unhealthy' {
    const healthyPercentage = summary.healthy / summary.total;
    
    if (healthyPercentage >= 0.8) return 'healthy';
    if (healthyPercentage >= 0.5) return 'degraded';
    return 'unhealthy';
  }

  private logHealthReport(report: SystemHealthReport): void {
    const statusEmoji = {
      healthy: '✅',
      degraded: '⚠️',
      unhealthy: '❌'
    };

    console.log(`\n🏥 SYSTEM HEALTH REPORT ${statusEmoji[report.overall]}`);
    console.log(`Overall Status: ${report.overall.toUpperCase()}`);
    console.log(`Services: ${report.summary.healthy}/${report.summary.total} healthy`);
    console.log('\nService Details:');
    
    report.services.forEach(service => {
      const emoji = statusEmoji[service.status];
      console.log(`${emoji} ${service.service}: ${service.status} (${service.responseTime}ms)`);
      if (service.error) {
        console.log(`   Error: ${service.error}`);
      }
    });
    
    console.log(`\nReport generated at: ${new Date(report.timestamp).toLocaleString()}\n`);
  }

  private getDefaultReport(): SystemHealthReport {
    return {
      overall: 'unhealthy',
      services: [],
      summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
      timestamp: Date.now()
    };
  }

  private getErrorReport(error: any): SystemHealthReport {
    return {
      overall: 'unhealthy',
      services: [{
        service: 'Health Check System',
        status: 'unhealthy',
        responseTime: 0,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Health check system error'
      }],
      summary: { total: 1, healthy: 0, degraded: 0, unhealthy: 1 },
      timestamp: Date.now()
    };
  }

  // Quick check for critical services only
  async quickHealthCheck(): Promise<{ status: string; critical: number; total: number }> {
    try {
      const criticalChecks = await Promise.all([
        this.checkLocalStorage(),
        this.checkCryptoDataAPI(),
        this.checkForexDataAPI(),
        this.checkOpenAIAPI()
      ]);

      const healthy = criticalChecks.filter(check => check.status === 'healthy').length;
      const total = criticalChecks.length;
      
      return {
        status: healthy >= 3 ? 'healthy' : healthy >= 2 ? 'degraded' : 'unhealthy',
        critical: healthy,
        total
      };
    } catch (error) {
      return { status: 'unhealthy', critical: 0, total: 4 };
    }
  }

  // Get last health check report
  getLastReport(): SystemHealthReport | null {
    return this.lastHealthCheck;
  }

  // Check if system is ready for trading
  async isTradingReady(): Promise<{ ready: boolean; reason?: string }> {
    const report = await this.runFullHealthCheck();
    
    // Critical services for trading
    const criticalServices = [
      'Supabase Database',
      'Crypto Data (CoinGecko)',
      'Forex Data (ExchangeRate-API)',
      'OpenAI API'
    ];

    const criticalStatus = report.services.filter(s => 
      criticalServices.includes(s.service) && s.status === 'healthy'
    );

    if (criticalStatus.length >= 3) {
      return { ready: true };
    } else {
      const unhealthyServices = report.services
        .filter(s => criticalServices.includes(s.service) && s.status !== 'healthy')
        .map(s => s.service);
      
      return { 
        ready: false, 
        reason: `Critical services unavailable: ${unhealthyServices.join(', ')}` 
      };
    }
  }
}

export const healthCheckService = HealthCheckService.getInstance();
export type { HealthStatus, SystemHealthReport }; 