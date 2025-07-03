import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

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
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  fee: number;
  profit?: number;
  status: 'open' | 'closed' | 'cancelled';
  entryDate: string;
  exitDate?: string;
  riskReward?: number;
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

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
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
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Portfolio operations
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(portfolio);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPortfolios(): Promise<Portfolio[]> {
    const store = await this.getStore('portfolios');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(portfolio);
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
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(account);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAccounts(portfolioId: string): Promise<Account[]> {
    const store = await this.getStore('accounts');
    const index = store.index('portfolioId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(portfolioId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAccount(account: Account): Promise<void> {
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(account);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrades(accountId: string): Promise<Trade[]> {
    const store = await this.getStore('trades');
    const index = store.index('accountId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(accountId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTrade(trade: Trade): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const promises = trades.map(trade => {
        return new Promise<void>((res, rej) => {
          const request = store.add(trade);
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  }

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    const store = await this.getStore('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value: JSON.stringify(value) });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    const store = await this.getStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? JSON.parse(result.value) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // User operations
  async createUser(username: string, userData: any): Promise<void> {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ username, ...userData, createdAt: new Date().toISOString() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(username: string): Promise<any> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.get(username);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<any[]> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export/Import functionality
  async exportData(): Promise<any> {
    const portfolios = await this.getPortfolios();
    const accounts = await this.getStore('accounts').then(store => 
      new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
    const trades = await this.getStore('trades').then(store => 
      new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
    const settings = await this.getStore('settings').then(store => 
      new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );

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
    // Clear existing data
    await this.clearAllData();

    // Import new data
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
    const stores = ['portfolios', 'accounts', 'trades', 'settings', 'users'];
    for (const storeName of stores) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Mobile Platform: SQLite Implementation (existing code with improvements)
class SQLiteStorage {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'quantum_risk_coach.db';
  private readonly DB_SECRET_KEY = 'qlarity-256bit-secret';

  async init(): Promise<void> {
    if (this.db) return;

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
        side TEXT NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        fee REAL DEFAULT 0,
        profit REAL,
        status TEXT NOT NULL,
        entryDate TEXT NOT NULL,
        exitDate TEXT,
        riskReward REAL,
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
    `, [portfolio.id, portfolio.name, portfolio.color, portfolio.icon, portfolio.createdAt]);
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

  async createTrade(trade: Trade): Promise<void> {
    await this.init();
    await this.db!.execute(`
      INSERT INTO trades (id, accountId, symbol, side, amount, price, fee, profit, status, entryDate, exitDate, riskReward) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [trade.id, trade.accountId, trade.symbol, trade.side, trade.amount, trade.price, trade.fee, trade.profit, trade.status, trade.entryDate, trade.exitDate, trade.riskReward]);
  }

  async getTrades(accountId: string): Promise<Trade[]> {
    await this.init();
    const result = await this.db!.query('SELECT * FROM trades WHERE accountId = ? ORDER BY entryDate DESC', [accountId]);
    return result.values as Trade[];
  }

  async updateTrade(trade: Trade): Promise<void> {
    await this.init();
    await this.db!.execute(`
      UPDATE trades SET symbol = ?, side = ?, amount = ?, price = ?, fee = ?, profit = ?, status = ?, entryDate = ?, exitDate = ?, riskReward = ? WHERE id = ?
    `, [trade.symbol, trade.side, trade.amount, trade.price, trade.fee, trade.profit, trade.status, trade.entryDate, trade.exitDate, trade.riskReward, trade.id]);
  }

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    await this.init();
    for (const trade of trades) {
      await this.createTrade(trade);
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.init();
    await this.db!.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
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
      [username, JSON.stringify(userData), new Date().toISOString()]);
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

// Unified Database Interface
let storage: IndexedDBStorage | SQLiteStorage;

const getStorage = async (): Promise<IndexedDBStorage | SQLiteStorage> => {
  if (!storage) {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      storage = new IndexedDBStorage();
      await storage.init();
    } else {
      storage = new SQLiteStorage();
      await storage.init();
    }
  }
  return storage;
};

// Export the unified database interface
export const database = {
  // Portfolio operations
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    const db = await getStorage();
    return db.createPortfolio(portfolio);
  },

  async getPortfolios(): Promise<Portfolio[]> {
    const db = await getStorage();
    return db.getPortfolios();
  },

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    const db = await getStorage();
    return db.updatePortfolio(portfolio);
  },

  async deletePortfolio(id: string): Promise<void> {
    const db = await getStorage();
    return db.deletePortfolio(id);
  },

  // Account operations
  async createAccount(account: Account): Promise<void> {
    const db = await getStorage();
    return db.createAccount(account);
  },

  async getAccounts(portfolioId: string): Promise<Account[]> {
    const db = await getStorage();
    return db.getAccounts(portfolioId);
  },

  async updateAccount(account: Account): Promise<void> {
    const db = await getStorage();
    return db.updateAccount(account);
  },

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    const db = await getStorage();
    return db.createTrade(trade);
  },

  async getTrades(accountId: string): Promise<Trade[]> {
    const db = await getStorage();
    return db.getTrades(accountId);
  },

  async updateTrade(trade: Trade): Promise<void> {
    const db = await getStorage();
    return db.updateTrade(trade);
  },

  async bulkInsertTrades(trades: Trade[]): Promise<void> {
    const db = await getStorage();
    return db.bulkInsertTrades(trades);
  },

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    const db = await getStorage();
    return db.setSetting(key, value);
  },

  async getSetting(key: string): Promise<any> {
    const db = await getStorage();
    return db.getSetting(key);
  },

  // User operations
  async createUser(username: string, userData: any): Promise<void> {
    const db = await getStorage();
    return db.createUser(username, userData);
  },

  async getUser(username: string): Promise<any> {
    const db = await getStorage();
    return db.getUser(username);
  },

  async getAllUsers(): Promise<any[]> {
    const db = await getStorage();
    return db.getAllUsers();
  },

  // Data export/import
  async exportData(): Promise<any> {
    const db = await getStorage();
    return db.exportData();
  },

  async importData(data: any): Promise<void> {
    const db = await getStorage();
    return db.importData(data);
  },

  async clearAllData(): Promise<void> {
    const db = await getStorage();
    return db.clearAllData();
  },

  // Legacy methods for compatibility
  async getAccountsByPortfolioId(portfolioId: string): Promise<Account[]> {
    return this.getAccounts(portfolioId);
  },

  async updateAccountBalance(accountId: string, balance: number): Promise<void> {
    const accounts = await this.getAccounts('');
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      account.balance = balance;
      await this.updateAccount(account);
    }
  },

  async getTradesByPortfolioId(portfolioId: string): Promise<Trade[]> {
    const accounts = await this.getAccounts(portfolioId);
    const allTrades: Trade[] = [];
    for (const account of accounts) {
      const trades = await this.getTrades(account.id);
      allTrades.push(...trades);
    }
    return allTrades;
  }
};

export default database; 