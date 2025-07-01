/**
 * Enhanced WebSocket Service - Latest 2024-2025 Real-time Communication Protocols
 * 
 * Features:
 * - Advanced WebSocket implementation with automatic reconnection
 * - Message queuing for offline reliability
 * - Multi-symbol subscription management
 * - Binary protocol support for high-frequency data
 * - Connection health monitoring with heartbeat
 * - Mobile-optimized with visibility change handling
 * - Exponential backoff reconnection strategy
 * - Comprehensive error handling and statistics tracking
 */

import { toast } from 'sonner';

export type MarketDataType = 'price' | 'depth' | 'trades' | 'news' | 'sentiment';

export interface MarketSubscription {
  id: string;
  symbol: string;
  type: MarketDataType;
  callback: (data: any) => void;
  isActive: boolean;
  subscribeTime: number;
  lastDataTime: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  apiKey?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
  binaryProtocol?: boolean;
  rateLimitPerSecond?: number;
  autoReconnect?: boolean;
  debug?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SubscriptionRequest {
  action: 'subscribe' | 'unsubscribe';
  symbols: string[];
  channels: string[];
  frequency?: 'realtime' | 'throttled' | 'snapshot';
  compression?: boolean;
  format?: 'json' | 'binary' | 'protobuf';
}

export interface MarketDataMessage {
  type: 'price' | 'orderbook' | 'trade' | 'news' | 'sentiment';
  symbol: string;
  timestamp: number;
  data: any;
  sequence?: number;
  checksum?: string;
}

export interface ConnectionStats {
  connectTime: number;
  disconnectTime?: number;
  messagesSent: number;
  messagesReceived: number;
  errorsCount: number;
  reconnectCount: number;
  totalUptime: number;
  averageLatency: number;
  bytesSent: number;
  bytesReceived: number;
  subscriptions: Map<string, SubscriptionMetrics>;
}

export interface SubscriptionMetrics {
  symbol: string;
  subscribedAt: number;
  messagesReceived: number;
  lastMessageTime?: number;
  dataSize: number;
  errorCount: number;
}

export interface QueuedMessage {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface EnhancedWebSocketConfig {
  url: string;
  protocols?: string[];
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  messageQueueSize: number;
  binaryProtocol: boolean;
  compressionEnabled: boolean;
  subscriptionManager: boolean;
  debug: boolean;
  mobileOptimizations: boolean;
  exponentialBackoff: boolean;
  connectionTimeout: number;
  pingTimeout: number;
  maxLatency: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bufferSize: number;
  rateLimitPerSecond: number;
  enableStatistics: boolean;
  persistSubscriptions: boolean;
}

export interface WebSocketMessage {
  id: string;
  type: string;
  symbol?: string;
  data: any;
  timestamp: number;
  sequence?: number;
  compressed?: boolean;
  binary?: boolean;
}

export interface Subscription {
  id: string;
  symbol: string;
  channel: string;
  active: boolean;
  subscribed: Date;
  lastUpdate?: Date;
  messageCount: number;
}

export interface ConnectionHealth {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number;
  reconnectCount: number;
  messagesSent: number;
  messagesReceived: number;
  lastHeartbeat?: Date;
  errorCount: number;
}

export class EnhancedWebSocketService extends EventTarget {
  private static instance: EnhancedWebSocketService;
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions = new Map<string, Subscription>();
  private messageQueue = new Map<string, QueuedMessage>();
  private connectionHealth: ConnectionHealth;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private lastPongReceived = 0;
  private connectionId = '';
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private heartbeatInterval: number;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private messageQueueSize: number;
  private binaryProtocol: boolean;
  private mobileOptimizations: boolean;
  private exponentialBackoff: boolean;
  private connectionTimeout: number;
  private pingTimeout: number;
  private maxLatency: number;
  private connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  private isPageHidden = false;
  private messageSequence = 0;
  private pendingPings = new Map<string, number>();
  private rateLimitTokens = 0;
  private lastRateLimitRefill = Date.now();
  private stats: ConnectionStats;
  private lastPingTime = 0;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueueSize: 1000,
      binaryProtocol: false,
      ...config
    };

    this.connectionHealth = {
      status: 'disconnected',
      latency: 0,
      reconnectCount: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errorCount: 0
    };

