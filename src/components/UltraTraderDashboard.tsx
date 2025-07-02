import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  BarChart3, 
  DollarSign, 
  Clock, 
  Eye,
  EyeOff,
  Settings,
  Bell,
  Search,
  Filter,
  Calendar,
  Target,
  Zap,
  BookOpen,
  Activity,
  ChevronRight,
  RefreshCw,
  Wallet,
  PieChart,
  LineChart,
  Users,
  Star,
  Award,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useTrades } from '@/hooks/useTrades';
import { realDataService } from '@/lib/realDataService';

// UltraTrader-style interface matching their exact layout
const UltraTraderDashboard = () => {
  const navigate = useNavigate();
  const { trades } = useTrades();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [marketData, setMarketData] = useState<any>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [realTimeData, setRealTimeData] = useState({
    BTCUSD: { price: 0, change: 0, changePercent: 0, status: 'loading' },
    ETHUSD: { price: 0, change: 0, changePercent: 0, status: 'loading' },
    EURUSD: { price: 0, change: 0, changePercent: 0, status: 'loading' },
    GBPUSD: { price: 0, change: 0, changePercent: 0, status: 'loading' }
  });

  // Mock data matching UltraTrader's structure
  const portfolioData = {
    totalBalance: 125847.62,
    todayChange: 2847.35,
    todayChangePercent: 2.32,
    availableBalance: 45623.12,
    investedAmount: 80224.50,
    totalPnL: 12547.89,
    totalPnLPercent: 18.45
  };

  const positions = [
    { symbol: 'AAPL', qty: 150, avgPrice: 185.45, currentPrice: 189.23, pnl: 567.00, pnlPercent: 2.04 },
    { symbol: 'TSLA', qty: 75, avgPrice: 248.90, currentPrice: 243.56, pnl: -400.50, pnlPercent: -2.15 },
    { symbol: 'MSFT', qty: 100, avgPrice: 378.20, currentPrice: 385.67, pnl: 747.00, pnlPercent: 1.97 },
    { symbol: 'NVDA', qty: 50, avgPrice: 445.30, currentPrice: 467.89, pnl: 1129.50, pnlPercent: 5.07 }
  ];

  // Fetch real market data
  useEffect(() => {
    const fetchRealMarketData = async () => {
      try {
        setRefreshing(true);
        
        // Check API health first
        const healthCheck = await realDataService.healthCheck();
        const hasWorkingApis = Object.values(healthCheck).some(status => status);
        
        if (!hasWorkingApis) {
          setApiStatus('error');
          return;
        }

        // Fetch real data from multiple sources
        const [cryptoData, forexData] = await Promise.all([
          realDataService.getCryptoPrices(),
          realDataService.getForexRates()
        ]);

        const updatedData = { ...realTimeData };

        // Update crypto data
        if (cryptoData.length > 0) {
          const btcData = cryptoData.find(d => d.symbol === 'BTC');
          const ethData = cryptoData.find(d => d.symbol === 'ETH');
          
          if (btcData) {
            updatedData.BTCUSD = {
              price: btcData.current_price,
              change: btcData.price_change_24h,
              changePercent: btcData.price_change_percentage_24h,
              status: 'connected'
            };
          }
          
          if (ethData) {
            updatedData.ETHUSD = {
              price: ethData.current_price,
              change: ethData.price_change_24h,
              changePercent: ethData.price_change_percentage_24h,
              status: 'connected'
            };
          }
        }

        // Update forex data
        forexData.forEach(data => {
          if (data.target === 'EUR') {
            updatedData.EURUSD = {
              price: data.rate,
              change: data.change_24h || 0,
              changePercent: ((data.change_24h || 0) / data.rate) * 100,
              status: 'connected'
            };
          } else if (data.target === 'GBP') {
            updatedData.GBPUSD = {
              price: data.rate,
              change: data.change_24h || 0,
              changePercent: ((data.change_24h || 0) / data.rate) * 100,
              status: 'connected'
            };
          }
        });

        setRealTimeData(updatedData);
        setApiStatus('connected');
      } catch (error) {
        console.error('Error fetching real market data:', error);
        setApiStatus('error');
      } finally {
        setRefreshing(false);
      }
    };

    fetchRealMarketData();
    const interval = setInterval(fetchRealMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Convert real-time data to watchlist format
  const watchlist = [
    {
      symbol: 'BTC/USD',
      price: realTimeData.BTCUSD.price || 43567.89,
      change: realTimeData.BTCUSD.change || 0,
      changePercent: realTimeData.BTCUSD.changePercent || 0,
      status: realTimeData.BTCUSD.status
    },
    {
      symbol: 'ETH/USD',
      price: realTimeData.ETHUSD.price || 2876.34,
      change: realTimeData.ETHUSD.change || 0,
      changePercent: realTimeData.ETHUSD.changePercent || 0,
      status: realTimeData.ETHUSD.status
    },
    {
      symbol: 'EUR/USD',
      price: realTimeData.EURUSD.price || 1.0845,
      change: realTimeData.EURUSD.change || 0,
      changePercent: realTimeData.EURUSD.changePercent || 0,
      status: realTimeData.EURUSD.status
    },
    {
      symbol: 'GBP/USD',
      price: realTimeData.GBPUSD.price || 1.2634,
      change: realTimeData.GBPUSD.change || 0,
      changePercent: realTimeData.GBPUSD.changePercent || 0,
      status: realTimeData.GBPUSD.status
    }
  ];

  const recentTrades = [
    { id: 1, symbol: 'AAPL', type: 'BUY', qty: 50, price: 189.23, time: '2h ago', status: 'filled' },
    { id: 2, symbol: 'TSLA', type: 'SELL', qty: 25, price: 243.56, time: '4h ago', status: 'filled' },
    { id: 3, symbol: 'MSFT', type: 'BUY', qty: 30, price: 385.67, time: '1d ago', status: 'filled' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Check API health first
      const healthCheck = await realDataService.healthCheck();
      const hasWorkingApis = Object.values(healthCheck).some(status => status);
      
      if (!hasWorkingApis) {
        setApiStatus('error');
        return;
      }

      // Fetch real data from multiple sources
      const [cryptoData, forexData] = await Promise.all([
        realDataService.getCryptoPrices(),
        realDataService.getForexRates()
      ]);

      const updatedData = { ...realTimeData };

      // Update crypto data
      if (cryptoData.length > 0) {
        const btcData = cryptoData.find(d => d.symbol === 'BTC');
        const ethData = cryptoData.find(d => d.symbol === 'ETH');
        
        if (btcData) {
          updatedData.BTCUSD = {
            price: btcData.current_price,
            change: btcData.price_change_24h,
            changePercent: btcData.price_change_percentage_24h,
            status: 'connected'
          };
        }
        
        if (ethData) {
          updatedData.ETHUSD = {
            price: ethData.current_price,
            change: ethData.price_change_24h,
            changePercent: ethData.price_change_percentage_24h,
            status: 'connected'
          };
        }
      }

      // Update forex data
      forexData.forEach(data => {
        if (data.target === 'EUR') {
          updatedData.EURUSD = {
            price: data.rate,
            change: data.change_24h || 0,
            changePercent: ((data.change_24h || 0) / data.rate) * 100,
            status: 'connected'
          };
        } else if (data.target === 'GBP') {
          updatedData.GBPUSD = {
            price: data.rate,
            change: data.change_24h || 0,
            changePercent: ((data.change_24h || 0) / data.rate) * 100,
            status: 'connected'
          };
        }
      });

      setRealTimeData(updatedData);
      setApiStatus('connected');
    } catch (error) {
      console.error('Error refreshing market data:', error);
      setApiStatus('error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="ultra-trader-dashboard bg-[#0A0B0D] min-h-screen">
      {/* Top Header Bar - UltraTrader Style */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">Overview</h1>
              <Badge 
                variant="outline" 
                className={cn(
                  "transition-colors",
                  apiStatus === 'connected' && "bg-green-500/10 text-green-400 border-green-500/20",
                  apiStatus === 'error' && "bg-red-500/10 text-red-400 border-red-500/20",
                  apiStatus === 'disconnected' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                )}
              >
                {apiStatus === 'connected' && 'LIVE DATA'}
                {apiStatus === 'error' && 'API ERROR'}
                {apiStatus === 'disconnected' && 'CONNECTING'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Portfolio Balance Card - UltraTrader Style */}
        <Card className="bg-gradient-to-br from-[#1A1B1E] to-[#151619] border-[#2A2B2E] shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">Portfolio Balance</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {balanceVisible ? `$${portfolioData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    portfolioData.todayChange >= 0 
                      ? "bg-green-500/10 text-green-400" 
                      : "bg-red-500/10 text-red-400"
                  )}>
                    {portfolioData.todayChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {balanceVisible ? `$${Math.abs(portfolioData.todayChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                    <span className="text-xs">
                      ({portfolioData.todayChange >= 0 ? '+' : ''}{portfolioData.todayChangePercent}%)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Today</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#2A2B2E]">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Available</div>
                  <div className="font-semibold text-white">
                    {balanceVisible ? `$${portfolioData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Invested</div>
                  <div className="font-semibold text-white">
                    {balanceVisible ? `$${portfolioData.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - UltraTrader Style */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Button
            onClick={() => navigate('/trade-builder')}
            className="h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl flex-col gap-1 shadow-lg shadow-blue-600/20 touch-manipulation active:scale-95 transition-all duration-150 min-h-[64px] w-full"
            size="lg"
            aria-label="Open Trade Builder"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Buy</span>
          </Button>
          <Button
            onClick={() => navigate('/journal')}
            className="h-16 bg-[#1A1B1E] hover:bg-[#2A2B2E] active:bg-[#3A3B3E] text-white rounded-xl flex-col gap-1 border border-[#2A2B2E] touch-manipulation active:scale-95 transition-all duration-150 min-h-[64px] w-full"
            size="lg"
            aria-label="Open Trading Journal"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-medium">Journal</span>
          </Button>
          <Button
            onClick={() => navigate('/performance-calendar')}
            className="h-16 bg-[#1A1B1E] hover:bg-[#2A2B2E] active:bg-[#3A3B3E] text-white rounded-xl flex-col gap-1 border border-[#2A2B2E] touch-manipulation active:scale-95 transition-all duration-150 min-h-[64px] w-full"
            size="lg"
            aria-label="Open Performance Analytics"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">Analytics</span>
          </Button>
          <Button
            onClick={() => navigate('/strategy-analyzer')}
            className="h-16 bg-[#1A1B1E] hover:bg-[#2A2B2E] active:bg-[#3A3B3E] text-white rounded-xl flex-col gap-1 border border-[#2A2B2E] touch-manipulation active:scale-95 transition-all duration-150 min-h-[64px] w-full"
            size="lg"
            aria-label="Open Strategy Analyzer"
          >
            <Target className="w-5 h-5" />
            <span className="text-xs font-medium">Strategy</span>
          </Button>
        </div>

        {/* Performance Stats - UltraTrader Layout */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Performance</CardTitle>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-xs text-slate-400 hover:text-white touch-manipulation active:scale-95 min-h-[32px] min-w-[40px]"
                  onClick={() => setSelectedTimeframe('1D')}
                  aria-label="View 1 day performance"
                >
                  1D
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 touch-manipulation active:scale-95 min-h-[32px] min-w-[40px]"
                  onClick={() => setSelectedTimeframe('1W')}
                  aria-label="View 1 week performance"
                >
                  1W
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-xs text-slate-400 hover:text-white touch-manipulation active:scale-95 min-h-[32px] min-w-[40px]"
                  onClick={() => setSelectedTimeframe('1M')}
                  aria-label="View 1 month performance"
                >
                  1M
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Total P&L</div>
                <div className={cn(
                  "text-lg font-bold",
                  portfolioData.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {portfolioData.totalPnL >= 0 ? '+' : ''}${portfolioData.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400">
                  {portfolioData.totalPnLPercent >= 0 ? '+' : ''}{portfolioData.totalPnLPercent}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Win Rate</div>
                <div className="text-lg font-bold text-white">68.5%</div>
                <Progress value={68.5} className="h-1 bg-[#2A2B2E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions - UltraTrader Style */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Positions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/journal')}
                className="text-xs text-blue-400 hover:text-blue-300 touch-manipulation active:scale-95 transition-all duration-150"
                aria-label="View all positions"
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {positions.slice(0, 3).map((position) => (
              <div key={position.symbol} className="flex items-center justify-between p-3 bg-[#151619] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{position.symbol.substring(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{position.symbol}</div>
                    <div className="text-xs text-slate-400">{position.qty} shares</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-medium text-sm",
                    position.pnl >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {position.pnl >= 0 ? '+' : ''}${Math.abs(position.pnl).toFixed(2)}
                  </div>
                  <div className={cn(
                    "text-xs",
                    position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Watchlist - UltraTrader Style */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Watchlist</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-400 hover:text-blue-300 touch-manipulation active:scale-95 transition-all duration-150"
                aria-label="Edit watchlist"
              >
                Edit
                <Settings className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {watchlist.map((item) => (
              <div key={item.symbol} className="flex items-center justify-between p-3 bg-[#151619] rounded-lg">
                <div>
                  <div className="font-medium text-white text-sm">{item.symbol}</div>
                  <div className="text-xs text-slate-400">${item.price.toFixed(item.symbol.includes('/') ? 4 : 2)}</div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-medium",
                    item.change >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {item.change >= 0 ? '+' : ''}${Math.abs(item.change).toFixed(2)}
                  </div>
                  <div className={cn(
                    "text-xs",
                    item.changePercent >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity - UltraTrader Style */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/journal')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-[#151619] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                    trade.type === 'BUY' 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {trade.type === 'BUY' ? 'B' : 'S'}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{trade.symbol}</div>
                    <div className="text-xs text-slate-400">{trade.qty} @ ${trade.price}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{trade.time}</div>
                  <Badge variant="outline" className="text-xs mt-1 bg-green-500/10 text-green-400 border-green-500/20">
                    {trade.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom Spacing for Mobile Navigation */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default UltraTraderDashboard; 