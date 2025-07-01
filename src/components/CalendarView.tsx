import React, { useState } from 'react';
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

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // Mock data for calendar days
  const calendarData = {
    '2024-01-15': { pnl: 450, trades: 3, type: 'profit' },
    '2024-01-16': { pnl: -120, trades: 2, type: 'loss' },
    '2024-01-17': { pnl: 890, trades: 5, type: 'profit' },
    '2024-01-18': { pnl: 234, trades: 4, type: 'profit' },
    '2024-01-19': { pnl: -67, trades: 1, type: 'loss' },
    '2024-01-20': { pnl: 567, trades: 6, type: 'profit' },
    '2024-01-21': { pnl: 123, trades: 2, type: 'profit' },
    '2024-01-22': { pnl: -89, trades: 3, type: 'loss' },
    '2024-01-23': { pnl: 345, trades: 4, type: 'profit' },
    '2024-01-24': { pnl: 678, trades: 7, type: 'profit' },
    '2024-01-25': { pnl: -234, trades: 2, type: 'loss' },
    '2024-01-26': { pnl: 456, trades: 5, type: 'profit' },
    '2024-01-27': { pnl: 789, trades: 8, type: 'profit' },
    '2024-01-28': { pnl: -123, trades: 1, type: 'loss' },
    '2024-01-29': { pnl: 234, trades: 3, type: 'profit' },
    '2024-01-30': { pnl: 567, trades: 6, type: 'profit' }
  };

  const getDayContent = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    const data = calendarData[dateString as keyof typeof calendarData];
    
    if (!data) return null;

    return (
      <div className="text-center p-1">
        <div className={`text-xs font-medium ${data.type === 'profit' ? 'text-green-400' : 'text-red-400'}`}>
          ${data.pnl}
        </div>
        <div className="text-xs text-slate-400">
          {data.trades} trades
        </div>
      </div>
    );
  };

  const getDayClassName = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    const data = calendarData[dateString as keyof typeof calendarData];
    
    if (!data) return '';
    
    return data.type === 'profit' 
      ? 'bg-green-500/20 border-green-500/30' 
      : 'bg-red-500/20 border-red-500/30';
  };

  const monthlyStats = {
    totalPnL: 3240.75,
    totalTrades: 67,
    winRate: 68.5,
    bestDay: { date: '2024-01-27', pnl: 789 },
    worstDay: { date: '2024-01-25', pnl: -234 }
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
                  {Object.entries(calendarData).map(([dateStr, data]) => (
                    <div key={dateStr} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${data.type === 'profit' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div>
                          <p className="font-medium text-white">
                            {new Date(dateStr).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-slate-400">{data.trades} trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${data.type === 'profit' ? 'text-green-400' : 'text-red-400'}`}>
                          ${data.pnl}
                        </p>
                        <p className="text-sm text-slate-400">
                          {data.type === 'profit' ? 'Profit' : 'Loss'}
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
                  <span className="text-green-400 font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Losing Days</span>
                  <span className="text-red-400 font-medium">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Average Daily P&L</span>
                  <span className="text-white font-medium">$202</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Win</span>
                  <span className="text-green-400 font-medium">$789</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Loss</span>
                  <span className="text-red-400 font-medium">$234</span>
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