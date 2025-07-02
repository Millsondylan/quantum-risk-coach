import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Settings, 
  BarChart3, 
  BookOpen,
  Bell,
  Download,
  Upload,
  Target,
  Zap,
  DollarSign, 
  Percent,
  Clock, 
  Calendar,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Brain,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Shield,
  Users,
  Trophy,
  Star,
  Lightbulb,
  Radio,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  ChevronLeft,
  Home,
  PieChart,
  LineChart,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ClockIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PlayIcon,
  PauseIcon,
  BrainIcon,
  ActivityIcon,
  GlobeIcon,
  SmartphoneIcon,
  MonitorIcon,
  DatabaseIcon,
  ShieldIcon,
  UsersIcon,
  TrophyIcon,
  StarIcon,
  LightbulbIcon,
  RadioIcon,
  NewspaperIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  MinusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  PieChartIcon,
  LineChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { realDataService } from '@/lib/realDataService';
import { liveTradeTracker } from '@/lib/liveTradeTracker';
import { marketSessionAnalyzer } from '@/lib/marketSessionAnalyzer';
import { pushNotificationService } from '@/lib/pushNotificationService';
import { useUser } from '@/contexts/UserContext';

interface PortfolioStats {
  totalBalance: number;
  netPnL: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  currentStreak: number;
  bestStreak: number;
  assetDistribution: { [key: string]: number };
}

interface TradeEntry {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  volume: number;
  pnl?: number;
  pnlPercent?: number;
  timestamp: Date;
  duration?: string;
  strategy: string[];
  notes: string;
  broker: string;
  isPaper: boolean;
  status: 'open' | 'closed' | 'pending';
}

const UltraTraderDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('home');
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalBalance: 10000,
    netPnL: 0,
    winRate: 0,
    totalTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    currentStreak: 0,
    bestStreak: 0,
    assetDistribution: {}
  });
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [liveMarketData, setLiveMarketData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { trades: localTrades } = useLocalTrades();
  const { trades: apiTrades } = useTrades();

  // Combine trades from different sources
  useEffect(() => {
    const allTrades = [...(localTrades || []), ...(apiTrades || [])];
    setTrades(allTrades.map(trade => ({
      id: trade.id || Math.random().toString(),
      symbol: trade.symbol || 'EUR/USD',
      direction: (trade as any).side || 'buy',
      entryPrice: (trade as any).entryPrice || 1.1000,
      exitPrice: (trade as any).exitPrice,
      volume: (trade as any).volume || 1.0,
      pnl: (trade as any).pnl,
      pnlPercent: (trade as any).pnlPercent,
      timestamp: new Date((trade as any).timestamp || Date.now()),
      duration: (trade as any).duration,
      strategy: (trade as any).strategy ? [(trade as any).strategy] : ['Manual'],
      notes: (trade as any).notes || '',
      broker: (trade as any).broker || 'Manual',
      isPaper: (trade as any).isPaper || false,
      status: ((trade as any).status || 'closed') as 'open' | 'closed' | 'pending'
    })));
  }, [localTrades, apiTrades]);

  // Calculate portfolio stats
  useEffect(() => {
    if (trades.length === 0) return;

    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length : 0;
    const largestWin = Math.max(...winningTrades.map(t => t.pnl || 0), 0);
    const largestLoss = Math.min(...losingTrades.map(t => t.pnl || 0), 0);

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if ((closedTrades[i].pnl || 0) > 0) {
        tempStreak++;
        if (i === closedTrades.length - 1) currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Asset distribution
    const distribution: { [key: string]: number } = {};
    trades.forEach(trade => {
      distribution[trade.symbol] = (distribution[trade.symbol] || 0) + trade.volume;
    });

    setPortfolioStats({
      totalBalance: 10000 + totalPnL,
      netPnL: totalPnL,
      winRate,
      totalTrades: trades.length,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      currentStreak,
      bestStreak,
      assetDistribution: distribution
    });
  }, [trades]);

  // Load live market data
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const [forexData, cryptoData] = await Promise.allSettled([
          realDataService.getForexRates(),
          realDataService.getCryptoPrices()
        ]);

        const marketData = [
          ...(forexData.status === 'fulfilled' ? forexData.value : []),
          ...(cryptoData.status === 'fulfilled' ? cryptoData.value : [])
        ];

        setLiveMarketData(marketData.slice(0, 6)); // Show top 6 instruments
      } catch (error) {
        console.error('Failed to load market data:', error);
      }
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load AI insights
  useEffect(() => {
    const loadAIInsights = async () => {
      try {
        const insights = await realDataService.getAIMarketAnalysis({
          forex: liveMarketData.filter(item => !item.symbol?.includes('/')),
          crypto: liveMarketData.filter(item => item.symbol?.includes('/')),
            news: []
        });

        if (insights) {
          setAiInsights([{
            id: 'ai-1',
            title: 'AI Market Analysis',
            description: insights,
              confidence: 85,
            type: 'trend'
          }]);
        }
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      }
    };

    if (liveMarketData.length > 0) {
      loadAIInsights();
    }
  }, [liveMarketData]);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSymbol = !filterSymbol || trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
      const matchesStrategy = !filterStrategy || trade.strategy.some(s => s.toLowerCase().includes(filterStrategy.toLowerCase()));
      
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const now = new Date();
        const tradeDate = new Date(trade.timestamp);
        const diffDays = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDateRange) {
          case 'today':
            matchesDate = diffDays === 0;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
        }
      }
      
      return matchesSymbol && matchesStrategy && matchesDate;
    });
  }, [trades, filterSymbol, filterStrategy, filterDateRange]);

  const handleAddTrade = () => {
    toast.success('Opening trade builder...');
    // Navigate to trade builder
    window.location.href = '/trade-builder';
  };

  const handleConnectBroker = () => {
    toast.success('Opening broker connection...');
    // Navigate to broker connection
    window.location.href = '/connect-mt4';
  };

  const handleViewAnalytics = () => {
    setActiveTab('analytics');
  };

  const handleTogglePaperTrading = () => {
    setIsPaperTrading(!isPaperTrading);
    toast.success(`Paper trading ${!isPaperTrading ? 'enabled' : 'disabled'}`);
  };

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'buy' ? 
      <ArrowUpRightIcon className="w-4 h-4 text-green-400" /> : 
      <ArrowDownRightIcon className="w-4 h-4 text-red-400" />;
  };

  const getPnLColor = (pnl: number) => {
    return pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-400 bg-yellow-500/20';
      case 'closed': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-lg" />
          ))}
                </div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Portfolio Stats */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-white" />
              </div>
            <div>
              <h1 className="text-xl font-bold text-white">UltraTrader</h1>
              <p className="text-sm text-slate-400">Professional Trading Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
              onClick={handleToggleBalance}
                className="text-slate-400 hover:text-white"
              >
              {showBalance ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
              onClick={handleTogglePaperTrading}
              className={`${isPaperTrading ? 'text-green-400' : 'text-slate-400'} hover:text-white`}
            >
              {isPaperTrading ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

        {/* Portfolio Overview Card */}
        <Card className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-400">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  {showBalance ? `$${portfolioStats.totalBalance.toLocaleString()}` : '****'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Net P&L</p>
                <p className={`text-xl font-bold ${getPnLColor(portfolioStats.netPnL)}`}>
                  {portfolioStats.netPnL > 0 ? '+' : ''}${portfolioStats.netPnL.toFixed(2)}
                </p>
        </div>
      </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-slate-400">Win Rate</p>
                <p className="text-white font-semibold">{portfolioStats.winRate.toFixed(1)}%</p>
                  </div>
              <div className="text-center">
                <p className="text-slate-400">Trades</p>
                <p className="text-white font-semibold">{portfolioStats.totalTrades}</p>
                </div>
              <div className="text-center">
                <p className="text-slate-400">Streak</p>
                <p className="text-white font-semibold">{portfolioStats.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <div className="flex space-x-2 mt-4">
                    <Button
            onClick={handleAddTrade}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
            Add Trade
                    </Button>
                    <Button
            onClick={handleConnectBroker}
                      variant="outline"
            className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    >
            <Database className="w-4 h-4 mr-2" />
            Connect
                    </Button>
              <Button
            onClick={handleViewAnalytics}
            variant="outline"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
              </Button>
                  </div>
            </div>
            
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-600/30">
          <TabsTrigger value="home" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <HomeIcon className="w-4 h-4 mr-1" />
            Home
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <BookOpen className="w-4 h-4 mr-1" />
            Journal
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Home Tab */}
        <TabsContent value="home" className="space-y-4 mt-4">
          {/* Live Market Data */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Live Market Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveMarketData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                      <p className="text-white font-medium">{item.symbol || 'EUR/USD'}</p>
                      <p className="text-sm text-slate-400">{item.rate || '1.1000'}</p>
                </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${(item.change_24h || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(item.change_24h || 0) > 0 ? '+' : ''}{(item.change_24h || 0).toFixed(2)}%
                    </p>
                </div>
              </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          {aiInsights.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-medium mb-2">{insight.title}</h4>
                    <p className="text-sm text-slate-300 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {insight.confidence}% confidence
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {insight.type}
                      </Badge>
                  </div>
                </div>
                ))}
            </CardContent>
          </Card>
        )}

          {/* Recent Performance */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Avg Win</p>
                  <p className="text-green-400 font-semibold">${portfolioStats.avgWin.toFixed(2)}</p>
                  </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Avg Loss</p>
                  <p className="text-red-400 font-semibold">${portfolioStats.avgLoss.toFixed(2)}</p>
                </div>
                  </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Largest Win</p>
                  <p className="text-green-400 font-semibold">${portfolioStats.largestWin.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Largest Loss</p>
                  <p className="text-red-400 font-semibold">${portfolioStats.largestLoss.toFixed(2)}</p>
              </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal" className="space-y-4 mt-4">
          {/* Filter Bar */}
          <div className="flex space-x-2 mb-4">
            <select 
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <input
              type="text"
              placeholder="Symbol..."
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input
              type="text"
              placeholder="Strategy..."
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-white text-sm"
            />
            </div>
            
          {/* Trades List */}
            <div className="space-y-3">
            {filteredTrades.map((trade) => (
              <Card key={trade.id} className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        {getDirectionIcon(trade.direction)}
                </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium">{trade.symbol}</p>
                          {trade.isPaper && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              Paper
                            </Badge>
                          )}
                          <Badge className={getStatusColor(trade.status)}>
                            {trade.status}
                          </Badge>
                  </div>
                        <p className="text-sm text-slate-400">{trade.broker}</p>
                </div>
              </div>
                    <div className="text-right">
                      {trade.pnl !== undefined && (
                        <p className={`font-semibold ${getPnLColor(trade.pnl)}`}>
                          {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm text-slate-400">
                        {trade.timestamp.toLocaleDateString()}
                      </p>
                </div>
              </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-400">Entry</p>
                      <p className="text-white">${trade.entryPrice.toFixed(4)}</p>
            </div>
                    {trade.exitPrice && (
                      <div>
                        <p className="text-slate-400">Exit</p>
                        <p className="text-white">${trade.exitPrice.toFixed(4)}</p>
                </div>
                    )}
                    <div>
                      <p className="text-slate-400">Volume</p>
                      <p className="text-white">{trade.volume}</p>
                </div>
              </div>

                  {trade.strategy.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {trade.strategy.map((strategy, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strategy}
                        </Badge>
                    ))}
        </div>
                  )}

                  {trade.notes && (
                    <p className="text-sm text-slate-300">{trade.notes}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600/30">
                                        <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                        className="text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Editing trade ${trade.symbol}...`);
                          // In a real app, this would open an edit dialog
                        }}
                      >
                        <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                        className="text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete this ${trade.symbol} trade?`)) {
                            toast.success(`Trade ${trade.symbol} deleted`);
                            // In a real app, this would delete from local storage
                            setTrades(prev => prev.filter(t => t.id !== trade.id));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                </Button>
              </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{trade.duration || 'N/A'}</span>
            </div>
            </div>
          </CardContent>
        </Card>
            ))}
        </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Win/Loss Ratio */}
          <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-400" />
                Win/Loss Ratio
              </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{portfolioStats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Win Rate</div>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Performance Metrics
              </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Total Trades</p>
                  <p className="text-white font-semibold text-lg">{portfolioStats.totalTrades}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Best Streak</p>
                  <p className="text-green-400 font-semibold text-lg">{portfolioStats.bestStreak}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Current Streak</p>
                  <p className="text-blue-400 font-semibold text-lg">{portfolioStats.currentStreak}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Net P&L</p>
                  <p className={`font-semibold text-lg ${getPnLColor(portfolioStats.netPnL)}`}>
                    ${portfolioStats.netPnL.toFixed(2)}
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Asset Distribution */}
          <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-400" />
                Asset Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(portfolioStats.assetDistribution).map(([symbol, volume]) => (
                <div key={symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-white font-medium">{symbol}</span>
                  <span className="text-slate-400">{volume.toFixed(2)}</span>
            </div>
              ))}
            </CardContent>
          </Card>

          {/* Behavioral Insights */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                Behavioral Insights
              </CardTitle>
          </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Overtrading Alert</span>
                  </div>
                <p className="text-sm text-slate-300">You've made 15 trades this week. Consider reducing frequency.</p>
                  </div>
              <div className="p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-white font-medium">Revenge Trading Detected</span>
                </div>
                <p className="text-sm text-slate-300">Recent losses may be affecting your decision-making.</p>
                  </div>
              <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">Strategy Effectiveness</span>
                  </div>
                <p className="text-sm text-slate-300">Breakout strategy showing 75% success rate.</p>
                </div>
          </CardContent>
        </Card>

          {/* Performance Heatmap */}
          <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader className="pb-3">
                              <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Performance Heatmap
                </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const performance = Math.random() * 100;
                  const color = performance > 70 ? 'bg-green-500' : performance > 40 ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 ${color} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                      title={`Day ${i + 1}: ${performance.toFixed(0)}% performance`}
                    />
                  );
                })}
                </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* Profile Settings */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                <div>
                  <p className="text-white font-medium">{user?.name || 'Guest Trader'}</p>
                  <p className="text-sm text-slate-400">{user?.preferences?.experienceLevel || 'Novice Trader'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-slate-600/30 text-slate-400"
                  onClick={() => {
                    toast.info('Opening profile editor...');
                    window.location.href = '/settings';
                  }}
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600/30 text-slate-400"
                  onClick={() => {
                    toast.info('Opening avatar selector...');
                    // In a real app, this would open an avatar picker
                  }}
                >
                  Change Avatar
                </Button>
              </div>
          </CardContent>
        </Card>

          {/* Trading Settings */}
          <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Trading Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Paper Trading</p>
                  <p className="text-sm text-slate-400">Practice with virtual money</p>
                </div>
              <Button
                  variant={isPaperTrading ? "default" : "outline"}
                size="sm"
                  onClick={handleTogglePaperTrading}
                  className={isPaperTrading ? "bg-green-500 hover:bg-green-600" : ""}
              >
                  {isPaperTrading ? "Enabled" : "Disabled"}
              </Button>
            </div>
              <div className="flex items-center justify-between">
                  <div>
                  <p className="text-white font-medium">Auto Sync</p>
                  <p className="text-sm text-slate-400">Sync trades automatically</p>
                  </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
                </div>
          </CardContent>
        </Card>

          {/* Export Options */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Download className="w-5 h-5 mr-2 text-yellow-400" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-slate-600/30 text-slate-400"
                onClick={() => {
                  toast.success('Exporting trades as CSV...');
                  window.location.href = '/journal/export?format=csv';
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600/30 text-slate-400"
                onClick={() => {
                  toast.success('Exporting trades as PDF...');
                  window.location.href = '/journal/export?format=pdf';
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-red-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-slate-400">Get alerts for trades</p>
        </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
        </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Weekly Summary</p>
                  <p className="text-sm text-slate-400">Performance reports</p>
        </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
        </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 p-2">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'home' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'journal' ? 'text-blue-400 bg-blue-500/20' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Journal</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'text-green-400 bg-green-500/20' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'text-yellow-400 bg-yellow-500/20' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
        </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default UltraTraderDashboard; 