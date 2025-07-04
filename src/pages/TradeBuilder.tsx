import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Target, Save, Plus, Trash2, Settings, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';

interface TradeSetup {
  id: string;
  name: string;
  instrument: string;
  tradeType: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskPercentage: number;
  strategy: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

const TradeBuilder = () => {
  const navigate = useNavigate();
  const { addTrade } = useTrades();
  const [setups, setSetups] = useState<TradeSetup[]>([]);
  const [showNewSetup, setShowNewSetup] = useState(false);
  const [newSetup, setNewSetup] = useState({
    name: '',
    instrument: '',
    tradeType: 'buy' as 'buy' | 'sell',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    lotSize: '',
    riskPercentage: '',
    strategy: '',
    notes: ''
  });

  const handleCreateSetup = () => {
    if (!newSetup.name || !newSetup.instrument || !newSetup.entryPrice) {
      toast.error('Please fill in required fields');
      return;
    }

    const setup: TradeSetup = {
      id: Date.now().toString(),
      name: newSetup.name,
      instrument: newSetup.instrument,
      tradeType: newSetup.tradeType,
      entryPrice: parseFloat(newSetup.entryPrice),
      stopLoss: parseFloat(newSetup.stopLoss) || 0,
      takeProfit: parseFloat(newSetup.takeProfit) || 0,
      lotSize: parseFloat(newSetup.lotSize) || 0.1,
      riskPercentage: parseFloat(newSetup.riskPercentage) || 2,
      strategy: newSetup.strategy,
      notes: newSetup.notes,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setSetups([...setups, setup]);
    setShowNewSetup(false);
    setNewSetup({
      name: '',
      instrument: '',
      tradeType: 'buy',
      entryPrice: '',
      stopLoss: '',
      takeProfit: '',
      lotSize: '',
      riskPercentage: '',
      strategy: '',
      notes: ''
    });
    toast.success('Trade setup created successfully!');
  };

  const handleExecuteTrade = async (setup: TradeSetup) => {
    try {
      await addTrade({
        id: crypto.randomUUID(),
        symbol: setup.instrument,
        type: setup.tradeType === 'buy' ? 'long' : 'short',
        side: setup.tradeType,
        quantity: setup.lotSize,
        entryPrice: setup.entryPrice,
        price: setup.entryPrice,
        exitPrice: null,
        stopLoss: setup.stopLoss || null,
        takeProfit: setup.takeProfit || null,
        pnl: null,
        profit: null,
        profitLoss: null,
        status: 'open',
        entryTime: new Date().toISOString(),
        exitTime: null,
        entryDate: new Date().toISOString(),
        exitDate: null,
        updatedAt: new Date().toISOString()
      });

      toast.success('Trade executed successfully!');
      navigate('/journal');
    } catch (error) {
      toast.error('Failed to execute trade');
    }
  };

  const handleDeleteSetup = (id: string) => {
    setSetups(setups.filter(setup => setup.id !== id));
    toast.success('Setup deleted successfully!');
  };

  const calculateRiskReward = (entry: number, stop: number, target: number) => {
    if (!stop || !target) return 'N/A';
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    return (reward / risk).toFixed(2);
  };

  return (
    <div data-testid="page-container" className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <main data-testid="main-content" className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => setShowNewSetup(true)}
              className="holo-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Setup
            </Button>
          </div>

          <div className="grid gap-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Trade Builder</span>
                </CardTitle>
                <CardDescription>
                  Create and manage custom trade setups with predefined parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {setups.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Trade Setups</h3>
                    <p className="text-slate-400 mb-6">
                      Create your first trade setup to streamline your trading process
                    </p>
                    <Button onClick={() => setShowNewSetup(true)} className="holo-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Setup
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {setups.map((setup) => (
                      <div key={setup.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{setup.name}</h3>
                            <p className="text-slate-400">{setup.instrument} • {setup.tradeType.toUpperCase()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleExecuteTrade(setup)}
                              className="holo-button"
                              size="sm"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Execute
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSetup(setup.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Entry Price</p>
                            <p className="text-white font-medium">{setup.entryPrice}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Stop Loss</p>
                            <p className="text-red-400 font-medium">{setup.stopLoss || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Take Profit</p>
                            <p className="text-green-400 font-medium">{setup.takeProfit || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Risk/Reward</p>
                            <p className="text-white font-medium">
                              {calculateRiskReward(setup.entryPrice, setup.stopLoss, setup.takeProfit)}
                            </p>
                          </div>
                        </div>
                        
                        {setup.notes && (
                          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                            <p className="text-slate-300 text-sm">{setup.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Setup Dialog */}
          {showNewSetup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-white mb-4">Create Trade Setup</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Setup Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., EURUSD London Breakout"
                      value={newSetup.name}
                      onChange={(e) => setNewSetup({...newSetup, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instrument">Instrument *</Label>
                      <Input
                        id="instrument"
                        placeholder="EURUSD"
                        value={newSetup.instrument}
                        onChange={(e) => setNewSetup({...newSetup, instrument: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradeType">Type</Label>
                      <Select value={newSetup.tradeType} onValueChange={(value: 'buy' | 'sell') => setNewSetup({...newSetup, tradeType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="entryPrice">Entry Price *</Label>
                      <Input
                        id="entryPrice"
                        type="number"
                        step="0.00001"
                        placeholder="Enter price"
                        value={newSetup.entryPrice}
                        onChange={(e) => setNewSetup({...newSetup, entryPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stopLoss">Stop Loss</Label>
                      <Input
                        id="stopLoss"
                        type="number"
                        step="0.00001"
                        placeholder="Stop loss price"
                        value={newSetup.stopLoss}
                        onChange={(e) => setNewSetup({...newSetup, stopLoss: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="takeProfit">Take Profit</Label>
                      <Input
                        id="takeProfit"
                        type="number"
                        step="0.00001"
                        placeholder="Take profit price"
                        value={newSetup.takeProfit}
                        onChange={(e) => setNewSetup({...newSetup, takeProfit: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lotSize">Lot Size</Label>
                      <Input
                        id="lotSize"
                        type="number"
                        step="0.01"
                        placeholder="0.1"
                        value={newSetup.lotSize}
                        onChange={(e) => setNewSetup({...newSetup, lotSize: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="riskPercentage">Risk %</Label>
                      <Input
                        id="riskPercentage"
                        type="number"
                        step="0.1"
                        placeholder="2"
                        value={newSetup.riskPercentage}
                        onChange={(e) => setNewSetup({...newSetup, riskPercentage: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select value={newSetup.strategy} onValueChange={(value) => setNewSetup({...newSetup, strategy: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="trend_following">Trend Following</SelectItem>
                        <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                        <SelectItem value="scalping">Scalping</SelectItem>
                        <SelectItem value="news_trading">News Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this setup..."
                      value={newSetup.notes}
                      onChange={(e) => setNewSetup({...newSetup, notes: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewSetup(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSetup} className="holo-button">
                    <Save className="w-4 h-4 mr-2" />
                    Create Setup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TradeBuilder; 