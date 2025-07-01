import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Play, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart,
  DollarSign,
  Activity
} from 'lucide-react';
import { paperTradingService, PaperTrade } from '../lib/api';
import { ResponsiveContainer, BarChart as RechartsBarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PaperTrading() {
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    entryPrice: 0,
    lotSize: 0
  });

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'GOOGL'];

  useEffect(() => {
    // Load saved paper trades from localStorage
    const savedTrades = localStorage.getItem('paperTrades');
    if (savedTrades) {
      setPaperTrades(JSON.parse(savedTrades));
    }

    // Initialize with placeholder data instead of mock prices
    const placeholderPrices = symbols.reduce((acc, symbol) => {
      acc[symbol] = 1.0850; // Static placeholder price
      return acc;
    }, {} as Record<string, number>);
    
    setCurrentPrices(placeholderPrices);
  }, [symbols]);

  const updatePrices = () => {
    // Disabled live price updates - using static placeholder data
    setCurrentPrices(prev => ({ ...prev }));
  };

  const handleCreateTrade = async () => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.lotSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const trade = await paperTradingService.openPaperTrade(newTrade);
      const updatedTrades = [...paperTrades, trade];
      setPaperTrades(updatedTrades);
      localStorage.setItem('paperTrades', JSON.stringify(updatedTrades));
      
      // Reset form
      setNewTrade({
        symbol: '',
        type: 'buy',
        entryPrice: 0,
        lotSize: 0
      });
      
      toast.success('Paper trade opened successfully!');
    } catch (error) {
      console.error('Error opening paper trade:', error);
      toast.error('Failed to open paper trade');
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    try {
      const trade = paperTrades.find(t => t.id === tradeId);
      if (!trade) return;

      const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;
      const closedTrade = await paperTradingService.closePaperTrade(tradeId, currentPrice);
      const updatedTrades = paperTrades.map(t =>
        t.id === tradeId ? closedTrade : t
      );
      setPaperTrades(updatedTrades);
      localStorage.setItem('paperTrades', JSON.stringify(updatedTrades));
      
      toast.success('Paper trade closed successfully!');
    } catch (error) {
      console.error('Error closing paper trade:', error);
      toast.error('Failed to close paper trade');
    }
  };

  const refreshPrices = () => {
    setLoading(true);
    updatePrices();
    setTimeout(() => setLoading(false), 1000);
  };

  const getUnrealizedPnL = (trade: PaperTrade) => {
    if (trade.status === 'closed') return trade.profitLoss || 0;
    
    const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;
    const priceDiff = trade.type === 'buy' 
      ? currentPrice - trade.entryPrice
      : trade.entryPrice - currentPrice;
    
    return priceDiff * trade.lotSize * 100000; // Standard lot calculation
  };

  const getTotalPnL = () => {
    return paperTrades.reduce((total, trade) => {
      return total + getUnrealizedPnL(trade);
    }, 0);
  };

  const getOpenTrades = () => paperTrades.filter(trade => trade.status === 'open');
  const getClosedTrades = () => paperTrades.filter(trade => trade.status === 'closed');

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const renderTradeCard = (trade: PaperTrade) => {
    const unrealizedPnL = getUnrealizedPnL(trade);
    const isProfitable = unrealizedPnL > 0;
    
    return (
      <Card key={trade.id} className="holo-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {trade.type === 'buy' ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="font-medium text-white">{trade.symbol}</span>
              <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                {trade.type.toUpperCase()}
              </Badge>
            </div>
            <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
              {trade.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-sm text-slate-400">Entry Price</p>
              <p className="font-medium text-white">{trade.entryPrice.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Lot Size</p>
              <p className="font-medium text-white">{trade.lotSize}</p>
            </div>
            {trade.status === 'closed' && trade.exitPrice && (
              <div>
                <p className="text-sm text-slate-400">Exit Price</p>
                <p className="font-medium text-white">{trade.exitPrice.toFixed(5)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-400">
                {trade.status === 'open' ? 'Unrealized P&L' : 'Realized P&L'}
              </p>
              <p className={`font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                ${unrealizedPnL.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Opened: {new Date(trade.openedAt).toLocaleDateString()}</span>
            {trade.status === 'open' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCloseTrade(trade.id)}
                className="text-xs"
              >
                Close Trade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceChart = () => {
    const chartData = paperTrades.map((trade, index) => ({
      trade: index + 1,
      pnl: getUnrealizedPnL(trade),
      cumulative: paperTrades
        .slice(0, index + 1)
        .reduce((sum, t) => sum + getUnrealizedPnL(t), 0)
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trade-by-Trade P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" fill="#3b82f6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trade" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Paper Trading
          </CardTitle>
          <CardDescription>
            <p className="text-slate-400">Risk-free trading simulation for strategy testing</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trades" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trades">Active Trades</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="trades" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Paper Trading Dashboard</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={refreshPrices} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Prices
                  </Button>
                  <Button onClick={() => setIsCreatingTrade(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                        <p className={`text-2xl font-bold ${getTotalPnL() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${getTotalPnL().toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-4 h-4 text-gray-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Open Trades</p>
                        <p className="text-2xl font-bold">{getOpenTrades().length}</p>
                      </div>
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {getClosedTrades().length > 0 
                            ? `${(getClosedTrades().filter(t => (t.profitLoss || 0) > 0).length / getClosedTrades().length * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </p>
                      </div>
                      <BarChart className="w-4 h-4 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                        <p className="text-2xl font-bold">{paperTrades.length}</p>
                      </div>
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Trades */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Active Trades</h4>
                {getOpenTrades().length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No active trades</p>
                        <p className="text-sm text-gray-400">Open your first paper trade to get started</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getOpenTrades().map(renderTradeCard)}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <h4 className="text-lg font-semibold">Trade History</h4>
              {getClosedTrades().length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <BarChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">No closed trades</p>
                      <p className="text-sm text-gray-400">Close some trades to see your history</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getClosedTrades().map(renderTradeCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <h4 className="text-lg font-semibold">Performance Analytics</h4>
              {paperTrades.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <BarChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">No performance data</p>
                      <p className="text-sm text-gray-400">Complete some trades to see analytics</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                renderPerformanceChart()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Trade Modal */}
      {isCreatingTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Open New Paper Trade</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="EURUSD"
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newTrade.type} onValueChange={(value: 'buy' | 'sell') => setNewTrade({...newTrade, type: value})}>
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
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  value={newTrade.lotSize}
                  onChange={(e) => setNewTrade({...newTrade, lotSize: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.00001"
                  placeholder="1.0850"
                  value={newTrade.entryPrice}
                  onChange={(e) => setNewTrade({...newTrade, entryPrice: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreatingTrade(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTrade} className="holo-button">
                <Target className="w-4 h-4 mr-2" />
                Open Trade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 