import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  List,
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  LineChart,
  Zap,
  Smile,
  Search,
  Star,
  StarOff,
  Edit2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Bitcoin
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { realDataService } from '@/lib/realDataService';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CurrencyPair {
  symbol: string;
  flag1: string;
  flag2: string;
  price: number;
  change: number;
  changePercent: number;
  history?: Array<{ date: string; price: number }>;
}

interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
  isDefault: boolean;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  timestamp: number;
}

export const WatchlistManager: React.FC = () => {
  const { user, updatePreferences } = useUser();

  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([
    { symbol: 'GBPUSD', flag1: '🇬🇧', flag2: '🇺🇸', price: 1.3628, change: -0.0109, changePercent: -0.86, history: [] },
    { symbol: 'USDCAD', flag1: '🇺🇸', flag2: '🇨🇦', price: 1.3584, change: -0.0054, changePercent: -0.40, history: [] },
    { symbol: 'EURUSD', flag1: '🇪🇺', flag2: '🇺🇸', price: 1.1797, change: -0.0005, changePercent: -0.04, history: [] },
    { symbol: 'USDCHF', flag1: '🇺🇸', flag2: '🇨🇭', price: 0.79162, change: -0.0002, changePercent: -0.02, history: [] },
    { symbol: 'USDJPY', flag1: '🇺🇸', flag2: '🇯🇵', price: 143.6640, change: 0.0009, changePercent: 0.06, history: [] },
    { symbol: 'AUDUSD', flag1: '🇦🇺', flag2: '🇺🇸', price: 0.65867, change: 0.0000, changePercent: 0.00, history: [] }
  ]);
  const [watchlistGroups, setWatchlistGroups] = useState<WatchlistGroup[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('default');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSymbols, setNewGroupSymbols] = useState('');
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupSymbols, setEditGroupSymbols] = useState('');
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [editingGroup, setEditingGroup] = useState<WatchlistGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Load watchlist groups from user preferences
  useEffect(() => {
    if (user?.preferences?.watchlistGroups) {
      setWatchlistGroups(user.preferences.watchlistGroups);
    } else {
      // Create default groups
      const defaultGroups: WatchlistGroup[] = [
        {
          id: 'default',
          name: 'My Watchlist',
          symbols: ['EUR/USD', 'GBP/USD', 'BTC/USD', 'ETH/USD'],
          isDefault: true
        },
        {
          id: 'forex',
          name: 'Forex',
          symbols: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
          isDefault: false
        },
        {
          id: 'crypto',
          name: 'Crypto',
          symbols: ['BTC/USD', 'ETH/USD', 'BNB/USD', 'SOL/USD'],
          isDefault: false
        }
      ];
      setWatchlistGroups(defaultGroups);
    }
  }, [user]);

  // Fetch market data for active watchlist
  useEffect(() => {
    const activeGroup = watchlistGroups.find(g => g.id === activeWatchlistId);
    if (activeGroup && activeGroup.symbols.length > 0) {
      fetchMarketData(activeGroup.symbols);
      
      // Set up interval for real-time updates
      const interval = setInterval(() => {
        fetchMarketData(activeGroup.symbols);
      }, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeWatchlistId, watchlistGroups]);

  const fetchMarketData = async (symbols: string[]) => {
    setLoading(true);
    try {
      const newMarketData = new Map<string, MarketData>();
      
      // Fetch forex rates
      const forexSymbols = symbols.filter(s => s.includes('/'));
      if (forexSymbols.length > 0) {
        try {
          const forexRates = await realDataService.getForexRates();
          forexSymbols.forEach(symbol => {
            const [base, target] = symbol.split('/');
            const rate = forexRates.find(r => 
              (r.base === base && r.target === target) ||
              (r.base === target && r.target === base)
            );
            
            if (rate) {
              newMarketData.set(symbol, {
                symbol,
                price: rate.rate,
                change: rate.change_24h || 0,
                changePercent: rate.change_24h ? (rate.change_24h / rate.rate) * 100 : 0,
                timestamp: rate.timestamp
              });
            }
          });
        } catch (error) {
          console.error('Error fetching forex data:', error);
        }
      }
      
      // Fetch crypto prices
      const cryptoSymbols = symbols.filter(s => 
        ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT', 'MATIC'].some(crypto => s.includes(crypto))
      );
      if (cryptoSymbols.length > 0) {
        try {
          const cryptoPrices = await realDataService.getCryptoPrices();
          cryptoSymbols.forEach(symbol => {
            const base = symbol.split('/')[0];
            const crypto = cryptoPrices.find(c => c.symbol === base);
            
            if (crypto) {
              newMarketData.set(symbol, {
                symbol,
                price: crypto.current_price,
                change: crypto.price_change_24h,
                changePercent: crypto.price_change_percentage_24h,
                volume: crypto.volume_24h,
                timestamp: new Date(crypto.last_updated).getTime()
              });
            }
          });
        } catch (error) {
          console.error('Error fetching crypto data:', error);
        }
      }
      
      setMarketData(newMarketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const saveWatchlistGroups = async (groups: WatchlistGroup[]) => {
    try {
      await updatePreferences({ watchlistGroups: groups });
      setWatchlistGroups(groups);
    } catch (error) {
      console.error('Failed to save watchlist groups:', error);
      toast.error('Failed to save watchlist');
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim() || !newGroupSymbols.trim()) {
      toast.error('Please enter a group name and at least one symbol.');
      return;
    }
    const symbolsArray = newGroupSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    const newGroup: WatchlistGroup = {
      id: uuidv4(),
      name: newGroupName.trim(),
      symbols: symbolsArray,
      isDefault: false,
    };
    saveWatchlistGroups([...watchlistGroups, newGroup]);
    setIsAddGroupModalOpen(false);
    setNewGroupName('');
    setNewGroupSymbols('');
  };

  const handleEditGroup = () => {
    if (!editGroupId || !editGroupName.trim() || !editGroupSymbols.trim()) {
      toast.error('Please fill all fields for editing the group.');
      return;
    }
    const symbolsArray = editGroupSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    const updatedGroups = watchlistGroups.map(group => 
      group.id === editGroupId 
        ? { ...group, name: editGroupName.trim(), symbols: symbolsArray } 
        : group
    );
    saveWatchlistGroups(updatedGroups);
    setEditGroupId(null);
    setEditGroupName('');
    setEditGroupSymbols('');
  };

  const handleDeleteGroup = (id: string) => {
    const updatedGroups = watchlistGroups.filter(group => group.id !== id);
    if (updatedGroups.length === 0) {
      toast.error('Cannot delete the last watchlist group.');
      return;
    }
    saveWatchlistGroups(updatedGroups);
    if (activeWatchlistId === id) {
      setActiveWatchlistId('default');
    }
    toast.info('Watchlist group deleted.');
  };

  const activeWatchlist = useMemo(() => {
    return watchlistGroups.find(group => group.id === activeWatchlistId);
  }, [watchlistGroups, activeWatchlistId]);

  const filteredCurrencyPairs = useMemo(() => {
    if (!activeWatchlist) return [];
    // Filter currencyPairs based on symbols in the activeWatchlist
    const filtered = currencyPairs.filter(pair => activeWatchlist.symbols.includes(pair.symbol));
    
    // Sort by symbol for consistent display
    return filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [currencyPairs, activeWatchlist]);

  // Dummy logic for sentiment and volatility for display purposes
  const getSentimentAndVolatility = (symbol: string) => {
    const random = Math.random();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (random < 0.3) sentiment = 'positive';
    else if (random > 0.7) sentiment = 'negative';

    let volatility: 'low' | 'medium' | 'high' = 'medium';
    if (random < 0.2) volatility = 'low';
    else if (random > 0.8) volatility = 'high';

    return { sentiment, volatility };
  };

  const handleAddSymbol = async () => {
    if (!newSymbol.trim()) return;
    
    const activeGroup = watchlistGroups.find(g => g.id === activeWatchlistId);
    if (!activeGroup) return;
    
    const symbol = newSymbol.toUpperCase().trim();
    if (activeGroup.symbols.includes(symbol)) {
      toast.warning('Symbol already in watchlist');
      return;
    }
    
    const updatedGroups = watchlistGroups.map(group =>
      group.id === activeWatchlistId
        ? { ...group, symbols: [...group.symbols, symbol] }
        : group
    );
    
    await saveWatchlistGroups(updatedGroups);
    setNewSymbol('');
    setIsAddingSymbol(false);
    toast.success('Symbol added to watchlist');
  };

  const handleRemoveSymbol = async (symbol: string) => {
    const updatedGroups = watchlistGroups.map(group =>
      group.id === activeWatchlistId
        ? { ...group, symbols: group.symbols.filter(s => s !== symbol) }
        : group
    );
    
    await saveWatchlistGroups(updatedGroups);
    toast.success('Symbol removed from watchlist');
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: WatchlistGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      symbols: [],
      isDefault: false
    };
    
    await saveWatchlistGroups([...watchlistGroups, newGroup]);
    setNewGroupName('');
    setIsCreatingGroup(false);
    setActiveWatchlistId(newGroup.id);
    toast.success('Watchlist group created');
  };

  const activeGroup = watchlistGroups.find(g => g.id === activeWatchlistId);
  const filteredSymbols = activeGroup?.symbols.filter(symbol =>
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Watchlist</h2>
          <p className="text-slate-400">Monitor your favorite market instruments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddGroupModalOpen} onOpenChange={setIsAddGroupModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Watchlist Group</DialogTitle>
                <DialogDescription>
                  Organize your instruments into custom watchlists.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="group-name" className="text-right">Group Name</Label>
                  <Input 
                    id="group-name" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)}
                    className="col-span-3"
                    placeholder="My Forex Pairs"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="group-symbols" className="text-right">Symbols (CSV)</Label>
                  <Input 
                    id="group-symbols" 
                    value={newGroupSymbols} 
                    onChange={e => setNewGroupSymbols(e.target.value)}
                    className="col-span-3"
                    placeholder="EURUSD, GBPJPY, XAUUSD"
                  />
                </div>
              </div>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {watchlistGroups.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={activeWatchlistId} onValueChange={setActiveWatchlistId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a watchlist" />
            </SelectTrigger>
            <SelectContent>
              {watchlistGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeWatchlist && activeWatchlist.id !== 'default' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditGroupId(activeWatchlist.id);
                setEditGroupName(activeWatchlist.name);
                setEditGroupSymbols(activeWatchlist.symbols.join(', '));
              }}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          {activeWatchlist && watchlistGroups.length > 1 && (
            <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(activeWatchlist.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )}
        </div>
      )}

      {/* Display Active Watchlist */}
      {activeWatchlist ? (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <span>{activeWatchlist.name}</span>
            </CardTitle>
            <CardDescription>
              {activeWatchlist.symbols.length} instruments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 space-y-4">
              {filteredCurrencyPairs.length > 0 ? (
                filteredCurrencyPairs.map((pair) => {
                  const { sentiment, volatility } = getSentimentAndVolatility(pair.symbol);
                  return (
                    <div 
                      key={pair.symbol} 
                      className="flex items-center justify-between p-4 rounded-lg bg-[#1A1B1E] border border-[#2A2B2E] cursor-pointer hover:bg-[#2A2B2E] transition-colors touch-manipulation active:scale-95"
                      onClick={() => console.log('Open charting tools for', pair.symbol)} // Placeholder
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="text-2xl">{pair.flag1}</span>
                          <span className="text-lg ml-1">{pair.flag2}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{pair.symbol}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                sentiment === 'positive' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 
                                sentiment === 'negative' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                                'text-gray-400 border-gray-500/30 bg-gray-500/10'
                              )}
                            >
                              <Smile className="w-3 h-3 mr-1" /> {sentiment.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                volatility === 'high' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : 
                                volatility === 'medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 
                                'text-blue-400 border-blue-500/30 bg-blue-500/10'
                              )}
                            >
                              <Zap className="w-3 h-3 mr-1" /> {volatility.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-white font-medium">{pair.price.toFixed(4)}</div>
                        <div className={`text-sm ${pair.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                        </div>
                        {/* Sparkline Chart */}
                        {pair.history && pair.history.length > 1 && (
                          <div className="w-20 h-8 mt-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={pair.history}>
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke={pair.changePercent >= 0 ? '#10B981' : '#EF4444'} 
                                  strokeWidth={1}
                                  dot={false}
                                />
                                <Tooltip 
                                  content={({ payload }) => {
                                    if (payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-slate-700/80 p-1.5 rounded-md text-xs text-white">
                                          {data.price.toFixed(4)}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                  cursor={false}
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <List className="w-12 h-12 mx-auto mb-4" />
                  <p>No instruments in this watchlist.</p>
                  <p className="text-sm text-slate-500">Add symbols to this group to track them here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-400 mb-4">No watchlist selected or created yet.</p>
          <Button onClick={() => setIsAddGroupModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Watchlist
          </Button>
        </div>
      )}

      {/* Edit Group Modal */}
      <Dialog open={editGroupId !== null} onOpenChange={() => setEditGroupId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Watchlist Group</DialogTitle>
            <DialogDescription>
              Modify the name and symbols of your watchlist group.
            </DialogDescription>
          </DialogHeader>
          {editGroupId && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-group-name" className="text-right">Group Name</Label>
                <Input 
                  id="edit-group-name" 
                  value={editGroupName} 
                  onChange={e => setEditGroupName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-group-symbols" className="text-right">Symbols (CSV)</Label>
                <Input 
                  id="edit-group-symbols" 
                  value={editGroupSymbols} 
                  onChange={e => setEditGroupSymbols(e.target.value)}
                  className="col-span-3"
                  placeholder="EURUSD, GBPJPY, XAUUSD"
                />
              </div>
            </div>
          )}
          <Button onClick={handleEditGroup}>Save Changes</Button>
        </DialogContent>
      </Dialog>

      <Card className="holo-card h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Watchlist
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchMarketData(activeGroup?.symbols || [])}
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
              <Dialog open={isAddingSymbol} onOpenChange={setIsAddingSymbol}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Symbol</DialogTitle>
                    <DialogDescription>
                      Add a new symbol to your watchlist
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="e.g., EUR/USD, BTC/USD"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <Button onClick={handleAddSymbol} className="w-full">
                      Add to Watchlist
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {/* Watchlist Groups Tabs */}
          <Tabs value={activeWatchlistId} onValueChange={setActiveWatchlistId} className="w-full">
            <div className="px-6 pb-2">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                {watchlistGroups.map(group => (
                  <TabsTrigger key={group.id} value={group.id} className="flex-shrink-0">
                    {group.name}
                  </TabsTrigger>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 ml-2"
                  onClick={() => setIsCreatingGroup(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </TabsList>
            </div>
            
            {/* Search Bar */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  className="pl-10"
                  placeholder="Search symbols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Symbol List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredSymbols.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2" />
                  <p>No symbols in this watchlist</p>
                </div>
              ) : (
                <div className="space-y-1 px-6 pb-4">
                  {filteredSymbols.map(symbol => {
                    const data = marketData.get(symbol);
                    const isPositive = data ? data.changePercent >= 0 : false;
                    
                    return (
                      <div
                        key={symbol}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-800">
                            {symbol.includes('USD') ? (
                              <DollarSign className="w-4 h-4 text-slate-400" />
                            ) : symbol.includes('BTC') || symbol.includes('ETH') ? (
                              <Bitcoin className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Activity className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{symbol}</div>
                            {data && (
                              <div className="text-xs text-slate-400">
                                Vol: {data.volume ? `$${(data.volume / 1000000).toFixed(2)}M` : 'N/A'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {data ? (
                            <>
                              <div className="text-right">
                                <div className="font-medium">
                                  ${data.price.toFixed(data.price < 10 ? 4 : 2)}
                                </div>
                                <div className={cn(
                                  "flex items-center gap-1 text-sm",
                                  isPositive ? "text-green-400" : "text-red-400"
                                )}>
                                  {isPositive ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {Math.abs(data.changePercent).toFixed(2)}%
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveSymbol(symbol)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <div className="text-slate-400 text-sm">Loading...</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Tabs>

          {/* Create Group Dialog */}
          <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Watchlist Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize your watchlist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                />
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}; 