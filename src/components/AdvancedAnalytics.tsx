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
  AlertTriangle
} from 'lucide-react';
import { analyticsService, AnalyticsMetrics, TimeBasedMetrics } from '@/lib/api';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeMetrics, setTimeMetrics] = useState<TimeBasedMetrics | null>(null);
  const [positionComparison, setPositionComparison] = useState<any>(null);
  const [symbolPerformance, setSymbolPerformance] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch real analytics data from the API
        const [metricsData, timeData, positionData, symbolData] = await Promise.all([
          analyticsService.calculateMetrics([]),
          analyticsService.calculateTimeBasedMetrics([]),
          analyticsService.comparePositions([]),
          analyticsService.analyzeSymbolPerformance([])
        ]);

        setMetrics(metricsData);
        setTimeMetrics(timeData);
        setPositionComparison(positionData);
        setSymbolPerformance(symbolData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, selectedPeriod]);

  const getApiStatusColor = () => {
    if (loading) return 'text-yellow-400';
    if (metrics) return 'text-emerald-400';
    return 'text-red-400';
  };

  const getApiStatusBg = () => {
    if (loading) return 'bg-yellow-500/10 border-yellow-500/20';
    if (metrics) return 'bg-emerald-500/10 border-emerald-500/20';
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

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
            <p className="text-slate-400">Real-time trading performance analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center gap-2 px-3 py-1 ${getApiStatusBg()} rounded-lg border`}>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs font-medium text-red-400">API ERROR</span>
            </div>
          </div>
        </div>
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-slate-400">Unable to load analytics data</p>
              <p className="text-sm text-slate-500">Check your API configuration</p>
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
            <div className={`w-2 h-2 ${metrics ? (metrics.totalTrades > 0 ? 'bg-emerald-400' : 'bg-yellow-400') : 'bg-red-400'} rounded-full ${metrics ? (metrics.totalTrades > 0 ? 'animate-pulse' : '') : ''}`}></div>
            <span className={`text-xs font-medium ${getApiStatusColor()}`}>
              {metrics ? (metrics.totalTrades > 0 ? 'LIVE DATA' : 'NO DATA') : 'API ERROR'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      {/* {availableSources.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Connected Analytics Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSources.map(source => (
              <Badge key={source} variant="outline" className="text-xs text-slate-300 border-slate-600">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )} */}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <Card className="holo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Instruments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.totalTrades}</div>
              <p className="text-xs text-slate-400">Active market instruments</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Positive Changes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.winRate.toFixed(1)}%</div>
              <p className="text-xs text-slate-400">Instruments with gains</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Average Change</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.averageWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.averageWin >= 0 ? '+' : ''}{metrics.averageWin.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-400">Average market movement</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Max Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{metrics.maxDrawdown.toFixed(2)}%</div>
              <p className="text-xs text-slate-400">Largest decline</p>
            </CardContent>
          </Card>
        </div>
      )}

      {timeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white">Daily Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{timeMetrics.dailyPerformance['Monday']}</div>
              <p className="text-xs text-slate-400">Monday</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white">Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{timeMetrics.dailyPerformance['Tuesday']}</div>
              <p className="text-xs text-slate-400">Tuesday</p>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-white">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{timeMetrics.monthlyPerformance['January']}</div>
              <p className="text-xs text-slate-400">January</p>
            </CardContent>
          </Card>
        </div>
      )}

      {positionComparison && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white">Market Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Forex</h4>
                <div className="text-2xl font-bold text-white">{positionComparison.forex.count}</div>
                <div className={`text-lg font-semibold ${positionComparison.forex.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {positionComparison.forex.total >= 0 ? '+' : ''}{positionComparison.forex.total.toFixed(2)}%
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Crypto</h4>
                <div className="text-2xl font-bold text-white">{positionComparison.crypto.count}</div>
                <div className={`text-lg font-semibold ${positionComparison.crypto.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {positionComparison.crypto.total >= 0 ? '+' : ''}{positionComparison.crypto.total.toFixed(2)}%
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Stocks</h4>
                <div className="text-2xl font-bold text-white">{positionComparison.stocks.count}</div>
                <div className={`text-lg font-semibold ${positionComparison.stocks.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {positionComparison.stocks.total >= 0 ? '+' : ''}{positionComparison.stocks.total.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {symbolPerformance.length > 0 && (
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {symbolPerformance.slice(0, 10).map((symbol, index) => (
                <div key={symbol.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-white">{symbol.symbol}</span>
                  </div>
                  <div className={`text-sm font-semibold ${symbol.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {symbol.change >= 0 ? '+' : ''}{symbol.change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAnalytics; 