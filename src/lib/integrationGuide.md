# Integration Guide: Latest 2024-2025 AI Trading Technologies

This guide explains how to integrate the new **AI Stream Service** and **Enhanced WebSocket Service** into your Qlarity app.

## Overview of New Services

### 1. AI Stream Service
- **Resumable, persistent AI analysis streams**
- **Multi-agent architecture** with specialized trading experts
- **Session management** with localStorage persistence
- **Real-time streaming** AI insights
- **Event-driven architecture** for reactive updates

### 2. Enhanced WebSocket Service
- **Advanced WebSocket implementation** with automatic reconnection
- **Message queuing** for offline reliability
- **Multi-symbol subscription** management
- **Binary protocol support** for high-frequency data
- **Mobile-optimized** with visibility change handling

## Quick Start Integration

### Step 1: Import the Services

```typescript
// In your component or service file
import { createAIStreamService, AIStreamContext } from '@/lib/aiStreamService';
import { createEnhancedWebSocket } from '@/lib/enhancedWebSocketService';
```

### Step 2: Initialize Services

```typescript
// Initialize AI Stream Service
const aiStreamService = createAIStreamService({
  provider: 'openai', // or 'groq'
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  resumable: true,
  persistToStorage: true
});

// Initialize Enhanced WebSocket for trading data
const tradingWebSocket = createEnhancedWebSocket('trading', {
  url: 'wss://stream.data.alpaca.markets/v2/iex',
  autoReconnect: true,
  mobileOptimizations: true,
  binaryProtocol: true
});
```

## Practical Implementation Examples

### Example 1: Real-time AI Market Analysis

```typescript
import React, { useEffect, useState } from 'react';
import { createAIStreamService, StreamMessage } from '@/lib/aiStreamService';

const AIMarketAnalysis: React.FC = () => {
  const [aiService] = useState(() => createAIStreamService());
  const [analysis, setAnalysis] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Set up AI stream listeners
    const handleStreamMessage = (event: CustomEvent<StreamMessage>) => {
      const message = event.detail;
      
      if (message.type === 'chunk') {
        setAnalysis(prev => prev + message.content);
      } else if (message.type === 'complete') {
        console.log(`Analysis complete from ${message.agent?.name}`);
      }
    };

    const handleStreamCompleted = (event: CustomEvent) => {
      console.log('All agents completed analysis');
    };

    aiService.addEventListener('stream-message', handleStreamMessage);
    aiService.addEventListener('stream-completed', handleStreamCompleted);

    return () => {
      aiService.removeEventListener('stream-message', handleStreamMessage);
      aiService.removeEventListener('stream-completed', handleStreamCompleted);
    };
  }, [aiService]);

  const startAnalysis = async () => {
    const context: AIStreamContext = {
      userId: 'user_123',
      sessionId: sessionId || `session_${Date.now()}`,
      analysisType: 'market_analysis',
      timeframe: '1h',
      symbols: ['EURUSD', 'GBPUSD', 'BTCUSD'],
      marketData: {
        // Your current market data
        timestamp: new Date().toISOString(),
        symbols: ['EURUSD', 'GBPUSD']
      }
    };

    try {
      const newSessionId = await aiService.startAnalysisStream(context);
      setSessionId(newSessionId);
      setAnalysis(''); // Clear previous analysis
    } catch (error) {
      console.error('Failed to start AI analysis:', error);
    }
  };

  const pauseAnalysis = () => {
    if (sessionId) {
      aiService.pauseStream(sessionId);
    }
  };

  const resumeAnalysis = async () => {
    if (sessionId) {
      await aiService.resumeStream(sessionId);
    }
  };

  return (
    <div className="ai-market-analysis">
      <div className="controls">
        <button onClick={startAnalysis}>Start AI Analysis</button>
        <button onClick={pauseAnalysis}>Pause</button>
        <button onClick={resumeAnalysis}>Resume</button>
      </div>
      
      <div className="analysis-output">
        <h3>Live AI Analysis</h3>
        <pre>{analysis}</pre>
      </div>
      
      <div className="session-info">
        {sessionId && <p>Session: {sessionId}</p>}
      </div>
    </div>
  );
};
```

### Example 2: Enhanced Real-time Price Feeds

