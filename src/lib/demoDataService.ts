import { Tables } from '@/integrations/supabase/types';

export interface DemoUserData {
  userId: string;
  username: string;
  email: string;
  demo: boolean;
  accountBalance: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  activeTrades: number;
  joinDate: string;
  lastLogin: string;
}

export interface DemoTrade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  status: 'open' | 'closed';
  profit: number;
  entryTime: string;
  exitTime: string | null;
  stopLoss: number;
  takeProfit: number;
  notes: string;
  tags: string[];
  demo: boolean;
}

export interface DemoBrokerConnection {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  credentials: {
    apiKey: string;
    secretKey: string;
    server?: string;
    login?: string;
    password?: string;
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
    syncInterval: number;
  };
  demo: boolean;
}

export interface DemoMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface DemoEconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  date: string;
  forecast: string;
  previous: string;
  actual: string | null;
  description: string;
}

class DemoDataService {
  private demoUser: DemoUserData = {
    userId: 'demo-user-id',
    username: 'Demo User',
    email: 'demo@quantumrisk.coach',
    demo: true,
    accountBalance: 10000,
    totalPnL: 1250.75,
    winRate: 68.5,
    totalTrades: 47,
    activeTrades: 3,
    joinDate: '2024-01-15',
    lastLogin: new Date().toISOString()
  };

  private demoTrades: DemoTrade[] = [
    {
      id: 'demo-trade-1',
      userId: 'demo-user-id',
      symbol: 'EURUSD',
      type: 'buy',
      entryPrice: 1.0850,
      exitPrice: 1.0920,
      quantity: 1.0,
      status: 'closed',
      profit: 70.0,
      entryTime: '2024-01-20T10:30:00Z',
      exitTime: '2024-01-20T14:45:00Z',
      stopLoss: 1.0800,
      takeProfit: 1.0950,
      notes: 'Strong bullish momentum on EURUSD, entered on pullback',
      tags: ['forex', 'trend-following'],
      demo: true
    },
    {
      id: 'demo-trade-2',
      userId: 'demo-user-id',
      symbol: 'GBPUSD',
      type: 'sell',
      entryPrice: 1.2650,
      exitPrice: 1.2580,
      quantity: 0.5,
      status: 'closed',
      profit: 35.0,
      entryTime: '2024-01-21T09:15:00Z',
      exitTime: '2024-01-21T11:30:00Z',
      stopLoss: 1.2700,
      takeProfit: 1.2550,
      notes: 'Short on GBPUSD due to weak UK data',
      tags: ['forex', 'news-trading'],
      demo: true
    },
    {
      id: 'demo-trade-3',
      userId: 'demo-user-id',
      symbol: 'BTCUSD',
      type: 'buy',
      entryPrice: 42000,
      exitPrice: 43500,
      quantity: 0.1,
      status: 'closed',
      profit: 150.0,
      entryTime: '2024-01-22T16:00:00Z',
      exitTime: '2024-01-23T08:30:00Z',
      stopLoss: 41000,
      takeProfit: 44000,
      notes: 'Bitcoin breakout trade, strong volume confirmation',
      tags: ['crypto', 'breakout'],
      demo: true
    },
    {
      id: 'demo-trade-4',
      userId: 'demo-user-id',
      symbol: 'USDJPY',
      type: 'buy',
      entryPrice: 148.50,
      exitPrice: null,
      quantity: 1.0,
      status: 'open',
      profit: 25.0,
      entryTime: '2024-01-24T12:00:00Z',
      exitTime: null,
      stopLoss: 147.50,
      takeProfit: 150.00,
      notes: 'USDJPY long on BoJ dovish stance',
      tags: ['forex', 'fundamental'],
      demo: true
    },
    {
      id: 'demo-trade-5',
      userId: 'demo-user-id',
      symbol: 'AUDUSD',
      type: 'sell',
      entryPrice: 0.6650,
      exitPrice: null,
      quantity: 0.8,
      status: 'open',
      profit: -15.0,
      entryTime: '2024-01-25T08:45:00Z',
      exitTime: null,
      stopLoss: 0.6700,
      takeProfit: 0.6580,
      notes: 'AUDUSD short on weak commodity prices',
      tags: ['forex', 'commodity'],
      demo: true
    },
    {
      id: 'demo-trade-6',
      userId: 'demo-user-id',
      symbol: 'ETHUSD',
      type: 'buy',
      entryPrice: 2500,
      exitPrice: null,
      quantity: 0.2,
      status: 'open',
      profit: 45.0,
      entryTime: '2024-01-26T14:20:00Z',
      exitTime: null,
      stopLoss: 2400,
      takeProfit: 2600,
      notes: 'Ethereum long on DeFi growth',
      tags: ['crypto', 'defi'],
      demo: true
    }
  ];

