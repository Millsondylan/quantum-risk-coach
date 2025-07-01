
import React from 'react';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

const QuickStats = () => {
  // In a real implementation, this would come from your trading API/database
  const stats = [
    {
      label: 'Total P&L',
      value: '--',
      change: '--',
      trend: 'neutral',
      icon: TrendingUp,
    },
    {
      label: 'Win Rate',
      value: '--',
      change: '--',
      trend: 'neutral',
      icon: Target,
    },
    {
      label: 'Avg. Trade',
      value: '--',
      change: '--',
      trend: 'neutral',
      icon: TrendingDown,
    },
    {
      label: 'Active Time',
      value: '--',
      change: 'No data',
      trend: 'neutral',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="holo-card p-6 hover:holo-glow transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-slate-500/20 text-slate-400">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-400 mb-1 group-hover:gradient-text transition-all duration-300">
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
