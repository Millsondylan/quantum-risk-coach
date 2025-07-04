import { toast } from 'sonner';

interface PlaceholderOptions {
  title?: string;
  description?: string;
  action?: string;
  comingSoon?: boolean;
  premium?: boolean;
  requiresSetup?: boolean;
}

export class PlaceholderService {
  private static instance: PlaceholderService;

  public static getInstance(): PlaceholderService {
    if (!PlaceholderService.instance) {
      PlaceholderService.instance = new PlaceholderService();
    }
    return PlaceholderService.instance;
  }

  // Common placeholder messages
  public showFeaturePlaceholder(feature: string, options: PlaceholderOptions = {}) {
    const { 
      title = feature,
      description = 'This feature is currently in development',
      action = 'will be available soon',
      comingSoon = true,
      premium = false,
      requiresSetup = false
    } = options;

    let message = `${title}: ${description}`;
    let icon = '🚀';

    if (premium) {
      message = `${title}: Premium feature - ${action}`;
      icon = '⭐';
    } else if (requiresSetup) {
      message = `${title}: Requires setup - ${action}`;
      icon = '⚙️';
    } else if (comingSoon) {
      message = `${title}: Coming soon - ${action}`;
      icon = '🔧';
    }

    toast.info(message, {
      icon,
      duration: 3000,
    });
  }

  // Specific placeholder methods for common scenarios
  public showComingSoon(feature: string) {
    this.showFeaturePlaceholder(feature, {
      description: 'This feature is coming soon',
      action: 'stay tuned for updates!',
      comingSoon: true
    });
  }

  public showRequiresSetup(feature: string, setupAction: string = 'configure in settings') {
    this.showFeaturePlaceholder(feature, {
      description: 'Requires additional setup',
      action: setupAction,
      requiresSetup: true
    });
  }

  public showPremiumFeature(feature: string) {
    this.showFeaturePlaceholder(feature, {
      description: 'Premium feature',
      action: 'upgrade to unlock',
      premium: true
    });
  }

  public showDemoData(feature: string) {
    this.showFeaturePlaceholder(feature, {
      description: 'Showing demo data',
      action: 'connect real data provider for live data',
      requiresSetup: true
    });
  }

  public showDataConnection(feature: string) {
    this.showFeaturePlaceholder(feature, {
      description: 'Requires data connection',
      action: 'connect data provider in settings',
      requiresSetup: true
    });
  }

  public showAPIConnection(feature: string, service: string) {
    this.showFeaturePlaceholder(feature, {
      description: `Requires ${service} API connection`,
      action: 'configure API keys in settings',
      requiresSetup: true
    });
  }

  // Interactive placeholders with actions
  public showWithAction(feature: string, actionText: string, actionFn: () => void) {
    toast.info(`${feature}: Click to ${actionText}`, {
      icon: '👆',
      duration: 4000,
      action: {
        label: actionText,
        onClick: actionFn
      }
    });
  }

  // Development mode placeholders
  public showDevelopmentFeature(feature: string, progress: number = 0) {
    const progressText = progress > 0 ? ` (${progress}% complete)` : '';
    this.showFeaturePlaceholder(feature, {
      description: `In development${progressText}`,
      action: 'coming in next update',
      comingSoon: true
    });
  }

  // Button placeholder helper
  public createButtonPlaceholder(feature: string, options: PlaceholderOptions = {}) {
    return () => this.showFeaturePlaceholder(feature, options);
  }

  // Navigation placeholder
  public showNavigation(destination: string, available: boolean = false) {
    if (available) {
      window.location.href = destination;
    } else {
      this.showComingSoon(`Navigation to ${destination}`);
    }
  }

  // Success simulation
  public showSuccess(action: string, realistic: boolean = true) {
    if (realistic) {
      setTimeout(() => {
        toast.success(`${action} completed successfully!`, {
          icon: '✅'
        });
      }, Math.random() * 1000 + 500); // 0.5-1.5s delay
    } else {
      toast.success(`${action} completed!`);
    }
  }

  // Loading simulation
  public showLoading(action: string, duration: number = 2000) {
    toast.loading(`${action}...`, {
      duration
    });
    
    setTimeout(() => {
      this.showSuccess(action);
    }, duration);
  }

  // Error simulation
  public showError(action: string, reason: string = 'Please try again') {
    toast.error(`${action} failed: ${reason}`, {
      icon: '❌'
    });
  }

  // Feature discovery
  public showDiscovery(feature: string, location: string) {
    this.showWithAction(
      feature,
      `Go to ${location}`,
      () => {
        window.location.href = location;
      }
    );
  }
}

// Export singleton instance
export const placeholderService = PlaceholderService.getInstance();

// Helper functions for common use cases
export const showComingSoon = (feature: string) => placeholderService.showComingSoon(feature);
export const showRequiresSetup = (feature: string, setup?: string) => placeholderService.showRequiresSetup(feature, setup);
export const showPremiumFeature = (feature: string) => placeholderService.showPremiumFeature(feature);
export const showDemoData = (feature: string) => placeholderService.showDemoData(feature);
export const showDataConnection = (feature: string) => placeholderService.showDataConnection(feature);
export const showAPIConnection = (feature: string, service: string) => placeholderService.showAPIConnection(feature, service);
export const createButtonPlaceholder = (feature: string, options?: PlaceholderOptions) => 
  placeholderService.createButtonPlaceholder(feature, options);

// Specific trading app placeholders
export const tradingPlaceholders = {
  liveData: () => showDataConnection('Live Market Data'),
  realTimeAlerts: () => showComingSoon('Real-time Trading Alerts'),
  advancedAnalytics: () => showComingSoon('Advanced Analytics'),
  socialTrading: () => showComingSoon('Social Trading Features'),
  portfolioOptimization: () => showComingSoon('Portfolio Optimization'),
  riskManagement: () => showComingSoon('Advanced Risk Management'),
  backtesting: () => placeholderService.showDevelopmentFeature('Advanced Backtesting', 80),
  paperTrading: () => showComingSoon('Paper Trading'),
  marketScanner: () => showRequiresSetup('Market Scanner', 'connect data provider'),
  newsIntegration: () => showAPIConnection('News Integration', 'news provider'),
  economicCalendar: () => showComingSoon('Economic Calendar'),
  chartingTools: () => showComingSoon('Advanced Charting'),
  mobileAlerts: () => showComingSoon('Mobile Push Alerts'),
  cloudSync: () => showComingSoon('Cloud Synchronization'),
  multiAccount: () => showPremiumFeature('Multi-Account Management'),
  advancedReports: () => showPremiumFeature('Advanced Reporting'),
  customIndicators: () => showPremiumFeature('Custom Indicators'),
  algorithmicTrading: () => showPremiumFeature('Algorithmic Trading'),
}; 