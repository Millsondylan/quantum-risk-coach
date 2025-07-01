import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayData {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
  bestTrade: number;
  worstTrade: number;
}

const PerformanceCalendar = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Generate realistic calendar data for the last 30 days
  const generateCalendarData = (): DayData[] => {
    const data: DayData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic trading data
      const hasTrades = Math.random() > 0.3; // 70% chance of having trades
      const trades = hasTrades ? Math.floor(Math.random() * 8) + 1 : 0;
      const winRate = hasTrades ? Math.floor(Math.random() * 40) + 50 : 0; // 50-90%
      const volume = hasTrades ? Math.floor(Math.random() * 5) + 1 : 0;
      
      let pnl = 0;
      let bestTrade = 0;
      let worstTrade = 0;
      
      if (hasTrades) {
        // Generate realistic PnL based on win rate
        const wins = Math.floor((trades * winRate) / 100);
        const losses = trades - wins;
        
        // Simulate individual trade results
        const tradeResults = [];
        for (let j = 0; j < trades; j++) {
          const isWin = j < wins;
          const tradePnL = isWin 
            ? Math.random() * 50 + 10 // $10-$60 profit
            : -(Math.random() * 30 + 5); // $5-$35 loss
          tradeResults.push(tradePnL);
        }
        
        pnl = tradeResults.reduce((sum, trade) => sum + trade, 0);
        bestTrade = Math.max(...tradeResults);
        worstTrade = Math.min(...tradeResults);
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        pnl,
        trades,
        winRate,
        volume,
        bestTrade,
        worstTrade
      });
    }
    return data;
  };

  const calendarData = generateCalendarData();

  useEffect(() => {
    // Simulate connection status
    setIsConnected(true);
  }, []);

  const getDayColor = (day: DayData) => {
    if (day.trades === 0) return 'bg-slate-600/30 border-slate-600/30';
    if (day.pnl > 0) {
      const intensity = Math.min(day.pnl / 100, 1); // Normalize to 0-1
      return `bg-green-500/${Math.floor(intensity * 60 + 20)} border-green-500/${Math.floor(intensity * 40 + 20)}`;
    } else {
      const intensity = Math.min(Math.abs(day.pnl) / 50, 1);
      return `bg-red-500/${Math.floor(intensity * 60 + 20)} border-red-500/${Math.floor(intensity * 40 + 20)}`;
    }
  };

  const getDayGlow = (day: DayData) => {
    if (day.trades === 0) return '';
    if (day.pnl > 0) return 'profit-glow';
    return 'loss-glow';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalPnL = calendarData.reduce((sum, day) => sum + day.pnl, 0);
  const totalTrades = calendarData.reduce((sum, day) => sum + day.trades, 0);
  const profitableDays = calendarData.filter(day => day.pnl > 0).length;
  const losingDays = calendarData.filter(day => day.pnl < 0).length;

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Performance Calendar</h2>
        </div>
        <div className="text-sm text-slate-400">
          Last 30 days • {isConnected ? `${profitableDays} profitable, ${losingDays} losing` : 'No data available'}
        </div>
      </div>

      {/* Summary Stats */}
      {isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Total P&L</span>
            </div>
            <p className={`text-lg font-semibold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Total Trades</span>
            </div>
            <p className="text-lg font-semibold text-white">{totalTrades}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Win Rate</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {totalTrades > 0 ? Math.round((profitableDays / (profitableDays + losingDays)) * 100) : 0}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Active Days</span>
            </div>
            <p className="text-lg font-semibold text-white">{profitableDays + losingDays}</p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-10 gap-2 mb-6">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg border cursor-pointer hover:scale-110 transition-all duration-300 group relative ${getDayColor(day)} ${getDayGlow(day)}`}
            onClick={() => setSelectedDay(day)}
            title={`${day.date}: ${day.trades > 0 ? formatCurrency(day.pnl) : 'No trades'}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {day.trades > 0 && (
                <div className="text-xs font-medium text-white">
                  {day.pnl > 0 ? '+' : ''}{formatCurrency(day.pnl)}
                </div>
              )}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg absolute -top-32 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 min-w-[200px]">
                <div className="font-semibold mb-1">{day.date}</div>
                {day.trades > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>P&L:</span>
                      <span className={day.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(day.pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trades:</span>
                      <span>{day.trades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span>{day.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Trade:</span>
                      <span className="text-green-400">{formatCurrency(day.bestTrade)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Trade:</span>
                      <span className="text-red-400">{formatCurrency(day.worstTrade)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-300">No trades recorded</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500/60 rounded"></div>
            <span className="text-slate-400">Profitable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500/60 rounded"></div>
            <span className="text-slate-400">Loss</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-600/60 rounded"></div>
            <span className="text-slate-400">No trades</span>
          </div>
        </div>
        {!isConnected && (
          <button 
            onClick={() => navigate('/connect-mt4')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Connect MT4/5 for data
          </button>
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Details for {selectedDay.date}</h3>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
          {selectedDay.trades > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">P&L</p>
                <p className={`font-semibold ${selectedDay.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(selectedDay.pnl)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Trades</p>
                <p className="font-semibold text-white">{selectedDay.trades}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Win Rate</p>
                <p className="font-semibold text-white">{selectedDay.winRate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Volume</p>
                <p className="font-semibold text-white">{selectedDay.volume} lots</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No trading activity on this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceCalendar;
