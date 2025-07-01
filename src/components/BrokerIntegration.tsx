import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Clock,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { brokerService, BrokerConnection, TradeImportResult } from '@/lib/api';

const BrokerIntegration = () => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<TradeImportResult | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(15);

  const brokerTypes = [
    { id: 'mt4', name: 'MetaTrader 4', icon: '📊' },
    { id: 'mt5', name: 'MetaTrader 5', icon: '📈' },
    { id: 'binance', name: 'Binance', icon: '🪙' },
    { id: 'bybit', name: 'Bybit', icon: '⚡' },
    { id: 'ctrader', name: 'cTrader', icon: '💻' },
    { id: 'kucoin', name: 'KuCoin', icon: '🔵' },
    { id: 'okx', name: 'OKX', icon: '🟢' },
    { id: 'mexc', name: 'MEXC', icon: '🟡' }
  ];

  const handleConnect = async (brokerType: string) => {
    try {
      const credentials = {
        apiKey: 'demo_key',
        secretKey: 'demo_secret',
        server: 'demo_server'
      };
      
      const connection = await brokerService.connectToBroker(brokerType, credentials);
      setConnections(prev => [...prev, connection]);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleImport = async (brokerId: string) => {
    setImporting(true);
    try {
      const result = await brokerService.importTrades(brokerId);
      setImportResult(result);
      
      // Update connection last sync time
      setConnections(prev => 
        prev.map(conn => 
          conn.id === brokerId 
            ? { ...conn, lastSync: result.lastSyncTime }
            : conn
        )
      );
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleAutoSync = async () => {
    if (autoSync) {
      connections.forEach(conn => {
        brokerService.startAutoSync(conn.id, syncInterval);
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Broker Integration
        </CardTitle>
        <CardDescription>
          One-click import from major trading platforms with automatic synchronization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="import">Import Trades</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brokerTypes.map((broker) => (
                <Card key={broker.id} className="p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{broker.icon}</div>
                  <h3 className="font-medium text-sm">{broker.name}</h3>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => handleConnect(broker.id)}
                  >
                    Connect
                  </Button>
                </Card>
              ))}
            </div>

            {connections.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Active Connections</h3>
                {connections.map((connection) => (
                  <Card key={connection.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)}`} />
                        <div>
                          <h4 className="font-medium">{connection.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {new Date(connection.lastSync).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                          {connection.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleImport(connection.id)}
                          disabled={importing}
                        >
                          {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            {importResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed successfully! 
                  {importResult.tradesImported} trades imported, 
                  {importResult.tradesUpdated} trades updated.
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-red-600">
                      {importResult.errors.length} errors encountered
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing trades...</span>
                      <span>{importing ? 'In progress' : 'Ready'}</span>
                    </div>
                    <Progress value={importing ? 45 : 0} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Error Reconciliation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Error-free import with automatic reconciliation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync trades every {syncInterval} minutes
                  </p>
                </div>
                <Switch 
                  checked={autoSync} 
                  onCheckedChange={setAutoSync}
                />
              </div>

              <div className="space-y-2">
                <Label>Sync Interval (minutes)</Label>
                <Input 
                  type="number" 
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  min={5}
                  max={60}
                />
              </div>

              <Button onClick={handleAutoSync} disabled={!autoSync}>
                <Zap className="h-4 w-4 mr-2" />
                Start Auto Sync
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BrokerIntegration; 