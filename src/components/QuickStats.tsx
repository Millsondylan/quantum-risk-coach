
import React from 'react';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

const QuickStats = () => {
  const stats = [
    {
      label: 'Total P&L',
      value: '+$3,247.80',
      change: '+12.4%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Win Rate',
      value: '68.5%',
      change: '+2.1%',
      trend: 'up',
      icon: Target,
    },
    {
      label: 'Avg. Trade',
      value: '$127.30',
      change: '-$4.20',
      trend: 'down',
      icon: TrendingDown,
    },
    {
      label: 'Active Time',
      value: '4h 23m',
      change: 'Today',
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
              <div className={`p-2 rounded-lg ${
                stat.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                stat.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                stat.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:gradient-text transition-all duration-300">
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
