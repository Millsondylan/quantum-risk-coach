import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Zap,
  Database,
  AlertTriangle,
  Thermometer,
  Scale,
  AreaChart
} from 'lucide-react';
import { tradeAnalyticsService, type Analytics } from '@/lib/tradeAnalyticsService';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { localDatabase } from '@/lib/localDatabase';
import { Trade } from '@/lib/localDatabase';
import { advancedAnalyticsService, AITradeInsights } from '@/lib/advancedAnalytics';
import { Trade as LocalStorageTrade } from '@/lib/localStorage';
import { Trade as LocalDatabaseTrade } from '@/lib/localDatabase';
import { Trade as AdvancedTrade } from '@/lib/advancedAnalytics';

const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState<Analytics | null>(null);
  const [aiInsights, setAIInsights] = useState<AITradeInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get all trades from the database
        const allTrades = await localDatabase.getTrades();
        
        // Only proceed if we have real trade data
        if (allTrades.length === 0) {
          setMetrics(null);
          setAIInsights(null);
          return;
        }
        
        const analyticsData = tradeAnalyticsService.calculateAnalytics(allTrades);
        const convertedTrades: AdvancedTrade[] = allTrades.map(trade => {
          // Ensure all required fields are present and typed correctly
          const baseTrade: AdvancedTrade = {
            id: trade.id || '',
            symbol: trade.symbol || '',
            type: trade.side === 'buy' ? 'long' : 'short',
            side: trade.side,
            entryPrice: trade.price || 0,
            exitPrice: trade.price || 0,
            entryTime: trade.entryDate || '',
            exitTime: trade.exitDate || '',
            profit: trade.profit || 0,
            quantity: trade.amount || 0,
            mood: trade.mood || 'neutral',
            emotion: (trade.mood === 'calm' ? 'calm' : 
                     trade.mood === 'stressed' ? 'anxious' : 
                     trade.mood === 'excited' ? 'excited' : 
                     trade.mood === 'fearful' ? 'anxious' : 
                     'calm') as 'calm' | 'anxious' | 'excited' | 'frustrated'
          };

          return baseTrade;
        });
        const aiTradeInsights = advancedAnalyticsService.generateAITradeInsights(convertedTrades);
        
        setMetrics(analyticsData);
        setAIInsights(aiTradeInsights);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setMetrics(null);
        setAIInsights(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const getApiStatusColor = () => {
    if (loading) return 'text-yellow-400';
    if (metrics && metrics.totalTrades > 0) return 'text-emerald-400'; // Only green if data is present
    if (metrics && metrics.totalTrades === 0) return 'text-yellow-400'; // Yellow if no trades
    return 'text-red-400';
  };

  const getApiStatusBg = () => {
    if (loading) return 'bg-yellow-500/10 border-yellow-500/20';
    if (metrics && metrics.totalTrades > 0) return 'bg-emerald-500/10 border-emerald-500/20';
    if (metrics && metrics.totalTrades === 0) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
            <p className="text-slate-400">Real-time trading performance analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center gap-2 px-3 py-1 ${getApiStatusBg()} rounded-lg border`}>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-yellow-400">LOADING</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading real market analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || metrics.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
            <p className="text-slate-400">Real-time trading performance analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center gap-2 px-3 py-1 ${getApiStatusBg()} rounded-lg border`}>
              <div className={`w-2 h-2 ${metrics && metrics.totalTrades === 0 ? 'bg-yellow-400' : 'bg-red-400'} rounded-full`}></div>
              <span className="text-xs font-medium text-yellow-400">
                {metrics && metrics.totalTrades === 0 ? 'NO DATA' : 'API ERROR'}
              </span>
            </div>
          </div>
        </div>
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-slate-400">No trades recorded yet or API error.</p>
              <p className="text-sm text-slate-500">Add some trades to see your advanced analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-slate-400">Real-time trading performance analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center gap-2 px-3 py-1 ${getApiStatusBg()} rounded-lg border`}>
            <div className={`w-2 h-2 ${metrics.totalTrades > 0 ? 'bg-emerald-400' : 'bg-yellow-400'} rounded-full ${metrics.totalTrades > 0 ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-medium ${getApiStatusColor()}`}>
              {metrics.totalTrades > 0 ? 'LIVE DATA' : 'NO DATA'}
            </span>
          </div>
        </div>
      </div>

      {/* Risk-Adjusted Metrics */}
      {metrics.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Sharpe Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.sharpeRatio.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Risk-adjusted return</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Sortino Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.sortinoRatio.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Risk-adjusted return (downside)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drawdown Visualization */}
      {metrics.drawdownPeriods.length > 0 && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AreaChart className="h-5 w-5" />
              Maximum Drawdown: {metrics.maxDrawdown.toFixed(2)}%
            </CardTitle>
            <CardDescription>Periods of peak-to-trough decline in your portfolio's equity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.drawdownPeriods}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ccc"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#ccc" 
                  tickFormatter={(tick) => `${tick}%`}
                  domain={['auto', 'auto']}
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EF4444" // Red for drawdown
                  fill="#EF4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">Highlights periods of maximum capital loss.</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Profit Chart */}
      {metrics.profitByMonth.length > 0 && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Profit
            </CardTitle>
            <CardDescription>Cumulative profit/loss per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.profitByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" tickFormatter={(tick) => `$${tick}`} />
                <Tooltip formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Profit']} />
                <Legend />
                <Bar dataKey="profit" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Weekly Profit Chart */}
      {metrics.profitByWeek.length > 0 && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Profit
            </CardTitle>
            <CardDescription>Cumulative profit/loss per week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.profitByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#ccc" />
                <YAxis stroke="#ccc" tickFormatter={(tick) => `$${tick}`} />
                <Tooltip formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Profit']} />
                <Legend />
                <Bar dataKey="profit" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Heatmap Section */}
      {metrics.profitHeatmapData.length > 0 && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Trade Profit Heatmap (Daily & Hourly)
            </CardTitle>
            <CardDescription>Visualize profitable trading times by day and hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={metrics.profitHeatmapData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(tick) => `${tick}:00`} 
                  stroke="#ccc"
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis 
                  dataKey="day" 
                  type="category" 
                  stroke="#ccc"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ payload, label, active }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-700/80 p-2 rounded-md shadow-lg border border-slate-600 text-white text-sm">
                          <p className="font-semibold">{data.day}, {data.hour}:00 - {data.hour + 1}:00</p>
                          <p>Profit: <span className={data.profit >= 0 ? 'text-green-400' : 'text-red-400'}>{data.profit.toFixed(2)}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="profit">
                  {metrics.profitHeatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">Higher bars indicate higher profits during that hour and day.</p>
          </CardContent>
        </Card>
      )}

      {/* Best/Worst Symbol & Session */}
      {metrics.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white">Best Performing Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.bestSymbol.symbol}</div>
              <div className="text-sm text-slate-400">
                {metrics.bestSymbol.trades} trades, {metrics.bestSymbol.winRate}% win rate
              </div>
              <div className={`text-lg font-semibold ${metrics.bestSymbol.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.bestSymbol.profit >= 0 ? '+' : ''}{metrics.bestSymbol.profit.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white">Best Trading Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.bestSession.name}</div>
              <div className="text-sm text-slate-400">
                {metrics.bestSession.trades} trades, {metrics.bestSession.winRate}% win rate
              </div>
              <div className={`text-lg font-semibold ${metrics.bestSession.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.bestSession.profit >= 0 ? '+' : ''}{metrics.bestSession.profit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI-Powered Trade Insights */}
      {aiInsights && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              AI Trade Insights
            </CardTitle>
            <CardDescription>Personalized trading recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Emotional Trading Analysis</h3>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">Most Frequent Mood: {aiInsights.emotionalTradingTrends.mostFrequentMood}</span>
                <Badge variant={aiInsights.emotionalTradingTrends.impactOnPerformance > 0 ? 'default' : 'destructive'}>
                  {aiInsights.emotionalTradingTrends.impactOnPerformance > 0 ? 'Positive' : 'Negative'} Impact
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Improvement Areas</h3>
              <ul className="space-y-1">
                {aiInsights.potentialImprovementAreas.map((area, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-slate-300">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Next Trade Prediction</h3>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">
                  Recommended Action: {aiInsights.predictedNextTradeOutcome.recommendedAction}
                </span>
                <Progress 
                  value={aiInsights.predictedNextTradeOutcome.probability * 100} 
                  className="w-1/2" 
                />
                <span className="text-xs text-slate-400">
                  {(aiInsights.predictedNextTradeOutcome.probability * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Recommended Strategies</h3>
              <div className="flex flex-wrap gap-2">
                {aiInsights.recommendedStrategies.map((strategy, index) => (
                  <Badge key={index} variant="outline" className="text-cyan-300 border-cyan-300/50">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAnalytics; 