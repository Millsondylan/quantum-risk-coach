import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Database, 
  Shield, 
  Zap, 
  Target, 
  BarChart3, 
  Calendar,
  Download,
  Upload,
  Eye,
  EyeOff,
  Server,
  Key,
  Lock,
  Globe,
  Terminal,
  FileText,
  Plus,
  X,
  RotateCcw,
  AlertCircle,
  Info,
  Star,
  Award,
  Trophy,
  Sparkles,
  Rocket,
  Heart,
  Brain,
  Cpu,
  HardDrive,
  Network,
  Signal,
  ChevronRight,
  Bell,
  Search,
  Filter,
  Users,
  TrendingUp as TrendingUpIcon,
  PlayCircle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Wallet,
  PieChart,
  LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { 
  mt4mt5AutoSync, 
  MT4MT5Credentials, 
  MT4MT5Account, 
  SyncSettings, 
  SyncStatus, 
  SyncResult,
  MT4MT5Trade 
} from '@/lib/mt4mt5AutoSync';
import { cn } from '@/lib/utils';

interface MT4MT5AutoSyncDashboardProps {
  className?: string;
}

const MT4MT5AutoSyncDashboard: React.FC<MT4MT5AutoSyncDashboardProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [connections, setConnections] = useState<any[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<Map<string, SyncStatus>>(new Map());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Connection form state
  const [connectionForm, setConnectionForm] = useState<MT4MT5Credentials>({
    server: '',
    login: '',
    password: '',
    accountType: 'Live',
    brokerName: '',
    serverAddress: '',
    port: 443,
    useSSL: true
  });

  // Sync settings state
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: true,
    syncInterval: 30,
    syncHistoricalData: true,
    historicalDataDays: 30,
    syncOpenPositions: true,
    syncClosedTrades: true,
    syncAccountInfo: true,
    retryAttempts: 3,
    retryDelay: 5,
    alertOnSyncFailure: true,
    alertOnNewTrade: true,
    alertOnLargeLoss: true,
    largeLossThreshold: 5
  });

  // Popular brokers for quick setup
  const popularBrokers = [
    { name: 'FTMO', server: 'ftmo-server.com', port: 443, ssl: true, status: 'online', ping: 45 },
    { name: 'OANDA', server: 'mt4.oanda.com', port: 443, ssl: true, status: 'online', ping: 67 },
    { name: 'IC Markets', server: 'icmarkets-mt4.com', port: 443, ssl: true, status: 'online', ping: 32 },
    { name: 'Pepperstone', server: 'mt4.pepperstone.com', port: 443, ssl: true, status: 'online', ping: 58 },
    { name: 'FXCM', server: 'mt4.fxcm.com', port: 443, ssl: true, status: 'online', ping: 52 },
    { name: 'IG Markets', server: 'mt4.ig.com', port: 443, ssl: true, status: 'online', ping: 41 }
  ];

  // Calculate real-time stats
  const dashboardStats = useMemo(() => {
    const totalConnections = connections.length;
    const connectedCount = connections.filter(c => c.status === 'connected').length;
    const totalTradesSynced = Array.from(syncStatuses.values()).reduce((sum, status) => sum + status.totalTradesSynced, 0);
    const tradesToday = Array.from(syncStatuses.values()).reduce((sum, status) => sum + status.tradesSyncedToday, 0);
    const autoSyncEnabled = connections.filter(c => c.settings?.autoSync).length;
    const errorCount = Array.from(syncStatuses.values()).reduce((sum, status) => sum + status.errorCount, 0);

    return {
      totalConnections,
      connectedCount,
      totalTradesSynced,
      tradesToday,
      autoSyncEnabled,
      errorCount,
      successRate: totalConnections > 0 ? ((connectedCount / totalConnections) * 100) : 0
    };
  }, [connections, syncStatuses]);

  // Load connections on mount
  useEffect(() => {
    if (user) {
      loadConnections();
      initializeAutoSync();
    }
  }, [user]);

  // Initialize auto-sync module
  const initializeAutoSync = async () => {
    try {
      await mt4mt5AutoSync.initialize();
      toast.success('MT4/MT5 Auto-Sync initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auto-sync:', error);
      toast.error('Failed to initialize auto-sync module');
    }
  };

  // Load user connections
  const loadConnections = () => {
    if (!user) return;
    
    const userConnections = mt4mt5AutoSync.getUserConnections(user.id);
    setConnections(userConnections);

    // Load sync statuses
    const statuses = new Map<string, SyncStatus>();
    userConnections.forEach(conn => {
      const status = mt4mt5AutoSync.getSyncStatus(conn.id);
      if (status) {
        statuses.set(conn.id, status);
      }
    });
    setSyncStatuses(statuses);
  };

  // Connect to MT4/MT5 account
  const handleConnect = async () => {
    if (!user) {
      toast.error('Please log in to connect accounts');
      return;
    }

    if (!connectionForm.server || !connectionForm.login || !connectionForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await mt4mt5AutoSync.connectAccount(user.id, connectionForm, syncSettings);
      
      if (result.success) {
        toast.success('Successfully connected to MT4/MT5 account!');
        loadConnections();
        
        // Reset form
        setConnectionForm({
          server: '',
          login: '',
          password: '',
          accountType: 'Live',
          brokerName: '',
          serverAddress: '',
          port: 443,
          useSSL: true
        });
      } else {
        toast.error(result.message || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection failed. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from account
  const handleDisconnect = async (connectionId: string) => {
    try {
      await mt4mt5AutoSync.disconnectAccount(connectionId);
      loadConnections();
      toast.success('Account disconnected successfully');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect');
    }
  };

  // Manual sync
  const handleManualSync = async (connectionId: string) => {
    setIsSyncing(true);
    try {
      const result = await mt4mt5AutoSync.syncTrades(connectionId);
      
      if (result.success) {
        toast.success(`Sync completed: ${result.tradesSynced} trades synced`);
        loadConnections();
        setLastSync(new Date());
      } else {
        toast.error(`Sync failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Manual sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Update sync settings
  const handleUpdateSettings = async (connectionId: string, settings: Partial<SyncSettings>) => {
    try {
      await mt4mt5AutoSync.updateSyncSettings(connectionId, settings);
      toast.success('Settings updated successfully');
      loadConnections();
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  };

  // Quick connect with popular broker
  const handleQuickConnect = (broker: any) => {
    setConnectionForm(prev => ({
      ...prev,
      brokerName: broker.name,
      server: broker.server,
      port: broker.port,
      useSSL: broker.ssl
    }));
    toast.info(`Selected ${broker.name} - Fill in your credentials and connect`);
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      loadConnections();
      // Trigger manual sync for all connected accounts
      for (const connection of connections) {
        if (connection.status === 'connected') {
          await handleManualSync(connection.id);
        }
      }
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  // Get connection status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Get connection quality icon
  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'good': return <Wifi className="w-4 h-4 text-blue-400" />;
      case 'poor': return <Wifi className="w-4 h-4 text-yellow-400" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-400" />;
      default: return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get broker status color
  const getBrokerStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (connections.length) {
        connections.forEach(conn => handleSync(conn.id));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [connections]);

  const handleSync = async (connectionId: string) => {
    try {
      setSyncing(true);
      const result = await mt4mt5AutoSync.syncTrades(connectionId);
      if (result.success) {
        toast.success(`Sync completed: ${result.tradesSynced} trades`);
        setLastSync(new Date());
        loadConnections();
      } else {
        toast.error('Sync failed');
      }
    } catch (e) {
      toast.error('Sync error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* UltraTrader Style Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            MT4/MT5 Auto-Sync Hub
          </h2>
          <p className="text-slate-400 mt-2">
            Seamlessly sync your MetaTrader accounts with real-time trade data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            <Zap className="w-3 h-3 mr-1" />
            Auto-Sync Active
          </Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Shield className="w-3 h-3 mr-1" />
            Secure
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards - UltraTrader Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-medium">Total Accounts</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.totalConnections}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dashboardStats.connectedCount} connected
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400 font-medium">Trades Synced</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.totalTradesSynced}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dashboardStats.tradesToday} today
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400 font-medium">Auto-Sync</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.autoSyncEnabled}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dashboardStats.successRate.toFixed(1)}% success
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400 font-medium">Sync Errors</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.errorCount}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dashboardStats.errorCount === 0 ? 'All good' : 'Check connections'}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="connect" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Connection Status Cards */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Broker Connections</h2>
            {lastSync && (
              <Badge variant="outline" className="text-xs">
                Last sync {Math.floor((Date.now()-lastSync.getTime())/1000)}s ago
              </Badge>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => {
              const status = syncStatuses.get(connection.id);
              return (
                <Card key={connection.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors">
                        {connection.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={cn("border-slate-600", getStatusColor(connection.status))}
                      >
                        {connection.status === 'connected' && <Wifi className="w-3 h-3 mr-1" />}
                        {connection.status === 'connecting' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                        {connection.status === 'disconnected' && <WifiOff className="w-3 h-3 mr-1" />}
                        {connection.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      {connection.credentials.server}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Connection Quality */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Connection Quality</span>
                      <div className="flex items-center gap-2">
                        {status && getQualityIcon(status.connectionQuality)}
                        <span className="text-sm text-white capitalize">
                          {status?.connectionQuality || 'unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Last Sync */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Last Sync</span>
                      <span className="text-sm text-white">
                        {status?.lastSyncTime ? 
                          new Date(status.lastSyncTime).toLocaleTimeString() : 
                          'Never'
                        }
                      </span>
                    </div>

                    {/* Trades Synced */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Trades Synced</span>
                      <span className="text-sm text-white font-semibold">
                        {status?.totalTradesSynced || 0}
                      </span>
                    </div>

                    {/* Error Count */}
                    {status && status.errorCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-400">Errors</span>
                        <span className="text-sm text-red-400 font-semibold">
                          {status.errorCount}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManualSync(connection.id)}
                        disabled={isSyncing || connection.status !== 'connected'}
                        className="flex-1 border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/10 text-cyan-400"
                      >
                        <RefreshCw className={cn("w-3 h-3 mr-1", isSyncing && "animate-spin")} />
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(connection.id)}
                        className="border-red-600/30 hover:border-red-500 hover:bg-red-500/10 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add New Connection Card */}
            <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-dashed border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                  <Plus className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    Add New Account
                  </h3>
                  <p className="text-sm text-slate-400">Connect your MT4/MT5 account</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('connect')}
                  className="border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 text-cyan-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connect Account Tab */}
        <TabsContent value="connect" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Connection Form */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  Connect MT4/MT5 Account
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your MetaTrader credentials to start auto-syncing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brokerName" className="text-slate-300">Broker Name</Label>
                    <Input
                      id="brokerName"
                      value={connectionForm.brokerName}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, brokerName: e.target.value }))}
                      placeholder="e.g., FTMO, OANDA, IC Markets"
                      className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="server" className="text-slate-300">Server Name</Label>
                    <Input
                      id="server"
                      value={connectionForm.server}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, server: e.target.value }))}
                      placeholder="e.g., ftmo-server.com"
                      className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login" className="text-slate-300">Account Number</Label>
                    <Input
                      id="login"
                      value={connectionForm.login}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, login: e.target.value }))}
                      placeholder="Your MT4/MT5 account number"
                      className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={connectionForm.password}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your MT4/MT5 password"
                        className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-slate-700/50"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accountType" className="text-slate-300">Account Type</Label>
                    <Select
                      value={connectionForm.accountType}
                      onValueChange={(value: 'Live' | 'Demo') => 
                        setConnectionForm(prev => ({ ...prev, accountType: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="Live">Live Account</SelectItem>
                        <SelectItem value="Demo">Demo Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !connectionForm.server || !connectionForm.login || !connectionForm.password}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Connect Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Brokers */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Popular Brokers
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Quick connect with supported brokers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularBrokers.map((broker) => (
                  <div
                    key={broker.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/30 cursor-pointer transition-all duration-200 group"
                    onClick={() => handleQuickConnect(broker)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getBrokerStatusColor(broker.status))} />
                        <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">{broker.name}</h4>
                      </div>
                      <span className="text-xs text-slate-400">{broker.ping}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{broker.server}</span>
                      <Button size="sm" variant="outline" className="border-blue-500/30 hover:border-blue-500 text-blue-400">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Auto-Sync Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure your auto-sync preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Auto-Sync Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Sync Configuration
                  </h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label htmlFor="autoSync" className="text-slate-300 cursor-pointer">Enable Auto-Sync</Label>
                    <Switch
                      id="autoSync"
                      checked={syncSettings.autoSync}
                      onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, autoSync: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="syncInterval" className="text-slate-300">Sync Interval (minutes)</Label>
                    <Select
                      value={syncSettings.syncInterval.toString()}
                      onValueChange={(value) => setSyncSettings(prev => ({ ...prev, syncInterval: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="historicalDays" className="text-slate-300">Historical Data (days)</Label>
                    <Input
                      id="historicalDays"
                      type="number"
                      value={syncSettings.historicalDataDays}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, historicalDataDays: parseInt(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Alert Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-400" />
                    Alerts & Notifications
                  </h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label htmlFor="alertOnSyncFailure" className="text-slate-300 cursor-pointer">Sync Failure Alerts</Label>
                    <Switch
                      id="alertOnSyncFailure"
                      checked={syncSettings.alertOnSyncFailure}
                      onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, alertOnSyncFailure: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label htmlFor="alertOnNewTrade" className="text-slate-300 cursor-pointer">New Trade Alerts</Label>
                    <Switch
                      id="alertOnNewTrade"
                      checked={syncSettings.alertOnNewTrade}
                      onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, alertOnNewTrade: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label htmlFor="alertOnLargeLoss" className="text-slate-300 cursor-pointer">Large Loss Alerts</Label>
                    <Switch
                      id="alertOnLargeLoss"
                      checked={syncSettings.alertOnLargeLoss}
                      onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, alertOnLargeLoss: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="largeLossThreshold" className="text-slate-300">Large Loss Threshold (%)</Label>
                    <Input
                      id="largeLossThreshold"
                      type="number"
                      value={syncSettings.largeLossThreshold}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, largeLossThreshold: parseFloat(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Button
                  onClick={() => {
                    connections.forEach(conn => {
                      handleUpdateSettings(conn.id, syncSettings);
                    });
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Apply Settings to All Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sync Performance */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Sync Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Success Rate</span>
                    <span className="text-white font-semibold">{dashboardStats.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={dashboardStats.successRate} className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Avg Sync Time</span>
                    <span className="text-white font-semibold">2.3s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Volume */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Data Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">Trades Today</span>
                    <span className="text-white font-semibold">{dashboardStats.tradesToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">Total Trades</span>
                    <span className="text-white font-semibold">{dashboardStats.totalTradesSynced}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Health */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Connection Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400">Active Connections</span>
                    <span className="text-white font-semibold">{dashboardStats.connectedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400">Avg Ping</span>
                    <span className="text-white font-semibold">45ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT4MT5AutoSyncDashboard; 