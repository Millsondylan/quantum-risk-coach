import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react';
import { calendarService, CalendarData } from '@/lib/api';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // Mock trade data for demonstration
  const mockTrades = [
    { profit_loss: 150, opened_at: '2024-01-01T10:00:00Z' },
    { profit_loss: -50, opened_at: '2024-01-02T09:00:00Z' },
    { profit_loss: 200, opened_at: '2024-01-03T08:00:00Z' },
    { profit_loss: -75, opened_at: '2024-01-04T12:00:00Z' },
    { profit_loss: 300, opened_at: '2024-01-05T07:00:00Z' },
    { profit_loss: 120, opened_at: '2024-01-08T11:00:00Z' },
    { profit_loss: -30, opened_at: '2024-01-09T14:00:00Z' },
    { profit_loss: 180, opened_at: '2024-01-10T09:00:00Z' },
    { profit_loss: -90, opened_at: '2024-01-11T16:00:00Z' },
    { profit_loss: 250, opened_at: '2024-01-12T08:00:00Z' },
  ];

  useEffect(() => {
    const loadCalendarData = async () => {
      setLoading(true);
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const data = await calendarService.generateHeatmapData(mockTrades, startDate, endDate);
        setCalendarData(data);
      } catch (error) {
        console.error('Failed to load calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, [currentDate]);

  const getDayData = (date: Date): CalendarData | null => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarData.find(day => day.date === dateStr) || null;
  };

  const getColorIntensity = (profit: number): string => {
    const absProfit = Math.abs(profit);
    if (profit > 0) {
      if (absProfit > 200) return 'bg-green-600';
      if (absProfit > 100) return 'bg-green-500';
      if (absProfit > 50) return 'bg-green-400';
      return 'bg-green-300';
    } else if (profit < 0) {
      if (absProfit > 200) return 'bg-red-600';
      if (absProfit > 100) return 'bg-red-500';
      if (absProfit > 50) return 'bg-red-400';
      return 'bg-red-300';
    }
    return 'bg-gray-200';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  const monthDays = getMonthDays(currentDate);
  const selectedDayData = selectedDate ? calendarData.find(day => day.date === selectedDate) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Performance Calendar
        </CardTitle>
        <CardDescription>
          Heatmap view of daily trading performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">{getMonthName(currentDate)}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Select value={viewMode} onValueChange={(value: 'month' | 'year') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                {getDayName(i)}
              </div>
            ))}

            {/* Calendar days */}
            {monthDays.map((date, index) => {
              const dayData = getDayData(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`
                    h-16 border rounded-lg p-1 cursor-pointer transition-all hover:shadow-md
                    ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                    ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                    ${selectedDate === date.toISOString().split('T')[0] ? 'ring-2 ring-green-500' : ''}
                  `}
                  onClick={() => {
                    if (isCurrentMonthDay) {
                      setSelectedDate(date.toISOString().split('T')[0]);
                    }
                  }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <span className={`
                        text-xs font-medium
                        ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                        ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                      `}>
                        {date.getDate()}
                      </span>
                      {dayData && (
                        <div className={`
                          w-2 h-2 rounded-full ${getColorIntensity(dayData.profit)}
                        `} />
                      )}
                    </div>
                    {dayData && (
                      <div className="mt-1 text-xs">
                        <div className={`
                          font-medium
                          ${dayData.profit > 0 ? 'text-green-600' : dayData.profit < 0 ? 'text-red-600' : 'text-gray-500'}
                        `}>
                          {formatCurrency(dayData.profit)}
                        </div>
                        <div className="text-gray-500">
                          {dayData.trades} trades
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span>Small Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Medium Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Large Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-300 rounded"></div>
              <span>Small Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Medium Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Large Loss</span>
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDayData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(selectedDate!).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedDayData.profit)}
                    </div>
                    <div className="text-sm text-muted-foreground">Daily P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedDayData.trades}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedDayData.winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedDayData.profit > 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-500 mx-auto" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView; 