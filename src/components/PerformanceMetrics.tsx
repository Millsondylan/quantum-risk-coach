import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, Activity, Zap } from 'lucide-react';

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

interface PerformanceMetricsProps {
  data: AnalyticsData;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  const getMetricColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-400' : 'text-red-400';
  };

  const getMetricIcon = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-sm">Win Rate</span>
              </div>
              {getMetricIcon(data.basic.winRate, 50)}
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(data.basic.winRate, 50)}`}>
              {data.basic.winRate.toFixed(1)}%
            </p>
            <Progress 
              value={data.basic.winRate} 
              className="mt-2 h-2"
              style={{
                '--progress-background': '#1f2937',
                '--progress-foreground': data.basic.winRate > 50 ? '#10b981' : '#ef4444'
              } as React.CSSProperties}
            />
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-slate-400 text-sm">Profit Factor</span>
              </div>
              {getMetricIcon(data.basic.profitFactor, 1.5)}
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(data.basic.profitFactor, 1.5)}`}>
              {data.basic.profitFactor}
            </p>
            <div className="mt-2 text-xs text-slate-500">
              {data.basic.profitFactor > 2 ? 'Excellent' : 
               data.basic.profitFactor > 1.5 ? 'Good' : 
               data.basic.profitFactor > 1 ? 'Acceptable' : 'Poor'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400 text-sm">Sharpe Ratio</span>
              </div>
              {getMetricIcon(data.advanced.sharpeRatio, 1)}
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(data.advanced.sharpeRatio, 1)}`}>
              {data.advanced.sharpeRatio}
            </p>
            <div className="mt-2 text-xs text-slate-500">
              {data.advanced.sharpeRatio > 2 ? 'Exceptional' : 
               data.advanced.sharpeRatio > 1 ? 'Good' : 
               data.advanced.sharpeRatio > 0.5 ? 'Acceptable' : 'Poor'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-slate-400 text-sm">Max Drawdown</span>
              </div>
              {getMetricIcon(data.advanced.maxDrawdown, 10, true)}
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(data.advanced.maxDrawdown, 10, true)}`}>
              ${Math.abs(data.advanced.maxDrawdown).toFixed(0)}
            </p>
            <div className="mt-2 text-xs text-slate-500">
              {Math.abs(data.advanced.maxDrawdown) < 5 ? 'Excellent' : 
               Math.abs(data.advanced.maxDrawdown) < 10 ? 'Good' : 
               Math.abs(data.advanced.maxDrawdown) < 20 ? 'Acceptable' : 'High Risk'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-4">
        <h3 className="text-white font-medium">Detailed Analysis</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-[#1A1B1E]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white text-sm">Average Holding Time</p>
                <p className="text-slate-400 text-xs">Time between entry and exit</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">
                {data.basic.avgHoldingTime}d {data.timeAnalysis.avgHoldingTimeHours}h {data.timeAnalysis.avgHoldingTimeMinutes}m
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#1A1B1E]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white text-sm">Expected Value</p>
                <p className="text-slate-400 text-xs">Average profit per trade</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${data.advanced.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${data.advanced.expectedValue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#1A1B1E]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white text-sm">Volatility</p>
                <p className="text-slate-400 text-xs">Standard deviation of returns</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">
                ${data.advanced.volatility.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#1A1B1E]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white text-sm">Best Trading Hour</p>
                <p className="text-slate-400 text-xs">Hour with highest win rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">
                {data.behavioral.bestHour}:00 ({data.behavioral.bestHourWinRate.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <h4 className="text-white font-medium mb-3">Performance Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Total Trades</span>
              <span className="text-white font-medium">{data.basic.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Open Positions</span>
              <span className="text-white font-medium">{data.basic.openTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Total P&L</span>
              <span className={`font-medium ${data.basic.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${data.basic.totalPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Average Return</span>
              <span className={`font-medium ${data.advanced.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${data.advanced.avgReturn.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics; 