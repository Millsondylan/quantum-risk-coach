import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Filter,
  Download,
  Eye,
  PieChart,
  Activity,
  Zap,
  Calendar,
  Newspaper,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';
import TradeHeatmap from '@/components/TradeHeatmap';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import BehavioralPatterns from '@/components/BehavioralPatterns';
import DrawdownChart from '@/components/DrawdownChart';
import RiskMetrics from '@/components/RiskMetrics';
import NewsCalendar from '@/components/NewsCalendar';
import TradeTimeline from '@/components/TradeTimeline';

interface NewsItem {
  id?: string;
  title: string;
  summary?: string;
  content?: string;
  source: string;
  publishedAt: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedSymbols?: string[];
  url: string;
  imageUrl?: string;
  urlToImage?: string;
  description?: string;
}

const PerformanceCalendar = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [timeframe, setTimeframe] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  
  const { trades, getTradeStats } = useLocalTrades();
  
  // Type assertion to handle the combined trade type
  const typedTrades = trades as any[];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await realDataService.getFinancialNews();
        setNewsData(news);
      } catch (error) {
        console.error('Failed to fetch news:', error);
        toast.error('Failed to load news data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Calculate comprehensive analytics from real trade data
  const analyticsData = useMemo(() => {
    const stats = getTradeStats();
    const closedTrades = typedTrades.filter(trade => trade.status === 'closed');
    const openTrades = typedTrades.filter(trade => trade.status === 'open');

    // Calculate advanced metrics
    const totalWins = closedTrades.filter(t => (t.profit || 0) > 0);
    const totalLosses = closedTrades.filter(t => (t.profit || 0) < 0);
    
    const totalWinAmount = totalWins.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLossAmount = Math.abs(totalLosses.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 999 : 0;
    
    // Calculate average holding time
    const avgHoldingTime = closedTrades.length > 0 ? closedTrades.reduce((total, trade) => {
      if (trade.exitDate && trade.entryDate) {
        const entryTime = new Date(trade.entryDate).getTime();
        const exitTime = new Date(trade.exitDate).getTime();
        return total + (exitTime - entryTime);
      }
      return total;
    }, 0) / closedTrades.length : 0;

    // Calculate risk-adjusted metrics
    const returns = closedTrades.map(t => (t.profit || 0));
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;

    // Calculate drawdown
    let peak = 0;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;

    closedTrades.forEach(trade => {
      runningTotal += (trade.profit || 0);
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      currentDrawdown = peak - runningTotal;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    });

    // Calculate behavioral patterns
    const tradesByHour = new Map<number, any[]>();
    const tradesByDay = new Map<number, any[]>();
    
    closedTrades.forEach(trade => {
      const entryDate = new Date(trade.entryDate);
      const hour = entryDate.getHours();
      const day = entryDate.getDay();
      
      if (!tradesByHour.has(hour)) tradesByHour.set(hour, []);
      if (!tradesByDay.has(day)) tradesByDay.set(day, []);
      
      tradesByHour.get(hour)!.push(trade);
      tradesByDay.get(day)!.push(trade);
    });

    // Find best/worst performing times
    let bestHour = 0;
    let bestHourWinRate = 0;
    let worstHour = 0;
    let worstHourWinRate = 100;

    tradesByHour.forEach((hourTrades, hour) => {
      const winRate = hourTrades.length > 0 ? 
        (hourTrades.filter(t => (t.profitLoss || 0) > 0).length / hourTrades.length) * 100 : 0;
      
      if (winRate > bestHourWinRate) {
        bestHourWinRate = winRate;
        bestHour = hour;
      }
      if (winRate < worstHourWinRate) {
        worstHourWinRate = winRate;
        worstHour = hour;
      }
    });

    return {
      basic: {
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        totalPnL: stats.totalProfitLoss,
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        avgHoldingTime: Math.floor(avgHoldingTime / (1000 * 60 * 60 * 24)), // days
        openTrades: openTrades.length
      },
      advanced: {
        sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        volatility: parseFloat(volatility.toFixed(2)),
        avgReturn: parseFloat(avgReturn.toFixed(2)),
        expectedValue: stats.totalTrades > 0 ? parseFloat((stats.totalProfitLoss / stats.totalTrades).toFixed(2)) : 0
      },
      behavioral: {
        bestHour,
        bestHourWinRate: parseFloat(bestHourWinRate.toFixed(1)),
        worstHour,
        worstHourWinRate: parseFloat(worstHourWinRate.toFixed(1)),
        tradesByHour: Object.fromEntries(tradesByHour),
        tradesByDay: Object.fromEntries(tradesByDay)
      },
      timeAnalysis: {
        avgHoldingTimeHours: Math.floor((avgHoldingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        avgHoldingTimeMinutes: Math.floor((avgHoldingTime % (1000 * 60 * 60)) / (1000 * 60))
      }
    };
  }, [typedTrades, getTradeStats]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleExportData = () => {
    // Implementation for CSV export
    toast.success('Export functionality will be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics & Calendar</h1>
              <p className="text-slate-400 text-sm">Performance insights and market calendar</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total P&L</p>
                  <p className={`text-xl font-bold ${analyticsData.basic.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${analyticsData.basic.totalPnL.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Win Rate</p>
                  <p className="text-xl font-bold text-blue-400">
                    {analyticsData.basic.winRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Profit Factor</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {analyticsData.basic.profitFactor}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Sharpe Ratio</p>
                  <p className="text-xl font-bold text-purple-400">
                    {analyticsData.advanced.sharpeRatio}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1A1B1E] border border-[#2A2B2E]">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-blue-600">
              <Eye className="w-4 h-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-blue-600">
              <Newspaper className="w-4 h-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Trade Calendar</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMonthChange('prev')}
                          className="text-slate-400 hover:text-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-white font-medium">
                          {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMonthChange('next')}
                          className="text-slate-400 hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TradeTimeline 
                      trades={typedTrades}
                      currentMonth={currentMonth}
                      newsData={newsData}
                      onDateSelect={setSelectedDate}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Stats */}
              <div className="space-y-4">
                <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Monthly Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trades</span>
                      <span className="text-white font-medium">{analyticsData.basic.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Hold Time</span>
                      <span className="text-white font-medium">
                        {analyticsData.basic.avgHoldingTime}d {analyticsData.timeAnalysis.avgHoldingTimeHours}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Hour</span>
                      <span className="text-white font-medium">
                        {analyticsData.behavioral.bestHour}:00 ({analyticsData.behavioral.bestHourWinRate}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Drawdown</span>
                      <span className="text-red-400 font-medium">${analyticsData.advanced.maxDrawdown}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volatility</span>
                      <span className="text-white font-medium">${analyticsData.advanced.volatility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Value</span>
                      <span className="text-white font-medium">${analyticsData.advanced.expectedValue}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white">Trade Heatmap</CardTitle>
                  <CardDescription>Performance by time and day</CardDescription>
                </CardHeader>
                <CardContent>
                  <TradeHeatmap trades={typedTrades} />
                </CardContent>
              </Card>

              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white">Drawdown Analysis</CardTitle>
                  <CardDescription>Risk visualization over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <DrawdownChart trades={typedTrades} />
                </CardContent>
              </Card>

              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                  <CardDescription>Advanced trading statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceMetrics data={analyticsData} />
                </CardContent>
              </Card>

              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white">Risk Analysis</CardTitle>
                  <CardDescription>Portfolio risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskMetrics data={analyticsData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
              <CardHeader>
                <CardTitle className="text-white">Behavioral Pattern Recognition</CardTitle>
                <CardDescription>AI-powered trading behavior analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <BehavioralPatterns trades={typedTrades} analyticsData={analyticsData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
              <CardHeader>
                <CardTitle className="text-white">Economic Calendar & News</CardTitle>
                <CardDescription>Market events and their impact on your trades</CardDescription>
              </CardHeader>
              <CardContent>
                <NewsCalendar 
                  newsData={newsData}
                  trades={typedTrades}
                  currentMonth={currentMonth}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceCalendar; 