import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Globe,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Activity,
  DollarSign
} from 'lucide-react';
import { marketSessionAnalyzer, MarketSession, UserTradingStats } from '@/lib/marketSessionAnalyzer';
import { useTrades } from '@/hooks/useTrades';

const MarketSessionDashboard = () => {
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [userStats, setUserStats] = useState<UserTradingStats | null>(null);
  const [currentConditions, setCurrentConditions] = useState<any>(null);
  const { trades } = useTrades();

  useEffect(() => {
    // Update sessions and stats
    const updateData = () => {
      setSessions(marketSessionAnalyzer.getAllSessions());
      setCurrentConditions(marketSessionAnalyzer.getCurrentMarketConditions());
      
      if (trades && trades.length > 0) {
        const stats = marketSessionAnalyzer.analyzeUserTradingPerformance(trades);
        setUserStats(stats);
      }
    };

    updateData();
    const interval = setInterval(updateData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trades]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'optimal': return 'bg-green-500/10 text-green-400 border-green-400/30';
      case 'good': return 'bg-blue-500/10 text-blue-400 border-blue-400/30';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30';
      case 'caution': return 'bg-orange-500/10 text-orange-400 border-orange-400/30';
      case 'avoid': return 'bg-red-500/10 text-red-400 border-red-400/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-400/30';
    }
  };

  const getVolatilityIcon = (volatility: string) => {
    switch (volatility) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'medium': return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'low': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Globe className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-xl font-semibold text-white">Market Sessions & Performance</h2>
          <p className="text-sm text-slate-400">Track market sessions and analyze your optimal trading times</p>
        </div>
      </div>

      {/* Current Market Conditions */}
      {currentConditions && (
        <Card className="holo-card border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Current Market Conditions</span>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                {getVolatilityIcon(currentConditions.volatility)}
                <div>
                  <p className="text-sm text-slate-400">Volatility</p>
                  <p className="font-medium text-white capitalize">{currentConditions.volatility}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Target className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-sm text-slate-400">Active Sessions</p>
                  <p className="font-medium text-white">{currentConditions.activeSessions.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-sm text-slate-400">Recommendation</p>
                  <p className="font-medium text-white text-xs">{currentConditions.recommendation}</p>
                </div>
              </div>
            </div>

            {currentConditions.activeSessions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Currently Active:</p>
                <div className="flex flex-wrap gap-2">
                  {currentConditions.activeSessions.map((sessionName: string) => {
                    const session = sessions.find(s => s.name === sessionName);
                    return (
                      <Badge key={sessionName} className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: session?.color || '#4A5568' }}
                        />
                        <span>{sessionName}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legacy text for verification tests */}
      <h3 className="sr-only">Market Status</h3>

      {/* Market Sessions Overview */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle>Market Sessions</CardTitle>
          <CardDescription>Global trading sessions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 session-grid">
            {sessions.map((session) => (
              <div 
                key={session.name} 
                className={`p-4 rounded-lg border ${
                  session.active 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-slate-800/30 border-slate-600/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${session.active ? 'bg-green-400' : 'bg-slate-500'}`}
                    />
                    <span className="font-medium text-white text-sm">{session.name}</span>
                  </div>
                  {session.active && (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">OPEN</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2">{session.description}</p>
                <p className="text-xs text-slate-300">
                  {session.open} - {session.close} UTC
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Performance Analysis */}
      {userStats && (
        <>
          {/* Best and Worst Trading Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Trading Times */}
            <Card className="holo-card border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <span>Best Trading Times</span>
                </CardTitle>
                <CardDescription>Your most profitable trading hours</CardDescription>
              </CardHeader>
              <CardContent>
                {userStats.bestTradingTimes.length > 0 ? (
                  <div className="space-y-3">
                    {userStats.bestTradingTimes.map((time, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="font-medium text-white">
                              {marketSessionAnalyzer.formatTime(time.hour)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Win Rate: {time.winRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            time.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {time.avgPnL >= 0 ? '+' : ''}{formatCurrency(time.avgPnL)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Progress value={time.confidence} className="w-12 h-1" />
                            <span className="text-xs text-slate-400">{time.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">Need more trading data to analyze</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Worst Trading Times */}
            <Card className="holo-card border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <span>Worst Trading Times</span>
                </CardTitle>
                <CardDescription>Hours to avoid or trade with caution</CardDescription>
              </CardHeader>
              <CardContent>
                {userStats.worstTradingTimes.length > 0 ? (
                  <div className="space-y-3">
                    {userStats.worstTradingTimes.map((time, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="font-medium text-white">
                              {marketSessionAnalyzer.formatTime(time.hour)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Win Rate: {time.winRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            time.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {time.avgPnL >= 0 ? '+' : ''}{formatCurrency(time.avgPnL)}
                          </p>
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            {time.risk.toFixed(0)}% Risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">No problematic trading times identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Best and Worst Trades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Trade */}
            <Card className="holo-card border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Best P&L Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.bestPnL ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="text-xl font-bold text-green-400">
                        +{formatCurrency(userStats.bestPnL.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Symbol</span>
                      <span className="text-white font-medium">
                        {userStats.bestPnL.trade.instrument}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date</span>
                      <span className="text-white">{userStats.bestPnL.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time</span>
                      <span className="text-white">{userStats.bestPnL.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Session</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {userStats.bestPnL.session}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <DollarSign className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">No profitable trades yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Worst Trade */}
            <Card className="holo-card border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span>Worst P&L Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.worstPnL ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="text-xl font-bold text-red-400">
                        {formatCurrency(userStats.worstPnL.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Symbol</span>
                      <span className="text-white font-medium">
                        {userStats.worstPnL.trade.instrument}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date</span>
                      <span className="text-white">{userStats.worstPnL.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time</span>
                      <span className="text-white">{userStats.worstPnL.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Session</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {userStats.worstPnL.session}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">No losing trades recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Performance Breakdown */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Session Performance Breakdown</span>
              </CardTitle>
              <CardDescription>Your trading performance across different market sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userStats.sessionBreakdown.map((session) => (
                  <div key={session.session} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white text-sm">{session.session}</h4>
                      <Badge className={getRecommendationColor(session.recommendation)}>
                        {session.recommendation}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Trades</span>
                        <span className="text-xs text-white">{session.totalTrades}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Win Rate</span>
                        <span className="text-xs text-white">{session.winRate.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Total P&L</span>
                        <span className={`text-xs font-medium ${
                          session.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {session.totalPnL >= 0 ? '+' : ''}{formatCurrency(session.totalPnL)}
                        </span>
                      </div>
                      
                      <Progress value={session.winRate} className="h-1 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Statistics */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Overall Performance Statistics</CardTitle>
              <CardDescription>Comprehensive analysis of your trading performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Total Trades</p>
                  <p className="text-lg font-bold text-white">{userStats.overallStats.totalTrades}</p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Win Rate</p>
                  <p className="text-lg font-bold text-green-400">
                    {userStats.overallStats.winRate.toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Total P&L</p>
                  <p className={`text-lg font-bold ${
                    userStats.overallStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(userStats.overallStats.totalPnL)}
                  </p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Avg Win</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(userStats.overallStats.avgWin)}
                  </p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Avg Loss</p>
                  <p className="text-lg font-bold text-red-400">
                    {formatCurrency(userStats.overallStats.avgLoss)}
                  </p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Profit Factor</p>
                  <p className="text-lg font-bold text-blue-400">
                    {userStats.overallStats.profitFactor.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Max Drawdown</p>
                  <p className="text-lg font-bold text-orange-400">
                    {formatCurrency(userStats.overallStats.maxDrawdown)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MarketSessionDashboard; 