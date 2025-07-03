import { useState, useEffect, useCallback } from 'react';
import { localDatabase as database, Trade as DBTrade } from '@/lib/localStorage';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export interface LegacyTradeFields {
  type?: 'buy' | 'sell'; // alias for side
  entryPrice?: number;   // alias for price
  exitPrice?: number;
  quantity?: number;     // alias for amount
  profitLoss?: number;   // alias for profit
  profitLossPercent?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export type CombinedTrade = DBTrade & LegacyTradeFields;

export type TradeInput = Omit<CombinedTrade, 'id'>;

export const useTrades = (accountId: string) => {
  const [trades, setTrades] = useState<CombinedTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await database.getTrades(accountId);
      const mapped = data.map((t) => ({
        ...t,
        type: t.side,
        entryPrice: t.price,
        quantity: t.amount,
        profitLoss: t.profit,
        stopLoss: (t as any).stopLoss,
        takeProfit: (t as any).takeProfit,
      })) as CombinedTrade[];
      setTrades(mapped);
    } catch (err: any) {
      console.error('Failed to load trades', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      loadTrades();
    }
  }, [accountId, loadTrades]);

  const addTrade = useCallback(async (trade: TradeInput) => {
    try {
      const newTrade: DBTrade = {
        id: uuid(),
        ...trade,
      };
      await database.bulkInsertTrades([newTrade]);
      setTrades((prev) => [{ ...newTrade, type: newTrade.side, entryPrice: newTrade.price, quantity: newTrade.amount, profitLoss: newTrade.profit, stopLoss: (trade as any).stopLoss, takeProfit: (trade as any).takeProfit }, ...prev]);
      toast.success('Trade added');
    } catch (err: any) {
      toast.error('Failed to add trade');
      console.error(err);
    }
  }, [accountId]);

  const updateTrade = useCallback(async (id: string, updates: Partial<DBTrade>) => {
    try {
      const updated = trades.find((t) => t.id === id);
      if (!updated) return;
      const merged: DBTrade = { ...updated, ...updates } as DBTrade;
      await database.bulkInsertTrades([merged]); // upsert
      setTrades((prev) => prev.map((t) => (t.id === id ? merged : t)));
      toast.success('Trade updated');
    } catch (err) {
      toast.error('Update failed');
    }
  }, [trades]);

  const deleteTrade = useCallback(async (id: string) => {
    try {
      // SQLite: delete
      await database.init();
      const db = (await database.init());
      await db.run('DELETE FROM trades WHERE id = ?', [id]);
      setTrades((prev) => prev.filter((t) => t.id !== id));
      toast.success('Trade removed');
    } catch (err) {
      toast.error('Delete failed');
    }
  }, []);

  const getTradeStats = useCallback(() => {
    const closed = trades.filter((t) => t.status === 'closed');
    const wins = closed.filter((t) => (t.profit ?? 0) > 0);
    const losses = closed.filter((t) => (t.profit ?? 0) < 0);

    const totalPnL = closed.reduce((acc, t) => acc + (t.profit ?? 0), 0);
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;

    // Calculate additional stats needed by Journal and Index pages
    const totalProfitLoss = closed.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const totalTrades = closed.length;
    const winningTrades = wins.length;
    const losingTrades = losses.length;
    const openTrades = trades.filter((t) => t.status === 'open').length;
    const averageProfitLoss = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
    const largestWin = Math.max(0, ...closed.map(trade => trade.profit || 0));
    const largestLoss = Math.min(0, ...closed.map(trade => trade.profit || 0));

    return {
      totalProfitLoss,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      openTrades,
      averageProfitLoss,
      largestWin,
      largestLoss,
    };
  }, [trades]);

  return {
    trades,
    isLoading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    getTradeStats,
    refreshTrades: loadTrades,
  };
};
