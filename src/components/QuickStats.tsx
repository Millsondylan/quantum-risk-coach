import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Shield, 
  Zap,
  BarChart3,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades } from '@/hooks/useTrades';
import realBrokerService from '@/lib/realBrokerService';

const QuickStats = () => {
  const { user } = useAuth();
  const { trades, getPerformanceMetrics } = useTrades();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectedBrokers, setConnectedBrokers] = useState<any[]>([]);
  const [realTimeBalance, setRealTimeBalance] = useState<number>(0);
  
  const metrics = getPerformanceMetrics();

  // Load connected brokers and real-time data
  useEffect(() => {
    const loadBrokerData = async () => {
      if (!user?.id) return;
      
      try {
        const connections = await realBrokerService.getUserConnections(user.id);
        setConnectedBrokers(connections);
        
        // Get real-time balance from connected brokers
        let totalBalance = 0;
        for (const connection of connections) {
          if (connection.status === 'connected' && connection.accountInfo) {
            totalBalance += connection.accountInfo.balance || 0;
          }
        }
        setRealTimeBalance(totalBalance);
      } catch (error) {
        console.error('Failed to load broker data:', error);
      }
    };

    loadBrokerData();
  }, [user?.id]);

  // Calculate stats with real data only
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? ((metrics.winningTrades / totalTrades) * 100) : 0;
  const totalProfit = realTimeBalance > 0 ? realTimeBalance : metrics.totalProfit;
  const activeTrades = trades.filter(trade => trade.status === 'open').length;
  
  // Calculate real daily and weekly P&L from actual trades
  const calculateRealPnL = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return trades
      .filter(trade => new Date(trade.closed_at || trade.opened_at) >= cutoffDate)
      .reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
  };
  
  const dailyPnL = calculateRealPnL(1);
  const weeklyPnL = calculateRealPnL(7);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh broker connections and balances
      for (const connection of connectedBrokers) {
        if (connection.status === 'connected') {
          await realBrokerService.getAccountBalance(connection.id);
        }
      }
      
      // Reload data
      const connections = await realBrokerService.getUserConnections(user?.id || '');
      setConnectedBrokers(connections);
      
      let totalBalance = 0;
      for (const connection of connections) {
        if (connection.status === 'connected' && connection.accountInfo) {
          totalBalance += connection.accountInfo.balance || 0;
        }
      }
      setRealTimeBalance(totalBalance);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    changePercent, 
    color = 'text-slate-400',
    bgColor = 'bg-slate-800/50',
    isPositive
  }: {
    icon: any;
    label: string;
    value: string;
    change?: string;
    changePercent?: number;
    color?: string;
    bgColor?: string;
    isPositive?: boolean;
  }) => (
    <Card className={`${bgColor} border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${color === 'text-emerald-400' ? 'bg-emerald-500/10' : color === 'text-red-400' ? 'bg-red-500/10' : 'bg-slate-700/50'}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          {change && (
            <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
              {isPositive ? '+' : ''}{change}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          {changePercent !== undefined && (
            <div className="flex items-center gap-1">
              {changePercent >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Math.abs(changePercent).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Portfolio Overview</h2>
          <p className="text-sm text-slate-400">Real-time trading performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400">LIVE</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={isBalanceVisible ? Eye : EyeOff}
          label="Total Balance"
          value={isBalanceVisible ? `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "****"}
          change={dailyPnL >= 0 ? `+$${Math.abs(dailyPnL).toFixed(2)}` : `-$${Math.abs(dailyPnL).toFixed(2)}`}
          color={dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}
          bgColor="bg-gradient-to-br from-slate-800/80 to-slate-900/80"
          isPositive={dailyPnL >= 0}
        />
        
        <StatCard
          icon={BarChart3}
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          changePercent={winRate - 50} // Compare to 50% baseline
          color="text-blue-400"
        />
        
        <StatCard
          icon={Activity}
          label="Active Trades"
          value={activeTrades.toString()}
          change={totalTrades > 0 ? `${totalTrades} total` : '0 total'}
          color="text-cyan-400"
        />
        
        <StatCard
          icon={TrendingUp}
          label="Weekly P&L"
          value={weeklyPnL >= 0 ? `+$${weeklyPnL.toFixed(2)}` : `-$${Math.abs(weeklyPnL).toFixed(2)}`}
          changePercent={(weeklyPnL / (totalProfit || 1)) * 100}
          color={weeklyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}
          isPositive={weeklyPnL >= 0}
        />
      </div>

      {/* Broker Connections Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Broker Connections</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              {connectedBrokers.filter(b => b.status === 'connected').length} / {connectedBrokers.length} Connected
            </Badge>
          </div>
          
          {connectedBrokers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectedBrokers.map((broker) => (
                <div 
                  key={broker.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      broker.status === 'connected' ? 'bg-emerald-400' : 
                      broker.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{broker.type}</p>
                      <p className="text-xs text-slate-400">{broker.name}</p>
                    </div>
                  </div>
                  
                  {broker.status === 'connected' && broker.accountInfo && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        ${broker.accountInfo.balance?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-slate-400">{broker.accountInfo.currency || 'USD'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No brokers connected</p>
              <p className="text-xs text-slate-500 mt-1">Connect your trading accounts to see real-time data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsBalanceVisible(!isBalanceVisible)}
          className="text-slate-400 hover:text-white"
        >
          {isBalanceVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {isBalanceVisible ? 'Hide' : 'Show'} Balance
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Target className="w-4 h-4 mr-2" />
          Set Goals
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Zap className="w-4 h-4 mr-2" />
          Risk Settings
        </Button>
      </div>
    </div>
  );
};

export default QuickStats;
