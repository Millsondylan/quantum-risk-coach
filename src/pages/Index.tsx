import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Clock, 
  Target,
  Brain,
  Shield,
  Calendar,
  BarChart3,
  List,
  Eye,
  Filter,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Activity,
  PieChart,
  TestTube,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import PersonalChallenges from '@/components/PersonalChallenges';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import RecentTrades from '@/components/RecentTrades';
import QuickStats from '@/components/QuickStats';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { tradingPlaceholders } from '@/lib/placeholderService';
import { localDatabase, Trade } from '@/lib/localDatabase';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { ManualJournalModal } from '@/components/ManualJournalModal';
import { PortfolioSelector } from '@/components/PortfolioSelector';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import AICoachCard from '@/components/AICoachCard';
import { DashboardLayoutManager } from '@/components/DashboardLayoutManager';
import { WidgetConfig } from '@/components/DashboardWidget';
import { AssetAllocationChart } from '@/components/AssetAllocationChart';
import { WatchlistManager } from '@/components/WatchlistManager';
import { EquityCurveChart } from '@/components/EquityCurveChart';
import { Headline, Description, Statistic } from '@/components/ui/typography';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface CurrencyPair {
  symbol: string;
  flag1: string;
  flag2: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SymbolPerformance {
  symbol: string;
  value: number;
  change: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [viewMode, setViewMode] = useState<'dashboard' | 'notifications'>('dashboard');
  const [portfolioOptions, setPortfolioOptions] = useState<string[]>(['Default Portfolio']);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('Default Portfolio');
  const [symbolFilter, setSymbolFilter] = useState('PNL');
  const [sortOrder, setSortOrder] = useState('Decreasing');
  const [calendarMonth, setCalendarMonth] = useState('July 2025');
  const [calendarView, setCalendarView] = useState('Monthly');
  const { trades, getTradeStats } = useTrades();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [isManualJournalModalOpen, setManualJournalModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  
  const { createPortfolio } = usePortfolioContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = localStorage.getItem('custom_portfolios');
    if (stored) {
      try {
        const custom = JSON.parse(stored).map((p: any) => p.name) as string[];
        setPortfolioOptions(['Default Portfolio', ...custom]);
      } catch (error) {
        console.error('Failed to parse stored portfolios:', error);
      }
    }
  }, []);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasExistingPortfolios = (await localDatabase.getPortfolios()).length > 0;
        setIsFirstLaunch(!hasExistingPortfolios);
        
        if (!hasExistingPortfolios && user && !user.onboardingCompleted) {
          setOnboardingModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };
    
    checkFirstLaunch();
  }, [user]);

  const portfolioStats = useMemo(() => {
    const stats = getTradeStats();
    const closedTrades = trades.filter(trade => (trade as any).status === 'closed');
    const openTrades = trades.filter(trade => (trade as any).status === 'open');
    
    const avgHoldingTime = closedTrades.length > 0 ? closedTrades.reduce((total, trade) => {
      if (trade.exitDate && trade.entryDate) {
        const entryTime = new Date(trade.entryDate).getTime();
        const exitTime = new Date(trade.exitDate).getTime();
        return total + (exitTime - entryTime);
      }
      return total;
    }, 0) / closedTrades.length : 0;

    const avgHoldingDays = Math.floor(avgHoldingTime / (1000 * 60 * 60 * 24));
    const avgHoldingHours = Math.floor((avgHoldingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const avgHoldingMinutes = Math.floor((avgHoldingTime % (1000 * 60 * 60)) / (1000 * 60));

    const tradesWithRR = closedTrades.filter(trade => trade.riskReward && trade.riskReward > 0);
    const averageRR = tradesWithRR.length > 0 
      ? tradesWithRR.reduce((sum, trade) => sum + (trade.riskReward || 0), 0) / tradesWithRR.length 
      : 0;

    const totalWins = closedTrades
      .filter(trade => (trade.profitLoss || 0) > 0)
      .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const totalLosses = Math.abs(closedTrades
      .filter(trade => (trade.profitLoss || 0) < 0)
      .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

    const expectedValue = stats.totalTrades > 0 ? stats.totalProfitLoss / stats.totalTrades : 0;

    const currentBalance = stats.totalProfitLoss;

    return {
      realizedPnL: stats.totalProfitLoss,
      tradeCount: stats.totalTrades,
      winRate: stats.winRate,
      averageRR: parseFloat(averageRR.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      expectedValue: parseFloat(expectedValue.toFixed(2)),
      avgHoldingDays,
      avgHoldingHours,
      avgHoldingMinutes,
      balance: currentBalance,
      openTrades: openTrades.length
    };
  }, [trades, getTradeStats]);

  const renderWatchlist = () => (
    <div className="p-4 space-y-4">
      <WatchlistManager />
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 space-y-4">
      <PerformanceDashboard />
      <AdvancedAnalytics />
    </div>
  );

  const renderTimeMetrics = () => (
    <div className="p-4 space-y-6 pb-24">
      <div className="space-y-3">
        <h3 className="text-white font-medium">Win Rate by Duration</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Intraday</span>
            <span className="text-white font-medium">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Multi-day</span>
            <span className="text-white font-medium">0</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-medium">Avg Hold Time</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Wins</span>
            <span className="text-white font-medium">0H 0M 0S</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Losses</span>
            <span className="text-white font-medium">0H 0M 0S</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-medium">Avg Hold Time</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Longs</span>
            <span className="text-white font-medium">0H 0M 0S</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Shorts</span>
            <span className="text-white font-medium">0H 0M 0S</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">Day of Week</h3>
          <Info className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="space-y-2">
          <div className="text-slate-400 text-sm">PNL</div>
          <div className="h-32 bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg flex items-end justify-between p-4">
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Mon</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Tue</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Wed</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Thu</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Fri</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Sat</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="h-0 w-4 bg-slate-600 rounded-t mb-1"></div>
              <span className="text-xs text-slate-400">Sun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="modern-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Trader!</h1>
            <p className="text-slate-400">Here's your trading overview for today</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-value profit-text">
            ${portfolioStats.balance.toFixed(2)}
          </div>
          <div className="stat-label">Total P&L</div>
          <div className="stat-change positive">+2.4% today</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-white">
            {portfolioStats.tradeCount}
          </div>
          <div className="stat-label">Total Trades</div>
          <div className="stat-change neutral">This month</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-white">
            {portfolioStats.winRate}%
          </div>
          <div className="stat-label">Win Rate</div>
          <div className="stat-change positive">+5.2% vs last month</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-white">
            {portfolioStats.openTrades}
          </div>
          <div className="stat-label">Open Trades</div>
          <div className="stat-change neutral">Active positions</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <PlusCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <Button 
              className="btn-primary w-full"
              onClick={() => navigate('/add-trade')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Trade
            </Button>
            <Button 
              className="btn-secondary w-full"
              onClick={() => navigate('/journal')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Journal
            </Button>
          </div>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
              <p className="text-sm text-slate-300 mb-2">Market Analysis</p>
              <p className="text-xs text-slate-400">Your recent trades show a bullish bias on EUR/USD</p>
            </div>
            <Button 
              className="btn-secondary w-full"
              onClick={() => navigate('/ai-coach')}
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Advice
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="modern-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/history')}
            className="text-blue-400 hover:text-blue-300"
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {trades.slice(0, 3).map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/20">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${(trade.profitLoss || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">{trade.symbol}</p>
                  <p className="text-xs text-slate-400">{trade.entryDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${(trade.profitLoss || 0) > 0 ? 'profit-text' : 'loss-text'}`}>
                  ${(trade.profitLoss || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">{trade.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="modern-card p-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Risk Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Avg R:R</span>
              <span className="text-sm font-medium text-white">{portfolioStats.averageRR}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Profit Factor</span>
              <span className="text-sm font-medium text-white">{portfolioStats.profitFactor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Expected Value</span>
              <span className="text-sm font-medium text-white">${portfolioStats.expectedValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="modern-card p-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Time Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Avg Hold Time</span>
              <span className="text-sm font-medium text-white">
                {portfolioStats.avgHoldingDays}d {portfolioStats.avgHoldingHours}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Best Time</span>
              <span className="text-sm font-medium text-white">09:00-11:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Best Day</span>
              <span className="text-sm font-medium text-white">Wednesday</span>
            </div>
          </div>
        </div>

        <div className="modern-card p-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Portfolio Health</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Drawdown</span>
              <span className="text-sm font-medium text-white">-2.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Sharpe Ratio</span>
              <span className="text-sm font-medium text-white">1.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Max Risk</span>
              <span className="text-sm font-medium text-white">1.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startDay = 2; // July 2025 starts on Tuesday (0=Sunday)
    const today = 3; // Current day for highlighting

    return (
      <div className="p-4 space-y-6">
        <div className="flex">
          <Button
            variant={calendarView === 'Monthly' ? 'default' : 'outline'}
            onClick={() => setCalendarView('Monthly')}
            className="flex-1 rounded-r-none bg-blue-600 text-white border-blue-600"
          >
            Monthly
          </Button>
          <Button
            variant={calendarView === 'Yearly' ? 'default' : 'outline'}
            onClick={() => setCalendarView('Yearly')}
            className="flex-1 rounded-l-none bg-slate-700 text-slate-300 border-slate-600"
          >
            Yearly
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95 transition-all duration-150 hover:bg-slate-800/50"
            onClick={() => tradingPlaceholders.economicCalendar()}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-white">{calendarMonth}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95 transition-all duration-150 hover:bg-slate-800/50"
            onClick={() => tradingPlaceholders.economicCalendar()}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-slate-400 text-sm">
            <div className="p-2">Mon</div>
            <div className="p-2">Tue</div>
            <div className="p-2">Wed</div>
            <div className="p-2">Thu</div>
            <div className="p-2">Fri</div>
            <div className="p-2">Sat</div>
            <div className="p-2">Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-3"></div>
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday = day === today;
              
              return (
                <div
                  key={day}
                  className={`p-3 text-center rounded-lg transition-colors ${
                    isToday 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium">Weekly Info</h3>
          <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
            <div className="text-slate-400 text-sm">No events scheduled for this week</div>
          </div>
        </div>
      </div>
    );
  };

  const handleManualJournalSetup = () => {
    setManualJournalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] relative z-10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        {!isMobile && (
          <TabsList className="grid w-full grid-cols-4 bg-[#1A1B1E] border-b border-[#2A2B2E] sticky top-0 z-20">
            <TabsTrigger 
              value="Dashboard" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              data-testid="dashboard-tab"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="Watchlist" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              data-testid="watchlist-tab"
            >
              Watchlist
            </TabsTrigger>
            <TabsTrigger 
              value="Analytics" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              data-testid="analytics-tab"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="Calendar" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              data-testid="calendar-tab"
            >
              Calendar
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="Dashboard" className="mt-0 pb-24">
          {renderDashboard()}
        </TabsContent>
        
        <TabsContent value="Watchlist" className="mt-0 pb-24">
          {renderWatchlist()}
        </TabsContent>
        
        <TabsContent value="Analytics" className="mt-0 pb-24">
          {renderAnalytics()}
        </TabsContent>
        
        <TabsContent value="Calendar" className="mt-0 pb-24">
          {renderCalendar()}
        </TabsContent>
      </Tabs>

      <Dialog open={onboardingModalOpen} onOpenChange={setOnboardingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Quantum Risk Coach!</DialogTitle>
            <DialogDescription>
              Let's set up your trading journal to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-400">
              Choose how you'd like to start tracking your trades:
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setOnboardingModalOpen(false);
                  navigate('/add-trade');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Trade
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManualJournalSetup}
              >
                <Target className="w-4 h-4 mr-2" />
                Set Up Manual Journal
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setOnboardingModalOpen(false);
                  navigate('/mt4-connection');
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Connect Broker Account
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setOnboardingModalOpen(false)}
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManualJournalModal
        open={isManualJournalModalOpen}
        onOpenChange={setManualJournalModalOpen}
      />
    </div>
  );
};

export default Index;
