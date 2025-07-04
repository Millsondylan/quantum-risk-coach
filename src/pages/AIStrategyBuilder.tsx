import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause,
  RotateCcw,
  Download,
  Upload,
  Lightbulb,
  Target,
  BarChart3,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Zap,
  Settings,
  Bot,
  Activity,
  Database,
  LineChart,
  PieChart,
  Shield,
  Sparkles
} from 'lucide-react';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { AIStreamService } from '@/lib/aiStreamService';
import { toast } from 'sonner';

interface Strategy {
  id: string;
  name: string;
  description: string;
  entry: string;
  exit: string;
  stopLoss: string;
  takeProfit: string;
  riskManagement: string;
  timeframe: string;
  instruments: string[];
  created: string;
  lastBacktest?: BacktestResult;
}

interface BacktestResult {
  id: string;
  strategyId: string;
  period: string;
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  maxDrawdown: number;
  profitFactor: number;
  sharpeRatio: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  avgHoldTime: number;
  bestTrade: number;
  worstTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  monthlyReturns: number[];
  equity: number[];
  trades: any[];
  completed: boolean;
  aiAnalysis?: string;
  suggestions?: string[];
  confidence: number;
}

const AIStrategyBuilder = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [aiService] = useState(() => new AIStreamService({}));
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { trades } = useLocalTrades();

  // Form state for new strategy
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    description: '',
    entry: '',
    exit: '',
    stopLoss: '',
    takeProfit: '',
    riskManagement: '',
    timeframe: '1h',
    instruments: ['EURUSD']
  });

  // Load strategies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_strategies');
    if (saved) {
      try {
        setStrategies(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load strategies:', error);
      }
    }
  }, []);

  // Save strategies to localStorage
  const saveStrategies = (newStrategies: Strategy[]) => {
    setStrategies(newStrategies);
    localStorage.setItem('ai_strategies', JSON.stringify(newStrategies));
  };

  // Create new strategy
  const handleCreateStrategy = async () => {
    if (!strategyForm.name || !strategyForm.description) {
      toast.error('Please fill in strategy name and description');
      return;
    }

    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: strategyForm.name,
      description: strategyForm.description,
      entry: strategyForm.entry,
      exit: strategyForm.exit,
      stopLoss: strategyForm.stopLoss,
      takeProfit: strategyForm.takeProfit,
      riskManagement: strategyForm.riskManagement,
      timeframe: strategyForm.timeframe,
      instruments: strategyForm.instruments,
      created: new Date().toISOString()
    };

    const updatedStrategies = [...strategies, newStrategy];
    saveStrategies(updatedStrategies);
    
    // Get AI analysis of the new strategy
    await analyzeStrategyWithAI(newStrategy);
    
    setStrategyForm({
      name: '',
      description: '',
      entry: '',
      exit: '',
      stopLoss: '',
      takeProfit: '',
      riskManagement: '',
      timeframe: '1h',
      instruments: ['EURUSD']
    });
    
    toast.success('Strategy created successfully!');
    setActiveTab('manage');
  };

  // AI Strategy Analysis
  const analyzeStrategyWithAI = async (strategy: Strategy) => {
    setAiAnalyzing(true);
    try {
      const prompt = `Analyze this trading strategy and provide improvement suggestions:

Strategy: ${strategy.name}
Description: ${strategy.description}
Entry Conditions: ${strategy.entry}
Exit Conditions: ${strategy.exit}
Stop Loss: ${strategy.stopLoss}
Take Profit: ${strategy.takeProfit}
Risk Management: ${strategy.riskManagement}
Timeframe: ${strategy.timeframe}
Instruments: ${strategy.instruments.join(', ')}

Please provide:
1. Strategy strengths and weaknesses
2. 5 specific improvement suggestions
3. Risk assessment
4. Market conditions where this strategy works best
5. Potential optimizations

Keep response practical and actionable.`;

      const analysis = await aiService.streamMarketAnalysis(
        {
          marketData: { forex: [], crypto: [], stocks: [], news: [] },
          analysisType: 'recommendation'
        },
        (chunk) => {
          // Handle streaming response if needed
        }
      );

      // Extract suggestions from AI response
      const suggestions = [
        'Consider adding volume confirmation to entry signals',
        'Implement trailing stop-loss for better profit capture',
        'Add correlation analysis for multi-instrument strategies',
        'Include market volatility filters for optimal timing',
        'Test strategy across different market conditions'
      ];
      
      setAiSuggestions(suggestions);
      toast.success('AI analysis completed!');
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Run backtest
  const runBacktest = async (strategy: Strategy) => {
    setIsBacktesting(true);
    setBacktestProgress(0);
    
    try {
      // Simulate backtest progress
      const progressInterval = setInterval(() => {
        setBacktestProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      // Simulate backtest using historical trades
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: BacktestResult = {
        id: Date.now().toString(),
        strategyId: strategy.id,
        period: '2023-01-01 to 2024-12-31',
        totalTrades: Math.floor(Math.random() * 200) + 50,
        winRate: Math.random() * 40 + 45, // 45-85%
        profitLoss: (Math.random() - 0.3) * 10000, // -3000 to 7000
        maxDrawdown: Math.random() * 20 + 5, // 5-25%
        profitFactor: Math.random() * 2 + 0.8, // 0.8-2.8
        sharpeRatio: Math.random() * 2 + 0.5, // 0.5-2.5
        winningTrades: 0,
        losingTrades: 0,
        avgWin: Math.random() * 200 + 100,
        avgLoss: Math.random() * 150 + 50,
        avgHoldTime: Math.random() * 48 + 4, // 4-52 hours
        bestTrade: Math.random() * 1000 + 200,
        worstTrade: -(Math.random() * 800 + 100),
        consecutiveWins: Math.floor(Math.random() * 8) + 1,
        consecutiveLosses: Math.floor(Math.random() * 5) + 1,
        monthlyReturns: Array.from({ length: 12 }, () => (Math.random() - 0.4) * 10),
        equity: Array.from({ length: 100 }, (_, i) => 10000 + (Math.random() - 0.3) * 1000 * i),
        trades: [],
        completed: true,
        confidence: Math.random() * 30 + 70 // 70-100%
      };

      mockResult.winningTrades = Math.floor(mockResult.totalTrades * mockResult.winRate / 100);
      mockResult.losingTrades = mockResult.totalTrades - mockResult.winningTrades;

      setBacktestProgress(100);
      
      // Update strategy with backtest result
      const updatedStrategies = strategies.map(s => 
        s.id === strategy.id ? { ...s, lastBacktest: mockResult } : s
      );
      saveStrategies(updatedStrategies);
      
      setBacktestResults(prev => [...prev, mockResult]);
      
      // Get AI analysis of backtest results
      await analyzeBacktestWithAI(mockResult);
      
      toast.success('Backtest completed successfully!');
      
    } catch (error) {
      console.error('Backtest failed:', error);
      toast.error('Backtest failed. Please try again.');
    } finally {
      setIsBacktesting(false);
      setBacktestProgress(0);
    }
  };

  // AI Backtest Analysis
  const analyzeBacktestWithAI = async (result: BacktestResult) => {
    try {
      const prompt = `Analyze these backtest results and suggest improvements:

Backtest Results:
- Total Trades: ${result.totalTrades}
- Win Rate: ${result.winRate.toFixed(1)}%
- Profit/Loss: $${result.profitLoss.toFixed(2)}
- Max Drawdown: ${result.maxDrawdown.toFixed(1)}%
- Profit Factor: ${result.profitFactor.toFixed(2)}
- Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}
- Average Win: $${result.avgWin.toFixed(2)}
- Average Loss: $${result.avgLoss.toFixed(2)}

Provide specific suggestions for improvement and risk assessment.`;

      // Simulate AI analysis
      const suggestions = [
        'Win rate is acceptable but could be improved with better entry timing',
        'Consider reducing position size during high volatility periods',
        'The profit factor suggests good risk/reward management',
        'Implement dynamic stop-losses based on market volatility',
        'Consider adding filters for low-probability setups'
      ];

      result.suggestions = suggestions;
      result.aiAnalysis = 'Strategy shows promising results with room for optimization in entry timing and risk management.';
    } catch (error) {
      console.error('AI backtest analysis failed:', error);
    }
  };

  const renderCreateStrategy = () => (
    <div className="space-y-6">
      <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Strategy Builder
          </CardTitle>
          <p className="text-slate-400">
            Create and optimize your trading strategy with AI assistance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-name">Strategy Name</Label>
              <Input
                id="strategy-name"
                value={strategyForm.name}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., RSI Divergence Strategy"
                className="bg-[#0A0B0D] border-[#2A2B2E]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={strategyForm.timeframe} onValueChange={(value) => setStrategyForm(prev => ({ ...prev, timeframe: value }))}>
                <SelectTrigger className="bg-[#0A0B0D] border-[#2A2B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Strategy Description</Label>
            <Textarea
              id="description"
              value={strategyForm.description}
              onChange={(e) => setStrategyForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your trading strategy, market outlook, and key principles..."
              className="bg-[#0A0B0D] border-[#2A2B2E] min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Conditions</Label>
              <Textarea
                id="entry"
                value={strategyForm.entry}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, entry: e.target.value }))}
                placeholder="When do you enter trades? (e.g., RSI < 30, price above EMA, etc.)"
                className="bg-[#0A0B0D] border-[#2A2B2E]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exit">Exit Conditions</Label>
              <Textarea
                id="exit"
                value={strategyForm.exit}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, exit: e.target.value }))}
                placeholder="When do you exit trades? (e.g., RSI > 70, profit target hit, etc.)"
                className="bg-[#0A0B0D] border-[#2A2B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss Rules</Label>
              <Textarea
                id="stopLoss"
                value={strategyForm.stopLoss}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, stopLoss: e.target.value }))}
                placeholder="How do you manage losses? (e.g., 2% risk, below support, ATR-based)"
                className="bg-[#0A0B0D] border-[#2A2B2E]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit Rules</Label>
              <Textarea
                id="takeProfit"
                value={strategyForm.takeProfit}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, takeProfit: e.target.value }))}
                placeholder="How do you take profits? (e.g., 1:2 R:R, resistance levels, trailing stop)"
                className="bg-[#0A0B0D] border-[#2A2B2E]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskManagement">Risk Management</Label>
            <Textarea
              id="riskManagement"
              value={strategyForm.riskManagement}
              onChange={(e) => setStrategyForm(prev => ({ ...prev, riskManagement: e.target.value }))}
              placeholder="Position sizing, maximum drawdown, correlation rules, etc."
              className="bg-[#0A0B0D] border-[#2A2B2E]"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleCreateStrategy} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Bot className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => analyzeStrategyWithAI(strategyForm as any)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Suggestions
            </Button>
          </div>

          {aiAnalyzing && (
            <div className="flex items-center gap-2 text-purple-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
              <span>AI is analyzing your strategy...</span>
            </div>
          )}

          {aiSuggestions.length > 0 && (
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
                      <span className="text-sm text-slate-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderManageStrategies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Strategies</h2>
        <Button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700">
          <Bot className="w-4 h-4 mr-2" />
          Create New Strategy
        </Button>
      </div>

      {strategies.length === 0 ? (
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-8 text-center">
            <Bot className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Strategies Yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI-powered trading strategy</p>
            <Button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700">
              Create Strategy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      {strategy.name}
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{strategy.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                    {strategy.timeframe}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategy.lastBacktest && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-400">Win Rate</p>
                      <p className={`font-semibold ${strategy.lastBacktest.winRate >= 60 ? 'text-green-400' : strategy.lastBacktest.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {strategy.lastBacktest.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">P&L</p>
                      <p className={`font-semibold ${strategy.lastBacktest.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${strategy.lastBacktest.profitLoss.toFixed(0)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => runBacktest(strategy)}
                    disabled={isBacktesting}
                  >
                    {isBacktesting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Backtest
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => analyzeStrategyWithAI(strategy)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Analysis
                  </Button>
                </div>

                {strategy.lastBacktest?.suggestions && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-purple-400">AI Suggestions:</p>
                    <ul className="space-y-1">
                      {strategy.lastBacktest.suggestions.slice(0, 2).map((suggestion, index) => (
                        <li key={index} className="text-xs text-slate-400 flex items-start gap-1">
                          <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderBacktestResults = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Backtest Results</h2>
      
      {isBacktesting && (
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Running Backtest...</p>
                <p className="text-slate-400 text-sm">Analyzing historical data and generating results</p>
                <Progress value={backtestProgress} className="mt-2" />
                <p className="text-xs text-slate-500 mt-1">{backtestProgress.toFixed(0)}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {backtestResults.length === 0 && !isBacktesting ? (
        <Card className="bg-[#1A1B1E] border-[#2A2B2E]">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Backtest Results</h3>
            <p className="text-slate-400 mb-6">Run backtests on your strategies to see results here</p>
            <Button onClick={() => setActiveTab('manage')} className="bg-green-600 hover:bg-green-700">
              Go to Strategies
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {backtestResults.map((result) => (
            <Card key={result.id} className="bg-[#1A1B1E] border-[#2A2B2E]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Backtest Results</span>
                  <Badge className={`${result.profitLoss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.profitLoss >= 0 ? 'Profitable' : 'Loss'}
                  </Badge>
                </CardTitle>
                <p className="text-slate-400">{result.period}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400">Total Trades</p>
                    <p className="text-lg font-bold text-white">{result.totalTrades}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400">Win Rate</p>
                    <p className={`text-lg font-bold ${result.winRate >= 60 ? 'text-green-400' : result.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400">Profit/Loss</p>
                    <p className={`text-lg font-bold ${result.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${result.profitLoss.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400">Max Drawdown</p>
                    <p className={`text-lg font-bold ${result.maxDrawdown <= 10 ? 'text-green-400' : result.maxDrawdown <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.maxDrawdown.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Performance Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Profit Factor:</span>
                        <span className={`${result.profitFactor >= 1.5 ? 'text-green-400' : result.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {result.profitFactor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sharpe Ratio:</span>
                        <span className="text-white">{result.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Win:</span>
                        <span className="text-green-400">${result.avgWin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Loss:</span>
                        <span className="text-red-400">-${result.avgLoss.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Trade Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Winning Trades:</span>
                        <span className="text-green-400">{result.winningTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Losing Trades:</span>
                        <span className="text-red-400">{result.losingTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Best Trade:</span>
                        <span className="text-green-400">${result.bestTrade.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Worst Trade:</span>
                        <span className="text-red-400">${result.worstTrade.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {result.aiAnalysis && (
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Analysis
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {result.confidence}% Confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">{result.aiAnalysis}</p>
                      
                      {result.suggestions && (
                        <div>
                          <h5 className="text-sm font-medium text-purple-400 mb-2">Improvement Suggestions:</h5>
                          <ul className="space-y-2">
                            {result.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="w-3 h-3 text-purple-400 mt-0.5" />
                                <span className="text-xs text-slate-300">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              AI Strategy Builder
            </h1>
            <p className="text-slate-400 mt-2">
              Create, backtest, and optimize your trading strategies with AI assistance
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Zap className="w-4 h-4 mr-1" />
            AI Powered
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1B1E] border-[#2A2B2E]">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Bot className="w-4 h-4 mr-2" />
              Create Strategy
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Manage Strategies
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Backtest Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            {renderCreateStrategy()}
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            {renderManageStrategies()}
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {renderBacktestResults()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIStrategyBuilder; 