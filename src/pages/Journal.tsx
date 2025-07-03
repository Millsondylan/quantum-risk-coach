import React, { useState, useEffect } from 'react';
import { useTrades } from '@/hooks/useTrades';
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
import { Calendar, Plus, TrendingUp, Tag, Download, Search, Zap, RefreshCw, BarChart3, DollarSign, Target, Trash2, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';
import { usePortfolios } from '@/contexts/PortfolioContext';
import { Trade } from '@/lib/localDatabase';
import crypto from 'crypto';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JournalProps {
  defaultTab?: string;
}

const Journal: React.FC<JournalProps> = ({ defaultTab = 'trades' }) => {
  const { user } = useUser();
  const { selectedAccountId, accounts } = usePortfolios();
  const { trades, loading, error, addTrade, updateTrade, deleteTrade, getTradeStats } = useTrades(selectedAccountId || '');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  
  // New trade form state
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    side: 'buy' as 'buy' | 'sell',
    price: 0,
    profit: 0,
    amount: 1,
    entryDate: new Date().toISOString(),
    exitDate: '',
    notes: '',
    tags: [] as string[],
    strategy: '',
    useCurrentPrice: false,
    currentPrice: 0,
    fee: 0,
  });

  // Photo upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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

  // FIXED: Enhanced photo upload functionality
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImages(prev => [...prev, result]);
        toast.success('Image uploaded successfully');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // FIXED: Implement camera capture functionality
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg');
            setUploadedImages(prev => [...prev, imageData]);
            toast.success('Photo captured successfully');
            
            stream.getTracks().forEach(track => track.stop());
          }, 1000);
        })
        .catch(err => {
          console.error('Camera access denied:', err);
          toast.error('Camera access denied. Please use file upload instead.');
        });
    } else {
      toast.error('Camera not available. Please use file upload instead.');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

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
          price: newTrade.useCurrentPrice ? price : prev.price,
          profit: newTrade.useCurrentPrice && newTrade.side === 'sell' ? price : prev.profit,
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
    if (!newTrade.symbol || newTrade.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const tradeData: Trade = {
      id: crypto.randomUUID(),
      accountId: selectedAccountId || 'default',
      symbol: newTrade.symbol,
      type: newTrade.side === 'buy' ? 'long' : 'short',
      side: newTrade.side,
      amount: newTrade.amount,
      quantity: newTrade.amount,
      price: newTrade.price,
      entryPrice: newTrade.price,
      exitPrice: undefined,
      fee: newTrade.fee,
      profit: newTrade.profit > 0 ? newTrade.profit : 0,
      profitLoss: newTrade.profit > 0 ? newTrade.profit : 0,
      status: (newTrade.profit !== undefined && newTrade.profit !== 0) ? 'closed' : 'open',
      entryDate: newTrade.entryDate,
      entryTime: newTrade.entryDate,
      exitDate: newTrade.exitDate || undefined,
      exitTime: newTrade.exitDate || undefined,
      riskReward: undefined,
      riskRewardRatio: undefined,
      strategy: newTrade.strategy || undefined,
      tags: newTrade.tags,
      notes: newTrade.notes || undefined,
      exitReason: undefined,
      takeProfit: undefined,
      stopLoss: undefined,
      confidence: undefined,
      confidenceRating: undefined,
      emotion: 'calm',
      mood: 'neutral'
    };

    try {
      await addTrade(tradeData);
      toast.success('Trade added successfully');
      
      // Reset form
      setNewTrade({
        symbol: '',
        side: 'buy',
        price: 0,
        profit: 0,
        amount: 1,
        entryDate: new Date().toISOString(),
        exitDate: '',
        notes: '',
        tags: [],
        strategy: '',
        useCurrentPrice: false,
        currentPrice: 0,
        fee: 0,
      });
      
      // Clear uploaded images
      setUploadedImages([]);
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Failed to add trade. Please try again.');
    }
  };

  const handleUpdateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      // Map legacy fields back to DB fields if present
      const dbUpdates: Trade = {
        id, // Ensure id is always present
        accountId: selectedAccountId || '', // Add accountId
        symbol: updates.symbol || '',
        type: updates.type || (updates.side === 'buy' ? 'long' : 'short'),
        side: updates.side || (updates.type === 'long' ? 'buy' : 'sell'),
        amount: updates.quantity || updates.amount || 0,
        quantity: updates.quantity || updates.amount || 0,
        price: updates.entryPrice || updates.price || 0,
        entryPrice: updates.entryPrice || updates.price || 0,
        exitPrice: updates.exitPrice || 0,
        fee: updates.fee || 0,
        profit: updates.profitLoss || updates.profit || 0,
        profitLoss: updates.profitLoss || updates.profit || 0,
        status: updates.status || 'open',
        entryDate: updates.entryDate || '',
        entryTime: updates.entryTime || '',
        exitDate: updates.exitDate || '',
        exitTime: updates.exitTime || '',
        riskReward: updates.riskReward || undefined,
        riskRewardRatio: updates.riskRewardRatio || undefined,
        strategy: updates.strategy || undefined,
        tags: updates.tags || [],
        notes: updates.notes || undefined,
        exitReason: updates.exitReason || undefined,
        takeProfit: updates.takeProfit || undefined,
        stopLoss: updates.stopLoss || undefined,
        confidence: updates.confidence || undefined,
        confidenceRating: updates.confidenceRating || undefined,
        emotion: updates.emotion || 'calm',
        mood: updates.mood || 'neutral'
      };

      await updateTrade(dbUpdates);
      toast.success('Trade updated successfully');
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade. Please try again.');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteTrade(id);
      toast.success('Trade deleted successfully');
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error('Failed to delete trade. Please try again.');
    }
  };

  const handleUseCurrentPrice = (useCurrent: boolean) => {
    setNewTrade(prev => ({
      ...prev,
      useCurrentPrice: useCurrent,
      price: useCurrent ? prev.currentPrice : prev.price
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newTrade.tags.includes(tag)) {
      setNewTrade(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTrade(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const exportTrades = () => {
    const csvContent = [
      ['Symbol', 'Side', 'Entry Price', 'Exit Price', 'Amount', 'Profit/Loss', 'Status', 'Entry Date', 'Exit Date', 'Notes', 'Strategy', 'Tags'].join(','),
      ...filteredTrades.map(trade => [
        trade.symbol,
        trade.side,
        trade.entryPrice,
        trade.exitPrice || '',
        trade.amount,
        trade.profitLoss,
        trade.status,
        trade.entryDate,
        trade.exitDate || '',
        trade.notes || '',
        trade.strategy || '',
        trade.tags.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Trades exported successfully');
  };

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-slate-400">Track and analyze your trading performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTrades}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setActiveTab('add-trade')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Trades</p>
                <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Win Rate</p>
                <p className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalProfitLoss.toFixed(2)}
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
                <p className="text-2xl font-bold text-blue-400">
                  {trades.filter(t => t.status === 'open').length}
                </p>
              </div>
              <Target className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="add-trade">Add Trade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trades List */}
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <Card key={trade.id} className="bg-[#1A1B1E] border-[#2A2B2E]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{trade.symbol}</h3>
                        <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                          {trade.side.toUpperCase()}
                        </Badge>
                        <Badge variant={trade.status === 'open' ? 'outline' : 'default'}>
                          {trade.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Entry Price</p>
                          <p className="font-medium">${trade.entryPrice}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Amount</p>
                          <p className="font-medium">{trade.amount}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">P&L</p>
                          <p className={`font-medium ${(trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${(trade.profitLoss || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Date</p>
                          <p className="font-medium">{format(new Date(trade.entryDate), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      {trade.notes && (
                        <p className="text-slate-400 text-sm mt-2">{trade.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateTrade(trade.id, { status: 'closed' })}
                        disabled={trade.status === 'closed'}
                      >
                        Close
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTrade(trade.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrades.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No trades found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Start by adding your first trade.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => setActiveTab('add-trade')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Trade
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Add Trade Tab */}
        <TabsContent value="add-trade" className="space-y-6">
          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardHeader>
              <CardTitle>Add New Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={newTrade.symbol} onValueChange={(value) => setNewTrade(prev => ({ ...prev, symbol: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSymbols.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="side">Side</Label>
                  <Select value={newTrade.side} onValueChange={(value: any) => setNewTrade(prev => ({ ...prev, side: value }))}>
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
                  <Label htmlFor="price">Entry Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.00001"
                    value={newTrade.price}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00000"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newTrade.amount}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="1.00"
                  />
                </div>

                <div>
                  <Label htmlFor="fee">Fee</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    value={newTrade.fee}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Input
                    id="strategy"
                    value={newTrade.strategy}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, strategy: e.target.value }))}
                    placeholder="e.g., Breakout, Scalping"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newTrade.notes}
                  onChange={(e) => setNewTrade(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add your trade notes, analysis, or observations..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTrade.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      handleAddTag(input.value);
                      input.value = '';
                    }
                  }}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use-current-price"
                  checked={newTrade.useCurrentPrice}
                  onCheckedChange={handleUseCurrentPrice}
                />
                <Label htmlFor="use-current-price">Use current market price</Label>
                {isLoadingPrice && <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>

              <Button onClick={handleAddTrade} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Trades</span>
                    <span className="font-medium">{stats.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="font-medium text-green-400">{stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total P&L</span>
                    <span className={`font-medium ${stats.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${stats.totalProfitLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average P&L</span>
                    <span className={`font-medium ${stats.totalTrades > 0 ? (stats.totalProfitLoss / stats.totalTrades >= 0 ? 'text-green-400' : 'text-red-400') : 'text-slate-400'}`}>
                      ${stats.totalTrades > 0 ? (stats.totalProfitLoss / stats.totalTrades).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-slate-400">{format(new Date(trade.entryDate), 'MMM dd, HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${(trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(trade.profitLoss || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-400">{trade.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
            <CardHeader>
              <CardTitle>Trade Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Controls */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline" onClick={handleCameraCapture}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Trade photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No photos uploaded</h3>
                  <p className="text-slate-500">Upload screenshots of your trades, charts, or analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal;

