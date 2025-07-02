import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Lightbulb,
  Save,
  Download,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeEntry {
  id: string;
  timestamp: Date;
  instrument: string;
  tradeType: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
  strategy: string;
  aiScore?: number;
}

const SuperiorTradingJournal = () => {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'ultratrader' | 'advanced'>('ultratrader');

  // Enhanced performance metrics (better than UltraTrader)
  const performanceMetrics = useMemo(() => {
    return {
      totalTrades: 247,
      winRate: 71.2,
      profitFactor: 1.84,
      expectancy: 145.50,
      sharpeRatio: 1.34,
      aiScore: 8.7,
      psychologyScore: 8.2,
      riskScore: 7.9
    };
  }, [trades]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Journal</h2>
          <p className="text-slate-400">UltraTrader interface with superior AI features</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/10 text-green-400 border-green-400/30">
            Better than UltraTrader
          </Badge>
          <Button
            variant={viewMode === 'ultratrader' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('ultratrader')}
          >
            UltraTrader View
          </Button>
          <Button
            variant={viewMode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('advanced')}
          >
            AI Enhanced
          </Button>
        </div>
      </div>

      {/* Performance Dashboard - UltraTrader Style + AI Enhancements */}
      <Card className="bg-gradient-to-br from-[#1A1B1E] to-[#151619] border-[#2A2B2E]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">Performance Analytics</CardTitle>
              {viewMode === 'advanced' && (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/30">
                  AI Enhanced
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnalyzing(true)}
              disabled={isAnalyzing}
              className="text-blue-400 hover:text-blue-300"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0A0B0D] p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-white">{performanceMetrics.totalTrades}</div>
            </div>
            <div className="bg-[#0A0B0D] p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">
                {performanceMetrics.winRate.toFixed(1)}%
              </div>
              {viewMode === 'advanced' && (
                <div className="text-xs text-blue-400 mt-1">+2.3% vs market avg</div>
              )}
            </div>
            <div className="bg-[#0A0B0D] p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">Profit Factor</div>
              <div className="text-2xl font-bold text-blue-400">
                {performanceMetrics.profitFactor.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#0A0B0D] p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">Expectancy</div>
              <div className="text-2xl font-bold text-purple-400">
                {formatCurrency(performanceMetrics.expectancy)}
              </div>
            </div>
          </div>

          {/* AI Enhanced Metrics (Our Exclusive Features) */}
          {viewMode === 'advanced' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 mb-4">
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Sharpe Ratio</div>
                <div className="text-lg font-bold text-cyan-400">{performanceMetrics.sharpeRatio}</div>
                <div className="text-xs text-green-400">Excellent</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">AI Strategy Score</div>
                <div className="text-lg font-bold text-yellow-400">{performanceMetrics.aiScore}/10</div>
                <Progress value={performanceMetrics.aiScore * 10} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Psychology Score</div>
                <div className="text-lg font-bold text-pink-400">{performanceMetrics.psychologyScore}/10</div>
                <Progress value={performanceMetrics.psychologyScore * 10} className="h-1 mt-1" />
              </div>
            </div>
          )}

          {/* AI Insights Panel - Our Exclusive Feature */}
          {viewMode === 'advanced' && (
            <div className="p-4 bg-[#0A0B0D] rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">AI Trading Insights</span>
                <Badge className="bg-green-500/10 text-green-400 border-green-400/30 text-xs">
                  Real-time
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-green-400" />
                    <span className="text-slate-300">Best Performance: 9:30-11:00 AM EST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-400" />
                    <span className="text-slate-300">Risk Alert: Position size 15% above optimal</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">Breakout strategy performing +12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 text-yellow-400" />
                    <span className="text-slate-300">Suggestion: Reduce FOMO trades by 3%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade Entry Form - UltraTrader Style */}
      <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus className="w-5 h-5 text-green-400" />
            New Trade Entry
            {viewMode === 'advanced' && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-400/30">
                AI Assisted
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {viewMode === 'ultratrader' 
              ? 'Log your trades with UltraTrader\'s familiar interface'
              : 'Enhanced with AI analysis and psychology tracking'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="instrument" className="text-slate-300">Instrument</Label>
              <Input
                id="instrument"
                placeholder="e.g., AAPL, EUR/USD"
                className="bg-[#0A0B0D] border-[#2A2B2E] text-white"
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-slate-300">Type</Label>
              <Select>
                <SelectTrigger className="bg-[#0A0B0D] border-[#2A2B2E] text-white">
                  <SelectValue placeholder="Buy/Sell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy/Long</SelectItem>
                  <SelectItem value="sell">Sell/Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strategy" className="text-slate-300">Strategy</Label>
              <Select>
                <SelectTrigger className="bg-[#0A0B0D] border-[#2A2B2E] text-white">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="pullback">Pullback</SelectItem>
                  <SelectItem value="reversal">Reversal</SelectItem>
                  <SelectItem value="trend">Trend Following</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === 'advanced' && (
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">AI Recommendations</span>
              </div>
              <div className="text-xs text-slate-400">
                • Consider reducing position size by 10% based on current volatility<br/>
                • Market sentiment is bullish - good timing for breakout strategies<br/>
                • Your win rate is 15% higher with EUR/USD during London session
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Trade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades - UltraTrader Style */}
      <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Trades</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-slate-400">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { symbol: 'AAPL', pnl: 247.50, percent: 2.1, aiScore: 9.2 },
              { symbol: 'TSLA', pnl: -134.25, percent: -1.8, aiScore: 7.4 },
              { symbol: 'MSFT', pnl: 389.75, percent: 3.2, aiScore: 8.9 }
            ].map((trade, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0A0B0D] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    trade.pnl >= 0 ? "bg-green-400" : "bg-red-400"
                  )} />
                  <div>
                    <div className="font-medium text-white">{trade.symbol}</div>
                    <div className="text-xs text-slate-400">Buy • {i + 1}h ago</div>
                  </div>
                  {viewMode === 'advanced' && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-400/30 text-xs">
                      AI Score: {trade.aiScore}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-medium",
                    trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {trade.percent >= 0 ? '+' : ''}{trade.percent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperiorTradingJournal; 