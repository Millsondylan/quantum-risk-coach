import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Eye, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Star,
  Bell,
  DollarSign,
  Activity,
  X,
  Search,
  Filter
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap?: number;
  category: 'crypto' | 'forex' | 'stocks' | 'commodities';
  isFavorite: boolean;
  hasAlert: boolean;
  alertPrice?: number;
}

interface WatchlistGroup {
  id: string;
  name: string;
  items: WatchlistItem[];
  color: string;
}

export default function Watchlist() {
  const [watchlists, setWatchlists] = useState<WatchlistGroup[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<string>('crypto');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const popularSymbols = {
    crypto: ['BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX'],
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'],
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
    commodities: ['GOLD', 'SILVER', 'OIL', 'COPPER', 'WHEAT', 'CORN', 'SUGAR']
  };

  useEffect(() => {
    // Initialize with sample data
    const sampleWatchlists: WatchlistGroup[] = [
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        color: 'bg-orange-500',
        items: [
          {
            id: '1',
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 43580.50,
            change: 1250.80,
            changePercent: 2.95,
            high24h: 44100.00,
            low24h: 42800.00,
            volume: 28500000000,
            marketCap: 855000000000,
            category: 'crypto',
            isFavorite: true,
            hasAlert: true,
            alertPrice: 45000
          },
          {
            id: '2',
            symbol: 'ETH',
            name: 'Ethereum',
            price: 2680.25,
            change: -45.30,
            changePercent: -1.66,
            high24h: 2750.00,
            low24h: 2650.00,
            volume: 15800000000,
            marketCap: 322000000000,
            category: 'crypto',
            isFavorite: false,
            hasAlert: false
          }
        ]
      },
      {
        id: 'forex',
        name: 'Forex Pairs',
        color: 'bg-blue-500',
        items: [
          {
            id: '3',
            symbol: 'EURUSD',
            name: 'Euro / US Dollar',
            price: 1.0892,
            change: 0.0023,
            changePercent: 0.21,
            high24h: 1.0910,
            low24h: 1.0875,
            volume: 125000000,
            category: 'forex',
            isFavorite: true,
            hasAlert: true,
            alertPrice: 1.0950
          },
          {
            id: '4',
            symbol: 'GBPUSD',
            name: 'British Pound / US Dollar',
            price: 1.2745,
            change: -0.0015,
            changePercent: -0.12,
            high24h: 1.2780,
            low24h: 1.2720,
            volume: 89000000,
            category: 'forex',
            isFavorite: false,
            hasAlert: false
          }
        ]
      },
      {
        id: 'stocks',
        name: 'US Stocks',
        color: 'bg-green-500',
        items: [
          {
            id: '5',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 189.95,
            change: 2.85,
            changePercent: 1.52,
            high24h: 191.20,
            low24h: 186.50,
            volume: 58000000,
            marketCap: 2950000000000,
            category: 'stocks',
            isFavorite: true,
            hasAlert: false
          }
        ]
      }
    ];

    setWatchlists(sampleWatchlists);
  }, []);

  const getCurrentWatchlist = () => {
    return watchlists.find(w => w.id === activeWatchlist) || watchlists[0];
  };

  const addToWatchlist = (symbol: string, category: 'crypto' | 'forex' | 'stocks' | 'commodities') => {
    if (!symbol.trim()) {
      toast.error('Please enter a symbol');
      return;
    }

    // Find or create watchlist for category
    let targetWatchlist = watchlists.find(w => w.id === category);
    if (!targetWatchlist) {
      targetWatchlist = {
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        color: 'bg-purple-500',
        items: []
      };
      setWatchlists(prev => [...prev, targetWatchlist!]);
    }

    // Check if symbol already exists
    if (targetWatchlist.items.some(item => item.symbol === symbol.toUpperCase())) {
      toast.error('Symbol already in watchlist');
      return;
    }

    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      high24h: Math.random() * 1100 + 100,
      low24h: Math.random() * 900 + 50,
      volume: Math.random() * 100000000,
      category,
      isFavorite: false,
      hasAlert: false
    };

    setWatchlists(prev => 
      prev.map(w => 
        w.id === category 
          ? { ...w, items: [...w.items, newItem] }
          : w
      )
    );

    setNewSymbol('');
    setIsAddingSymbol(false);
    toast.success(`${symbol.toUpperCase()} added to watchlist`);
  };

  const removeFromWatchlist = (symbolId: string) => {
    setWatchlists(prev =>
      prev.map(w => ({
        ...w,
        items: w.items.filter(item => item.id !== symbolId)
      }))
    );
    toast.success('Symbol removed from watchlist');
  };

  const toggleFavorite = (symbolId: string) => {
    setWatchlists(prev =>
      prev.map(w => ({
        ...w,
        items: w.items.map(item =>
          item.id === symbolId 
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      }))
    );
  };

  const setAlert = (symbolId: string, alertPrice: number) => {
    setWatchlists(prev =>
      prev.map(w => ({
        ...w,
        items: w.items.map(item =>
          item.id === symbolId 
            ? { ...item, hasAlert: true, alertPrice }
            : item
        )
      }))
    );
    toast.success('Price alert set successfully');
  };

  const refreshPrices = () => {
    setIsLoading(true);
    // Simulate price updates
    setTimeout(() => {
      setWatchlists(prev =>
        prev.map(w => ({
          ...w,
          items: w.items.map(item => ({
            ...item,
            price: item.price * (1 + (Math.random() - 0.5) * 0.02),
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 5
          }))
        }))
      );
      setIsLoading(false);
      toast.success('Prices updated');
    }, 1000);
  };

  const filteredItems = getCurrentWatchlist()?.items.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const formatPrice = (price: number, decimals = 2) => {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card className="holo-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Watchlist
              </CardTitle>
              <CardDescription>
                Track your favorite symbols and set price alerts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshPrices}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsAddingSymbol(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Symbol
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Watchlist Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {watchlists.map((watchlist) => (
              <Button
                key={watchlist.id}
                variant={activeWatchlist === watchlist.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveWatchlist(watchlist.id)}
                className="flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${watchlist.color}`} />
                {watchlist.name}
                <Badge variant="secondary" className="ml-1">
                  {watchlist.items.length}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
                <SelectItem value="commodities">Commodities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Watchlist Items */}
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No symbols in watchlist</p>
                <p className="text-sm">Add symbols to start tracking prices</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{item.symbol}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(item.id)}
                              className="p-1 h-auto"
                            >
                              <Star 
                                className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} 
                              />
                            </Button>
                            {item.hasAlert && (
                              <Bell className="w-4 h-4 text-orange-400" />
                            )}
                          </div>
                          <span className="text-sm text-slate-400">{item.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            ${formatPrice(item.price, item.category === 'forex' ? 5 : 2)}
                          </span>
                          <div className={`flex items-center gap-1 ${
                            item.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          H: ${formatPrice(item.high24h)} L: ${formatPrice(item.low24h)}
                        </div>
                        {item.volume && (
                          <div className="text-xs text-slate-400">
                            Vol: {formatCurrency(item.volume)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const alertPrice = prompt('Enter alert price:');
                            if (alertPrice) {
                              setAlert(item.id, parseFloat(alertPrice));
                            }
                          }}
                          className="p-2"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.id)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Symbol Modal */}
      {isAddingSymbol && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle>Add Symbol to Watchlist</CardTitle>
            <CardDescription>Enter a symbol or select from popular choices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., BTC, AAPL, EURUSD"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addToWatchlist(newSymbol, 'crypto');
                  }
                }}
              />
            </div>

            {/* Popular Symbols */}
            <div className="space-y-3">
              <Label>Popular Symbols</Label>
              {Object.entries(popularSymbols).map(([category, symbols]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300 capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {symbols.map((symbol) => (
                      <Button
                        key={symbol}
                        variant="outline"
                        size="sm"
                        onClick={() => addToWatchlist(symbol, category as any)}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingSymbol(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => addToWatchlist(newSymbol, 'crypto')}
                className="flex-1"
              >
                Add Symbol
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 