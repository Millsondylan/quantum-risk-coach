import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  MessageCircle,
  Smartphone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { notificationService, PriceAlert, Notification } from '@/lib/api';

const NotificationsAlerts = () => {
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: 0,
    condition: 'above' as 'above' | 'below'
  });

  // Mock data for demonstration
  const mockPriceAlerts: PriceAlert[] = [
    {
      id: '1',
      symbol: 'EURUSD',
      targetPrice: 1.0850,
      condition: 'above',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      symbol: 'GBPUSD',
      targetPrice: 1.2650,
      condition: 'below',
      status: 'triggered',
      createdAt: '2024-01-14T14:30:00Z'
    },
    {
      id: '3',
      symbol: 'USDJPY',
      targetPrice: 148.50,
      condition: 'above',
      status: 'active',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'price_alert',
      title: 'Price Alert: EURUSD',
      message: 'EURUSD has reached your target price of 1.0850',
      data: { symbol: 'EURUSD', price: 1.0850 },
      read: false,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'trade_entry',
      title: 'Trade Entry: GBPUSD',
      message: 'New trade opened: GBPUSD BUY at 1.2630',
      data: { symbol: 'GBPUSD', type: 'buy', price: 1.2630 },
      read: true,
      createdAt: '2024-01-15T09:45:00Z'
    },
    {
      id: '3',
      type: 'market_event',
      title: 'Market Event: NFP Release',
      message: 'US Non-Farm Payrolls data released in 30 minutes',
      data: { event: 'NFP', time: '13:30' },
      read: false,
      createdAt: '2024-01-15T08:00:00Z'
    }
  ];

  useEffect(() => {
    setPriceAlerts(mockPriceAlerts);
    setNotifications(mockNotifications);
  }, []);

  const handleCreateAlert = async () => {
    try {
      const alert = await notificationService.createPriceAlert(newAlert);
      setPriceAlerts(prev => [...prev, alert]);
      setIsCreatingAlert(false);
      setNewAlert({ symbol: '', targetPrice: 0, condition: 'above' });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleToggleNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: !notif.read }
          : notif
      )
    );
  };

  const handleSendTelegramTest = async () => {
    try {
      await notificationService.sendTelegramNotification(
        '🔔 Test notification from TradeMind AI\n\nThis is a test message to verify Telegram integration is working correctly.',
        'your_chat_id'
      );
    } catch (error) {
      console.error('Failed to send Telegram test:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'triggered': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'triggered': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_alert': return <DollarSign className="h-4 w-4" />;
      case 'trade_entry': return <TrendingUp className="h-4 w-4" />;
      case 'trade_exit': return <TrendingDown className="h-4 w-4" />;
      case 'market_event': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications & Alerts
        </CardTitle>
        <CardDescription>
          Price alerts, notifications, and communication channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            {/* Create Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Price Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., EURUSD"
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Target Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.0001"
                      placeholder="1.0850"
                      value={newAlert.targetPrice || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newAlert.condition}
                      onValueChange={(value: 'above' | 'below') => setNewAlert(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleCreateAlert}
                      disabled={!newAlert.symbol || !newAlert.targetPrice}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Price Alerts</h3>
              {priceAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status)}`} />
                        <div>
                          <h4 className="font-semibold">{alert.symbol}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.condition === 'above' ? 'Above' : 'Below'} {alert.targetPrice}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Notifications</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                Mark All Read
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleToggleNotification(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${!notification.read ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${!notification.read ? 'text-blue-900' : ''}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${!notification.read ? 'text-blue-700' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telegram Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Telegram Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Telegram Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts and notifications via Telegram
                      </p>
                    </div>
                    <Switch
                      checked={telegramEnabled}
                      onCheckedChange={setTelegramEnabled}
                    />
                  </div>
                  
                  {telegramEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="chatId">Chat ID</Label>
                        <Input
                          id="chatId"
                          placeholder="Your Telegram chat ID"
                          defaultValue="your_chat_id"
                        />
                      </div>
                      <Button onClick={handleSendTelegramTest} variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Test Message
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Push Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={pushEnabled}
                      onCheckedChange={setPushEnabled}
                    />
                  </div>
                  
                  {pushEnabled && (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          Push notifications are enabled. You'll receive alerts for price movements and important events.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Price Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        When symbols reach target prices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trade Entries/Exits</p>
                      <p className="text-sm text-muted-foreground">
                        When trades are opened or closed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Market Events</p>
                      <p className="text-sm text-muted-foreground">
                        Economic calendar events and news
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Platform updates and maintenance
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Alert Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Play sound for notifications
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Desktop Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Send email for important alerts
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Timing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Timing Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Quiet Hours</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input type="time" defaultValue="22:00" />
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      No notifications during these hours
                    </p>
                  </div>
                  
                  <div>
                    <Label>Alert Frequency</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="5min">Every 5 minutes</SelectItem>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="1hour">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{priceAlerts.length}</div>
                    <div className="text-sm text-muted-foreground">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {priceAlerts.filter(a => a.status === 'triggered').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Triggered Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{notifications.length}</div>
                    <div className="text-sm text-muted-foreground">Total Notifications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{unreadCount}</div>
                    <div className="text-sm text-muted-foreground">Unread</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationsAlerts; 