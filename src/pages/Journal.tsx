import React, { useState, useEffect } from 'react';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { useUser } from '@/contexts/UserContext';
import { realDataService } from '@/lib/realDataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, TrendingUp, Tag, Download, Search, Zap, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';

interface JournalProps {
  defaultTab?: string;
}

const Journal: React.FC<JournalProps> = ({ defaultTab = 'trades' }) => {
  const { user } = useUser();
  const { trades, isLoading, addTrade, updateTrade, deleteTrade, getTradeStats } = useLocalTrades();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  
  // New trade form state
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    entryPrice: 0,
    exitPrice: 0,
    quantity: 1,
    entryDate: new Date().toISOString(),
    exitDate: '',
    notes: '',
    tags: [] as string[],
    strategy: '',
    useCurrentPrice: false,
    currentPrice: 0,
  });

  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [availableSymbols] = useState([
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'BTC/USD', 'ETH/USD', 'XAU/USD', 'XAG/USD'
  ]);

  const stats = getTradeStats();

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Fetch current price for selected symbol
  const fetchCurrentPrice = async (symbol: string) => {
    if (!symbol) return;
    
    setIsLoadingPrice(true);
    try {
      // Try to get price from real data service
      const [cryptoData, forexData] = await Promise.all([
        realDataService.getCryptoPrices(),
        realDataService.getForexRates()
      ]);

      let price = 0;
      
      // Check if it's a crypto pair
      if (symbol.includes('BTC') || symbol.includes('ETH')) {
        const crypto = cryptoData.find(c => c.symbol === symbol.split('/')[0]);
        if (crypto) {
          price = crypto.current_price;
        }
      } else {
        // Check if it's a forex pair
        const base = symbol.split('/')[0];
        const target = symbol.split('/')[1];
        
        if (base === 'USD') {
          const forex = forexData.find(f => f.target === target);
          if (forex) {
            price = forex.rate;
          }
        } else if (target === 'USD') {
          const forex = forexData.find(f => f.target === base);
          if (forex) {
            price = 1 / forex.rate;
          }
        }
      }

      if (price > 0) {
        setNewTrade(prev => ({
          ...prev,
          currentPrice: price,
          entryPrice: newTrade.useCurrentPrice ? price : prev.entryPrice,
          exitPrice: newTrade.useCurrentPrice ? price : prev.exitPrice,
        }));
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Auto-fetch price when symbol changes
  useEffect(() => {
    if (newTrade.symbol) {
      fetchCurrentPrice(newTrade.symbol);
    }
  }, [newTrade.symbol]);

  const handleAddTrade = async () => {
    if (!newTrade.symbol || newTrade.entryPrice <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const tradeData = {
      symbol: newTrade.symbol,
      type: newTrade.type,
      entryPrice: newTrade.entryPrice,
      exitPrice: newTrade.exitPrice > 0 ? newTrade.exitPrice : undefined,
      quantity: newTrade.quantity,
      entryDate: newTrade.entryDate,
      exitDate: newTrade.exitDate || undefined,
      status: newTrade.exitPrice > 0 ? 'closed' as const : 'open' as const,
      notes: newTrade.notes,
      tags: newTrade.tags,
      strategy: newTrade.strategy,
    };

    await addTrade(tradeData);
    
    // Reset form
    setNewTrade({
      symbol: '',
      type: 'buy',
      entryPrice: 0,
      exitPrice: 0,
      quantity: 1,
      entryDate: new Date().toISOString(),
      exitDate: '',
      notes: '',
      tags: [],
      strategy: '',
      useCurrentPrice: false,
      currentPrice: 0,
    });
  };

  const handleUpdateTrade = async (id: string, updates: any) => {
    await updateTrade(id, updates);
  };

  const handleDeleteTrade = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      await deleteTrade(id);
    }
  };

  const handleUseCurrentPrice = (useCurrent: boolean) => {
    setNewTrade(prev => ({
      ...prev,
      useCurrentPrice: useCurrent,
      entryPrice: useCurrent ? prev.currentPrice : prev.entryPrice,
      exitPrice: useCurrent ? prev.currentPrice : prev.exitPrice,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0D]">
        <Header />
        <div className="container mx-auto p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading trades...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0D]">
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
            <p className="text-slate-400">
              Track your trades and analyze your performance
            </p>
          </div>
          <Button onClick={() => setActiveTab('add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.totalProfitLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTrades} closed trades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.winningTrades} wins / {stats.losingTrades} losses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTrades}</div>
              <p className="text-xs text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.averageProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.averageProfitLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="add">Add Trade</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  <SelectItem value="open">Open Trades</SelectItem>
                  <SelectItem value="closed">Closed Trades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trades List */}
            <div className="space-y-4">
              {filteredTrades.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No trades found</p>
                    <Button onClick={() => setActiveTab('add')} className="mt-2">
                      Add your first trade
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredTrades.map((trade) => (
                  <Card key={trade.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{trade.symbol}</h3>
                            <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            <Badge variant={trade.status === 'open' ? 'outline' : 'default'}>
                              {trade.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Entry:</span>
                              <br />
                              ${trade.entryPrice}
                            </div>
                            {trade.exitPrice && (
                              <div>
                                <span className="text-muted-foreground">Exit:</span>
                                <br />
                                ${trade.exitPrice}
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <br />
                              {trade.quantity}
                            </div>
                            {trade.profitLoss !== undefined && (
                              <div>
                                <span className="text-muted-foreground">P&L:</span>
                                <br />
                                <span className={trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  ${trade.profitLoss.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          {trade.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{trade.notes}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {trade.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTrade(trade.id, { status: 'closed' })}
                          >
                            Close
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTrade(trade.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Select value={newTrade.symbol} onValueChange={(value) => setNewTrade({ ...newTrade, symbol: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSymbols.map((symbol) => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newTrade.type} onValueChange={(value: 'buy' | 'sell') => setNewTrade({ ...newTrade, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entryPrice">Entry Price *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="entryPrice"
                        type="number"
                        step="0.0001"
                        placeholder="Enter entry price"
                        value={newTrade.entryPrice || ''}
                        onChange={(e) => setNewTrade({ ...newTrade, entryPrice: parseFloat(e.target.value) || 0 })}
                      />
                      {newTrade.currentPrice > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewTrade({ ...newTrade, entryPrice: newTrade.currentPrice })}
                          className="flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Use Current
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="exitPrice">Exit Price (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="exitPrice"
                        type="number"
                        step="0.0001"
                        placeholder="Enter exit price"
                        value={newTrade.exitPrice || ''}
                        onChange={(e) => setNewTrade({ ...newTrade, exitPrice: parseFloat(e.target.value) || 0 })}
                      />
                      {newTrade.currentPrice > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewTrade({ ...newTrade, exitPrice: newTrade.currentPrice })}
                          className="flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Use Current
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      placeholder="1"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({ ...newTrade, quantity: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Input
                      id="strategy"
                      placeholder="e.g., Breakout, Scalping"
                      value={newTrade.strategy}
                      onChange={(e) => setNewTrade({ ...newTrade, strategy: e.target.value })}
                    />
                  </div>
                </div>

                {/* Current Price Display */}
                {newTrade.symbol && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Current Price for {newTrade.symbol}</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">
                              ${newTrade.currentPrice > 0 ? newTrade.currentPrice.toFixed(4) : 'Loading...'}
                            </span>
                            {isLoadingPrice && <RefreshCw className="h-4 w-4 animate-spin" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newTrade.useCurrentPrice}
                            onCheckedChange={handleUseCurrentPrice}
                          />
                          <Label className="text-sm">Auto-use current price</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Trade notes, analysis, lessons learned..."
                    value={newTrade.notes}
                    onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddTrade} className="w-full">
                  Add Trade
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced analytics and charts will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Export your trading data for analysis in other tools.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Journal;
