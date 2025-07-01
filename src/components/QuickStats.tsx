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
  Database,
  Shield,
  Wifi,
  Eye,
  BarChart3
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
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [balance, setBalance] = useState(12450.25);
  const [totalTrades, setTotalTrades] = useState(127);
  const [winRate, setWinRate] = useState(67.3);
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [showDetailsView, setShowDetailsView] = useState(false);

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'disconnected': return 'Not Connected';
      case 'connecting': return 'Connecting...';
      case 'connected': return `Connected (${availableSources.length} sources)`;
      default: return 'Unknown';
    }
  };

  return (
    <div className="quickstats-container">
      {/* Header Section */}
      <div className="quickstats-header">
        <div className="flex items-center gap-3">
          <div className="quickstats-icon">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="quickstats-title">Portfolio Overview</h2>
            <p className="quickstats-subtitle">
              Real-time performance & market data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailsView(!showDetailsView)}
            className="hidden sm:flex"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetailsView ? 'Simple' : 'Details'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="quickstats-grid">
        {/* Account Balance */}
        <Card className="quickstats-card priority-high">
          <CardContent className="quickstats-card-content">
            <div className="stat-header">
              <div className="stat-icon balance">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="stat-label">Balance</span>
            </div>
            <div className="stat-value">${balance.toLocaleString()}</div>
            <div className="stat-change positive">
              <TrendingUp className="h-3 w-3" />
              +2.1% today
            </div>
          </CardContent>
        </Card>

        {/* Total Trades */}
        <Card className="quickstats-card">
          <CardContent className="quickstats-card-content">
            <div className="stat-header">
              <div className="stat-icon trades">
                <Target className="h-5 w-5" />
              </div>
              <span className="stat-label">Trades</span>
            </div>
            <div className="stat-value">{totalTrades}</div>
            <div className="stat-change neutral">
              {winRate}% win rate
            </div>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card className="quickstats-card">
          <CardContent className="quickstats-card-content">
            <div className="stat-header">
              <div className="stat-icon risk">
                <Shield className="h-5 w-5" />
              </div>
              <span className="stat-label">Risk</span>
            </div>
            <div className="stat-value">{riskLevel}</div>
            <div className="stat-change neutral">
              Balanced strategy
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="quickstats-card">
          <CardContent className="quickstats-card-content">
            <div className="stat-header">
              <div className="stat-icon connection">
                <Wifi className="h-5 w-5" />
              </div>
              <span className="stat-label">Data</span>
            </div>
            <div className="stat-value-small">
              {apiStatus === 'connected' ? 'Live' : 'Offline'}
            </div>
            <div className="stat-change neutral">
              {availableSources.length} sources
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data Section - Conditional */}
      {showDetailsView && (
        <div className="market-data-section">
          <div className="section-divider">
            <h3 className="section-title">Market Data</h3>
            <Badge variant="outline" className="text-xs">
              Live Updates
            </Badge>
          </div>

          {apiStatus === 'error' ? (
            <Card className="error-card">
              <CardContent className="error-content">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div className="error-text">
                  <p className="error-title">Unable to load market data</p>
                  <p className="error-subtitle">Check your API configuration</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="market-grid">
              {stats.slice(0, 8).map((stat) => (
                <Card key={stat.id} className="market-card">
                  <CardContent className="market-card-content">
                    <div className="market-header">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="market-symbol">{stat.title}</span>
                      </div>
                      {getTrendIcon(stat.trend)}
                    </div>
                    <div className="market-price">{stat.value}</div>
                    <div className="market-change">
                      <span className={getChangeColor(stat.changePercent)}>
                        {stat.changePercent > 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Footer */}
      <div className="quickstats-footer">
        <div className="status-indicator">
          <div className={`status-dot ${apiStatus === 'connected' ? 'online' : 'offline'}`}></div>
          <span className="status-text">
            {apiStatus === 'connected' 
              ? `Live data from ${availableSources.length} sources` 
              : 'Market data unavailable'}
          </span>
        </div>
        <span className="update-time">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default QuickStats;
