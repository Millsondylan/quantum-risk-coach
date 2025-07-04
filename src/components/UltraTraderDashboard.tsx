import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';
import { formatPnL, formatPercentage } from '@/lib/pnlCalculator';
import { userInitializationService, getEmptyStateMessage } from '@/lib/userInitialization';

interface LiveTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: string;
}

const UltraTraderDashboard = () => {
  const navigate = useNavigate();
  const { trades, getTradeStats } = useTrades();
  const { user } = useUser();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Get real trade statistics
  const stats = getTradeStats();
  
  // Check if user is in clean state
  const isCleanState = userInitializationService.hasUserInputData(
    user || {} as any, 
    trades, 
    []
  ) === false;

  // Get live (open) trades
  const liveTrades: LiveTrade[] = trades
    .filter(trade => trade.status === 'open')
    .map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side as 'buy' | 'sell',
      entryPrice: trade.entryPrice,
      currentPrice: trade.exitPrice || trade.entryPrice, // Use exit price as current if available
      quantity: trade.quantity,
      pnl: trade.profitLoss || 0,
      pnlPercent: trade.profitLoss && trade.entryPrice ? 
        (trade.profitLoss / (trade.entryPrice * trade.quantity)) * 100 : 0,
      duration: formatDuration(trade.entryDate)
    }));

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDuration = (entryDate: string) => {
    const now = new Date();
    const entry = new Date(entryDate);
    const diff = now.getTime() - entry.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Just now';
  };

  const metricsData = [
    {
      id: 'profit-factor',
      label: 'Profit Factor',
      value: stats.profitFactor.toFixed(2),
      color: stats.profitFactor >= 1 ? 'text-profit' : 'text-loss',
      description: 'Gross profit / Gross loss'
    },
    {
      id: 'win-rate',
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      color: stats.winRate >= 50 ? 'text-profit' : 'text-loss',
      description: 'Percentage of winning trades'
    },
    {
      id: 'expected-profit',
      label: 'Expected Profit',
      value: formatPnL(stats.averageProfitLoss),
      color: stats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss',
      description: 'Average profit per trade'
    },
    {
      id: 'avg-rr',
      label: 'Average R/R',
      value: stats.averageWin && stats.averageLoss ? 
        (stats.averageWin / Math.abs(stats.averageLoss)).toFixed(2) : '0.00',
      color: 'text-foreground',
      description: 'Risk/Reward ratio'
    },
    {
      id: 'avg-win',
      label: 'Average Win',
      value: formatPnL(stats.averageWin),
      color: 'text-profit',
      description: 'Average winning trade'
    },
    {
      id: 'avg-loss',
      label: 'Average Loss',
      value: formatPnL(stats.averageLoss),
      color: 'text-loss',
      description: 'Average losing trade'
    }
  ];

  // Get account balance (for now just use a default)
  const accountBalance = 0; // TODO: Get from actual account data

  return (
    <div className="space-y-4">
      {/* Empty State Message */}
      {isCleanState && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <p className="text-primary text-sm">
            {getEmptyStateMessage('dashboard')}
          </p>
              </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel - Live Trades */}
        <Card className="ultra-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold">Live Trades</CardTitle>
          <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {liveTrades.length} Active
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRefresh}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {liveTrades.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  No open positions
                </p>
                    <Button
                  onClick={() => navigate('/add-trade')}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                    >
                  <Plus className="h-4 w-4 mr-2" />
            Add Trade
                    </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {liveTrades.map((trade) => (
                  <div 
                    key={trade.id}
                    className="trade-row cursor-pointer"
                    onClick={() => navigate('/history')}
                  >
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                        <span className="font-medium">{trade.symbol}</span>
                        <Badge 
                          variant={trade.side === 'buy' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {trade.side.toUpperCase()}
                          </Badge>
                  </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>Entry: {trade.entryPrice.toFixed(4)}</span>
                        <span>{trade.duration}</span>
                </div>
              </div>
                    <div className="text-right">
                      <div className={
                        trade.pnl >= 0 ? "trade-profit" : "trade-loss"
                      }>
                        {formatPnL(trade.pnl)}
                      </div>
                      <div className={`text-xs flex items-center justify-end ${
                        trade.pnlPercent >= 0 ? "text-profit" : "text-loss"
                      }`}>
                        {trade.pnlPercent >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(trade.pnlPercent).toFixed(2)}%
                </div>
              </div>
            </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Statistics */}
        <Card className="ultra-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold">Statistics</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setBalanceVisible(!balanceVisible)}
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
            <CardContent>
            {/* Account Balance */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Balance</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold">
                  {balanceVisible ? formatPnL(accountBalance) : '••••••'}
                </div>
                <div className={`text-sm flex items-center mt-1 ${
                  stats.totalProfitLoss >= 0 ? "text-profit" : "text-loss"
                }`}>
                  {stats.totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {formatPnL(stats.totalProfitLoss)} ({formatPercentage(
                    accountBalance ? 
                    (stats.totalProfitLoss / accountBalance) * 100 : 0
                  )})
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {metricsData.map((metric) => (
                <div 
                  key={metric.id}
                  className={`stat-card cursor-pointer transition-all ${
                    selectedMetric === metric.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMetric(
                    selectedMetric === metric.id ? null : metric.id
                  )}
                >
                  <div className="stat-label">{metric.label}</div>
                  <div className={`stat-value ${metric.color}`}>
                    {metric.value}
                  </div>
                  {selectedMetric === metric.id && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                  </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate('/performance-calendar')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate('/ai-coach')}
              >
                <Activity className="h-4 w-4 mr-2" />
                AI Coach
                </Button>
        </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default UltraTraderDashboard; 