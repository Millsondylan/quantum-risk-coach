import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Clock,
  Zap,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { realBrokerService, RealBrokerConnection } from '@/lib/realBrokerService';

const BrokerIntegration = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<RealBrokerConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'binance' as 'binance' | 'bybit' | 'kucoin' | 'okx' | 'mexc' | 'coinbase' | 'kraken' | 'huobi' | 'gate' | 'bitget',
    apiKey: '',
    secretKey: '',
    passphrase: '',
    sandbox: false,
    autoSync: true,
    syncInterval: 15
  });

  const brokerTypes = [
    { value: 'binance', label: 'Binance', icon: Zap, description: 'World\'s largest crypto exchange' },
    { value: 'bybit', label: 'Bybit', icon: Zap, description: 'Advanced derivatives trading' },
    { value: 'kucoin', label: 'KuCoin', icon: Zap, description: 'The People\'s Exchange' },
    { value: 'okx', label: 'OKX', icon: Zap, description: 'Leading crypto trading platform' },
    { value: 'mexc', label: 'MEXC', icon: Zap, description: 'High-performance trading' },
    { value: 'coinbase', label: 'Coinbase', icon: Zap, description: 'Secure crypto trading' },
    { value: 'kraken', label: 'Kraken', icon: Database, description: 'Professional trading platform' },
    { value: 'huobi', label: 'HTX (Huobi)', icon: Zap, description: 'Global crypto exchange' },
    { value: 'gate', label: 'Gate.io', icon: Zap, description: 'Comprehensive trading platform' },
    { value: 'bitget', label: 'Bitget', icon: Zap, description: 'Copy trading leader' }
  ];

  // Load user connections on component mount
  useEffect(() => {
    if (user) {
      loadUserConnections();
    }
  }, [user]);

  const loadUserConnections = async () => {
    if (!user) return;
    
    try {
      const userConnections = await realBrokerService.getUserConnections(user.id);
      setConnections(userConnections);
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load broker connections');
    }
  };

  const connectBroker = async () => {
    if (!user) {
      toast.error('Please log in to connect brokers');
      return;
    }

    if (!newConnection.name || !newConnection.apiKey || !newConnection.secretKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    
    try {
      const connection: RealBrokerConnection = {
        id: `${newConnection.type}_${Date.now()}`,
        userId: user.id,
        name: newConnection.name,
        type: newConnection.type,
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

      const result = await realBrokerService.connectToBroker(connection);
      
      if (result.success) {
        toast.success('Broker connected successfully!');
        await loadUserConnections();
        setIsDialogOpen(false);
        setNewConnection({
          name: '',
          type: 'binance',
          apiKey: '',
          secretKey: '',
          passphrase: '',
          sandbox: false,
          autoSync: true,
          syncInterval: 15
        });

        // Start auto-sync if enabled
        if (connection.settings.autoSync) {
          await realBrokerService.startAutoSync(connection.id);
        }
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection failed. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectBroker = async (connectionId: string) => {
    try {
      await realBrokerService.disconnectFromBroker(connectionId);
      await loadUserConnections();
      toast.info('Broker disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect broker');
    }
  };

  const toggleAutoSync = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        connection.settings.autoSync = !connection.settings.autoSync;
        
        if (connection.settings.autoSync) {
          await realBrokerService.startAutoSync(connectionId);
          toast.success('Auto-sync enabled');
        } else {
          toast.success('Auto-sync disabled');
        }
        
        setConnections([...connections]);
      }
    } catch (error) {
      console.error('Toggle auto-sync error:', error);
      toast.error('Failed to toggle auto-sync');
    }
  };

  const syncNow = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) return;

      toast.info('Syncing data...');
      
      // Fetch latest data from broker
      await realBrokerService.fetchTradesFromBroker(connectionId);
      await realBrokerService.getAccountBalance(connectionId);
      
      await loadUserConnections();
      toast.success(`Synced ${connection.name} successfully!`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed. Please check your connection.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getBrokerIcon = (type: string) => {
    const broker = brokerTypes.find(b => b.value === type);
    return broker ? <broker.icon className="w-5 h-5" /> : <Database className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Broker Integration</h2>
          <p className="text-slate-400">Connect and sync with real trading platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400">
            <Wifi className="w-3 h-3 mr-1" />
            {connections.filter(c => c.status === 'connected').length} Connected
          </Badge>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="holo-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Broker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Connect New Broker</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add your broker API credentials to start syncing real trading data.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="broker-type" className="text-right text-white">Type</Label>
                  <select
                    id="broker-type"
                    value={newConnection.type}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, type: e.target.value as any }))}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    {brokerTypes.map(broker => (
                      <option key={broker.value} value={broker.value}>
                        {broker.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-white">Name</Label>
                  <Input
                    id="name"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Trading Account"
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="api-key" className="text-right text-white">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={newConnection.apiKey}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Your API Key"
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secret-key" className="text-right text-white">Secret Key</Label>
                  <Input
                    id="secret-key"
                    type="password"
                    value={newConnection.secretKey}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Your Secret Key"
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                {(newConnection.type === 'okx' || newConnection.type === 'kucoin') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="passphrase" className="text-right text-white">Passphrase</Label>
                    <Input
                      id="passphrase"
                      type="password"
                      value={newConnection.passphrase}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, passphrase: e.target.value }))}
                      placeholder="Your Passphrase"
                      className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sandbox"
                    checked={newConnection.sandbox}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, sandbox: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="sandbox" className="text-white">Use Sandbox/Testnet</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={connectBroker} disabled={isConnecting}>
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4 mr-2" />
                  )}
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {connections.map(connection => (
          <Card key={connection.id} className="holo-card">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    {getBrokerIcon(connection.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{connection.name}</h3>
                    <p className="text-sm text-slate-400">
                      {brokerTypes.find(b => b.value === connection.type)?.label}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusColor(connection.status)}>
                    {getStatusIcon(connection.status)}
                    {connection.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {connection.accountInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-slate-400">Balance</p>
                    <p className="text-lg font-semibold text-white">
                      ${connection.accountInfo.balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-slate-400">Equity</p>
                    <p className="text-lg font-semibold text-white">
                      ${connection.accountInfo.equity.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-slate-400">Free Margin</p>
                    <p className="text-lg font-semibold text-white">
                      ${connection.accountInfo.freeMargin.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-slate-400">Last Sync</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(connection.lastSync).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={connection.status === 'connected' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => connection.status === 'connected' 
                      ? disconnectBroker(connection.id)
                      : connectBroker()
                    }
                    disabled={isConnecting}
                  >
                    {connection.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                  
                  {connection.status === 'connected' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncNow(connection.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAutoSync(connection.id)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {connection.settings.autoSync ? 'Disable' : 'Enable'} Auto-Sync
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-right text-sm text-slate-400">
                  <p>Auto-sync: {connection.settings.autoSync 
                    ? `Every ${connection.settings.syncInterval}m`
                    : 'Disabled'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connections.length === 0 && (
        <Card className="holo-card">
          <CardContent className="text-center py-12">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Brokers Connected</h3>
            <p className="text-slate-400 mb-4">
              Connect your first broker to start syncing real trading data
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="holo-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Broker
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Supported Exchanges</span>
          </CardTitle>
          <CardDescription>
            Connect with your preferred trading platform using real API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brokerTypes.map(broker => (
              <div key={broker.value} className="p-4 bg-slate-800/30 rounded-lg text-center hover:bg-slate-700/30 transition-colors">
                <div className="flex justify-center mb-2">
                  <broker.icon className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-white">{broker.label}</p>
                <p className="text-xs text-slate-400 mt-1">{broker.description}</p>
                <Badge variant="outline" className="mt-2 text-green-400 border-green-400/30">
                  Live API
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