import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Smartphone, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Check,
  X,
  Plus,
  Settings,
  Volume2,
  VolumeX,
  Target,
  DollarSign,
  Clock,
  Zap,
  Send,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/lib/api';

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down';
  value: number;
  isActive: boolean;
  created: Date;
  triggered?: Date;
  triggerCount: number;
}

interface NotificationSettings {
  pushNotifications: boolean;
  telegram: boolean;
  email: boolean;
  sound: boolean;
  tradeExecutions: boolean;
  priceAlerts: boolean;
  newsUpdates: boolean;
  aiInsights: boolean;
  economicEvents: boolean;
  riskWarnings: boolean;
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
  isConnected: boolean;
  lastMessage?: Date;
}

const NotificationsAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    telegram: false,
    email: true,
    sound: true,
    tradeExecutions: true,
    priceAlerts: true,
    newsUpdates: false,
    aiInsights: true,
    economicEvents: true,
    riskWarnings: true
  });
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    isConnected: false
  });
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    condition: 'above' as const,
    value: 0
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load saved alerts and settings
    loadSavedData();

    // Set up notification listeners
    setupNotificationListeners();

    // Request notification permission if not granted
    requestNotificationPermission();
  }, []);

  const loadSavedData = () => {
    try {
      const savedAlerts = localStorage.getItem('priceAlerts');
      const savedSettings = localStorage.getItem('notificationSettings');
      const savedTelegram = localStorage.getItem('telegramConfig');

      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      if (savedTelegram) {
        setTelegramConfig(JSON.parse(savedTelegram));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Listen for price updates and check alerts
    // This would typically connect to real-time price feeds
    const interval = setInterval(() => {
      checkPriceAlerts();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          toast.success('Notifications enabled successfully!');
        } else {
          toast.error('Notifications permission denied');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const checkPriceAlerts = async () => {
    // Simulate price checking - in production, this would use real market data
    const mockPrices = {
      'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.01,
      'GBPUSD': 1.2650 + (Math.random() - 0.5) * 0.02,
      'USDJPY': 149.50 + (Math.random() - 0.5) * 2,
      'BTCUSD': 43000 + (Math.random() - 0.5) * 1000,
      'ETHUSD': 2300 + (Math.random() - 0.5) * 200,
      'XAUUSD': 2050 + (Math.random() - 0.5) * 50
    };

    for (const alert of alerts) {
      if (!alert.isActive) continue;

      const currentPrice = mockPrices[alert.symbol as keyof typeof mockPrices];
      if (!currentPrice) continue;

      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = currentPrice > alert.value;
          break;
        case 'below':
          shouldTrigger = currentPrice < alert.value;
          break;
        case 'crosses_up':
          // This would require historical data to detect crossing
          shouldTrigger = Math.random() > 0.99; // Simulate rare crossing
          break;
        case 'crosses_down':
          shouldTrigger = Math.random() > 0.99;
          break;
      }

      if (shouldTrigger) {
        await triggerAlert(alert, currentPrice);
      }
    }
  };

  const triggerAlert = async (alert: PriceAlert, currentPrice: number) => {
    const message = `🚨 Price Alert: ${alert.symbol} is ${alert.condition} ${alert.value} (Current: ${currentPrice.toFixed(4)})`;
    
    // Update alert
    const updatedAlerts = alerts.map(a => 
      a.id === alert.id 
        ? { ...a, triggered: new Date(), triggerCount: a.triggerCount + 1 }
        : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));

    // Send notifications based on settings
    if (settings.pushNotifications && notificationPermission === 'granted') {
      await sendPushNotification('Price Alert Triggered', message);
    }

    if (settings.telegram && telegramConfig.isConnected) {
      await sendTelegramMessage(message);
    }

    // Show toast notification
    toast.success(message, {
      duration: 10000,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to price chart or relevant section
        }
      }
    });
  };

  const sendPushNotification = async (title: string, message: string) => {
    try {
      if ('serviceWorker' in navigator) {
        // Use service worker for background notifications
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: 'price-alert',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Chart',
              icon: '/icon-chart.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/icon-close.png'
            }
          ],
          data: {
            type: 'price_alert',
            timestamp: Date.now()
          }
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          tag: 'price-alert'
        });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const sendTelegramMessage = async (message: string) => {
    try {
      if (!telegramConfig.botToken || !telegramConfig.chatId) {
        throw new Error('Telegram configuration incomplete');
      }

      const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram message');
      }

      setTelegramConfig(prev => ({
        ...prev,
        lastMessage: new Date()
      }));
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      toast.error('Failed to send Telegram notification');
    }
  };

  const testTelegramConnection = async () => {
    try {
      const testMessage = '🤖 Quantum Risk Coach: Telegram integration test successful!';
      await sendTelegramMessage(testMessage);
      
      setTelegramConfig(prev => ({
        ...prev,
        isConnected: true
      }));
      
      toast.success('Telegram connection successful!');
    } catch (error) {
      setTelegramConfig(prev => ({
        ...prev,
        isConnected: false
      }));
      toast.error('Telegram connection failed. Check your Bot Token and Chat ID.');
    }
  };

  const addPriceAlert = () => {
    if (!newAlert.symbol || !newAlert.value) {
      toast.error('Please fill in all fields');
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      value: newAlert.value,
      isActive: true,
      created: new Date(),
      triggerCount: 0
    };

    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));

    setNewAlert({ symbol: '', condition: 'above', value: 0 });
    toast.success('Price alert created successfully!');
  };

  const toggleAlert = (id: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    toast.success('Alert deleted');
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  };

  const getAlertTypeIcon = (condition: string) => {
    switch (condition) {
      case 'above': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'below': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'crosses_up': return <Target className="w-4 h-4 text-blue-400" />;
      case 'crosses_down': return <Target className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (condition: string) => {
    return <Target className="w-4 h-4 text-cyan-400" />;
  };

  const popularSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'BTCUSD', 'ETHUSD', 'XAUUSD', 'SPX500'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Notifications & Alerts</span>
          </h2>
          <p className="text-slate-400">Stay informed with real-time notifications and price alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={notificationPermission === 'granted' ? 'default' : 'destructive'}>
            {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
          </Badge>
          {notificationPermission !== 'granted' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestNotificationPermission}
              className="border-cyan-500 text-cyan-400"
            >
              Enable
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Price Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Telegram</span>
            <span className="sm:hidden">Bot</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Create New Alert */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-400" />
                <span>Create Price Alert</span>
              </CardTitle>
              <CardDescription>
                Get notified when your favorite instruments reach target prices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={newAlert.symbol} onValueChange={(value) => setNewAlert(prev => ({ ...prev, symbol: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularSymbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={newAlert.condition} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="crosses_up">Crosses Up</SelectItem>
                      <SelectItem value="crosses_down">Crosses Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Price Level</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newAlert.value || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter price"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addPriceAlert} className="w-full holo-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Price Alerts ({alerts.filter(a => a.isActive).length})</span>
                <Badge variant="outline" className="text-cyan-400">
                  {alerts.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">No price alerts set up yet</p>
                  <p className="text-sm text-slate-500">Create your first alert above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${alert.isActive ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{alert.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.condition}
                            </Badge>
                            <span className="text-cyan-400 font-mono">{alert.value}</span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center space-x-3">
                            <span>Created: {alert.created.toLocaleDateString()}</span>
                            {alert.triggerCount > 0 && (
                              <span>Triggered: {alert.triggerCount}x</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAlert(alert.id)}
                          className={alert.isActive ? 'text-green-400' : 'text-slate-400'}
                        >
                          {alert.isActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Integration Tab */}
        <TabsContent value="telegram" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span>Telegram Bot Integration</span>
                <Badge variant={telegramConfig.isConnected ? 'default' : 'destructive'}>
                  {telegramConfig.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Receive trading alerts directly on Telegram for instant mobile notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input
                    type="password"
                    value={telegramConfig.botToken}
                    onChange={(e) => setTelegramConfig(prev => ({ ...prev, botToken: e.target.value }))}
                    placeholder="Enter your Telegram bot token"
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-400">
                    Get your bot token from @BotFather on Telegram
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatId">Chat ID</Label>
                  <Input
                    value={telegramConfig.chatId}
                    onChange={(e) => setTelegramConfig(prev => ({ ...prev, chatId: e.target.value }))}
                    placeholder="Enter your chat ID"
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-400">
                    Send /start to your bot and get your chat ID from @userinfobot
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={testTelegramConnection}
                    disabled={!telegramConfig.botToken || !telegramConfig.chatId}
                    className="holo-button"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem('telegramConfig', JSON.stringify(telegramConfig));
                      toast.success('Telegram settings saved');
                    }}
                    className="border-slate-600"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>

              {telegramConfig.isConnected && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Telegram Connected</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    You'll receive trading alerts and notifications on Telegram
                  </p>
                  {telegramConfig.lastMessage && (
                    <p className="text-xs text-slate-400 mt-1">
                      Last message: {telegramConfig.lastMessage.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Features */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Available Telegram Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Price Alerts</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Instant notifications when your price targets are hit
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Trade Executions</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Get notified when trades are opened or closed
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">Risk Warnings</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Receive alerts when risk limits are approached
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Market Updates</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Daily market summaries and economic calendar events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Push Notifications</p>
                        <p className="text-xs text-slate-400">Browser and mobile app notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSettings('pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Telegram</p>
                        <p className="text-xs text-slate-400">Instant messaging alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.telegram}
                      onCheckedChange={(checked) => updateSettings('telegram', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Sound Alerts</p>
                        <p className="text-xs text-slate-400">Audio notifications for important alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked) => updateSettings('sound', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">Trade Executions</span>
                    </div>
                    <Switch
                      checked={settings.tradeExecutions}
                      onCheckedChange={(checked) => updateSettings('tradeExecutions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">Price Alerts</span>
                    </div>
                    <Switch
                      checked={settings.priceAlerts}
                      onCheckedChange={(checked) => updateSettings('priceAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">AI Insights</span>
                    </div>
                    <Switch
                      checked={settings.aiInsights}
                      onCheckedChange={(checked) => updateSettings('aiInsights', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">Economic Events</span>
                    </div>
                    <Switch
                      checked={settings.economicEvents}
                      onCheckedChange={(checked) => updateSettings('economicEvents', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">Risk Warnings</span>
                    </div>
                    <Switch
                      checked={settings.riskWarnings}
                      onCheckedChange={(checked) => updateSettings('riskWarnings', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent alerts and notifications sent to your devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.filter(a => a.triggered).map((alert) => (
                  <div key={`${alert.id}-triggered`} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {alert.symbol} {alert.condition} {alert.value}
                        </p>
                        <p className="text-xs text-slate-400">
                          Triggered: {alert.triggered?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400">
                      Delivered
                    </Badge>
                  </div>
                ))}
                {alerts.filter(a => a.triggered).length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No triggered alerts yet</p>
                    <p className="text-sm text-slate-500">Your alert history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsAlerts; 