interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  target?: EventTarget;
}

// Performance monitoring utilities

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  totalDuration: number;
  averageDuration: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private webMetrics: PerformanceMetrics | null = null;
  private observers: Map<string, PerformanceObserver> = new Map();
  private customMetrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeObservers();
    this.captureInitialMetrics();
  }

  private initializeObservers(): void {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.webMetrics = {
              ...this.webMetrics,
              largestContentfulPaint: lastEntry.startTime
            };
            this.logMetric('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        // Silently handle unsupported observers in production
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const firstInputEntry = entry as FirstInputEntry;
            this.webMetrics = {
              ...this.webMetrics,
              firstInputDelay: firstInputEntry.processingStart - firstInputEntry.startTime
            };
            this.logMetric('FID', firstInputEntry.processingStart - firstInputEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        // Silently handle unsupported observers in production
      }

      // Observe Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.webMetrics = {
            ...this.webMetrics,
            cumulativeLayoutShift: clsValue
          };
          this.logMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        // Silently handle unsupported observers in production
      }
    }
  }

  private captureInitialMetrics(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.captureNavigationMetrics();
      });
    } else {
      this.captureNavigationMetrics();
    }

    window.addEventListener('load', () => {
      this.captureLoadMetrics();
    });
  }

  private captureNavigationMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.webMetrics = {
        ...this.webMetrics,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart
      };
      this.logMetric('DOM Content Loaded', this.webMetrics.domContentLoaded);
      this.logMetric('Load Time', this.webMetrics.loadTime);
    }
  }

  private captureLoadMetrics(): void {
    // Capture First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      this.webMetrics = {
        ...this.webMetrics,
        firstContentfulPaint: fcpEntry.startTime
      };
      this.logMetric('FCP', fcpEntry.startTime);
    }

    // Calculate Time to Interactive (simplified)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const tti = navigation.loadEventEnd + 1000; // Simplified TTI calculation
      this.webMetrics = {
        ...this.webMetrics,
        timeToInteractive: tti
      };
      this.logMetric('TTI', tti);
    }
  }

  private logMetric(name: string, value: number): void {
    const status = this.getMetricStatus(name, value);
    if (this.isEnabled) {
      console.log(`🚀 ${name}: ${value.toFixed(2)}ms ${status}`);
    }
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_status: status
      });
    }
  }

  private getMetricStatus(name: string, value: number): string {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      'FCP': { good: 1800, needsImprovement: 3000 },
      'LCP': { good: 2500, needsImprovement: 4000 },
      'FID': { good: 100, needsImprovement: 300 },
      'CLS': { good: 0.1, needsImprovement: 0.25 },
      'TTI': { good: 3800, needsImprovement: 7300 }
    };

    const threshold = thresholds[name];
    if (!threshold) return '';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.needsImprovement) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.webMetrics;
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    if (this.isEnabled) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    return result;
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (this.isEnabled) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    return result;
  }

  public mark(name: string): void {
    performance.mark(name);
  }

  public measure(name: string, startMark: string, endMark: string): void {
    try {
      const measure = performance.measure(name, startMark, endMark);
      console.log(`📊 ${name}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
      console.warn(`Could not measure ${name}:`, error);
    }
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Start timing an operation
  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.customMetrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  // End timing an operation
  endTimer(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.customMetrics.get(name);
    if (!metric) {
      if (this.isEnabled) {
        console.warn(`PerformanceMonitor: No timer found for "${name}"`);
      }
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (this.isEnabled) {
      console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  // Get performance report
  getReport(): PerformanceReport {
    const metrics = Array.from(this.customMetrics.values());
    const durations = metrics
      .map(m => m.duration)
      .filter((d): d is number => d !== undefined);

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;
    const slowestOperation = metrics.reduce((slowest, current) => {
      if (!current.duration) return slowest;
      if (!slowest?.duration) return current;
      return current.duration > slowest.duration ? current : slowest;
    }, null as PerformanceMetric | null);
    const fastestOperation = metrics.reduce((fastest, current) => {
      if (!current.duration) return fastest;
      if (!fastest?.duration) return current;
      return current.duration < fastest.duration ? current : fastest;
    }, null as PerformanceMetric | null);

    return {
      metrics,
      totalDuration,
      averageDuration,
      slowestOperation,
      fastestOperation
    };
  }

  // Clear all metrics
  clear(): void {
    this.customMetrics.clear();
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for common performance tracking
export const trackPageLoad = (pageName: string) => {
  performanceMonitor.startTimer(`page_load_${pageName}`);
  
  // End timer when page is fully loaded
  window.addEventListener('load', () => {
    performanceMonitor.endTimer(`page_load_${pageName}`);
  });
};

export const trackApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  performanceMonitor.startTimer(`api_call_${apiName}`);
  
  try {
    const result = await apiCall();
    performanceMonitor.endTimer(`api_call_${apiName}`);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(`api_call_${apiName}`);
    throw error;
  }
};

export const trackUserInteraction = (interactionName: string, callback: () => void) => {
  performanceMonitor.startTimer(`interaction_${interactionName}`);
  
  try {
    callback();
  } finally {
    performanceMonitor.endTimer(`interaction_${interactionName}`);
  }
};

// React hook for tracking component performance
export const usePerformanceTracking = (componentName: string) => {
  React.useEffect(() => {
    performanceMonitor.startTimer(`component_mount_${componentName}`);
    
    return () => {
      performanceMonitor.endTimer(`component_mount_${componentName}`);
    };
  }, [componentName]);
};

// Navigation performance tracking
export const trackNavigation = (from: string, to: string) => {
  const navigationName = `navigation_${from}_to_${to}`;
  performanceMonitor.startTimer(navigationName);
  
  // End timer after a short delay to allow for route change
  setTimeout(() => {
    performanceMonitor.endTimer(navigationName);
  }, 100);
};

// Form submission tracking
export const trackFormSubmission = async <T>(
  formName: string,
  submitFn: () => Promise<T>
): Promise<T> => {
  return trackApiCall(`form_submission_${formName}`, submitFn);
};

// Export the monitor for direct access
export default performanceMonitor; 