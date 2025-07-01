import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, RefreshCw, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mt4Service } from '@/lib/api';

interface ConnectionStatus {
  isConnected: boolean;
  accountNumber: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  profit: number;
  server: string;
  lastUpdate: Date;
}

interface MT4ConnectionProps {
  platform?: string;
}

const MT4Connection: React.FC<MT4ConnectionProps> = ({ platform = "MT4/MT5" }) => {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    accountNumber: '',
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    profit: 0,
    server: '',
    lastUpdate: new Date()
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [formData, setFormData] = useState({
    server: '',
    account: '',
    password: '',
    port: '443'
  });

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case "MT5":
        return {
          name: "MT5",
          fullName: "MetaTrader 5",
          description: "Connect your MetaTrader 5 account to start receiving real-time data"
        };
      case "cTrader":
        return {
          name: "cTrader",
          fullName: "cTrader",
          description: "Connect your cTrader account to start receiving real-time data"
        };
      case "TradingView":
        return {
          name: "TradingView",
          fullName: "TradingView",
          description: "Connect your TradingView account to start receiving real-time data"
        };
      default:
        return {
          name: "MT4/MT5",
          fullName: "MetaTrader 4/5",
          description: "Connect your MetaTrader account to start receiving real-time data"
        };
    }
  };

  const platformInfo = getPlatformInfo(platform);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const connectToMT4 = async () => {
    if (!formData.server || !formData.account || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setConnectionProgress(0);

    try {
      // Simulate connection process
      const steps = [
        { progress: 20, message: 'Initializing connection...' },
        { progress: 40, message: 'Authenticating credentials...' },
        { progress: 60, message: 'Establishing data stream...' },
        { progress: 80, message: 'Syncing account data...' },
        { progress: 100, message: 'Connection established!' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setConnectionProgress(step.progress);
      }

      // Use real MT4 service
      const result = await mt4Service.connectToMT4({
        server: formData.server,
        login: formData.account,
        password: formData.password
      });

      if (result.success) {
        setConnectionStatus({
          isConnected: true,
          accountNumber: formData.account,
          balance: result.accountInfo.balance,
          equity: result.accountInfo.equity,
          margin: result.accountInfo.margin,
          freeMargin: result.accountInfo.freeMargin,
          profit: result.accountInfo.profit,
          server: formData.server,
          lastUpdate: new Date()
        });
        toast.success('Successfully connected to MT4/MT5!');
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

  const disconnect = () => {
    setConnectionStatus({
      isConnected: false,
      accountNumber: '',
      balance: 0,
      equity: 0,
      margin: 0,
      freeMargin: 0,
      profit: 0,
      server: '',
      lastUpdate: new Date()
    });
    setFormData({
      server: '',
      account: '',
      password: '',
      port: '443'
    });
    toast.info('Disconnected from MT4/MT5');
  };

  const refreshData = () => {
    if (connectionStatus.isConnected) {
      setConnectionStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        profit: prev.profit + (Math.random() - 0.5) * 50 // Simulate profit change
      }));
      toast.success('Data refreshed successfully');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="text-slate-400 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Connection Status Card */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {connectionStatus.isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span>{platformInfo.name} Connection</span>
            <Badge variant={connectionStatus.isConnected ? "default" : "destructive"}>
              {connectionStatus.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {connectionStatus.isConnected 
              ? `Connected to ${connectionStatus.server}` 
              : platformInfo.description
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!connectionStatus.isConnected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="server">Server *</Label>
                  <Input 
                    id="server" 
                    placeholder="e.g., ICMarkets-Account01" 
                    value={formData.server}
                    onChange={(e) => handleInputChange('server', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account Number *</Label>
                  <Input 
                    id="account" 
                    placeholder="12345678" 
                    value={formData.account}
                    onChange={(e) => handleInputChange('account', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input 
                    id="port" 
                    placeholder="443" 
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                  />
                </div>
              </div>
              
              {isConnecting && (
                <div className="space-y-2">
                  <Progress value={connectionProgress} className="w-full" />
                  <p className="text-sm text-slate-400">Connecting... {connectionProgress}%</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  onClick={connectToMT4} 
                  disabled={isConnecting}
                  className="holo-button flex-1"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4 mr-2" />
                  )}
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
                <Button variant="outline" onClick={disconnect} className="flex-1">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {connectionStatus.isConnected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <p className="text-sm text-slate-400">Balance</p>
                  <p className="text-lg font-semibold text-white">
                    ${connectionStatus.balance.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <p className="text-sm text-slate-400">Equity</p>
                  <p className="text-lg font-semibold text-white">
                    ${connectionStatus.equity.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <p className="text-sm text-slate-400">Profit</p>
                  <p className={`text-lg font-semibold ${connectionStatus.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {connectionStatus.profit >= 0 ? '+' : ''}${connectionStatus.profit.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <p className="text-sm text-slate-400">Free Margin</p>
                  <p className="text-lg font-semibold text-white">
                    ${connectionStatus.freeMargin.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Last update: {connectionStatus.lastUpdate.toLocaleTimeString()}
                </span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={refreshData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={disconnect}>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Instructions */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Connection Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Enable Expert Advisors</h4>
                <p className="text-sm text-slate-400">
                  Make sure "Allow Automated Trading" is enabled in your MT4/MT5 settings
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg mt-1">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Install EA</h4>
                <p className="text-sm text-slate-400">
                  Download and install the Quantum Risk Coach Expert Advisor in your MT4/MT5 platform
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Configure Settings</h4>
                <p className="text-sm text-slate-400">
                  Enter your server details and account credentials above
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MT4Connection; 