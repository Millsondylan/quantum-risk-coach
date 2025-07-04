import { Capacitor } from '@capacitor/core';
import { v4 as uuidv4 } from 'uuid';

// Unified Trade interface
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

// Unified Portfolio interface
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Unified Account interface
export interface Account {
  id: string;
  name: string;
  type: 'demo' | 'live' | 'paper';
  balance: number;
  currency: string;
  portfolioId: string;
  userId: string;
  dataProvider?: string;
  accountType?: 'demo' | 'live';
  connectionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Unified User interface
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

// Unified Journal Entry interface
export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  mood?: 'positive' | 'negative' | 'neutral' | 'excited' | 'stressed' | 'calm' | 'greedy' | 'fearful';
  tags: string[];
}

// Unified Database Class
class UnifiedDatabase {
  private dbName = 'QuantumRiskCoachDB';
  private version = 4;
  private db: IDBDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;
  private prefix = 'tradenote_';

  async init(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('portfolios')) {
          const portfolioStore = db.createObjectStore('portfolios', { keyPath: 'id' });
          portfolioStore.createIndex('userId', 'userId', { unique: false });
          portfolioStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountStore.createIndex('portfolioId', 'portfolioId', { unique: false });
          accountStore.createIndex('userId', 'userId', { unique: false });
          accountStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('trades')) {
          const tradeStore = db.createObjectStore('trades', { keyPath: 'id' });
          tradeStore.createIndex('accountId', 'accountId', { unique: false });
          tradeStore.createIndex('symbol', 'symbol', { unique: false });
          tradeStore.createIndex('status', 'status', { unique: false });
          tradeStore.createIndex('entryDate', 'entryDate', { unique: false });
        }
        if (!db.objectStoreNames.contains('journal_entries')) {
          const journalStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
          journalStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('ai_coach_sessions')) {
          db.createObjectStore('ai_coach_sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('ai_strategies')) {
          db.createObjectStore('ai_strategies', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = (event) => {
        console.error('IndexedDB initialization error:', event);
        reject(new Error('Failed to initialize IndexedDB'));
      };
    });

    return this.initializationPromise;
  }

