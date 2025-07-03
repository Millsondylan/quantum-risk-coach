import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, TrendingDown, Activity, Target, Zap } from 'lucide-react';

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

interface RiskMetricsProps {
  data: AnalyticsData;
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ data }) => {
  const getRiskLevel = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value <= thresholds.low) return 'low';
    if (value <= thresholds.medium) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Shield className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  // Calculate additional risk metrics
  const volatilityRisk = getRiskLevel(data.advanced.volatility, { low: 5, medium: 15, high: 25 });
  const drawdownRisk = getRiskLevel(Math.abs(data.advanced.maxDrawdown), { low: 5, medium: 15, high: 25 });
  const sharpeRisk = getRiskLevel(data.advanced.sharpeRatio, { low: 0.5, medium: 1, high: 2 });
  const winRateRisk = getRiskLevel(data.basic.winRate, { low: 40, medium: 50, high: 60 });

  const overallRiskScore = Math.round(
    (volatilityRisk === 'high' ? 3 : volatilityRisk === 'medium' ? 2 : 1) +
    (drawdownRisk === 'high' ? 3 : drawdownRisk === 'medium' ? 2 : 1) +
    (sharpeRisk === 'low' ? 3 : sharpeRisk === 'medium' ? 2 : 1) +
    (winRateRisk === 'low' ? 3 : winRateRisk === 'medium' ? 2 : 1)
  ) / 4;

  const overallRiskLevel = overallRiskScore <= 1.5 ? 'low' : overallRiskScore <= 2.5 ? 'medium' : 'high';

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Risk Analysis</h3>
        <div className="flex items-center gap-2">
          {getRiskIcon(overallRiskLevel)}
          <Badge className={`${getRiskColor(overallRiskLevel)} border-current`}>
            {overallRiskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </div>

      {/* Risk Score */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Overall Risk Score</span>
              <span className={`font-bold ${getRiskColor(overallRiskLevel)}`}>
                {overallRiskScore.toFixed(1)}/3
              </span>
            </div>
            <Progress 
              value={(overallRiskScore / 3) * 100} 
              className="h-2"
              style={{
                '--progress-background': '#1f2937',
                '--progress-foreground': overallRiskLevel === 'low' ? '#10b981' : 
                                        overallRiskLevel === 'medium' ? '#f59e0b' : '#ef4444'
              } as React.CSSProperties}
            />
            <p className="text-xs text-slate-500">
              {overallRiskLevel === 'low' ? 'Excellent risk management' :
               overallRiskLevel === 'medium' ? 'Moderate risk profile' :
               'High risk - consider risk management improvements'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Risk Metrics */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Volatility Risk</span>
              </div>
              <Badge className={`${getRiskColor(volatilityRisk)} border-current`}>
                {volatilityRisk.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Current Volatility</span>
                <span className="text-white font-medium">${data.advanced.volatility.toFixed(2)}</span>
              </div>
              <div className="text-xs text-slate-500">
                {volatilityRisk === 'low' ? 'Stable returns' :
                 volatilityRisk === 'medium' ? 'Moderate price swings' :
                 'High price volatility - consider position sizing'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm">Drawdown Risk</span>
              </div>
              <Badge className={`${getRiskColor(drawdownRisk)} border-current`}>
                {drawdownRisk.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Max Drawdown</span>
                <span className="text-white font-medium">${Math.abs(data.advanced.maxDrawdown).toFixed(2)}</span>
              </div>
              <div className="text-xs text-slate-500">
                {drawdownRisk === 'low' ? 'Excellent capital preservation' :
                 drawdownRisk === 'medium' ? 'Acceptable risk levels' :
                 'High drawdown risk - review position sizing'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">Sharpe Ratio Risk</span>
              </div>
              <Badge className={`${getRiskColor(sharpeRisk)} border-current`}>
                {sharpeRisk.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Current Sharpe</span>
                <span className="text-white font-medium">{data.advanced.sharpeRatio.toFixed(3)}</span>
              </div>
              <div className="text-xs text-slate-500">
                {sharpeRisk === 'high' ? 'Excellent risk-adjusted returns' :
                 sharpeRisk === 'medium' ? 'Good risk-adjusted performance' :
                 'Low risk-adjusted returns - review strategy'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm">Win Rate Risk</span>
              </div>
              <Badge className={`${getRiskColor(winRateRisk)} border-current`}>
                {winRateRisk.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Current Win Rate</span>
                <span className="text-white font-medium">{data.basic.winRate.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-slate-500">
                {winRateRisk === 'high' ? 'Excellent consistency' :
                 winRateRisk === 'medium' ? 'Good consistency' :
                 'Low consistency - review entry/exit criteria'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Recommendations */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <h4 className="text-white font-medium mb-3">Risk Management Recommendations</h4>
          <div className="space-y-2 text-sm">
            {overallRiskLevel === 'high' && (
              <>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400">Reduce position sizes to limit exposure</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400">Implement stricter stop-loss levels</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400">Consider taking trading breaks during drawdowns</p>
                </div>
              </>
            )}
            {overallRiskLevel === 'medium' && (
              <>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-400">Monitor risk metrics closely</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-400">Consider reducing position frequency</p>
                </div>
              </>
            )}
            {overallRiskLevel === 'low' && (
              <>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-400">Excellent risk management practices</p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-400">Consider gradual position size increases</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMetrics; 