import { realBrokerService, RealBrokerConnection, RealTrade } from './realBrokerService';
import { toast } from 'sonner';

// =====================================================
// MT4/MT5 AUTO-SYNC MODULE
// =====================================================

export interface MT4MT5Credentials {
  server: string;
  login: string;
  password: string;
  accountType: 'Live' | 'Demo';
  brokerName?: string;
  serverAddress?: string;
  port?: number;
  useSSL?: boolean;
}

export interface MT4MT5Trade {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
  openTime: string;
  closeTime?: string;
  magicNumber?: number;
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  status: 'open' | 'closed' | 'pending' | 'cancelled';
  digits: number;
  spread: number;
  margin: number;
  freeMargin: number;
  equity: number;
  balance: number;
}

export interface MT4MT5Account {
  accountNumber: string;
  serverName: string;
  brokerName: string;
  accountType: 'Live' | 'Demo';
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync: string;
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncHistoricalData: boolean;
  historicalDataDays: number;
  syncOpenPositions: boolean;
  syncClosedTrades: boolean;
  syncAccountInfo: boolean;
  retryAttempts: number;
  retryDelay: number; // seconds
  alertOnSyncFailure: boolean;
  alertOnNewTrade: boolean;
  alertOnLargeLoss: boolean;
  largeLossThreshold: number; // percentage
}

export interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: string;
  nextSyncTime: string;
  syncInProgress: boolean;
  errorCount: number;
  lastError?: string;
  totalTradesSynced: number;
  tradesSyncedToday: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  ping: number; // milliseconds
}

export interface SyncResult {
  success: boolean;
  message: string;
  tradesSynced: number;
  positionsSynced: number;
  accountInfoUpdated: boolean;
  errors: string[];
  warnings: string[];
  duration: number; // milliseconds
}

class MT4MT5AutoSync {
  private connections: Map<string, RealBrokerConnection> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private syncStatus: Map<string, SyncStatus> = new Map();
  private retryCounts: Map<string, number> = new Map();
  private isInitialized = false;

  // Default sync settings
  private defaultSettings: SyncSettings = {
    autoSync: true,
    syncInterval: 30,
    syncHistoricalData: true,
    historicalDataDays: 30,
    syncOpenPositions: true,
    syncClosedTrades: true,
    syncAccountInfo: true,
    retryAttempts: 3,
    retryDelay: 5,
    alertOnSyncFailure: true,
    alertOnNewTrade: true,
    alertOnLargeLoss: true,
    largeLossThreshold: 5
  };

  // Initialize the auto-sync module
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing connections from storage
      await this.loadConnections();
      
      // Restart auto-sync for existing connections
      for (const [connectionId, connection] of this.connections) {
        if (connection.settings.autoSync && connection.status === 'connected') {
          await this.startAutoSync(connectionId);
        }
      }

