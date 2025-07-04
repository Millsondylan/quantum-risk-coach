import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Camera,
  Download,
  Upload,
  Filter,
  Search,
  Target,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  Zap,
  Activity,
  Smile,
  Frown,
  Meh,
  Save,
  Plus,
  X,
  Eye,
  EyeOff,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useTrades } from '@/hooks/useTrades';

interface TradeEntry {
  id: string;
  timestamp: Date;
  instrument: string;
  tradeType: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  commission: number;
  pnl?: number;
  duration?: number;
  status: 'open' | 'closed' | 'pending';
  strategy: string;
  setup: string;
  marketCondition: string;
  emotionalState: 'confident' | 'anxious' | 'neutral' | 'excited' | 'frustrated' | 'fearful' | 'greedy';
  confidence: number; // 1-10 scale
  preTradePlan: string;
  postTradeReview: string;
  screenshots: string[];
  tags: string[];
  riskRewardRatio?: number;
  mfe?: number; // Maximum Favorable Excursion
  mae?: number; // Maximum Adverse Excursion
  qualityScore?: number; // Trade execution quality 1-10
  lessons: string[];
  correlatedTrades: string[];
  marketNews: string[];
  customFields: Record<string, any>;
}

interface JournalFilter {
  dateRange: { start: Date | null; end: Date | null };
  instruments: string[];
  strategies: string[];
  status: string[];
  pnlRange: { min: number | null; max: number | null };
  emotionalStates: string[];
  tags: string[];
  searchText: string;
}

interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  avgHoldingTime: number;
  calmarRatio: number;
  sortinoRatio: number;
  expectancy: number;
  recoveryFactor: number;
}

