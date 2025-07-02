import React, { memo, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import QuickStats from './QuickStats';
import RecentTrades from './RecentTrades';
import TradeJournalCard from './TradeJournalCard';
import AICoachCard from './AICoachCard';
import PerformanceCalendar from './PerformanceCalendar';
import StrategyAnalyzer from './StrategyAnalyzer';
import RiskAnalyzer from './RiskAnalyzer';
import MarketCoverageSentiment from './MarketCoverageSentiment';
import AdvancedAnalytics from './AdvancedAnalytics';
import AIMarketInsights from './AIMarketInsights';
import EnhancedTradingJournal from './EnhancedTradingJournal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Activity, 
  Zap,
  Target,
  BookOpen,
  Users,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Sparkles,
  Wallet
} from 'lucide-react';
import BrokerIntegration from './BrokerIntegration';

// Memoized component wrappers for better performance
const MemoizedQuickStats = memo(QuickStats);
const MemoizedRecentTrades = memo(RecentTrades);
const MemoizedTradeJournalCard = memo(TradeJournalCard);
const MemoizedAICoachCard = memo(AICoachCard);
const MemoizedPerformanceCalendar = memo(PerformanceCalendar);
const MemoizedStrategyAnalyzer = memo(StrategyAnalyzer);
const MemoizedRiskAnalyzer = memo(RiskAnalyzer);
const MemoizedMarketCoverageSentiment = memo(MarketCoverageSentiment);
const MemoizedAdvancedAnalytics = memo(AdvancedAnalytics);
const MemoizedAIMarketInsights = memo(AIMarketInsights);
const MemoizedEnhancedTradingJournal = memo(EnhancedTradingJournal);

