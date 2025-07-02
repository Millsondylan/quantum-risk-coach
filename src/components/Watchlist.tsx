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
  Filter,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { realDataService } from '@/lib/realDataService';

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
  const { toast } = useToast();
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

  // Initialize with real data from APIs
  useEffect(() => {
    const loadRealWatchlistData = async () => {
      setIsLoading(true);
      try {
        // Get real market data
        const [cryptoData, forexData] = await Promise.allSettled([
          realDataService.getCryptoPrices(),
          realDataService.getForexRates()
        ]);

        const realWatchlists: WatchlistGroup[] = [];

        // Crypto watchlist with real data
        if (cryptoData.status === 'fulfilled' && cryptoData.value.length > 0) {
          const cryptoItems: WatchlistItem[] = cryptoData.value.slice(0, 5).map((crypto: any) => ({
            id: crypto.id || crypto.symbol,
            symbol: crypto.symbol?.toUpperCase() || 'UNKNOWN',
            name: crypto.name || crypto.symbol?.toUpperCase() || 'Unknown',
            price: crypto.current_price || 0,
            change: crypto.price_change_24h || 0,
            changePercent: crypto.price_change_percentage_24h || 0,
            high24h: crypto.high_24h || crypto.current_price || 0,
            low24h: crypto.low_24h || crypto.current_price || 0,
            volume: crypto.total_volume || 0,
            marketCap: crypto.market_cap || 0,
            category: 'crypto' as const,
            isFavorite: false,
            hasAlert: false
          }));

          realWatchlists.push({
            id: 'crypto',
            name: 'Cryptocurrencies',
            color: 'bg-orange-500',
            items: cryptoItems
          });
        }

        // Forex watchlist with real data
        if (forexData.status === 'fulfilled' && forexData.value.length > 0) {
          const forexItems: WatchlistItem[] = forexData.value.slice(0, 5).map((forex: any) => ({
            id: `${forex.base}-${forex.target}`,
            symbol: `${forex.base}/${forex.target}`,
            name: `${forex.base}/${forex.target}`,
            price: forex.rate || 0,
            change: forex.change_24h || 0,
            changePercent: forex.change_24h ? (forex.change_24h / forex.rate) * 100 : 0,
            high24h: forex.rate || 0,
            low24h: forex.rate || 0,
            volume: 0, // Not available in forex rate data
            category: 'forex' as const,
            isFavorite: false,
            hasAlert: false
          }));

          realWatchlists.push({
            id: 'forex',
            name: 'Forex Pairs',
            color: 'bg-blue-500',
            items: forexItems
          });
        }

        // If no real data available, show empty watchlists
        if (realWatchlists.length === 0) {
          realWatchlists.push(
            {
              id: 'crypto',
              name: 'Cryptocurrencies',
              color: 'bg-orange-500',
              items: []
            },
            {
              id: 'forex',
              name: 'Forex Pairs',
              color: 'bg-blue-500',
              items: []
            },
            {
              id: 'stocks',
              name: 'US Stocks',
              color: 'bg-green-500',
              items: []
            }
          );
        }

        setWatchlists(realWatchlists);
      } catch (error) {
        console.error('Failed to load real watchlist data:', error);
        // Set empty watchlists if real data fails
        setWatchlists([
          {
            id: 'crypto',
            name: 'Cryptocurrencies',
            color: 'bg-orange-500',
            items: []
          },
          {
            id: 'forex',
            name: 'Forex Pairs',
            color: 'bg-blue-500',
            items: []
          },
          {
            id: 'stocks',
            name: 'US Stocks',
            color: 'bg-green-500',
            items: []
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealWatchlistData();
  }, []);

  const getCurrentWatchlist = () => {
    return watchlists.find(w => w.id === activeWatchlist) || watchlists[0];
  };

  const addToWatchlist = async (symbol: string, category: 'crypto' | 'forex' | 'stocks' | 'commodities') => {
    if (!symbol.trim()) {
      toast({ title: "Error", description: "Please enter a symbol", variant: "destructive" });
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
      toast({ title: "Error", description: "Symbol already in watchlist", variant: "destructive" });
      return;
    }

    // Try to get real data for the symbol
    try {
      let realData: any = null;
      
      if (category === 'crypto') {
        const cryptoData = await realDataService.getCryptoPrices();
        realData = cryptoData.find((crypto: any) => 
          crypto.symbol?.toLowerCase() === symbol.toLowerCase()
        );
      } else if (category === 'forex') {
        const forexData = await realDataService.getForexRates();
        realData = forexData.find((forex: any) => 
          `${forex.base}/${forex.target}`.toLowerCase() === symbol.toLowerCase()
        );
      }

      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        name: realData?.name || symbol.toUpperCase(),
        price: realData?.current_price || realData?.rate || 0,
        change: realData?.price_change_24h || realData?.change_24h || 0,
        changePercent: realData?.price_change_percentage_24h || 
          (realData?.change_24h && realData?.rate ? (realData.change_24h / realData.rate) * 100 : 0),
        high24h: realData?.current_price || realData?.rate || 0, // Use current price as fallback
        low24h: realData?.current_price || realData?.rate || 0, // Use current price as fallback
        volume: realData?.volume_24h || 0,
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
      toast({ title: "Success", description: `${symbol.toUpperCase()} added to watchlist` });
    } catch (error) {
      console.error('Failed to get real data for symbol:', error);
      toast({ title: "Error", description: "Failed to add symbol. Please try again.", variant: "destructive" });
    }
  };

  const removeFromWatchlist = (symbolId: string) => {
    setWatchlists(prev =>
      prev.map(w => ({
        ...w,
        items: w.items.filter(item => item.id !== symbolId)
      }))
    );
    toast({ title: "Success", description: "Symbol removed from watchlist" });
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
    toast({ title: "Success", description: "Price alert set successfully" });
  };

  const refreshPrices = async () => {
    setIsLoading(true);
    try {
      // Get fresh real data
      const [cryptoData, forexData] = await Promise.allSettled([
        realDataService.getCryptoPrices(),
        realDataService.getForexRates()
      ]);

      setWatchlists(prev =>
        prev.map(w => ({
          ...w,
          items: w.items.map(item => {
            let updatedItem = { ...item };
            
            if (item.category === 'crypto' && cryptoData.status === 'fulfilled') {
              const realCrypto = cryptoData.value.find((crypto: any) => 
                crypto.symbol?.toLowerCase() === item.symbol.toLowerCase()
              );
              if (realCrypto) {
                updatedItem = {
                  ...item,
                  price: realCrypto.current_price || item.price,
                  change: realCrypto.price_change_24h || item.change,
                  changePercent: realCrypto.price_change_percentage_24h || item.changePercent,
                  high24h: realCrypto.current_price || item.high24h, // Use current price as fallback
                  low24h: realCrypto.current_price || item.low24h, // Use current price as fallback
                  volume: realCrypto.volume_24h || item.volume
                };
              }
            } else if (item.category === 'forex' && forexData.status === 'fulfilled') {
              const realForex = forexData.value.find((forex: any) => 
                `${forex.base}/${forex.target}` === item.symbol
              );
              if (realForex) {
                updatedItem = {
                  ...item,
                  price: realForex.rate || item.price,
                  change: realForex.change_24h || item.change,
                  changePercent: realForex.change_24h ? (realForex.change_24h / realForex.rate) * 100 : item.changePercent,
                  high24h: realForex.rate || item.high24h,
                  low24h: realForex.rate || item.low24h
                };
              }
            }
            
            return updatedItem;
          })
        }))
      );
      
      toast({ title: "Success", description: "Prices updated with real data" });
    } catch (error) {
      console.error('Failed to refresh prices:', error);
      toast({ title: "Error", description: "Failed to update prices. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
                          <Trash2 className="w-4 h-4" />
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