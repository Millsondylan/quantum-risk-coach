
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Plus, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Journal = () => {
  const navigate = useNavigate();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [newEntry, setNewEntry] = useState({
    symbol: '',
    type: 'buy',
    entry: '',
    exit: '',
    quantity: '',
    pnl: '',
    notes: ''
  });

  const handleCreateEntry = () => {
    // Simulate creating entry
    toast.success('Journal entry created successfully!');
    setShowNewEntry(false);
    setNewEntry({
      symbol: '',
      type: 'buy',
      entry: '',
      exit: '',
      quantity: '',
      pnl: '',
      notes: ''
    });
  };

  const sampleEntries = [
    {
      id: 1,
      date: '2024-01-15',
      symbol: 'EURUSD',
      type: 'buy',
      entry: 1.0850,
      exit: 1.0890,
      quantity: 10000,
      pnl: 40,
      notes: 'Strong bullish momentum, good entry at support level'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
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
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Journal Entry</DialogTitle>
                  <DialogDescription>
                    Document your trade details and analysis
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., EURUSD"
                        value={newEntry.symbol}
                        onChange={(e) => setNewEntry({...newEntry, symbol: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={newEntry.type} onValueChange={(value) => setNewEntry({...newEntry, type: value})}>
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
                      <Label htmlFor="entry">Entry Price</Label>
                      <Input
                        id="entry"
                        type="number"
                        step="0.00001"
                        value={newEntry.entry}
                        onChange={(e) => setNewEntry({...newEntry, entry: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exit">Exit Price</Label>
                      <Input
                        id="exit"
                        type="number"
                        step="0.00001"
                        value={newEntry.exit}
                        onChange={(e) => setNewEntry({...newEntry, exit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newEntry.quantity}
                        onChange={(e) => setNewEntry({...newEntry, quantity: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pnl">P&L</Label>
                      <Input
                        id="pnl"
                        type="number"
                        step="0.01"
                        value={newEntry.pnl}
                        onChange={(e) => setNewEntry({...newEntry, pnl: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Trade analysis, market conditions, lessons learned..."
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleCreateEntry} className="w-full holo-button">
                    Create Entry
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
                    placeholder="Search entries..."
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
              {sampleEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Journal Entries</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Start documenting your trades to build a comprehensive trading history and receive AI-powered insights.
                  </p>
                  <Button onClick={() => setShowNewEntry(true)} className="holo-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sampleEntries.map((entry) => (
                    <Card key={entry.id} className="bg-slate-800/50 border border-slate-600/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${entry.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              {entry.type === 'buy' ? 
                                <TrendingUp className="w-4 h-4 text-green-400" /> : 
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              }
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{entry.symbol}</h4>
                              <p className="text-sm text-slate-400">{entry.date}</p>
                            </div>
                          </div>
                          <div className={`text-right ${entry.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <p className="font-semibold">{entry.pnl >= 0 ? '+' : ''}${entry.pnl}</p>
                            <p className="text-sm text-slate-400">{entry.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Entry</p>
                            <p className="text-white font-medium">{entry.entry}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Exit</p>
                            <p className="text-white font-medium">{entry.exit}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Quantity</p>
                            <p className="text-white font-medium">{entry.quantity.toLocaleString()}</p>
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                            <p className="text-slate-300 text-sm">{entry.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
