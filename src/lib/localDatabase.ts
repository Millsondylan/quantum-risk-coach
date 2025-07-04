// Simplified Local Database for TradeNote
// This provides basic storage functionality without complex dependencies

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  onboardingCompleted: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    biometricAuth: boolean;
    defaultCurrency: string;
    timezone: string;
  };
  settings: {
    apiKeys: {
      openai?: string;
      groq?: string;
      gemini?: string;
      polygon?: string;
      alphaVantage?: string;
    };
    tradingSettings: {
      defaultLeverage: number;
      riskPerTrade: number;
      maxOpenTrades: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'long' | 'short' | 'buy' | 'sell';
  side: 'buy' | 'sell';
  quantity: number;
  amount?: number;
  entryPrice: number;
  price?: number;
  exitPrice?: number;
  pnl?: number;
  profit?: number;
  profitLoss?: number;
  status: 'open' | 'closed' | 'cancelled' | 'pending';
  entryTime: string;
  entryDate?: string;
  exitTime?: string;
  exitDate?: string;
  notes?: string;
  strategy?: string;
  tags?: string[];
  accountId?: string;
  fee?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskReward?: number;
  riskRewardRatio?: number;
  confidence?: number;
  confidenceRating?: number;
  emotion?: string;
  mood?: string;
  exitReason?: string;
  currentPrice?: number;
  useCurrentPrice?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'demo' | 'live' | 'paper';
  balance: number;
  currency: string;
  portfolioId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Simple localStorage-based database
class LocalStorageDB {
  private prefix = 'tradenote_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async saveUser(user: User): Promise<void> {
    localStorage.setItem(this.getKey('user'), JSON.stringify(user));
  }

  async getUser(): Promise<User | null> {
    const userData = localStorage.getItem(this.getKey('user'));
    return userData ? JSON.parse(userData) : null;
  }

  async saveTrade(trade: Trade): Promise<void> {
    const trades = await this.getTrades();
    const existingIndex = trades.findIndex(t => t.id === trade.id);
    
    if (existingIndex >= 0) {
      trades[existingIndex] = trade;
    } else {
      trades.push(trade);
    }
    
    localStorage.setItem(this.getKey('trades'), JSON.stringify(trades));
  }



  async deleteTrade(id: string): Promise<void> {
    const trades = await this.getTrades();
    const filteredTrades = trades.filter(t => t.id !== id);
    localStorage.setItem(this.getKey('trades'), JSON.stringify(filteredTrades));
  }

  async clearTrades(): Promise<void> {
    localStorage.removeItem(this.getKey('trades'));
  }

  async saveAICoachSession(session: any): Promise<void> {
    const sessions = await this.getAICoachSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(this.getKey('aiCoachSessions'), JSON.stringify(sessions));
  }

  async getAICoachSessions(): Promise<any[]> {
    const sessionsData = localStorage.getItem(this.getKey('aiCoachSessions'));
    return sessionsData ? JSON.parse(sessionsData) : [];
  }

  async clearAICoachSessions(): Promise<void> {
    localStorage.removeItem(this.getKey('aiCoachSessions'));
  }

  async saveAIStrategy(strategy: any): Promise<void> {
    const strategies = await this.getAIStrategies();
    const existingIndex = strategies.findIndex(s => s.id === strategy.id);
    
    if (existingIndex >= 0) {
      strategies[existingIndex] = strategy;
    } else {
      strategies.push(strategy);
    }
    
    localStorage.setItem(this.getKey('aiStrategies'), JSON.stringify(strategies));
  }

  async getAIStrategies(): Promise<any[]> {
    const strategiesData = localStorage.getItem(this.getKey('aiStrategies'));
    return strategiesData ? JSON.parse(strategiesData) : [];
  }

  async deleteAIStrategy(id: string): Promise<void> {
    const strategies = await this.getAIStrategies();
    const filteredStrategies = strategies.filter(s => s.id !== id);
    localStorage.setItem(this.getKey('aiStrategies'), JSON.stringify(filteredStrategies));
  }

  async clearAllData(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Portfolio methods
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    const portfolios = await this.getPortfolios();
    portfolios.push(portfolio);
    localStorage.setItem(this.getKey('portfolios'), JSON.stringify(portfolios));
  }

  async getPortfolios(): Promise<Portfolio[]> {
    const portfoliosData = localStorage.getItem(this.getKey('portfolios'));
    return portfoliosData ? JSON.parse(portfoliosData) : [];
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    const portfolios = await this.getPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    if (index >= 0) {
      portfolios[index] = portfolio;
      localStorage.setItem(this.getKey('portfolios'), JSON.stringify(portfolios));
    }
  }

  async deletePortfolio(id: string): Promise<void> {
    const portfolios = await this.getPortfolios();
    const filteredPortfolios = portfolios.filter(p => p.id !== id);
    localStorage.setItem(this.getKey('portfolios'), JSON.stringify(filteredPortfolios));
  }

  // Account methods
  async createAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    accounts.push(account);
    localStorage.setItem(this.getKey('accounts'), JSON.stringify(accounts));
  }

  async getAccounts(): Promise<Account[]> {
    const accountsData = localStorage.getItem(this.getKey('accounts'));
    return accountsData ? JSON.parse(accountsData) : [];
  }

  async getAccountsByPortfolioId(portfolioId: string): Promise<Account[]> {
    const accounts = await this.getAccounts();
    return accounts.filter(account => account.portfolioId === portfolioId);
  }

  async updateAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
      localStorage.setItem(this.getKey('accounts'), JSON.stringify(accounts));
    }
  }

  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.getAccounts();
    const filteredAccounts = accounts.filter(a => a.id !== id);
    localStorage.setItem(this.getKey('accounts'), JSON.stringify(filteredAccounts));
  }

  // Trade methods with accountId parameter
  async getTrades(accountId?: string): Promise<Trade[]> {
    const tradesData = localStorage.getItem(this.getKey('trades'));
    const trades = tradesData ? JSON.parse(tradesData) : [];
    if (accountId) {
      return trades.filter((trade: Trade) => trade.accountId === accountId);
    }
    return trades;
  }

  async createTrade(trade: Trade): Promise<void> {
    await this.saveTrade(trade);
  }

  async updateTrade(trade: Trade): Promise<void> {
    await this.saveTrade(trade);
  }

  // User methods
  async clearUser(): Promise<void> {
    localStorage.removeItem(this.getKey('user'));
  }

  async exportData(): Promise<any> {
    return {
      user: await this.getUser(),
      trades: await this.getTrades(),
      portfolios: await this.getPortfolios(),
      accounts: await this.getAccounts(),
      aiCoachSessions: await this.getAICoachSessions(),
      aiStrategies: await this.getAIStrategies()
    };
  }
}

// Create and export a singleton instance
export const localDatabase = new LocalStorageDB(); 