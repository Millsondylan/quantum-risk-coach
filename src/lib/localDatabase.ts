import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

/*
 * Local Database Wrapper - All data saved to user's device
 * ========================================================
 * 
 * Web Platform: Uses IndexedDB for persistent local storage
 * Mobile Platform: Uses SQLite for encrypted local storage
 * 
 * All data is stored locally on the user's device - no external servers required.
 * This ensures complete privacy and offline functionality.
 */

export interface Portfolio {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  portfolioId: string;
  name: string;
  type: 'broker' | 'manual';
  broker?: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  type: 'long' | 'short';
  side: 'buy' | 'sell';
  amount: number;
  quantity: number;
  price: number;
  entryPrice: number;
  exitPrice?: number;
  fee: number;
  profit: number;
  profitLoss?: number;
  status: 'open' | 'closed' | 'cancelled' | 'pending';
  entryDate: string;
  entryTime?: string;
  exitDate?: string;
  exitTime?: string;
  riskReward?: number;
  riskRewardRatio?: number;
  strategy?: string;
  tags?: string[];
  notes?: string;
  exitReason?: string;
  takeProfit?: number;
  stopLoss?: number;
  confidence?: number;
  confidenceRating?: number;
  emotion?: 'calm' | 'anxious' | 'excited' | 'frustrated';
  mood?: 'positive' | 'negative' | 'neutral' | 'excited' | 'stressed' | 'calm' | 'greedy' | 'fearful';
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    email: boolean;
  };
  tradingPreferences: {
    defaultCurrency: string;
    riskTolerance: 'low' | 'medium' | 'high';
    defaultLeverage: number;
  };
}