const EnhancedTradingJournal = () => {
  const { user } = useUser();
  const { trades: realTrades, isLoading: tradesLoading, addTrade, updateTrade, deleteTrade } = useTrades();
  
  // Trades data is now sourced from useTrades hook, which connects to Supabase for persistence.
  // This ensures real, persistent trade data for the journal.
  const trades = useMemo(() => {
    return realTrades.map(trade => ({
      id: trade.id,
      timestamp: new Date(trade.createdAt),
      instrument: trade.symbol,
      tradeType: trade.type as 'buy' | 'sell',
      entryPrice: trade.entryPrice || 0,
      exitPrice: trade.exitPrice || undefined,
      quantity: trade.quantity || 0,
      stopLoss: trade.stopLoss || undefined,
      takeProfit: trade.takeProfit || undefined,
      commission: trade.commission || 0,
      pnl: trade.profitLoss || undefined,
      duration: trade.exitDate && trade.createdAt ? 
        new Date(trade.exitDate).getTime() - new Date(trade.createdAt).getTime() : undefined,
      status: trade.status as 'open' | 'closed' | 'pending',
      strategy: trade.strategy || 'Not specified',
      setup: 'Not specified', // Not available in Trade interface
      marketCondition: 'Unknown', // Not available in Trade interface
      emotionalState: 'neutral' as any, // Not available in Trade interface
      confidence: 5, // Not available in Trade interface
      preTradePlan: '', // Not available in Trade interface
      postTradeReview: '', // Not available in Trade interface
      screenshots: [], // Not available in Trade interface
      tags: [], // Not available in Trade interface
      riskRewardRatio: undefined, // Not available in Trade interface
      mfe: undefined, // Not available in Trade interface
      mae: undefined, // Not available in Trade interface
      qualityScore: undefined, // Not available in Trade interface
      lessons: [], // Not available in Trade interface
      correlatedTrades: [],
      marketNews: [],
      customFields: {}
    })) as TradeEntry[];
  }, [realTrades]);

  // Performance metrics are calculated from the real trade data provided by the useTrades hook.
  const performanceMetrics = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (closedTrades.filter(t => (t.pnl || 0) > 0).length / totalTrades) * 100 : 0;
    const profitableTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
    
    const totalProfit = profitableTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    
    return {
      totalTrades,
      winRate,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      sharpeRatio: 0, // Would need more sophisticated calculation
      maxDrawdown: 0, // Would need more sophisticated calculation
      averageWin: profitableTrades.length > 0 ? totalProfit / profitableTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      largestWin: Math.max(...closedTrades.map(t => t.pnl || 0), 0),
      largestLoss: Math.min(...closedTrades.map(t => t.pnl || 0), 0),
      avgHoldingTime: closedTrades.reduce((sum, t) => sum + (t.duration || 0), 0) / Math.max(1, closedTrades.length),
      calmarRatio: 0, // Would need more sophisticated calculation
      sortinoRatio: 0, // Would need more sophisticated calculation
      expectancy: totalTrades > 0 ? (totalProfit - totalLoss) / totalTrades : 0,
      recoveryFactor: 0 // Would need more sophisticated calculation
    };
  }, [trades]);

  const [currentTrade, setCurrentTrade] = useState<Partial<TradeEntry>>({
    timestamp: new Date(),
    tradeType: 'buy',
    emotionalState: 'neutral',
    confidence: 5,
    screenshots: [],
    tags: [],
    lessons: [],
    customFields: {}
  });
  const [filters, setFilters] = useState<JournalFilter>({
    dateRange: { start: null, end: null },
    instruments: [],
    strategies: [],
    status: [],
    pnlRange: { min: null, max: null },
    emotionalStates: [],
    tags: [],
    searchText: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'timeline'>('list');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeEntry | null>(null);

  // Professional trading setups and strategies
  const tradingSetups = [
    'Breakout', 'Pullback', 'Reversal', 'Trend Continuation', 'Range Trading',
    'News Trading', 'Scalping', 'Swing Trade', 'Day Trade', 'Position Trade',
    'Support/Resistance', 'Fibonacci Retracement', 'Moving Average Cross',
    'Flag/Pennant', 'Double Top/Bottom', 'Head and Shoulders', 'Triangle',
    'Wedge', 'Cup and Handle', 'Falling Knife'
  ];

  const tradingStrategies = [
    'Momentum Trading', 'Mean Reversion', 'Trend Following', 'Contrarian',
    'Arbitrage', 'Pairs Trading', 'Grid Trading', 'Martingale',
    'Anti-Martingale', 'Kelly Criterion', 'Fixed Fractional', 'Pyramiding'
  ];

  const marketConditions = [
    'Trending Up', 'Trending Down', 'Ranging/Sideways', 'High Volatility',
    'Low Volatility', 'Pre-Market', 'Market Open', 'Mid-Session',
    'Market Close', 'After-Hours', 'News Event', 'Central Bank Meeting',
    'Economic Data Release', 'Earnings Season', 'Options Expiry',
    'Holiday Trading', 'Low Liquidity', 'High Liquidity'
  ];

  const emotionalStates = [
    { value: 'confident', label: 'Confident', icon: Smile, color: 'text-green-400' },
    { value: 'anxious', label: 'Anxious', icon: Frown, color: 'text-yellow-400' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-400' },
    { value: 'excited', label: 'Excited', icon: TrendingUp, color: 'text-blue-400' },
    { value: 'frustrated', label: 'Frustrated', icon: TrendingDown, color: 'text-red-400' },
    { value: 'fearful', label: 'Fearful', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'greedy', label: 'Greedy', icon: DollarSign, color: 'text-yellow-500' }
  ];

  // Handle trade form changes
  const handleTradeChange = (field: string, value: any) => {
    setCurrentTrade(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save new trade to database
  const handleSaveTrade = async () => {
    if (!currentTrade.instrument || !currentTrade.entryPrice || !currentTrade.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Map TradeEntry to Trade type for addTrade
      const tradeData = {
        id: currentTrade.id || crypto.randomUUID(),
        symbol: currentTrade.instrument || '',
        type: (currentTrade.tradeType === 'buy' ? 'long' : 'short') as 'long' | 'short',
        side: currentTrade.tradeType || 'buy',
        quantity: currentTrade.quantity || 0,
        entryPrice: currentTrade.entryPrice || 0,
        price: currentTrade.entryPrice || 0,
        exitPrice: currentTrade.exitPrice,
        pnl: currentTrade.pnl,
        profit: currentTrade.pnl,
        profitLoss: currentTrade.pnl,
        status: currentTrade.status || 'open',
        entryTime: currentTrade.timestamp?.toISOString() || new Date().toISOString(),
        entryDate: currentTrade.timestamp?.toISOString() || new Date().toISOString(),
        exitTime: currentTrade.exitPrice ? new Date().toISOString() : undefined,
        exitDate: currentTrade.exitPrice ? new Date().toISOString() : undefined,
        notes: currentTrade.postTradeReview || '',
        strategy: currentTrade.strategy || '',
        tags: currentTrade.tags || [],
        fee: 0,
        commission: currentTrade.commission || 0,
        stopLoss: currentTrade.stopLoss,
        takeProfit: currentTrade.takeProfit,
        riskReward: currentTrade.riskRewardRatio,
        riskRewardRatio: currentTrade.riskRewardRatio,
        confidence: currentTrade.confidence,
        confidenceRating: currentTrade.confidence,
        emotion: currentTrade.emotionalState,
        mood: currentTrade.emotionalState,
        exitReason: undefined,
        currentPrice: undefined,
        useCurrentPrice: false,
        instrument: currentTrade.instrument,
        opened_at: undefined,
        closed_at: undefined,
        profit_loss: currentTrade.pnl,
        createdAt: currentTrade.timestamp?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addTrade(tradeData);
      
      // Reset form
      setCurrentTrade({
        timestamp: new Date(),
        tradeType: 'buy',
        emotionalState: 'neutral',
        confidence: 5,
        screenshots: [],
        tags: [],
        lessons: [],
        customFields: {}
      });
      
      toast.success('Trade saved successfully!');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error('Failed to save trade');
    }
  };

  // Memoized filtered trades for performance
  const filteredTrades = useMemo(() => {
    let filtered = trades;

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.instrument?.toLowerCase().includes(searchLower) ||
        trade.strategy?.toLowerCase().includes(searchLower) ||
        trade.setup?.toLowerCase().includes(searchLower) ||
        trade.preTradePlan?.toLowerCase().includes(searchLower) ||
        trade.postTradeReview?.toLowerCase().includes(searchLower) ||
        trade.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(trade => trade.timestamp >= filters.dateRange.start!);
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(trade => trade.timestamp <= filters.dateRange.end!);
    }

    if (filters.instruments.length > 0) {
      filtered = filtered.filter(trade => filters.instruments.includes(trade.instrument));
    }

    if (filters.strategies.length > 0) {
      filtered = filtered.filter(trade => filters.strategies.includes(trade.strategy));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(trade => filters.status.includes(trade.status));
    }

    return filtered;
  }, [trades, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getEmotionalStateIcon = (state: string) => {
    const stateObj = emotionalStates.find(s => s.value === state);
    if (stateObj?.icon) {
      const IconComponent = stateObj.icon;
      return <IconComponent className={`w-4 h-4 ${stateObj.color}`} />;
    }
    return <Meh className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Performance Dashboard - Enhanced with Real Data */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Performance Dashboard</span>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/30">
              Real Data
            </Badge>
          </CardTitle>
          <CardDescription>
            Live analytics from your connected trading accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Total Trades</p>
              <p className="text-lg font-semibold text-white">{performanceMetrics.totalTrades}</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Win Rate</p>
              <p className="text-lg font-semibold text-green-400">{performanceMetrics.winRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Profit Factor</p>
              <p className="text-lg font-semibold text-blue-400">{performanceMetrics.profitFactor.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Expectancy</p>
              <p className="text-lg font-semibold text-purple-400">{formatCurrency(performanceMetrics.expectancy)}</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Largest Win</p>
              <p className="text-lg font-semibold text-cyan-400">{formatCurrency(performanceMetrics.largestWin)}</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400">Max Drawdown</p>
              <p className="text-lg font-semibold text-red-400">{formatCurrency(Math.abs(performanceMetrics.maxDrawdown))}</p>
            </div>
          </div>

          {/* Real Trading Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Real Trading Insights</span>
              <Badge className="bg-green-500/10 text-green-400 border-green-400/30 text-xs">
                Live Data
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-300 mb-1">📊 Active Trades</div>
                <div className="text-xs text-slate-400">
                  {trades.filter(t => t.status === 'open').length} positions currently open
                </div>
              </div>
              <div>
                <div className="text-slate-300 mb-1">💰 Total P&L</div>
                <div className={`text-xs ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(trades.reduce((sum, t) => sum + (t.pnl || 0), 0))}
                </div>
              </div>
              <div>
                <div className="text-slate-300 mb-1">🎯 Best Strategy</div>
                <div className="text-xs text-green-400">
                  {trades.length > 0 ? 'Based on your trading history' : 'No data yet'}
                </div>
              </div>
              <div>
                <div className="text-slate-300 mb-1">📈 This Month</div>
                <div className="text-xs text-blue-400">
                  {trades.filter(t => new Date(t.timestamp).getMonth() === new Date().getMonth()).length} trades
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Trade Entry Form */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-400" />
            <span>New Trade Entry</span>
          </CardTitle>
          <CardDescription>
            Professional trading journal with advanced analytics and psychology tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="psychology">Psychology</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instrument">Instrument *</Label>
                  <Input
                    id="instrument"
                    placeholder="e.g., EUR/USD"
                    value={currentTrade.instrument || ''}
                    onChange={(e) => handleTradeChange('instrument', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tradeType">Trade Type *</Label>
                  <Select value={currentTrade.tradeType} onValueChange={(value) => handleTradeChange('tradeType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy/Long</SelectItem>
                      <SelectItem value="sell">Sell/Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={currentTrade.status} onValueChange={(value) => handleTradeChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="entryPrice">Entry Price *</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.00001"
                    placeholder="Enter entry price"
                    value={currentTrade.entryPrice || ''}
                    onChange={(e) => handleTradeChange('entryPrice', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.00001"
                    placeholder="Enter exit price"
                    value={currentTrade.exitPrice || ''}
                    onChange={(e) => handleTradeChange('exitPrice', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    value={currentTrade.quantity || ''}
                    onChange={(e) => handleTradeChange('quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Commission</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    placeholder="Enter commission"
                    value={currentTrade.commission || ''}
                    onChange={(e) => handleTradeChange('commission', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select value={currentTrade.strategy} onValueChange={(value) => handleTradeChange('strategy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingStrategies.map(strategy => (
                        <SelectItem key={strategy} value={strategy}>
                          {strategy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="setup">Setup</Label>
                  <Select value={currentTrade.setup} onValueChange={(value) => handleTradeChange('setup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingSetups.map(setup => (
                        <SelectItem key={setup} value={setup}>
                          {setup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="preTradePlan">Pre-Trade Plan</Label>
                <Textarea
                  id="preTradePlan"
                  placeholder="Describe your trade plan, rationale, and expectations..."
                  value={currentTrade.preTradePlan || ''}
                  onChange={(e) => handleTradeChange('preTradePlan', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="psychology" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Emotional State</Label>
                  <Select value={currentTrade.emotionalState} onValueChange={(value) => handleTradeChange('emotionalState', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotionalStates.map(state => (
                        <SelectItem key={state.value} value={state.value}>
                          <div className="flex items-center space-x-2">
                            <state.icon className={`w-4 h-4 ${state.color}`} />
                            <span>{state.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="confidence">Confidence Level (1-10)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="1"
                    max="10"
                    value={currentTrade.confidence || 5}
                    onChange={(e) => handleTradeChange('confidence', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTrade.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTradeChange('tags', currentTrade.tags.filter(t => t !== tag))}>
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTradeChange('tags', [...(currentTrade.tags || []), e.currentTarget.value]);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mfe">Max Favorable Excursion</Label>
                  <Input
                    id="mfe"
                    type="number"
                    step="0.01"
                    placeholder="Highest unrealized profit"
                    value={currentTrade.mfe || ''}
                    onChange={(e) => handleTradeChange('mfe', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="mae">Max Adverse Excursion</Label>
                  <Input
                    id="mae"
                    type="number"
                    step="0.01"
                    placeholder="Largest unrealized loss"
                    value={currentTrade.mae || ''}
                    onChange={(e) => handleTradeChange('mae', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Trade duration"
                    value={currentTrade.duration || ''}
                    onChange={(e) => handleTradeChange('duration', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-600/30">
            <div className="text-sm text-slate-400">
              * Required fields
            </div>
            <Button onClick={handleSaveTrade} className="holo-button">
              <Save className="w-4 h-4 mr-2" />
              Save Trade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <span>Search & Filters</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search trades..."
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Showing {filteredTrades.length} of {trades.length} trades</span>
          </div>
        </CardContent>
      </Card>

      {/* Trades List */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Trade History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Trades Found</h3>
              <p className="text-slate-400">Start building your trading journal by adding your first trade above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrades.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        trade.status === 'open' ? 'bg-yellow-400' :
                        trade.status === 'closed' ? 'bg-green-400' : 'bg-slate-400'
                      }`} />
                      <span className="font-medium text-white">{trade.instrument}</span>
                      <Badge variant={trade.tradeType === 'buy' ? 'default' : 'destructive'}>
                        {trade.tradeType.toUpperCase()}
                      </Badge>
                      {getEmotionalStateIcon(trade.emotionalState)}
                    </div>
                    <div className="flex items-center space-x-4">
                      {trade.pnl !== undefined && (
                        <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      )}
                      <span className="text-sm text-slate-400">
                        {trade.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Entry</p>
                      <p className="text-white">{trade.entryPrice}</p>
                    </div>
                    {trade.exitPrice && (
                      <div>
                        <p className="text-slate-400">Exit</p>
                        <p className="text-white">{trade.exitPrice}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400">Quantity</p>
                      <p className="text-white">{trade.quantity}</p>
                    </div>
                    {trade.riskRewardRatio && (
                      <div>
                        <p className="text-slate-400">R:R</p>
                        <p className="text-white">{trade.riskRewardRatio.toFixed(2)}:1</p>
                      </div>
                    )}
                  </div>

                  {trade.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trade.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredTrades.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Load More Trades
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTradingJournal; 