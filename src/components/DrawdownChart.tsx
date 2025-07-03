import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  entryDate: string;
  exitDate?: string;
  profitLoss?: number;
  status: 'open' | 'closed';
}

interface DrawdownChartProps {
  trades: Trade[];
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ trades }) => {
  const drawdownData = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed');
    if (closedTrades.length === 0) return [];

    // Sort trades by entry date
    const sortedTrades = closedTrades.sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );

    let runningTotal = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const data: { date: Date; equity: number; drawdown: number; peak: number }[] = [];

    sortedTrades.forEach(trade => {
      runningTotal += trade.profitLoss || 0;
      
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      
      const currentDrawdown = peak - runningTotal;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }

      data.push({
        date: new Date(trade.entryDate),
        equity: runningTotal,
        drawdown: currentDrawdown,
        peak
      });
    });

    return data;
  }, [trades]);

  const maxDrawdown = useMemo(() => {
    if (drawdownData.length === 0) return 0;
    return Math.max(...drawdownData.map(d => d.drawdown));
  }, [drawdownData]);

  const currentDrawdown = useMemo(() => {
    if (drawdownData.length === 0) return 0;
    return drawdownData[drawdownData.length - 1]?.drawdown || 0;
  }, [drawdownData]);

  const getDrawdownSeverity = (drawdown: number) => {
    if (drawdown === 0) return 'none';
    if (drawdown < 5) return 'low';
    if (drawdown < 15) return 'medium';
    if (drawdown < 25) return 'high';
    return 'critical';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none':
        return 'text-green-400';
      case 'low':
        return 'text-yellow-400';
      case 'medium':
        return 'text-orange-400';
      case 'high':
        return 'text-red-400';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-slate-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'none':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'high':
      case 'critical':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  if (drawdownData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Drawdown Analysis</h3>
          <div className="text-slate-400 text-sm">No data available</div>
        </div>
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-6 text-center">
            <TrendingDown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Add closed trades to see drawdown analysis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create simple bar chart for drawdown visualization
  const chartHeight = 120;
  const maxEquity = Math.max(...drawdownData.map(d => d.equity));
  const minEquity = Math.min(...drawdownData.map(d => d.equity));
  const range = maxEquity - minEquity;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Drawdown Analysis</h3>
        <div className="flex items-center gap-2">
          {getSeverityIcon(getDrawdownSeverity(currentDrawdown))}
          <span className={`text-sm font-medium ${getSeverityColor(getDrawdownSeverity(currentDrawdown))}`}>
            {getDrawdownSeverity(currentDrawdown).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Simple Chart */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Chart Area */}
            <div className="relative" style={{ height: chartHeight }}>
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-1 gap-0">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="border-t border-slate-700/50" />
                ))}
              </div>
              
              {/* Chart bars */}
              <div className="relative h-full flex items-end gap-1">
                {drawdownData.map((point, index) => {
                  const height = range > 0 ? ((point.equity - minEquity) / range) * chartHeight : 0;
                  const isDrawdown = point.drawdown > 0;
                  
                  return (
                    <div
                      key={index}
                      className={`flex-1 min-w-[2px] rounded-sm transition-all duration-200 ${
                        isDrawdown 
                          ? 'bg-red-500/60' 
                          : point.equity >= 0 
                            ? 'bg-green-500/60' 
                            : 'bg-slate-600/60'
                      }`}
                      style={{ height: `${Math.max(2, height)}px` }}
                      title={`${point.date.toLocaleDateString()}: $${point.equity.toFixed(2)} (Drawdown: $${point.drawdown.toFixed(2)})`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Chart Labels */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>${minEquity.toFixed(0)}</span>
              <span>${maxEquity.toFixed(0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drawdown Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Max Drawdown</p>
              <p className={`text-lg font-bold ${getSeverityColor(getDrawdownSeverity(maxDrawdown))}`}>
                ${maxDrawdown.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Current Drawdown</p>
              <p className={`text-lg font-bold ${getSeverityColor(getDrawdownSeverity(currentDrawdown))}`}>
                ${currentDrawdown.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <h4 className="text-white font-medium mb-3">Risk Assessment</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Current Status</span>
              <span className={`font-medium ${getSeverityColor(getDrawdownSeverity(currentDrawdown))}`}>
                {getDrawdownSeverity(currentDrawdown).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Historical Peak</span>
              <span className="text-white font-medium">
                ${Math.max(...drawdownData.map(d => d.equity)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Recovery Needed</span>
              <span className="text-white font-medium">
                ${currentDrawdown.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawdownChart; 