import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock,
  ExternalLink,
  DollarSign,
  Target
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface NewsItem {
  id?: string;
  title: string;
  summary?: string;
  content?: string;
  source: string;
  publishedAt: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedSymbols?: string[];
  url: string;
  imageUrl?: string;
  urlToImage?: string;
  description?: string;
}

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

interface TradeTimelineProps {
  trades: Trade[];
  currentMonth: Date;
  newsData: NewsItem[];
  onDateSelect: (date: Date) => void;
}

const TradeTimeline: React.FC<TradeTimelineProps> = ({ trades, currentMonth, newsData, onDateSelect }) => {
  const timelineData = useMemo(() => {
    const events: Array<{
      date: Date;
      type: 'trade' | 'news';
      data: Trade | NewsItem;
      title: string;
      description: string;
    }> = [];

    // Add trades
    trades.forEach(trade => {
      events.push({
        date: parseISO(trade.entryDate),
        type: 'trade',
        data: trade,
        title: `${trade.symbol} ${trade.side.toUpperCase()}`,
        description: `Entry at $${trade.price}, Size: ${trade.amount}`
      });

      if (trade.status === 'closed' && trade.exitDate) {
        events.push({
          date: parseISO(trade.exitDate),
          type: 'trade',
          data: trade,
          title: `${trade.symbol} Exit`,
          description: `P&L: $${(trade.profitLoss || 0).toFixed(2)}`
        });
      }
    });

    // Add news
    newsData.forEach(newsItem => {
      events.push({
        date: parseISO(newsItem.publishedAt),
        type: 'news',
        data: newsItem,
        title: newsItem.title,
        description: newsItem.summary || newsItem.description || ''
      });
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }, [trades, newsData]);

  const getEventIcon = (type: string, data: any) => {
    if (type === 'trade') {
      const trade = data as Trade;
      return trade.side === 'buy' ? 
        <TrendingUp className="w-4 h-4 text-green-400" /> : 
        <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return <Calendar className="w-4 h-4 text-blue-400" />;
  };

  const getEventColor = (type: string, data: any) => {
    if (type === 'trade') {
      const trade = data as Trade;
      if (trade.status === 'closed') {
        return (trade.profitLoss || 0) >= 0 ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10';
      }
      return 'border-blue-500/30 bg-blue-500/10';
    }
    return 'border-purple-500/30 bg-purple-500/10';
  };

  const getEventTextColor = (type: string, data: any) => {
    if (type === 'trade') {
      const trade = data as Trade;
      if (trade.status === 'closed') {
        return (trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400';
      }
      return 'text-blue-400';
    }
    return 'text-purple-400';
  };

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: { [key: string]: typeof timelineData } = {};
    
    timelineData.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [timelineData]);

  // Get days in current month
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400 text-sm">No events in this month</p>
        <p className="text-slate-500 text-xs">Add trades or check news for events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="space-y-4">
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dateKey] || [];
          const isToday = isSameDay(day, new Date());

          if (dayEvents.length === 0) {
            return (
              <div
                key={dateKey}
                className={`
                  p-3 border border-[#2A2B2E] rounded-lg cursor-pointer transition-all duration-200
                  ${isToday ? 'bg-blue-600/10 border-blue-500/30' : 'hover:bg-[#1A1B1E]/30'}
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className={`text-sm ${isToday ? 'text-blue-400 font-medium' : 'text-slate-400'}`}>
                      {format(day, 'MMM d')}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">No events</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={dateKey}
              className={`
                p-3 border rounded-lg cursor-pointer transition-all duration-200
                ${isToday ? 'bg-blue-600/10 border-blue-500/30' : 'hover:bg-[#1A1B1E]/30'}
              `}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-white'}`}>
                    {format(day, 'MMM d')}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dayEvents.length} events
                </Badge>
              </div>

              <div className="space-y-2">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center gap-3 p-2 rounded border
                      ${getEventColor(event.type, event.data)}
                    `}
                  >
                    {getEventIcon(event.type, event.data)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${getEventTextColor(event.type, event.data)}`}>
                        {event.title}
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-slate-500 text-xs">
                      {format(event.date, 'HH:mm')}
                    </div>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-center">
                    <span className="text-slate-500 text-xs">
                      +{dayEvents.length - 3} more events
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">
                {trades.filter(t => t.status === 'closed' && (t.profitLoss || 0) > 0).length}
              </p>
              <p className="text-slate-400 text-xs">Winning Trades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {newsData.length}
              </p>
              <p className="text-slate-400 text-xs">News Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {timelineData.length}
              </p>
              <p className="text-slate-400 text-xs">Total Events</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeTimeline; 