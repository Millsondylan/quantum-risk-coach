import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Lightbulb,
  BarChart3,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { strategyService, Strategy, AnalyticsMetrics } from '@/lib/api';

const StrategyAnalysis = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Mock strategies for demonstration
  const mockStrategies: Strategy[] = [
    {
      id: '1',
      name: 'Breakout Strategy',
      description: 'Trading breakouts from key support/resistance levels',
      tags: ['breakout', 'technical', 'forex'],
      trades: [],
      metrics: {
        riskRewardRatio: 2.5,
        profitFactor: 1.8,
        winRate: 65,
        averageWin: 150,
        averageLoss: 60,
        maxDrawdown: 300,
        sharpeRatio: 1.2,
        totalTrades: 45,
        profitableTrades: 29,
        losingTrades: 16
      }
    },
    {
      id: '2',
      name: 'Scalping Strategy',
      description: 'Quick trades with tight stop losses',
      tags: ['scalping', 'short-term', 'forex'],
      trades: [],
      metrics: {
        riskRewardRatio: 1.2,
        profitFactor: 1.1,
        winRate: 75,
        averageWin: 25,
        averageLoss: 20,
        maxDrawdown: 150,
        sharpeRatio: 0.8,
        totalTrades: 120,
        profitableTrades: 90,
        losingTrades: 30
      }
    },
    {
      id: '3',
      name: 'Trend Following',
      description: 'Following major market trends with momentum',
      tags: ['trend', 'momentum', 'forex'],
      trades: [],
      metrics: {
        riskRewardRatio: 3.0,
        profitFactor: 2.2,
        winRate: 55,
        averageWin: 200,
        averageLoss: 65,
        maxDrawdown: 450,
        sharpeRatio: 1.5,
        totalTrades: 30,
        profitableTrades: 17,
        losingTrades: 13
      }
    }
  ];

  useEffect(() => {
    const loadStrategies = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from API
        setStrategies(mockStrategies);
        if (mockStrategies.length > 0) {
          setSelectedStrategy(mockStrategies[0]);
        }
      } catch (error) {
        console.error('Failed to load strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStrategies();
  }, []);

  const getAiInsights = async (strategy: Strategy) => {
    setAnalyzing(true);
    try {
      const insights = await strategyService.getStrategyInsights(strategy);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      setAiInsights('Unable to generate AI insights at this time.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getMetricColor = (value: number, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
    if (type === 'positive') return value > 0 ? 'text-green-500' : 'text-red-500';
    if (type === 'negative') return value < 0 ? 'text-red-500' : 'text-green-500';
    return 'text-gray-500';
  };

  const getMetricIcon = (value: number) => {
    return value > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStrategyEffectiveness = (metrics: AnalyticsMetrics): 'excellent' | 'good' | 'fair' | 'poor' => {
    const score = (metrics.winRate * 0.3) + (metrics.profitFactor * 20) + (metrics.riskRewardRatio * 10);
    if (score > 80) return 'excellent';
    if (score > 60) return 'good';
    if (score > 40) return 'fair';
    return 'poor';
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Strategy Analysis
        </CardTitle>
        <CardDescription>
          Deep analysis of trading strategies with AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Strategy Selector */}
            <div className="flex items-center gap-4">
              <Select 
                value={selectedStrategy?.id || ''} 
                onValueChange={(value) => {
                  const strategy = strategies.find(s => s.id === value);
                  setSelectedStrategy(strategy || null);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => selectedStrategy && getAiInsights(selectedStrategy)}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Insights
                  </>
                )}
              </Button>
            </div>

            {selectedStrategy && (
              <div className="space-y-6">
                {/* Strategy Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedStrategy.name}</CardTitle>
                        <CardDescription>{selectedStrategy.description}</CardDescription>
                      </div>
                      <Badge className={getEffectivenessColor(getStrategyEffectiveness(selectedStrategy.metrics))}>
                        {getStrategyEffectiveness(selectedStrategy.metrics).toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategy.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                          <p className="text-2xl font-bold">{formatPercentage(selectedStrategy.metrics.winRate)}</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Profit Factor</p>
                          <p className="text-2xl font-bold">{selectedStrategy.metrics.profitFactor.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Risk/Reward</p>
                          <p className="text-2xl font-bold">{selectedStrategy.metrics.riskRewardRatio.toFixed(2)}</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                          <p className="text-2xl font-bold">{selectedStrategy.metrics.sharpeRatio.toFixed(2)}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trade Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Trades</span>
                        <Badge variant="outline">{selectedStrategy.metrics.totalTrades}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Profitable Trades</span>
                        <Badge variant="default" className="bg-green-500">{selectedStrategy.metrics.profitableTrades}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Losing Trades</span>
                        <Badge variant="destructive">{selectedStrategy.metrics.losingTrades}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Win</span>
                        <span className={getMetricColor(selectedStrategy.metrics.averageWin, 'positive')}>
                          {formatCurrency(selectedStrategy.metrics.averageWin)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Loss</span>
                        <span className={getMetricColor(selectedStrategy.metrics.averageLoss, 'negative')}>
                          {formatCurrency(selectedStrategy.metrics.averageLoss)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Max Drawdown</span>
                          <span className={getMetricColor(selectedStrategy.metrics.maxDrawdown, 'negative')}>
                            {formatCurrency(selectedStrategy.metrics.maxDrawdown)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((Math.abs(selectedStrategy.metrics.maxDrawdown) / 1000) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Risk-Reward Ratio</span>
                          <span className={getMetricColor(selectedStrategy.metrics.riskRewardRatio)}>
                            {selectedStrategy.metrics.riskRewardRatio.toFixed(2)}:1
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(selectedStrategy.metrics.riskRewardRatio * 20, 100)} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {selectedStrategy && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strategy Performance Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { month: 'Jan', pnl: 150, trades: 8 },
                          { month: 'Feb', pnl: -50, trades: 12 },
                          { month: 'Mar', pnl: 200, trades: 10 },
                          { month: 'Apr', pnl: -75, trades: 15 },
                          { month: 'May', pnl: 300, trades: 9 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { range: '0-50', count: 15 },
                          { range: '51-100', count: 12 },
                          { range: '101-200', count: 8 },
                          { range: '201+', count: 5 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {selectedStrategy && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      AI Strategy Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiInsights ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{aiInsights}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Brain className="h-4 w-4" />
                          <span>AI-powered analysis based on strategy performance data</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Click "Get AI Insights" to analyze this strategy
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Good risk-reward ratio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Consistent win rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Manageable drawdown</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Consider position sizing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Optimize entry timing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Review stop loss levels</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategy Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{strategy.name}</h3>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                          <div className="font-semibold">{formatPercentage(strategy.metrics.winRate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Profit Factor</div>
                          <div className="font-semibold">{strategy.metrics.profitFactor.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Risk/Reward</div>
                          <div className="font-semibold">{strategy.metrics.riskRewardRatio.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Trades</div>
                          <div className="font-semibold">{strategy.metrics.totalTrades}</div>
                        </div>
                        <Badge className={getEffectivenessColor(getStrategyEffectiveness(strategy.metrics))}>
                          {getStrategyEffectiveness(strategy.metrics)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StrategyAnalysis; 