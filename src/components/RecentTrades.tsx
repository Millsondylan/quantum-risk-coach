import React, { useState, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Clock, DollarSign, Filter, Search, Eye, BarChart3, Target, Zap, RefreshCw, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/utils';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface TradeMetrics {
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  activeTrades: number;
  todaysPnL: number;
}

interface TradeFilters {
  status: string;
  timeframe: string;
  instrument: string;
  searchText: string;
}

// Memoized trade item component for better performance
const TradeItem = memo(({ trade, onClick }: { trade: any; onClick: () => void }) => {
  const getTradeStatusColor = useCallback((status: string | null, profitLoss: number | null) => {
    if (status === 'open') return 'text-yellow-400';
    if (profitLoss && profitLoss > 0) return 'text-green-400';
    if (profitLoss && profitLoss < 0) return 'text-red-400';
    return 'text-slate-400';
  }, []);

  const getTradeTypeIcon = useCallback((tradeType: string | null) => {
    return tradeType === 'buy' ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    );
  }, []);

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getRiskRewardDisplay = useCallback((trade: any) => {
    if (trade.entry_price && trade.stop_loss && trade.take_profit) {
      const risk = Math.abs(trade.entry_price - trade.stop_loss);
      const reward = Math.abs(trade.take_profit - trade.entry_price);
      if (risk > 0) {
        return `${(reward / risk).toFixed(1)}:1`;
      }
    }
    return '--';
  }, []);

  const statusColor = getTradeStatusColor(trade.status, trade.profit_loss);
  const tradeIcon = getTradeTypeIcon(trade.type);
  const formattedDate = formatDate(trade.entry_date || trade.created_at);
  const riskReward = getRiskRewardDisplay(trade);
  const formattedPnL = formatCurrency(trade.profit_loss);

  return (
    <div 
      className="p-4 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
           {tradeIcon}
           <span className="font-medium text-white">{trade.symbol}</span>
           <Badge 
             variant={trade.status === 'open' ? 'default' : 'outline'}
             className={cn(
               'text-xs',
               trade.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700'
             )}
           >
             {trade.status?.toUpperCase()}
           </Badge>
         </div>
        <span className={cn('font-semibold', statusColor)}>
          {formattedPnL}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            <span>Entry</span>
          </div>
          <span className="text-white">{formattedDate}</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span>R:R</span>
          </div>
          <span className="text-white">{riskReward}</span>
        </div>
      </div>
    </div>
  );
});

TradeItem.displayName = 'TradeItem';

// Memoized performance metrics calculation
const useTradeMetrics = (trades: any[]) => {
  return useMemo((): TradeMetrics => {
    const closedTrades = trades.filter(trade => 
      trade.status === 'closed' && trade.profit_loss !== null
    );
    
    const openTrades = trades.filter(trade => trade.status === 'open');
    
    if (closedTrades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        activeTrades: openTrades.length,
        todaysPnL: 0
      };
    }

    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit_loss || 0) < 0);
    
    const winRate = (winningTrades.length / closedTrades.length) * 100;
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
      Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0) / losingTrades.length) : 0;
    
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    // Calculate today's P&L
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysPnL = closedTrades
      .filter(trade => trade.closed_at && new Date(trade.closed_at) >= today)
      .reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);

    return {
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      bestTrade: Math.max(...closedTrades.map(t => t.profit_loss || 0)),
      worstTrade: Math.min(...closedTrades.map(t => t.profit_loss || 0)),
      profitFactor,
      sharpeRatio: 1.2, // Placeholder
      maxDrawdown: -0.15, // Placeholder
      activeTrades: openTrades.length,
      todaysPnL
    };
  }, [trades]);
};

const RecentTrades = memo(() => {
  const navigate = useNavigate();
  const { trades, isLoading } = useTrades();
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Filter trades based on search term
  const filteredTrades = useMemo(() => {
    if (!debouncedSearchTerm) return trades;
    
    return trades.filter(trade => 
      trade.symbol?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      trade.status?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [trades, debouncedSearchTerm]);
  
  // Get performance metrics
  const metrics = useTradeMetrics(trades);
  
  // Use virtual scrolling for large lists
  const displayTrades = showAllTrades ? filteredTrades : filteredTrades.slice(0, 5);
  const virtualScroll = useVirtualScroll(displayTrades, {
    itemHeight: 120, // Approximate height of each trade item
    containerHeight: 600, // Container height
    overscan: 3
  });
  
  const handleTradeClick = useCallback((trade: any) => {
    navigate(`/journal?trade=${trade.id}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Trades</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTrades(!showAllTrades)}
              className="text-slate-400 hover:text-white"
            >
              {showAllTrades ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllTrades ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg">
          <div>
            <p className="text-sm text-slate-400">Total P&L</p>
            <p className={cn(
              'text-lg font-semibold',
              metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {formatCurrency(metrics.totalPnL)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Win Rate</p>
            <p className="text-lg font-semibold text-white">{metrics.winRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Trades</p>
            <p className="text-lg font-semibold text-white">{metrics.activeTrades}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Today's P&L</p>
            <p className={cn(
              'text-lg font-semibold',
              metrics.todaysPnL >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {formatCurrency(metrics.todaysPnL)}
            </p>
          </div>
        </div>

        {/* Virtual Scrolled Trade List */}
        <div 
          className="space-y-3 max-h-96 overflow-y-auto"
          onScroll={virtualScroll.handleScroll}
          style={{ height: '384px' }}
        >
          {virtualScroll.virtualItems.map((trade, index) => (
            <div
              key={trade.id}
              style={{
                transform: `translateY(${(virtualScroll.startIndex + index) * 120}px)`,
                position: 'absolute',
                width: '100%'
              }}
            >
              <TradeItem 
                trade={trade} 
                onClick={() => handleTradeClick(trade)} 
              />
            </div>
          ))}
        </div>

        {filteredTrades.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No trades found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentTrades.displayName = 'RecentTrades';

export default RecentTrades;
