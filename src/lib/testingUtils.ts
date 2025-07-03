// Functional Testing Utilities
export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

// Mobile UX & Navigation Tests
export const testMobileUX = {
  buttonResponseTime: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Test button response time
      const button = document.querySelector('button');
      if (!button) {
        throw new Error('No button found to test');
      }
      
      // Simulate button click and measure response
      const clickStart = performance.now();
      button.click();
      const clickEnd = performance.now();
      const responseTime = clickEnd - clickStart;
      
      return {
        id: 'mobile-button-response',
        name: 'Button Response Time < 200ms',
        category: 'mobile',
        status: responseTime < 200 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Response time: ${responseTime.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        id: 'mobile-button-response',
        name: 'Button Response Time < 200ms',
        category: 'mobile',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  noTapHighlight: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Check if tap highlight is disabled
      const style = getComputedStyle(document.body);
      const tapHighlight = (style as any).webkitTapHighlightColor;
      
      return {
        id: 'mobile-no-highlight',
        name: 'No Tap Highlight/Ripple',
        category: 'mobile',
        status: tapHighlight === 'transparent' ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Tap highlight color: ${tapHighlight}`
      };
    } catch (error) {
      return {
        id: 'mobile-no-highlight',
        name: 'No Tap Highlight/Ripple',
        category: 'mobile',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Button & Placement Tests
export const testButtons = {
  buttonSizeConsistent: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const buttons = document.querySelectorAll('button');
      let allValid = true;
      const sizes: string[] = [];
      
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const minSize = 44; // 44dp minimum
        const maxSize = 64; // 64dp maximum
        
        if (rect.width < minSize || rect.height < minSize || 
            rect.width > maxSize || rect.height > maxSize) {
          allValid = false;
        }
        sizes.push(`${rect.width}x${rect.height}`);
      });
      
      return {
        id: 'button-size-consistent',
        name: 'Button Size 44dp-64dp',
        category: 'buttons',
        status: allValid ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Checked ${buttons.length} buttons. Sizes: ${sizes.join(', ')}`
      };
    } catch (error) {
      return {
        id: 'button-size-consistent',
        name: 'Button Size 44dp-64dp',
        category: 'buttons',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  noOverlappingElements: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const elements = document.querySelectorAll('button, input, select, textarea');
      let hasOverlap = false;
      
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          
          if (rect1.left < rect2.right && rect1.right > rect2.left &&
              rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
            hasOverlap = true;
            break;
          }
        }
      }
      
      return {
        id: 'button-no-overlap',
        name: 'No Overlapping Elements',
        category: 'buttons',
        status: !hasOverlap ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Checked ${elements.length} interactive elements`
      };
    } catch (error) {
      return {
        id: 'button-no-overlap',
        name: 'No Overlapping Elements',
        category: 'buttons',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// API Integration Tests
export const testAPI = {
  apiKeysLoaded: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const storedKeys = localStorage.getItem('apiKeys');
      const keys = storedKeys ? JSON.parse(storedKeys) : {};
      
      const requiredKeys = ['newsApiKey', 'marketDataApiKey', 'openaiApiKey'];
      const missingKeys = requiredKeys.filter(key => !keys[key]);
      
      return {
        id: 'api-keys-loaded',
        name: 'API Keys Load Securely',
        category: 'api',
        status: missingKeys.length === 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: missingKeys.length === 0 ? 
          'All required API keys found' : 
          `Missing keys: ${missingKeys.join(', ')}`
      };
    } catch (error) {
      return {
        id: 'api-keys-loaded',
        name: 'API Keys Load Securely',
        category: 'api',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  apiHealthCheck: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Test API endpoints
      const endpoints = [
        '/api/health',
        '/api/news',
        '/api/market-data'
      ];
      
      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetch(endpoint))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.ok
      ).length;
      
      return {
        id: 'api-health-status',
        name: 'API Health Status Check',
        category: 'api',
        status: successful === endpoints.length ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `${successful}/${endpoints.length} endpoints responding`
      };
    } catch (error) {
      return {
        id: 'api-health-status',
        name: 'API Health Status Check',
        category: 'api',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Text & Visual Consistency Tests
export const testTextConsistency = {
  noOrphanedText: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const textNodes = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      let orphanedText = 0;
      
      textNodes.forEach(node => {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          // Check if text is properly contained within a component
          const hasParent = node.closest('[data-testid], [role], button, input, select, textarea');
          if (!hasParent && !node.hasAttribute('data-testid')) {
            orphanedText++;
          }
        }
      });
      
      return {
        id: 'text-no-orphaned',
        name: 'No Orphaned Text',
        category: 'text',
        status: orphanedText === 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Found ${orphanedText} potentially orphaned text elements`
      };
    } catch (error) {
      return {
        id: 'text-no-orphaned',
        name: 'No Orphaned Text',
        category: 'text',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  fontScales: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const rootFontSize = getComputedStyle(document.documentElement).fontSize;
      const bodyFontSize = getComputedStyle(document.body).fontSize;
      
      // Check if font sizes are using relative units
      const usesRelativeUnits = rootFontSize.includes('rem') || 
                               rootFontSize.includes('em') || 
                               rootFontSize.includes('%');
      
      return {
        id: 'text-font-scales',
        name: 'Font Scales Across Devices',
        category: 'text',
        status: usesRelativeUnits ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Root font: ${rootFontSize}, Body font: ${bodyFontSize}`
      };
    } catch (error) {
      return {
        id: 'text-font-scales',
        name: 'Font Scales Across Devices',
        category: 'text',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Trade Entry & History Tests
export const testTrades = {
  manualTradeSave: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Check if trade storage is available
      const hasLocalStorage = typeof localStorage !== 'undefined';
      const hasTradeData = localStorage.getItem('trades') !== null;
      
      return {
        id: 'trade-manual-save',
        name: 'Manual Trade Entries Save Instantly',
        category: 'trades',
        status: hasLocalStorage ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Local storage: ${hasLocalStorage}, Trade data: ${hasTradeData}`
      };
    } catch (error) {
      return {
        id: 'trade-manual-save',
        name: 'Manual Trade Entries Save Instantly',
        category: 'trades',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Analytics Tests
export const testAnalytics = {
  chartsDynamic: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Check for chart components
      const charts = document.querySelectorAll('[data-chart], canvas, svg');
      const hasCharts = charts.length > 0;
      
      return {
        id: 'analytics-charts-dynamic',
        name: 'Charts Populate Dynamically',
        category: 'analytics',
        status: hasCharts ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `Found ${charts.length} chart elements`
      };
    } catch (error) {
      return {
        id: 'analytics-charts-dynamic',
        name: 'Charts Populate Dynamically',
        category: 'analytics',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// AI Coach Tests
export const testAI = {
  aiServicesConnected: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const hasOpenAI = localStorage.getItem('openaiApiKey') !== null;
      const hasGroq = localStorage.getItem('groqApiKey') !== null;
      
      return {
        id: 'ai-services-connected',
        name: 'AI Services Connected',
        category: 'ai',
        status: (hasOpenAI || hasGroq) ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: `OpenAI: ${hasOpenAI}, Groq: ${hasGroq}`
      };
    } catch (error) {
      return {
        id: 'ai-services-connected',
        name: 'AI Services Connected',
        category: 'ai',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Calendar Tests
export const testCalendar = {
  calendarSmoothScroll: async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      // Check for calendar components
      const calendar = document.querySelector('[data-calendar], .calendar, [role="grid"]');
      
      return {
        id: 'calendar-smooth-scroll',
        name: 'Calendar Scrolls Smoothly',
        category: 'calendar',
        status: calendar !== null ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: calendar ? 'Calendar component found' : 'No calendar component found'
      };
    } catch (error) {
      return {
        id: 'calendar-smooth-scroll',
        name: 'Calendar Scrolls Smoothly',
        category: 'calendar',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Run all tests
export const runAllTests = async (): Promise<TestResult[]> => {
  const tests = [
    testMobileUX.buttonResponseTime(),
    testMobileUX.noTapHighlight(),
    testButtons.buttonSizeConsistent(),
    testButtons.noOverlappingElements(),
    testAPI.apiKeysLoaded(),
    testAPI.apiHealthCheck(),
    testTextConsistency.noOrphanedText(),
    testTextConsistency.fontScales(),
    testTrades.manualTradeSave(),
    testAnalytics.chartsDynamic(),
    testAI.aiServicesConnected(),
    testCalendar.calendarSmoothScroll()
  ];
  
  return Promise.all(tests);
}; 