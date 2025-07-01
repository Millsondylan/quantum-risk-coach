import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Plus, Search, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Edit, Trash2, BarChart3, Tag, Download, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '../components/Header';
import TradeJournalCard from '../components/TradeJournalCard';
import SmartJournal from '../components/SmartJournal';
import EnhancedTradingJournal from '../components/EnhancedTradingJournal';

interface JournalProps {
  defaultTab?: string;
}

const Journal: React.FC<JournalProps> = ({ defaultTab = 'view' }) => {
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
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

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

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="mb-4 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Trading Journal</h1>
              <p className="text-slate-400">Track, analyze, and improve your trading performance</p>
            </div>
            <Button className="holo-button">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="view" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">View Journal</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="holo-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Recent Entries
                  </CardTitle>
                  <CardDescription>Your latest trading journal entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <TradeJournalCard />
                </CardContent>
              </Card>

              <Card className="holo-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Smart Journal
                  </CardTitle>
                  <CardDescription>AI-powered journal insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <SmartJournal />
                </CardContent>
              </Card>
            </div>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Enhanced Trading Journal</CardTitle>
                <CardDescription>Comprehensive journal with advanced features</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedTradingJournal />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Journal Entry
                </CardTitle>
                <CardDescription>Create a detailed entry for your latest trade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Trade Type</label>
                      <select className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg">
                        <option>Buy</option>
                        <option>Sell</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Symbol</label>
                      <input 
                        type="text" 
                        placeholder="EUR/USD" 
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Entry Price</label>
                      <input 
                        type="number" 
                        placeholder="1.2345" 
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Exit Price</label>
                      <input 
                        type="number" 
                        placeholder="1.2350" 
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Position Size</label>
                      <input 
                        type="number" 
                        placeholder="1.0" 
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Trade Notes</label>
                    <textarea 
                      placeholder="Describe your trade setup, reasoning, and lessons learned..."
                      rows={4}
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">Save Draft</Button>
                    <Button className="holo-button">Save Entry</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Journal Analytics
                </CardTitle>
                <CardDescription>Comprehensive analysis of your trading journal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">67%</div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">1.8</div>
                    <div className="text-sm text-slate-400">Risk/Reward</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">156</div>
                    <div className="text-sm text-slate-400">Total Trades</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                  <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400">Chart placeholder - Performance over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags & Categories
                </CardTitle>
                <CardDescription>Organize your trades with custom tags and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Breakout</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Trend Following</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">News Trading</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Scalping</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">London Session</span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Tag</h3>
                    <div className="flex space-x-3">
                      <input 
                        type="text" 
                        placeholder="Enter tag name" 
                        className="flex-1 p-3 bg-slate-800 border border-slate-600 rounded-lg"
                      />
                      <Button>Add Tag</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export & Import
                </CardTitle>
                <CardDescription>Backup and restore your trading journal data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Export Data</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export as JSON
                      </Button>
                      <Button className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF Report
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Import Data</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Import from CSV
                      </Button>
                      <Button className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Import from JSON
                      </Button>
                      <Button className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Import from MT4/5
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Journal;
