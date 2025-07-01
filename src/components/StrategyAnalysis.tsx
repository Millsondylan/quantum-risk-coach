import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Activity,
  Zap,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  trades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalPnL: number;
  riskScore: string;
  confidence: number;
}

const StrategyAnalysis = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('breakout');

  const strategies: Strategy[] = [
    {
      id: 'breakout',
      name: 'Breakout Strategy',
      description: 'Trading breakouts from key support/resistance levels',
      trades: 45,
      winRate: 72.3,
      profitFactor: 2.45,
      avgWin: 156.78,
      avgLoss: -67.34,
      totalPnL: 4020.50,
      riskScore: 'Low',
      confidence: 85
    },
    {
      id: 'trend_following',
      name: 'Trend Following',
      description: 'Following established market trends with momentum',
      trades: 38,
      winRate: 68.4,
      profitFactor: 1.89,
      avgWin: 134.56,
      avgLoss: -89.12,
      totalPnL: 1720.25,
      riskScore: 'Medium',
      confidence: 72
    },
    {
      id: 'mean_reversion',
      name: 'Mean Reversion',
      description: 'Trading price reversals to statistical averages',
      trades: 29,
      winRate: 58.6,
      profitFactor: 1.23,
      avgWin: 98.45,
      avgLoss: -112.67,
      totalPnL: -410.80,
      riskScore: 'High',
      confidence: 45
    },
    {
      id: 'scalping',
      name: 'Scalping',
      description: 'Quick trades for small profits',
      trades: 67,
      winRate: 81.2,
      profitFactor: 3.12,
      avgWin: 45.67,
      avgLoss: -23.45,
      totalPnL: 2890.75,
      riskScore: 'Low',
      confidence: 91
    }
  ];

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Strategy Analysis</h2>
          <p className="text-slate-400">AI-powered analysis of your trading strategies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-400">
            <Activity className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="holo-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Strategy Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Total Trades</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedStrategyData?.trades}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Win Rate</p>
                      <p className={`text-2xl font-bold ${getWinRateColor(selectedStrategyData?.winRate || 0)}`}>
                        {selectedStrategyData?.winRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Profit Factor</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedStrategyData?.profitFactor}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Total P&L</p>
                      <p className={`text-2xl font-bold ${selectedStrategyData && selectedStrategyData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${selectedStrategyData?.totalPnL.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="holo-card">
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Risk Score</span>
                        <Badge variant="outline" className={getRiskColor(selectedStrategyData?.riskScore || '')}>
                          {selectedStrategyData?.riskScore}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">AI Confidence</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedStrategyData?.confidence} className="w-20" />
                          <span className={`text-sm font-medium ${getConfidenceColor(selectedStrategyData?.confidence || 0)}`}>
                            {selectedStrategyData?.confidence}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Win</span>
                        <span className="text-green-400 font-medium">
                          ${selectedStrategyData?.avgWin}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Loss</span>
                        <span className="text-red-400 font-medium">
                          ${selectedStrategyData?.avgLoss}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="holo-card">
                  <CardHeader>
                    <CardTitle>Strategy Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">
                      {selectedStrategyData?.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-slate-400">High frequency trading</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Average hold time: 2.5 hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-400">Best during London session</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card className="holo-card">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Monthly Performance</h4>
                      <div className="grid grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(month => (
                          <div key={month} className="text-center">
                            <div className="p-3 bg-slate-800/30 rounded-lg">
                              <p className="text-xs text-slate-400 mb-1">Month {month}</p>
                              <p className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                                ${(Math.random() * 1000 + 200).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Trade Distribution</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-400">Winning Trades</span>
                          </div>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.round((selectedStrategyData?.winRate || 0) / 100 * (selectedStrategyData?.trades || 0))}
                          </p>
                        </div>
                        <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-slate-400">Losing Trades</span>
                          </div>
                          <p className="text-2xl font-bold text-red-400">
                            {Math.round((100 - (selectedStrategyData?.winRate || 0)) / 100 * (selectedStrategyData?.trades || 0))}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-slate-400">Total Volume</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-400">
                            ${((selectedStrategyData?.trades || 0) * 10000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="holo-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>AI Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                        <div>
                          <h4 className="font-medium text-white mb-1">Strong Performance</h4>
                          <p className="text-sm text-slate-300">
                            This strategy shows consistent profitability with a win rate above 70%. 
                            Consider increasing position sizes gradually.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                        <div>
                          <h4 className="font-medium text-white mb-1">Risk Management</h4>
                          <p className="text-sm text-slate-300">
                            Average loss is higher than ideal. Consider tightening stop losses 
                            or reducing position sizes during volatile periods.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-blue-400 mt-1" />
                        <div>
                          <h4 className="font-medium text-white mb-1">Optimal Timing</h4>
                          <p className="text-sm text-slate-300">
                            Best performance during London session (08:00-16:00 GMT). 
                            Focus trading activity during these hours for maximum efficiency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Strategies</CardTitle>
              <CardDescription>Select a strategy to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategies.map(strategy => (
                  <div
                    key={strategy.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedStrategy === strategy.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-slate-800/30 hover:bg-slate-700/30'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{strategy.name}</h4>
                      <Badge variant="outline" className={getRiskColor(strategy.riskScore)}>
                        {strategy.riskScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{strategy.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{strategy.trades} trades</span>
                      <span className={`font-medium ${getWinRateColor(strategy.winRate)}`}>
                        {strategy.winRate}% win rate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Optimize Strategy
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  AI Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StrategyAnalysis; 