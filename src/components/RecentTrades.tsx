import React, { memo, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Clock, DollarSign, Filter, Search, Eye, BarChart3, Target, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/utils';

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
  const getTradeStatusColor = (status: string | null, profitLoss: number | null) => {
    if (status === 'open') return 'text-yellow-400';
    if (profitLoss && profitLoss > 0) return 'text-green-400';
    if (profitLoss && profitLoss < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getTradeTypeIcon = (tradeType: string | null) => {
    return tradeType === 'buy' ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskRewardDisplay = (trade: any) => {
    if (trade.entry_price && trade.stop_loss && trade.take_profit) {
      const risk = Math.abs(trade.entry_price - trade.stop_loss);
      const reward = Math.abs(trade.take_profit - trade.entry_price);
      if (risk > 0) {
        return `${(reward / risk).toFixed(1)}:1`;
      }
    }
    return '--';
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg transition-colors ${
            trade.trade_type === 'buy' ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-red-500/10 group-hover:bg-red-500/20'
          }`}>
            {getTradeTypeIcon(trade.trade_type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-white">{trade.instrument}</p>
              <Badge variant={trade.status === 'open' ? 'default' : 'outline'} className="text-xs">
                {trade.status || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span>{trade.lot_size ? `${trade.lot_size} lots` : 'N/A'}</span>
              <span>R:R {getRiskRewardDisplay(trade)}</span>
              {trade.duration && <span>{trade.duration}min</span>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className={`font-semibold ${getTradeStatusColor(trade.status, trade.profit_loss)}`}>
            {trade.profit_loss ? formatCurrency(trade.profit_loss) : '--'}
          </p>
          <p className="text-xs text-slate-400">
            {trade.entry_price ? `Entry: ${trade.entry_price}` : '--'}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-slate-300 font-medium">
            {formatDate(trade.opened_at)}
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <span>{trade.source || 'Manual'}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-1">
          <div className={`w-2 h-2 rounded-full ${
            trade.status === 'open' ? 'bg-yellow-400' :
            trade.profit_loss > 0 ? 'bg-green-400' : 'bg-red-400'
          }`} />
          {trade.confidence && (
            <div className="text-xs text-slate-400">{trade.confidence}/10</div>
          )}
        </div>
      </div>
    </div>
  );
});

TradeItem.displayName = 'TradeItem';

const RecentTrades = () => {
  const navigate = useNavigate();
  const { trades, loading } = useTrades();
  const [filters, setFilters] = useState<TradeFilters>({
    status: 'all',
    timeframe: '7d',
    instrument: 'all',
    searchText: ''
  });
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [showMetrics, setShowMetrics] = useState(true);

  // Memoized filtered and sorted trades for better performance
  const filteredTrades = useMemo(() => {
    let filtered = trades;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(trade => trade.status === filters.status);
    }

    if (filters.instrument !== 'all') {
      filtered = filtered.filter(trade => trade.instrument === filters.instrument);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.instrument?.toLowerCase().includes(searchLower)
      );
    }

    // Apply timeframe filter
    const now = new Date();
    const timeframeDays = filters.timeframe === '1d' ? 1 : 
                         filters.timeframe === '7d' ? 7 :
                         filters.timeframe === '30d' ? 30 : 365;
    
    const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
    filtered = filtered.filter(trade => 
      trade.opened_at && new Date(trade.opened_at) >= cutoffDate
    );

    // Sort by most recent first
    return filtered.sort((a, b) => {
      const dateA = new Date(a.opened_at || 0).getTime();
      const dateB = new Date(b.opened_at || 0).getTime();
      return dateB - dateA;
    });
  }, [trades, filters]);

  // Memoized performance metrics calculation
  const tradeMetrics = useMemo((): TradeMetrics => {
    const closedTrades = filteredTrades.filter(trade => 
      trade.status === 'closed' && trade.profit_loss !== null
    );
    
    const openTrades = filteredTrades.filter(trade => trade.status === 'open');
    
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
      sharpeRatio: 0, // Would need risk-free rate calculation
      maxDrawdown: 0, // Would need equity curve calculation
      activeTrades: openTrades.length,
      todaysPnL
    };
  }, [filteredTrades]);

  // Memoized unique instruments for filter dropdown
  const uniqueInstruments = useMemo(() => {
    const instruments = trades.map(trade => trade.instrument).filter(Boolean);
    return [...new Set(instruments)];
  }, [trades]);

  const handleTradeClick = useCallback((trade: any) => {
    navigate(`/trade/${trade.id}`);
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    // Refresh would be implemented when backend supports it
    window.location.reload();
  }, []);

  const handleFilterChange = useCallback((key: keyof TradeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-20 bg-slate-500/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          <Badge variant="outline" className="text-slate-400">
            {filteredTrades.length} trades
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setShowMetrics(!showMetrics)}>
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate('/journal')}
            className="holo-button"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      {showMetrics && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/30">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Total P&L</p>
              <p className={`text-lg font-semibold ${tradeMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(tradeMetrics.totalPnL)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Win Rate</p>
              <p className="text-lg font-semibold text-blue-400">{tradeMetrics.winRate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Profit Factor</p>
              <p className="text-lg font-semibold text-purple-400">{tradeMetrics.profitFactor.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Best Trade</p>
              <p className="text-lg font-semibold text-green-400">{formatCurrency(tradeMetrics.bestTrade)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Active Trades</p>
              <p className="text-lg font-semibold text-yellow-400">{tradeMetrics.activeTrades}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Today's P&L</p>
              <p className={`text-lg font-semibold ${tradeMetrics.todaysPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(tradeMetrics.todaysPnL)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Search trades..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              className="h-9"
            />
          </div>
          <Select value={filters.timeframe} onValueChange={(value) => handleFilterChange('timeframe', value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
              <SelectItem value="1y">1Y</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {uniqueInstruments.length > 0 && (
            <Select value={filters.instrument} onValueChange={(value) => handleFilterChange('instrument', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                {uniqueInstruments.map(instrument => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <div className="p-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-16 h-16 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Trades Found</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {filters.searchText || filters.status !== 'all' || filters.instrument !== 'all' 
              ? 'No trades match your current filters. Try adjusting your search criteria.'
              : 'Start tracking your trades by adding your first trade entry. You can manually add trades or connect your MT4/5 account for automatic sync.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/journal')}
              className="holo-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
            <Button 
              onClick={() => navigate('/connect-mt4')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Connect MT4/5
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredTrades.slice(0, 10).map((trade) => (
              <TradeItem
                key={trade.id}
                trade={trade}
                onClick={() => handleTradeClick(trade)}
              />
            ))}
          </div>

          {filteredTrades.length > 10 && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/journal')}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                View All {filteredTrades.length} Trades
              </Button>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            {tradeMetrics.activeTrades > 0 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                {tradeMetrics.activeTrades} active position{tradeMetrics.activeTrades > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
              <Target className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/strategy-analyzer')}>
              <Zap className="w-4 h-4 mr-2" />
              AI Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RecentTrades);
