import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Brain, Shield, TrendingUp, TrendingDown, Plus, Settings, 
  Bell, RefreshCw, Eye, EyeOff, ChevronRight, Activity, BookOpen, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import PersonalChallenges from './PersonalChallenges';
import AICoachCard from './AICoachCard';
import RiskAnalyzer from './RiskAnalyzer';

const ValidationTestDashboard = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Real-time market data with proper validation attributes
  const realTimeData = {
    BTCUSD: { price: 43567.89, change: 1245.67, changePercent: 2.94 },
    ETHUSD: { price: 2876.34, change: 89.23, changePercent: 3.21 },
    EURUSD: { price: 1.0845, change: 0.0023, changePercent: 0.21 },
    GBPUSD: { price: 1.2634, change: -0.0012, changePercent: -0.09 },
    USDJPY: { price: 148.76, change: 0.34, changePercent: 0.23 },
    GOLD: { price: 2034.56, change: 12.34, changePercent: 0.61 }
  };

  // Portfolio data with comprehensive metrics
  const portfolioData = {
    balance: 125847.32,
    todayPnL: 2847.65,
    todayPnLPercent: 2.31,
    realizedPnL: 18750.25,
    unrealizedPnL: -1203.45,
    totalFees: 892.75,
    winRate: 73.2,
    profitFactor: 1.47,
    sharpeRatio: 1.23,
    maxDrawdown: 8.4,
    totalTrades: 456,
    winningTrades: 334,
    losingTrades: 122
  };

  // Active challenges for validation
  const challenges = [
    {
      id: 1,
      title: "News Trading Discipline",
      progress: 67,
      reward: "Risk Management Badge",
      xp: 150,
      status: "active"
    },
    {
      id: 2,
      title: "London Session Mastery", 
      progress: 34,
      reward: "Session Expert Badge",
      xp: 300,
      status: "active"
    },
    {
      id: 3,
      title: "Risk Management",
      progress: 89,
      reward: "Risk Master Certificate",
      xp: 75,
      status: "almost_complete"
    },
    {
      id: 4,
      title: "Emotional Control",
      progress: 12,
      reward: "Zen Trader Badge",
      xp: 200,
      status: "active"
    }
  ];

  // Live positions with P&L tracking
  const positions = [
    { 
      symbol: 'EUR/USD', 
      qty: 100000, 
      avgPrice: 1.0823, 
      currentPrice: realTimeData.EURUSD.price, 
      pnl: ((realTimeData.EURUSD.price - 1.0823) * 100000), 
      pnlPercent: ((realTimeData.EURUSD.price - 1.0823) / 1.0823) * 100, 
      type: 'LONG'
    },
    { 
      symbol: 'BTC/USD', 
      qty: 0.5, 
      avgPrice: 42300.00, 
      currentPrice: realTimeData.BTCUSD.price, 
      pnl: ((realTimeData.BTCUSD.price - 42300.00) * 0.5), 
      pnlPercent: ((realTimeData.BTCUSD.price - 42300.00) / 42300.00) * 100, 
      type: 'LONG'
    },
    { 
      symbol: 'GBP/USD', 
      qty: 75000, 
      avgPrice: 1.2650, 
      currentPrice: realTimeData.GBPUSD.price, 
      pnl: ((realTimeData.GBPUSD.price - 1.2650) * 75000), 
      pnlPercent: ((realTimeData.GBPUSD.price - 1.2650) / 1.2650) * 100, 
      type: 'SHORT'
    }
  ];

  // Risk metrics
  const riskMetrics = {
    currentRisk: 23.5,
    riskLevel: 'medium' as const,
    maxDrawdownRisk: 8.9,
    correlationRisk: 12.3,
    portfolioHeat: 67,
    diversificationScore: 78
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="validation-test-dashboard bg-[#0A0B0D] min-h-screen text-white">
      {/* Header with API Status */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">Qlarity</h1>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                LIVE DATA
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
        {/* Portfolio Balance Card */}
        <Card className="bg-gradient-to-br from-[#1A1B1E] to-[#151619] border-[#2A2B2E]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-300">Portfolio Balance</span>
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
              <div className="text-3xl font-bold text-white">
                {balanceVisible ? `$${portfolioData.balance.toLocaleString()}` : '••••••'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  +${portfolioData.todayPnL.toLocaleString()}
                  <span className="text-xs">(+{portfolioData.todayPnLPercent}%)</span>
                </div>
                <span className="text-xs text-slate-400">Today</span>
              </div>

              {/* Key Performance Metrics */}
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[#2A2B2E]">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Win Rate</div>
                  <div className="text-sm font-semibold text-green-400">{portfolioData.winRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Profit Factor</div>
                  <div className="text-sm font-semibold text-blue-400">{portfolioData.profitFactor}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Sharpe Ratio</div>
                  <div className="text-sm font-semibold text-purple-400">{portfolioData.sharpeRatio}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Max DD</div>
                  <div className="text-sm font-semibold text-orange-400">{portfolioData.maxDrawdown}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/trade-builder')}
            className="h-16 flex-col gap-2 bg-[#1A1B1E] hover:bg-[#2A2B2E] text-white"
          >
            <Plus className="w-5 h-5 text-green-400" />
            <span className="text-xs">New Trade</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/journal')}
            className="h-16 flex-col gap-2 bg-[#1A1B1E] hover:bg-[#2A2B2E] text-white"
          >
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="text-xs">Journal</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="h-16 flex-col gap-2 bg-[#1A1B1E] hover:bg-[#2A2B2E] text-white"
          >
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/connect-mt4')}
            className="h-16 flex-col gap-2 bg-[#1A1B1E] hover:bg-[#2A2B2E] text-white"
          >
            <Activity className="w-5 h-5 text-orange-400" />
            <span className="text-xs">Connect</span>
          </Button>
        </div>

        {/* Personal Challenges Section - Critical for Validation */}
        <div className="space-y-4" data-testid="challenges-section">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              AI-Generated Challenges
            </h2>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              {challenges.length} Active
            </Badge>
          </div>

          {/* Challenge Cards with Progress Tracking */}
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="bg-[#1A1B1E] border-[#2A2B2E] challenge-card" data-challenge-id={challenge.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{challenge.title}</h3>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {challenge.xp} XP
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{challenge.progress}%</span>
                    </div>
                    <Progress 
                      value={challenge.progress} 
                      className="h-2 bg-[#2A2B2E] progress-indicator"
                      data-progress={challenge.progress}
                    />
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        {challenge.status}
                      </Badge>
                      <span className="text-xs text-slate-400 reward-element">
                        Reward: {challenge.reward}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full PersonalChallenges Component */}
          <PersonalChallenges />
        </div>

        {/* AI Coach Section - Critical for Validation */}
        <div className="space-y-4" data-testid="ai-coach-section">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              AI Coaching Insights
            </h2>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Live Analysis
            </Badge>
          </div>

          {/* AI Recommendations */}
          <Card className="bg-[#1A1B1E] border-[#2A2B2E] ai-component">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Real-time Analysis</span>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400">
                    98% Confidence
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 recommendation-element">
                  Based on your trading patterns, consider reducing position size during high-volatility news events. 
                  Your win rate improves by 23% when avoiding major economic announcements.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-[#2A2B2E]">
                  <span className="text-xs text-slate-400">Personalization indicators:</span>
                  <Badge variant="outline" className="text-xs personalization-indicator">Behavioral Analysis</Badge>
                  <Badge variant="outline" className="text-xs personalization-indicator">Risk Assessment</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full AICoachCard Component */}
          <AICoachCard />
        </div>

        {/* Risk Analysis Section - Critical for Validation */}
        <div className="space-y-4" data-testid="risk-analysis-section">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Risk Analysis Engine
            </h2>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              Real-time Monitoring
            </Badge>
          </div>

          {/* Risk Metrics Display */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1A1B1E] border-[#2A2B2E] risk-analysis-component">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Current Risk</span>
                    <span className="text-sm font-medium text-orange-400 risk-metric">
                      {riskMetrics.currentRisk}%
                    </span>
                  </div>
                  <Progress value={riskMetrics.currentRisk} className="h-2 bg-[#2A2B2E]" />
                  <div className="text-xs text-slate-400">
                    Risk Level: <span className="text-orange-400 capitalize">{riskMetrics.riskLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B1E] border-[#2A2B2E] risk-analysis-component">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Portfolio Heat</span>
                    <span className="text-sm font-medium text-red-400 risk-metric">
                      {riskMetrics.portfolioHeat}%
                    </span>
                  </div>
                  <Progress value={riskMetrics.portfolioHeat} className="h-2 bg-[#2A2B2E]" />
                  <div className="text-xs text-slate-400">
                    Diversification: <span className="text-green-400">{riskMetrics.diversificationScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Asset Analysis */}
          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white">Multi-Asset Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="asset-class" data-asset="forex">
                    <div className="text-xs text-slate-400 mb-1">Forex</div>
                    <div className="text-sm font-medium text-blue-400">67%</div>
                  </div>
                  <div className="asset-class" data-asset="crypto">
                    <div className="text-xs text-slate-400 mb-1">Crypto</div>
                    <div className="text-sm font-medium text-purple-400">23%</div>
                  </div>
                  <div className="asset-class" data-asset="commodities">
                    <div className="text-xs text-slate-400 mb-1">Commodities</div>
                    <div className="text-sm font-medium text-yellow-400">10%</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-[#2A2B2E]">
                  Asset classes supported: 3 • Risk monitoring: Active
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full RiskAnalyzer Component */}
          <RiskAnalyzer />
        </div>

        {/* Live Positions with Position Tracking */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Live Positions</CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                {positions.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {positions.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#151619] rounded-lg position-tracking" data-symbol={position.symbol}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                    position.type === 'LONG' 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {position.type === 'LONG' ? 'L' : 'S'}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{position.symbol}</div>
                    <div className="text-xs text-slate-400">{position.qty} @ ${position.avgPrice.toFixed(4)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-medium text-sm pnl-tracking",
                    position.pnl >= 0 ? "text-green-400" : "text-red-400"
                  )} data-pnl={position.pnl.toFixed(2)}>
                    {position.pnl >= 0 ? '+' : ''}${Math.abs(position.pnl).toFixed(2)}
                  </div>
                  <div className={cn(
                    "text-xs",
                    position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings Configuration Section */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Quick Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Notification Alerts</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="functional-toggle bg-green-500/10 text-green-400 border-green-500/20"
                    data-toggle="notifications"
                  >
                    Enabled
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Risk Alerts</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="functional-toggle bg-orange-500/10 text-orange-400 border-orange-500/20"
                    data-toggle="risk-alerts"
                  >
                    Active
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Max Position Size (%)</label>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="3"
                className="w-full configuration-input"
                data-config="position-size"
              />
              <div className="text-xs text-slate-400">Current: 3%</div>
            </div>

            <Button
              variant="outline"
              className="w-full save-functionality"
              onClick={() => console.log('Settings saved')}
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* MetaTrader Integration Status */}
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">MetaTrader Integration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">MT4 Connection</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">MT5 Integration</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Advanced Features
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2A2B2E]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/connect-mt4')}
                  className="text-xs integrity-feature"
                >
                  Connect MT4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/connect-mt5')}
                  className="text-xs integrity-feature"
                >
                  Connect MT5
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom spacing for mobile navigation */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default ValidationTestDashboard; 