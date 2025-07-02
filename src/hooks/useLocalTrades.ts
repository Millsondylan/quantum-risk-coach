import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { toast } from 'sonner'; // For notifications

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
  commission?: number;
}

export const useLocalTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TRADES_TABLE = 'trades'; // Supabase table name for trades

  // Load trades from Supabase
  const loadTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(TRADES_TABLE)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure dates are parsed correctly
        setTrades(data.map(trade => ({
          ...trade,
          entryDate: trade.entryDate || '',
          createdAt: trade.createdAt || '',
          updatedAt: trade.updatedAt || '',
        })) as Trade[]);
      }
    } catch (err: any) {
      setError(`Failed to load trades: ${err.message}`);
      toast.error(`Failed to load trades: ${err.message}`);
      console.error('Error loading trades:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save trades to Supabase (not directly used for all operations, but good for batch/sync)
  const saveTrades = useCallback(async (newTrades: Trade[]) => {
    // In a Supabase context, we typically interact with specific operations (insert, update, delete)
    // rather than saving the entire array. This function might be refactored or removed if not needed.
    // For now, it will act as a placeholder or a utility for bulk operations if designed.
    try {
      // This operation is generally not used for real-time sync in Supabase; individual adds/updates are preferred.
      // Consider removing or adapting this if a bulk upsert is not intended.
      console.warn('saveTrades: This function should ideally be replaced by explicit add/update/delete operations with Supabase.');
      // Example for bulk upsert (if needed):
      // const { error } = await supabase.from(TRADES_TABLE).upsert(newTrades, { onConflict: 'id' });
      // if (error) throw error;
      setTrades(newTrades);
    } catch (err: any) {
      setError(`Failed to save trades: ${err.message}`);
      toast.error(`Failed to save trades: ${err.message}`);
      console.error('Error saving trades:', err);
    }
  }, []);

  // Add a new trade
  const addTrade = useCallback(async (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'profitLoss' | 'profitLossPercent'>) => {
    const newTrade: Omit<Trade, 'id'> = {
      ...trade,
      status: trade.status || 'open', // Default status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure numeric values are numbers, not undefined
      entryPrice: Number(trade.entryPrice) || 0,
      quantity: Number(trade.quantity) || 0,
      stopLoss: trade.stopLoss !== undefined ? Number(trade.stopLoss) : undefined,
      takeProfit: trade.takeProfit !== undefined ? Number(trade.takeProfit) : undefined,
      commission: 0, // Assuming 0 if not provided or calculated elsewhere
    };

    try {
      const { data, error } = await supabase
        .from(TRADES_TABLE)
        .insert([newTrade])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const addedTrade = data[0];
        setTrades(prevTrades => [...prevTrades, addedTrade as Trade]);
        toast.success('Trade added successfully!');
        return addedTrade as Trade;
      }
      return null; 
    } catch (err: any) {
      setError(`Failed to add trade: ${err.message}`);
      toast.error(`Failed to add trade: ${err.message}`);
      console.error('Error adding trade:', err);
      return null;
    }
  }, [trades]);

  // Update an existing trade
  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    try {
      const { error } = await supabase
        .from(TRADES_TABLE)
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTrades(prevTrades =>
        prevTrades.map(trade =>
          trade.id === id ? { ...trade, ...updates, updatedAt: new Date().toISOString() } : trade
        )
      );
      toast.success('Trade updated successfully!');
    } catch (err: any) {
      setError(`Failed to update trade: ${err.message}`);
      toast.error(`Failed to update trade: ${err.message}`);
      console.error('Error updating trade:', err);
    }
  }, [trades]);

  // Delete a trade
  const deleteTrade = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from(TRADES_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== id));
      toast.success('Trade deleted successfully!');
    } catch (err: any) {
      setError(`Failed to delete trade: ${err.message}`);
      toast.error(`Failed to delete trade: ${err.message}`);
      console.error('Error deleting trade:', err);
    }
  }, [trades]);

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
    const largestWin = Math.max(0, ...closedTrades.map(trade => trade.profitLoss || 0));
    const largestLoss = Math.min(0, ...closedTrades.map(trade => trade.profitLoss || 0));

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let currentBalance = 0; // Assuming starting balance is 0 for P&L calculation here, adjust if needed

    // Sort trades by date to accurately calculate drawdown over time
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime());

    for (const trade of sortedTrades) {
      currentBalance += (trade.profitLoss || 0);
      if (currentBalance > peak) {
        peak = currentBalance;
      }
      // Ensure peak is not zero to avoid division by zero errors
      const drawdown = peak > 0 ? (peak - currentBalance) / peak : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    maxDrawdown = maxDrawdown * 100; // Convert to percentage

    // Calculate profit factor
    const grossProfits = closedTrades.filter(trade => (trade.profitLoss || 0) > 0).reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const grossLosses = closedTrades.filter(trade => (trade.profitLoss || 0) < 0).reduce((sum, trade) => sum + Math.abs(trade.profitLoss || 0), 0);
    const profitFactor = grossLosses > 0 ? (grossProfits / grossLosses) : (grossProfits > 0 ? Infinity : 0);

    // Calculate trading days
    const tradingDays = new Set(closedTrades.map(trade => new Date(trade.exitDate || trade.entryDate).toDateString())).size;

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
      maxDrawdown,
      profitFactor,
      tradingDays,
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