import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  ExternalLink,
  Filter,
  AlertTriangle,
  Info
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

interface NewsCalendarProps {
  newsData: NewsItem[];
  trades: Trade[];
  currentMonth: Date;
}

const NewsCalendar: React.FC<NewsCalendarProps> = ({ newsData, trades, currentMonth }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [filterImpact, setFilterImpact] = React.useState<'all' | 'high' | 'medium' | 'low'>('all');

  const calendarData = useMemo(() => {
    const data: { [key: string]: { news: NewsItem[]; trades: Trade[]; impact: 'high' | 'medium' | 'low' } } = {};
    
    // Initialize data structure for each day in the current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    eachDayOfInterval({ start, end }).forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      data[dateKey] = {
        news: [],
        trades: [],
        impact: 'low'
      };
    });

    // Add news events
    newsData.forEach(newsItem => {
      const newsDate = format(parseISO(newsItem.publishedAt), 'yyyy-MM-dd');
      if (data[newsDate]) {
        data[newsDate].news.push(newsItem);
      }
    });

    // Add trades
    trades.forEach(trade => {
      const tradeDate = format(parseISO(trade.entryDate), 'yyyy-MM-dd');
      if (data[tradeDate]) {
        data[tradeDate].trades.push(trade);
      }
    });

    // Calculate impact level for each day
    Object.keys(data).forEach(dateKey => {
      const dayData = data[dateKey];
      const newsCount = dayData.news.length;
      const tradeCount = dayData.trades.length;
      
      if (newsCount > 3 || tradeCount > 5) {
        dayData.impact = 'high';
      } else if (newsCount > 1 || tradeCount > 2) {
        dayData.impact = 'medium';
      } else {
        dayData.impact = 'low';
      }
    });

    return data;
  }, [newsData, trades, currentMonth]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const selectedDayData = selectedDate ? calendarData[format(selectedDate, 'yyyy-MM-dd')] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">Economic Calendar & News</h3>
            <p className="text-slate-400 text-sm">Market events and their impact on your trades</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value as any)}
            className="bg-[#1A1B1E] border border-[#2A2B2E] text-white text-sm rounded-lg px-3 py-1"
          >
            <option value="all">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-slate-400 font-medium p-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {(() => {
          const start = startOfMonth(currentMonth);
          const end = endOfMonth(currentMonth);
          const days = eachDayOfInterval({ start, end });
          
          // Add empty cells for days before the first day of the month
          const firstDayOfWeek = start.getDay();
          const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-16"></div>
          ));

          return [
            ...emptyCells,
            ...days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayData = calendarData[dateKey];
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateKey}
                  className={`
                    h-16 border border-[#2A2B2E] p-1 cursor-pointer transition-all duration-200
                    ${isSelected ? 'bg-blue-600/20 border-blue-500' : 'hover:bg-[#1A1B1E]/50'}
                    ${isToday ? 'ring-2 ring-blue-500/50' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-white'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayData && (dayData.news.length > 0 || dayData.trades.length > 0) && (
                      <Badge className={`text-xs ${getImpactColor(dayData.impact)}`}>
                        {dayData.news.length + dayData.trades.length}
                      </Badge>
                    )}
                  </div>
                  
                  {dayData && (
                    <div className="space-y-1">
                      {dayData.news.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Newspaper className="w-2 h-2 text-blue-400" />
                          <span className="text-xs text-slate-400">{dayData.news.length}</span>
                        </div>
                      )}
                      {dayData.trades.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-2 h-2 text-green-400" />
                          <span className="text-xs text-slate-400">{dayData.trades.length}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ];
        })()}
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayData && (
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* News Events */}
            {selectedDayData.news.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  News Events ({selectedDayData.news.length})
                </h4>
                <div className="space-y-3">
                  {selectedDayData.news.map((newsItem, index) => (
                    <div key={index} className="bg-[#1A1B1E]/30 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(newsItem.sentiment)}
                          <span className="text-white text-sm font-medium">{newsItem.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(newsItem.url, '_blank')}
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">
                        {newsItem.summary || newsItem.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">{newsItem.source}</span>
                        <span className="text-slate-500 text-xs">
                          {format(parseISO(newsItem.publishedAt), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trades */}
            {selectedDayData.trades.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Trades ({selectedDayData.trades.length})
                </h4>
                <div className="space-y-2">
                  {selectedDayData.trades.map((trade, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#1A1B1E]/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                        <span className="text-white text-sm">{trade.symbol}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${(trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(trade.profitLoss || 0).toFixed(2)}
                        </span>
                        <div className="text-slate-500 text-xs">
                          {format(parseISO(trade.entryDate), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayData.news.length === 0 && selectedDayData.trades.length === 0 && (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No events or trades on this day</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsCalendar; 