// API Rate Limiter and Usage Monitor
// Protects API keys from exhaustion and provides intelligent caching

interface ApiEndpoint {
  name: string;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  cacheTTLMinutes: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  cost: number; // relative cost of this endpoint
}

interface RateLimitInfo {
  requests: number;
  resetTime: number;
  remaining: number;
}

interface ApiUsageStats {
  endpoint: string;
  requests: number;
  cached: number;
  errors: number;
  avgResponseTime: number;
  lastUsed: number;
  dailyUsage: number;
  cost: number;
}

class ApiRateLimiter {
  private static instance: ApiRateLimiter;
  private requestCounts: Map<string, RateLimitInfo> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private usageStats: Map<string, ApiUsageStats> = new Map();
  private queue: Array<{ endpoint: string; request: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private isProcessingQueue = false;

  // API endpoint configurations
  private endpoints: Map<string, ApiEndpoint> = new Map([
    ['coingecko', {
      name: 'CoinGecko',
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 300,
      maxRequestsPerDay: 1000,
      cacheTTLMinutes: 5,
      priority: 'high',
      cost: 1
    }],
    ['newsapi', {
      name: 'NewsAPI',
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 100,
      maxRequestsPerDay: 500,
      cacheTTLMinutes: 30,
      priority: 'medium',
      cost: 2
    }],
    ['finnhub', {
      name: 'Finnhub',
      maxRequestsPerMinute: 12,
      maxRequestsPerHour: 200,
      maxRequestsPerDay: 1000,
      cacheTTLMinutes: 2,
      priority: 'high',
      cost: 1.5
    }],
    ['alpha_vantage', {
      name: 'Alpha Vantage',
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 25,
      maxRequestsPerDay: 100,
      cacheTTLMinutes: 10,
      priority: 'medium',
      cost: 3
    }],
    ['openai', {
      name: 'OpenAI',
      maxRequestsPerMinute: 3,
      maxRequestsPerHour: 20,
      maxRequestsPerDay: 100,
      cacheTTLMinutes: 60,
      priority: 'critical',
      cost: 10
    }],
    ['groq', {
      name: 'Groq',
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 100,
      maxRequestsPerDay: 500,
      cacheTTLMinutes: 30,
      priority: 'high',
      cost: 5
    }],
    ['exchangerate', {
      name: 'ExchangeRate-API',
      maxRequestsPerMinute: 6,
      maxRequestsPerHour: 100,
      maxRequestsPerDay: 1000,
      cacheTTLMinutes: 15,
      priority: 'high',
      cost: 1
    }],
    ['fmp', {
      name: 'Financial Modeling Prep',
      maxRequestsPerMinute: 4,
      maxRequestsPerHour: 50,
      maxRequestsPerDay: 250,
      cacheTTLMinutes: 60,
      priority: 'medium',
      cost: 2
    }],
    ['telegram', {
      name: 'Telegram Bot API',
      maxRequestsPerMinute: 20,
      maxRequestsPerHour: 300,
      maxRequestsPerDay: 3000,
      cacheTTLMinutes: 0,
      priority: 'low',
      cost: 0.5
    }]
  ]);

  public static getInstance(): ApiRateLimiter {
    if (!ApiRateLimiter.instance) {
      ApiRateLimiter.instance = new ApiRateLimiter();
    }
    return ApiRateLimiter.instance;
  }

  constructor() {
    // Initialize usage stats
    this.endpoints.forEach((config, key) => {
      this.usageStats.set(key, {
        endpoint: key,
        requests: 0,
        cached: 0,
        errors: 0,
        avgResponseTime: 0,
        lastUsed: 0,
        dailyUsage: 0,
        cost: 0
      });
    });

    // Reset daily counters at midnight
    this.scheduleDailyReset();
    
    // Start queue processor
    this.processQueue();
  }

  /**
   * Main method to make rate-limited API requests
   */
  async makeRequest(endpoint: string, requestFunc: () => Promise<any>, cacheKey?: string): Promise<any> {
    const startTime = Date.now();
    
    // Check cache first
    if (cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.updateStats(endpoint, 'cached', Date.now() - startTime);
        return cached;
      }
    }

    // Check rate limits
    if (!this.canMakeRequest(endpoint)) {
      // Add to queue if rate limited
      return new Promise((resolve, reject) => {
        this.queue.push({ endpoint, request: requestFunc, resolve, reject });
        this.processQueue();
      });
    }

    try {
      // Make the request
      this.recordRequest(endpoint);
      const result = await requestFunc();
      
      // Cache the result if cache key provided
      if (cacheKey && result) {
        this.addToCache(cacheKey, result, endpoint);
      }

      this.updateStats(endpoint, 'success', Date.now() - startTime);
      return result;
    } catch (error) {
      this.updateStats(endpoint, 'error', Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Check if we can make a request to this endpoint
   */
  private canMakeRequest(endpoint: string): boolean {
    const config = this.endpoints.get(endpoint);
    if (!config) return true;

    const now = Date.now();
    const rateLimitKey = `${endpoint}_minute`;
    const hourlyKey = `${endpoint}_hour`;
    const dailyKey = `${endpoint}_day`;

    // Check minute limit
    const minuteLimit = this.requestCounts.get(rateLimitKey);
    if (minuteLimit && now < minuteLimit.resetTime && minuteLimit.requests >= config.maxRequestsPerMinute) {
      return false;
    }

    // Check hourly limit
    const hourlyLimit = this.requestCounts.get(hourlyKey);
    if (hourlyLimit && now < hourlyLimit.resetTime && hourlyLimit.requests >= config.maxRequestsPerHour) {
      return false;
    }

    // Check daily limit
    const dailyLimit = this.requestCounts.get(dailyKey);
    if (dailyLimit && now < dailyLimit.resetTime && dailyLimit.requests >= config.maxRequestsPerDay) {
      return false;
    }

    return true;
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(endpoint: string): void {
    const now = Date.now();
    
    // Record minute counter
    this.updateCounter(`${endpoint}_minute`, now, 60 * 1000);
    
    // Record hourly counter
    this.updateCounter(`${endpoint}_hour`, now, 60 * 60 * 1000);
    
    // Record daily counter
    this.updateCounter(`${endpoint}_day`, now, 24 * 60 * 60 * 1000);
  }

  /**
   * Update request counter for a time period
   */
  private updateCounter(key: string, now: number, period: number): void {
    const counter = this.requestCounts.get(key);
    
    if (!counter || now >= counter.resetTime) {
      // Reset counter
      this.requestCounts.set(key, {
        requests: 1,
        resetTime: now + period,
        remaining: -1 // Will be calculated
      });
    } else {
      // Increment counter
      counter.requests++;
      this.requestCounts.set(key, counter);
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private addToCache(key: string, data: any, endpoint: string): void {
    const config = this.endpoints.get(endpoint);
    const ttl = config ? config.cacheTTLMinutes * 60 * 1000 : 5 * 60 * 1000;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Update usage statistics
   */
  private updateStats(endpoint: string, result: 'success' | 'error' | 'cached', responseTime: number): void {
    const stats = this.usageStats.get(endpoint);
    if (!stats) return;

    stats.lastUsed = Date.now();
    
    if (result === 'success') {
      stats.requests++;
      stats.dailyUsage++;
      stats.avgResponseTime = (stats.avgResponseTime * (stats.requests - 1) + responseTime) / stats.requests;
      
      const config = this.endpoints.get(endpoint);
      if (config) {
        stats.cost += config.cost;
      }
    } else if (result === 'error') {
      stats.errors++;
    } else if (result === 'cached') {
      stats.cached++;
    }

    this.usageStats.set(endpoint, stats);
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      if (this.canMakeRequest(item.endpoint)) {
        try {
          this.recordRequest(item.endpoint);
          const result = await item.request();
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      } else {
        // Put it back in queue and wait
        this.queue.unshift(item);
        await this.sleep(1000); // Wait 1 second before retrying
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Get usage statistics for monitoring
   */
  getUsageStats(): ApiUsageStats[] {
    return Array.from(this.usageStats.values());
  }

  /**
   * Get rate limit info for a specific endpoint
   */
  getRateLimitInfo(endpoint: string): { minute: RateLimitInfo; hour: RateLimitInfo; day: RateLimitInfo } {
    const config = this.endpoints.get(endpoint);
    if (!config) {
      return {
        minute: { requests: 0, resetTime: 0, remaining: 999 },
        hour: { requests: 0, resetTime: 0, remaining: 999 },
        day: { requests: 0, resetTime: 0, remaining: 999 }
      };
    }

    const minute = this.requestCounts.get(`${endpoint}_minute`) || { requests: 0, resetTime: 0, remaining: config.maxRequestsPerMinute };
    const hour = this.requestCounts.get(`${endpoint}_hour`) || { requests: 0, resetTime: 0, remaining: config.maxRequestsPerHour };
    const day = this.requestCounts.get(`${endpoint}_day`) || { requests: 0, resetTime: 0, remaining: config.maxRequestsPerDay };

    minute.remaining = Math.max(0, config.maxRequestsPerMinute - minute.requests);
    hour.remaining = Math.max(0, config.maxRequestsPerHour - hour.requests);
    day.remaining = Math.max(0, config.maxRequestsPerDay - day.requests);

    return { minute, hour, day };
  }

  /**
   * Get overall API health status
   */
  getApiHealthStatus(): { overall: string; endpoints: Array<{ name: string; status: string; usage: number }> } {
    const endpointStatuses = Array.from(this.endpoints.entries()).map(([key, config]) => {
      const limits = this.getRateLimitInfo(key);
      const dayUsagePercent = ((config.maxRequestsPerDay - limits.day.remaining) / config.maxRequestsPerDay) * 100;
      
      let status = 'healthy';
      if (dayUsagePercent > 90) status = 'critical';
      else if (dayUsagePercent > 75) status = 'warning';
      else if (dayUsagePercent > 50) status = 'moderate';

      return {
        name: config.name,
        status,
        usage: Math.round(dayUsagePercent)
      };
    });

    const criticalCount = endpointStatuses.filter(e => e.status === 'critical').length;
    const warningCount = endpointStatuses.filter(e => e.status === 'warning').length;

    let overall = 'healthy';
    if (criticalCount > 0) overall = 'critical';
    else if (warningCount > 2) overall = 'warning';
    else if (warningCount > 0) overall = 'moderate';

    return { overall, endpoints: endpointStatuses };
  }

  /**
   * Clear cache for specific endpoint or all
   */
  clearCache(endpoint?: string): void {
    if (endpoint) {
      // Clear cache entries that contain the endpoint name
      for (const [key] of this.cache) {
        if (key.includes(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; memoryUsage: string; hitRate: number } {
    const totalCached = Array.from(this.usageStats.values()).reduce((sum, stat) => sum + stat.cached, 0);
    const totalRequests = Array.from(this.usageStats.values()).reduce((sum, stat) => sum + stat.requests, 0);
    const hitRate = totalRequests > 0 ? (totalCached / (totalCached + totalRequests)) * 100 : 0;

    return {
      totalEntries: this.cache.size,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(this.cache.values())).length / 1024)}KB`,
      hitRate: Math.round(hitRate)
    };
  }

  /**
   * Intelligent cache warming for critical endpoints
   */
  async warmupCache(): Promise<void> {
    console.log('🔥 Warming up critical endpoint caches...');
    
    // This would be called with actual data fetching functions
    // Implementation depends on how your services are structured
  }

  /**
   * Schedule daily reset of counters
   */
  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyCounters();
      // Schedule next reset
      setInterval(() => this.resetDailyCounters(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private resetDailyCounters(): void {
    console.log('🔄 Resetting daily API usage counters...');
    
    // Reset daily usage in stats
    this.usageStats.forEach((stats) => {
      stats.dailyUsage = 0;
      stats.cost = 0;
    });

    // Clear daily rate limit counters
    for (const [key] of this.requestCounts) {
      if (key.includes('_day')) {
        this.requestCounts.delete(key);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiRateLimiter = ApiRateLimiter.getInstance();
export type { ApiUsageStats, RateLimitInfo, ApiEndpoint }; 