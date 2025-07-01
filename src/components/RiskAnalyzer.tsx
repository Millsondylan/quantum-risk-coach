
import React from 'react';
import { Shield, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

const RiskAnalyzer = () => {
  const riskMetrics = [
    {
      label: 'Daily Drawdown',
      value: '8.5%',
      limit: '15%',
      status: 'safe',
      progress: 57,
    },
    {
      label: 'Position Size',
      value: '12%',
      limit: '20%',
      status: 'caution',
      progress: 60,
    },
    {
      label: 'Correlation Risk',
      value: 'Medium',
      status: 'warning',
      description: '3 correlated EUR pairs active',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-500/20';
      case 'caution': return 'text-yellow-400 bg-yellow-500/20';
      case 'warning': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Risk Analyzer</h2>
      </div>

      <div className="space-y-6">
        {riskMetrics.map((metric, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{metric.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
            </div>
            
            {metric.progress && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{metric.value}</span>
                  <span className="text-slate-400">/ {metric.limit}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.status === 'safe' ? 'bg-green-500' :
                      metric.status === 'caution' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${metric.progress}%` }}
                  ></div>
                </div>
              </>
            )}
            
            {metric.description && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-300">{metric.description}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
        <div className="flex items-center space-x-3">
          <TrendingDown className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium text-white">Risk Recommendation</p>
            <p className="text-xs text-slate-300">Consider closing 1-2 EUR positions to reduce correlation exposure</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Overall Risk Score</p>
              <p className="text-xs text-slate-300">Moderate • Manageable exposure</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400">6.2/10</div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalyzer;