```typescript
import React, { useEffect, useState } from 'react';
import { createEnhancedWebSocket } from '@/lib/enhancedWebSocketService';

const EnhancedPriceFeed: React.FC = () => {
  const [wsService] = useState(() => createEnhancedWebSocket('trading', {
    url: 'wss://stream.data.alpaca.markets/v2/iex',
    autoReconnect: true,
    mobileOptimizations: true,
    debug: true
  }));

  const [prices, setPrices] = useState<Record<string, any>>({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Connection event handlers
    wsService.addEventListener('connected', () => {
      setConnectionStatus('connected');
      console.log('Enhanced WebSocket connected');
    });

    wsService.addEventListener('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    wsService.addEventListener('message', (event: CustomEvent) => {
      const message = event.detail;
      
      if (message.symbol) {
        setPrices(prev => ({
          ...prev,
          [message.symbol]: {
            ...message.data,
            timestamp: message.timestamp
          }
        }));
      }
    });

    wsService.addEventListener('stats-update', (event: CustomEvent) => {
      setStats(event.detail.stats);
    });

    wsService.addEventListener('quality-change', (event: CustomEvent) => {
      console.log('Connection quality changed:', event.detail.quality);
    });

    // Connect and subscribe
    wsService.connect();
    
    // Subscribe to symbols
    wsService.subscribe('AAPL', ['trade', 'quote']);
    wsService.subscribe('TSLA', ['trade', 'quote']);
    wsService.subscribe('EURUSD', ['trade', 'quote']);

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  return (
    <div className="enhanced-price-feed">
      <div className="connection-status">
        Status: <span className={connectionStatus}>{connectionStatus}</span>
      </div>
      
      <div className="statistics">
        <p>Messages Received: {stats.messagesReceived || 0}</p>
        <p>Average Latency: {(stats.averageLatency || 0).toFixed(2)}ms</p>
        <p>Uptime: {Math.round((stats.totalUptime || 0) / 1000)}s</p>
      </div>

      <div className="price-grid">
        {Object.entries(prices).map(([symbol, data]) => (
          <div key={symbol} className="price-card">
            <h4>{symbol}</h4>
            <p>Price: {data.price || data.c}</p>
            <p>Change: {data.change || data.dp}%</p>
            <small>Updated: {new Date(data.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Example 3: Integrated AI + Real-time Trading Dashboard

```typescript
import React, { useEffect, useState } from 'react';
import { createAIStreamService, AIStreamContext } from '@/lib/aiStreamService';
import { createEnhancedWebSocket } from '@/lib/enhancedWebSocketService';