      this.isInitialized = true;
      console.log('MT4/MT5 Auto-Sync module initialized');
    } catch (error) {
      console.error('Failed to initialize MT4/MT5 Auto-Sync:', error);
      throw error;
    }
  }

  // Connect to MT4/MT5 account with secure authentication
  async connectAccount(
    userId: string,
    credentials: MT4MT5Credentials,
    settings: Partial<SyncSettings> = {}
  ): Promise<{ success: boolean; connectionId?: string; message?: string; accountInfo?: MT4MT5Account }> {
    try {
      // Validate credentials
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Create connection object
      const connectionId = `mt4mt5_${userId}_${Date.now()}`;
      const connection: RealBrokerConnection = {
        id: connectionId,
        userId,
        name: `${credentials.brokerName || 'MT4/MT5'} - ${credentials.login}`,
        type: 'mt4', // Will be determined by server response
        status: 'connecting',
        credentials: {
          apiKey: '', // Not used for MT4/MT5
          secretKey: '', // Not used for MT4/MT5
          server: credentials.server,
          login: credentials.login,
          password: credentials.password,
        },
        lastSync: new Date().toISOString(),
        settings: {
          autoSync: settings.autoSync ?? true,
          syncInterval: settings.syncInterval ?? 30,
        },
      };

      // Attempt connection
      const result = await realBrokerService.connectToBroker(connection);
      
      if (result.success) {
        // Store connection
        this.connections.set(connectionId, {
          ...connection,
          status: 'connected',
          accountInfo: result.accountInfo
        });

        // Initialize sync status
        this.syncStatus.set(connectionId, {
          isConnected: true,
          lastSyncTime: new Date().toISOString(),
          nextSyncTime: this.calculateNextSyncTime(settings.syncInterval ?? 30),
          syncInProgress: false,
          errorCount: 0,
          totalTradesSynced: 0,
          tradesSyncedToday: 0,
          connectionQuality: 'good',
          ping: 0
        });

        // Start auto-sync if enabled
        if (settings.autoSync ?? true) {
          await this.startAutoSync(connectionId);
        }

        // Save connection to storage
        await this.saveConnection(connectionId);

        // Convert account info to MT4MT5Account format
        const accountInfo: MT4MT5Account = {
          accountNumber: credentials.login,
          serverName: credentials.server,
          brokerName: credentials.brokerName || 'Unknown Broker',
          accountType: credentials.accountType,
          balance: result.accountInfo?.balance || 0,
          equity: result.accountInfo?.equity || 0,
          margin: result.accountInfo?.margin || 0,
          freeMargin: result.accountInfo?.freeMargin || 0,
          marginLevel: result.accountInfo?.freeMargin > 0 ? 
            (result.accountInfo.equity / result.accountInfo.margin) * 100 : 0,
          currency: result.accountInfo?.currency || 'USD',
          leverage: '1:100', // Would come from real API
          connectionStatus: 'connected',
          lastSync: new Date().toISOString(),
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          totalProfit: 0,
          totalLoss: 0,
          winRate: 0
        };

        return {
          success: true,
          connectionId,
          accountInfo
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to connect to MT4/MT5 account'
        };
      }
    } catch (error) {
      console.error('MT4/MT5 connection failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Disconnect from MT4/MT5 account
  async disconnectAccount(connectionId: string): Promise<void> {
    try {
      // Stop auto-sync
      await this.stopAutoSync(connectionId);

      // Disconnect from broker service
      await realBrokerService.disconnectFromBroker(connectionId);

      // Update status
      const status = this.syncStatus.get(connectionId);
      if (status) {
        this.syncStatus.set(connectionId, {
          ...status,
          isConnected: false,
          connectionQuality: 'disconnected'
        });
      }

      // Remove connection
      this.connections.delete(connectionId);
      this.syncStatus.delete(connectionId);
      this.retryCounts.delete(connectionId);

      // Remove from storage
      await this.removeConnection(connectionId);

      toast.success('Disconnected from MT4/MT5 account');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect from MT4/MT5 account');
    }
  }

  // Manual sync of trade data
  async syncTrades(connectionId: string, options: {
    syncHistorical?: boolean;
    daysBack?: number;
    symbols?: string[];
  } = {}): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        message: 'Connection not found',
        tradesSynced: 0,
        positionsSynced: 0,
        accountInfoUpdated: false,
        errors: ['Connection not found'],
        warnings: [],
        duration: 0
      };
    }

    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Update sync status
      const status = this.syncStatus.get(connectionId);
      if (status) {
        this.syncStatus.set(connectionId, {
          ...status,
          syncInProgress: true
        });
      }

      // Fetch trades from broker
      const trades = await realBrokerService.fetchTradesFromBroker(
        connectionId,
        options.symbols?.join(','),
        1000 // Large limit for historical data
      );

      // Convert to MT4MT5Trade format
      const mt4Trades = this.convertToMT4MT5Trades(trades);

      // Filter by date if historical sync is requested
      let filteredTrades = mt4Trades;
      if (options.syncHistorical && options.daysBack) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - options.daysBack);
        filteredTrades = mt4Trades.filter(trade => 
          new Date(trade.openTime) >= cutoffDate
        );
      }

      // Save trades to database
      const savedTrades = await this.saveTradesToDatabase(connectionId, filteredTrades);

      // Update account info
      const accountInfo = await this.updateAccountInfo(connectionId);

      // Update sync status
      if (status) {
        this.syncStatus.set(connectionId, {
          ...status,
          syncInProgress: false,
          lastSyncTime: new Date().toISOString(),
          nextSyncTime: this.calculateNextSyncTime(connection.settings.syncInterval),
          totalTradesSynced: status.totalTradesSynced + savedTrades.length,
          tradesSyncedToday: status.tradesSyncedToday + savedTrades.length,
          errorCount: 0
        });
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Successfully synced ${savedTrades.length} trades`,
        tradesSynced: savedTrades.length,
        positionsSynced: filteredTrades.filter(t => t.status === 'open').length,
        accountInfoUpdated: !!accountInfo,
        errors,
        warnings,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      // Update error count
      const status = this.syncStatus.get(connectionId);
      if (status) {
        this.syncStatus.set(connectionId, {
          ...status,
          syncInProgress: false,
          errorCount: status.errorCount + 1,
          lastError: errorMessage
        });
      }

      return {
        success: false,
        message: `Sync failed: ${errorMessage}`,
        tradesSynced: 0,
        positionsSynced: 0,
        accountInfoUpdated: false,
        errors,
        warnings,
        duration
      };
    }
  }

  // Start auto-sync for a connection
  async startAutoSync(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.settings.autoSync) {
      return;
    }

    // Clear existing interval
    await this.stopAutoSync(connectionId);

    const intervalMs = connection.settings.syncInterval * 60 * 1000;

    const interval = setInterval(async () => {
      try {
        await this.syncTrades(connectionId);
        console.log(`Auto-sync completed for ${connection.name}`);
      } catch (error) {
        console.error(`Auto-sync failed for ${connection.name}:`, error);
        
        // Implement retry logic
        await this.handleSyncFailure(connectionId, error);
      }
    }, intervalMs);

    this.syncIntervals.set(connectionId, interval);
    console.log(`Auto-sync started for ${connection.name} (${connection.settings.syncInterval} min intervals)`);
  }

  // Stop auto-sync for a connection
  async stopAutoSync(connectionId: string): Promise<void> {
    const interval = this.syncIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(connectionId);
      console.log(`Auto-sync stopped for connection ${connectionId}`);
    }
  }

  // Get sync status for a connection
  getSyncStatus(connectionId: string): SyncStatus | null {
    return this.syncStatus.get(connectionId) || null;
  }

  // Get all connections for a user
  getUserConnections(userId: string): RealBrokerConnection[] {
    const userConnections = Array.from(this.connections.values()).filter(
      conn => conn.userId === userId
    );
    
    // Add default status and settings if missing
    return userConnections.map(conn => ({
      ...conn,
      status: conn.status || 'disconnected',
      settings: conn.settings || this.defaultSettings
    }));
  }

  // Get connection by ID
  getConnection(connectionId: string): RealBrokerConnection | null {
    return this.connections.get(connectionId) || null;
  }

  // Update sync settings
  async updateSyncSettings(connectionId: string, settings: Partial<SyncSettings>): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Update connection settings
    const updatedConnection = {
      ...connection,
      settings: {
        ...connection.settings,
        ...settings
      }
    };

    this.connections.set(connectionId, updatedConnection);

    // Restart auto-sync if settings changed
    if (settings.autoSync !== undefined || settings.syncInterval !== undefined) {
      if (settings.autoSync ?? connection.settings.autoSync) {
        await this.startAutoSync(connectionId);
      } else {
        await this.stopAutoSync(connectionId);
      }
    }

    // Save updated connection
    await this.saveConnection(connectionId);
  }

  // Validate MT4/MT5 credentials
  private validateCredentials(credentials: MT4MT5Credentials): { valid: boolean; message?: string } {
    if (!credentials.server?.trim()) {
      return { valid: false, message: 'Server name is required' };
    }

    if (!credentials.login?.trim()) {
      return { valid: false, message: 'Account number is required' };
    }

    if (!credentials.password?.trim()) {
      return { valid: false, message: 'Password is required' };
    }

    if (!credentials.accountType) {
      return { valid: false, message: 'Account type is required' };
    }

    // Validate server format
    if (!/^[a-zA-Z0-9.-]+$/.test(credentials.server)) {
      return { valid: false, message: 'Invalid server name format' };
    }

    // Validate account number format
    if (!/^\d+$/.test(credentials.login)) {
      return { valid: false, message: 'Account number must contain only digits' };
    }

    return { valid: true };
  }

  // Convert RealTrade to MT4MT5Trade format
  private convertToMT4MT5Trades(trades: RealTrade[]): MT4MT5Trade[] {
    return trades.map(trade => ({
      ticket: parseInt(trade.brokerTradeId || trade.id, 10) || Date.now(),
      symbol: trade.symbol,
      type: trade.side.toUpperCase() as 'BUY' | 'SELL',
      lots: trade.amount,
      openPrice: trade.price,
      currentPrice: trade.price,
      stopLoss: trade.stopLoss || 0,
      takeProfit: trade.takeProfit || 0,
      profit: trade.profit || 0,
      swap: 0,
      commission: trade.fee || 0,
      comment: '',
      openTime: trade.openTime || trade.timestamp,
      closeTime: trade.closeTime,
      magicNumber: 0,
      orderType: 'MARKET',
      status: trade.status,
      digits: 5,
      spread: 0,
      margin: 0,
      freeMargin: 0,
      equity: 0,
      balance: 0
    }));
  }

  // Save trades to database and integrate with calendar, AI coach, etc.
  private async saveTradesToDatabase(connectionId: string, trades: MT4MT5Trade[]): Promise<MT4MT5Trade[]> {
    console.log(`Saving ${trades.length} trades to database for connection ${connectionId}`);
    
    try {
      // Convert MT4MT5Trade to the app's trade format
      const convertedTrades = trades.map(trade => ({
        id: `mt4_${trade.ticket}_${Date.now()}`,
        symbol: trade.symbol,
        side: trade.type.toLowerCase(),
        amount: trade.lots,
        price: trade.openPrice,
        profitLoss: trade.profit,
        status: trade.status,
        openTime: trade.openTime,
        closeTime: trade.closeTime,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        fee: trade.commission,
        brokerTradeId: trade.ticket.toString(),
        source: 'MT4/MT5 Auto-Sync',
        connectionId: connectionId,
        // Add tags for AI coach and calendar integration
        tags: ['auto-synced', 'mt4mt5', trade.status === 'closed' ? 'completed' : 'active'],
        notes: `Auto-synced from ${trade.symbol} ${trade.type} trade`,
        // Calendar integration data
        calendarDate: new Date(trade.openTime).toISOString().split('T')[0],
        // AI coach integration data
        aiAnalysis: {
          riskLevel: this.calculateRiskLevel(trade),
          strategy: this.identifyStrategy(trade),
          sentiment: this.analyzeSentiment(trade),
          recommendations: this.generateRecommendations(trade)
        }
      }));

      // Save to localStorage for now (in production, this would be Supabase)
      const existingTrades = JSON.parse(localStorage.getItem('user_trades') || '[]');
      const updatedTrades = [...existingTrades, ...convertedTrades];
      localStorage.setItem('user_trades', JSON.stringify(updatedTrades));

      // Trigger calendar update
      this.updateCalendarWithTrades(convertedTrades);

      // Trigger AI coach analysis
      this.triggerAICoachAnalysis(convertedTrades);

      // Trigger performance analytics update
      this.updatePerformanceAnalytics(convertedTrades);

      // Show success notification
      if (convertedTrades.length > 0) {
        toast.success(`✅ Synced ${convertedTrades.length} trades to journal, calendar, and AI coach`);
      }

      return trades;
    } catch (error) {
      console.error('Failed to save trades to database:', error);
      toast.error('Failed to save synced trades');
      return [];
    }
  }

  // Calculate risk level for AI coach
  private calculateRiskLevel(trade: MT4MT5Trade): 'low' | 'medium' | 'high' {
    const riskAmount = Math.abs(trade.profit);
    const accountBalance = 100000; // Default balance
    const riskPercentage = (riskAmount / accountBalance) * 100;
    
    if (riskPercentage < 1) return 'low';
    if (riskPercentage < 5) return 'medium';
    return 'high';
  }

  // Identify trading strategy for AI coach
  private identifyStrategy(trade: MT4MT5Trade): string {
    if (trade.stopLoss && trade.takeProfit) {
      const riskRewardRatio = Math.abs((trade.takeProfit - trade.openPrice) / (trade.openPrice - trade.stopLoss));
      if (riskRewardRatio >= 2) return 'High Risk-Reward';
      if (riskRewardRatio >= 1.5) return 'Balanced Risk-Reward';
      return 'Conservative';
    }
    return 'No Stop Loss/Take Profit';
  }

  // Analyze sentiment for AI coach
  private analyzeSentiment(trade: MT4MT5Trade): 'bullish' | 'bearish' | 'neutral' {
    if (trade.type === 'BUY') return 'bullish';
    if (trade.type === 'SELL') return 'bearish';
    return 'neutral';
  }

  // Generate AI coach recommendations
  private generateRecommendations(trade: MT4MT5Trade): string[] {
    const recommendations = [];
    
    if (!trade.stopLoss) {
      recommendations.push('Consider adding a stop loss to manage risk');
    }
    
    if (!trade.takeProfit) {
      recommendations.push('Consider adding a take profit target');
    }
    
    if (Math.abs(trade.profit) > 1000) {
      recommendations.push('Large position size detected - review risk management');
    }
    
    if (trade.status === 'closed' && trade.profit < 0) {
      recommendations.push('Review trade setup and entry timing');
    }
    
    return recommendations;
  }

  // Update calendar with synced trades
  private updateCalendarWithTrades(trades: any[]): void {
    try {
      const existingCalendar = JSON.parse(localStorage.getItem('trading_calendar') || '{}');
      
      trades.forEach(trade => {
        const date = trade.calendarDate;
        if (!existingCalendar[date]) {
          existingCalendar[date] = {
            trades: [],
            totalPnL: 0,
            winCount: 0,
            lossCount: 0,
            totalTrades: 0
          };
        }
        
        existingCalendar[date].trades.push({
          id: trade.id,
          symbol: trade.symbol,
          side: trade.side,
          profitLoss: trade.profitLoss,
          status: trade.status,
          time: trade.openTime
        });
        
        existingCalendar[date].totalPnL += trade.profitLoss || 0;
        existingCalendar[date].totalTrades += 1;
        
        if (trade.status === 'closed') {
          if (trade.profitLoss > 0) {
            existingCalendar[date].winCount += 1;
          } else if (trade.profitLoss < 0) {
            existingCalendar[date].lossCount += 1;
          }
        }
      });
      
      localStorage.setItem('trading_calendar', JSON.stringify(existingCalendar));
      console.log('✅ Calendar updated with synced trades');
    } catch (error) {
      console.error('Failed to update calendar:', error);
    }
  }

  // Trigger AI coach analysis
  private triggerAICoachAnalysis(trades: any[]): void {
    try {
      const existingAnalysis = JSON.parse(localStorage.getItem('ai_coach_analysis') || '[]');
      
      const newAnalysis = trades.map(trade => ({
        id: trade.id,
        timestamp: new Date().toISOString(),
        trade: {
          symbol: trade.symbol,
          side: trade.side,
          profitLoss: trade.profitLoss,
          status: trade.status
        },
        analysis: trade.aiAnalysis,
        recommendations: trade.aiAnalysis.recommendations,
        riskLevel: trade.aiAnalysis.riskLevel,
        strategy: trade.aiAnalysis.strategy,
        sentiment: trade.aiAnalysis.sentiment
      }));
      
      const updatedAnalysis = [...existingAnalysis, ...newAnalysis];
      localStorage.setItem('ai_coach_analysis', JSON.stringify(updatedAnalysis));
      console.log('✅ AI coach analysis triggered for synced trades');
    } catch (error) {
      console.error('Failed to trigger AI coach analysis:', error);
    }
  }

  // Update performance analytics
  private updatePerformanceAnalytics(trades: any[]): void {
    try {
      const existingAnalytics = JSON.parse(localStorage.getItem('performance_analytics') || '{}');
      
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      const openTrades = trades.filter(trade => trade.status === 'open');
      
      // Update overall stats
      existingAnalytics.totalTrades = (existingAnalytics.totalTrades || 0) + trades.length;
      existingAnalytics.closedTrades = (existingAnalytics.closedTrades || 0) + closedTrades.length;
      existingAnalytics.openTrades = (existingAnalytics.openTrades || 0) + openTrades.length;
      
      // Update P&L
      const totalPnL = trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
      existingAnalytics.totalPnL = (existingAnalytics.totalPnL || 0) + totalPnL;
      
      // Update win rate
      const winningTrades = closedTrades.filter(trade => trade.profitLoss > 0);
      const losingTrades = closedTrades.filter(trade => trade.profitLoss < 0);
      existingAnalytics.winningTrades = (existingAnalytics.winningTrades || 0) + winningTrades.length;
      existingAnalytics.losingTrades = (existingAnalytics.losingTrades || 0) + losingTrades.length;
      
      if (existingAnalytics.closedTrades > 0) {
        existingAnalytics.winRate = (existingAnalytics.winningTrades / existingAnalytics.closedTrades) * 100;
      }
      
      // Update last sync
      existingAnalytics.lastSync = new Date().toISOString();
      existingAnalytics.syncedTradesCount = (existingAnalytics.syncedTradesCount || 0) + trades.length;
      
      localStorage.setItem('performance_analytics', JSON.stringify(existingAnalytics));
      console.log('✅ Performance analytics updated with synced trades');
    } catch (error) {
      console.error('Failed to update performance analytics:', error);
    }
  }

  // Update account information
  private async updateAccountInfo(connectionId: string): Promise<MT4MT5Account | null> {
    try {
      const accountInfo = await realBrokerService.getAccountBalance(connectionId);
      if (accountInfo) {
        // Update stored account info
        const connection = this.connections.get(connectionId);
        if (connection) {
          this.connections.set(connectionId, {
            ...connection,
            accountInfo,
            lastSync: new Date().toISOString()
          });
        }
      }
      return accountInfo;
    } catch (error) {
      console.error('Failed to update account info:', error);
      return null;
    }
  }

  // Handle sync failure with retry logic
  private async handleSyncFailure(connectionId: string, error: any): Promise<void> {
    const retryCount = this.retryCounts.get(connectionId) || 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    if (retryCount < maxRetries) {
      this.retryCounts.set(connectionId, retryCount + 1);
      
      console.log(`Retrying sync for ${connectionId} (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(async () => {
        try {
          await this.syncTrades(connectionId);
          this.retryCounts.delete(connectionId); // Reset retry count on success
        } catch (retryError) {
          console.error(`Retry failed for ${connectionId}:`, retryError);
        }
      }, retryDelay);
    } else {
      // Max retries reached, mark connection as error
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.connections.set(connectionId, {
          ...connection,
          status: 'error'
        });
      }

      const status = this.syncStatus.get(connectionId);
      if (status) {
        this.syncStatus.set(connectionId, {
          ...status,
          connectionQuality: 'poor',
          lastError: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      toast.error(`Sync failed for ${connection?.name || connectionId}. Please check your connection.`);
    }
  }

  // Calculate next sync time
  private calculateNextSyncTime(intervalMinutes: number): string {
    const nextSync = new Date();
    nextSync.setMinutes(nextSync.getMinutes() + intervalMinutes);
    return nextSync.toISOString();
  }

  // Load connections from storage
  private async loadConnections(): Promise<void> {
    try {
      // In a real implementation, this would load from Supabase
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem('mt4mt5_connections');
      if (stored) {
        const connections = JSON.parse(stored);
        for (const [id, connection] of Object.entries(connections)) {
          this.connections.set(id, connection as RealBrokerConnection);
        }
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  }

  // Save connection to storage
  private async saveConnection(connectionId: string): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      if (connection) {
        // In a real implementation, this would save to Supabase
        // For now, we'll use localStorage as a fallback
        const stored = localStorage.getItem('mt4mt5_connections') || '{}';
        const connections = JSON.parse(stored);
        connections[connectionId] = connection;
        localStorage.setItem('mt4mt5_connections', JSON.stringify(connections));
      }
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  }

  // Remove connection from storage
  private async removeConnection(connectionId: string): Promise<void> {
    try {
      // In a real implementation, this would remove from Supabase
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem('mt4mt5_connections') || '{}';
      const connections = JSON.parse(stored);
      delete connections[connectionId];
      localStorage.setItem('mt4mt5_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to remove connection:', error);
    }
  }
}

// Export singleton instance
export const mt4mt5AutoSync = new MT4MT5AutoSync(); 