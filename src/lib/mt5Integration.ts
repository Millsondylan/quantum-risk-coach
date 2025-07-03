import { toast } from 'sonner';

export interface MT5AccountInfo {
  login: number;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  margin_free: number;
  profit: number;
  currency: string;
  leverage: number;
  name: string;
}

export interface MT5Position {
  ticket: number;
  time: number;
  type: 'buy' | 'sell';
  magic: number;
  identifier: number;
  reason: number;
  volume: number;
  price_open: number;
  sl: number;
  tp: number;
  price_current: number;
  swap: number;
  profit: number;
  symbol: string;
  comment: string;
  external_id: string;
}

export interface MT5Deal {
  ticket: number;
  order: number;
  time: number;
  time_msc: number;
  type: 'buy' | 'sell' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop' | 'balance' | 'credit' | 'charge' | 'correction' | 'bonus' | 'commission' | 'commission_agent' | 'interest' | 'buy_canceled' | 'sell_canceled' | 'dividend' | 'dividend_franked' | 'tax' | 'agent' | 'so_check' | 'tax_agent' | 'deal_order' | 'deal_canceled' | 'deal_commission' | 'deal_commission_agent' | 'deal_interest' | 'deal_buy' | 'deal_sell' | 'deal_balance' | 'deal_credit' | 'deal_charge' | 'deal_correction' | 'deal_bonus' | 'deal_commission_agent' | 'deal_interest_agent' | 'deal_dividend' | 'deal_dividend_franked' | 'deal_tax' | 'deal_agent' | 'deal_so_check' | 'deal_tax_agent' | 'deal_balance_agent' | 'deal_credit_agent' | 'deal_charge_agent' | 'deal_correction_agent' | 'deal_bonus_agent' | 'deal_commission_agent' | 'deal_interest_agent' | 'deal_dividend_agent' | 'deal_dividend_franked_agent' | 'deal_tax_agent' | 'deal_agent_agent' | 'deal_so_check_agent' | 'deal_tax_agent_agent';
  entry: 'in' | 'out' | 'inout' | 'out_by';
  magic: number;
  identifier: number;
  reason: number;
  volume: number;
  price: number;
  sl: number;
  tp: number;
  swap: number;
  profit: number;
  fee: number;
  symbol: string;
  comment: string;
  external_id: string;
}

export interface MT5ConnectionConfig {
  accountId: number;
  serverName: string;
  password: string;
  isReadOnly?: boolean;
}

export interface MT5ImportResult {
  success: boolean;
  message: string;
  importedTrades: number;
  importedPositions: number;
  errors: string[];
}

class MT5IntegrationService {
  private isConnected: boolean = false;
  private connectionConfig: MT5ConnectionConfig | null = null;

  /**
   * Initialize MT5 connection
   */
  async connect(config: MT5ConnectionConfig): Promise<boolean> {
    try {
      // In a real implementation, this would call a backend service
      // that runs the Python MT5 script and returns the data
      const response = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to MT5');
      }

      const result = await response.json();
      this.isConnected = result.success;
      this.connectionConfig = config;

      if (this.isConnected) {
        toast.success('Successfully connected to MetaTrader5');
      } else {
        toast.error('Failed to connect to MetaTrader5');
      }

      return this.isConnected;
    } catch (error) {
      console.error('MT5 connection error:', error);
      toast.error('MT5 connection failed. Please check your credentials.');
      return false;
    }
  }

  /**
   * Disconnect from MT5
   */
  async disconnect(): Promise<void> {
    try {
      await fetch('/api/mt5/disconnect', { method: 'POST' });
      this.isConnected = false;
      this.connectionConfig = null;
      toast.success('Disconnected from MetaTrader5');
    } catch (error) {
      console.error('MT5 disconnect error:', error);
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<MT5AccountInfo | null> {
    if (!this.isConnected) {
      toast.error('Not connected to MT5');
      return null;
    }

    try {
      const response = await fetch('/api/mt5/account-info');
      if (!response.ok) throw new Error('Failed to get account info');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting account info:', error);
      toast.error('Failed to get account information');
      return null;
    }
  }

  /**
   * Get current open positions
   */
  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      toast.error('Not connected to MT5');
      return [];
    }

    try {
      const response = await fetch('/api/mt5/positions');
      if (!response.ok) throw new Error('Failed to get positions');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting positions:', error);
      toast.error('Failed to get open positions');
      return [];
    }
  }

  /**
   * Get trade history
   */
  async getTradeHistory(fromDate?: Date, toDate?: Date): Promise<MT5Deal[]> {
    if (!this.isConnected) {
      toast.error('Not connected to MT5');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await fetch(`/api/mt5/history?${params}`);
      if (!response.ok) throw new Error('Failed to get trade history');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting trade history:', error);
      toast.error('Failed to get trade history');
      return [];
    }
  }

  /**
   * Import trades from MT5 to local database
   */
  async importTrades(fromDate?: Date, toDate?: Date): Promise<MT5ImportResult> {
    if (!this.isConnected) {
      return {
        success: false,
        message: 'Not connected to MT5',
        importedTrades: 0,
        importedPositions: 0,
        errors: ['Not connected to MT5']
      };
    }

    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await fetch(`/api/mt5/import?${params}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Imported ${result.importedTrades} trades and ${result.importedPositions} positions`);
      } else {
        toast.error(`Import failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import trades from MT5');
      return {
        success: false,
        message: 'Import failed',
        importedTrades: 0,
        importedPositions: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Convert MT5 deal to local trade format
   */
  convertMT5DealToTrade(deal: MT5Deal, accountId: string) {
    return {
      id: `mt5_${deal.ticket}`,
      accountId,
      symbol: deal.symbol,
      side: deal.type.includes('buy') ? 'buy' : 'sell',
      amount: deal.volume,
      price: deal.price,
      fee: deal.fee,
      profit: deal.profit,
      status: deal.entry === 'in' ? 'open' : 'closed',
      entryDate: new Date(deal.time * 1000).toISOString(),
      exitDate: deal.entry === 'out' ? new Date(deal.time * 1000).toISOString() : undefined,
      riskReward: deal.tp && deal.sl ? Math.abs((deal.tp - deal.price) / (deal.price - deal.sl)) : undefined,
      comment: deal.comment,
      externalId: deal.external_id,
      source: 'mt5'
    };
  }

  /**
   * Convert MT5 position to local trade format
   */
  convertMT5PositionToTrade(position: MT5Position, accountId: string) {
    return {
      id: `mt5_pos_${position.ticket}`,
      accountId,
      symbol: position.symbol,
      side: position.type,
      amount: position.volume,
      price: position.price_open,
      fee: 0,
      profit: position.profit,
      status: 'open',
      entryDate: new Date(position.time * 1000).toISOString(),
      exitDate: undefined,
      riskReward: position.tp && position.sl ? Math.abs((position.tp - position.price_open) / (position.price_open - position.sl)) : undefined,
      comment: position.comment,
      externalId: position.external_id,
      source: 'mt5'
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection config
   */
  getConnectionConfig(): MT5ConnectionConfig | null {
    return this.connectionConfig;
  }
}

// Export singleton instance
export const mt5Service = new MT5IntegrationService(); 