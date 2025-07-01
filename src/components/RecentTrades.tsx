
import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, Clock, DollarSign } from 'lucide-react';

const RecentTrades = () => {
  const trades = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'Long',
      size: '0.1',
      entry: '1.0847',
      exit: '1.0879',
      pnl: 127.50,
      duration: '2h 15m',
      status: 'closed',
      strategy: 'Breakout',
      time: '10:30 AM',
    },
    {
      id: 2,
      pair: 'GBP/JPY',
      type: 'Short',
      size: '0.05',
      entry: '189.45',
      exit: '189.12',
      pnl: -45.20,
      duration: '45m',
      status: 'closed',
      strategy: 'Mean Reversion',
      time: '9:15 AM',
    },
    {
      id: 3,
      pair: 'USD/CAD',
      type: 'Long',
      size: '0.08',
      entry: '1.3521',
      current: '1.3534',
      pnl: 89.30,
      duration: '1h 30m',
      status: 'open',
      strategy: 'News Trading',
      time: '8:45 AM',
    },
    {
      id: 4,
      pair: 'AUD/USD',
      type: 'Short',
      size: '0.12',
      entry: '0.6789',
      current: '0.6785',
      pnl: 23.40,
      duration: '25m',
      status: 'open',
      strategy: 'Scalping',
      time: '11:05 AM',
    },
  ];

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
        </div>
        <div className="text-sm text-slate-400">
          4 trades today • <span className="text-green-400">+$195.00</span> net
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600/30">
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Pair</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Type</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Size</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Entry</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Current/Exit</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">P&L</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Duration</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Strategy</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors group"
              >
                <td className="py-4 px-2">
                  <div className="font-semibold text-white">{trade.pair}</div>
                  <div className="text-xs text-slate-400">{trade.time}</div>
                </td>
                <td className="py-4 px-2">
                  <div className={`flex items-center space-x-1 ${
                    trade.type === 'Long' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.type === 'Long' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{trade.type}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-sm text-slate-300">{trade.size}</td>
                <td className="py-4 px-2 text-sm text-slate-300 font-mono">{trade.entry}</td>
                <td className="py-4 px-2 text-sm text-slate-300 font-mono">
                  {trade.exit || trade.current}
                </td>
                <td className="py-4 px-2">
                  <div className={`font-semibold ${
                    trade.pnl > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-1 text-slate-300">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm">{trade.duration}</span>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                    {trade.strategy}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trade.status === 'open' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTrades;
