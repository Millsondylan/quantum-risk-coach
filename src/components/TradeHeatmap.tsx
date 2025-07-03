import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

interface TradeHeatmapProps {
  trades: Trade[];
}

const TradeHeatmap: React.FC<TradeHeatmapProps> = ({ trades }) => {
  const heatmapData = useMemo(() => {
    const data: { [key: string]: { trades: Trade[]; totalPnL: number; winRate: number; count: number } } = {};
    
    // Initialize data structure for all hours and days
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        data[key] = {
          trades: [],
          totalPnL: 0,
          winRate: 0,
          count: 0
        };
      }
    }

    // Process trades
    trades.forEach(trade => {
      const entryDate = new Date(trade.entryDate);
      const day = entryDate.getDay();
      const hour = entryDate.getHours();
      const key = `${day}-${hour}`;
      
      if (data[key]) {
        data[key].trades.push(trade);
        data[key].count++;
        
        if (trade.status === 'closed' && trade.profitLoss !== undefined) {
          data[key].totalPnL += trade.profitLoss;
          
          const winningTrades = data[key].trades.filter(t => 
            t.status === 'closed' && (t.profitLoss || 0) > 0
          );
          data[key].winRate = data[key].trades.filter(t => t.status === 'closed').length > 0 
            ? (winningTrades.length / data[key].trades.filter(t => t.status === 'closed').length) * 100 
            : 0;
        }
      }
    });

    return data;
  }, [trades]);

  const getIntensity = (totalPnL: number, count: number) => {
    if (count === 0) return 0;
    const normalizedPnL = Math.abs(totalPnL) / Math.max(1, count);
    return Math.min(1, normalizedPnL / 100); // Normalize to 0-1
  };

  const getColor = (totalPnL: number, count: number) => {
    if (count === 0) return 'bg-slate-800';
    
    const intensity = getIntensity(totalPnL, count);
    if (totalPnL > 0) {
      return `bg-green-${Math.max(400, Math.floor(400 + intensity * 400))}`;
    } else if (totalPnL < 0) {
      return `bg-red-${Math.max(400, Math.floor(400 + intensity * 400))}`;
    }
    return 'bg-slate-600';
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Performance Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Profitable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Loss</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-25 gap-1">
        {/* Header row with hours */}
        <div className="text-xs text-slate-400 text-center">Day/Hour</div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="text-xs text-slate-400 text-center">
            {i.toString().padStart(2, '0')}
          </div>
        ))}

        {/* Data rows */}
        {dayNames.map((dayName, dayIndex) => (
          <React.Fragment key={dayIndex}>
            <div className="text-xs text-slate-300 font-medium text-center py-1">
              {dayName}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const key = `${dayIndex}-${hour}`;
              const data = heatmapData[key];
              const color = getColor(data.totalPnL, data.count);
              
              return (
                <div
                  key={hour}
                  className={`
                    ${color} 
                    w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium
                    ${data.count > 0 ? 'cursor-pointer hover:opacity-80' : ''}
                    transition-all duration-200
                  `}
                  title={`${dayName} ${hour.toString().padStart(2, '0')}:00 - ${data.count} trades, $${data.totalPnL.toFixed(2)} P&L, ${data.winRate.toFixed(1)}% win rate`}
                >
                  {data.count > 0 && (
                    <span className="text-white">
                      {data.totalPnL > 0 ? '+' : ''}{data.totalPnL.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Best Time</p>
              <p className="text-white font-medium text-sm">
                {(() => {
                  let bestKey = '';
                  let bestPnL = -Infinity;
                  
                  Object.entries(heatmapData).forEach(([key, data]) => {
                    if (data.totalPnL > bestPnL && data.count > 0) {
                      bestPnL = data.totalPnL;
                      bestKey = key;
                    }
                  });
                  
                  if (bestKey) {
                    const [day, hour] = bestKey.split('-');
                    return `${dayNames[parseInt(day)]} ${hour.padStart(2, '0')}:00`;
                  }
                  return 'N/A';
                })()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Worst Time</p>
              <p className="text-white font-medium text-sm">
                {(() => {
                  let worstKey = '';
                  let worstPnL = Infinity;
                  
                  Object.entries(heatmapData).forEach(([key, data]) => {
                    if (data.totalPnL < worstPnL && data.count > 0) {
                      worstPnL = data.totalPnL;
                      worstKey = key;
                    }
                  });
                  
                  if (worstKey) {
                    const [day, hour] = worstKey.split('-');
                    return `${dayNames[parseInt(day)]} ${hour.padStart(2, '0')}:00`;
                  }
                  return 'N/A';
                })()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradeHeatmap; 