// Web Platform: IndexedDB Implementation
class IndexedDBStorage {
  private dbName = 'QuantumRiskCoachDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('portfolios')) {
          const portfolioStore = db.createObjectStore('portfolios', { keyPath: 'id' });
          portfolioStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountStore.createIndex('portfolioId', 'portfolioId', { unique: false });
          accountStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('trades')) {
          const tradeStore = db.createObjectStore('trades', { keyPath: 'id' });
          tradeStore.createIndex('accountId', 'accountId', { unique: false });
          tradeStore.createIndex('entryDate', 'entryDate', { unique: false });
          tradeStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Portfolio operations
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    try {
      const store = await this.getStore('portfolios', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.add(portfolio);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  async getPortfolios(): Promise<Portfolio[]> {
    try {
      const store = await this.getStore('portfolios');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting portfolios:', error);
      return [];
    }
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    try {
      const store = await this.getStore('portfolios', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(portfolio);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  async deletePortfolio(id: string): Promise<void> {
    try {
      const store = await this.getStore('portfolios', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // Account operations
  async createAccount(account: Account): Promise<void> {
    try {
      const store = await this.getStore('accounts', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.add(account);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async getAccounts(portfolioId: string): Promise<Account[]> {
    try {
      const store = await this.getStore('accounts');
      const index = store.index('portfolioId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(portfolioId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  async updateAccount(account: Account): Promise<void> {
    try {
      const store = await this.getStore('accounts', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(account);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      const store = await this.getStore('accounts', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    try {
      const store = await this.getStore('trades', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.add(trade);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  }

  async getTrades(accountId?: string): Promise<Trade[]> {
    try {
      const store = await this.getStore('trades');
      if (accountId) {
        const index = store.index('accountId');
        return new Promise((resolve, reject) => {
          const request = index.getAll(accountId);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
      } else {
        return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error getting trades:', error);
      return [];
    }
  }

  async updateTrade(trade: Trade): Promise<void> {
    try {
      const store = await this.getStore('trades', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(trade);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  }

  async deleteTrade(id: string): Promise<void> {
    try {
      const store = await this.getStore('trades', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  }

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    try {
      const store = await this.getStore('trades', 'readwrite');
      return new Promise((resolve, reject) => {
        const transaction = store.transaction;
        let completed = 0;
        let hasError = false;

        trades.forEach(trade => {
          const request = store.add(trade);
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
    } catch (error) {
      console.error('Error bulk inserting trades:', error);
      throw error;
    }
  }

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    try {
      const store = await this.getStore('settings', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting setting:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      const store = await this.getStore('settings');
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  // User operations
  async createUser(username: string, userData: any): Promise<void> {
    try {
      const store = await this.getStore('users', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put({ username, ...userData });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(username: string): Promise<any> {
    try {
      const store = await this.getStore('users');
      return new Promise((resolve, reject) => {
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const store = await this.getStore('users');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Data export/import
  async exportData(): Promise<any> {
    try {
      const portfolios = await this.getPortfolios();
      const accounts = await this.getAllAccounts();
      const trades = await this.getAllTrades();
      const settings = await this.getAllSettings();

      return {
        portfolios,
        accounts,
        trades,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data: any): Promise<void> {
    try {
      await this.clearAllData();

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

      if (data.trades) {
        await this.bulkInsertTrades(data.trades);
      }

      if (data.settings) {
        for (const setting of data.settings) {
          await this.setSetting(setting.key, setting.value);
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const stores = ['trades', 'accounts', 'portfolios', 'settings', 'users'];
      for (const storeName of stores) {
        const store = await this.getStore(storeName, 'readwrite');
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  private async getAllAccounts(): Promise<Account[]> {
    try {
      const store = await this.getStore('accounts');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all accounts:', error);
      return [];
    }
  }

  private async getAllTrades(): Promise<Trade[]> {
    try {
      const store = await this.getStore('trades');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all trades:', error);
      return [];
    }
  }

  private async getAllSettings(): Promise<any[]> {
    try {
      const store = await this.getStore('settings');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all settings:', error);
      return [];
    }
  }
}

// Mobile Platform: SQLite Implementation
class SQLiteStorage {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'quantum_risk_coach.db';
  private readonly DB_SECRET_KEY = 'qlarity-256bit-secret';

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.sqlite = new SQLiteConnection(CapacitorSQLite);
      this.db = await this.sqlite.createConnection(
        this.DB_NAME, 
        false, 
        'encryption', 
        this.DB_SECRET_KEY, 
        1
      );
      await this.db.open();
      await this._applySchema();
      console.log('✅ SQLite database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing SQLite:', error);
      throw error;
    }
  }

  private async _applySchema(): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');

    const statements = `
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        portfolioId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        broker TEXT,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (portfolioId) REFERENCES portfolios(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        side TEXT NOT NULL,
        amount REAL NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        entryPrice REAL NOT NULL,
        exitPrice REAL,
        fee REAL DEFAULT 0,
        profit REAL,
        profitLoss REAL,
        status TEXT NOT NULL,
        entryDate TEXT NOT NULL,
        entryTime TEXT,
        exitDate TEXT,
        exitTime TEXT,
        riskReward REAL,
        riskRewardRatio REAL,
        strategy TEXT,
        tags TEXT,
        notes TEXT,
        exitReason TEXT,
        takeProfit REAL,
        stopLoss REAL,
        confidence REAL,
        confidenceRating REAL,
        emotion TEXT,
        mood TEXT,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        preferences TEXT,
        createdAt TEXT NOT NULL
      );
    `;

    await this.db.execute(statements);
  }

  // Implement all the same methods as IndexedDBStorage but using SQLite
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    await this.init();
    await this.db!.execute(`
      INSERT INTO portfolios (id, name, color, icon, createdAt) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      portfolio.id, 
      portfolio.name, 
      portfolio.color, 
      portfolio.icon || '', 
      portfolio.createdAt
    ]);
  }

  async getPortfolios(): Promise<Portfolio[]> {
    await this.init();
    const result = await this.db!.query('SELECT * FROM portfolios ORDER BY createdAt ASC');
    return result.values as Portfolio[];
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    await this.init();
    await this.db!.execute(`
      UPDATE portfolios SET name = ?, color = ?, icon = ? WHERE id = ?
    `, [portfolio.name, portfolio.color, portfolio.icon, portfolio.id]);
  }

  async deletePortfolio(id: string): Promise<void> {
    await this.init();
    await this.db!.execute('DELETE FROM portfolios WHERE id = ?', [id]);
  }

  // Account operations
  async createAccount(account: Account): Promise<void> {
    await this.init();
    await this.db!.execute(`
      INSERT INTO accounts (id, portfolioId, name, type, broker, balance, currency, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [account.id, account.portfolioId, account.name, account.type, account.broker, account.balance, account.currency, account.createdAt]);
  }

  async getAccounts(portfolioId: string): Promise<Account[]> {
    await this.init();
    const result = await this.db!.query('SELECT * FROM accounts WHERE portfolioId = ?', [portfolioId]);
    return result.values as Account[];
  }

  async updateAccount(account: Account): Promise<void> {
    await this.init();
    await this.db!.execute(`
      UPDATE accounts SET name = ?, type = ?, broker = ?, balance = ?, currency = ? WHERE id = ?
    `, [account.name, account.type, account.broker, account.balance, account.currency, account.id]);
  }

  async deleteAccount(id: string): Promise<void> {
    await this.init();
    await this.db!.execute('DELETE FROM accounts WHERE id = ?', [id]);
  }

  async createTrade(trade: Trade): Promise<void> {
    await this.init();
    await this.db!.execute(`
      INSERT INTO trades (
        id, accountId, symbol, type, side, amount, quantity, 
        price, entryPrice, exitPrice, fee, profit, profitLoss, 
        status, entryDate, entryTime, exitDate, exitTime, 
        riskReward, riskRewardRatio, strategy, tags, notes, 
        exitReason, takeProfit, stopLoss, confidence, 
        confidenceRating, emotion, mood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      trade.id, 
      trade.accountId || '', 
      trade.symbol, 
      trade.type, 
      trade.side, 
      trade.amount || 0, 
      trade.quantity || 0, 
      trade.price || 0, 
      trade.entryPrice || 0, 
      trade.exitPrice || null, 
      trade.fee || 0, 
      trade.profit || 0, 
      trade.profitLoss || 0, 
      trade.status || 'open', 
      trade.entryDate || new Date().toISOString(), 
      trade.entryTime || null, 
      trade.exitDate || null, 
      trade.exitTime || null, 
      trade.riskReward || null, 
      trade.riskRewardRatio || null, 
      trade.strategy || null, 
      trade.tags ? trade.tags.join(',') : null, 
      trade.notes || null, 
      trade.exitReason || null, 
      trade.takeProfit || null, 
      trade.stopLoss || null, 
      trade.confidence || null, 
      trade.confidenceRating || null, 
      trade.emotion || null, 
      trade.mood || null
    ]);
  }

  async getTrades(accountId?: string): Promise<Trade[]> {
    await this.init();
    if (accountId) {
      const result = await this.db!.query('SELECT * FROM trades WHERE accountId = ? ORDER BY entryDate DESC', [accountId]);
      return result.values as Trade[];
    } else {
      const result = await this.db!.query('SELECT * FROM trades ORDER BY entryDate DESC');
      return result.values as Trade[];
    }
  }

  async updateTrade(trade: Trade): Promise<void> {
    await this.init();
    await this.db!.execute(`
      UPDATE trades SET 
        symbol = ?, type = ?, side = ?, amount = ?, quantity = ?, 
        price = ?, entryPrice = ?, exitPrice = ?, fee = ?, 
        profit = ?, profitLoss = ?, status = ?, entryDate = ?, 
        entryTime = ?, exitDate = ?, exitTime = ?, riskReward = ?, 
        riskRewardRatio = ?, strategy = ?, tags = ?, notes = ?, 
        exitReason = ?, takeProfit = ?, stopLoss = ?, 
        confidence = ?, confidenceRating = ?, emotion = ?, mood = ? 
      WHERE id = ?
    `, [
      trade.symbol, 
      trade.type, 
      trade.side, 
      trade.amount || 0, 
      trade.quantity || 0, 
      trade.price || 0, 
      trade.entryPrice || 0, 
      trade.exitPrice || null, 
      trade.fee || 0, 
      trade.profit || 0, 
      trade.profitLoss || 0, 
      trade.status || 'open', 
      trade.entryDate || new Date().toISOString(), 
      trade.entryTime || null, 
      trade.exitDate || null, 
      trade.exitTime || null, 
      trade.riskReward || null, 
      trade.riskRewardRatio || null, 
      trade.strategy || null, 
      trade.tags ? trade.tags.join(',') : null, 
      trade.notes || null, 
      trade.exitReason || null, 
      trade.takeProfit || null, 
      trade.stopLoss || null, 
      trade.confidence || null, 
      trade.confidenceRating || null, 
      trade.emotion || null, 
      trade.mood || null, 
      trade.id
    ]);
  }

  async deleteTrade(id: string): Promise<void> {
    await this.init();
    await this.db!.execute('DELETE FROM trades WHERE id = ?', [id]);
  }

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    await this.init();
    for (const trade of trades) {
      await this.createTrade(trade);
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.init();
    await this.db!.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      key, 
      typeof value === 'string' ? value : JSON.stringify(value)
    ]);
  }

  async getSetting(key: string): Promise<any> {
    await this.init();
    const result = await this.db!.query('SELECT value FROM settings WHERE key = ?', [key]);
    if (result.values && result.values.length > 0) {
      return JSON.parse(result.values[0].value);
    }
    return null;
  }

  async createUser(username: string, userData: any): Promise<void> {
    await this.init();
    await this.db!.execute('INSERT OR REPLACE INTO users (username, preferences, createdAt) VALUES (?, ?, ?)', 
      [
        username, 
        typeof userData === 'string' ? userData : JSON.stringify(userData), 
        new Date().toISOString()
      ]
    );
  }

  async getUser(username: string): Promise<any> {
    await this.init();
    const result = await this.db!.query('SELECT * FROM users WHERE username = ?', [username]);
    if (result.values && result.values.length > 0) {
      const user = result.values[0];
      return { ...user, preferences: JSON.parse(user.preferences) };
    }
    return null;
  }

  async getAllUsers(): Promise<any[]> {
    await this.init();
    const result = await this.db!.query('SELECT * FROM users');
    return (result.values || []).map(user => ({
      ...user,
      preferences: JSON.parse(user.preferences)
    }));
  }

  async exportData(): Promise<any> {
    await this.init();
    const portfolios = await this.getPortfolios();
    const accounts = await this.db!.query('SELECT * FROM accounts').then(r => r.values || []);
    const trades = await this.db!.query('SELECT * FROM trades').then(r => r.values || []);
    const settings = await this.db!.query('SELECT * FROM settings').then(r => r.values || []);

    return {
      portfolios,
      accounts,
      trades,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  async importData(data: any): Promise<void> {
    await this.init();
    await this.clearAllData();

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

    if (data.trades) {
      await this.bulkInsertTrades(data.trades);
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await this.setSetting(setting.key, JSON.parse(setting.value));
      }
    }
  }

  async clearAllData(): Promise<void> {
    await this.init();
    await this.db!.execute('DELETE FROM trades');
    await this.db!.execute('DELETE FROM accounts');
    await this.db!.execute('DELETE FROM portfolios');
    await this.db!.execute('DELETE FROM settings');
    await this.db!.execute('DELETE FROM users');
  }
}

const getStorage = async (): Promise<IndexedDBStorage | SQLiteStorage> => {
  if (Capacitor.isNativePlatform()) {
    // Mobile Platform: SQLite
    try {
      const sqliteStorage = new SQLiteStorage();
      await sqliteStorage.init();
      console.log('✅ Using SQLite storage for mobile platform');
      return sqliteStorage;
    } catch (error) {
      console.warn('⚠️ SQLite initialization failed, falling back to IndexedDB:', error);
      const indexedDBStorage = new IndexedDBStorage();
      await indexedDBStorage.init();
      return indexedDBStorage;
    }
  } else {
    // Web Platform: IndexedDB
    const indexedDBStorage = new IndexedDBStorage();
    await indexedDBStorage.init();
    console.log('✅ Using IndexedDB storage for web platform');
    return indexedDBStorage;
  }
};

export const localDatabase = await getStorage(); 