const IntegratedTradingDashboard: React.FC = () => {
  const [aiService] = useState(() => createAIStreamService());
  const [wsService] = useState(() => createEnhancedWebSocket('trading'));
  
  const [marketData, setMarketData] = useState<any>({});
  const [aiInsights, setAiInsights] = useState<string>('');
  const [activeSession, setActiveSession] = useState<string | null>(null);

  useEffect(() => {
    // WebSocket setup for real-time data
    wsService.addEventListener('message', (event: CustomEvent) => {
      const message = event.detail;
      if (message.symbol) {
        setMarketData(prev => ({
          ...prev,
          [message.symbol]: message.data
        }));
        
        // Trigger AI analysis when significant price movement
        if (message.data.change && Math.abs(message.data.change) > 0.5) {
          triggerAIAnalysis();
        }
      }
    });

    // AI Stream setup
    aiService.addEventListener('stream-message', (event: CustomEvent) => {
      const message = event.detail;
      if (message.type === 'complete') {
        setAiInsights(prev => 
          prev + `\n\n[${message.agent?.name}]: ${message.content}`
        );
      }
    });

    wsService.connect();
    wsService.subscribe('EURUSD', ['trade']);
    wsService.subscribe('GBPUSD', ['trade']);

    return () => {
      wsService.disconnect();
      if (activeSession) {
        aiService.stopStream(activeSession);
      }
    };
  }, []);

  const triggerAIAnalysis = async () => {
    if (activeSession) {
      // Already analyzing
      return;
    }

    const context: AIStreamContext = {
      userId: 'user_123',
      sessionId: `analysis_${Date.now()}`,
      analysisType: 'market_analysis',
      timeframe: '5m',
      symbols: Object.keys(marketData),
      marketData: marketData
    };

    try {
      const sessionId = await aiService.startAnalysisStream(context);
      setActiveSession(sessionId);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  return (
    <div className="integrated-dashboard">
      <div className="market-data-section">
        <h3>Real-time Market Data</h3>
        {Object.entries(marketData).map(([symbol, data]: [string, any]) => (
          <div key={symbol} className="market-item">
            <span>{symbol}</span>
            <span>{data.price}</span>
            <span className={data.change > 0 ? 'positive' : 'negative'}>
              {data.change}%
            </span>
          </div>
        ))}
      </div>

      <div className="ai-insights-section">
        <h3>AI Insights Stream</h3>
        <div className="insights-container">
          <pre>{aiInsights}</pre>
        </div>
        <button 
          onClick={triggerAIAnalysis}
          disabled={!!activeSession}
        >
          {activeSession ? 'Analyzing...' : 'Start AI Analysis'}
        </button>
      </div>
    </div>
  );
};
```

## Integration with Existing Components

### Update Your Notifications Component

```typescript
// In src/components/NotificationsAlerts.tsx
import { createEnhancedWebSocket } from '@/lib/enhancedWebSocketService';

// Add to your existing NotificationsAlerts component
const wsService = createEnhancedWebSocket('trading', {
  url: 'wss://stream.data.alpaca.markets/v2/iex'
});

// Enhanced price alert checking
const setupEnhancedPriceAlerts = () => {
  wsService.addEventListener('message', (event: CustomEvent) => {
    const message = event.detail;
    if (message.symbol && message.data.price) {
      checkPriceAlerts(message.symbol, message.data.price);
    }
  });

  wsService.connect();
  
  // Subscribe to symbols from your alerts
  alerts.forEach(alert => {
    wsService.subscribe(alert.symbol, ['trade']);
  });
};
```

### Update Your Dashboard Component

```typescript
// In src/pages/Index.tsx
import { createAIStreamService } from '@/lib/aiStreamService';

// Add AI coaching stream to your dashboard
const aiCoach = createAIStreamService({
  provider: 'openai',
  resumable: true,
  persistToStorage: true
});

// Start continuous market monitoring
const startAICoaching = async () => {
  const context = {
    userId: user.id,
    sessionId: `coaching_${Date.now()}`,
    analysisType: 'market_analysis',
    timeframe: '1h',
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY']
  };

  await aiCoach.startAnalysisStream(context);
};
```

## Configuration Options

### AI Stream Service Configuration

```typescript
const config = {
  provider: 'openai' | 'groq' | 'claude',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
  streamChunkSize: 50,
  resumable: true,
  persistToStorage: true
};
```

### Enhanced WebSocket Configuration

```typescript
const config = {
  url: 'wss://your-websocket-endpoint',
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  messageQueueSize: 1000,
  binaryProtocol: false,
  mobileOptimizations: true,
  exponentialBackoff: true,
  rateLimitPerSecond: 100,
  enableStatistics: true,
  persistSubscriptions: true
};
```

## Best Practices

### 1. Error Handling

```typescript
// Always handle errors gracefully
aiService.addEventListener('stream-error', (event: CustomEvent) => {
  console.error('AI Stream error:', event.detail.error);
  // Show user-friendly error message
  toast.error('AI analysis temporarily unavailable');
});

wsService.addEventListener('error', (event: CustomEvent) => {
  console.error('WebSocket error:', event.detail.error);
  // Implement fallback data source
});
```

### 2. Resource Management

```typescript
// Clean up resources when component unmounts
useEffect(() => {
  return () => {
    aiService.clearSessions();
    wsService.disconnect();
  };
}, []);
```

### 3. Performance Optimization

```typescript
// Use React.memo for components that receive frequent updates
const PriceDisplay = React.memo(({ symbol, price }) => (
  <div>{symbol}: {price}</div>
));

// Throttle AI analysis triggers
const throttledAnalysis = useCallback(
  throttle(triggerAIAnalysis, 5000),
  []
);
```

## Migration from Existing Code

### Replace Basic WebSocket with Enhanced Version

```typescript
// Old way
const ws = new WebSocket('wss://api.example.com');

// New enhanced way
const wsService = createEnhancedWebSocket('trading', {
  url: 'wss://api.example.com',
  autoReconnect: true,
  mobileOptimizations: true
});
```

### Upgrade AI Calls to Streaming

```typescript
// Old way - single AI request
const insight = await getTradingInsight(tradeData, userProfile);

// New way - streaming AI analysis
const sessionId = await aiService.startAnalysisStream({
  userId: user.id,
  analysisType: 'trade_review',
  symbols: ['EURUSD'],
  recentTrades: [tradeData]
});
```

## Testing the Integration

1. **AI Stream Service Testing**:
   ```javascript
   // Test resumable sessions
   const sessionId = await aiService.startAnalysisStream(context);
   aiService.pauseStream(sessionId);
   await aiService.resumeStream(sessionId);
   ```

2. **WebSocket Service Testing**:
   ```javascript
   // Test reconnection
   wsService.connect();
   wsService.disconnect();
   wsService.connect(); // Should auto-reconnect
   ```

## Next Steps

1. **Implement gradually** - Start with one component at a time
2. **Monitor performance** - Use the built-in statistics and events
3. **Customize for your needs** - Adjust configurations based on your specific requirements
4. **Add error handling** - Implement robust error handling and fallbacks
5. **Test thoroughly** - Test on different devices and network conditions

These new services provide cutting-edge capabilities that will significantly enhance your app's competitiveness with the latest 2024-2025 AI trading technologies! 