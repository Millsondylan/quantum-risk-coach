import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  entryDate: string;
  exitDate?: string;
  profitLoss?: number;
  status: 'open' | 'closed';
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
}

interface AnalyticsData {
  basic: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    profitFactor: number;
    avgHoldingTime: number;
    openTrades: number;
  };
  advanced: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    avgReturn: number;
    expectedValue: number;
  };
  behavioral: {
    bestHour: number;
    bestHourWinRate: number;
    worstHour: number;
    worstHourWinRate: number;
    tradesByHour: any;
    tradesByDay: any;
  };
  timeAnalysis: {
    avgHoldingTimeHours: number;
    avgHoldingTimeMinutes: number;
  };
}

interface BehavioralPatternsProps {
  trades: Trade[];
  analyticsData: AnalyticsData;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  data: any;
}

const BehavioralPatterns: React.FC<BehavioralPatternsProps> = ({ trades, analyticsData }) => {
  const patterns = useMemo(() => {
    const patterns: Pattern[] = [];
    const closedTrades = trades.filter(t => t.status === 'closed');

    if (closedTrades.length === 0) {
      return patterns;
    }

    // Pattern 1: Early Exit Analysis
    const tradesWithTargets = closedTrades.filter(t => t.takeProfit && t.stopLoss);
    if (tradesWithTargets.length > 0) {
      const earlyExits = tradesWithTargets.filter(trade => {
        const entryPrice = trade.price;
        const targetPrice = trade.takeProfit!;
        const actualExit = trade.exitDate ? new Date(trade.exitDate) : null;
        const entryTime = new Date(trade.entryDate);
        
        // Check if trade was closed before reaching target
        if (actualExit && trade.profitLoss && trade.profitLoss > 0) {
          const timeToTarget = Math.abs(targetPrice - entryPrice) / entryPrice * 100;
          const actualGain = trade.profitLoss / (entryPrice * trade.amount) * 100;
          return actualGain < timeToTarget * 0.8; // Exited at less than 80% of target
        }
        return false;
      });

      if (earlyExits.length > 0) {
        const earlyExitRate = (earlyExits.length / tradesWithTargets.length) * 100;
        patterns.push({
          id: 'early-exits',
          name: 'Early Exit Pattern',
          description: `You're exiting ${earlyExitRate.toFixed(1)}% of profitable trades before reaching your targets`,
          type: earlyExitRate > 30 ? 'negative' : 'neutral',
          confidence: Math.min(95, earlyExitRate * 2),
          impact: earlyExitRate > 50 ? 'high' : earlyExitRate > 25 ? 'medium' : 'low',
          recommendation: 'Consider using trailing stops to let winners run longer',
          data: { rate: earlyExitRate, count: earlyExits.length }
        });
      }
    }

    // Pattern 2: Overtrading Analysis
    const tradesByDay = new Map<string, Trade[]>();
    closedTrades.forEach(trade => {
      const date = new Date(trade.entryDate).toDateString();
      if (!tradesByDay.has(date)) {
        tradesByDay.set(date, []);
      }
      tradesByDay.get(date)!.push(trade);
    });

    const avgTradesPerDay = closedTrades.length / tradesByDay.size;
    const highActivityDays = Array.from(tradesByDay.values()).filter(dayTrades => dayTrades.length > avgTradesPerDay * 1.5);
    
    if (highActivityDays.length > 0) {
      const overtradingRate = (highActivityDays.length / tradesByDay.size) * 100;
      patterns.push({
        id: 'overtrading',
        name: 'Overtrading Pattern',
        description: `${overtradingRate.toFixed(1)}% of your trading days show above-average activity`,
        type: overtradingRate > 40 ? 'negative' : 'neutral',
        confidence: Math.min(95, overtradingRate * 2),
        impact: overtradingRate > 60 ? 'high' : overtradingRate > 30 ? 'medium' : 'low',
        recommendation: 'Focus on quality over quantity. Consider reducing position frequency',
        data: { rate: overtradingRate, avgTradesPerDay }
      });
    }

    // Pattern 3: Revenge Trading
    const consecutiveLosses = [];
    let currentStreak = 0;
    
    closedTrades.forEach(trade => {
      if ((trade.profitLoss || 0) < 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          consecutiveLosses.push(currentStreak);
        }
        currentStreak = 0;
      }
    });

    const maxConsecutiveLosses = Math.max(...consecutiveLosses, 0);
    const avgConsecutiveLosses = consecutiveLosses.length > 0 ? 
      consecutiveLosses.reduce((sum, streak) => sum + streak, 0) / consecutiveLosses.length : 0;

    if (maxConsecutiveLosses > 3) {
      patterns.push({
        id: 'revenge-trading',
        name: 'Revenge Trading Risk',
        description: `You've had up to ${maxConsecutiveLosses} consecutive losses, indicating potential revenge trading`,
        type: 'negative',
        confidence: Math.min(95, maxConsecutiveLosses * 15),
        impact: maxConsecutiveLosses > 5 ? 'high' : 'medium',
        recommendation: 'Implement strict loss limits and take breaks after losing streaks',
        data: { maxStreak: maxConsecutiveLosses, avgStreak: avgConsecutiveLosses }
      });
    }

    // Pattern 4: Time-based Performance
    if (analyticsData.behavioral.bestHourWinRate > 60) {
      patterns.push({
        id: 'time-optimization',
        name: 'Time Optimization Opportunity',
        description: `Your win rate at ${analyticsData.behavioral.bestHour}:00 is ${analyticsData.behavioral.bestHourWinRate.toFixed(1)}%`,
        type: 'positive',
        confidence: analyticsData.behavioral.bestHourWinRate,
        impact: analyticsData.behavioral.bestHourWinRate > 70 ? 'high' : 'medium',
        recommendation: `Focus your trading during ${analyticsData.behavioral.bestHour}:00 hours for better results`,
        data: { bestHour: analyticsData.behavioral.bestHour, winRate: analyticsData.behavioral.bestHourWinRate }
      });
    }

    // Pattern 5: Risk Management
    const tradesWithStops = closedTrades.filter(t => t.stopLoss);
    const stopLossEffectiveness = tradesWithStops.length > 0 ? 
      tradesWithStops.filter(t => (t.profitLoss || 0) >= (t.stopLoss! - t.price) * t.amount).length / tradesWithStops.length * 100 : 0;

    if (tradesWithStops.length > 0) {
      patterns.push({
        id: 'risk-management',
        name: 'Risk Management Analysis',
        description: `${stopLossEffectiveness.toFixed(1)}% of your stop losses are effectively limiting losses`,
        type: stopLossEffectiveness > 80 ? 'positive' : stopLossEffectiveness > 60 ? 'neutral' : 'negative',
        confidence: Math.min(95, stopLossEffectiveness),
        impact: stopLossEffectiveness < 50 ? 'high' : 'medium',
        recommendation: stopLossEffectiveness < 60 ? 'Review your stop loss placement strategy' : 'Good risk management practices',
        data: { effectiveness: stopLossEffectiveness, tradesWithStops: tradesWithStops.length }
      });
    }

    // Pattern 6: Win Rate Consistency
    const recentTrades = closedTrades.slice(-10);
    const recentWinRate = recentTrades.length > 0 ? 
      recentTrades.filter(t => (t.profitLoss || 0) > 0).length / recentTrades.length * 100 : 0;
    
    const winRateChange = recentWinRate - analyticsData.basic.winRate;
    
    if (Math.abs(winRateChange) > 10) {
      patterns.push({
        id: 'win-rate-trend',
        name: 'Win Rate Trend',
        description: `Recent win rate (${recentWinRate.toFixed(1)}%) is ${winRateChange > 0 ? 'improving' : 'declining'} compared to overall (${analyticsData.basic.winRate.toFixed(1)}%)`,
        type: winRateChange > 0 ? 'positive' : 'negative',
        confidence: Math.min(95, Math.abs(winRateChange) * 3),
        impact: Math.abs(winRateChange) > 20 ? 'high' : 'medium',
        recommendation: winRateChange > 0 ? 'Keep up the good work!' : 'Review recent trades for patterns',
        data: { recentWinRate, overallWinRate: analyticsData.basic.winRate, change: winRateChange }
      });
    }

    return patterns;
  }, [trades, analyticsData]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'negative':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-white font-medium">Behavioral Pattern Recognition</h3>
            <p className="text-slate-400 text-sm">AI-powered analysis of your trading behavior</p>
          </div>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
          {patterns.length} Patterns Found
        </Badge>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 gap-4">
        {patterns.length === 0 ? (
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">No Patterns Detected</h4>
              <p className="text-slate-400 text-sm">
                Continue trading to build up data for behavioral pattern analysis
              </p>
            </CardContent>
          </Card>
        ) : (
          patterns.map((pattern) => (
            <Card key={pattern.id} className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <h4 className="text-white font-medium">{pattern.name}</h4>
                      <p className="text-slate-400 text-sm">{pattern.description}</p>
                    </div>
                  </div>
                  <Badge className={getImpactColor(pattern.impact)}>
                    {pattern.impact} impact
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Confidence Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Confidence</span>
                      <span>{pattern.confidence.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={pattern.confidence} 
                      className="h-2"
                      style={{
                        '--progress-background': '#1f2937',
                        '--progress-foreground': pattern.type === 'positive' ? '#10b981' : 
                                                pattern.type === 'negative' ? '#ef4444' : '#f59e0b'
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Recommendation */}
                  {pattern.recommendation && (
                    <div className="bg-[#1A1B1E]/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-400 text-sm">{pattern.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* Pattern Data */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(pattern.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="text-white font-medium">
                          {typeof value === 'number' ? value.toFixed(1) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {patterns.length > 0 && (
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pattern Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {patterns.filter(p => p.type === 'positive').length}
                </p>
                <p className="text-slate-400 text-sm">Positive Patterns</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {patterns.filter(p => p.type === 'negative').length}
                </p>
                <p className="text-slate-400 text-sm">Areas for Improvement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {patterns.filter(p => p.impact === 'high').length}
                </p>
                <p className="text-slate-400 text-sm">High Impact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BehavioralPatterns; 