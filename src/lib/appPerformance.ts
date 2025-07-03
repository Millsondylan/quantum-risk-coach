// App performance monitoring utilities

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

class AppPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  // Start timing an operation
  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  // End timing an operation
  endTimer(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`AppPerformanceMonitor: No timer found for "${name}"`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  // Get performance report
  getReport(): PerformanceReport {
    const metrics = Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
    
    if (metrics.length === 0) {
      return {
        metrics: [],
        totalDuration: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null
      };
    }

    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / metrics.length;
    const slowestOperation = metrics.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );
    const fastestOperation = metrics.reduce((fastest, current) => 
      (current.duration || 0) < (fastest.duration || 0) ? current : fastest
    );

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
    this.metrics.clear();
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Global performance monitor instance
export const appPerformanceMonitor = new AppPerformanceMonitor();

// Utility functions for common performance tracking
export const trackPageLoad = (pageName: string) => {
  appPerformanceMonitor.startTimer(`page_load_${pageName}`);
  
  // End timer when page is fully loaded
  window.addEventListener('load', () => {
    appPerformanceMonitor.endTimer(`page_load_${pageName}`);
  });
};

export const trackApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  appPerformanceMonitor.startTimer(`api_call_${apiName}`);
  
  try {
    const result = await apiCall();
    appPerformanceMonitor.endTimer(`api_call_${apiName}`);
    return result;
  } catch (error) {
    appPerformanceMonitor.endTimer(`api_call_${apiName}`);
    throw error;
  }
};

export const trackUserInteraction = (interactionName: string, callback: () => void) => {
  appPerformanceMonitor.startTimer(`interaction_${interactionName}`);
  
  try {
    callback();
  } finally {
    appPerformanceMonitor.endTimer(`interaction_${interactionName}`);
  }
};

// Navigation performance tracking
export const trackNavigation = (from: string, to: string) => {
  const navigationName = `navigation_${from}_to_${to}`;
  appPerformanceMonitor.startTimer(navigationName);
  
  // End timer after a short delay to allow for route change
  setTimeout(() => {
    appPerformanceMonitor.endTimer(navigationName);
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
export default appPerformanceMonitor; 