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
  TestTube
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
      const hasExistingPortfolios = (await localDatabase.getPortfolios()).length > 0;
      setIsFirstLaunch(!hasExistingPortfolios);
      
      if (!hasExistingPortfolios) {
        setOnboardingModalOpen(true);
      }
    };
    
    checkFirstLaunch();
  }, []);

  // Calculate real portfolio stats from actual trade data
  const portfolioStats = useMemo(() => {
    const stats = getTradeStats();
    const closedTrades = trades.filter(trade => (trade as any).status === 'closed');
    const openTrades = trades.filter(trade => (trade as any).status === 'open');
    
    // Calculate average holding time from closed trades
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

    // Calculate average risk-reward ratio
    const tradesWithRR = closedTrades.filter(trade => trade.riskReward && trade.riskReward > 0);
    const averageRR = tradesWithRR.length > 0 
      ? tradesWithRR.reduce((sum, trade) => sum + (trade.riskReward || 0), 0) / tradesWithRR.length 
      : 0;

    // Calculate profit factor (total wins / total losses)
    const totalWins = closedTrades
      .filter(trade => (trade.profitLoss || 0) > 0)
      .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const totalLosses = Math.abs(closedTrades
      .filter(trade => (trade.profitLoss || 0) < 0)
      .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

    // Calculate expected value per trade
    const expectedValue = stats.totalTrades > 0 ? stats.totalProfitLoss / stats.totalTrades : 0;

    // Calculate balance from actual trades only
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
      {/* Win Rate by Duration */}
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

      {/* Avg Hold Time */}
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

      {/* Avg Hold Time - Longs/Shorts */}
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

      {/* Day of Week */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">Day of Week</h3>
          <Info className="w-4 h-4 text-slate-400" />
        </div>
        
        {/* PNL Chart */}
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
    <div className="p-4 space-y-6 pb-24">
      {/* Quick Actions */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/functional-tests')}
          className="flex items-center gap-2 text-xs"
        >
          <TestTube className="w-3 h-3" />
          Run Tests
        </Button>
      </div>

      {/* Enhanced Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${portfolioStats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${portfolioStats.realizedPnL.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">All time</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {portfolioStats.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">{portfolioStats.tradeCount} trades</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Profit Factor</p>
                <p className="text-2xl font-bold text-purple-400">
                  {portfolioStats.profitFactor}
                </p>
                <p className="text-xs text-slate-500">Risk/Reward</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Open Positions</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {portfolioStats.openTrades}
                </p>
                <p className="text-xs text-slate-500">Active trades</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Equity Curve
              </CardTitle>
              <CardDescription>Portfolio performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <EquityCurveChart />
            </CardContent>
          </Card>
        </div>

        {/* Risk Metrics */}
        <div className="space-y-4">
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Max Drawdown</span>
                <span className="text-red-400 font-medium">
                  ${Math.abs(portfolioStats.realizedPnL * 0.15).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sharpe Ratio</span>
                <span className="text-white font-medium">
                  {(portfolioStats.winRate / 100 * portfolioStats.profitFactor).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Value</span>
                <span className="text-white font-medium">
                  ${portfolioStats.expectedValue.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Trading Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Hold Time</span>
                <span className="text-white font-medium">
                  {portfolioStats.avgHoldingDays}d {portfolioStats.avgHoldingHours}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Best Hour</span>
                <span className="text-white font-medium">14:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Most Traded</span>
                <span className="text-white font-medium">EURUSD</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTrades />
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AICoachCard />
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssetAllocationChart />
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-400" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WatchlistManager />
        </CardContent>
      </Card>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startDay = 2; // July 2025 starts on Tuesday (0=Sunday)
    const today = 3; // Current day for highlighting

    return (
      <div className="p-4 space-y-6">
        {/* Calendar View Toggle */}
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

        {/* Month Navigation */}
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

        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-slate-400 text-sm">
            <div className="p-2">Mon</div>
            <div className="p-2">Tue</div>
            <div className="p-2">Wed</div>
            <div className="p-2">Thu</div>
            <div className="p-2">Fri</div>
            <div className="p-2">Sat</div>
            <div className="p-2">Sun</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-3"></div>
            ))}
            
            {/* Days of the month */}
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

        {/* Weekly Info */}
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
    setOnboardingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] relative z-10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
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

      {/* Onboarding Dialog */}
      <Dialog open={onboardingModalOpen} onOpenChange={setOnboardingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Welcome to Quantum Risk Coach</DialogTitle>
            <DialogDescription>
              How would you like to track your trades?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            {/* Placeholder for supported brokers */}
          </div>
          
          <div className="mt-4">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleManualJournalSetup}
            >
              Manual Journal
            </Button>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOnboardingModalOpen(false)}>
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
