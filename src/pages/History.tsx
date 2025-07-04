import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { localDatabase } from '@/lib/localDatabase';
import { Trade } from '@/lib/localDatabase';
import { TagInput } from '@/components/ui/tag-input';
import { 
  History as HistoryIcon,
  Filter, 
  CalendarDays, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowDownUp,
  Tag,
  Smile,
  Frown,
  Meh,
  Shield,
  Star,
  Download
} from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const History: React.FC = () => {
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [symbolFilter, setSymbolFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [minProfitFilter, setMinProfitFilter] = useState<string>('');
  const [maxProfitFilter, setMaxProfitFilter] = useState<string>('');
  const [minRRFilter, setMinRRFilter] = useState<string>('');
  const [maxRRFilter, setMaxRRFilter] = useState<string>('');
  const [minConfidenceFilter, setMinConfidenceFilter] = useState<string>('');
  const [maxConfidenceFilter, setMaxConfidenceFilter] = useState<string>('');
  const [moodFilter, setMoodFilter] = useState<Trade['mood'] | 'all'>('all');
  // Volatility and Strategy would require more complex data, using placeholders for now
  const [strategyFilter, setStrategyFilter] = useState<string>('');
  const [volatilityFilter, setVolatilityFilter] = useState<string>(''); // Placeholder

  // Sort states
  const [sortBy, setSortBy] = useState<'entryDate' | 'profit' | 'symbol' | 'confidenceRating'>('entryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      setError(null);
      try {
        const trades = await localDatabase.getTrades();
        setAllTrades(trades);
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError('Failed to load trade history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();

    // Refresh trades periodically
    const interval = setInterval(fetchTrades, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let trades = [...allTrades];

    // Apply filters
    if (symbolFilter) {
      trades = trades.filter(trade => 
        trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      trades = trades.filter(trade => trade.side === typeFilter);
    }
    if (statusFilter !== 'all') {
      trades = trades.filter(trade => trade.status === statusFilter);
    }
    if (dateRange) {
      trades = trades.filter(trade => {
        const tradeDate = startOfDay(parseISO(trade.entryDate));
        return tradeDate >= startOfDay(dateRange.from!) && tradeDate <= endOfDay(dateRange.to!);
      });
    }
    if (tagsFilter.length > 0) {
      trades = trades.filter(trade => 
        trade.tags && tagsFilter.every(tag => trade.tags!.includes(tag))
      );
    }
    if (minProfitFilter) {
      trades = trades.filter(trade => (trade.profit || 0) >= parseFloat(minProfitFilter));
    }
    if (maxProfitFilter) {
      trades = trades.filter(trade => (trade.profit || 0) <= parseFloat(maxProfitFilter));
    }
    if (minRRFilter) {
      trades = trades.filter(trade => (trade.riskReward || 0) >= parseFloat(minRRFilter));
    }
    if (maxRRFilter) {
      trades = trades.filter(trade => (trade.riskReward || 0) <= parseFloat(maxRRFilter));
    }
    if (minConfidenceFilter) {
      trades = trades.filter(trade => (trade.confidenceRating || 0) >= parseFloat(minConfidenceFilter));
    }
    if (maxConfidenceFilter) {
      trades = trades.filter(trade => (trade.confidenceRating || 0) <= parseFloat(maxConfidenceFilter));
    }
    if (moodFilter !== 'all') {
      trades = trades.filter(trade => trade.mood === moodFilter);
    }
    // Placeholder filters for Strategy and Volatility

    // Apply sort
    trades.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortBy) {
        case 'entryDate':
          valA = new Date(a.entryDate).getTime();
          valB = new Date(b.entryDate).getTime();
          break;
        case 'profit':
          valA = a.profit || 0;
          valB = b.profit || 0;
          break;
        case 'symbol':
          valA = a.symbol.toLowerCase();
          valB = b.symbol.toLowerCase();
          break;
        case 'confidenceRating':
          valA = a.confidenceRating || 0;
          valB = b.confidenceRating || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTrades(trades);
  }, [allTrades, symbolFilter, typeFilter, statusFilter, dateRange, tagsFilter, minProfitFilter, maxProfitFilter, minRRFilter, maxRRFilter, minConfidenceFilter, maxConfidenceFilter, moodFilter, sortBy, sortOrder]);

  const resetFilters = () => {
    setSymbolFilter('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange(undefined);
    setTagsFilter([]);
    setMinProfitFilter('');
    setMaxProfitFilter('');
    setMinRRFilter('');
    setMaxRRFilter('');
    setMinConfidenceFilter('');
    setMaxConfidenceFilter('');
    setMoodFilter('all');
    setStrategyFilter('');
    setVolatilityFilter('');
    setSortBy('entryDate');
    setSortOrder('desc');
  };

  const handleExportCSV = () => {
    if (filteredTrades.length === 0) {
      toast.info('No trades to export.');
      return;
    }

    const headers = ["ID", "Account ID", "Symbol", "Side", "Amount", "Price", "Fee", "Profit", "Status", "Entry Date", "Exit Date", "Risk:Reward", "Tags", "Confidence Rating", "Mood", "Notes"];
    
    const csvContent = [headers.join(',')];

    filteredTrades.forEach(trade => {
      const row = [
        `"${trade.id}"`,
        `"${trade.accountId}"`,
        `"${trade.symbol}"`,
        `"${trade.side}"`,
        trade.amount.toString(),
        trade.price.toString(),
        trade.fee.toString(),
        trade.profit !== undefined ? trade.profit.toFixed(2) : '',
        `"${trade.status}"`,
        `"${trade.entryDate}"`,
        trade.exitDate ? `"${trade.exitDate}"` : '',
        trade.riskReward !== undefined ? trade.riskReward.toFixed(2) : '',
        `"${(trade.tags || []).join(';')}"`,
        trade.confidenceRating !== undefined ? trade.confidenceRating.toString() : '',
        trade.mood ? `"${trade.mood}"` : '',
        trade.notes ? `"${trade.notes.replace(/"/g, '""')}"` : '',
      ];
      csvContent.push(row.join(','));
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'trade_history.csv');
    link.click();
    toast.success('Trade history exported to CSV!');
  };

  const getMoodIcon = (mood: Trade['mood']) => {
    switch (mood) {
      case 'positive':
      case 'excited':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative':
      case 'stressed':
      case 'fearful':
      case 'greedy':
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-20 space-y-6">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">Trade History</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pb-20 space-y-6">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">Trade History</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6" data-testid="trade-history-page">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-6 w-6 text-blue-400" />
        <h1 className="text-3xl font-bold">Trade History</h1>
      </div>

      {/* Filters Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filters</CardTitle>
          <CardDescription>Filter and sort your trade history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="symbol-filter">Symbol</Label>
              <Input 
                id="symbol-filter" 
                placeholder="e.g., EURUSD, AAPL" 
                value={symbolFilter}
                onChange={e => setSymbolFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={(value: typeof typeFilter) => setTypeFilter(value)}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-range-filter">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range-filter"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange ? (
                      <>{format(dateRange.from!, "LLL dd, y")} - {format(dateRange.to!, "LLL dd, y")}</>
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="tags-filter">Tags</Label>
              <TagInput 
                value={tagsFilter} 
                onChange={setTagsFilter} 
                placeholder="Add tags to filter by" 
              />
            </div>
            <div>
              <Label htmlFor="mood-filter">Mood</Label>
              <Select value={moodFilter} onValueChange={(value: typeof moodFilter) => setMoodFilter(value)}>
                <SelectTrigger id="mood-filter">
                  <SelectValue placeholder="All Moods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="stressed">Stressed</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="greedy">Greedy</SelectItem>
                  <SelectItem value="fearful">Fearful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Numerical Filters (Profit, R:R, Confidence) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min-profit">Min Profit</Label>
              <Input type="number" id="min-profit" value={minProfitFilter} onChange={e => setMinProfitFilter(e.target.value)} placeholder="Min Profit" />
            </div>
            <div>
              <Label htmlFor="max-profit">Max Profit</Label>
              <Input type="number" id="max-profit" value={maxProfitFilter} onChange={e => setMaxProfitFilter(e.target.value)} placeholder="Max Profit" />
            </div>
            <div>
              <Label htmlFor="min-rr">Min R:R</Label>
              <Input type="number" step="0.1" id="min-rr" value={minRRFilter} onChange={e => setMinRRFilter(e.target.value)} placeholder="Min R:R" />
            </div>
            <div>
              <Label htmlFor="max-rr">Max R:R</Label>
              <Input type="number" step="0.1" id="max-rr" value={maxRRFilter} onChange={e => setMaxRRFilter(e.target.value)} placeholder="Max R:R" />
            </div>
            <div>
              <Label htmlFor="min-confidence">Min Confidence (%)</Label>
              <Input type="number" step="1" id="min-confidence" value={minConfidenceFilter} onChange={e => setMinConfidenceFilter(e.target.value)} placeholder="Min Confidence" min="0" max="100" />
            </div>
            <div>
              <Label htmlFor="max-confidence">Max Confidence (%)</Label>
              <Input type="number" step="1" id="max-confidence" value={maxConfidenceFilter} onChange={e => setMaxConfidenceFilter(e.target.value)} placeholder="Max Confidence" min="0" max="100" />
            </div>
          </div>

          {/* Advanced / Placeholder Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategy-filter">Strategy (Placeholder)</Label>
              <Input 
                id="strategy-filter" 
                placeholder="e.g., Breakout, Scalping" 
                value={strategyFilter}
                onChange={e => setStrategyFilter(e.target.value)}
                disabled // No concrete strategy field on Trade yet
              />
            </div>
            <div>
              <Label htmlFor="volatility-filter">Volatility (Placeholder)</Label>
              <Select value={volatilityFilter} onValueChange={setVolatilityFilter} disabled> 
                <SelectTrigger id="volatility-filter">
                  <SelectValue placeholder="All Volatility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entryDate">Entry Date</SelectItem>
                  <SelectItem value="profit">Profit/Loss</SelectItem>
                  <SelectItem value="symbol">Symbol</SelectItem>
                  <SelectItem value="confidenceRating">Confidence Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select value={sortOrder} onValueChange={(value: typeof sortOrder) => setSortOrder(value)}>
                <SelectTrigger id="sort-order">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={resetFilters} variant="outline" className="w-full">
            Reset Filters
          </Button>
          {filteredTrades.length > 0 && (
            <Button onClick={handleExportCSV} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trade List */}
      {filteredTrades.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-slate-400">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4" />
              <p>No trades found matching your criteria.</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or add new trades.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTrades.map((trade) => (
            <Card key={trade.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'}>
                      {trade.side.toUpperCase()}
                    </Badge>
                    <h3 className="font-semibold text-lg text-white">{trade.symbol}</h3>
                    <Badge variant="outline" className="text-xs">
                      {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                    </Badge>
                  </div>
                  <div className={`font-bold text-lg ${
                    (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(trade.profit || 0) >= 0 ? '+' : ''}{(trade.profit || 0).toFixed(2)}
                    <span className="text-sm text-slate-400 ml-1">USD</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 mb-2">
                  Entry: {trade.price} | Size: {trade.amount} | Fee: {trade.fee}
                  {trade.exitDate && ` | Exit: ${trade.exitDate}`}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>{format(parseISO(trade.entryDate), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  {trade.riskReward !== undefined && trade.riskReward !== 0 && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>R:R: {trade.riskReward.toFixed(2)}</span>
                    </div>
                  )}
                  {trade.confidenceRating !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>Confidence: {trade.confidenceRating}%</span>
                    </div>
                  )}
                  {trade.mood && (
                    <div className="flex items-center gap-1">
                      {getMoodIcon(trade.mood)}
                      <span>Mood: {trade.mood.charAt(0).toUpperCase() + trade.mood.slice(1)}</span>
                    </div>
                  )}
                </div>

                {trade.tags && trade.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {trade.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {trade.notes && (
                  <p className="text-sm text-slate-300 border-t border-gray-700 pt-2 mt-2">
                    {trade.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History; 