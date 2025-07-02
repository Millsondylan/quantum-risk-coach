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

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics | null = null;
  private observers: Map<string, PerformanceObserver> = new Map();

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
            this.metrics = {
              ...this.metrics,
              largestContentfulPaint: lastEntry.startTime
            };
            this.logMetric('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const firstInputEntry = entry as FirstInputEntry;
            this.metrics = {
              ...this.metrics,
              firstInputDelay: firstInputEntry.processingStart - firstInputEntry.startTime
            };
            this.logMetric('FID', firstInputEntry.processingStart - firstInputEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
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
          this.metrics = {
            ...this.metrics,
            cumulativeLayoutShift: clsValue
          };
          this.logMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
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
      this.metrics = {
        ...this.metrics,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart
      };
      this.logMetric('DOM Content Loaded', this.metrics.domContentLoaded);
      this.logMetric('Load Time', this.metrics.loadTime);
    }
  }

  private captureLoadMetrics(): void {
    // Capture First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      this.metrics = {
        ...this.metrics,
        firstContentfulPaint: fcpEntry.startTime
      };
      this.logMetric('FCP', fcpEntry.startTime);
    }

    // Calculate Time to Interactive (simplified)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const tti = navigation.loadEventEnd + 1000; // Simplified TTI calculation
      this.metrics = {
        ...this.metrics,
        timeToInteractive: tti
      };
      this.logMetric('TTI', tti);
    }
  }

  private logMetric(name: string, value: number): void {
    const status = this.getMetricStatus(name, value);
    console.log(`🚀 ${name}: ${value.toFixed(2)}ms ${status}`);
    
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
    return this.metrics;
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
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
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 