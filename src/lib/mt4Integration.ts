// MT4 Integration Service
//
// This service expects a backend API that exposes the following endpoints:
//   POST   /api/mt4/connect         { accountId, serverName, password }
//   POST   /api/mt4/disconnect
//   GET    /api/mt4/account-info
//   GET    /api/mt4/positions
//   GET    /api/mt4/history?fromDate=...&toDate=...
//   POST   /api/mt4/import?fromDate=...&toDate=...
//
// The backend should run on Windows, have MetaTrader4 terminal installed, and use a bridge (e.g., Python, .NET, or MQL script) to fetch data.
//
// The API contract matches the MT5 integration for seamless frontend use.

import { toast } from 'sonner';

export interface MT4AccountInfo {
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

export interface MT4Position {
  ticket: number;
  time: number;
  type: 'buy' | 'sell';
  volume: number;
  price_open: number;
  sl: number;
  tp: number;
  price_current: number;
  swap: number;
  profit: number;
  symbol: string;
  comment: string;
}

export interface MT4Deal {
  ticket: number;
  order: number;
  time: number;
  type: 'buy' | 'sell' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  entry: 'in' | 'out' | 'inout' | 'out_by';
  volume: number;
  price: number;
  sl: number;
  tp: number;
  swap: number;
  profit: number;
  fee: number;
  symbol: string;
  comment: string;
}

export interface MT4ConnectionConfig {
  accountId: number;
  serverName: string;
  password: string;
  isReadOnly?: boolean;
}

export interface MT4ImportResult {
  success: boolean;
  message: string;
  importedTrades: number;
  importedPositions: number;
  errors: string[];
}

class MT4IntegrationService {
  private isConnected: boolean = false;
  private connectionConfig: MT4ConnectionConfig | null = null;

  async connect(config: MT4ConnectionConfig): Promise<boolean> {
    try {
      const response = await fetch('/api/mt4/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to connect to MT4');
      const result = await response.json();
      this.isConnected = result.success;
      this.connectionConfig = config;
      if (this.isConnected) toast.success('Connected to MetaTrader4');
      else toast.error('Failed to connect to MetaTrader4');
      return this.isConnected;
    } catch (error) {
      console.error('MT4 connection error:', error);
      toast.error('MT4 connection failed. Please check your credentials.');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await fetch('/api/mt4/disconnect', { method: 'POST' });
      this.isConnected = false;
      this.connectionConfig = null;
      toast.success('Disconnected from MetaTrader4');
    } catch (error) {
      console.error('MT4 disconnect error:', error);
    }
  }

  async getAccountInfo(): Promise<MT4AccountInfo | null> {
    if (!this.isConnected) {
      toast.error('Not connected to MT4');
      return null;
    }
    try {
      const response = await fetch('/api/mt4/account-info');
      if (!response.ok) throw new Error('Failed to get account info');
      return await response.json();
    } catch (error) {
      console.error('Error getting account info:', error);
      toast.error('Failed to get account information');
      return null;
    }
  }

  async getPositions(): Promise<MT4Position[]> {
    if (!this.isConnected) {
      toast.error('Not connected to MT4');
      return [];
    }
    try {
      const response = await fetch('/api/mt4/positions');
      if (!response.ok) throw new Error('Failed to get positions');
      return await response.json();
    } catch (error) {
      console.error('Error getting positions:', error);
      toast.error('Failed to get open positions');
      return [];
    }
  }

  async getTradeHistory(fromDate?: Date, toDate?: Date): Promise<MT4Deal[]> {
    if (!this.isConnected) {
      toast.error('Not connected to MT4');
      return [];
    }
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      const response = await fetch(`/api/mt4/history?${params}`);
      if (!response.ok) throw new Error('Failed to get trade history');
      return await response.json();
    } catch (error) {
      console.error('Error getting trade history:', error);
      toast.error('Failed to get trade history');
      return [];
    }
  }

  async importTrades(fromDate?: Date, toDate?: Date): Promise<MT4ImportResult> {
    if (!this.isConnected) {
      return {
        success: false,
        message: 'Not connected to MT4',
        importedTrades: 0,
        importedPositions: 0,
        errors: ['Not connected to MT4']
      };
    }
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      const response = await fetch(`/api/mt4/import?${params}`, { method: 'POST' });
      if (!response.ok) throw new Error('Import failed');
      const result = await response.json();
      if (result.success) toast.success(`Imported ${result.importedTrades} trades and ${result.importedPositions} positions`);
      else toast.error(`Import failed: ${result.message}`);
      return result;
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import trades from MT4');
      return {
        success: false,
        message: 'Import failed',
        importedTrades: 0,
        importedPositions: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectionConfig(): MT4ConnectionConfig | null {
    return this.connectionConfig;
  }
}

export const mt4Service = new MT4IntegrationService(); 