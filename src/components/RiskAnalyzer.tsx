
import React from 'react';
import { Shield, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

const RiskAnalyzer = () => {
  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Risk Analyzer</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Daily Drawdown</span>
            <span className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-400">
              NO DATA
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">--</span>
            <span className="text-slate-400">/ --</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div className="h-2 rounded-full bg-slate-600/50" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Position Size</span>
            <span className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-400">
              NO DATA
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">--</span>
            <span className="text-slate-400">/ --</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div className="h-2 rounded-full bg-slate-600/50" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Correlation Risk</span>
            <span className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-400">
              NO DATA
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">No active positions to analyze</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Risk Analysis</p>
              <p className="text-xs text-slate-300">Connect trading account for real-time risk monitoring</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-400">--</div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalyzer;