    this.heartbeatInterval = this.config.heartbeatInterval || 30000;
    this.reconnectInterval = this.config.reconnectInterval || 5000;
    this.maxReconnectAttempts = this.config.maxReconnectAttempts || 10;
    this.messageQueueSize = this.config.messageQueueSize || 1000;
    this.binaryProtocol = this.config.binaryProtocol || false;
    this.mobileOptimizations = true;
    this.exponentialBackoff = true;
    this.connectionTimeout = 10000;
    this.pingTimeout = 5000;
    this.maxLatency = 1000;

    this.stats = {
      connectTime: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errorsCount: 0,
      reconnectCount: 0,
      totalUptime: 0,
      averageLatency: 0,
      bytesSent: 0,
      bytesReceived: 0,
      subscriptions: new Map()
    };

    this.setupMobileOptimizations();
    this.setupRateLimiting();
  }

  public static getInstance(config?: Partial<WebSocketConfig>): EnhancedWebSocketService {
    if (!EnhancedWebSocketService.instance) {
      EnhancedWebSocketService.instance = new EnhancedWebSocketService(config as WebSocketConfig);
    }
    return EnhancedWebSocketService.instance;
  }

  private setupMobileOptimizations() {
    if (!this.mobileOptimizations) return;

    // Handle page visibility changes for mobile battery optimization
    document.addEventListener('visibilitychange', () => {
      this.isPageHidden = document.hidden;
      
      if (this.isPageHidden) {
        // Page hidden - reduce activity but maintain connection
        this.adjustForBackgroundMode();
      } else {
        // Page visible - resume normal activity
        this.adjustForForegroundMode();
      }
    });

    // Handle network state changes
    if ('navigator' in window && 'onLine' in navigator) {
      window.addEventListener('online', () => {
        this.log('Network came online');
        if (this.connectionState === 'disconnected') {
          this.connect();
        }
      });

      window.addEventListener('offline', () => {
        this.log('Network went offline');
        this.handleNetworkDisconnect();
      });
    }

    // Handle app state changes (Capacitor/PhoneGap)
    if ('device' in window) {
      document.addEventListener('pause', () => {
        this.handleAppPause();
      });

      document.addEventListener('resume', () => {
        this.handleAppResume();
      });
    }
  }

  private setupRateLimiting() {
    this.rateLimitTokens = this.config.rateLimitPerSecond || 100;
    
    setInterval(() => {
      const now = Date.now();
      const timeDiff = now - this.lastRateLimitRefill;
      const tokensToAdd = Math.floor(timeDiff * this.rateLimitTokens / 1000);
      
      this.rateLimitTokens = Math.min(
        this.rateLimitTokens,
        this.rateLimitTokens + tokensToAdd
      );
      
      this.lastRateLimitRefill = now;
    }, 100); // Check every 100ms
  }

  public async connect(): Promise<boolean> {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return true;
      }

      this.connectionHealth.status = 'connecting';
      this.connectionId = this.generateConnectionId();

      // Enhanced URL with connection parameters
      const url = this.buildConnectionUrl();
      
      // Support for binary protocol
      const protocols = this.binaryProtocol 
        ? ['binary', 'text'] 
        : this.config.protocols || [];

      this.ws = new WebSocket(url, protocols);
      
