import { useState, useEffect, useCallback } from 'react';
import { saveUserData, getUserData } from '@/lib/localUserUtils';

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  profitLoss?: number;
  profitLossPercent?: number;
  notes?: string;
  tags?: string[];
  strategy?: string;
  riskReward?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const useLocalTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trades from local storage
  const loadTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedTrades = await getUserData('trades');
      if (storedTrades) {
        setTrades(storedTrades);
      }
    } catch (err) {
      setError('Failed to load trades');
      console.error('Error loading trades:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save trades to local storage
  const saveTrades = useCallback(async (newTrades: Trade[]) => {
    try {
      await saveUserData('trades', newTrades);
      setTrades(newTrades);
    } catch (err) {
      setError('Failed to save trades');
      console.error('Error saving trades:', err);
    }
  }, []);

  // Add a new trade
  const addTrade = useCallback(async (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrade: Trade = {
      ...trade,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTrades = [...trades, newTrade];
    await saveTrades(updatedTrades);
    return newTrade;
  }, [trades, saveTrades]);

  // Update an existing trade
  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    const updatedTrades = trades.map(trade => 
      trade.id === id 
        ? { ...trade, ...updates, updatedAt: new Date().toISOString() }
        : trade
    );
    await saveTrades(updatedTrades);
  }, [trades, saveTrades]);

  // Delete a trade
  const deleteTrade = useCallback(async (id: string) => {
    const updatedTrades = trades.filter(trade => trade.id !== id);
    await saveTrades(updatedTrades);
  }, [trades, saveTrades]);

  // Close a trade
  const closeTrade = useCallback(async (id: string, exitPrice: number, exitDate?: string) => {
    const trade = trades.find(t => t.id === id);
    if (!trade) return;

    const profitLoss = trade.type === 'buy' 
      ? (exitPrice - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - exitPrice) * trade.quantity;

    const profitLossPercent = (profitLoss / (trade.entryPrice * trade.quantity)) * 100;

    await updateTrade(id, {
      exitPrice,
      exitDate: exitDate || new Date().toISOString(),
      profitLoss,
      profitLossPercent,
      status: 'closed',
    });
  }, [trades, updateTrade]);

  // Get trade statistics
  const getTradeStats = useCallback(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    const openTrades = trades.filter(trade => trade.status === 'open');

    const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(trade => (trade.profitLoss || 0) > 0).length;
    const losingTrades = closedTrades.filter(trade => (trade.profitLoss || 0) < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const averageProfitLoss = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
    const largestWin = Math.max(...closedTrades.map(trade => trade.profitLoss || 0));
    const largestLoss = Math.min(...closedTrades.map(trade => trade.profitLoss || 0));

    return {
      totalProfitLoss,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageProfitLoss,
      largestWin,
      largestLoss,
      openTrades: openTrades.length,
    };
  }, [trades]);

  // Load trades on mount
  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    trades,
    isLoading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    closeTrade,
    getTradeStats,
    refreshTrades: loadTrades,
  };
}; 