  private async ensureDatabase(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.ensureDatabase();
    const transaction = db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    const tradeToSave = {
      ...trade,
      id: trade.id || uuidv4(),
      createdAt: trade.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(tradeToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrades(accountId?: string): Promise<Trade[]> {
    const store = await this.getStore('trades');
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      if (accountId) {
        const index = store.index('accountId');
        request = index.getAll(accountId);
      } else {
        request = store.getAll();
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTrade(trade: Trade): Promise<void> {
    const tradeToUpdate = {
      ...trade,
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(tradeToUpdate);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTrade(tradeId: string): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(tradeId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      let completed = 0;
      let hasError = false;

      trades.forEach(trade => {
        const tradeToSave = {
          ...trade,
          id: trade.id || uuidv4(),
          createdAt: trade.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const request = store.add(tradeToSave);
        request.onsuccess = () => {
          completed++;
          if (completed === trades.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  // Portfolio operations
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    const portfolioToSave = {
      ...portfolio,
      id: portfolio.id || uuidv4(),
      createdAt: portfolio.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(portfolioToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPortfolios(userId?: string): Promise<Portfolio[]> {
    const store = await this.getStore('portfolios');
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      if (userId) {
        const index = store.index('userId');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    const portfolioToUpdate = {
      ...portfolio,
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(portfolioToUpdate);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePortfolio(id: string): Promise<void> {
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Account operations
  async createAccount(account: Account): Promise<void> {
    const accountToSave = {
      ...account,
      id: account.id || uuidv4(),
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(accountToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAccounts(portfolioId?: string): Promise<Account[]> {
    const store = await this.getStore('accounts');
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      if (portfolioId) {
        const index = store.index('portfolioId');
        request = index.getAll(portfolioId);
      } else {
        request = store.getAll();
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAccount(account: Account): Promise<void> {
    const accountToUpdate = {
      ...account,
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(accountToUpdate);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAccount(id: string): Promise<void> {
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    const userToSave = {
      ...user,
      updatedAt: new Date().toISOString()
    };
    
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(userToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(): Promise<User | null> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const users = request.result;
        resolve(users.length > 0 ? users[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Journal operations
  async createJournalEntry(entry: JournalEntry): Promise<string> {
    const entryToSave = {
      ...entry,
      id: entry.id || uuidv4()
    };
    
    const store = await this.getStore('journal_entries', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(entryToSave);
      request.onsuccess = () => resolve(entryToSave.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const store = await this.getStore('journal_entries');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateJournalEntry(entry: Partial<JournalEntry>): Promise<void> {
    const store = await this.getStore('journal_entries', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(entry.id!);
      getRequest.onsuccess = () => {
        const existingEntry = getRequest.result;
        if (existingEntry) {
          const updatedEntry = { ...existingEntry, ...entry };
          const putRequest = store.put(updatedEntry);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Journal entry not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteJournalEntry(id: string): Promise<void> {
    const store = await this.getStore('journal_entries', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    const store = await this.getStore('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    const store = await this.getStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // AI Coach operations
  async saveAICoachSession(session: any): Promise<void> {
    const sessionToSave = {
      ...session,
      id: session.id || uuidv4(),
      createdAt: session.createdAt || new Date().toISOString()
    };
    
    const store = await this.getStore('ai_coach_sessions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(sessionToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAICoachSessions(): Promise<any[]> {
    const store = await this.getStore('ai_coach_sessions');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // AI Strategy operations
  async saveAIStrategy(strategy: any): Promise<void> {
    const strategyToSave = {
      ...strategy,
      id: strategy.id || uuidv4(),
      createdAt: strategy.createdAt || new Date().toISOString()
    };
    
    const store = await this.getStore('ai_strategies', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(strategyToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAIStrategies(): Promise<any[]> {
    const store = await this.getStore('ai_strategies');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAIStrategy(id: string): Promise<void> {
    const store = await this.getStore('ai_strategies', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Data export/import
  async exportData(): Promise<any> {
    const [trades, portfolios, accounts, journalEntries, users, aiSessions, aiStrategies] = await Promise.all([
      this.getTrades(),
      this.getPortfolios(),
      this.getAccounts(),
      this.getJournalEntries(),
      this.getUser(),
      this.getAICoachSessions(),
      this.getAIStrategies()
    ]);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      trades,
      portfolios,
      accounts,
      journalEntries,
      users: users ? [users] : [],
      aiSessions,
      aiStrategies
    };
  }

  async importData(data: any): Promise<void> {
    if (data.trades) {
      await this.bulkInsertTrades(data.trades);
    }
    if (data.portfolios) {
      for (const portfolio of data.portfolios) {
        await this.createPortfolio(portfolio);
      }
    }
    if (data.accounts) {
      for (const account of data.accounts) {
        await this.createAccount(account);
      }
    }
    if (data.journalEntries) {
      for (const entry of data.journalEntries) {
        await this.createJournalEntry(entry);
      }
    }
    if (data.users && data.users.length > 0) {
      await this.saveUser(data.users[0]);
    }
    if (data.aiSessions) {
      for (const session of data.aiSessions) {
        await this.saveAICoachSession(session);
      }
    }
    if (data.aiStrategies) {
      for (const strategy of data.aiStrategies) {
        await this.saveAIStrategy(strategy);
      }
    }
  }

  async clearAllData(): Promise<void> {
    const storeNames = ['trades', 'portfolios', 'accounts', 'journal_entries', 'users', 'ai_coach_sessions', 'ai_strategies', 'settings'];
    
    for (const storeName of storeNames) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Utility methods
  async getTradesByPortfolioId(portfolioId: string): Promise<Trade[]> {
    const accounts = await this.getAccounts(portfolioId);
    const accountIds = accounts.map(account => account.id);
    const allTrades = await this.getTrades();
    return allTrades.filter(trade => trade.accountId && accountIds.includes(trade.accountId));
  }

  async updateAccountBalance(accountId: string, balance: number): Promise<void> {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      account.balance = balance;
      await this.updateAccount(account);
    }
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.id === accountId);
    return account?.balance || 0;
  }
}

// Create and export a singleton instance
export const localDatabase = new UnifiedDatabase(); 