      // Set binary type for binary protocol support
      if (this.binaryProtocol) {
        this.ws.binaryType = 'arraybuffer';
      }

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        const connectTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.connectionTimeout);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.onConnectionOpen();
          resolve(true);
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          this.onConnectionError(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.onMessage(event);
        };

        this.ws.onclose = (event) => {
          this.onConnectionClose(event);
        };
      });
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.connectionHealth.status = 'error';
      this.connectionHealth.errorCount++;
      throw error;
    }
  }

  private onConnectionOpen(): void {
    console.log('WebSocket connected successfully');
    
    this.connectionHealth.status = 'connected';
    this.reconnectAttempts = 0;
    this.isManualClose = false;
    this.stats.connectTime = Date.now();
    this.stats.reconnectCount = this.reconnectAttempts;

    this.startHeartbeat();
    this.processMessageQueue();
    this.resubscribeAll();
    this.updateConnectionQuality('excellent');

    this.dispatchEvent(new CustomEvent('connection_open', {
      detail: { connectionId: this.connectionId }
    }) as any);

    // Emit statistics update
    this.dispatchEvent(new CustomEvent('stats-update', {
      detail: { stats: this.stats }
    }));
  }

  private onConnectionError(error: Event): void {
    console.error('WebSocket error:', error);
    
    this.connectionHealth.status = 'error';
    this.connectionHealth.errorCount++;

    this.dispatchEvent(new CustomEvent('connection_error', {
      detail: { error, connectionHealth: this.connectionHealth }
    }) as any);
  }

  private onConnectionClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    
    this.connectionHealth.status = 'disconnected';

    this.stopHeartbeat();

    this.stats.disconnectTime = Date.now();
    this.stats.totalUptime += Date.now() - this.stats.connectTime;

    this.dispatchEvent(new CustomEvent('connection_close', {
      detail: { code: event.code, reason: event.reason }
    }) as any);

    // Auto-reconnect if not manual close
    if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private onMessage(event: MessageEvent): void {
    try {
      this.connectionHealth.messagesReceived++;
      this.stats.messagesReceived++;
      this.stats.bytesReceived += this.getMessageSize(event.data);

      let data: any;
      
      // Handle binary messages
      if (event.data instanceof ArrayBuffer) {
        data = this.parseBinaryMessage(event.data);
      } else {
        data = JSON.parse(event.data);
      }

      // Handle different message types
      this.handleIncomingMessage(data);

      // Update subscription statistics
      this.updateSubscriptionStats(data);

      this.dispatchEvent(new CustomEvent('message', {
        detail: { data, raw: event.data }
      }) as any);

    } catch (error) {
      console.error('Error processing message:', error);
      this.connectionHealth.errorCount++;
      this.stats.errorsCount++;
    }
  }

  private handleIncomingMessage(data: any): void {
    switch (data.type) {
      case 'pong':
        this.handlePong(data);
        break;
      case 'subscription_ack':
        this.handleSubscriptionAck(data);
        break;
      case 'error':
        this.handleError(data);
        break;
      case 'tick':
      case 'trade':
      case 'quote':
        this.handleMarketData(data);
        break;
      default:
        // Generic message handling
        break;
    }
  }

  private handlePong(data: any): void {
    this.lastPongReceived = Date.now();
    this.connectionHealth.latency = this.lastPongReceived - (data.timestamp || 0);
    this.connectionHealth.lastHeartbeat = new Date();
  }

  private handleSubscriptionAck(data: any): void {
    const subscription = this.subscriptions.get(data.id);
    if (subscription) {
      subscription.lastUpdate = new Date();
    }
  }

  private handleError(data: any): void {
    console.error('Server error:', data);
    this.connectionHealth.errorCount++;
    
    this.dispatchEvent(new CustomEvent('server_error', {
      detail: data
    }) as any);
  }

  private handleMarketData(data: any): void {
    // Update relevant subscription
    for (const subscription of this.subscriptions.values()) {
      if (subscription.symbol === data.symbol) {
        subscription.messageCount++;
        subscription.lastUpdate = new Date();
        break;
      }
    }

    this.dispatchEvent(new CustomEvent('market_data', {
      detail: data
    }) as any);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendPing(): void {
    const pingMessage = {
      type: 'ping',
      timestamp: Date.now(),
      connectionId: this.connectionId
    };

    this.sendMessage(pingMessage, 'high');
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connectionHealth.reconnectCount++;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  private buildConnectionUrl(): string {
    const url = new URL(this.config.url);
    
    if (this.config.apiKey) {
      url.searchParams.set('api_key', this.config.apiKey);
    }
    
    url.searchParams.set('connection_id', this.connectionId);
    url.searchParams.set('protocol_version', '2.0');
    
    if (this.binaryProtocol) {
      url.searchParams.set('binary', 'true');
    }

    return url.toString();
  }

  private sendMessage(data: any, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const messageId = this.generateMessageId();
    const queuedMessage: QueuedMessage = {
      id: messageId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendQueuedMessage(queuedMessage);
    } else {
      // Queue message if not connected
      this.addToQueue(queuedMessage);
    }
  }

  private sendQueuedMessage(queuedMessage: QueuedMessage): void {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify(queuedMessage.data);
        this.ws.send(messageData);
        this.connectionHealth.messagesSent++;
        this.stats.messagesSent++;
        this.stats.bytesSent += messageData.length;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      queuedMessage.retryCount++;
      
      if (queuedMessage.retryCount < 3) {
        this.addToQueue(queuedMessage);
      }
    }
  }

  private addToQueue(message: QueuedMessage): void {
    // Implement priority queue logic
    if (this.messageQueue.size >= this.messageQueueSize) {
      // Remove lowest priority messages
      const entries = Array.from(this.messageQueue.entries());
      entries.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
      });
      
      // Remove first (lowest priority) message
      this.messageQueue.delete(entries[0][0]);
    }

    this.messageQueue.set(message.id, message);
  }

  private processMessageQueue(): void {
    // Sort by priority and send queued messages
    const messages = Array.from(this.messageQueue.values());
    messages.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const message of messages) {
      this.sendQueuedMessage(message);
      this.messageQueue.delete(message.id);
    }
  }

  private resubscribeAll(): void {
    // Re-send subscription messages for active subscriptions
    for (const subscription of this.subscriptions.values()) {
      if (subscription.active) {
        const subscribeMessage = {
          action: 'subscribe',
          symbol: subscription.symbol,
          channel: subscription.channel,
          id: subscription.id,
          timestamp: Date.now()
        };
        
        this.sendMessage(subscribeMessage, 'high');
      }
    }
  }

  private updateSubscriptionStats(data: any): void {
    // Update statistics based on message type and symbol
    if (data.symbol) {
      for (const subscription of this.subscriptions.values()) {
        if (subscription.symbol === data.symbol) {
          subscription.messageCount++;
          subscription.lastUpdate = new Date();
        }
      }
    }
  }

  private parseBinaryMessage(buffer: ArrayBuffer): any {
    // Implement binary protocol parsing
    // This would depend on the specific binary format used
    const view = new DataView(buffer);
    
    // Example binary format parsing
    return {
      type: 'binary_tick',
      symbol: this.readString(view, 0, 6),
      price: view.getFloat64(8),
      volume: view.getFloat64(16),
      timestamp: view.getBigUint64(24)
    };
  }

  private readString(view: DataView, offset: number, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      const charCode = view.getUint8(offset + i);
      if (charCode === 0) break;
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  private adjustForBackgroundMode() {
    // Reduce heartbeat frequency
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        this.sendPing();
      }, this.heartbeatInterval * 2); // Double the interval
    }
  }

  private adjustForForegroundMode() {
    // Resume normal heartbeat frequency
    this.startHeartbeat();
  }

  private handleNetworkDisconnect() {
    this.connectionState = 'disconnected';
    if (this.ws) {
      this.ws.close();
    }
  }

  private handleAppPause() {
    this.adjustForBackgroundMode();
  }

  private handleAppResume() {
    this.adjustForForegroundMode();
    
    // Check connection and reconnect if needed
    if (this.connectionState === 'disconnected' && this.config.autoReconnect) {
      this.connect();
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMessageSize(data: any): number {
    if (typeof data === 'string') {
      return data.length;
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    return JSON.stringify(data).length;
  }

  private log(...args: any[]) {
    if (this.config.debug) {
      console.log('[EnhancedWebSocket]', ...args);
    }
  }

  private updateConnectionQuality(quality: 'excellent' | 'good' | 'fair' | 'poor') {
    if (this.connectionQuality !== quality) {
      this.connectionQuality = quality;
      this.config.connectionQuality = quality;
      
      this.dispatchEvent(new CustomEvent('quality-change', {
        detail: { quality, stats: this.stats }
      }));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  disconnect(): void {
    this.isManualClose = true;
    
    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    // Clear subscriptions
    this.subscriptions.clear();
    this.messageQueue.clear();

    this.connectionHealth.status = 'disconnected';
    this.connectionState = 'disconnected';
  }

  getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }
}

// Factory functions for common use cases
export function createEnhancedWebSocket(type: 'trading' | 'news' | 'economic', config: Partial<EnhancedWebSocketConfig> = {}): EnhancedWebSocketService {
  const baseConfigs = {
    trading: {
      url: 'wss://stream.tradingdata.com/v1/realtime',
      binaryProtocol: true,
      rateLimitPerSecond: 1000,
      heartbeatInterval: 10000, // 10 seconds for trading
      mobileOptimizations: true
    },
    news: {
      url: 'wss://stream.newsdata.com/v1/realtime',
      binaryProtocol: false,
      rateLimitPerSecond: 50,
      heartbeatInterval: 30000, // 30 seconds for news
      mobileOptimizations: true
    },
    economic: {
      url: 'wss://stream.economicdata.com/v1/realtime',
      binaryProtocol: false,
      rateLimitPerSecond: 20,
      heartbeatInterval: 60000, // 60 seconds for economic data
      mobileOptimizations: true
    }
  };

  return new EnhancedWebSocketService({
    ...baseConfigs[type],
    ...config
  });
} 