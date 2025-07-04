import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye,
  EyeOff,
  Bell,
  AlertTriangle,
  Target,
  DollarSign,
  Filter,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { usePortfolios } from '@/contexts/PortfolioContext';
import { useNavigate } from 'react-router-dom';
import { formatPnL, formatPercentage } from '@/lib/pnlCalculator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LivePosition {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  percentage: number;
  entryTime: string;
  stopLoss?: number;
  takeProfit?: number;
  isActive: boolean;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  type: 'above' | 'below';
  isActive: boolean;
  created: string;
}

const LiveTrades = () => {
  const { selectedAccountId } = usePortfolios();
  const { trades, addTrade } = useTrades(selectedAccountId || '');
  const [isLive, setIsLive] = useState(true);
  const [positions, setPositions] = useState<LivePosition[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState('positions');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pricesVisible, setPricesVisible] = useState(true);
  const navigate = useNavigate();
  
  // New alert form
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    type: 'above' as 'above' | 'below'
  });

  // Mock market data - REMOVED
  const [marketData, setMarketData] = useState({});

  // Initialize with some sample positions
  useEffect(() => {
    try {
      setError(null);
      // Get positions from real trades
      const activePositions = trades
        .filter(trade => trade.status === 'open')
        .map((trade, index) => ({
          id: trade.id || index.toString(),
          symbol: trade.symbol || 'Unknown',
          type: (trade.side as 'buy' | 'sell') || 'buy',
          entryPrice: trade.entryPrice || 0,
          currentPrice: trade.entryPrice || 0, // Will be updated with real prices
          quantity: (trade.quantity || 0) * 100000, // Convert lots to units
          pnl: trade.profitLoss || 0,
          percentage: 0,
          entryTime: trade.entryDate || new Date().toISOString(),
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          isActive: true
        }));
      
      setPositions(activePositions);
    } catch (err) {
      console.error('Error initializing LiveTrades:', err);
      setError('Failed to load trading data');
      setPositions([]);
    }
  }, [trades]);

  // Simulate real-time price updates - REMOVED, will use real market data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const handleClosePosition = async (position: LivePosition) => {
    try {
      // Close position and add to journal
      const tradeData = {
        accountId: selectedAccountId || '',
        symbol: position.symbol,
        side: position.type,
        amount: position.quantity / 100000,
        price: position.entryPrice,
        fee: 0,
        profit: position.pnl,
        status: 'closed' as const,
        entryDate: position.entryTime,
        exitDate: new Date().toISOString(),
        notes: `Closed from live trades. P&L: $${position.pnl.toFixed(2)}`,
      } as any;

      await addTrade(tradeData);
      setPositions(prev => prev.filter(p => p.id !== position.id));
      toast.success(`Position ${position.symbol} closed with P&L: $${position.pnl.toFixed(2)}`);
    } catch (err) {
      console.error('Error closing position:', err);
      toast.error('Failed to close position');
    }
  };

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      targetPrice: parseFloat(newAlert.targetPrice),
      type: newAlert.type,
      isActive: true,
      created: new Date().toISOString()
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', targetPrice: '', type: 'above' });
    toast.success('Price alert created');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alert deleted');
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const openPositions = positions.filter(p => p.isActive).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDuration = (entryDate: string) => {
    const now = new Date();
    const entry = new Date(entryDate);
    const diff = now.getTime() - entry.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Just now';
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Trades</h1>
            <p className="text-slate-400">Monitor your active positions and market alerts</p>
          </div>
        </div>
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Trades</h1>
          <p className="text-sm text-muted-foreground">
            {trades.filter(trade => trade.status === 'open').length} active position{trades.filter(trade => trade.status === 'open').length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPricesVisible(!pricesVisible)}
          >
            {pricesVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/history')}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/add-trade')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Trade List */}
      <Card className="ultra-card">
        <CardContent className="p-0">
          {trades.filter(trade => trade.status === 'open').length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Trades</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start tracking your positions by adding a new trade
              </p>
              <Button onClick={() => navigate('/add-trade')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trade
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {trades.filter(trade => trade.status === 'open').map((trade) => {
                const pnl = trade.profitLoss || 0;
                const pnlPercent = trade.profitLoss && trade.entryPrice ? 
                  (trade.profitLoss / (trade.entryPrice * trade.quantity)) * 100 : 0;

                return (
                  <div key={trade.id} className="trade-row">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                          {trade.side === 'buy' ? (
                            <TrendingUp className="h-5 w-5 text-profit" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-loss" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{trade.symbol}</span>
                            <Badge 
                              variant={trade.side === 'buy' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {trade.side.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                            <span>Entry: {pricesVisible ? trade.entryPrice.toFixed(4) : '••••'}</span>
                            <span>Qty: {trade.quantity}</span>
                            <span>{formatDuration(trade.entryDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={pnl >= 0 ? "trade-profit" : "trade-loss"}>
                          {pricesVisible ? formatPnL(pnl) : '••••'}
                        </div>
                        <div className={`text-xs flex items-center justify-end ${
                          pnlPercent >= 0 ? "text-profit" : "text-loss"
                        }`}>
                          {pnlPercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(pnlPercent).toFixed(2)}%
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/trade/${trade.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/add-trade?edit=${trade.id}`)}>
                            Edit Trade
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => console.log('Close trade:', trade.id)}
                          >
                            Close Trade
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {trades.filter(trade => trade.status === 'open').length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="ultra-card">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Positions</div>
              <div className="text-2xl font-bold">{trades.filter(trade => trade.status === 'open').length}</div>
            </CardContent>
          </Card>
          
          <Card className="ultra-card">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total P&L</div>
              <div className={`text-2xl font-bold ${
                trades.filter(trade => trade.status === 'open').reduce((sum, t) => sum + (t.profitLoss || 0), 0) >= 0 
                  ? 'text-profit' : 'text-loss'
              }`}>
                {pricesVisible 
                  ? formatPnL(trades.filter(trade => trade.status === 'open').reduce((sum, t) => sum + (t.profitLoss || 0), 0))
                  : '••••••'
                }
              </div>
            </CardContent>
          </Card>
          
          <Card className="ultra-card">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Winning</div>
              <div className="text-2xl font-bold text-profit">
                {trades.filter(t => (t.profitLoss || 0) > 0).length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="ultra-card">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Losing</div>
              <div className="text-2xl font-bold text-loss">
                {trades.filter(t => (t.profitLoss || 0) < 0).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LiveTrades; 