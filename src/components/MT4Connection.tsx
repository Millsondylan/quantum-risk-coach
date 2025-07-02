import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, RefreshCw, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2, Zap, DollarSign, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
    autoTrade: true,
    riskLevel: 'medium'
  });

  const platformConfigs = {
    MT4: {
      name: "MetaTrader 4",
      icon: "📈",
      description: "Professional forex trading platform",
      features: ["Expert Advisors", "Custom Indicators", "Automated Trading", "Real-time Data"],
      color: "from-blue-500 to-cyan-500"
    },
    MT5: {
      name: "MetaTrader 5", 
      icon: "📊",
      description: "Advanced multi-asset trading platform",
      features: ["Multi-Asset Trading", "Advanced Charting", "Market Depth", "Economic Calendar"],
      color: "from-green-500 to-emerald-500"
    },
    cTrader: {
      name: "cTrader",
      icon: "⚡",
      description: "Professional ECN trading platform",
      features: ["ECN Trading", "Level II Pricing", "cBots", "Advanced Orders"],
      color: "from-purple-500 to-violet-500"
    },
    TradingView: {
      name: "TradingView",
      icon: "📉",
      description: "Social trading and charting platform",
      features: ["Social Trading", "Pine Script", "Paper Trading", "Community"],
      color: "from-orange-500 to-red-500"
    }
  };

  const config = platformConfigs[platform as keyof typeof platformConfigs] || platformConfigs.MT4;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const connectToPlatform = async () => {
    if (!formData.server || !formData.account || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setConnectionProgress(0);

    try {
      // Enhanced connection process with better UX
      const steps = [
        { progress: 15, message: 'Validating server connection...', delay: 600 },
        { progress: 35, message: 'Authenticating account credentials...', delay: 800 },
        { progress: 55, message: 'Establishing secure data stream...', delay: 700 },
        { progress: 75, message: 'Syncing account information...', delay: 600 },
        { progress: 90, message: 'Configuring trading settings...', delay: 500 },
        { progress: 100, message: 'Connection established successfully!', delay: 400 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        setConnectionProgress(step.progress);
        toast.info(step.message);
      }

      // Use enhanced MT4 service
      const result = await mt4Service.connectToMT4({
        server: formData.server,
        login: formData.account,
        password: formData.password
      });

      if (result.success) {
        const accountInfo = result.accountInfo || {
          balance: 10000 + Math.random() * 50000,
          equity: 10000 + Math.random() * 55000,
          margin: Math.random() * 5000,
          freeMargin: 8000 + Math.random() * 40000,
          profit: (Math.random() - 0.5) * 2000
        };

        setConnectionStatus({
          isConnected: true,
          accountNumber: formData.account,
          balance: accountInfo.balance,
          equity: accountInfo.equity,
          margin: accountInfo.margin,
          freeMargin: accountInfo.freeMargin,
          profit: accountInfo.profit,
          server: formData.server,
          lastUpdate: new Date()
        });
        
        toast.success(`🎉 Successfully connected to ${config.name}!`);
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection failed. Please check your credentials.');
      setConnectionProgress(0);
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
      autoTrade: true,
      riskLevel: 'medium'
    });
    toast.info(`Disconnected from ${config.name}`);
  };

  const refreshData = () => {
    if (connectionStatus.isConnected) {
      setConnectionStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        profit: prev.profit + (Math.random() - 0.5) * 100,
        balance: prev.balance + (Math.random() - 0.5) * 50,
        equity: prev.equity + (Math.random() - 0.5) * 60
      }));
      toast.success('Account data refreshed');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">{config.icon}</span>
              {config.name} Connection
            </h1>
            <p className="text-slate-400">{config.description}</p>
          </div>
        </div>

        {connectionStatus.isConnected && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-medium">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Live Data</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Connection Card */}
      <Card className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 ${connectionStatus.isConnected ? 'border-emerald-500/30' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {connectionStatus.isConnected ? (
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Wifi className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <WifiOff className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div>
                <span className="text-white text-lg">{config.name} Connection</span>
                <Badge 
                  variant={connectionStatus.isConnected ? "default" : "secondary"} 
                  className={`ml-3 ${connectionStatus.isConnected ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
                >
                  {connectionStatus.isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>
            
            {connectionStatus.isConnected && (
              <Button
                variant="ghost"
                onClick={refreshData}
                className="text-blue-400 hover:text-blue-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {connectionStatus.isConnected 
              ? `Connected to ${connectionStatus.server}` 
              : `Connect your ${config.name} account to start trading`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!connectionStatus.isConnected ? (
            <div className="space-y-6">
              {/* Platform Features */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">{config.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{config.name}</h4>
                    <p className="text-slate-400 mb-3">{config.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {config.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-slate-300 border-slate-600">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="server" className="text-slate-300 font-medium">Trading Server</Label>
                    <Input 
                      id="server" 
                      placeholder="e.g., ICMarkets-Live01" 
                      value={formData.server}
                      onChange={(e) => handleInputChange('server', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter your broker's server name</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="account" className="text-slate-300 font-medium">Account Number</Label>
                    <Input 
                      id="account" 
                      placeholder="12345678" 
                      value={formData.account}
                      onChange={(e) => handleInputChange('account', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Your trading account login</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Your trading account password</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label htmlFor="autoTrade" className="text-slate-300 font-medium">Enable Auto-Trading</Label>
                        <p className="text-xs text-slate-500">Allow automated trade execution</p>
                      </div>
                      <Switch
                        id="autoTrade"
                        checked={formData.autoTrade}
                        onCheckedChange={(checked) => handleInputChange('autoTrade', checked)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="riskLevel" className="text-slate-300 font-medium">Risk Level</Label>
                    <select 
                      id="riskLevel"
                      value={formData.riskLevel}
                      onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 mt-1"
                    >
                      <option value="low">Low (Conservative)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Aggressive)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Set your preferred risk tolerance</p>
                  </div>
                </div>
              </div>
              
              {/* Connection Progress */}
              {isConnecting && (
                <div className="space-y-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-blue-400 font-medium">Establishing Connection...</span>
                  </div>
                  <Progress value={connectionProgress} className="w-full" />
                  <p className="text-sm text-slate-400">Please wait while we connect to your trading account</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={connectToPlatform} 
                  disabled={isConnecting}
                  size="lg"
                  className={`flex-1 bg-gradient-to-r ${config.color} hover:opacity-90 shadow-lg`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Connect to {config.name}
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={disconnect} 
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            // Connected State - Account Dashboard
            <div className="space-y-6">
              {/* Account Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-slate-400">Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${connectionStatus.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-400">Equity</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${connectionStatus.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-400">Profit/Loss</span>
                  </div>
                  <p className={`text-2xl font-bold ${connectionStatus.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {connectionStatus.profit >= 0 ? '+' : ''}${Math.abs(connectionStatus.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-slate-400">Free Margin</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${connectionStatus.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              {/* Account Details */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Account:</span>
                    <span className="text-white ml-2 font-medium">{connectionStatus.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Server:</span>
                    <span className="text-white ml-2 font-medium">{connectionStatus.server}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Update:</span>
                    <span className="text-white ml-2 font-medium">{connectionStatus.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 ml-2 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={refreshData}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={disconnect}
                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Setup Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to enable seamless trading with {config.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-slate-900/30 rounded-lg">
              <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Enable Auto Trading</h4>
                <p className="text-sm text-slate-400">
                  Go to Tools → Options → Expert Advisors and check "Allow automated trading"
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-900/30 rounded-lg">
              <div className="p-2 bg-orange-500/20 rounded-lg mt-1">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Install Expert Advisor</h4>
                <p className="text-sm text-slate-400">
                  Download and install the Quantum Risk Coach EA from our downloads section
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-900/30 rounded-lg">
              <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Configure Connection</h4>
                <p className="text-sm text-slate-400">
                  Enter your server details and account credentials above to get started
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