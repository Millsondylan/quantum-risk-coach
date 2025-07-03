import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Plug, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/contexts/UserContext';
import realBrokerService, { RealBrokerConnection } from '@/lib/realBrokerService';
import { toast } from 'sonner';

const BrokerIntegration = () => {
  const { user } = useUser();
  const [connections, setConnections] = useState<RealBrokerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCredentials, setShowCredentials] = useState<string[]>([]);
  
  // New connection form state
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: '',
    apiKey: '',
    secretKey: '',
    passphrase: '',
    server: '',
    login: '',
    password: '',
    sandbox: false,
    autoSync: true,
    syncInterval: 5
  });

  const supportedBrokers = [
    { 
      id: 'mt4', 
      name: 'MetaTrader 4', 
      description: 'Professional forex trading',
      icon: '📈',
      supported: true,
      requiresPassphrase: false,
      type: 'forex',
      features: ['Forex', 'CFDs', 'EA Support']
    },
    { 
      id: 'mt5', 
      name: 'MetaTrader 5', 
      description: 'Advanced trading platform',
      icon: '📊',
      supported: true,
      requiresPassphrase: false,
      type: 'forex',
      features: ['Multi-Asset', 'Hedging', 'Advanced Charts']
    }
  ];

  useEffect(() => {
    loadConnections();
  }, [user?.id]);

  const loadConnections = async () => {
    if (!user?.id) return;
    
    try {
      const userConnections = await realBrokerService.getUserConnections(user.id);
      setConnections(userConnections);
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load broker connections');
    }
  };

  const handleAddConnection = async () => {
    if (!newConnection.name || !newConnection.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Real broker validation - no fake data allowed
    if (!validateRealCredentials()) {
      toast.error('Invalid credentials - please ensure all fields are correct for live trading');
      return;
    }

    setIsLoading(true);
    try {
      const connectionData: RealBrokerConnection = {
        id: `${newConnection.type}_${Date.now()}`,
        userId: user.id,
        name: newConnection.name,
        type: newConnection.type as any,
        status: 'connecting',
        credentials: {
          apiKey: newConnection.apiKey,
          secretKey: newConnection.secretKey,
          passphrase: newConnection.passphrase || undefined,
          server: newConnection.server || undefined,
          login: newConnection.login || undefined,
          password: newConnection.password || undefined,
          sandbox: newConnection.sandbox
        },
        lastSync: new Date().toISOString(),
        settings: {
          autoSync: newConnection.autoSync,
          syncInterval: newConnection.syncInterval
        }
      };

      const result = await realBrokerService.connectToBroker(connectionData);
      
      if (result.success) {
        toast.success(`✅ Live broker connection established successfully!`);
        setShowAddDialog(false);
        resetNewConnection();
        await loadConnections();
      } else {
        toast.error(`Connection failed: ${result.message || 'Please verify your credentials'}`);
      }
    } catch (error: any) {
      console.error('Broker connection error:', error);
      toast.error('Failed to connect - please check your credentials and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const validateRealCredentials = (): boolean => {
    const { type, apiKey, secretKey, passphrase, server, login, password } = newConnection;
    
    // Ensure real credentials are provided
    if (!apiKey || !secretKey) {
      return false;
    }

    // Platform-specific validation for real accounts
    if (type === 'kucoin' && !passphrase) {
      return false;
    }

    if (['mt4', 'mt5'].includes(type)) {
      if (!server || !login || !password) {
        return false;
      }
    }

    // Validate API key format (prevent obvious test keys)
    if (apiKey.includes('test') || apiKey.includes('demo')) {
      toast.warning('⚠️ Demo credentials detected - please use live trading credentials');
      return false;
    }

    return true;
  };

  const resetNewConnection = () => {
    setNewConnection({
      name: '',
      type: '',
      apiKey: '',
      secretKey: '',
      passphrase: '',
      server: '',
      login: '',
      password: '',
      sandbox: false,
      autoSync: true,
      syncInterval: 5
    });
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await realBrokerService.disconnectFromBroker(connectionId);
      toast.success('Broker disconnected');
      await loadConnections();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect broker');
    }
  };

  const handleRefreshBalance = async (connectionId: string) => {
    try {
      await realBrokerService.getAccountBalance(connectionId);
      toast.success('Balance refreshed');
      await loadConnections();
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast.error(error.message || 'Failed to refresh balance');
    }
  };

  const toggleCredentialVisibility = (connectionId: string) => {
    setShowCredentials(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'connecting': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBrokerTypeColor = (type: string) => {
    switch (type) {
      case 'crypto': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'forex': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'social': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const selectedBroker = supportedBrokers.find(b => b.id === newConnection.type);

  return (
    <div className="space-y-6">
      {/* Header with UltraTrader-style stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Broker Connections</h3>
          <p className="text-slate-400">Sync your trades automatically from multiple platforms</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-400 font-medium">{connections.filter(c => c.status === 'connected').length} Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Auto-sync enabled</span>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Connect Broker
              </Button>
            </DialogTrigger>
            
            <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Connect New Broker</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="broker-name" className="text-slate-300 font-medium">Connection Name</Label>
                    <Input
                      id="broker-name"
                      value={newConnection.name}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Trading Account"
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="broker-type" className="text-slate-300 font-medium">Platform</Label>
                    <Select value={newConnection.type} onValueChange={(value) => setNewConnection(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {supportedBrokers.map((broker) => (
                          <SelectItem 
                            key={broker.id} 
                            value={broker.id}
                            disabled={!broker.supported}
                            className="text-white focus:bg-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{broker.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span>{broker.name}</span>
                                  <Badge variant="outline" className={`text-xs ${getBrokerTypeColor(broker.type)}`}>
                                    {broker.type}
                                  </Badge>
                                </div>
                                {!broker.supported && <span className="text-xs text-slate-500">Coming Soon</span>}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedBroker && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{selectedBroker.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{selectedBroker.name}</h4>
                        <p className="text-sm text-slate-400 mb-2">{selectedBroker.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBroker.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-slate-300 border-slate-600">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Dynamic form based on broker type */}
                {['mt4', 'mt5', 'ctrader'].includes(newConnection.type) ? (
                  // MT4/MT5/cTrader form
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="server" className="text-slate-300 font-medium">Server</Label>
                      <Input
                        id="server"
                        value={newConnection.server}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, server: e.target.value }))}
                        placeholder="e.g., ICMarkets-Live01"
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="login" className="text-slate-300 font-medium">Login</Label>
                        <Input
                          id="login"
                          value={newConnection.login}
                          onChange={(e) => setNewConnection(prev => ({ ...prev, login: e.target.value }))}
                          placeholder="Account number"
                          className="bg-slate-800 border-slate-600 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newConnection.password}
                          onChange={(e) => setNewConnection(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                          className="bg-slate-800 border-slate-600 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // API-based form for exchanges
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key" className="text-slate-300 font-medium">API Key</Label>
                      <Input
                        id="api-key"
                        value={newConnection.apiKey}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Enter your API key"
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="secret-key" className="text-slate-300 font-medium">Secret Key</Label>
                      <Input
                        id="secret-key"
                        type="password"
                        value={newConnection.secretKey}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder="Enter your secret key"
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                      />
                    </div>
                    
                    {selectedBroker?.requiresPassphrase && (
                      <div>
                        <Label htmlFor="passphrase" className="text-slate-300 font-medium">Passphrase</Label>
                        <Input
                          id="passphrase"
                          type="password"
                          value={newConnection.passphrase}
                          onChange={(e) => setNewConnection(prev => ({ ...prev, passphrase: e.target.value }))}
                          placeholder="Enter your passphrase"
                          className="bg-slate-800 border-slate-600 text-white mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <Label htmlFor="auto-sync" className="text-slate-300 font-medium">Auto-sync trades</Label>
                    <p className="text-xs text-slate-500">Automatically import new trades every few minutes</p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={newConnection.autoSync}
                    onCheckedChange={(checked) => setNewConnection(prev => ({ ...prev, autoSync: checked }))}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddConnection}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Connect Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Connection List with UltraTrader-style cards */}
      {connections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => {
            const broker = supportedBrokers.find(b => b.id === connection.type);
            return (
              <Card key={connection.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl">{broker?.icon || '🔗'}</span>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(connection.status)} border-2 border-slate-800`}></div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white text-lg">{connection.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-xs capitalize ${getBrokerTypeColor(broker?.type || 'default')}`}>
                            {connection.type}
                          </Badge>
                          <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                            {connection.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCredentialVisibility(connection.id)}
                        className="text-slate-400 hover:text-white h-8 w-8 p-0"
                      >
                        {showCredentials.includes(connection.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {connection.status === 'connected' && connection.accountInfo && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-slate-400">Balance</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            ${connection.accountInfo.balance?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-slate-400">P&L</span>
                          </div>
                          <p className={`text-lg font-bold ${(connection.accountInfo.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {(connection.accountInfo.profit || 0) >= 0 ? '+' : ''}${connection.accountInfo.profit?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Last sync: {new Date(connection.lastSync).toLocaleTimeString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefreshBalance(connection.id)}
                          className="text-blue-400 hover:text-blue-300 h-7 px-2"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {showCredentials.includes(connection.id) && (
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                      <div className="space-y-2 text-xs">
                        {connection.credentials.apiKey && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">API Key:</span>
                            <span className="text-slate-300 font-mono">{connection.credentials.apiKey.substring(0, 8)}...</span>
                          </div>
                        )}
                        {connection.credentials.server && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Server:</span>
                            <span className="text-slate-300">{connection.credentials.server}</span>
                          </div>
                        )}
                        {connection.credentials.login && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Login:</span>
                            <span className="text-slate-300">{connection.credentials.login}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mode:</span>
                          <span className="text-slate-300">{connection.credentials.sandbox ? 'Sandbox' : 'Live'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plug className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Connect Your First Broker</h3>
              <p className="text-slate-400 mb-6">
                Start syncing trades automatically by connecting your trading accounts. We support MT4, MT5, Binance, Bybit, and more.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Connect Broker
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Platforms Grid */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Supported Trading Platforms
          </CardTitle>
          <CardDescription className="text-slate-400">
            All connections are secured with bank-level encryption. More platforms added regularly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {supportedBrokers.map((broker) => (
              <div
                key={broker.id}
                className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-105 ${
                  broker.supported
                    ? 'bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/20 hover:border-emerald-400/40'
                    : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50'
                }`}
              >
                <div className="text-3xl mb-3">{broker.icon}</div>
                <h4 className="text-sm font-semibold text-white mb-1">{broker.name}</h4>
                <p className="text-xs text-slate-400 mb-3">{broker.description}</p>
                <Badge
                  variant={broker.supported ? "default" : "secondary"}
                  className={`text-xs ${broker.supported ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
                >
                  {broker.supported ? 'Available' : 'Coming Soon'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerIntegration; 