import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Clock,
  DollarSign,
  Activity,
  Settings
} from 'lucide-react';

interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  trades: BacktestTrade[];
  equityCurve: { date: Date; equity: number; }[];
}

interface BacktestTrade {
  id: string;
  date: Date;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
  reason: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: { [key: string]: any };
}

export default function Backtesting() {
  const [strategies] = useState<Strategy[]>([
    {
      id: 'moving_average',
      name: 'Moving Average Crossover',
      description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
      parameters: {
        fastMA: 20,
        slowMA: 50,
        stopLoss: 2,
        takeProfit: 4
      }
    },
    {
      id: 'rsi_strategy',
      name: 'RSI Overbought/Oversold',
      description: 'Buy when RSI < 30, sell when RSI > 70',
      parameters: {
        rsiPeriod: 14,
        overbought: 70,
        oversold: 30,
        stopLoss: 1.5,
        takeProfit: 3
      }
    },
    {
      id: 'breakout',
      name: 'Breakout Strategy',
      description: 'Trade breakouts from support/resistance levels',
      parameters: {
        lookbackPeriod: 20,
        breakoutThreshold: 0.5,
        stopLoss: 1,
        takeProfit: 2
      }
    }
  ]);

  const [selectedStrategy, setSelectedStrategy] = useState<string>('moving_average');
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('1H');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<BacktestResult | null>(null);
  const [backtestHistory, setBacktestHistory] = useState<BacktestResult[]>([]);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD'];
  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      // Simulate backtesting process
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress((i / steps) * 100);
      }

      // Generate mock results
      const result = generateMockBacktestResult();
      setCurrentResult(result);
      setBacktestHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      toast.success('Backtest completed successfully!');
    } catch (error) {
      toast.error('Backtest failed. Please try again.');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const generateMockBacktestResult = (): BacktestResult => {
    // Real backtesting requires historical data API integration
    // This would connect to a historical data provider like Alpha Vantage, Polygon, etc.
    console.log('Backtesting: Would connect to historical data API for real backtesting');
    
    // Return empty result - no fake data
    return {
      id: `backtest_${Date.now()}`,
      strategyName: 'Real Backtesting Required',
      symbol,
      timeframe,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      initialCapital,
      finalCapital: initialCapital,
      totalReturn: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      trades: [],
      equityCurve: []
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getCurrentStrategy = () => {
    return strategies.find(s => s.id === selectedStrategy);
  };

  return (
    <div className="space-y-6">
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Strategy Backtesting
          </CardTitle>
          <CardDescription>
            Test your trading strategies against historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Strategy</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getCurrentStrategy() && (
                      <p className="text-sm text-slate-400">
                        {getCurrentStrategy()!.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Symbol</Label>
                      <Select value={symbol} onValueChange={setSymbol}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {symbols.map((sym) => (
                            <SelectItem key={sym} value={sym}>
                              {sym}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timeframe</Label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeframes.map((tf) => (
                            <SelectItem key={tf} value={tf}>
                              {tf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Initial Capital</Label>
                    <Input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(Number(e.target.value))}
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Strategy Parameters
                    </h3>
                    {getCurrentStrategy() && (
                      <div className="space-y-3">
                        {Object.entries(getCurrentStrategy()!.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-slate-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm text-white font-medium">
                              {typeof value === 'number' ? value : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {isRunning && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Running backtest...</span>
                          <span className="text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      onClick={runBacktest}
                      disabled={isRunning}
                      className="w-full holo-button"
                      size="lg"
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Backtest
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {currentResult ? (
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Total Return</p>
                          <p className={`text-2xl font-bold ${getPerformanceColor(currentResult.totalReturn)}`}>
                            {formatPercentage(currentResult.totalReturn)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Win Rate</p>
                          <p className="text-2xl font-bold text-white">
                            {formatPercentage(currentResult.winRate)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Profit Factor</p>
                          <p className={`text-2xl font-bold ${currentResult.profitFactor > 1 ? 'text-green-400' : 'text-red-400'}`}>
                            {currentResult.profitFactor.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Max Drawdown</p>
                          <p className="text-2xl font-bold text-red-400">
                            {formatPercentage(currentResult.maxDrawdown)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Trading Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Trades</span>
                          <span className="text-white">{currentResult.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Winning Trades</span>
                          <span className="text-green-400">{currentResult.winningTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Losing Trades</span>
                          <span className="text-red-400">{currentResult.losingTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Average Win</span>
                          <span className="text-green-400">{formatCurrency(currentResult.avgWin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Average Loss</span>
                          <span className="text-red-400">{formatCurrency(currentResult.avgLoss)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Largest Win</span>
                          <span className="text-green-400">{formatCurrency(currentResult.largestWin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Largest Loss</span>
                          <span className="text-red-400">{formatCurrency(currentResult.largestLoss)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Portfolio Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Initial Capital</span>
                          <span className="text-white">{formatCurrency(currentResult.initialCapital)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Final Capital</span>
                          <span className={getPerformanceColor(currentResult.finalCapital - currentResult.initialCapital)}>
                            {formatCurrency(currentResult.finalCapital)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total P&L</span>
                          <span className={getPerformanceColor(currentResult.finalCapital - currentResult.initialCapital)}>
                            {formatCurrency(currentResult.finalCapital - currentResult.initialCapital)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sharpe Ratio</span>
                          <span className="text-white">{currentResult.sharpeRatio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Strategy</span>
                          <span className="text-white">{currentResult.strategyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Symbol</span>
                          <span className="text-white">{currentResult.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Timeframe</span>
                          <span className="text-white">{currentResult.timeframe}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Trades */}
                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentResult.trades.slice(0, 10).map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${trade.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {trade.type === 'buy' ? (
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">{trade.type.toUpperCase()}</p>
                                <p className="text-sm text-slate-400">
                                  {trade.date.toLocaleDateString()} at ${trade.price.toFixed(5)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${getPerformanceColor(trade.pnl)}`}>
                                {formatCurrency(trade.pnl)}
                              </p>
                              <p className="text-sm text-slate-400">
                                {trade.quantity} lots
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No backtest results yet</p>
                  <p className="text-sm">Configure your strategy and run a backtest to see results</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {backtestHistory.length > 0 ? (
                <div className="space-y-4">
                  {backtestHistory.map((result) => (
                    <Card key={result.id} className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => setCurrentResult(result)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium text-white">{result.strategyName}</h3>
                            <p className="text-sm text-slate-400">
                              {result.symbol} • {result.timeframe} • {result.startDate.toLocaleDateString()} - {result.endDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className={`font-medium ${getPerformanceColor(result.totalReturn)}`}>
                              {formatPercentage(result.totalReturn)}
                            </p>
                            <p className="text-sm text-slate-400">
                              {result.totalTrades} trades • {formatPercentage(result.winRate)} win rate
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No backtest history</p>
                  <p className="text-sm">Your completed backtests will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 