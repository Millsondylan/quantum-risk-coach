import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Info
} from 'lucide-react';
import AICoachCard from '@/components/AICoachCard';
import PersonalChallenges from '@/components/PersonalChallenges';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import RecentTrades from '@/components/RecentTrades';
import QuickStats from '@/components/QuickStats';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { tradingPlaceholders } from '@/lib/placeholderService';
import { realBrokerService } from '@/lib/realBrokerService';
import { database } from '@/lib/localDatabase';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { BrokerConnectionModal } from '@/components/BrokerConnectionModal';
import { ManualJournalModal } from '@/components/ManualJournalModal';
import { PortfolioSelector } from '@/components/PortfolioSelector';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const { trades, getTradeStats } = useLocalTrades();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [isConnectionModalOpen, setConnectionModalOpen] = useState(false);
  const [isManualJournalModalOpen, setManualJournalModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  
  const { createPortfolio } = usePortfolioContext();

  // Mock currency data - replace with real API
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([
    { symbol: 'GBPUSD', flag1: '🇬🇧', flag2: '🇺🇸', price: 1.3628, change: -0.0109, changePercent: -0.86 },
    { symbol: 'USDCAD', flag1: '🇺🇸', flag2: '🇨🇦', price: 1.3584, change: -0.0054, changePercent: -0.40 },
    { symbol: 'EURUSD', flag1: '🇪🇺', flag2: '🇺🇸', price: 1.1797, change: -0.0005, changePercent: -0.04 },
    { symbol: 'USDCHF', flag1: '🇺🇸', flag2: '🇨🇭', price: 0.79162, change: -0.0002, changePercent: -0.02 },
    { symbol: 'USDJPY', flag1: '🇺🇸', flag2: '🇯🇵', price: 143.6640, change: 0.0009, changePercent: 0.06 },
    { symbol: 'AUDUSD', flag1: '🇦🇺', flag2: '🇺🇸', price: 0.65867, change: 0.0000, changePercent: 0.00 }
  ]);

  // Update currency prices every few seconds to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencyPairs(prev => prev.map(pair => ({
        ...pair,
        price: pair.price + (Math.random() - 0.5) * 0.001,
        change: (Math.random() - 0.5) * 0.01,
        changePercent: (Math.random() - 0.5) * 2
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      const hasExistingPortfolios = (await database.getPortfolios()).length > 0;
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
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    const openTrades = trades.filter(trade => trade.status === 'open');
    
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
    <div className="p-4 space-y-4 pb-24">
      {currencyPairs.map((pair, index) => (
        <div 
          key={pair.symbol} 
          className="flex items-center justify-between p-4 rounded-lg bg-[#1A1B1E] border border-[#2A2B2E] cursor-pointer hover:bg-[#2A2B2E] transition-colors touch-manipulation active:scale-95"
          onClick={() => tradingPlaceholders.chartingTools()}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">{pair.flag1}</span>
              <span className="text-lg ml-1">{pair.flag2}</span>
            </div>
            <div>
              <h3 className="text-white font-medium">{pair.symbol}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-medium">{pair.price.toFixed(4)}</div>
            <div className={`text-sm ${pair.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 space-y-4 pb-24">
      <PerformanceDashboard />
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
    <div className="p-4 space-y-4 pb-24">
      <PortfolioSelector />

      {/* Statistics Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Statistics</h2>
        <div className="text-slate-400 text-sm">Trade Count: {portfolioStats.tradeCount}</div>
      </div>

      {/* Realized PNL */}
      <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">Realized PNL</div>
        <div className={`text-3xl font-bold ${portfolioStats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {portfolioStats.realizedPnL}
        </div>
      </div>

      {/* Win Rate with Circular Progress */}
      <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-4">Win Rate</div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white">{portfolioStats.winRate.toFixed(0)}%</div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-600"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-400"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${portfolioStats.winRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Average RR with Circular Progress */}
      <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-4">Average RR</div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white">{portfolioStats.averageRR}</div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-600"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-400"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${Math.min(portfolioStats.averageRR * 20, 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Profit Factor and Expected Value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Profit Factor</div>
          <div className="text-2xl font-bold text-white">{portfolioStats.profitFactor}</div>
        </div>
        <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Expected Value</div>
          <div className="text-2xl font-bold text-white">{portfolioStats.expectedValue}</div>
        </div>
      </div>

      {/* Average Holding Time */}
      <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-4">Average Holding Time</div>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-bold">{portfolioStats.avgHoldingDays}</span>
            <span className="text-sm">Days</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-bold">{portfolioStats.avgHoldingHours}</span>
            <span className="text-sm">Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-bold">{portfolioStats.avgHoldingMinutes}</span>
            <span className="text-sm">Minutes</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">Balance</div>
        <div className="text-2xl font-bold text-white">{portfolioStats.balance}</div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startDay = 2; // July 2025 starts on Tuesday (0=Sunday)
    const today = 3; // Current day for highlighting

    return (
      <div className="p-4 space-y-6 pb-24">
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

  const handleBrokerSelection = (broker: string) => {
    setSelectedBroker(broker);
    setConnectionModalOpen(true);
    setOnboardingModalOpen(false);
  };

  const handleManualJournalSetup = () => {
    setManualJournalModalOpen(true);
    setOnboardingModalOpen(false);
  };

  const supportedBrokers = realBrokerService.getSupportedBrokers();

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="flex items-center justify-between p-4">
          {/* Left: Hamburger menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95 transition-all duration-150 hover:bg-slate-800/50" 
            onClick={() => window.location.href = '/settings'}
          >
            <div className="space-y-1">
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
            </div>
          </Button>

          {/* Center: View Selector */}
          <div className="flex gap-4">
            <Button 
              variant={viewMode === 'dashboard' ? 'default' : 'secondary'} 
              onClick={() => setViewMode('dashboard')}
              className={viewMode === 'dashboard' ? 'bg-blue-600' : 'bg-[#1A1B1E]'}
            >
              Dashboard
            </Button>
            <Button 
              variant={viewMode === 'notifications' ? 'default' : 'secondary'} 
              onClick={() => setViewMode('notifications')}
              className={viewMode === 'notifications' ? 'bg-blue-600' : 'bg-[#1A1B1E]'}
            >
              Notifications
            </Button>
          </div>

          {/* Right: Sort and Calendar Icons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0 touch-manipulation active:scale-95 transition-all duration-150 hover:bg-slate-800/50"
              onClick={() => setActiveTab('Analytics')}
            >
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0 touch-manipulation active:scale-95 transition-all duration-150 hover:bg-slate-800/50"
              onClick={() => setActiveTab('Calendar')}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {viewMode === 'dashboard' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-transparent border-b border-[#1A1B1E] rounded-none h-12 p-0">
              <TabsTrigger 
                value="Dashboard" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="Time Metrics" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none"
              >
                Time Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="Analytics" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="Calendar" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="Watchlist" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none"
              >
                Watchlist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Dashboard" className="mt-0">
              {renderDashboard()}
            </TabsContent>
            
            <TabsContent value="Time Metrics" className="mt-0">
              {renderTimeMetrics()}
            </TabsContent>
            
            <TabsContent value="Analytics" className="mt-0">
              {renderAnalytics()}
            </TabsContent>
            
            <TabsContent value="Calendar" className="mt-0">
              {renderCalendar()}
            </TabsContent>

            <TabsContent value="Watchlist" className="mt-0">
              {renderWatchlist()}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {viewMode === 'dashboard' ? (
        <div className="px-4 pt-4">
          <PortfolioSelector />
          <PerformanceDashboard />
        </div>
      ) : (
        <div className="px-4 pt-4">
          <NotificationCenter />
        </div>
      )}

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
            {supportedBrokers.slice(0, 9).map(broker => (
              <Button 
                key={broker}
                className="py-6 flex flex-col items-center justify-center gap-2 h-auto"
                onClick={() => handleBrokerSelection(broker)}
              >
                <span className="text-xl">{broker === 'mt4' ? '📊' : broker === 'mt5' ? '📈' : '🔶'}</span>
                <span className="text-xs uppercase">{broker}</span>
              </Button>
            ))}
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

      <BrokerConnectionModal 
        open={isConnectionModalOpen}
        broker={selectedBroker}
        onOpenChange={setConnectionModalOpen}
      />

      <ManualJournalModal 
        open={isManualJournalModalOpen}
        onOpenChange={setManualJournalModalOpen}
      />
    </div>
  );
};

export default Index;
