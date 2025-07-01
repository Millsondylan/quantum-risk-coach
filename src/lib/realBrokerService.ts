import ccxt from 'ccxt';
import { supabase } from '@/integrations/supabase/client';

export interface RealBrokerConnection {
  id: string;
  userId: string;
  name: string;
  type: 'binance' | 'bybit' | 'kucoin' | 'okx' | 'mexc' | 'coinbase' | 'kraken' | 'huobi' | 'gate' | 'bitget';
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  credentials: {
    apiKey: string;
    secretKey: string;
    passphrase?: string;
    sandbox?: boolean;
  };
  lastSync: string;
  accountInfo?: {
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    profit: number;
  };
  settings: {
    autoSync: boolean;
    syncInterval: number; // minutes
  };
}

export interface RealTrade {
  id: string;
  userId: string;
  brokerId: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  cost: number;
  fee: number;
  timestamp: string;
  status: 'open' | 'closed' | 'cancelled';
  profit?: number;
  brokerTradeId: string;
}

class RealBrokerService {
  private exchanges: Map<string, any> = new Map();
  private connections: Map<string, RealBrokerConnection> = new Map();

  // Initialize exchange connection
  async connectToBroker(connection: RealBrokerConnection): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      const ExchangeClass = (ccxt as any)[connection.type];
      
      if (!ExchangeClass) {
        throw new Error(`Exchange ${connection.type} not supported`);
      }

      const exchange = new ExchangeClass({
        apiKey: connection.credentials.apiKey,
        secret: connection.credentials.secretKey,
        password: connection.credentials.passphrase,
        sandbox: connection.credentials.sandbox || false,
        enableRateLimit: true,
        timeout: 30000,
      });

      // Test connection by fetching balance
      await exchange.loadMarkets();
      const balance = await exchange.fetchBalance();
      
      const accountInfo = {
        balance: balance.total?.USDT || balance.total?.USD || Object.values(balance.total || {})[0] || 0,
        equity: balance.total?.USDT || balance.total?.USD || Object.values(balance.total || {})[0] || 0,
        margin: 0,
        freeMargin: balance.free?.USDT || balance.free?.USD || Object.values(balance.free || {})[0] || 0,
        profit: 0
      };

      this.exchanges.set(connection.id, exchange);
      this.connections.set(connection.id, {
        ...connection,
        status: 'connected',
        lastSync: new Date().toISOString(),
        accountInfo
      });

