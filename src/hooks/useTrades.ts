import { useState, useEffect } from 'react';
import { localDatabase } from '@/lib/localDatabase';
import { Trade } from '@/lib/localDatabase';
import { toast } from 'sonner';

export const useTrades = (accountId?: string) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const fetchedTrades = await localDatabase.getTrades(accountId);
      setTrades(fetchedTrades);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trades'));
    } finally {
      setLoading(false);
    }
  };

  const addTrade = async (trade: Trade) => {
    try {
      // Ensure the trade has an ID if not provided
      const tradeToAdd = {
        ...trade,
        id: trade.id || crypto.randomUUID(),
        // Set default values for optional fields
        type: trade.type || (trade.side === 'buy' ? 'long' : 'short'),
        status: trade.status || 'open',
        entryDate: trade.entryDate || new Date().toISOString(),
        entryTime: trade.entryTime || new Date().toISOString(),
        profit: trade.profit || 0,
        quantity: trade.quantity || trade.amount || 0
      };

      await localDatabase.createTrade(tradeToAdd);
      await fetchTrades();
      toast.success('Trade added');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add trade'));
      toast.error('Failed to add trade');
    }
  };

  const updateTrade = async (trade: Trade) => {
    try {
      await localDatabase.updateTrade(trade);
      await fetchTrades();
      toast.success('Trade updated');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update trade'));
      toast.error('Update failed');
    }
  };

  const deleteTrade = async (tradeId: string) => {
    try {
      await localDatabase.deleteTrade(tradeId);
      await fetchTrades();
      toast.success('Trade removed');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete trade'));
      toast.error('Delete failed');
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [accountId]);

  const getTradeStats = () => {
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
  };

  return {
    trades,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    fetchTrades,
    getTradeStats,
  };
};
