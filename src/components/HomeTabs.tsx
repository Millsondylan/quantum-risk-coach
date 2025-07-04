import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlagIcon, FlagIconCode } from 'react-flag-kit';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NewsTab from './tabs/NewsTab';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';
import { userInitializationService, getEmptyStateMessage } from '@/lib/userInitialization';
import { formatPnL, formatPercentage } from '@/lib/pnlCalculator';


const watchlistData: { symbol: string; flag: FlagIconCode; price: string; change: string; positive?: boolean; }[] = [
  { symbol: 'GBPUSD', flag: 'GB', price: '1.3628', change: '-0.86%' },
  { symbol: 'USDCAD', flag: 'CA', price: '1.3584', change: '-0.40%' },
  { symbol: 'EURUSD', flag: 'EU', price: '1.1797', change: '-0.04%' },
  { symbol: 'USDCHF', flag: 'CH', price: '0.79162', change: '-0.02%' },
  { symbol: 'USDJPY', flag: 'JP', price: '143.6640', change: '0.06%', positive: true },
  { symbol: 'AUDUSD', flag: 'AU', price: '0.65867', change: '0.09%', positive: true },
];

const WatchlistTab = () => {
  const navigate = useNavigate();

  const handleSymbolClick = (symbol: string) => {
    toast.success(`Opening ${symbol} details`);
    // Could navigate to a detailed view in the future
    // navigate(`/symbol/${symbol}`);
  };

  return (
    <div className="p-4">
      <ul className="space-y-4">
        {watchlistData.map((item) => (
          <li 
            key={item.symbol} 
            className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
            onClick={() => handleSymbolClick(item.symbol)}
          >
            <div className="flex items-center space-x-4">
              <FlagIcon code={item.flag} size={32} />
              <span className="font-semibold">{item.symbol}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold">{item.price}</p>
              <p className={`text-sm ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                {item.change}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AnalyticsTab = () => {
  const navigate = useNavigate();
  const [symbolFilter, setSymbolFilter] = React.useState('pnl');
  const [sortOrder, setSortOrder] = React.useState('decreasing');
  const { trades, getTradeStats } = useTrades();
  const { user } = useUser();
  
  const stats = getTradeStats();
  const isCleanState = userInitializationService.hasUserInputData(
    user || {} as any, 
    trades, 
    []
  ) === false;

  const handleSymbolFilterChange = (value: string) => {
    setSymbolFilter(value);
    console.log(`Filter changed to ${value.toUpperCase()}`);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    console.log(`Sort order changed to ${value}`);
  };

  return (
    <div className="p-4 space-y-6">
      {isCleanState && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
          <p className="text-blue-300 text-sm">
            {getEmptyStateMessage('analytics')}
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Symbol Performance</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select value={symbolFilter} onValueChange={handleSymbolFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pnl">PNL</SelectItem>
            <SelectItem value="winrate">Win Rate</SelectItem>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="frequency">Frequency</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="decreasing">Decreasing</SelectItem>
            <SelectItem value="increasing">Increasing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Chart Placeholder */}
      <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors"
           onClick={() => navigate('/performance-calendar')}>
        <p className="text-gray-500">Symbol Performance Chart - Click to view detailed analytics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Symbols</CardTitle>
            <Info className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(trades.map(t => t.symbol)).size}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Win</CardTitle>
            <Info className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatPnL(stats.averageWin)}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Loss</CardTitle>
            <Info className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatPnL(-stats.averageLoss)}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <Info className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatPnL(-stats.maxDrawdown)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.profitFactor >= 1 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.profitFactor.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => navigate('/performance-calendar')}>
        <CardHeader>
          <CardTitle>Risk vs Reward</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-400">Best Trade</p>
              <p className="text-lg font-bold text-green-400">{formatPnL(stats.largestWin)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Worst Trade</p>
              <p className="text-lg font-bold text-red-400">{formatPnL(stats.largestLoss)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

const TimeMetricsTab = () => {
  const { trades, getTradeStats } = useTrades();
  const { user } = useUser();
  
  const stats = getTradeStats();
  const isCleanState = userInitializationService.hasUserInputData(
    user || {} as any, 
    trades, 
    []
  ) === false;

  return (
    <div className="p-4 space-y-6">
      {isCleanState && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
          <p className="text-blue-300 text-sm">
            Time metrics will show once you start adding trades with different durations.
          </p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Trading Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Trades</span>
            <span className="font-bold">{stats.totalTrades}</span>
          </div>
          <div className="flex justify-between">
            <span>Open Positions</span>
            <span className="font-bold text-blue-400">{stats.openTrades}</span>
          </div>
          <div className="flex justify-between">
            <span>Closed Trades</span>
            <span className="font-bold">{stats.totalTrades - stats.openTrades}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Win Rate</span>
            <span className={`font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Avg Win</span>
            <span className="font-bold text-green-400">{formatPnL(stats.averageWin)}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Loss</span>
            <span className="font-bold text-red-400">{formatPnL(-stats.averageLoss)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Hold Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Longs</span>
            <span>0H 0M 0S</span>
          </div>
          <div className="flex justify-between">
            <span>Shorts</span>
            <span>0H 0M 0S</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center space-x-2">
          <CardTitle>Day of Week</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-2">PNL</p>
          <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Day of Week PNL Chart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DashboardTab = () => {
  const navigate = useNavigate();
  const { trades, getTradeStats } = useTrades();
  const { user } = useUser();
  
  // Get real trade statistics
  const stats = getTradeStats();
  
  // Check if user is in clean state (no trades, no balance set)
  const isCleanState = userInitializationService.hasUserInputData(
    user || {} as any, 
    trades, 
    []
  ) === false;

  const handleMetricClick = (metric: string) => {
    if (isCleanState) {
      console.log(`Viewing ${metric} - No data available yet`);
    } else {
      navigate('/performance-calendar');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-trade':
        navigate('/add-trade');
        break;
      case 'view-history':
        navigate('/history');
        break;
      case 'ai-coach':
        navigate('/ai-coach');
        break;
      default:
        toast.info(`${action} functionality coming soon!`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {isCleanState && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
          <p className="text-blue-300 text-sm">
            {getEmptyStateMessage('dashboard')}
          </p>
        </div>
      )}
      
      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Statistics')}>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="cursor-pointer hover:bg-gray-700/30 p-2 rounded" onClick={(e) => { e.stopPropagation(); handleMetricClick('Trade Count'); }}>
              <p className="text-sm text-gray-400">Trade Count</p>
              <p className="text-2xl font-bold">{stats.totalTrades}</p>
            </div>
            <div className="cursor-pointer hover:bg-gray-700/30 p-2 rounded" onClick={(e) => { e.stopPropagation(); handleMetricClick('Realized PNL'); }}>
              <p className="text-sm text-gray-400">Realized PNL</p>
              <p className={`text-2xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPnL(stats.totalProfitLoss)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Win Rate')}>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative h-24 w-24">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-700" strokeWidth="2"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-500" strokeWidth="2" 
                        strokeDasharray={`${stats.winRate} ${100 - stats.winRate}`} strokeDashoffset="0"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {formatPercentage(stats.winRate).replace('+', '')}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Profit Factor')}>
          <CardHeader>
            <CardTitle>Profit Factor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             <div className="relative h-24 w-24">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-700" strokeWidth="2"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-green-500" strokeWidth="2" 
                        strokeDasharray={`${Math.min(stats.profitFactor * 10, 100)} ${100 - Math.min(stats.profitFactor * 10, 100)}`} strokeDashoffset="0"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {stats.profitFactor.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Performance Metrics')}>
        <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div className="cursor-pointer hover:bg-gray-700/30 p-2 rounded" onClick={(e) => { e.stopPropagation(); handleMetricClick('Largest Win'); }}>
              <p className="text-sm text-gray-400">Largest Win</p>
              <p className="text-2xl font-bold text-green-400">{formatPnL(stats.largestWin)}</p>
            </div>
            <div className="cursor-pointer hover:bg-gray-700/30 p-2 rounded" onClick={(e) => { e.stopPropagation(); handleMetricClick('Largest Loss'); }}>
              <p className="text-sm text-gray-400">Largest Loss</p>
              <p className="text-2xl font-bold text-red-400">{formatPnL(stats.largestLoss)}</p>
            </div>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Trade Breakdown')}>
          <CardHeader><CardTitle>Win/Loss Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Wins</p>
                <p className="text-2xl font-bold text-green-400">{stats.winningTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Losses</p>
                <p className="text-2xl font-bold text-red-400">{stats.losingTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Open</p>
                <p className="text-2xl font-bold text-blue-400">{stats.openTrades}</p>
              </div>
            </div>
          </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => handleMetricClick('Average Performance')}>
          <CardHeader><CardTitle>Average P&L</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stats.averageProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnL(stats.averageProfitLoss)}
            </p>
          </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button onClick={() => handleQuickAction('add-trade')} className="h-12">
          Add New Trade
        </Button>
        <Button onClick={() => handleQuickAction('view-history')} variant="outline" className="h-12">
          View History
        </Button>
      </div>

    </div>
  );
};

const CalendarTab = () => {
  const navigate = useNavigate();
  // Dummy data for days in a month
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleViewChange = (view: string) => {
    if (view === 'Monthly') {
      navigate('/performance-calendar');
    } else {
      toast.info('Yearly view coming soon!');
    }
  };

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    navigate('/performance-calendar');
  };

  return (
    <div className="p-4">
      <div className="flex justify-center space-x-4 mb-4">
        <Button 
          variant="ghost" 
          className="bg-blue-600" 
          onClick={() => handleViewChange('Monthly')}
        >
          Monthly
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => handleViewChange('Yearly')}
        >
          Yearly
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleMonthNavigation('prev')}
        >
          <ChevronLeft />
        </Button>
        <h3 className="text-lg font-semibold">July 2025</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleMonthNavigation('next')}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-400 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map(day => (
          <button
            key={day}
            onClick={() => toast.success(`Selected ${day} July 2025`)}
            className="p-2 h-12 flex items-center justify-center bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            {day}
          </button>
        ))}
      </div>
       <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Weekly Info</h3>
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No data for this week.</p>
            </div>
        </div>
    </div>
  );
};


const HomeTabs = () => {
  // Force Dashboard as default tab
  React.useEffect(() => {
    // Ensure Dashboard tab is selected on mount
    const dashboardTab = document.querySelector('[data-value="Dashboard"]') as HTMLElement;
    if (dashboardTab) {
      dashboardTab.click();
    }
  }, []);

  return (
    <Tabs defaultValue="Dashboard" className="w-full" value="Dashboard">
      <TabsList className="grid w-full grid-cols-6 bg-transparent border-b border-gray-700 rounded-none px-0">
        <TabsTrigger value="Dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="Time Metrics">Time Metrics</TabsTrigger>
        <TabsTrigger value="Analytics">Analytics</TabsTrigger>
        <TabsTrigger value="Calendar">Calendar</TabsTrigger>
        <TabsTrigger value="Watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="News">News</TabsTrigger>
      </TabsList>
      <TabsContent value="Dashboard">
        <DashboardTab />
      </TabsContent>
      <TabsContent value="Time Metrics">
        <TimeMetricsTab />
      </TabsContent>
      <TabsContent value="Analytics">
        <AnalyticsTab />
      </TabsContent>
      <TabsContent value="Calendar">
        <CalendarTab />
      </TabsContent>
      <TabsContent value="Watchlist">
        <WatchlistTab />
      </TabsContent>
      <TabsContent value="News">
        <NewsTab />
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs; 