      return {
        success: true,
        accountInfo
      };
    } catch (error) {
      console.error('Failed to connect to broker:', error);
      this.connections.set(connection.id, {
        ...connection,
        status: 'error',
        lastSync: new Date().toISOString()
      });
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Disconnect from broker
  async disconnectFromBroker(connectionId: string): Promise<void> {
    this.exchanges.delete(connectionId);
    if (this.connections.has(connectionId)) {
      const connection = this.connections.get(connectionId)!;
      this.connections.set(connectionId, {
        ...connection,
        status: 'disconnected'
      });
    }
  }

  // Get real account balance
  async getAccountBalance(connectionId: string): Promise<any> {
    const exchange = this.exchanges.get(connectionId);
    if (!exchange) {
      throw new Error('Exchange not connected');
    }

    try {
      const balance = await exchange.fetchBalance();
      return balance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }

  // Fetch real trades from broker
  async fetchTradesFromBroker(connectionId: string, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    const exchange = this.exchanges.get(connectionId);
    const connection = this.connections.get(connectionId);
    
    if (!exchange || !connection) {
      throw new Error('Exchange not connected');
    }

    try {
      const trades = await exchange.fetchMyTrades(symbol, undefined, limit);
      
      const realTrades: RealTrade[] = trades.map((trade: any) => ({
        id: `${connectionId}_${trade.id}`,
        userId: connection.userId,
        brokerId: connectionId,
        symbol: trade.symbol,
        side: trade.side as 'buy' | 'sell',
        amount: trade.amount,
        price: trade.price,
        cost: trade.cost,
        fee: trade.fee?.cost || 0,
        timestamp: new Date(trade.timestamp).toISOString(),
        status: 'closed',
        profit: trade.side === 'buy' ? (trade.price - trade.cost) * trade.amount : (trade.cost - trade.price) * trade.amount,
        brokerTradeId: trade.id
      }));

      // Save trades to database using existing trades table
      await this.saveTradestoDatabase(realTrades);

      return realTrades;
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      throw error;
    }
  }

  // Get real market data
  async getMarketData(connectionId: string, symbol: string): Promise<any> {
    const exchange = this.exchanges.get(connectionId);
    if (!exchange) {
      throw new Error('Exchange not connected');
    }

    try {
      const [ticker, orderbook, trades] = await Promise.all([
        exchange.fetchTicker(symbol),
        exchange.fetchOrderBook(symbol, 10),
        exchange.fetchTrades(symbol, undefined, 50)
      ]);

      return {
        ticker,
        orderbook,
        recentTrades: trades
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  }

  // Place real order
  async placeOrder(connectionId: string, symbol: string, type: string, side: string, amount: number, price?: number): Promise<any> {
    const exchange = this.exchanges.get(connectionId);
    if (!exchange) {
      throw new Error('Exchange not connected');
    }

    try {
      const order = await exchange.createOrder(symbol, type, side, amount, price);
      return order;
    } catch (error) {
      console.error('Failed to place order:', error);
      throw error;
    }
  }

  // Get open orders
  async getOpenOrders(connectionId: string, symbol?: string): Promise<any[]> {
    const exchange = this.exchanges.get(connectionId);
    if (!exchange) {
      throw new Error('Exchange not connected');
    }

    try {
      const orders = await exchange.fetchOpenOrders(symbol);
      return orders;
    } catch (error) {
      console.error('Failed to fetch open orders:', error);
      throw error;
    }
  }

  // Auto-sync trades
  async startAutoSync(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.settings.autoSync) {
      return;
    }

    const syncInterval = connection.settings.syncInterval * 60 * 1000; // Convert to milliseconds

    setInterval(async () => {
      try {
        await this.fetchTradesFromBroker(connectionId);
        await this.getAccountBalance(connectionId);
        
        // Update last sync time
        if (this.connections.has(connectionId)) {
          const conn = this.connections.get(connectionId)!;
          this.connections.set(connectionId, {
            ...conn,
            lastSync: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, syncInterval);
  }

  // Save trades to database using existing trades table
  private async saveTradestoDatabase(trades: RealTrade[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('trades')
        .upsert(trades.map(trade => ({
          id: trade.id,
          user_id: trade.userId,
          instrument: trade.symbol,
          trade_type: trade.side,
          volume: trade.amount,
          entry_price: trade.price,
          exit_price: trade.price,
          profit_loss: trade.profit,
          opened_at: trade.timestamp,
          closed_at: trade.timestamp,
          status: trade.status
        })));

      if (error) {
        console.error('Failed to save trades to database:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  // Store connection info in localStorage for now (since broker_connections table doesn't exist)
  private saveConnectionToLocalStorage(connection: RealBrokerConnection): void {
    try {
      const connections = this.getConnectionsFromLocalStorage();
      connections[connection.id] = connection;
      localStorage.setItem('broker_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to save connection to localStorage:', error);
    }
  }

  // Get connections from localStorage
  private getConnectionsFromLocalStorage(): Record<string, RealBrokerConnection> {
    try {
      const stored = localStorage.getItem('broker_connections');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get connections from localStorage:', error);
      return {};
    }
  }

  // Get all connections for a user
  async getUserConnections(userId: string): Promise<RealBrokerConnection[]> {
    try {
      const connections = this.getConnectionsFromLocalStorage();
      return Object.values(connections).filter(conn => conn.userId === userId);
    } catch (error) {
      console.error('Failed to get user connections:', error);
      return [];
    }
  }

  // Get real-time price updates (WebSocket)
  async subscribeToRealTimePrices(connectionId: string, symbols: string[], callback: (data: any) => void): Promise<void> {
    const exchange = this.exchanges.get(connectionId);
    if (!exchange) {
      throw new Error('Exchange not connected');
    }

    // For exchanges that support WebSocket
    if (exchange.has && exchange.has['watchTicker']) {
      try {
        for (const symbol of symbols) {
          exchange.watchTicker(symbol).then((ticker: any) => {
            callback({
              symbol,
              price: ticker.last,
              change: ticker.change,
              percentage: ticker.percentage,
              timestamp: ticker.timestamp
            });
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Failed to subscribe to real-time prices:', error);
      }
    }
  }

  // Get connection by ID
  getConnection(connectionId: string): RealBrokerConnection | undefined {
    return this.connections.get(connectionId);
  }

  // Get all active connections
  getAllConnections(): RealBrokerConnection[] {
    return Array.from(this.connections.values());
  }
}

export const realBrokerService = new RealBrokerService();
export default realBrokerService; 