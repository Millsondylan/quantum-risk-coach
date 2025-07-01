import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  percentChange: number;
  allocation: number;
  marketValue: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  cashBalance: number;
  marginUsed: number;
  marginAvailable: number;
  exposure: number;
}

const PortfolioManager = () => {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 125847.63,
    totalPnL: 12847.63,
    totalPnLPercent: 11.37,
    dayChange: 1234.56,
    dayChangePercent: 0.99,
    cashBalance: 25000.00,
    marginUsed: 15000.00,
    marginAvailable: 35000.00,
    exposure: 0.65
  });

  const [positions, setPositions] = useState<Position[]>([
    {
      symbol: 'EURUSD',
      quantity: 5.5,
      avgPrice: 1.0825,
      currentPrice: 1.0875,
      unrealizedPnL: 2750.00,
      percentChange: 4.62,
      allocation: 35.2,
      marketValue: 44287.50
    },
    {
      symbol: 'GBPUSD',
      quantity: -3.2,
      avgPrice: 1.2680,
      currentPrice: 1.2620,
      unrealizedPnL: 1920.00,
      percentChange: -4.73,
      allocation: 25.8,
      marketValue: 32468.40
    },
    {
      symbol: 'USDJPY',
      quantity: 2.1,
      avgPrice: 149.25,
      currentPrice: 150.75,
      unrealizedPnL: 3150.00,
      percentChange: 1.00,
      allocation: 20.1,
      marketValue: 25295.25
    },
    {
      symbol: 'BTCUSD',
      quantity: 0.5,
      avgPrice: 42500.00,
      currentPrice: 45200.00,
      unrealizedPnL: 1350.00,
      percentChange: 6.35,
      allocation: 15.7,
      marketValue: 19796.48
    },
    {
      symbol: 'XAUUSD',
      quantity: 1.2,
      avgPrice: 2048.50,
      currentPrice: 2065.30,
      unrealizedPnL: 20.16,
      percentChange: 0.82,
      allocation: 3.2,
      marketValue: 4000.00
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  const assetAllocation = [
    { name: 'Forex', value: 81.1, amount: 102051.15, color: '#3b82f6' },
    { name: 'Crypto', value: 15.7, amount: 19796.48, color: '#f59e0b' },
    { name: 'Commodities', value: 3.2, amount: 4000.00, color: '#10b981' }
  ];

  const performanceData = [
    { date: '1/1', value: 113000 },
    { date: '1/8', value: 115500 },
    { date: '1/15', value: 118200 },
    { date: '1/22', value: 121800 },
    { date: '1/29', value: 125847 }
  ];

  const riskMetrics = [
    { metric: 'Value at Risk (95%)', value: '$4,523', status: 'moderate' },
    { metric: 'Maximum Drawdown', value: '8.2%', status: 'good' },
    { metric: 'Sharpe Ratio', value: '1.45', status: 'excellent' },
    { metric: 'Beta', value: '0.78', status: 'good' }
  ];

  const refreshPortfolio = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update positions with slight price changes
      setPositions(prev => prev.map(pos => ({
        ...pos,
        currentPrice: pos.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        unrealizedPnL: pos.unrealizedPnL * (1 + (Math.random() - 0.5) * 0.1)
      })));
      setIsLoading(false);
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    if (hideValues) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (hideValues) return '••••';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-green-400" />
            <span>Portfolio Management</span>
          </h2>
          <p className="text-slate-400">Live portfolio tracking and performance analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideValues(!hideValues)}
            className="border-slate-600 text-slate-300"
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPortfolio}
            disabled={isLoading}
            className="border-cyan-500 text-cyan-400"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioMetrics.totalValue)}
                </p>
                <p className={`text-sm ${portfolioMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(portfolioMetrics.totalPnL)} ({formatPercent(portfolioMetrics.totalPnLPercent)})
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Daily Change</p>
                <p className={`text-2xl font-bold ${portfolioMetrics.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(portfolioMetrics.dayChange)}
                </p>
                <p className={`text-sm ${portfolioMetrics.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(portfolioMetrics.dayChangePercent)}
                </p>
              </div>
              {portfolioMetrics.dayChange >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cash Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioMetrics.cashBalance)}
                </p>
                <p className="text-sm text-slate-400">Available for trading</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Portfolio Exposure</p>
                <p className="text-2xl font-bold text-white">
                  {hideValues ? '••••' : `${(portfolioMetrics.exposure * 100).toFixed(1)}%`}
                </p>
                <p className="text-sm text-slate-400">Risk utilization</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>Current market positions and P&L</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.symbol} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-white">{position.symbol}</h3>
                        <p className="text-sm text-slate-400">
                          {position.quantity > 0 ? 'Long' : 'Short'} {Math.abs(position.quantity)} lots
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Avg Price</p>
                        <p className="font-medium text-white">{formatCurrency(position.avgPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Current Price</p>
                        <p className="font-medium text-white">{formatCurrency(position.currentPrice)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.unrealizedPnL)}
                      </p>
                      <p className={`text-sm ${position.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(position.percentChange)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Allocation Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetAllocation.map((asset) => (
                    <div key={asset.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{asset.name}</span>
                        <span className="text-slate-400">{asset.value}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{formatCurrency(asset.amount)}</span>
                        <Progress value={asset.value} className="w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>30-day portfolio value trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Portfolio risk metrics and exposure analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Risk Metrics</h4>
                  {riskMetrics.map((metric) => (
                    <div key={metric.metric} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-300">{metric.metric}</span>
                      <div className="text-right">
                        <span className="font-semibold text-white">{metric.value}</span>
                        <Badge className={`ml-2 ${getStatusColor(metric.status)}`} variant="outline">
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Margin Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Margin Used</span>
                      <span className="text-white font-semibold">{formatCurrency(portfolioMetrics.marginUsed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Margin Available</span>
                      <span className="text-green-400 font-semibold">{formatCurrency(portfolioMetrics.marginAvailable)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Margin Utilization</span>
                      <span className="text-white font-semibold">
                        {((portfolioMetrics.marginUsed / (portfolioMetrics.marginUsed + portfolioMetrics.marginAvailable)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(portfolioMetrics.marginUsed / (portfolioMetrics.marginUsed + portfolioMetrics.marginAvailable)) * 100} 
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManager; 