
import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const PerformanceCalendar = () => {
  // Generate sample calendar data for the last 30 days
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random P&L data for demo
      const pnl = (Math.random() - 0.4) * 500; // Bias towards positive
      const intensity = Math.abs(pnl) / 300; // Normalize for color intensity
      
      data.push({
        date: date.toISOString().split('T')[0],
        pnl: pnl,
        intensity: Math.min(intensity, 1),
        trades: Math.floor(Math.random() * 8) + 1,
      });
    }
    return data;
  };

  const calendarData = generateCalendarData();

  const getColorClass = (pnl: number, intensity: number) => {
    if (pnl > 0) {
      if (intensity > 0.7) return 'bg-green-500/80 profit-glow';
      if (intensity > 0.4) return 'bg-green-500/60';
      return 'bg-green-500/30';
    } else if (pnl < 0) {
      if (intensity > 0.7) return 'bg-red-500/80 loss-glow';
      if (intensity > 0.4) return 'bg-red-500/60';
      return 'bg-red-500/30';
    }
    return 'bg-slate-600/30';
  };

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Performance Calendar</h2>
        </div>
        <div className="text-sm text-slate-400">
          Last 30 days • <span className="text-green-400">+$2,847</span> total
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 mb-6">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square rounded-lg border border-slate-600/30 cursor-pointer
              hover:scale-110 transition-all duration-300 group relative
              ${getColorClass(day.pnl, day.intensity)}
            `}
            title={`${day.date}: ${day.pnl > 0 ? '+' : ''}$${day.pnl.toFixed(2)} (${day.trades} trades)`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                <div className="font-semibold">{day.date}</div>
                <div className={day.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                  {day.pnl > 0 ? '+' : ''}${day.pnl.toFixed(2)}
                </div>
                <div className="text-slate-300">{day.trades} trades</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
            <span className="text-slate-400">Breakeven</span>
          </div>
        </div>
        <div className="text-slate-400">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          68% win rate
        </div>
      </div>
    </div>
  );
};

export default PerformanceCalendar;
