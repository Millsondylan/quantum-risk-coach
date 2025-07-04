import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Newspaper,
  Flag,
  Scale,
  AlertTriangle,
  Plus,
  BookOpen,
  Smile, Meh, Frown
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { localDatabase } from '@/lib/localDatabase';
import { Trade, JournalEntry } from '@/lib/localDatabase';
import { realDataService } from '@/lib/realDataService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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

interface CalendarEvent {
  type: 'trade' | 'news' | 'journal';
  date: Date;
  title: string;
  description: string;
  data: Trade | NewsItem | JournalEntry;
}

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]);
  const [isAddJournalModalOpen, setIsAddJournalModalOpen] = useState(false);
  const [newJournalEntry, setNewJournalEntry] = useState<Partial<JournalEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tradesResponse, newsResponse, journalResponse] = await Promise.allSettled([
          localDatabase.getAllTrades(),
          realDataService.getFinancialNews(),
          localDatabase.getJournalEntries(),
        ]);

        if (tradesResponse.status === 'fulfilled') {
          setAllTrades(tradesResponse.value);
        } else {
          console.error('Error fetching trades:', tradesResponse.reason);
          toast.error('Failed to load trades.');
        }

        if (newsResponse.status === 'fulfilled') {
          setAllNews(newsResponse.value);
        } else {
          console.error('Error fetching news:', newsResponse.reason);
          const errorMessage = tradesResponse.status === 'rejected' ? tradesResponse.reason : newsResponse.reason;
          toast.error(`Failed to load news: ${errorMessage}`);
        }

        if (journalResponse.status === 'fulfilled') {
          setAllJournalEntries(journalResponse.value);
        } else {
          console.error('Error fetching journal entries:', journalResponse.reason);
          const errorMessage = tradesResponse.status === 'rejected' || newsResponse.status === 'rejected' ? "Some data failed to load." : journalResponse.reason;
          toast.error(`Failed to load journal entries: ${errorMessage}`);
        }
      } catch (err) {
        console.error('Unexpected error fetching calendar data:', err);
        toast.error('An unexpected error occurred while fetching calendar data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh data periodically (e.g., every 5 minutes)
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const combinedEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    allTrades.forEach(trade => {
      // Entry event
      events.push({
        type: 'trade',
        date: parseISO(trade.entryDate),
        title: `Trade: ${trade.symbol} (${trade.side.toUpperCase()})`,
        description: `Entry at ${trade.price}, size ${trade.amount}`,
        data: trade
      });
      // Exit event (if closed)
      if (trade.status === 'closed' && trade.exitDate) {
        events.push({
          type: 'trade',
          date: parseISO(trade.exitDate),
          title: `Trade Exit: ${trade.symbol} (${trade.side.toUpperCase()})`,
          description: `Exited at ${trade.exitDate}, PnL: $${trade.profit?.toFixed(2) || '0.00'}`,
          data: trade
        });
      }
    });

    allNews.forEach(newsItem => {
      events.push({
        type: 'news',
        date: parseISO(newsItem.publishedAt),
        title: newsItem.title,
        description: newsItem.summary || newsItem.description || '',
        data: newsItem
      });
    });

    allJournalEntries.forEach(entry => {
      events.push({
        type: 'journal',
        date: parseISO(entry.date),
        title: entry.title || 'Journal Entry',
        description: entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : ''),
        data: entry
      });
    });

    // Sort events chronologically
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    return events;
  }, [allTrades, allNews, allJournalEntries]);

  // Calculate real calendar data from trades
  const calendarData = useMemo(() => {
    const data: { [key: string]: { totalPnL: number; tradeCount: number; winCount: number; trades: Trade[]; news: NewsItem[]; journalEntries: JournalEntry[]; events: CalendarEvent[] } } = {};
    
    // Initialize data structure for each day in the current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    eachDayOfInterval({ start, end }).forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      data[dateKey] = {
        totalPnL: 0,
        tradeCount: 0,
        winCount: 0,
        trades: [],
        news: [],
        journalEntries: [],
        events: []
      };
    });

    combinedEvents.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (data[dateKey]) { // Only add if it's within the current month being displayed
        data[dateKey].events.push(event);
        if (event.type === 'trade') {
          const trade = event.data as Trade;
          data[dateKey].trades.push(trade);
          const pnl = trade.profit || 0;
          data[dateKey].totalPnL += pnl;
          data[dateKey].tradeCount += 1;
          if (pnl > 0) data[dateKey].winCount += 1;
        } else if (event.type === 'news') {
          data[dateKey].news.push(event.data as NewsItem);
        } else if (event.type === 'journal') {
          data[dateKey].journalEntries.push(event.data as JournalEntry);
        }
      }
    });

    return data;
  }, [combinedEvents, currentMonth]);

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
      // Ensure calculation only for current month
      if (isSameDay(dateObj, new Date(currentMonth)) || (dateObj.getMonth() === currentMonth.getMonth() && dateObj.getFullYear() === currentMonth.getFullYear())) {
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
      const wins = Object.values(calendarData)
        .filter((data: any) => {
          const dateObj = new Date(data.date);
          return isSameDay(dateObj, new Date(currentMonth)) || (dateObj.getMonth() === currentMonth.getMonth() && dateObj.getFullYear() === currentMonth.getFullYear()) && data.totalPnL > 0; // Fixed: filter by current month/year
        })
        .length;
      stats.winRate = (wins / stats.totalTrades) * 100; // Fixed: calculate winRate based on totalTrades in current month
    }
    
    return stats;
  }, [calendarData, currentMonth]);

  const getDayContent = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const data = calendarData[dayKey];
    
    if (data && (data.totalPnL !== 0 || data.news.length > 0 || data.journalEntries.length > 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          {data.totalPnL !== 0 && (
            <div className={`text-xs ${data.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(data.totalPnL).toFixed(0)}
            </div>
          )}
          {data.news.length > 0 && (
            <div className="mt-1">
              <Newspaper className="w-3 h-3 text-blue-400" />
            </div>
          )}
          {data.trades.length > 0 && data.totalPnL === 0 && data.news.length === 0 && data.journalEntries.length === 0 && (
             <div className="mt-1"><Flag className="w-3 h-3 text-yellow-400" /></div>
          )}
          {data.journalEntries.length > 0 && (
            <div className="mt-1">
              <BookOpen className="w-3 h-3 text-purple-400" />
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getDayClass = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const data = calendarData[dayKey];
    
    if (!data) return '';
    
    return data.totalPnL > 0 
      ? 'bg-green-500/20 border-green-500/30' 
      : data.totalPnL < 0 
        ? 'bg-red-500/20 border-red-500/30'
        : data.trades.length > 0 || data.news.length > 0 || data.journalEntries.length > 0
          ? 'bg-blue-500/10 border-blue-500/20'
          : '';
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Performance Calendar</h2>
            <p className="text-slate-400">Visual overview of daily trading performance</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Performance Calendar</h2>
            <p className="text-slate-400">Visual overview of daily trading performance</p>
          </div>
        </div>
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-red-400">{error}</p>
              <p className="text-sm text-slate-500">Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMoodIcon = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case 'positive':
      case 'excited':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative':
      case 'stressed':
      case 'fearful':
      case 'greedy':
        return <Frown className="w-4 h-4 text-red-500" />;
      case 'calm':
        return <Scale className="w-4 h-4 text-blue-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleAddJournalEntry = async () => {
    if (!newJournalEntry.content.trim()) {
      toast.error('Journal entry content cannot be empty.');
      return;
    }

    const entryToAdd: JournalEntry = {
      id: uuidv4(),
      date: newJournalEntry.date,
      title: newJournalEntry.title || undefined,
      content: newJournalEntry.content,
      mood: newJournalEntry.mood || undefined,
      tags: newJournalEntry.tags || [],
    };

    try {
      await localDatabase.createJournalEntry(entryToAdd);
      toast.success('Journal entry added!');
      setIsAddJournalModalOpen(false);
      setNewJournalEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
      });
      // Re-fetch data to update calendar
      const [tradesResponse, newsResponse, journalResponse] = await Promise.allSettled([
        localDatabase.getAllTrades(),
        realDataService.getFinancialNews(),
        localDatabase.getJournalEntries(),
      ]);
      if (tradesResponse.status === 'fulfilled') setAllTrades(tradesResponse.value);
      if (newsResponse.status === 'fulfilled') setAllNews(newsResponse.value);
      if (journalResponse.status === 'fulfilled') setAllJournalEntries(journalResponse.value);
    } catch (err) {
      console.error('Failed to add journal entry:', err);
      toast.error('Failed to add journal entry.');
    }
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
          <Dialog open={isAddJournalModalOpen} onOpenChange={setIsAddJournalModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Journal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Journal Entry</DialogTitle>
                <DialogDescription>
                  Record your thoughts, observations, or key takeaways for the day.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="journal-date" className="text-right">Date</Label>
                  <Input 
                    id="journal-date" 
                    type="date" 
                    value={newJournalEntry.date} 
                    onChange={e => setNewJournalEntry({ ...newJournalEntry, date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="journal-title" className="text-right">Title (Optional)</Label>
                  <Input 
                    id="journal-title" 
                    value={newJournalEntry.title || ''} 
                    onChange={e => setNewJournalEntry({ ...newJournalEntry, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Quick thoughts on the market"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="journal-content" className="text-right">Content</Label>
                  <Textarea 
                    id="journal-content" 
                    value={newJournalEntry.content} 
                    onChange={e => setNewJournalEntry({ ...newJournalEntry, content: e.target.value })}
                    className="col-span-3 resize-none"
                    placeholder="What happened today? How did you feel?"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="journal-mood" className="text-right">Mood</Label>
                  <Select
                    value={newJournalEntry.mood || 'neutral'}
                    onValueChange={(value: JournalEntry['mood']) => setNewJournalEntry({ ...newJournalEntry, mood: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">😄 Positive</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="negative">😞 Negative</SelectItem>
                      <SelectItem value="excited">🤩 Excited</SelectItem>
                      <SelectItem value="stressed">😥 Stressed</SelectItem>
                      <SelectItem value="calm">😌 Calm</SelectItem>
                      <SelectItem value="greedy">🤑 Greedy</SelectItem>
                      <SelectItem value="fearful">😨 Fearful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="journal-tags" className="text-right">Tags (CSV)</Label>
                  <Input 
                    id="journal-tags" 
                    value={(newJournalEntry.tags || []).join(',')} 
                    onChange={e => setNewJournalEntry({ ...newJournalEntry, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="col-span-3"
                    placeholder="#reflection, #learning"
                  />
                </div>
              </div>
              <Button onClick={handleAddJournalEntry} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Journal Entry
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="holo-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>{format(currentMonth, 'MMMM yyyy')}</span>
              </CardTitle>
              <CardDescription>
                Daily profit/loss overview with trade counts and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {view === 'calendar' ? (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  month={currentMonth}
                  onMonthChange={handleMonthChange}
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
                  <h3 className="font-semibold text-lg text-white mb-4">Events for {format(currentMonth, 'MMMM yyyy')}</h3>
                  {Object.entries(calendarData).map(([dateStr, data]: [string, any]) => {
                    if (data.events.length === 0) return null;
                    return (
                      <div key={dateStr} className="space-y-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="font-medium text-white">
                          {new Date(dateStr).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <div className="space-y-1">
                          {data.events.map((event: CalendarEvent, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                              {event.type === 'trade' ? (
                                (event.data as Trade).profit !== undefined && (event.data as Trade).profit > 0 ? 
                                  <TrendingUp className="w-4 h-4 text-green-400" /> : 
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                              ) : event.type === 'news' ? (
                                <Newspaper className="w-4 h-4 text-blue-400" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-purple-400" />
                              )}
                              <span>{event.title}</span>
                              {event.type === 'trade' && (event.data as Trade).profit !== undefined && (
                                <Badge variant={(event.data as Trade).profit >= 0 ? 'default' : 'destructive'} className="ml-auto">
                                  ${(event.data as Trade).profit.toFixed(2)}
                                </Badge>
                              )}
                              {event.type === 'journal' && (event.data as JournalEntry).mood && (
                                <Badge variant="outline" className="ml-auto">
                                  {getMoodIcon((event.data as JournalEntry).mood)}
                                  {(event.data as JournalEntry).mood?.charAt(0).toUpperCase() + (event.data as JournalEntry).mood?.slice(1)}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
                  <span className="text-green-400 font-medium">{monthlyStats.winRate.toFixed(1)}%</span>
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
                    ${monthlyStats.bestDay.pnl.toFixed(2)}
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
                    ${monthlyStats.worstDay.pnl.toFixed(2)}
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
                    ${(monthlyStats.totalPnL / (monthlyStats.totalTrades || 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Win</span>
                  <span className="text-green-400 font-medium">
                    ${Math.max(...allTrades.filter(t => (t.profit || 0) > 0).map(t => t.profit || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Largest Loss</span>
                  <span className="text-red-400 font-medium">
                    ${Math.abs(Math.min(...allTrades.filter(t => (t.profit || 0) < 0).map(t => t.profit || 0), 0)).toFixed(2)}
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