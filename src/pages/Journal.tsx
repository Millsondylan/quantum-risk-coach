import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Plus, Search, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/utils';

const Journal = () => {
  const navigate = useNavigate();
  const { trades, addTrade, updateTrade, deleteTrade, loading } = useTrades();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [newEntry, setNewEntry] = useState({
    instrument: '',
    trade_type: 'buy',
    entry_price: '',
    exit_price: '',
    lot_size: '',
    profit_loss: '',
    stop_loss: '',
    take_profit: '',
    status: 'closed',
    source: 'manual'
  });

  const handleCreateEntry = async () => {
    if (!newEntry.instrument || !newEntry.entry_price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await addTrade({
        instrument: newEntry.instrument,
        trade_type: newEntry.trade_type as 'buy' | 'sell',
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        lot_size: newEntry.lot_size ? parseFloat(newEntry.lot_size) : null,
        profit_loss: newEntry.profit_loss ? parseFloat(newEntry.profit_loss) : null,
        stop_loss: newEntry.stop_loss ? parseFloat(newEntry.stop_loss) : null,
        take_profit: newEntry.take_profit ? parseFloat(newEntry.take_profit) : null,
        status: newEntry.status as 'open' | 'closed',
        source: newEntry.source,
        opened_at: new Date().toISOString(),
        closed_at: newEntry.status === 'closed' ? new Date().toISOString() : null,
        mt5_ticket_id: null,
      });

      toast.success('Trade added successfully!');
      setShowNewEntry(false);
      setNewEntry({
        instrument: '',
        trade_type: 'buy',
        entry_price: '',
        exit_price: '',
        lot_size: '',
        profit_loss: '',
        stop_loss: '',
        take_profit: '',
        status: 'closed',
        source: 'manual'
      });
    } catch (error) {
      toast.error('Failed to add trade');
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        await deleteTrade(tradeId);
        toast.success('Trade deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete trade');
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTradeStatusColor = (status: string | null, profitLoss: number | null) => {
    if (status === 'open') return 'text-yellow-400';
    if (profitLoss && profitLoss > 0) return 'text-green-400';
    if (profitLoss && profitLoss < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getTradeTypeIcon = (tradeType: string | null) => {
    return tradeType === 'buy' ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    );
  };

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.instrument.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'profitable' && (trade.profit_loss || 0) > 0) ||
      (filterBy === 'losses' && (trade.profit_loss || 0) < 0) ||
      (filterBy === 'buy' && trade.trade_type === 'buy') ||
      (filterBy === 'sell' && trade.trade_type === 'sell');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <main className="container mx-auto px-6 py-8">
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
            
            <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
              <DialogTrigger asChild>
                <Button className="holo-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Trade</DialogTitle>
                  <DialogDescription>
                    Document your trade details and analysis
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instrument">Instrument</Label>
                      <Input
                        id="instrument"
                        placeholder="e.g., EURUSD"
                        value={newEntry.instrument}
                        onChange={(e) => setNewEntry({...newEntry, instrument: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trade_type">Type</Label>
                      <Select value={newEntry.trade_type} onValueChange={(value) => setNewEntry({...newEntry, trade_type: value})}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entry_price">Entry Price</Label>
                      <Input
                        id="entry_price"
                        type="number"
                        step="0.00001"
                        placeholder="1.0850"
                        value={newEntry.entry_price}
                        onChange={(e) => setNewEntry({...newEntry, entry_price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exit_price">Exit Price</Label>
                      <Input
                        id="exit_price"
                        type="number"
                        step="0.00001"
                        placeholder="1.0890"
                        value={newEntry.exit_price}
                        onChange={(e) => setNewEntry({...newEntry, exit_price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lot_size">Lot Size</Label>
                      <Input
                        id="lot_size"
                        type="number"
                        step="0.01"
                        placeholder="0.1"
                        value={newEntry.lot_size}
                        onChange={(e) => setNewEntry({...newEntry, lot_size: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit_loss">P&L</Label>
                      <Input
                        id="profit_loss"
                        type="number"
                        step="0.01"
                        placeholder="40.00"
                        value={newEntry.profit_loss}
                        onChange={(e) => setNewEntry({...newEntry, profit_loss: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stop_loss">Stop Loss</Label>
                      <Input
                        id="stop_loss"
                        type="number"
                        step="0.00001"
                        placeholder="1.0800"
                        value={newEntry.stop_loss}
                        onChange={(e) => setNewEntry({...newEntry, stop_loss: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="take_profit">Take Profit</Label>
                      <Input
                        id="take_profit"
                        type="number"
                        step="0.00001"
                        placeholder="1.0900"
                        value={newEntry.take_profit}
                        onChange={(e) => setNewEntry({...newEntry, take_profit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newEntry.status} onValueChange={(value) => setNewEntry({...newEntry, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateEntry} className="w-full holo-button">
                    Add Trade
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                <span className="text-white">Trading Journal</span>
              </CardTitle>
              <CardDescription>Document and analyze your trading journey</CardDescription>
              
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    <SelectItem value="profitable">Profitable</SelectItem>
                    <SelectItem value="losses">Losses</SelectItem>
                    <SelectItem value="buy">Buy Orders</SelectItem>
                    <SelectItem value="sell">Sell Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-20 bg-slate-500/20 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Trades Found</h3>
                  <p className="text-slate-400 mb-6">
                    {trades.length === 0 ? 'Start by adding your first trade' : 'No trades match your search criteria'}
                  </p>
                  {trades.length === 0 && (
                    <Button onClick={() => setShowNewEntry(true)} className="holo-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Trade
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTradeTypeIcon(trade.trade_type)}
                          <div>
                            <p className="font-medium text-white">{trade.instrument}</p>
                            <p className="text-sm text-slate-400">
                              {trade.lot_size ? `${trade.lot_size} lots` : 'N/A'} • {trade.status || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-medium ${getTradeStatusColor(trade.status, trade.profit_loss)}`}>
                            {trade.profit_loss ? formatCurrency(trade.profit_loss) : '--'}
                          </p>
                          <p className="text-sm text-slate-400">
                            {trade.entry_price ? `@${trade.entry_price}` : '--'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-slate-400">
                            {formatDate(trade.opened_at)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {trade.source || 'Manual'}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Journal;
