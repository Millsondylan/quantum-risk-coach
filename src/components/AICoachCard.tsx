
import React from 'react';
import { Brain, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

const AICoachCard = () => {
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
        <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-medium text-white">No Active Insights</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Connect your MT4/5 account to receive personalized trading insights and recommendations.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="font-medium text-white">Setup Required</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Enable data synchronization to start receiving AI-powered trading analysis.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <div className="text-center">
          <p className="text-sm text-slate-300 mb-2">AI Coach Status</p>
          <div className="text-2xl font-bold text-slate-400">Waiting for Data</div>
          <p className="text-xs text-slate-400 mt-1">Connect your trading account to activate</p>
        </div>
      </div>
    </div>
  );
};

export default AICoachCard;
