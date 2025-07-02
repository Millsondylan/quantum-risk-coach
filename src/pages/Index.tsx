import React, { useState, useEffect, memo, useMemo } from 'react';
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
  Plus
} from 'lucide-react';
import AICoachCard from '@/components/AICoachCard';
import PersonalChallenges from '@/components/PersonalChallenges';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import RecentTrades from '@/components/RecentTrades';
import QuickStats from '@/components/QuickStats';
import { useLocalTrades } from '@/hooks/useLocalTrades';

const Index = memo(() => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [portfolioOptions, setPortfolioOptions] = useState<string[]>(['Main Portfolio']);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('Main Portfolio');
  const { trades, getTradeStats } = useLocalTrades();

  useEffect(() => {
    const stored = localStorage.getItem('custom_portfolios');
    if (stored) {
      try {
        const custom = JSON.parse(stored).map((p: any) => p.name) as string[];
        setPortfolioOptions(['Main Portfolio', ...custom]);
      } catch (error) {
        console.error('Failed to parse stored portfolios:', error);
      }
    }
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

    // Calculate balance from actual trades only (no hardcoded starting balance)
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

  const renderDashboard = () => (
    <div className="p-4 space-y-4 pb-24">
      {/* AI Coach Section - Always at top */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            AI Trading Coach
          </h2>
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
            Live Analysis
          </Badge>
        </div>
        <AICoachCard />
      </div>

      {/* Statistics Grid - Real data from trades */}
      <div className="grid grid-cols-2 gap-3">
        {/* Realized PNL */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Realized PNL</p>
                <p className={`text-lg font-bold ${portfolioStats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${portfolioStats.realizedPnL.toLocaleString()}
                </p>
              </div>
              {portfolioStats.realizedPnL >= 0 ? 
                <TrendingUp className="w-5 h-5 text-green-400" /> : 
                <TrendingDown className="w-5 h-5 text-red-400" />
              }
            </div>
          </CardContent>
        </Card>

        {/* Trade Count */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Trade Count</p>
                <p className="text-lg font-bold text-white">{portfolioStats.tradeCount}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Win Rate with Gauge */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Win Rate</p>
                <Percent className="w-4 h-4 text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-green-400">{portfolioStats.winRate.toFixed(1)}%</p>
                <Progress value={portfolioStats.winRate} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average RR with Gauge */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Average RR</p>
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-blue-400">{portfolioStats.averageRR}</p>
                <Progress value={Math.min((portfolioStats.averageRR / 3) * 100, 100)} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Factor */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Profit Factor</p>
                <p className="text-lg font-bold text-blue-400">{portfolioStats.profitFactor}</p>
              </div>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Expected Value */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Expected Value</p>
                <p className={`text-lg font-bold ${portfolioStats.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${portfolioStats.expectedValue}
                </p>
              </div>
              {portfolioStats.expectedValue >= 0 ? 
                <TrendingUp className="w-5 h-5 text-green-400" /> : 
                <TrendingDown className="w-5 h-5 text-red-400" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Holding Time - Full width card */}
      <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Average Holding Time</p>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{portfolioStats.avgHoldingDays}</p>
              <p className="text-xs text-slate-400">Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{portfolioStats.avgHoldingHours}</p>
              <p className="text-xs text-slate-400">Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{portfolioStats.avgHoldingMinutes}</p>
              <p className="text-xs text-slate-400">Minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Balance</p>
              <p className="text-2xl font-bold text-white">${portfolioStats.balance.toLocaleString()}</p>
              {portfolioStats.openTrades > 0 && (
                <p className="text-xs text-blue-400 mt-1">{portfolioStats.openTrades} open trades</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-slate-400" />
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Challenges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Personal Challenges
          </h2>
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
            4 Active
          </Badge>
        </div>
        <PersonalChallenges />
      </div>

      {/* Risk Analysis Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Risk Analysis
          </h2>
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
            Real-time
          </Badge>
        </div>
        <RiskAnalyzer />
      </div>

      {/* Recent Trades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-blue-400" />
            Recent Trades
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-300"
            onClick={() => window.location.href = '/history'}
          >
            View All
          </Button>
        </div>
        <RecentTrades />
      </div>
    </div>
  );

  const renderPlaceholderTab = (tabName: string) => {
    switch (tabName) {
      case 'Time Metrics':
        return (
          <div className="p-4 space-y-4 pb-24">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">Best Trading Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">9:30-10:30 AM</span>
                      <span className="text-green-400">+$347</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">2:00-3:00 PM</span>
                      <span className="text-green-400">+$289</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">3:30-4:00 PM</span>
                      <span className="text-red-400">-$123</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">Trading Days</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monday</span>
                      <span className="text-blue-400">71%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wednesday</span>
                      <span className="text-green-400">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Friday</span>
                      <span className="text-red-400">63%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Session Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">London</p>
                    <p className="text-lg font-bold text-blue-400">+$1,234</p>
                    <p className="text-xs text-slate-400">Win Rate: 74%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">New York</p>
                    <p className="text-lg font-bold text-green-400">+$2,189</p>
                    <p className="text-xs text-slate-400">Win Rate: 81%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Tokyo</p>
                    <p className="text-lg font-bold text-orange-400">+$567</p>
                    <p className="text-xs text-slate-400">Win Rate: 67%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'Analytics':
        return (
          <div className="p-4 space-y-4 pb-24">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">Risk Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Sharpe Ratio</span>
                      <span className="text-blue-400 font-semibold">1.34</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Max Drawdown</span>
                      <span className="text-red-400 font-semibold">-7.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Calmar Ratio</span>
                      <span className="text-green-400 font-semibold">2.1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">Strategy Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Breakout</span>
                      <span className="text-green-400">+$892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pullback</span>
                      <span className="text-blue-400">+$567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reversal</span>
                      <span className="text-red-400">-$234</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Monthly P&L</h3>
                <div className="h-32 flex items-end justify-between gap-1">
                  {[420, 680, -230, 890, 1240, 780, 450, 920, 1100, 560, 780, 1340].map((value, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t ${value > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ height: `${Math.abs(value) / 20}px` }}
                      title={`$${value}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'Calendar':
        return (
          <div className="p-4 space-y-4 pb-24">
            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Economic Calendar</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-[#0A0B0D] rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">Non-Farm Payrolls</p>
                        <p className="text-xs text-slate-400">8:30 AM EST</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0A0B0D] rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">Fed Speech</p>
                        <p className="text-xs text-slate-400">2:00 PM EST</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0A0B0D] rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">Retail Sales</p>
                        <p className="text-xs text-slate-400">10:00 AM EST</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Trade Calendar</h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  <div className="text-center text-slate-400 p-2">S</div>
                  <div className="text-center text-slate-400 p-2">M</div>
                  <div className="text-center text-slate-400 p-2">T</div>
                  <div className="text-center text-slate-400 p-2">W</div>
                  <div className="text-center text-slate-400 p-2">T</div>
                  <div className="text-center text-slate-400 p-2">F</div>
                  <div className="text-center text-slate-400 p-2">S</div>
                  {Array.from({ length: 35 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-center p-2 rounded ${
                        Math.random() > 0.7 ? 'bg-green-500/20 text-green-400' : 
                        Math.random() > 0.8 ? 'bg-red-500/20 text-red-400' : 
                        'text-slate-300'
                      }`}
                    >
                      {((i % 31) + 1)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-96 text-slate-400">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{tabName}</h3>
              <p>Content coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="flex items-center justify-between p-4">
          {/* Left: Hamburger menu placeholder */}
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => window.location.href = '/settings'}>
            <div className="space-y-1">
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
            </div>
          </Button>

          {/* Center: Portfolio Selector */}
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger className="w-40 bg-transparent border-none text-white">
              <SelectValue />
              <ChevronDown className="w-4 h-4" />
            </SelectTrigger>
            <SelectContent>
              {portfolioOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Right: Filter and Calendar */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setActiveTab('Analytics')}>
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setActiveTab('Calendar')}>
              <Calendar className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent border-b border-[#1A1B1E] rounded-none h-12 p-0">
            <TabsTrigger value="Dashboard" className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="Time Metrics" className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none">
              Time Metrics
            </TabsTrigger>
            <TabsTrigger value="Analytics" className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="Calendar" className="flex-1 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none">
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Dashboard" className="mt-0">
            {renderDashboard()}
          </TabsContent>
          
          <TabsContent value="Time Metrics" className="mt-0">
            {renderPlaceholderTab('Time Metrics')}
          </TabsContent>
          
          <TabsContent value="Analytics" className="mt-0">
            {renderPlaceholderTab('Analytics')}
          </TabsContent>
          
          <TabsContent value="Calendar" className="mt-0">
            {renderPlaceholderTab('Calendar')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
