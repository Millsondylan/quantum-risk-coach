import { RealBrokerService } from './realBrokerService';
import { database } from './localDatabase';
import { Account } from './localDatabase';

export interface SyncNotification {
  id: string;
  type: 'trade_sync' | 'balance_update' | 'connection_error' | 'api_expiry';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
  data?: any;
}

export class TradeSyncService {
  private brokerService: RealBrokerService;

  constructor() {
    this.brokerService = new RealBrokerService();
  }

  async syncAllAccounts(): Promise<SyncNotification[]> {
    const notifications: SyncNotification[] = [];
    
    try {
      // Fetch all broker accounts
      const accounts = await this.getBrokerAccounts();
      
      for (const account of accounts) {
        try {
          const syncResult = await this.syncAccountTrades(account);
          notifications.push(...syncResult);
        } catch (error) {
          notifications.push(this.createErrorNotification(
            `Failed to sync account ${account.name}`, 
            error
          ));
        }
      }
    } catch (error) {
      notifications.push(this.createErrorNotification(
        'Failed to retrieve accounts for synchronization', 
        error
      ));
    }

    return notifications;
  }

  private async getBrokerAccounts(): Promise<Account[]> {
    // Fetch all accounts that are broker-connected
    const portfolios = await database.getPortfolios();
    const brokerAccounts: Account[] = [];

    for (const portfolio of portfolios) {
      const accounts = await database.getAccountsByPortfolioId(portfolio.id);
      brokerAccounts.push(...accounts.filter(a => a.type === 'broker'));
    }

    return brokerAccounts;
  }

  private async syncAccountTrades(account: Account): Promise<SyncNotification[]> {
    const notifications: SyncNotification[] = [];
    
    try {
      // Get broker connection
      const connection = this.brokerService.getConnection(account.id);
      
      if (!connection) {
        throw new Error(`No connection found for account ${account.name}`);
      }

      // Fetch recent trades
      const trades = await this.brokerService.fetchTradesFromBroker(connection.id);
      
      // Deduplicate and save trades
      const savedTrades = await this.saveTrades(account.portfolioId, trades);
      
      // Update account balance
      const balance = await this.brokerService.getAccountBalance(connection.id);
      await database.updateAccountBalance(account.id, balance);

      // Create sync notification
      notifications.push({
        id: `sync_${Date.now()}`,
        type: 'trade_sync',
        message: `Synced ${savedTrades.length} new trades for ${account.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
        data: {
          accountId: account.id,
          tradeCount: savedTrades.length
        }
      });

      // Balance update notification
      notifications.push({
        id: `balance_${Date.now()}`,
        type: 'balance_update',
        message: `Balance updated for ${account.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
        data: {
          accountId: account.id,
          balance: balance
        }
      });
    } catch (error) {
      notifications.push(this.createErrorNotification(
        `Synchronization failed for ${account.name}`, 
        error
      ));
    }

    return notifications;
  }

  private async saveTrades(portfolioId: string, trades: any[]): Promise<any[]> {
    const savedTrades: any[] = [];

    for (const trade of trades) {
      try {
        // Check if trade already exists
        const existingTrade = await this.findExistingTrade(trade);
        
        if (!existingTrade) {
          // Save new trade
          await database.createTrade({
            portfolioId,
            symbol: trade.symbol,
            entryPrice: trade.entryPrice,
            exitPrice: trade.exitPrice,
            quantity: trade.quantity,
            entryTime: trade.entryTime,
            exitTime: trade.exitTime
          });
          
          savedTrades.push(trade);
        }
      } catch (error) {
        console.error('Failed to save trade', error);
      }
    }

    return savedTrades;
  }

  private async findExistingTrade(trade: any): Promise<boolean> {
    // Implement trade deduplication logic
    // This could check for existing trades with same symbol, entry time, and quantity
    const existingTrades = await database.getTradesByPortfolioId(trade.portfolioId);
    
    return existingTrades.some(existingTrade => 
      existingTrade.symbol === trade.symbol &&
      existingTrade.entryTime === trade.entryTime &&
      existingTrade.quantity === trade.quantity
    );
  }

  private createErrorNotification(
    message: string, 
    error: any
  ): SyncNotification {
    return {
      id: `error_${Date.now()}`,
      type: 'connection_error',
      message: message,
      timestamp: new Date().toISOString(),
      severity: 'error',
      data: {
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    };
  }

  // Notification management
  async getRecentNotifications(limit: number = 50): Promise<SyncNotification[]> {
    // In a real implementation, this would query a notifications table
    // For now, we'll simulate storing notifications
    const storedNotifications = await this.retrieveStoredNotifications();
    return storedNotifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private async retrieveStoredNotifications(): Promise<SyncNotification[]> {
    // This would typically interact with a persistent storage mechanism
    // For now, we'll use local storage or a simple in-memory approach
    const notifications = localStorage.getItem('sync_notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  private async storeNotification(notification: SyncNotification): Promise<void> {
    const notifications = await this.retrieveStoredNotifications();
    notifications.push(notification);
    
    // Keep only the last 100 notifications
    const trimmedNotifications = notifications.slice(-100);
    
    localStorage.setItem('sync_notifications', JSON.stringify(trimmedNotifications));
  }
} 