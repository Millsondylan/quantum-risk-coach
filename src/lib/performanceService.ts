/**
 * Performance Service for Quantum Risk Coach
 * Handles API optimization, caching, and button responsiveness
 */

class PerformanceService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cache TTL in milliseconds
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly QUICK_TTL = 30 * 1000; // 30 seconds
  
  constructor() {
    // Clean up expired cache entries every 10 minutes
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  /**
   * Optimized API call with caching and request deduplication
   */
  async optimizedApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.getFromCache<T>(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make the API call
    const promise = apiCall()
      .then((data) => {
        this.setCache(key, data, ttl);
        return data;
      })
      .catch((error) => {
        console.error(`API call failed for key: ${key}`, error);
        throw error;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Button action with debouncing and loading state
   */
  debounceAction(
    key: string, 
    action: () => Promise<void> | void,
    delay: number = 300
  ) {
    // Clear existing timeout
    if (this.pendingRequests.has(`debounce_${key}`)) {
      clearTimeout(this.pendingRequests.get(`debounce_${key}`) as any);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await action();
      } catch (error) {
        console.error(`Debounced action failed for key: ${key}`, error);
      } finally {
        this.pendingRequests.delete(`debounce_${key}`);
      }
    }, delay);

    this.pendingRequests.set(`debounce_${key}`, timeout as any);
  }

  /**
   * Preload critical data for better UX
   */
  async preloadCriticalData() {
    const criticalAPIs = [
      { key: 'market_data', call: () => this.fetchMarketData() },
      { key: 'user_portfolio', call: () => this.fetchUserPortfolio() },
      { key: 'ai_status', call: () => this.checkAIStatus() }
    ];

    // Start all preload requests in parallel
    const promises = criticalAPIs.map(api => 
      this.optimizedApiCall(api.key, api.call, this.QUICK_TTL)
        .catch(error => {
          console.warn(`Failed to preload ${api.key}:`, error);
          return null;
        })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Fast button response with optimistic updates
   */
  async fastButtonAction<T>(
    optimisticUpdate: () => void,
    apiCall: () => Promise<T>,
    rollback: () => void
  ): Promise<T> {
    try {
      // Apply optimistic update immediately
      optimisticUpdate();
      
      // Perform API call in background
      const result = await apiCall();
      
      return result;
    } catch (error) {
      // Rollback on error
      rollback();
      throw error;
    }
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Mock API calls for demonstration
  private async fetchMarketData() {
    return new Promise(resolve => 
      setTimeout(() => resolve({ prices: [], updated: Date.now() }), 100)
    );
  }

  private async fetchUserPortfolio() {
    return new Promise(resolve => 
      setTimeout(() => resolve({ balance: 0, trades: [] }), 150)
    );
  }

  private async checkAIStatus() {
    return new Promise(resolve => 
      setTimeout(() => resolve({ status: 'active', models: ['gpt-4', 'groq'] }), 50)
    );
  }

  /**
   * Measure and log performance metrics
   */
  measurePerformance<T extends (...args: any[]) => any>(label: string, fn: T): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = fn(...args);
        const duration = performance.now() - start;
        console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`❌ ${label} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    }) as T;
  }

  /**
   * Clear all caches (useful for logout or manual refresh)
   */
  clearAllCaches(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Helper hook for React components
export const useOptimizedAPI = () => {
  return {
    optimizedCall: performanceService.optimizedApiCall.bind(performanceService),
    debounceAction: performanceService.debounceAction.bind(performanceService),
    fastAction: performanceService.fastButtonAction.bind(performanceService),
    preload: performanceService.preloadCriticalData.bind(performanceService),
    clearCache: performanceService.clearAllCaches.bind(performanceService)
  };
}; 