interface DashboardGridProps {
  layout?: 'standard' | 'compact' | 'analytics' | 'journal';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ layout = 'standard' }) => {
  const isMobile = useIsMobile();

  // Memoized layout configurations for different screen sizes and modes
  const layoutConfig = useMemo(() => {
    switch (layout) {
      case 'compact':
        return {
          primary: ['quick-stats', 'recent-trades'],
          secondary: ['ai-insights', 'performance-calendar']
        };
      case 'analytics':
        return {
          primary: ['advanced-analytics', 'strategy-analyzer'],
          secondary: ['performance-calendar', 'risk-analyzer']
        };
      case 'journal':
        return {
          primary: ['enhanced-journal'],
          secondary: ['ai-coach', 'recent-trades']
        };
      default:
        return {
          primary: ['quick-stats', 'recent-trades', 'trade-journal', 'performance-calendar', 'strategy-analyzer'],
          secondary: ['ai-insights', 'ai-coach', 'risk-analyzer', 'market-sentiment']
        };
    }
  }, [layout]);

  // Component mapping for dynamic rendering
  const componentMap = useMemo(() => ({
    'quick-stats': <MemoizedQuickStats />,
    'recent-trades': <MemoizedRecentTrades />,
    'trade-journal': <MemoizedTradeJournalCard />,
    'ai-coach': <MemoizedAICoachCard />,
    'performance-calendar': <MemoizedPerformanceCalendar />,
    'strategy-analyzer': <MemoizedStrategyAnalyzer />,
    'risk-analyzer': <MemoizedRiskAnalyzer />,
    'market-sentiment': <MemoizedMarketCoverageSentiment />,
    'advanced-analytics': <MemoizedAdvancedAnalytics />,
    'ai-insights': <MemoizedAIMarketInsights />,
    'enhanced-journal': <MemoizedEnhancedTradingJournal />
  }), []);

  const quickActions = [
    {
      title: "Connect Broker",
      description: "Link your trading accounts",
      icon: <Zap className="w-5 h-5" />,
      color: "from-blue-500 to-purple-600",
      path: "/connect"
    },
    {
      title: "Place Trade",
      description: "Execute new position",
      icon: <Target className="w-5 h-5" />,
      color: "from-emerald-500 to-green-600",
      path: "/trade-builder"
    },
    {
      title: "Journal Entry",
      description: "Log trading notes",
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-orange-500 to-red-600",
      path: "/journal"
    },
    {
      title: "Strategy Analysis",
      description: "Review performance",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-purple-500 to-violet-600",
      path: "/strategy-analyzer"
    }
  ];

  const marketOverview = {
    performance: {
      today: { value: 2.34, change: 1.2 },
      week: { value: 8.67, change: -0.3 },
      month: { value: 15.42, change: 2.8 }
    },
    stats: {
      totalTrades: 247,
      winRate: 68.5,
      profitFactor: 1.45,
      maxDrawdown: 8.2
    }
  };

  // Mobile-optimized layout
  if (isMobile) {
    return (
      <div className="space-y-6 p-4">
        {/* AI Coach always at the top */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">AI Trading Coach</h2>
          <MemoizedAICoachCard />
        </div>
        <div className="space-y-4">
          {componentMap['quick-stats']}
          {componentMap['recent-trades']}
          {componentMap['ai-insights']}
          {layout === 'journal' && componentMap['enhanced-journal']}
          {layout === 'analytics' && componentMap['advanced-analytics']}
          {componentMap['performance-calendar']}
        </div>
      </div>
    );
  }

  // Desktop/tablet layout with optimized grid
  return (
    <div className="space-y-6">
      {/* AI Coach always at the top */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white">AI Trading Coach</h2>
        <MemoizedAICoachCard />
      </div>
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Trader 👋
          </h1>
          <p className="text-slate-400">
            Monitor your trading performance and execute strategies with precision
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-medium">Markets Open</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Live Data</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} bg-opacity-20`}>
                  {action.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-xs text-slate-400">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Today
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                +${marketOverview.performance.today.value.toFixed(2)}%
              </h3>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  {marketOverview.performance.today.change > 0 ? '+' : ''}{marketOverview.performance.today.change}%
                </span>
                <span className="text-xs text-slate-400">vs yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                This Week
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                +${marketOverview.performance.week.value.toFixed(2)}%
              </h3>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {marketOverview.performance.week.change}%
                </span>
                <span className="text-xs text-slate-400">vs last week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                This Month
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                +${marketOverview.performance.month.value.toFixed(2)}%
              </h3>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  +{marketOverview.performance.month.change}%
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - QuickStats */}
        <div className="lg:col-span-2 space-y-6">
          <QuickStats />
          
          {/* Advanced Analytics Preview */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Trading Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {marketOverview.stats.totalTrades}
                  </div>
                  <div className="text-xs text-slate-400">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {marketOverview.stats.winRate}%
                  </div>
                  <div className="text-xs text-slate-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {marketOverview.stats.profitFactor}
                  </div>
                  <div className="text-xs text-slate-400">Profit Factor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {marketOverview.stats.maxDrawdown}%
                  </div>
                  <div className="text-xs text-slate-400">Max Drawdown</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <RecentTrades />
        </div>

        {/* Right Column - AI Coach & Actions */}
        <div className="space-y-6">
          <AICoachCard />
          
          {/* Quick Portfolio Summary */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Balance</span>
                <span className="text-xl font-bold text-white">$125,420.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Today's P&L</span>
                <span className="text-lg font-semibold text-emerald-400">+$2,340.20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Open Positions</span>
                <span className="text-white font-medium">7</span>
              </div>
              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Risk Level</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Conservative
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white">EUR/USD Long Opportunity</span>
                </div>
                <p className="text-xs text-slate-400">
                  Strong bullish momentum detected with 78% confidence
                </p>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white">Risk Management Alert</span>
                </div>
                <p className="text-xs text-slate-400">
                  Consider reducing position size on GBPJPY
                </p>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white">Market Analysis</span>
                </div>
                <p className="text-xs text-slate-400">
                  High volatility expected during US session
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Broker Integration Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Connected Platforms</h2>
            <p className="text-slate-400">Manage your broker connections and trading accounts</p>
          </div>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage All
          </Button>
        </div>
        <BrokerIntegration />
      </div>

      {/* Advanced Analytics Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Performance Analytics</h2>
            <p className="text-slate-400">Deep dive into your trading performance metrics</p>
          </div>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Analytics
          </Button>
        </div>
        <AdvancedAnalytics />
      </div>
    </div>
  );
};

export default memo(DashboardGrid);