  private demoBrokerConnections: DemoBrokerConnection[] = [
    {
      id: 'demo-broker-1',
      userId: 'demo-user-id',
      name: 'Demo MT4 Account',
      type: 'mt4',
      status: 'connected',
      credentials: {
        apiKey: 'demo-api-key',
        secretKey: 'demo-secret-key',
        server: 'DemoServer',
        login: '12345678',
        password: 'demo123'
      },
      lastSync: new Date().toISOString(),
      accountInfo: {
        balance: 10000,
        equity: 10125.75,
        margin: 500,
        freeMargin: 9625.75,
        profit: 125.75,
        currency: 'USD'
      },
      settings: {
        autoSync: true,
        syncInterval: 5
      },
      demo: true
    }
  ];

  // Get demo user data
  getUserData(): DemoUserData {
    return { ...this.demoUser };
  }

  // Get demo trades
  getTrades(): DemoTrade[] {
    return [...this.demoTrades];
  }

  // Get demo broker connections
  getBrokerConnections(): DemoBrokerConnection[] {
    return [...this.demoBrokerConnections];
  }

  // Add new demo trade
  addTrade(trade: Omit<DemoTrade, 'id' | 'userId' | 'demo'>): DemoTrade {
    const newTrade: DemoTrade = {
      ...trade,
      id: `demo-trade-${Date.now()}`,
      userId: 'demo-user-id',
      demo: true
    };
    
    this.demoTrades.push(newTrade);
    this.updateUserStats();
    
    return newTrade;
  }

  // Update demo trade
  updateTrade(tradeId: string, updates: Partial<DemoTrade>): DemoTrade | null {
    const tradeIndex = this.demoTrades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return null;

    this.demoTrades[tradeIndex] = { ...this.demoTrades[tradeIndex], ...updates };
    this.updateUserStats();
    
    return this.demoTrades[tradeIndex];
  }

  // Delete demo trade
  deleteTrade(tradeId: string): boolean {
    const tradeIndex = this.demoTrades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return false;

    this.demoTrades.splice(tradeIndex, 1);
    this.updateUserStats();
    
    return true;
  }

  // Update user statistics based on trades
  private updateUserStats(): void {
    const closedTrades = this.demoTrades.filter(t => t.status === 'closed');
    const activeTrades = this.demoTrades.filter(t => t.status === 'open');
    
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.profit || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    this.demoUser = {
      ...this.demoUser,
      totalPnL,
      winRate: Math.round(winRate * 10) / 10,
      totalTrades: this.demoTrades.length,
      activeTrades: activeTrades.length,
      accountBalance: 10000 + totalPnL
    };
  }

  // Get demo market data
  getMarketData(): DemoMarketData[] {
    return [
      {
        symbol: 'EURUSD',
        price: 1.0925,
        change: 0.0025,
        changePercent: 0.23,
        volume: 125000,
        high: 1.0940,
        low: 1.0890,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'GBPUSD',
        price: 1.2585,
        change: -0.0015,
        changePercent: -0.12,
        volume: 98000,
        high: 1.2620,
        low: 1.2560,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'USDJPY',
        price: 148.75,
        change: 0.25,
        changePercent: 0.17,
        volume: 75000,
        high: 148.90,
        low: 148.50,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'BTCUSD',
        price: 43500,
        change: 500,
        changePercent: 1.16,
        volume: 2500,
        high: 43800,
        low: 43000,
        timestamp: new Date().toISOString()
      }
    ];
  }

  // Get demo economic events
  getEconomicEvents(): DemoEconomicEvent[] {
    return [
      {
        id: 'demo-event-1',
        title: 'US Non-Farm Payrolls',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        forecast: '180K',
        previous: '175K',
        actual: null,
        description: 'Employment data for December 2024'
      },
      {
        id: 'demo-event-2',
        title: 'ECB Interest Rate Decision',
        country: 'EU',
        currency: 'EUR',
        impact: 'high',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        forecast: '4.50%',
        previous: '4.50%',
        actual: null,
        description: 'European Central Bank monetary policy decision'
      },
      {
        id: 'demo-event-3',
        title: 'UK CPI (YoY)',
        country: 'UK',
        currency: 'GBP',
        impact: 'medium',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        forecast: '3.8%',
        previous: '4.0%',
        actual: null,
        description: 'UK Consumer Price Index year-over-year'
      }
    ];
  }

  // Reset demo data
  resetDemoData(): void {
    this.demoTrades = this.demoTrades.slice(0, 3); // Keep only first 3 trades
    this.updateUserStats();
  }
}

export const demoDataService = new DemoDataService(); 