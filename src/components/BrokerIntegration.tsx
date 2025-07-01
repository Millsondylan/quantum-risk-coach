import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface BrokerConnection {
  id: string;
  name: string;
  type: 'mt4' | 'mt5' | 'binance' | 'bybit' | 'ctrader' | 'kucoin' | 'okx' | 'mexc';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync: Date;
  accountBalance: number;
  totalTrades: number;
  autoSync: boolean;
  syncInterval: number; // minutes
}

const BrokerIntegration = () => {
  const [connections, setConnections] = useState<BrokerConnection[]>([
    {
      id: '1',
      name: 'IC Markets MT5',
      type: 'mt5',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      accountBalance: 25000.00,
      totalTrades: 156,
      autoSync: true,
      syncInterval: 5
    },
    {
      id: '2',
      name: 'Binance Spot',
      type: 'binance',
      status: 'disconnected',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      accountBalance: 0,
      totalTrades: 0,
      autoSync: false,
      syncInterval: 15
    }
  ]);

  const [isConnecting, setIsConnecting] = useState(false);

  const brokerTypes = [
    { value: 'mt4', label: 'MetaTrader 4', icon: Database },
    { value: 'mt5', label: 'MetaTrader 5', icon: Database },
    { value: 'binance', label: 'Binance', icon: Zap },
    { value: 'bybit', label: 'Bybit', icon: Zap },
    { value: 'ctrader', label: 'cTrader', icon: Database },
    { value: 'kucoin', label: 'KuCoin', icon: Zap },
    { value: 'okx', label: 'OKX', icon: Zap },
    { value: 'mexc', label: 'MEXC', icon: Zap }
  ];

  const connectBroker = async (connectionId: string) => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'connected', lastSync: new Date() }
        : conn
    ));
    
    setIsConnecting(false);
    toast.success('Broker connected successfully!');
  };

  const disconnectBroker = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'disconnected' }
        : conn
    ));
    toast.info('Broker disconnected');
  };

  const toggleAutoSync = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, autoSync: !conn.autoSync }
        : conn
    ));
    toast.success('Auto-sync settings updated');
  };

  const syncNow = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, lastSync: new Date() }
        : conn
    ));
    
    toast.success(`Synced ${connection.name} successfully!`);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Broker Integration</h2>
          <p className="text-slate-400">Connect and sync with multiple trading platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400">
            <Wifi className="w-3 h-3 mr-1" />
            {connections.filter(c => c.status === 'connected').length} Connected
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {connections.map(connection => (
          <Card key={connection.id} className="holo-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">Account Balance</p>
                  <p className="text-lg font-semibold text-white">
                    ${connection.accountBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">Total Trades</p>
                  <p className="text-lg font-semibold text-white">
                    {connection.totalTrades}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">Last Sync</p>
                  <p className="text-sm font-medium text-white">
                    {connection.lastSync.toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">Auto-Sync</p>
                  <p className="text-sm font-medium text-white">
                    {connection.autoSync ? `${connection.syncInterval}m` : 'Off'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={connection.status === 'connected' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => connection.status === 'connected' 
                      ? disconnectBroker(connection.id)
                      : connectBroker(connection.id)
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
                        {connection.autoSync ? 'Disable' : 'Enable'} Auto-Sync
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-right text-sm text-slate-400">
                  <p>Next sync: {connection.autoSync 
                    ? new Date(Date.now() + connection.syncInterval * 60 * 1000).toLocaleTimeString()
                    : 'Manual only'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Supported Brokers</span>
          </CardTitle>
          <CardDescription>
            Connect with your preferred trading platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brokerTypes.map(broker => (
              <div key={broker.value} className="p-4 bg-slate-800/30 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <broker.icon className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-white">{broker.label}</p>
                <p className="text-xs text-slate-400">Supported</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerIntegration; 