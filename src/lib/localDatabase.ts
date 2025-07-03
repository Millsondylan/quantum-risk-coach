import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

/*
 * Local encrypted database wrapper (production-ready)
 * ==================================================
 * ‑ Uses @capacitor-community/sqlite which supports full SQLCipher
 * ‑ Automatically provisions the database on first launch with the schema
 * ‑ All access is performed through typed helper functions so the rest of the
 *   app never touches raw SQL.  If the schema changes, only this file needs
 *   updating.
 *
 * Tables
 * -------
 * 1. portfolios   – user-defined containers for one or more accounts
 * 2. accounts     – broker or manual journals. FK → portfolios.id
 * 3. trades       – every trade (live or manual). FK → accounts.id
 * 4. settings     – misc key/value pairs for the app
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
  id: string;          // uuid (broker trade id if available)
  accountId: string;   // fk
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

const DB_NAME = 'quantum_risk_coach.db';
const DB_SECRET_KEY = 'qlarity-256bit-secret'; // ⚠️ Replace at build time via env var

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection | null = null;

export const database = {
  /**
   * Opens (or creates) the encrypted database and ensures schema is installed.
   */
  async init() {
    if (db) return db; // already open
    if (!sqlite) {
      sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    const platform = Capacitor.getPlatform();

    db = await sqlite.createConnection(DB_NAME, false, 'encryption', DB_SECRET_KEY, 1);
    await db.open();

    if (platform === 'web') {
      // For web platform we need to save the database to IndexedDB
      await sqlite.saveToStore(DB_NAME);
    }

    await this._applySchema();
    return db;
  },

  async _applySchema() {
    if (!db) throw new Error('DB not initialized');

    const statements = `
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        portfolioId TEXT NOT NULL,
        type TEXT NOT NULL,
        broker TEXT,
        credentials TEXT,
        balance REAL DEFAULT 0,
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
    `;

    const res = await db!.execute(statements);
    if (res.changes?.changes === 0) return; // schema already applied
  },

  /********************** Portfolios ************************/ 
  async createPortfolio(portfolio: Portfolio & { createdAt?: string }): Promise<void> {
    const db = await this.init();
    await db.execute(`
      INSERT INTO portfolios 
      (id, name, color, icon, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      portfolio.id, 
      portfolio.name, 
      portfolio.color, 
      portfolio.icon || null,
      portfolio.createdAt || new Date().toISOString()
    ]);
  },

  async getPortfolios(): Promise<Portfolio[]> {
    await this.init();
    const query = `SELECT * FROM portfolios ORDER BY createdAt ASC`;
    const res = await db!.query(query);
    return res.values as Portfolio[];
  },

  /********************** Accounts ************************/ 
  async createAccount(account: Account & { createdAt?: string }): Promise<void> {
    const db = await this.init();
    await db.execute(`
      INSERT INTO accounts 
      (id, portfolio_id, name, type, broker, balance, currency, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      account.id,
      account.portfolioId,
      account.name,
      account.type,
      account.broker || null,
      account.balance,
      account.currency,
      account.createdAt || new Date().toISOString()
    ]);
  },

  async getAccounts(portfolioId: string): Promise<Account[]> {
    await this.init();
    const res = await db!.query(`SELECT * FROM accounts WHERE portfolioId = ?`, [portfolioId]);
    return res.values as Account[];
  },

  async getAccountsByPortfolioId(portfolioId: string): Promise<Account[]> {
    const db = await this.init();
    const result = await db.query(`
      SELECT * FROM accounts 
      WHERE portfolio_id = ?
    `, [portfolioId]);
    
    return result.values || [];
  },

  async updateAccountBalance(accountId: string, balance: number): Promise<void> {
    const db = await this.init();
    await db.execute(`
      UPDATE accounts 
      SET balance = ? 
      WHERE id = ?
    `, [balance, accountId]);
  },

  /********************** Trades ************************/ 
  async bulkInsertTrades(trades: Trade[]) {
    await this.init();
    await db!.run('BEGIN TRANSACTION');
    try {
      const stmt = await db!.prepare(`INSERT OR REPLACE INTO trades 
        (id, accountId, symbol, side, amount, price, fee, profit, status, entryDate, exitDate, riskReward) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
      for (const t of trades) {
        await stmt.run([
          t.id,
          t.accountId,
          t.symbol,
          t.side,
          t.amount,
          t.price,
          t.fee,
          t.profit ?? null,
          t.status,
          t.entryDate,
          t.exitDate ?? null,
          t.riskReward ?? null,
        ]);
      }
      await stmt.finalize();
      await db!.run('COMMIT');
    } catch (err) {
      await db!.run('ROLLBACK');
      throw err;
    }
  },

  async getTrades(accountId: string): Promise<Trade[]> {
    await this.init();
    const res = await db!.query(`SELECT * FROM trades WHERE accountId = ? ORDER BY entryDate DESC`, [accountId]);
    return res.values as Trade[];
  },

  async getTradesByPortfolioId(portfolioId: string): Promise<any[]> {
    const db = await this.init();
    const result = await db.query(`
      SELECT * FROM trades 
      WHERE portfolio_id = ?
      ORDER BY entry_time DESC
    `, [portfolioId]);
    
    return result.values || [];
  },

  /********************** Settings ************************/ 
  async setSetting(key: string, value: string) {
    await this.init();
    await db!.run(`INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)`, [key, value]);
  },
  async getSetting(key: string): Promise<string | null> {
    await this.init();
    const res = await db!.query(`SELECT value FROM settings WHERE key = ?`, [key]);
    return res.values?.[0]?.value ?? null;
  },

  async createTrade(trade: {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    entryTime: string;
    exitTime: string;
    portfolioId: string;
  }): Promise<void> {
    const db = await this.init();
    await db.execute(`
      INSERT INTO trades 
      (symbol, entry_price, exit_price, quantity, entry_time, exit_time, portfolio_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      trade.symbol, 
      trade.entryPrice, 
      trade.exitPrice, 
      trade.quantity, 
      trade.entryTime, 
      trade.exitTime, 
      trade.portfolioId
    ]);
  },
}; 