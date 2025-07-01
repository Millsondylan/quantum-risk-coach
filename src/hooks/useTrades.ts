
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching trades for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching trades:', fetchError);
        throw fetchError;
      }
      
      console.log('Fetched trades:', data?.length || 0);
      setTrades(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trades';
      console.error('useTrades fetchTrades error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Adding trade:', tradeData);
      
      const { data, error: insertError } = await supabase
        .from('trades')
        .insert([
          {
            ...tradeData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding trade:', insertError);
        throw insertError;
      }
      
      console.log('Trade added:', data);
      setTrades(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add trade';
      console.error('useTrades addTrade error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      console.log('Updating trade:', id, updates);
      
      const { data, error: updateError } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id) // Ensure user can only update their own trades
        .select()
        .single();

      if (updateError) {
        console.error('Error updating trade:', updateError);
        throw updateError;
      }
      
      console.log('Trade updated:', data);
      setTrades(prev => prev.map(trade => trade.id === id ? data : trade));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trade';
      console.error('useTrades updateTrade error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      console.log('Deleting trade:', id);
      
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Ensure user can only delete their own trades

      if (deleteError) {
        console.error('Error deleting trade:', deleteError);
        throw deleteError;
      }
      
      console.log('Trade deleted');
      setTrades(prev => prev.filter(trade => trade.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trade';
      console.error('useTrades deleteTrade error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageProfit: 0,
        maxDrawdown: 0,
      };
    }

    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.profit_loss !== null);
    const winningTrades = closedTrades.filter(trade => (trade.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit_loss || 0) < 0);
    
    const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const averageProfit = closedTrades.length > 0 ? totalProfit / closedTrades.length : 0;
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;

    closedTrades.forEach(trade => {
      runningTotal += trade.profit_loss || 0;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalProfit,
      averageProfit,
      maxDrawdown,
    };
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  return {
    trades,
    loading,
    error,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
    getPerformanceMetrics,
  };
};
