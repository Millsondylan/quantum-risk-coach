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
  ExternalLink
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import realBrokerService, { RealBrokerConnection } from '@/lib/realBrokerService';
import { toast } from 'sonner';

const BrokerIntegration = () => {
  const { user } = useAuth();
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
    sandbox: true,
    autoSync: true,
    syncInterval: 5
  });

  const supportedBrokers = [
    { 
      id: 'binance', 
      name: 'Binance', 
      description: 'World\'s largest crypto exchange',
      supported: true,
      requiresPassphrase: false
    },
    { 
      id: 'bybit', 
      name: 'Bybit', 
      description: 'Popular derivatives exchange',
      supported: true,
      requiresPassphrase: false
    },
    { 
      id: 'kucoin', 
      name: 'KuCoin', 
      description: 'Global crypto exchange',
      supported: true,
      requiresPassphrase: true
    },
    { 
      id: 'okx', 
      name: 'OKX', 
      description: 'Leading crypto exchange',
      supported: false,
      requiresPassphrase: true
    },
    { 
      id: 'mexc', 
      name: 'MEXC', 
      description: 'Global digital asset exchange',
      supported: false,
      requiresPassphrase: false
    },
    { 
      id: 'mt4', 
      name: 'MetaTrader 4', 
      description: 'Expert Advisor required',
      supported: false,
      requiresPassphrase: false
    },
    { 
      id: 'mt5', 
      name: 'MetaTrader 5', 
      description: 'Expert Advisor required',
      supported: false,
      requiresPassphrase: false
    },
    { 
      id: 'ctrader', 
      name: 'cTrader', 
      description: 'cBot required',
      supported: false,
      requiresPassphrase: false
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
    if (!user?.id || !newConnection.name || !newConnection.type || !newConnection.apiKey || !newConnection.secretKey) {
      toast.error('Please fill in all required fields');
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
        toast.success(`Successfully connected to ${newConnection.name}`);
        setShowAddDialog(false);
        setNewConnection({
          name: '',
          type: '',
          apiKey: '',
          secretKey: '',
          passphrase: '',
          sandbox: true,
          autoSync: true,
          syncInterval: 5
        });
        await loadConnections();
      } else {
        toast.error(result.message || 'Failed to connect');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect to broker');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Broker Connections</h3>
          <p className="text-sm text-slate-400">Connect your trading accounts for real-time data</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Broker
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Broker Connection</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="broker-name" className="text-slate-300">Connection Name</Label>
                <Input
                  id="broker-name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Binance Account"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="broker-type" className="text-slate-300">Broker Type</Label>
                <Select value={newConnection.type} onValueChange={(value) => setNewConnection(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {supportedBrokers.map((broker) => (
                      <SelectItem 
                        key={broker.id} 
                        value={broker.id}
                        disabled={!broker.supported}
                        className="text-white"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{broker.name}</span>
                          {!broker.supported && <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="api-key" className="text-slate-300">API Key</Label>
                <Input
                  id="api-key"
                  type="text"
                  value={newConnection.apiKey}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="secret-key" className="text-slate-300">Secret Key</Label>
                <Input
                  id="secret-key"
                  type="password"
                  value={newConnection.secretKey}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="Enter your secret key"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              
              {supportedBrokers.find(b => b.id === newConnection.type)?.requiresPassphrase && (
                <div>
                  <Label htmlFor="passphrase" className="text-slate-300">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={newConnection.passphrase}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, passphrase: e.target.value }))}
                    placeholder="Enter your passphrase"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sandbox" className="text-slate-300">Use Sandbox</Label>
                <Switch
                  id="sandbox"
                  checked={newConnection.sandbox}
                  onCheckedChange={(checked) => setNewConnection(prev => ({ ...prev, sandbox: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync" className="text-slate-300">Auto Sync</Label>
                <Switch
                  id="auto-sync"
                  checked={newConnection.autoSync}
                  onCheckedChange={(checked) => setNewConnection(prev => ({ ...prev, autoSync: checked }))}
                />
              </div>
              
              <div className="flex gap-2">
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
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connection List */}
      {connections.length > 0 ? (
        <div className="space-y-4">
          {connections.map((connection) => (
            <Card key={connection.id} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)}`}></div>
                      {connection.status === 'connecting' && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-yellow-500 animate-ping"></div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{connection.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {connection.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(connection.status)}
                        <span className="text-xs text-slate-400 capitalize">{connection.status}</span>
                        {connection.lastSync && (
                          <span className="text-xs text-slate-500">
                            • Last sync: {new Date(connection.lastSync).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {connection.status === 'connected' && connection.accountInfo && (
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold text-white">
                          ${connection.accountInfo.balance?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-slate-400">{connection.accountInfo.currency}</p>
                      </div>
                    )}
                    
                    {connection.status === 'connected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshBalance(connection.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCredentialVisibility(connection.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {showCredentials.includes(connection.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {showCredentials.includes(connection.id) && (
                  <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">API Key: </span>
                        <span className="text-slate-300 font-mono">{connection.credentials.apiKey?.substring(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Secret: </span>
                        <span className="text-slate-300 font-mono">{'*'.repeat(16)}</span>
                      </div>
                      {connection.credentials.passphrase && (
                        <div>
                          <span className="text-slate-400">Passphrase: </span>
                          <span className="text-slate-300 font-mono">{'*'.repeat(8)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Mode: </span>
                        <span className="text-slate-300">{connection.credentials.sandbox ? 'Sandbox' : 'Live'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50 border-dashed">
          <CardContent className="p-8 text-center">
            <Plug className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Brokers Connected</h3>
            <p className="text-slate-400 mb-4">
              Connect your trading accounts to import trades automatically and track real-time performance
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Broker
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supported Brokers */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-sm">Supported Brokers</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            More brokers coming soon. Request support for your broker via feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {supportedBrokers.map((broker) => (
              <div
                key={broker.id}
                className={`p-3 rounded-lg border text-center ${
                  broker.supported
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-slate-700/30 border-slate-600/30'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {broker.supported ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h4 className="text-sm font-medium text-white">{broker.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{broker.description}</p>
                <Badge
                  variant={broker.supported ? "default" : "secondary"}
                  className="mt-2 text-xs"
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