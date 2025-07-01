import React from 'react';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';

const QuickStats = () => {
  const { getPerformanceMetrics, loading } = useTrades();
  const metrics = getPerformanceMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const stats = [
    {
      label: 'Total P&L',
      value: formatCurrency(metrics.totalProfit),
      change: metrics.totalProfit >= 0 ? '+Profit' : 'Loss',
      trend: metrics.totalProfit >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: getTrendColor(metrics.totalProfit),
    },
    {
      label: 'Win Rate',
      value: formatPercentage(metrics.winRate),
      change: `${metrics.winningTrades}/${metrics.totalTrades}`,
      trend: metrics.winRate >= 50 ? 'up' : 'down',
      icon: Target,
      color: metrics.winRate >= 50 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Avg. Trade',
      value: formatCurrency(metrics.averageProfit),
      change: metrics.averageProfit >= 0 ? 'Profitable' : 'Losing',
      trend: metrics.averageProfit >= 0 ? 'up' : 'down',
      icon: TrendingDown,
      color: getTrendColor(metrics.averageProfit),
    },
    {
      label: 'Total Trades',
      value: metrics.totalTrades.toString(),
      change: `${metrics.winningTrades}W / ${metrics.losingTrades}L`,
      trend: 'neutral',
      icon: Clock,
      color: 'text-slate-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="holo-card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-slate-500/20 w-9 h-9"></div>
              <div className="w-16 h-6 bg-slate-500/20 rounded-full"></div>
            </div>
            <div>
              <div className="h-8 bg-slate-500/20 rounded mb-2"></div>
              <div className="h-4 bg-slate-500/20 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="holo-card p-6 hover:holo-glow transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-slate-500/20 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm px-2 py-1 rounded-full bg-slate-500/20 ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-1 group-hover:gradient-text transition-all duration-300 ${stat.color}`}>
                {stat.value}
              </h3>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
