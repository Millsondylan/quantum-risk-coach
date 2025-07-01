import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Play,
  Square,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Activity,
  Zap,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { paperTradingService, PaperTrade } from '../lib/api';
import { toast } from 'sonner';

const symbols = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDCAD', 'CADJPY', 'CHFJPY', 'NZDJPY'
];

export default function PaperTrading() {
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    entryPrice: 0,
    lotSize: 0.1
  });
  const [currentPrices, setCurrentPrices] = useState<{ [symbol: string]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved paper trades from localStorage
    const savedTrades = localStorage.getItem('paperTrades');
    if (savedTrades) {
      setPaperTrades(JSON.parse(savedTrades));
    }

    // Initialize current prices with mock data
    const mockPrices = symbols.reduce((acc, symbol) => {
      acc[symbol] = 1.0850 + Math.random() * 0.1;
      return acc;
    }, {} as { [symbol: string]: number });
    setCurrentPrices(mockPrices);
  }, []);

  const handleCreateTrade = async () => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.lotSize) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const trade = await paperTradingService.openPaperTrade(newTrade);
      const updatedTrades = [...paperTrades, trade];
      setPaperTrades(updatedTrades);
      localStorage.setItem('paperTrades', JSON.stringify(updatedTrades));
      
      toast.success('Paper trade opened successfully');
      setIsCreatingTrade(false);
      setNewTrade({ symbol: '', type: 'buy', entryPrice: 0, lotSize: 0.1 });
    } catch (error) {
      toast.error('Failed to open paper trade');
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    const trade = paperTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;
    
    try {
      const closedTrade = await paperTradingService.closePaperTrade(tradeId, currentPrice);
      const updatedTrades = paperTrades.map(t => 
        t.id === tradeId ? closedTrade : t
      );
      setPaperTrades(updatedTrades);
      localStorage.setItem('paperTrades', JSON.stringify(updatedTrades));
      
      toast.success(`Paper trade closed. P&L: $${closedTrade.profitLoss?.toFixed(2)}`);
    } catch (error) {
      toast.error('Failed to close paper trade');
    }
  };

  const refreshPrices = () => {
    setLoading(true);
    // Simulate price updates
    setTimeout(() => {
      const updatedPrices = { ...currentPrices };
      Object.keys(updatedPrices).forEach(symbol => {
        const change = (Math.random() - 0.5) * 0.002; // ±0.1% change
        updatedPrices[symbol] = Math.max(0.1, updatedPrices[symbol] + change);
      });
      setCurrentPrices(updatedPrices);
      setLoading(false);
      toast.success('Prices refreshed');
    }, 1000);
  };

  const getUnrealizedPnL = (trade: PaperTrade) => {
    if (trade.status === 'closed') return trade.profitLoss || 0;
    
    const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;
    const priceDiff = trade.type === 'buy' 
      ? currentPrice - trade.entryPrice
      : trade.entryPrice - currentPrice;
    
    return priceDiff * 100000 * trade.lotSize; // Standard forex lot calculation
  };

  const getTotalPnL = () => {
    return paperTrades.reduce((total, trade) => {
      if (trade.status === 'closed') {
        return total + (trade.profitLoss || 0);
      } else {
        return total + getUnrealizedPnL(trade);
      }
    }, 0);
  };

  const getOpenTrades = () => paperTrades.filter(trade => trade.status === 'open');
  const getClosedTrades = () => paperTrades.filter(trade => trade.status === 'closed');

  const renderTradeCard = (trade: PaperTrade) => {
    const unrealizedPnL = getUnrealizedPnL(trade);
    const isProfitable = unrealizedPnL > 0;
    const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;

    return (
      <Card key={trade.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">{trade.symbol}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                  {trade.type.toUpperCase()}
                </Badge>
                <Badge variant={trade.status === 'open' ? 'outline' : 'default'}>
                  {trade.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                ${unrealizedPnL.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {trade.status === 'open' ? 'Unrealized' : 'Realized'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Entry Price:</span>
              <div className="font-medium">${trade.entryPrice.toFixed(4)}</div>
            </div>
            <div>
              <span className="text-gray-600">Current Price:</span>
              <div className="font-medium">${currentPrice.toFixed(4)}</div>
            </div>
            <div>
              <span className="text-gray-600">Lot Size:</span>
              <div className="font-medium">{trade.lotSize}</div>
            </div>
            <div>
              <span className="text-gray-600">Opened:</span>
              <div className="font-medium">
                {new Date(trade.openedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {trade.status === 'open' && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => handleCloseTrade(trade.id)}
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Close Trade
              </Button>
            </div>
          )}
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
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" fill="#3b82f6" />
              </BarChart>
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
            Simulated trading with real-time market data for risk-free strategy testing
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
                        <p className="text-2xl font-bold text-blue-600">
                          {getOpenTrades().length}
                        </p>
                      </div>
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Closed Trades</p>
                        <p className="text-2xl font-bold text-gray-600">
                          {getClosedTrades().length}
                        </p>
                      </div>
                      <Target className="w-4 h-4 text-gray-600" />
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
                            ? ((getClosedTrades().filter(t => (t.profitLoss || 0) > 0).length / getClosedTrades().length) * 100).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Trade Modal */}
              {isCreatingTrade && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Open Paper Trade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="symbol">Symbol</Label>
                        <Select 
                          value={newTrade.symbol} 
                          onValueChange={(value) => setNewTrade(prev => ({ ...prev, symbol: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select symbol" />
                          </SelectTrigger>
                          <SelectContent>
                            {symbols.map(symbol => (
                              <SelectItem key={symbol} value={symbol}>
                                {symbol} - ${currentPrices[symbol]?.toFixed(4) || '0.0000'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="type">Trade Type</Label>
                        <Select 
                          value={newTrade.type} 
                          onValueChange={(value: 'buy' | 'sell') => setNewTrade(prev => ({ ...prev, type: value }))}
                        >
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
                        <Label htmlFor="entryPrice">Entry Price</Label>
                        <Input
                          id="entryPrice"
                          type="number"
                          step="0.0001"
                          value={newTrade.entryPrice}
                          onChange={(e) => setNewTrade(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="1.0850"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lotSize">Lot Size</Label>
                        <Input
                          id="lotSize"
                          type="number"
                          step="0.01"
                          value={newTrade.lotSize}
                          onChange={(e) => setNewTrade(prev => ({ ...prev, lotSize: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateTrade} className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Open Trade
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreatingTrade(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Open Trades */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Open Trades</h4>
                {getOpenTrades().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No open paper trades. Create your first trade to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getOpenTrades().map(renderTradeCard)}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <h3 className="text-lg font-semibold">Closed Trades</h3>
              {getClosedTrades().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No closed trades yet. Close some trades to see your history.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getClosedTrades().map(renderTradeCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <h3 className="text-lg font-semibold">Performance Analysis</h3>
              {paperTrades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trades to analyze. Start paper trading to see performance charts.</p>
                </div>
              ) : (
                renderPerformanceChart()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 