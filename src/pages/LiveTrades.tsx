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
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { useTrades } from '@/hooks/useTrades';
import { usePortfolios } from '@/contexts/PortfolioContext';

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
  
  // New alert form
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    type: 'above' as 'above' | 'below'
  });

  // Mock market data - REMOVED
  const [marketData, setMarketData] = useState({});

  // Initialize with some sample positions - REMOVED
  useEffect(() => {
    // Get positions from real trades
    const activePositions = trades
      .filter(trade => trade.status === 'open')
      .map((trade, index) => ({
        id: trade.id || index.toString(),
        symbol: trade.symbol,
        type: trade.type as 'buy' | 'sell',
        entryPrice: trade.entryPrice || 0,
        currentPrice: trade.entryPrice || 0, // Will be updated with real prices
        quantity: (trade.quantity || 0) * 100000, // Convert lots to units
        pnl: 0,
        percentage: 0,
        entryTime: trade.entryDate || new Date().toISOString(),
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        isActive: true
      }));
    
    setPositions(activePositions);
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

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Trades</h1>
            <p className="text-slate-400">Monitor your active positions and market alerts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-slate-400">
                {isLive ? 'Live' : 'Paused'} • Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <Button
              onClick={() => setIsLive(!isLive)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${totalPnL.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Open Positions</p>
                  <p className="text-2xl font-bold text-white">{openPositions}</p>
                </div>
                <Target className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">{alerts.filter(a => a.isActive).length}</p>
                </div>
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Live Positions</TabsTrigger>
            <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <div className="space-y-4">
              {positions.length === 0 ? (
                <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                  <CardContent className="p-8 text-center">
                    <Target className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                    <p className="text-slate-400 mb-6">Your live trading positions will appear here</p>
                    <Button onClick={() => window.location.href = '/trade-builder'}>
                      Open New Position
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                positions.map((position) => (
                  <Card key={position.id} className="bg-[#1A1B1E] border-[#2A2B2E]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{position.symbol}</h3>
                              <Badge variant={position.type === 'buy' ? 'default' : 'secondary'}>
                                {position.type.toUpperCase()}
                              </Badge>
                              {position.pnl >= 0 ? 
                                <TrendingUp className="w-4 h-4 text-green-400" /> : 
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              }
                            </div>
                            <p className="text-sm text-slate-400">
                              Entry: ${position.entryPrice.toFixed(4)} • Current: ${position.currentPrice.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${position.pnl.toFixed(2)}
                          </div>
                          <div className={`text-sm ${position.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.percentage >= 0 ? '+' : ''}{position.percentage.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClosePosition(position)}
                            className="flex items-center gap-1"
                          >
                            <Target className="w-3 h-3" />
                            Close
                          </Button>
                        </div>
                      </div>
                      
                      {(position.stopLoss || position.takeProfit) && (
                        <div className="mt-3 pt-3 border-t border-[#2A2B2E] flex gap-4 text-sm">
                          {position.stopLoss && (
                            <div>
                              <span className="text-slate-400">SL: </span>
                              <span className="text-red-400">${position.stopLoss.toFixed(4)}</span>
                            </div>
                          )}
                          {position.takeProfit && (
                            <div>
                              <span className="text-slate-400">TP: </span>
                              <span className="text-green-400">${position.takeProfit.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
                  <CardContent className="p-8 text-center">
                    <Bell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Price Alerts</h3>
                    <p className="text-slate-400 mb-6">Set price alerts to get notified when your targets are hit</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Card key={alert.id} className="bg-[#1A1B1E] border-[#2A2B2E]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <div>
                            <h3 className="font-semibold">{alert.symbol}</h3>
                            <p className="text-sm text-slate-400">
                              Alert when {alert.type} ${alert.targetPrice}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                            {alert.isActive ? 'Active' : 'Paused'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  </div>
);
};

export default LiveTrades; 