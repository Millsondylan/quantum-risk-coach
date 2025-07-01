
import React from 'react';
import { Brain, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

const AICoachCard = () => {
  const insights = [
    {
      type: 'opportunity',
      icon: Lightbulb,
      title: 'Optimal Entry Detected',
      message: 'EUR/USD showing strong bullish divergence on 4H chart. Consider long position.',
      confidence: 87,
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Risk Alert',
      message: 'You\'re approaching 15% daily drawdown limit. Consider reducing position sizes.',
      confidence: 95,
    },
    {
      type: 'improvement',
      icon: TrendingUp,
      title: 'Pattern Recognition',
      message: 'Your Friday morning trades show 78% win rate. Focus on this timeframe.',
      confidence: 72,
    },
  ];

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Coach</h2>
          <p className="text-sm text-slate-400">Real-time insights & guidance</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group cursor-pointer"
              style={{
                background: insight.type === 'opportunity' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' :
                           insight.type === 'warning' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))' :
                           'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                  insight.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white group-hover:gradient-text transition-all duration-300">
                      {insight.title}
                    </h3>
                    <span className="text-xs text-slate-400">{insight.confidence}%</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          );    
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <div className="text-center">
          <p className="text-sm text-slate-300 mb-2">Today's AI Confidence Score</p>
          <div className="text-2xl font-bold gradient-text">8.7/10</div>
          <p className="text-xs text-slate-400 mt-1">Based on market conditions & your strategy</p>
        </div>
      </div>
    </div>
  );
};

export default AICoachCard;
