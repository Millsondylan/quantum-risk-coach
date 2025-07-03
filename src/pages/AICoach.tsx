import React from 'react';
import AICoachCard from '@/components/AICoachCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, Shield, Target, Activity, BarChart3, Award } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';

const AICoach = () => {
  const { user } = useUser();
  const { getTradeStats } = useTrades();
  const stats = getTradeStats();

  const coachingMetrics = [
    {
      title: 'Trading Performance',
      value: `${stats.winRate.toFixed(1)}%`,
      label: 'Win Rate',
      icon: <TrendingUp className="w-5 h-5" />,
      color: stats.winRate >= 60 ? 'text-green-400' : stats.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Risk Management',
      value: `${stats.maxDrawdown.toFixed(1)}%`,
      label: 'Max Drawdown',
      icon: <Shield className="w-5 h-5" />,
      color: stats.maxDrawdown <= 10 ? 'text-green-400' : stats.maxDrawdown <= 20 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Profit Factor',
      value: stats.profitFactor.toFixed(2),
      label: 'Risk/Reward',
      icon: <Target className="w-5 h-5" />,
      color: stats.profitFactor >= 1.5 ? 'text-green-400' : stats.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      label: 'Experience',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-400'
    }
  ];

  const coachingAreas = [
    {
      title: 'Strengths',
      items: [
        stats.winRate >= 60 && 'High win rate',
        stats.profitFactor >= 1.5 && 'Excellent risk/reward ratio',
        stats.maxDrawdown <= 10 && 'Good risk management',
        stats.totalTrades >= 20 && 'Active trading experience'
      ].filter(Boolean),
      icon: <Award className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      title: 'Areas for Improvement',
      items: [
        stats.winRate < 50 && 'Improve trade selection',
        stats.profitFactor < 1 && 'Work on risk/reward ratio',
        stats.maxDrawdown > 20 && 'Reduce position sizes',
        stats.totalTrades < 10 && 'Need more trading experience'
      ].filter(Boolean),
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI Trading Coach
          </h1>
          <p className="text-slate-400 mt-2">
            Personalized insights and recommendations based on your trading performance
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
          <Sparkles className="w-4 h-4 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coachingMetrics.map((metric, index) => (
          <Card key={index} className="holo-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{metric.title}</span>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-slate-500">{metric.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coaching Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coachingAreas.map((area, index) => (
          <Card key={index} className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={area.color}>
                  {area.icon}
                </div>
                <span>{area.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {area.items.length > 0 ? (
                <ul className="space-y-2">
                  {area.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${area.color} mt-1.5`} />
                      <span className="text-sm text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No specific areas identified yet. Keep trading to get personalized insights.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main AI Coach Card */}
      <div className="lg:col-span-2">
        <AICoachCard />
      </div>

      {/* Trading Tips */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Quick Trading Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-white mb-2">Risk Management</h4>
              <p className="text-sm text-slate-300">
                Never risk more than 1-2% of your account on a single trade. This ensures long-term survival.
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <h4 className="font-medium text-white mb-2">Trade Planning</h4>
              <p className="text-sm text-slate-300">
                Always define your entry, stop loss, and take profit before entering a trade.
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="font-medium text-white mb-2">Psychology</h4>
              <p className="text-sm text-slate-300">
                Stick to your trading plan. Emotional decisions lead to poor results.
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-white mb-2">Continuous Learning</h4>
              <p className="text-sm text-slate-300">
                Review your trades regularly to identify patterns and improve your strategy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICoach; 