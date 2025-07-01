import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, TrendingDown, Clock, DollarSign, BarChart3, Zap, Lightbulb, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradingPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  frequency: number;
  avgProfit: number;
  winRate: number;
  timeOfDay: string;
  currencyPairs: string[];
  marketConditions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  patterns: TradingPattern[];
  totalTrades: number;
  successRate: number;
  avgReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  isActive: boolean;
  lastUsed: Date;
}

const StrategyAnalyzer = () => {
  const [patterns, setPatterns] = useState<TradingPattern[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Generate simulated trading patterns
  const generatePatterns = (): TradingPattern[] => {
    const patternTemplates = [
      {
        name: 'London Breakout',
        description: 'Entering trades during London session opening with strong momentum',
        category: 'Session Trading',
        timeOfDay: '08:00-10:00 GMT',
        currencyPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        marketConditions: ['High Volatility', 'Clear Trend'],
        riskLevel: 'medium' as const
      },
      {
        name: 'News Scalping',
        description: 'Quick trades around high-impact news releases',
        category: 'News Trading',
        timeOfDay: '13:30-14:30 GMT',
        currencyPairs: ['USD/JPY', 'EUR/USD'],
        marketConditions: ['News Events', 'High Spread'],
        riskLevel: 'high' as const
      },
      {
        name: 'Support/Resistance Bounce',
        description: 'Trading bounces off key support and resistance levels',
        category: 'Technical Analysis',
        timeOfDay: 'Any Time',
        currencyPairs: ['EUR/USD', 'GBP/USD', 'USD/CHF'],
        marketConditions: ['Ranging Market', 'Key Levels'],
        riskLevel: 'low' as const
      },
      {
        name: 'Trend Following',
        description: 'Following established market trends with momentum',
        category: 'Trend Trading',
        timeOfDay: 'Any Time',
        currencyPairs: ['All Major Pairs'],
        marketConditions: ['Strong Trend', 'Low Volatility'],
        riskLevel: 'medium' as const
      },
      {
        name: 'Scalping Range',
        description: 'Quick trades within established ranges',
        category: 'Scalping',
        timeOfDay: '09:00-17:00 GMT',
        currencyPairs: ['EUR/USD', 'GBP/USD'],
        marketConditions: ['Ranging Market', 'Low Spread'],
        riskLevel: 'low' as const
      }
    ];

    return patternTemplates.map((template, index) => ({
      id: `pattern-${index}`,
      name: template.name,
      description: template.description,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      frequency: Math.floor(Math.random() * 50) + 20, // 20-70 occurrences
      avgProfit: Math.random() * 40 + 10, // $10-$50
      winRate: Math.floor(Math.random() * 30) + 60, // 60-90%
      timeOfDay: template.timeOfDay,
      currencyPairs: template.currencyPairs,
      marketConditions: template.marketConditions,
      riskLevel: template.riskLevel,
      category: template.category
    }));
  };

  // Generate strategies based on patterns
  const generateStrategies = (patterns: TradingPattern[]): Strategy[] => {
    const strategyTemplates = [
      {
        name: 'Multi-Session Scalper',
        description: 'Aggressive scalping strategy across multiple sessions',
        patterns: patterns.slice(0, 2)
      },
      {
        name: 'News Event Trader',
        description: 'Specialized strategy for trading around news events',
        patterns: patterns.slice(1, 2)
      },
      {
        name: 'Technical Swing Trader',
        description: 'Medium-term trades based on technical analysis',
        patterns: patterns.slice(2, 4)
      }
    ];

    return strategyTemplates.map((template, index) => ({
      id: `strategy-${index}`,
      name: template.name,
      description: template.description,
      patterns: template.patterns,
      totalTrades: Math.floor(Math.random() * 200) + 50,
      successRate: Math.floor(Math.random() * 25) + 65, // 65-90%
      avgReturn: Math.random() * 3 + 1, // 1-4%
      maxDrawdown: -(Math.random() * 15 + 5), // -5% to -20%
      sharpeRatio: Math.random() * 2 + 0.5, // 0.5-2.5
      isActive: Math.random() > 0.3,
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  };

  const analyzeTradingData = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const steps = [
      { progress: 20, message: 'Analyzing trade history...' },
      { progress: 40, message: 'Identifying patterns...' },
      { progress: 60, message: 'Calculating success rates...' },
      { progress: 80, message: 'Generating strategies...' },
      { progress: 100, message: 'Analysis complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
    }

    const generatedPatterns = generatePatterns();
    const generatedStrategies = generateStrategies(generatedPatterns);
    
    setPatterns(generatedPatterns);
    setStrategies(generatedStrategies);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    // Auto-analyze on component mount
    analyzeTradingData();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">AI Strategy Analyzer</h2>
        </div>
        <Badge variant="outline" className="text-slate-400">
          {patterns.length} patterns detected
        </Badge>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="mb-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">AI Analysis in Progress</h3>
              <p className="text-sm text-slate-400">Analyzing your trading patterns...</p>
            </div>
          </div>
          <Progress value={analysisProgress} className="w-full mb-2" />
          <p className="text-xs text-slate-400">{analysisProgress}% complete</p>
        </div>
      )}

      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Trading Patterns</TabsTrigger>
          <TabsTrigger value="strategies">AI Strategies</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{pattern.name}</h3>
                    <p className="text-sm text-slate-400">{pattern.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRiskColor(pattern.riskLevel)}>
                      {pattern.riskLevel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getConfidenceColor(pattern.confidence)}>
                      {pattern.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-400">Frequency</p>
                    <p className="text-sm font-medium text-white">{pattern.frequency} times</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg Profit</p>
                    <p className="text-sm font-medium text-green-400">{formatCurrency(pattern.avgProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Win Rate</p>
                    <p className="text-sm font-medium text-white">{pattern.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Best Time</p>
                    <p className="text-sm font-medium text-blue-400">{pattern.timeOfDay}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Currency Pairs</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.currencyPairs.map((pair, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pair}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Market Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.marketConditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{strategy.name}</h3>
                    <p className="text-sm text-slate-400">{strategy.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={strategy.isActive ? "default" : "outline"}>
                      {strategy.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-400">Total Trades</p>
                    <p className="text-sm font-medium text-white">{strategy.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Success Rate</p>
                    <p className="text-sm font-medium text-green-400">{strategy.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg Return</p>
                    <p className="text-sm font-medium text-blue-400">{strategy.avgReturn.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Max Drawdown</p>
                    <p className="text-sm font-medium text-red-400">{strategy.maxDrawdown.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Sharpe Ratio</p>
                    <p className="text-sm font-medium text-purple-400">{strategy.sharpeRatio.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Based on Patterns:</p>
                  <div className="flex flex-wrap gap-1">
                    {strategy.patterns.map((pattern) => (
                      <Badge key={pattern.id} variant="outline" className="text-xs">
                        {pattern.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    Last used: {strategy.lastUsed.toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      {strategy.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-medium text-white">Key Insights</h3>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• You perform best during London session (08:00-12:00 GMT)</p>
                <p>• Support/resistance trading shows highest win rate (78%)</p>
                <p>• News trading has highest risk but highest potential returns</p>
                <p>• Consider reducing position sizes during high-impact news</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-medium text-white">Recommended Actions</h3>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• Focus on EUR/USD and GBP/USD pairs during London session</p>
                <p>• Implement tighter stop-losses for news trading</p>
                <p>• Consider automated alerts for support/resistance levels</p>
                <p>• Review risk management for high-frequency trading</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-600/30">
        <Button 
          onClick={analyzeTradingData} 
          disabled={isAnalyzing}
          className="holo-button"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default StrategyAnalyzer; 