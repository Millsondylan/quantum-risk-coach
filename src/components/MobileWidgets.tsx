import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Clock,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Target,
  Shield,
  Zap,
  Globe,
  Wifi,
  Database,
  Calendar,
  BookOpen,
  Star,
  Award,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';

interface WidgetProps {
  id: string;
  type: 'portfolio' | 'watchlist' | 'recent-trades' | 'performance' | 'risk-meter' | 'quick-actions';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  settings?: any;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
}

interface WidgetData {
  portfolio: {
    balance: number;
    todayPnL: number;
    totalPnL: number;
    winRate: number;
    totalTrades: number;
  };
  watchlist: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
  recentTrades: Array<{
    id: string;
    symbol: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl: number;
    time: string;
  }>;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  riskMeter: {
    currentRisk: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

// Portfolio Widget Component
const PortfolioWidget: React.FC<WidgetProps> = ({ size, settings, onSettings }) => {
  const { trades, getTradeStats } = useTrades();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const portfolioData = useMemo(() => {
    const stats = getTradeStats();
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    const today = new Date();
    const todayTrades = closedTrades.filter(trade => {
      const tradeDate = new Date(trade.exitDate || trade.entryDate || '');
      return tradeDate.toDateString() === today.toDateString();
    });
    
    const todayPnL = todayTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const startingBalance = 100000;
    const balance = startingBalance + totalPnL;
    
    return {
      balance,
      todayPnL,
      totalPnL,
      winRate: stats.winRate,
      totalTrades: stats.totalTrades
    };
  }, [trades, getTradeStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white">Portfolio</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                {balanceVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {balanceVisible ? `$${portfolioData.balance.toLocaleString()}` : '••••••'}
            </div>
            <div className={cn(
              "text-sm font-medium",
              portfolioData.todayPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {portfolioData.todayPnL >= 0 ? '+' : ''}${Math.abs(portfolioData.todayPnL).toFixed(2)} today
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'medium') {
    return (
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 h-48">
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">Portfolio</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-7 w-7 p-0 hover:bg-white/10"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-7 w-7 p-0 hover:bg-white/10"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {balanceVisible ? `$${portfolioData.balance.toLocaleString()}` : '••••••'}
              </div>
              <div className={cn(
                "text-lg font-medium",
                portfolioData.todayPnL >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {portfolioData.todayPnL >= 0 ? '+' : ''}${Math.abs(portfolioData.todayPnL).toFixed(2)} today
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-400">Win Rate</div>
                <div className="text-sm font-semibold text-green-400">{portfolioData.winRate}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Trades</div>
                <div className="text-sm font-semibold text-white">{portfolioData.totalTrades}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 h-64">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">Portfolio</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="h-8 w-8 p-0 hover:bg-white/10"
            >
              {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 w-8 p-0 hover:bg-white/10"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {balanceVisible ? `$${portfolioData.balance.toLocaleString()}` : '••••••'}
            </div>
            <div className={cn(
              "text-xl font-medium",
              portfolioData.todayPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {portfolioData.todayPnL >= 0 ? '+' : ''}${Math.abs(portfolioData.todayPnL).toFixed(2)} today
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400">Win Rate</div>
              <div className="text-sm font-semibold text-green-400">{portfolioData.winRate}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total P&L</div>
              <div className={cn(
                "text-sm font-semibold",
                portfolioData.totalPnL >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {portfolioData.totalPnL >= 0 ? '+' : ''}${Math.abs(portfolioData.totalPnL).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Trades</div>
              <div className="text-sm font-semibold text-white">{portfolioData.totalTrades}</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettings?.('portfolio')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Watchlist Widget Component
const WatchlistWidget: React.FC<WidgetProps> = ({ size, settings }) => {
  const [watchlist] = useState([
    { symbol: 'BTC/USD', price: 43567.89, change: 1245.67, changePercent: 2.94 },
    { symbol: 'ETH/USD', price: 2876.34, change: 89.23, changePercent: 3.21 },
    { symbol: 'EUR/USD', price: 1.0845, change: 0.0023, changePercent: 0.21 },
    { symbol: 'GBP/USD', price: 1.2634, change: -0.0012, changePercent: -0.09 },
    { symbol: 'USD/JPY', price: 148.76, change: 0.34, changePercent: 0.23 },
    { symbol: 'XAU/USD', price: 2034.56, change: 12.34, changePercent: 0.61 }
  ]);

  const displayItems = size === 'small' ? 2 : size === 'medium' ? 4 : 6;

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-white">Watchlist</span>
          </div>
          
          <div className="space-y-2">
            {watchlist.slice(0, displayItems).map((item) => (
              <div key={item.symbol} className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">{item.symbol}</span>
                <div className="text-right">
                  <div className="text-xs text-white">${item.price.toFixed(2)}</div>
                  <div className={cn(
                    "text-xs",
                    item.changePercent >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 h-48">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          <span className="font-medium text-white">Watchlist</span>
        </div>
        
        <div className="space-y-3">
          {watchlist.slice(0, displayItems).map((item) => (
            <div key={item.symbol} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white text-sm">{item.symbol}</div>
                <div className="text-xs text-slate-400">${item.price.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-sm font-semibold",
                  item.changePercent >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                </div>
                <div className={cn(
                  "text-xs",
                  item.changePercent >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {item.change >= 0 ? '+' : ''}${Math.abs(item.change).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Trades Widget Component
const RecentTradesWidget: React.FC<WidgetProps> = ({ size }) => {
  const { trades } = useTrades();
  
  const recentTrades = useMemo(() => {
    return trades
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, size === 'small' ? 2 : size === 'medium' ? 4 : 6)
      .map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        type: trade.type?.toLowerCase() as 'buy' | 'sell',
        price: trade.entryPrice || 0,
        quantity: trade.quantity || 0,
        pnl: trade.profitLoss || 0,
        time: new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
  }, [trades, size]);

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium text-white">Recent Trades</span>
          </div>
          
          <div className="space-y-2">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    trade.type === 'buy' ? "bg-green-400" : "bg-red-400"
                  )} />
                  <span className="text-xs font-medium text-white">{trade.symbol}</span>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-medium",
                    trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">{trade.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 h-48">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-white">Recent Trades</span>
        </div>
        
        <div className="space-y-3">
          {recentTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  trade.type === 'buy' ? "bg-green-400" : "bg-red-400"
                )} />
                <div>
                  <div className="font-medium text-white text-sm">{trade.symbol}</div>
                  <div className="text-xs text-slate-400">{trade.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {trade.type?.toUpperCase()} {trade.quantity}
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Widget Component
const PerformanceWidget: React.FC<WidgetProps> = ({ size }) => {
  const performanceData = {
    daily: 2.34,
    weekly: 8.67,
    monthly: 15.42,
    yearly: 45.23
  };

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 border-purple-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-white">Performance</span>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-white">{performanceData.daily}%</div>
            <div className="text-xs text-slate-400">Today</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-xs text-slate-400">Week</div>
              <div className="text-xs font-medium text-white">{performanceData.weekly}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Month</div>
              <div className="text-xs font-medium text-white">{performanceData.monthly}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 border-purple-500/30 h-48">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Performance</span>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{performanceData.daily}%</div>
            <div className="text-sm text-slate-400">Today's Performance</div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-400">Week</div>
              <div className="text-sm font-semibold text-white">{performanceData.weekly}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Month</div>
              <div className="text-sm font-semibold text-white">{performanceData.monthly}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Year</div>
              <div className="text-sm font-semibold text-white">{performanceData.yearly}%</div>
            </div>
          </div>
          
          <Progress value={performanceData.daily * 10} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

// Risk Meter Widget Component
const RiskMeterWidget: React.FC<WidgetProps> = ({ size }) => {
  const riskData = {
    currentRisk: 35,
    riskLevel: 'medium' as const,
    recommendations: [
      'Consider reducing position sizes',
      'Monitor correlation risk',
      'Review stop-loss levels'
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-white">Risk Meter</span>
          </div>
          
          <div className="text-center">
            <div className={cn("text-lg font-bold", getRiskColor(riskData.riskLevel))}>
              {riskData.currentRisk}%
            </div>
            <div className="text-xs text-slate-400 capitalize">{riskData.riskLevel} Risk</div>
          </div>
          
          <Progress value={riskData.currentRisk} className="h-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30 h-48">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Risk Meter</span>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className={cn("text-2xl font-bold", getRiskColor(riskData.riskLevel))}>
              {riskData.currentRisk}%
            </div>
            <div className="text-sm text-slate-400 capitalize">{riskData.riskLevel} Risk Level</div>
          </div>
          
          <Progress value={riskData.currentRisk} className="h-2" />
          
          <div className="text-xs text-slate-300">
            {riskData.recommendations[0]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Widget Component
const QuickActionsWidget: React.FC<WidgetProps> = ({ size }) => {
  const actions = [
    { icon: Plus, label: 'New Trade', color: 'bg-green-600', action: () => console.log('New Trade') },
    { icon: BookOpen, label: 'Journal', color: 'bg-blue-600', action: () => console.log('Journal') },
    { icon: BarChart3, label: 'Analytics', color: 'bg-purple-600', action: () => console.log('Analytics') },
    { icon: Settings, label: 'Settings', color: 'bg-slate-600', action: () => console.log('Settings') }
  ];

  const displayActions = size === 'small' ? 2 : size === 'medium' ? 4 : 4;

  if (size === 'small') {
    return (
      <Card className="bg-gradient-to-br from-slate-600/20 to-gray-600/20 border-slate-500/30 h-32">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-white">Quick Actions</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {actions.slice(0, displayActions).map((action, index) => (
              <Button
                key={index}
                size="sm"
                onClick={action.action}
                className={cn("h-8 text-xs", action.color)}
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-600/20 to-gray-600/20 border-slate-500/30 h-48">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-white">Quick Actions</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {actions.slice(0, displayActions).map((action, index) => (
            <Button
              key={index}
              size="sm"
              onClick={action.action}
              className={cn("h-12 text-sm", action.color)}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Mobile Widgets Component
const MobileWidgets: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetProps[]>([
    { id: '1', type: 'portfolio', size: 'medium', position: { x: 0, y: 0 } },
    { id: '2', type: 'watchlist', size: 'small', position: { x: 0, y: 1 } },
    { id: '3', type: 'recent-trades', size: 'small', position: { x: 1, y: 1 } },
    { id: '4', type: 'performance', size: 'small', position: { x: 0, y: 2 } },
    { id: '5', type: 'risk-meter', size: 'small', position: { x: 1, y: 2 } },
    { id: '6', type: 'quick-actions', size: 'small', position: { x: 0, y: 3 } }
  ]);

  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetProps | null>(null);

  const renderWidget = (widget: WidgetProps) => {
    switch (widget.type) {
      case 'portfolio':
        return <PortfolioWidget {...widget} onSettings={() => setSelectedWidget(widget)} />;
      case 'watchlist':
        return <WatchlistWidget {...widget} />;
      case 'recent-trades':
        return <RecentTradesWidget {...widget} />;
      case 'performance':
        return <PerformanceWidget {...widget} />;
      case 'risk-meter':
        return <RiskMeterWidget {...widget} />;
      case 'quick-actions':
        return <QuickActionsWidget {...widget} />;
      default:
        return null;
    }
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleAddWidget = (type: WidgetProps['type'], size: WidgetProps['size']) => {
    const newWidget: WidgetProps = {
      id: Date.now().toString(),
      type,
      size,
      position: { x: 0, y: widgets.length }
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Widget Grid */}
      <div className="grid grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <div key={widget.id} className="relative group">
            {renderWidget(widget)}
            
            {/* Widget Controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWidget(widget)}
                  className="h-6 w-6 p-0 bg-slate-800/80 hover:bg-slate-700/80"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="h-6 w-6 p-0 bg-red-600/80 hover:bg-red-700/80"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowWidgetSettings(true)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </div>

      {/* Widget Settings Modal */}
      {showWidgetSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Add Widget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'portfolio', label: 'Portfolio', icon: DollarSign },
                  { type: 'watchlist', label: 'Watchlist', icon: Globe },
                  { type: 'recent-trades', label: 'Recent Trades', icon: Activity },
                  { type: 'performance', label: 'Performance', icon: BarChart3 },
                  { type: 'risk-meter', label: 'Risk Meter', icon: Shield },
                  { type: 'quick-actions', label: 'Quick Actions', icon: Zap }
                ].map((widget) => (
                  <Button
                    key={widget.type}
                    variant="outline"
                    onClick={() => handleAddWidget(widget.type as any, 'small')}
                    className="h-20 flex-col gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <widget.icon className="w-5 h-5" />
                    <span className="text-xs">{widget.label}</span>
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWidgetSettings(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MobileWidgets; 