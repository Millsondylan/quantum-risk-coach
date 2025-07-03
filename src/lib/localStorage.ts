import { Capacitor } from '@capacitor/core';
import { UserData, UserPreferences } from '@/types/user';
import { Trade as LocalDatabaseTrade } from '@/lib/localDatabase';
import { v4 as uuidv4 } from 'uuid';

/*
 * Local Storage Database - All data saved to user's device
 * ========================================================
 * 
 * Web Platform: Uses IndexedDB for persistent local storage
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
  startingBalance?: number;
}

export interface Account {
  id: string;
  portfolioId: string;
  name: string;
  broker: string;
  accountType: 'demo' | 'live';
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  connectionId?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  mood?: 'positive' | 'negative' | 'neutral' | 'excited' | 'stressed' | 'calm' | 'greedy' | 'fearful';
  tags: string[];
}

export type Trade = LocalDatabaseTrade;

// Web Platform: IndexedDB Implementation
export class IndexedDBStorage {
  private dbName = 'QuantumRiskCoachDB';
  private version = 3;
  private db: IDBDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;

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
          portfolioStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountStore.createIndex('portfolioId', 'portfolioId', { unique: false });
          accountStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('trades')) {
          const tradeStore = db.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
          tradeStore.createIndex('accountId', 'accountId', { unique: false });
        }
        if (!db.objectStoreNames.contains('journal_entries')) {
          db.createObjectStore('journal_entries', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: false });
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

  // Portfolio operations
  async createPortfolio(portfolio: Portfolio): Promise<void> {
    const store = await this.getStore('portfolios', 'readwrite');
    return new Promise((resolve, reject) => {
      const checkRequest = store.get(portfolio.id);
      checkRequest.onsuccess = () => {
        if (checkRequest.result) {
          resolve();
        } else {
          const addRequest = store.add({
            ...portfolio,
            startingBalance: portfolio.startingBalance || 0
          });
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      checkRequest.onerror = () => reject(checkRequest.error);
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
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(account);
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

  // Trade operations
  async addTrade(trade: LocalDatabaseTrade): Promise<string> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const id = trade.id || uuidv4();
      const addRequest = store.add({
        ...trade,
        id: id,
        entryTime: trade.entryTime || new Date().toISOString(),
        exitTime: trade.exitTime || new Date().toISOString(),
        profit: trade.profit || 0,
        quantity: trade.quantity || 0,
        entryPrice: trade.entryPrice || 0,
        exitPrice: trade.exitPrice || 0,
      });
      addRequest.onsuccess = () => resolve(id);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async updateTrade(trade: LocalDatabaseTrade): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrades(accountId?: string): Promise<LocalDatabaseTrade[]> {
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

  async getAllTrades(): Promise<LocalDatabaseTrade[]> {
    const store = await this.getStore('trades');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async bulkInsertTrades(trades: LocalDatabaseTrade[]): Promise<void> {
    const store = await this.getStore('trades', 'readwrite');
    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      trades.forEach(trade => {
        store.add({
          ...trade,
          id: trade.id || uuidv4(),
          entryTime: trade.entryTime || new Date().toISOString(),
          exitTime: trade.exitTime || new Date().toISOString(),
          profit: trade.profit || 0,
          quantity: trade.quantity || 0,
          entryPrice: trade.entryPrice || 0,
          exitPrice: trade.exitPrice || 0,
        });
      });
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

  async getTradesByPortfolioId(portfolioId: string): Promise<LocalDatabaseTrade[]> {
    const allAccounts = await this.getAccounts();
    const portfolioAccountIds = allAccounts
      .filter(account => account.portfolioId === portfolioId)
      .map(account => account.id);

    if (portfolioAccountIds.length === 0) {
      return [];
    }

    const allTrades = await this.getAllTrades();
    return allTrades.filter(trade => trade.accountId && portfolioAccountIds.includes(trade.accountId));
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
        if (request.result) {
          resolve(JSON.parse(request.result.value));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Journal Entry operations
  async createJournalEntry(entry: JournalEntry): Promise<string> {
    const store = await this.getStore('journal_entries', 'readwrite');
    return new Promise((resolve, reject) => {
      const id = entry.id || uuidv4();
      const addRequest = store.add({
        ...entry,
        id: id,
        date: entry.date || new Date().toISOString(),
        tags: JSON.stringify(entry.tags || []),
      });
      addRequest.onsuccess = () => resolve(id);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const store = await this.getStore('journal_entries');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.map((row: any) => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
      })));
      request.onerror = () => reject(request.error);
    });
  }

  async updateJournalEntry(entry: Partial<JournalEntry>): Promise<void> {
    const store = await this.getStore('journal_entries', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...entry,
        tags: entry.tags ? JSON.stringify(entry.tags) : undefined,
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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

  // User operations
  async createUser(username: string, userData: Partial<UserData>): Promise<UserData> {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const fullUserData: UserData = {
        id: userData.id || uuidv4(),
        name: username,
        username: username,
        preferences: userData.preferences || {} as UserPreferences,
        onboardingCompleted: userData.onboardingCompleted || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        lastActive: userData.lastActive || new Date().toISOString(),
      };

      const request = store.add(fullUserData);
      request.onsuccess = () => resolve(fullUserData);
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(username: string): Promise<UserData | null> {
    const store = await this.getStore('users');
    const index = store.index('username');
    return new Promise((resolve, reject) => {
      const request = index.get(username);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<UserData[]> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Data management operations
  async exportData(): Promise<any> {
    const portfolios = await this.getPortfolios();
    const accounts = await this.getAccounts();
    const trades = await this.getAllTrades();
    const settings = await this.getSetting(null); // Assuming getSetting can retrieve all if null is passed, otherwise needs a dedicated method
    const users = await this.getAllUsers();
    const journalEntries = await this.getJournalEntries();

    return {
      portfolios,
      accounts,
      trades,
      settings,
      users,
      journalEntries,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  async importData(data: any): Promise<void> {
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
      for (const trade of data.trades) {
        await this.addTrade(trade);
      }
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await this.setSetting(setting.key, setting.value);
      }
    }

    if (data.users) {
        for (const user of data.users) {
            const existingUser = await this.getUser(user.username);
            if (!existingUser) {
              await this.createUser(user.username, user);
            } else {
              await this.createUser(user.username, { ...existingUser, ...user });
            }
        }
    }
    if (data.journalEntries) {
        for (const entry of data.journalEntries) {
            await this.createJournalEntry(entry);
        }
    }
  }

  async clearAllData(): Promise<void> {
    const stores = ['portfolios', 'accounts', 'trades', 'settings', 'users', 'journal_entries'];
    for (const storeName of stores) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async updateAccountBalance(accountId: string, balance: number): Promise<void> {
    const store = await this.getStore('accounts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(accountId);
      request.onsuccess = () => {
        const account = request.result as Account;
        if (account) {
          const updatedAccount = { ...account, balance };
          const putRequest = store.put(updatedAccount);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Account not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const store = await this.getStore('accounts');
    return new Promise((resolve, reject) => {
      const request = store.get(accountId);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.balance);
        } else {
          resolve(0);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldData(): Promise<void> {
    try {
      const db = await this.ensureDatabase();
      const tx = db.transaction(['trades', 'journal_entries'], 'readwrite');
      
      const tradesStore = tx.objectStore('trades');
      const journalStore = tx.objectStore('journal_entries');

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      tradesStore.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const trade = cursor.value;
          if (trade.entryTime && new Date(trade.entryTime) < twoYearsAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      journalStore.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (entry.date && new Date(entry.date) < twoYearsAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }
}

// Storage utilities that work in both browser and Capacitor (moved from UserContext)
export const storage = {
  async set(key: string, value: any) {
    if (typeof window !== 'undefined') {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: JSON.stringify(value) });
      } catch {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  },
  
  async get(key: string) {
    if (typeof window !== 'undefined') {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } catch {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    }
    return null;
  },
  
  async remove(key: string) {
    if (typeof window !== 'undefined') {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
      } catch {
        localStorage.removeItem(key);
      }
    }
  },
  
  async clear() {
    if (typeof window !== 'undefined') {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.clear();
      } catch {
        localStorage.clear();
      }
    }
  }
}; 