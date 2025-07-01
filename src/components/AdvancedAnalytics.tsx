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
  Zap
} from 'lucide-react';
import { analyticsService, AnalyticsMetrics, TimeBasedMetrics } from '@/lib/api';

const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeMetrics, setTimeMetrics] = useState<TimeBasedMetrics | null>(null);
  const [positionComparison, setPositionComparison] = useState<any>(null);
  const [symbolPerformance, setSymbolPerformance] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Mock trade data for demonstration
  const mockTrades = [
    { id: 1, profit_loss: 150, opened_at: '2024-01-01T10:00:00Z', closed_at: '2024-01-01T14:00:00Z', trade_type: 'buy', instrument: 'EURUSD' },
    { id: 2, profit_loss: -50, opened_at: '2024-01-02T09:00:00Z', closed_at: '2024-01-02T11:00:00Z', trade_type: 'sell', instrument: 'GBPUSD' },
    { id: 3, profit_loss: 200, opened_at: '2024-01-03T08:00:00Z', closed_at: '2024-01-03T16:00:00Z', trade_type: 'buy', instrument: 'EURUSD' },
    { id: 4, profit_loss: -75, opened_at: '2024-01-04T12:00:00Z', closed_at: '2024-01-04T15:00:00Z', trade_type: 'sell', instrument: 'USDJPY' },
    { id: 5, profit_loss: 300, opened_at: '2024-01-05T07:00:00Z', closed_at: '2024-01-05T18:00:00Z', trade_type: 'buy', instrument: 'EURUSD' },
  ];

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [metricsData, timeData, positionData, symbolData] = await Promise.all([
          analyticsService.calculateMetrics(mockTrades),
          analyticsService.calculateTimeBasedMetrics(mockTrades),
          analyticsService.comparePositions(mockTrades),
          analyticsService.analyzeSymbolPerformance(mockTrades)
        ]);

        setMetrics(metricsData);
        setTimeMetrics(timeData);
        setPositionComparison(positionData);
        setSymbolPerformance(symbolData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

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
          <BarChart3 className="h-5 w-5" />
          Advanced Analytics
        </CardTitle>
        <CardDescription>
          Comprehensive trading performance analysis with risk metrics and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(metrics?.winRate || 0)}</p>
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
                      <p className="text-2xl font-bold">{metrics?.profitFactor.toFixed(2) || '0.00'}</p>
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
                      <p className="text-2xl font-bold">{metrics?.riskRewardRatio.toFixed(2) || '0.00'}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics?.maxDrawdown || 0)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
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
                    <Badge variant="outline">{metrics?.totalTrades || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profitable Trades</span>
                    <Badge variant="default" className="bg-green-500">{metrics?.profitableTrades || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Losing Trades</span>
                    <Badge variant="destructive">{metrics?.losingTrades || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Win</span>
                    <span className={getMetricColor(metrics?.averageWin || 0, 'positive')}>
                      {formatCurrency(metrics?.averageWin || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Loss</span>
                    <span className={getMetricColor(metrics?.averageLoss || 0, 'negative')}>
                      {formatCurrency(metrics?.averageLoss || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Position Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Long Positions</span>
                        <span className="text-sm text-muted-foreground">
                          {positionComparison?.long.count || 0} trades
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total P&L</span>
                          <span className={getMetricColor(positionComparison?.long.totalProfit || 0, 'positive')}>
                            {formatCurrency(positionComparison?.long.totalProfit || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Win Rate</span>
                          <span>{formatPercentage(positionComparison?.long.winRate || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Short Positions</span>
                        <span className="text-sm text-muted-foreground">
                          {positionComparison?.short.count || 0} trades
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total P&L</span>
                          <span className={getMetricColor(positionComparison?.short.totalProfit || 0, 'positive')}>
                            {formatCurrency(positionComparison?.short.totalProfit || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Win Rate</span>
                          <span>{formatPercentage(positionComparison?.short.winRate || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily P&L Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: 'Mon', pnl: 150 },
                      { date: 'Tue', pnl: -50 },
                      { date: 'Wed', pnl: 200 },
                      { date: 'Thu', pnl: -75 },
                      { date: 'Fri', pnl: 300 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cumulative P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: 'Mon', cumulative: 150 },
                      { date: 'Tue', cumulative: 100 },
                      { date: 'Wed', cumulative: 300 },
                      { date: 'Thu', cumulative: 225 },
                      { date: 'Fri', cumulative: 525 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hourly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(timeMetrics?.hourlyPerformance || {}).map(([hour, pnl]) => ({
                      hour: `${hour}:00`,
                      pnl
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="pnl" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trade Duration Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Short Term', value: timeMetrics?.tradeDurationAnalysis.shortTerm.count || 0, color: '#3b82f6' },
                          { name: 'Medium Term', value: timeMetrics?.tradeDurationAnalysis.mediumTerm.count || 0, color: '#10b981' },
                          { name: 'Long Term', value: timeMetrics?.tradeDurationAnalysis.longTerm.count || 0, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {[
                          { name: 'Short Term', value: timeMetrics?.tradeDurationAnalysis.shortTerm.count || 0, color: '#3b82f6' },
                          { name: 'Medium Term', value: timeMetrics?.tradeDurationAnalysis.mediumTerm.count || 0, color: '#10b981' },
                          { name: 'Long Term', value: timeMetrics?.tradeDurationAnalysis.longTerm.count || 0, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="symbols" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Symbol Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {symbolPerformance.map((symbol) => (
                    <div key={symbol.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold">{symbol.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {symbol.totalTrades} trades
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total P&L</div>
                          <div className={getMetricColor(symbol.totalProfit, 'positive')}>
                            {formatCurrency(symbol.totalProfit)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                          <div>{formatPercentage(symbol.winRate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Wins/Losses</div>
                          <div className="text-sm">
                            {symbol.wins}/{symbol.losses}
                          </div>
                        </div>
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

export default AdvancedAnalytics; 