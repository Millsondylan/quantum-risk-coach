import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target,
  Wallet,
  RefreshCw,
  Wifi,
  Activity
} from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/contexts/AuthContext';
import { realBrokerService } from '@/lib/realBrokerService';
import { toast } from 'sonner';

const QuickStats = () => {
  const { user } = useAuth();
  const { trades, getPerformanceMetrics, syncBrokerTrades } = useTrades();
  const [connections, setConnections] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const metrics = getPerformanceMetrics();

  // Load broker connections and balances
  useEffect(() => {
    if (user) {
      loadBrokerData();
    }
  }, [user]);

  const loadBrokerData = async () => {
    if (!user) return;
    
    try {
      const userConnections = await realBrokerService.getUserConnections(user.id);
      setConnections(userConnections);
      
      // Calculate total balance from all connected brokers
      const total = userConnections.reduce((sum, conn) => {
        return sum + (conn.accountInfo?.balance || 0);
      }, 0);
      setTotalBalance(total);
    } catch (error) {
      console.error('Failed to load broker data:', error);
    }
  };

  const refreshAllData = async () => {
    if (!user) {
      toast.error('Please log in to refresh data');
      return;
    }

    setIsRefreshing(true);
    
    try {
      toast.info('Refreshing data from all connected brokers...');
      
      // Sync data from all connected brokers
      const connectedBrokers = connections.filter(conn => conn.status === 'connected');
      
      for (const broker of connectedBrokers) {
        try {
          await syncBrokerTrades(broker.id);
          await realBrokerService.getAccountBalance(broker.id);
        } catch (error) {
          console.error(`Failed to sync ${broker.name}:`, error);
        }
      }
      
      await loadBrokerData();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh some data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const stats = [
    {
      id: 'balance',
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      change: metrics.totalProfit,
      changeText: formatCurrency(metrics.totalProfit),
      icon: Wallet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: `Across ${connections.filter(c => c.status === 'connected').length} brokers`
    },
    {
      id: 'profit',
      title: 'Total P&L',
      value: formatCurrency(metrics.totalProfit),
      change: metrics.totalProfit,
      changeText: formatPercentage(totalBalance > 0 ? (metrics.totalProfit / totalBalance) * 100 : 0),
      icon: metrics.totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: metrics.totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      description: `From ${metrics.totalTrades} trades`
    },
    {
      id: 'winrate',
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      change: metrics.winRate - 50, // Compare to 50% baseline
      changeText: `${metrics.winningTrades}/${metrics.totalTrades}`,
      icon: Target,
      color: metrics.winRate >= 50 ? 'text-green-400' : 'text-yellow-400',
      bgColor: metrics.winRate >= 50 ? 'bg-green-500/10' : 'bg-yellow-500/10',
      description: 'Win vs loss ratio'
    },
    {
      id: 'volume',
      title: 'Volume Traded',
      value: `${metrics.totalVolume.toFixed(2)}`,
      change: 0,
      changeText: `Avg: ${metrics.avgTradeSize.toFixed(2)}`,
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      description: 'Total lot size'
    },
    {
      id: 'sharpe',
      title: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      change: metrics.sharpeRatio,
      changeText: metrics.sharpeRatio > 1 ? 'Excellent' : metrics.sharpeRatio > 0.5 ? 'Good' : 'Poor',
      icon: Activity,
      color: metrics.sharpeRatio > 1 ? 'text-green-400' : metrics.sharpeRatio > 0.5 ? 'text-yellow-400' : 'text-red-400',
      bgColor: metrics.sharpeRatio > 1 ? 'bg-green-500/10' : 'bg-yellow-500/10',
      description: 'Risk-adjusted returns'
    },
    {
      id: 'brokers',
      title: 'Connected Brokers',
      value: connections.filter(c => c.status === 'connected').length.toString(),
      change: 0,
      changeText: `${connections.length} total`,
      icon: Wifi,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      description: 'Active connections'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
          <p className="text-slate-400">Real-time data from your connected brokers</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {connections.filter(c => c.status === 'connected').length > 0 && (
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              <Wifi className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isRefreshing}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          
          return (
            <Card key={stat.id} className="holo-card hover:holo-card-hover transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  
                  {stat.change !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        stat.change > 0 
                          ? 'text-green-400 border-green-400/30' 
                          : 'text-red-400 border-red-400/30'
                      }`}
                    >
                      {stat.change > 0 ? '+' : ''}{stat.changeText}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile-optimized summary cards */}
      <div className="block sm:hidden space-y-3">
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Performance</p>
                <p className={`text-xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(metrics.totalProfit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Portfolio Value</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400">Win Rate</p>
                <p className="font-semibold text-white">{metrics.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Trades</p>
                <p className="font-semibold text-white">{metrics.totalTrades}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Brokers</p>
                <p className="font-semibold text-white">{connections.filter(c => c.status === 'connected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {connections.length === 0 && (
        <Card className="holo-card border-dashed border-slate-600">
          <CardContent className="text-center py-8">
            <Wifi className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Brokers Connected</h3>
            <p className="text-slate-400 mb-4">
              Connect your trading accounts to see real portfolio data
            </p>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
              Demo Mode - Using Sample Data
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickStats;
