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
  Plus,
  MessageSquare,
  Mail
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

  const [showNewAlert, setShowNewAlert] = useState(false);
  const [settings, setSettings] = useState({
    telegramEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    priceAlerts: true,
    tradeAlerts: true,
    newsAlerts: false
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
        '🔔 Test notification from Quantum Risk Coach\n\nThis is a test message to verify Telegram integration is working correctly.',
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

  const alertTypes = [
    { value: 'price_alert', label: 'Price Alert', icon: DollarSign },
    { value: 'trade_alert', label: 'Trade Alert', icon: Zap },
    { value: 'news_alert', label: 'News Alert', icon: MessageSquare },
    { value: 'economic_calendar', label: 'Economic Calendar', icon: Clock },
    { value: 'risk_alert', label: 'Risk Alert', icon: AlertTriangle }
  ];

  const channels = [
    { value: 'telegram', label: 'Telegram', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'push', label: 'Push Notification', icon: Smartphone }
  ];

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, status: notif.status === 'active' ? 'inactive' : 'active' }
        : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getAlertTypeIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    return alertType ? <alertType.icon className="w-4 h-4" /> : <Bell className="w-4 h-4" />;
  };

  const getChannelIcon = (channel: string) => {
    const channelInfo = channels.find(c => c.value === channel);
    return channelInfo ? <channelInfo.icon className="w-4 h-4" /> : <Bell className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications & Alerts</h2>
          <p className="text-slate-400">Manage your trading notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowNewAlert(true)} className="holo-button">
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>Active Alerts</span>
              </CardTitle>
              <CardDescription>
                Manage your notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        {getAlertTypeIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{notification.title}</h4>
                        <p className="text-sm text-slate-400">{notification.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getChannelIcon(notification.type)}
                          <span className="text-xs text-slate-400">{notification.type}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notification.status === 'active'}
                        onCheckedChange={() => toggleNotification(notification.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Telegram</span>
                  </div>
                  <Switch
                    checked={settings.telegramEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, telegramEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">Email</span>
                  </div>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-300">Push Notifications</span>
                  </div>
                  <Switch
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Price Alerts</span>
                  <Switch
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, priceAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Trade Alerts</span>
                  <Switch
                    checked={settings.tradeAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, tradeAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">News Alerts</span>
                  <Switch
                    checked={settings.newsAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, newsAlerts: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Active Alerts</span>
                  <span className="text-white font-medium">
                    {notifications.filter(n => n.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Alerts</span>
                  <span className="text-white font-medium">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Channels Active</span>
                  <span className="text-white font-medium">
                    {Object.values(settings).filter(Boolean).length - 3}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showNewAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Alert</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="alertType">Alert Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Alert Title</Label>
                <Input id="title" placeholder="e.g., EURUSD Price Alert" />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Alert description..." />
              </div>
              
              <div>
                <Label htmlFor="channel">Notification Channel</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map(channel => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewAlert(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button onClick={() => setShowNewAlert(false)} className="holo-button">
                Create Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsAlerts; 