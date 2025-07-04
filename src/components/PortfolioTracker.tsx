import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';
import { formatPnL, formatPercentage } from '@/lib/pnlCalculator';

interface AssetAllocation {
  symbol: string;
  value: number;
  percentage: number;
  pnl: number;
  trades: number;
}

const PortfolioTracker = () => {
  const navigate = useNavigate();
  const { trades, getTradeStats } = useTrades();
  const { user } = useUser();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const stats = getTradeStats();
  const accountBalance = 0; // TODO: Get from actual account data

  // Calculate asset allocation
  const assetAllocation: AssetAllocation[] = React.useMemo(() => {
    const symbolMap = new Map<string, AssetAllocation>();
    
    trades.forEach(trade => {
      const existing = symbolMap.get(trade.symbol) || {
        symbol: trade.symbol,
        value: 0,
        percentage: 0,
        pnl: 0,
        trades: 0
      };
      
      existing.value += trade.entryPrice * trade.quantity;
      existing.pnl += trade.profitLoss || 0;
      existing.trades += 1;
      
      symbolMap.set(trade.symbol, existing);
    });

    const totalValue = Array.from(symbolMap.values()).reduce((sum, asset) => sum + asset.value, 0);
    
    return Array.from(symbolMap.values()).map(asset => ({
      ...asset,
      percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [trades]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your investment performance and allocation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setBalanceVisible(!balanceVisible)}
          >
            {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <Card className="ultra-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {balanceVisible ? formatPnL(accountBalance + stats.totalProfitLoss) : '••••••'}
            </div>
            <div className="flex items-center space-x-4">
              <div className={cn(
                "flex items-center text-sm",
                stats.totalProfitLoss >= 0 ? "text-profit" : "text-loss"
              )}>
                {stats.totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatPnL(stats.totalProfitLoss)} ({formatPercentage(
                  accountBalance > 0 ? (stats.totalProfitLoss / accountBalance) * 100 : 0
                )})
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedTimeframe}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        {timeframes.map(tf => (
          <Button
            key={tf}
            variant={selectedTimeframe === tf ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTimeframe(tf)}
            className="flex-shrink-0"
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Performance Chart */}
      <Card className="ultra-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Performance Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground text-sm">
              Performance chart visualization would go here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="ultra-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Asset Allocation
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/trade-builder')}
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assetAllocation.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                No assets in portfolio yet
              </p>
              <Button onClick={() => navigate('/add-trade')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Trade
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assetAllocation.slice(0, 5).map((asset) => (
                <div key={asset.symbol} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {asset.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {asset.trades} trade{asset.trades !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{asset.percentage.toFixed(1)}%</div>
                      <div className={cn(
                        "text-xs",
                        asset.pnl >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {formatPnL(asset.pnl)}
                      </div>
                    </div>
                  </div>
                  <Progress value={asset.percentage} className="h-1" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="ultra-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Assets</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {new Set(trades.map(t => t.symbol)).size}
            </div>
          </CardContent>
        </Card>

        <Card className="ultra-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Trades</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{trades.length}</div>
          </CardContent>
        </Card>

        <Card className="ultra-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Best Performer</span>
              <TrendingUp className="h-4 w-4 text-profit" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold">
                {assetAllocation[0]?.symbol || 'N/A'}
              </div>
              <div className="text-xs text-profit">
                {assetAllocation[0] ? formatPnL(assetAllocation[0].pnl) : '-'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="ultra-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Worst Performer</span>
              <TrendingDown className="h-4 w-4 text-loss" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold">
                {assetAllocation.length > 0 
                  ? assetAllocation.reduce((worst, asset) => 
                      asset.pnl < worst.pnl ? asset : worst
                    ).symbol 
                  : 'N/A'
                }
              </div>
              <div className="text-xs text-loss">
                {assetAllocation.length > 0 
                  ? formatPnL(
                      assetAllocation.reduce((worst, asset) => 
                        asset.pnl < worst.pnl ? asset : worst
                      ).pnl
                    )
                  : '-'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioTracker; 