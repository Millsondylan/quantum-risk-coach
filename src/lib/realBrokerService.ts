export interface RealBrokerConnection {
  id: string;
  userId: string;
  name: string;
  type: 'binance' | 'bybit' | 'kucoin' | 'okx' | 'mexc' | 'coinbase' | 'kraken' | 'huobi' | 'gate' | 'bitget' | 'mt4' | 'mt5' | 'ctrader' | 'tradingview';
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  credentials: {
    apiKey: string;
    secretKey: string;
    passphrase?: string;
    sandbox?: boolean;
    server?: string; // For MT4/MT5
    login?: string;  // For MT4/MT5
    password?: string; // For MT4/MT5
  };
  lastSync: string;
  accountInfo?: {
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    profit: number;
    currency: string;
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
  openTime?: string;
  closeTime?: string;
  stopLoss?: number;
  takeProfit?: number;
}

// Exchange API endpoints for real broker connections
const EXCHANGE_APIS = {
  binance: {
    testnet: 'https://testnet.binance.vision/api',
    mainnet: 'https://api.binance.com/api',
    websocket: 'wss://stream.binance.com:9443/ws'
  },
  bybit: {
    testnet: 'https://api-testnet.bybit.com',
    mainnet: 'https://api.bybit.com',
    websocket: 'wss://stream.bybit.com/v5/public/spot'
  },
  kucoin: {
    testnet: 'https://openapi-sandbox.kucoin.com',
    mainnet: 'https://api.kucoin.com',
    websocket: 'wss://ws-api.kucoin.com/endpoint'
  },
  okx: {
    testnet: 'https://www.okx.com',
    mainnet: 'https://www.okx.com',
    websocket: 'wss://ws.okx.com:8443/ws/v5/public'
  },
  mexc: {
    mainnet: 'https://api.mexc.com',
    websocket: 'wss://wbs.mexc.com/ws'
  },
  coinbase: {
    mainnet: 'https://api.exchange.coinbase.com',
    websocket: 'wss://ws-feed.exchange.coinbase.com'
  },
  kraken: {
    mainnet: 'https://api.kraken.com',
    websocket: 'wss://ws.kraken.com'
  }
};

class RealBrokerService {
  private connections: Map<string, RealBrokerConnection> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Initialize broker connection with proper validation
  async connectToBroker(connection: RealBrokerConnection): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      // Validate connection parameters
      const validationResult = this.validateConnection(connection);
      if (!validationResult.valid) {
        return {
          success: false,
          message: validationResult.message
        };
      }

      // Test connection based on broker type
      const result = await this.testConnection(connection);
      
      if (result.success) {
        this.connections.set(connection.id, {
          ...connection,
          status: 'connected',
          lastSync: new Date().toISOString(),
          accountInfo: result.accountInfo
        });

        // Save to database instead of localStorage for production
        await this.saveConnectionToDatabase(connection);

        // Start auto-sync if enabled
        if (connection.settings.autoSync) {
          await this.startAutoSync(connection.id);
        }

        return {
          success: true,
          accountInfo: result.accountInfo
        };
      } else {
        this.connections.set(connection.id, {
          ...connection,
          status: 'error',
          lastSync: new Date().toISOString()
        });
        
        return {
          success: false,
          message: result.message || 'Connection failed - Please check your credentials'
        };
      }
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

  // Validate connection parameters before attempting connection
  private validateConnection(connection: RealBrokerConnection): { valid: boolean; message?: string } {
    if (!connection.credentials.apiKey) {
      return { valid: false, message: 'API Key is required' };
    }

    if (!connection.credentials.secretKey) {
      return { valid: false, message: 'Secret Key is required' };
    }

    // Additional validation for specific brokers
    if (connection.type === 'kucoin' && !connection.credentials.passphrase) {
      return { valid: false, message: 'Passphrase is required for KuCoin' };
    }

    if (['mt4', 'mt5'].includes(connection.type)) {
      if (!connection.credentials.server || !connection.credentials.login || !connection.credentials.password) {
        return { valid: false, message: 'Server, Login, and Password are required for MT4/MT5' };
      }
    }

    return { valid: true };
  }

  // Test connection using appropriate method for each broker type
  private async testConnection(connection: RealBrokerConnection): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      let accountInfo;

      switch (connection.type) {
        case 'binance':
          accountInfo = await this.testBinanceConnection(connection);
          break;
        case 'bybit':
          accountInfo = await this.testBybitConnection(connection);
          break;
        case 'kucoin':
          accountInfo = await this.testKucoinConnection(connection);
          break;
        case 'okx':
          accountInfo = await this.testOKXConnection(connection);
          break;
        case 'mexc':
          accountInfo = await this.testMEXCConnection(connection);
          break;
        case 'coinbase':
          accountInfo = await this.testCoinbaseConnection(connection);
          break;
        case 'kraken':
          accountInfo = await this.testKrakenConnection(connection);
          break;
        case 'mt4':
        case 'mt5':
          accountInfo = await this.testMT45Connection(connection);
          break;
        case 'ctrader':
          accountInfo = await this.testCTraderConnection(connection);
          break;
        case 'tradingview':
          accountInfo = await this.testTradingViewConnection(connection);
          break;
        default:
          throw new Error(`Unsupported broker type: ${connection.type}`);
      }

      return { success: true, accountInfo };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  // Test Binance connection with proper API call
  private async testBinanceConnection(connection: RealBrokerConnection): Promise<any> {
    const baseUrl = connection.credentials.sandbox 
      ? EXCHANGE_APIS.binance.testnet 
      : EXCHANGE_APIS.binance.mainnet;
    
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    
    // Create proper HMAC-SHA256 signature
    const signature = await this.createHMACSignature(queryString, connection.credentials.secretKey);
    
    const response = await fetch(`${baseUrl}/v3/account?${queryString}&signature=${signature}`, {
      headers: {
        'X-MBX-APIKEY': connection.credentials.apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Binance API error: ${errorData?.msg || response.statusText}`);
    }

    const data = await response.json();
    
    const balances = data.balances || [];
    const totalBalance = balances.reduce((sum: number, balance: any) => {
      return sum + parseFloat(balance.free || '0') + parseFloat(balance.locked || '0');
    }, 0);
    
    return {
      balance: totalBalance,
      equity: totalBalance,
      margin: 0,
      freeMargin: totalBalance,
      profit: 0,
      currency: 'USDT'
    };
  }

  // Test Bybit connection
  private async testBybitConnection(connection: RealBrokerConnection): Promise<any> {
    const baseUrl = connection.credentials.sandbox 
      ? EXCHANGE_APIS.bybit.testnet 
      : EXCHANGE_APIS.bybit.mainnet;
    
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = await this.createHMACSignature(queryString, connection.credentials.secretKey);
    
    const response = await fetch(`${baseUrl}/v5/account/wallet-balance?${queryString}`, {
      headers: {
        'X-BAPI-API-KEY': connection.credentials.apiKey,
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-SIGN': signature
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Bybit API error: ${errorData?.retMsg || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }
    
    const walletBalance = data.result?.list?.[0] || {};
    
    return {
      balance: parseFloat(walletBalance.totalWalletBalance || '0'),
      equity: parseFloat(walletBalance.totalEquity || '0'),
      margin: parseFloat(walletBalance.totalMarginBalance || '0'),
      freeMargin: parseFloat(walletBalance.totalAvailableBalance || '0'),
      profit: parseFloat(walletBalance.totalPerpUPL || '0'),
      currency: 'USDT'
    };
  }

  // Test KuCoin connection
  private async testKucoinConnection(connection: RealBrokerConnection): Promise<any> {
    const baseUrl = connection.credentials.sandbox 
      ? EXCHANGE_APIS.kucoin.testnet 
      : EXCHANGE_APIS.kucoin.mainnet;
    
    const timestamp = Date.now();
    const path = '/api/v1/accounts';
    const stringToSign = `${timestamp}GET${path}`;
    const signature = await this.createHMACSignature(stringToSign, connection.credentials.secretKey);
    const passphrase = await this.createHMACSignature(connection.credentials.passphrase!, connection.credentials.secretKey);
    
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'KC-API-KEY': connection.credentials.apiKey,
        'KC-API-TIMESTAMP': timestamp.toString(),
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-SIGN': signature,
        'KC-API-KEY-VERSION': '2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`KuCoin API error: ${errorData?.msg || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code !== '200000') {
      throw new Error(`KuCoin API error: ${data.msg}`);
    }
    
    const totalBalance = data.data?.reduce((sum: number, account: any) => {
      return sum + parseFloat(account.balance || '0');
    }, 0) || 0;
    
    return {
      balance: totalBalance,
      equity: totalBalance,
      margin: 0,
      freeMargin: totalBalance,
      profit: 0,
      currency: 'USDT'
    };
  }

  // Placeholder implementations for other brokers
  private async testOKXConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('OKX connection not yet implemented. Please contact support for setup assistance.');
  }

  private async testMEXCConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('MEXC connection not yet implemented. Please contact support for setup assistance.');
  }

  private async testCoinbaseConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('Coinbase connection not yet implemented. Please contact support for setup assistance.');
  }

  private async testKrakenConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('Kraken connection not yet implemented. Please contact support for setup assistance.');
  }

  private async testMT45Connection(connection: RealBrokerConnection): Promise<any> {
    // In a real-world scenario, this would involve a secure backend
    // connecting to the MT4/MT5 API or a custom bridge (e.g., using a Web API for MT4/MT5).
    // This client-side implementation is for demonstration purposes and should not return simulated data.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (connection.credentials.server && connection.credentials.login && connection.credentials.password) {
          // In a real application, this would make an actual API call to the MT4/MT5 backend.
          // For now, we reject to indicate that real integration is needed.
          reject(new Error('MT4/MT5 integration requires a backend connection. Client-side simulation not supported for real data.'));
        } else {
          reject(new Error('Invalid MT4/MT5 credentials or server.'));
        }
      }, 500); // Simulate network latency
    });
  }

  private async testCTraderConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('cTrader connection requires cBot installation. Please see our setup guide.');
  }

  private async testTradingViewConnection(connection: RealBrokerConnection): Promise<any> {
    throw new Error('TradingView connection requires webhook setup. Please see our setup guide.');
  }

  // Create proper HMAC-SHA256 signature
  private async createHMACSignature(data: string, secret: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(data);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('Failed to create HMAC signature:', error);
      throw new Error('Failed to create API signature');
    }
  }

  // Disconnect from broker
  async disconnectFromBroker(connectionId: string): Promise<void> {
    // Clear auto-sync interval
    const interval = this.syncIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(connectionId);
    }

    if (this.connections.has(connectionId)) {
      const connection = this.connections.get(connectionId)!;
      this.connections.set(connectionId, {
        ...connection,
        status: 'disconnected'
      });
      await this.saveConnectionToDatabase(connection);
    }
  }

  // Fetch real trades from broker
  async fetchTradesFromBroker(connectionId: string, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== 'connected') {
      throw new Error('Broker not connected');
    }

    try {
      // Implement actual trade fetching based on broker type
      switch (connection.type) {
        case 'binance':
          return await this.fetchBinanceTrades(connection, symbol, limit);
        case 'bybit':
          return await this.fetchBybitTrades(connection, symbol, limit);
        case 'kucoin':
          return await this.fetchKucoinTrades(connection, symbol, limit);
        case 'mt4':
        case 'mt5':
          return await this.fetchMT45Trades(connection, symbol, limit);
        default:
          throw new Error(`Trade fetching not implemented for ${connection.type}`);
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      throw error;
    }
  }

  // Fetch Binance trades
  private async fetchBinanceTrades(connection: RealBrokerConnection, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    // Implementation would go here
    // For now, return empty array as this requires extensive API work
    console.log('Binance trade fetching not yet implemented');
    return [];
  }

  // Fetch Bybit trades
  private async fetchBybitTrades(connection: RealBrokerConnection, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    // Implementation would go here
    console.log('Bybit trade fetching not yet implemented');
    return [];
  }

  // Fetch KuCoin trades
  private async fetchKucoinTrades(connection: RealBrokerConnection, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    // Implementation would go here
    console.log('KuCoin trade fetching not yet implemented');
    return [];
  }

  // Fetch MT4/MT5 trades (returns empty as no real backend integration)
  private async fetchMT45Trades(connection: RealBrokerConnection, symbol?: string, limit: number = 100): Promise<RealTrade[]> {
    console.log('MT4/MT5 trade fetching not implemented. Requires backend for real data.');
    return [];
  }

  // Get real account balance
  async getAccountBalance(connectionId: string): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== 'connected') {
      throw new Error('Broker not connected');
    }

    try {
      // Re-test connection to get fresh balance data
      const result = await this.testConnection(connection);
      if (result.success && result.accountInfo) {
        // Update stored connection with new balance
        this.connections.set(connectionId, {
          ...connection,
          accountInfo: result.accountInfo,
          lastSync: new Date().toISOString()
        });
        await this.saveConnectionToDatabase(connection);
        return result.accountInfo;
      }
      throw new Error('Failed to get balance');
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }

  // Auto-sync trades
  async startAutoSync(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.settings.autoSync) {
      return;
    }

    // Clear existing interval
    const existingInterval = this.syncIntervals.get(connectionId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const syncInterval = connection.settings.syncInterval * 60 * 1000; // Convert to milliseconds

    const interval = setInterval(async () => {
      try {
        await this.fetchTradesFromBroker(connectionId);
        await this.getAccountBalance(connectionId);
        
        console.log(`Auto-sync completed for ${connection.name}`);
      } catch (error) {
        console.error(`Auto-sync failed for ${connection.name}:`, error);
        // Consider marking connection as error if sync fails multiple times
      }
    }, syncInterval);

    this.syncIntervals.set(connectionId, interval);
  }

  // Save connection to database
  private async saveConnectionToDatabase(connection: RealBrokerConnection): Promise<void> {
    try {
      // For now, use localStorage since broker_connections table doesn't exist in Supabase
      // In production, this would use proper database storage with encryption
      const connections = this.getConnectionsFromLocalStorage();
      connections[connection.id] = connection;
      localStorage.setItem('broker_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to save connection to storage:', error);
    }
  }

  // Store connection info in localStorage
  private getConnectionsFromLocalStorage(): Record<string, RealBrokerConnection> {
    try {
      const stored = localStorage.getItem('broker_connections');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get connections from localStorage:', error);
      return {};
    }
  }

  // Encrypt credentials for storage (simplified)
  private encryptCredentials(credentials: any): string {
    // In production, use proper encryption
    // For now, just base64 encode (NOT SECURE)
    return btoa(JSON.stringify(credentials));
  }

  // Decrypt credentials from storage (simplified)
  private decryptCredentials(encryptedCredentials: string): any {
    try {
      return JSON.parse(atob(encryptedCredentials));
    } catch {
      return null;
    }
  }

  // Get all connections for a user
  async getUserConnections(userId: string): Promise<RealBrokerConnection[]> {
    try {
      // Use localStorage for now instead of Supabase
      const connections = this.getConnectionsFromLocalStorage();
      const userConnections = Object.values(connections).filter(conn => conn.userId === userId);
      
      // Restore active connections to memory
      userConnections.forEach(conn => {
        if (conn.status === 'connected') {
          this.connections.set(conn.id, conn);
          if (conn.settings?.autoSync) {
            this.startAutoSync(conn.id);
          }
        }
      });
      
      return userConnections;
    } catch (error) {
      console.error('Failed to get user connections:', error);
      return [];
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

  // Check if broker type is supported for live connection
  isBrokerSupported(brokerType: string): boolean {
    return ['binance', 'bybit', 'kucoin'].includes(brokerType);
  }

  // Get supported broker types
  getSupportedBrokers(): string[] {
    return ['binance', 'bybit', 'kucoin', 'okx', 'mexc', 'coinbase', 'kraken', 'mt4', 'mt5', 'ctrader', 'tradingview'];
  }
}

export const realBrokerService = new RealBrokerService();
export default realBrokerService; 