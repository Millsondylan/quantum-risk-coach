
import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';

const RecentTrades = () => {
  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
        </div>
        <div className="text-sm text-slate-400">
          No trades today • Connect MT4/5 for live data
        </div>
      </div>

      <div className="p-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-16 h-16 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Trading Data Available</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Connect your MetaTrader 4 or 5 account to automatically sync your trades and view real-time performance data.
        </p>
        <button className="holo-button px-6 py-3 rounded-lg text-white font-medium">
          Connect MT4/5 Account
        </button>
      </div>
    </div>
  );
};

export default RecentTrades;
