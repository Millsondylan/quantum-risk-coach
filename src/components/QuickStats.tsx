import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Target, 
  AlertTriangle,
  RefreshCw,
  Info,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { realDataService, RealMarketData, CryptoData, StockData } from '@/lib/realDataService';

interface QuickStat {
  id: string;
  title: string;
  value: string;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  category: 'forex' | 'crypto' | 'stock' | 'index';
  source: string;
  timestamp: string;
}

const QuickStats = () => {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'];
  const cryptoPairs = ['bitcoin', 'ethereum', 'cardano', 'polkadot'];
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    setIsLoading(true);
    try {
      // Check if API keys are configured
      const apiValidation = realDataService.validateApiKeys();
      setAvailableSources(apiValidation.available);
      
      if (!apiValidation.valid) {
        setApiStatus('error');
        toast.error(`Missing API keys: ${apiValidation.missing.join(', ')}`);
        return;
      }

      const [forexData, cryptoData, stockData] = await Promise.all([
        realDataService.getRealForexData(forexPairs),
        realDataService.getRealCryptoData(cryptoPairs),
        realDataService.getRealStockData(stockSymbols)
      ]);

      const allStats: QuickStat[] = [];

      // Process Forex Data
      forexData.forEach(data => {
        allStats.push({
          id: `forex-${data.symbol}`,
          title: data.symbol,
          value: data.price.toFixed(5),
          change: data.change,
          changePercent: data.changePercent,
          trend: data.changePercent > 0 ? 'up' : data.changePercent < 0 ? 'down' : 'neutral',
          icon: <DollarSign className="h-4 w-4" />,
          color: 'text-blue-400',
          category: 'forex',
          source: data.source,
          timestamp: data.timestamp
        });
      });

      // Process Crypto Data
      cryptoData.forEach(data => {
        allStats.push({
          id: `crypto-${data.symbol}`,
          title: data.symbol,
          value: `$${data.price.toLocaleString()}`,
          change: data.change24h,
          changePercent: data.changePercent24h,
          trend: data.changePercent24h > 0 ? 'up' : data.changePercent24h < 0 ? 'down' : 'neutral',
          icon: <Activity className="h-4 w-4" />,
          color: 'text-green-400',
          category: 'crypto',
          source: 'CoinGecko/Polygon',
          timestamp: data.timestamp
        });
      });

      // Process Stock Data
      stockData.forEach(data => {
        allStats.push({
          id: `stock-${data.symbol}`,
          title: data.symbol,
          value: `$${data.price.toFixed(2)}`,
          change: data.change,
          changePercent: data.changePercent,
          trend: data.changePercent > 0 ? 'up' : data.changePercent < 0 ? 'down' : 'neutral',
          icon: <Target className="h-4 w-4" />,
          color: 'text-purple-400',
          category: 'stock',
          source: 'Yahoo Finance/Polygon/FMP',
          timestamp: data.timestamp
        });
      });

      setStats(allStats);
      setApiStatus('connected');
      toast.success(`Real market data loaded from ${availableSources.length} sources`);
    } catch (error) {
      console.error('Error fetching real stats:', error);
      setApiStatus('error');
      toast.error('Failed to load real market data. Check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return `Live Data (${availableSources.length} sources)`;
      case 'error': return 'API Error';
      default: return 'Connecting...';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const forexStats = stats.filter(stat => stat.category === 'forex');
  const cryptoStats = stats.filter(stat => stat.category === 'crypto');
  const stockStats = stats.filter(stat => stat.category === 'stock');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quick Market Stats</h2>
          <p className="text-slate-400">Real-time market data from multiple sources</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 text-sm ${getApiStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-400' : apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            <span>{getApiStatusText()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealStats}
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {isLoading ? 'Loading...' : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Data Sources Info */}
      {availableSources.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Connected Data Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSources.map(source => (
              <Badge key={source} variant="outline" className="text-xs text-slate-300 border-slate-600">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {apiStatus === 'error' ? (
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-slate-400">Unable to load market data</p>
              <p className="text-sm text-slate-500">Check your API configuration</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Forex Stats */}
          {forexStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                Forex Pairs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {forexStats.map((stat) => (
                  <Card key={stat.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {stat.icon}
                          <span className="font-medium text-white">{stat.title}</span>
                        </div>
                        {getTrendIcon(stat.trend)}
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${getChangeColor(stat.change)}`}>
                          {stat.change > 0 ? '+' : ''}{stat.change.toFixed(5)}
                        </span>
                        <span className={`text-sm ${getChangeColor(stat.changePercent)}`}>
                          {stat.changePercent > 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{stat.source}</span>
                        <span>{formatTimestamp(stat.timestamp)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Stats */}
          {cryptoStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Cryptocurrencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cryptoStats.map((stat) => (
                  <Card key={stat.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {stat.icon}
                          <span className="font-medium text-white">{stat.title}</span>
                        </div>
                        {getTrendIcon(stat.trend)}
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${getChangeColor(stat.change)}`}>
                          {stat.change > 0 ? '+' : ''}${stat.change.toFixed(2)}
                        </span>
                        <span className={`text-sm ${getChangeColor(stat.changePercent)}`}>
                          {stat.changePercent > 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{stat.source}</span>
                        <span>{formatTimestamp(stat.timestamp)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stock Stats */}
          {stockStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-400" />
                Stocks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stockStats.map((stat) => (
                  <Card key={stat.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {stat.icon}
                          <span className="font-medium text-white">{stat.title}</span>
                        </div>
                        {getTrendIcon(stat.trend)}
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${getChangeColor(stat.change)}`}>
                          {stat.change > 0 ? '+' : ''}${stat.change.toFixed(2)}
                        </span>
                        <span className={`text-sm ${getChangeColor(stat.changePercent)}`}>
                          {stat.changePercent > 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{stat.source}</span>
                        <span>{formatTimestamp(stat.timestamp)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {stats.length > 0 && (
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Showing {stats.length} instruments from {availableSources.length} data sources</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickStats;
