import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Terminal, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  mt5Service, 
  MT5AccountInfo, 
  MT5Position, 
  MT5Deal, 
  MT5ConnectionConfig,
  MT5ImportResult 
} from '@/lib/mt5Integration';
import { useLocalTrades } from '@/hooks/useLocalTrades';

interface MT5ConnectionPanelProps {
  onImportComplete?: () => void;
}

const MT5ConnectionPanel: React.FC<MT5ConnectionPanelProps> = ({ onImportComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountInfo, setAccountInfo] = useState<MT5AccountInfo | null>(null);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<MT5Deal[]>([]);
  const [importResult, setImportResult] = useState<MT5ImportResult | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  const { addTrade } = useLocalTrades();

  // Connection form state
  const [connectionConfig, setConnectionConfig] = useState<MT5ConnectionConfig>({
    accountId: 0,
    serverName: '',
    password: '',
    isReadOnly: true
  });

  useEffect(() => {
    // Check if already connected
    setIsConnected(mt5Service.getConnectionStatus());
    if (isConnected) {
      loadMT5Data();
    }
  }, []);

  const handleConnect = async () => {
    if (!connectionConfig.accountId || !connectionConfig.serverName || !connectionConfig.password) {
      toast.error('Please fill in all connection details');
      return;
    }

    setIsConnecting(true);
    try {
      const success = await mt5Service.connect(connectionConfig);
      setIsConnected(success);
      
      if (success) {
        await loadMT5Data();
        toast.success('Connected to MetaTrader5 successfully');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to MetaTrader5');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await mt5Service.disconnect();
    setIsConnected(false);
    setAccountInfo(null);
    setPositions([]);
    setTradeHistory([]);
    setImportResult(null);
  };

  const loadMT5Data = async () => {
    if (!isConnected) return;

    try {
      // Load account info
      const account = await mt5Service.getAccountInfo();
      setAccountInfo(account);

      // Load positions
      const pos = await mt5Service.getPositions();
      setPositions(pos);

      // Load recent trade history
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);
      const history = await mt5Service.getTradeHistory(fromDate);
      setTradeHistory(history);
    } catch (error) {
      console.error('Error loading MT5 data:', error);
    }
  };

  const handleImportTrades = async () => {
    if (!isConnected) {
      toast.error('Not connected to MT5');
      return;
    }

    setIsImporting(true);
    try {
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      // Calculate date range
      switch (dateRange) {
        case '7d':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case '30d':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 30);
          break;
        case '90d':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 90);
          break;
        case 'custom':
          if (customFromDate) fromDate = new Date(customFromDate);
          if (customToDate) toDate = new Date(customToDate);
          break;
      }

      const result = await mt5Service.importTrades(fromDate, toDate);
      setImportResult(result);

      if (result.success) {
        onImportComplete?.();
        toast.success(`Successfully imported ${result.importedTrades} trades and ${result.importedPositions} positions`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import trades');
    } finally {
      setIsImporting(false);
    }
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'custom': return 'Custom range';
      default: return 'Last 7 days';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            MetaTrader5 Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account ID</Label>
                  <Input
                    id="accountId"
                    type="number"
                    placeholder="12345678"
                    value={connectionConfig.accountId || ''}
                    onChange={(e) => setConnectionConfig(prev => ({
                      ...prev,
                      accountId: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input
                    id="serverName"
                    placeholder="YourBroker-Server"
                    value={connectionConfig.serverName}
                    onChange={(e) => setConnectionConfig(prev => ({
                      ...prev,
                      serverName: e.target.value
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your investor or master password"
                    value={connectionConfig.password}
                    onChange={(e) => setConnectionConfig(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="readOnly"
                  checked={connectionConfig.isReadOnly}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    isReadOnly: e.target.checked
                  }))}
                />
                <Label htmlFor="readOnly">Read-only mode (recommended)</Label>
              </div>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Connect to MT5
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Connected to MetaTrader5</span>
                </div>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
              {accountInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-400">Balance</p>
                    <p className="font-medium">{formatCurrency(accountInfo.balance, accountInfo.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Equity</p>
                    <p className="font-medium">{formatCurrency(accountInfo.equity, accountInfo.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Profit</p>
                    <p className={`font-medium ${accountInfo.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(accountInfo.profit, accountInfo.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Leverage</p>
                    <p className="font-medium">1:{accountInfo.leverage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <>
          {/* Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                MT5 Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold">{positions.length}</p>
                  <p className="text-sm text-slate-400">Open Positions</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold">{tradeHistory.length}</p>
                  <p className="text-sm text-slate-400">Recent Trades</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold">
                    {positions.reduce((sum, pos) => sum + pos.profit, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-400">Total P&L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Trades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Import Trades to Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={dateRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange(range)}
                      >
                        {range === '7d' && '7 Days'}
                        {range === '30d' && '30 Days'}
                        {range === '90d' && '90 Days'}
                        {range === 'custom' && 'Custom'}
                      </Button>
                    ))}
                  </div>
                </div>

                {dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={customFromDate}
                        onChange={(e) => setCustomFromDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={customToDate}
                        onChange={(e) => setCustomToDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleImportTrades}
                    disabled={isImporting}
                    className="flex-1"
                  >
                    {isImporting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Importing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Import {getDateRangeLabel()} Trades
                      </div>
                    )}
                  </Button>
                  <Button variant="outline" onClick={loadMT5Data}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {importResult && (
                  <div className={`p-4 rounded-lg ${
                    importResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {importResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {importResult.success ? 'Import Successful' : 'Import Failed'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{importResult.message}</p>
                    {importResult.success && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Imported {importResult.importedTrades} trades</p>
                        <p className="text-sm">Imported {importResult.importedPositions} positions</p>
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-400">Errors:</p>
                        <ul className="text-sm text-red-400 list-disc list-inside">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          {positions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Open Positions ({positions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {positions.map((position) => (
                    <div key={position.ticket} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={position.type === 'buy' ? 'default' : 'secondary'}>
                          {position.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{position.symbol}</p>
                          <p className="text-sm text-slate-400">
                            {position.volume} lots @ {position.price_open}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${position.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(position.profit)}
                        </p>
                        <p className="text-sm text-slate-400">
                          {formatDate(position.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Trade History */}
          {tradeHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Trade History ({tradeHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tradeHistory.slice(0, 10).map((deal) => (
                    <div key={deal.ticket} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={deal.type.includes('buy') ? 'default' : 'secondary'}>
                          {deal.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{deal.symbol}</p>
                          <p className="text-sm text-slate-400">
                            {deal.volume} lots @ {deal.price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${deal.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(deal.profit)}
                        </p>
                        <p className="text-sm text-slate-400">
                          {formatDate(deal.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MT5ConnectionPanel; 