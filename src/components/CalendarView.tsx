import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { trades } = useTrades();

  // Calculate real calendar data from trades
  const calendarData = useMemo(() => {
    const data: any = {};
    
    trades.forEach(trade => {
      if (trade.entryDate) {
        const date = new Date(trade.entryDate);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!data[dateKey]) {
          data[dateKey] = {
            totalPnL: 0,
            tradeCount: 0,
            winCount: 0,
            trades: []
          };
        }
        
        const pnl = trade.profitLoss || 0;
        data[dateKey].totalPnL += pnl;
        data[dateKey].tradeCount += 1;
        if (pnl > 0) data[dateKey].winCount += 1;
        data[dateKey].trades.push(trade);
      }
    });
    
    return data;
  }, [trades]);

  const monthlyStats = useMemo(() => {
    const stats = {
      totalPnL: 0,
      totalTrades: 0,
      winRate: 0,
      bestDay: { date: '', pnl: 0 },
      worstDay: { date: '', pnl: 0 }
    };
    
    Object.entries(calendarData).forEach(([date, data]: [string, any]) => {
      const dateObj = new Date(date);
      if (dateObj.getMonth() === currentMonth.getMonth() && 
          dateObj.getFullYear() === currentMonth.getFullYear()) {
        stats.totalPnL += data.totalPnL;
        stats.totalTrades += data.tradeCount;
        
        if (data.totalPnL > stats.bestDay.pnl) {
          stats.bestDay = { date, pnl: data.totalPnL };
        }
        if (data.totalPnL < stats.worstDay.pnl) {
          stats.worstDay = { date, pnl: data.totalPnL };
        }
      }
    });
    
    if (stats.totalTrades > 0) {
      const wins = Object.entries(calendarData)
        .filter(([date, data]: [string, any]) => {
          const dateObj = new Date(date);
          return dateObj.getMonth() === currentMonth.getMonth() && 
                 dateObj.getFullYear() === currentMonth.getFullYear() &&
                 data.totalPnL > 0;
        }).length;
      stats.winRate = (wins / Object.keys(calendarData).length) * 100;
    }
    
    return stats;
  }, [calendarData, currentMonth]);

  const getDayContent = (day: Date) => {
    const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const data = calendarData[dayKey];
    
    if (data && data.totalPnL !== 0) {
      return (
        <div className={`text-xs ${data.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
          ${Math.abs(data.totalPnL).toFixed(0)}
        </div>
      );
    }
    return null;
  };

  const getDayClass = (day: Date) => {
    const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const data = calendarData[dayKey];
    
    if (!data) return '';
    
    return data.totalPnL > 0 
      ? 'bg-green-500/20 border-green-500/30' 
      : 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Calendar</h2>
          <p className="text-slate-400">Visual overview of daily trading performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <Target className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>January 2024</span>
              </CardTitle>
              <CardDescription>
                Daily profit/loss overview with trade counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {view === 'calendar' ? (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                                     classNames={{
                     day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                     day_today: "bg-slate-700 text-white",
                     day: "h-16 w-16 p-0 font-normal aria-selected:opacity-100",
                     head_cell: "text-slate-400 rounded-md w-16 font-normal text-[0.8rem]",
                     nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                     nav_button_previous: "absolute left-1",
                     nav_button_next: "absolute right-1",
                     caption: "flex justify-center py-2 relative items-center",
                     caption_label: "text-sm font-medium",
                     nav: "space-x-1 flex items-center",
                     table: "w-full border-collapse space-y-1",
                     head_row: "flex",
                     row: "flex w-full mt-2",
                     cell: "h-16 w-16 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-800/50 [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                   }}
                  components={{
                    DayContent: ({ date }) => getDayContent(date),
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(calendarData).map(([dateStr, data]: [string, any]) => (
                    <div key={dateStr} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${data.totalPnL > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div>
                          <p className="font-medium text-white">
                            {new Date(dateStr).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-slate-400">{data.tradeCount || 0} trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${data.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${Math.abs(data.totalPnL).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-400">
                          {data.totalPnL > 0 ? 'Profit' : 'Loss'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total P&L</span>
                  <span className="text-xl font-bold text-white">
                    ${monthlyStats.totalPnL.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Trades</span>
                  <span className="text-white font-medium">{monthlyStats.totalTrades}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Win Rate</span>
                  <span className="text-green-400 font-medium">{monthlyStats.winRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Best & Worst Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Best Day</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">
                    ${monthlyStats.bestDay.pnl}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(monthlyStats.bestDay.date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-slate-400">Worst Day</span>
                  </div>
                  <p className="text-lg font-bold text-red-400">
                    ${monthlyStats.worstDay.pnl}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(monthlyStats.worstDay.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Profitable Days</span>
                  <span className="text-green-400 font-medium">
                    {Object.values(calendarData).filter((data: any) => data.totalPnL > 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Losing Days</span>
                  <span className="text-red-400 font-medium">
                    {Object.values(calendarData).filter((data: any) => data.totalPnL < 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Average Daily P&L</span>
                  <span className="text-white font-medium">
                    ${(monthlyStats.totalPnL / (monthlyStats.totalTrades || 1)).toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Win</span>
                  <span className="text-green-400 font-medium">
                    ${Math.max(...trades.filter(t => (t.profitLoss || 0) > 0).map(t => t.profitLoss || 0), 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Loss</span>
                  <span className="text-red-400 font-medium">
                    ${Math.abs(Math.min(...trades.filter(t => (t.profitLoss || 0) < 0).map(t => t.profitLoss || 0), 0)).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 