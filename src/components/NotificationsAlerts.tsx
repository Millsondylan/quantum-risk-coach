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
  BarChart3,
  CheckCircle,
  Info,
  Mail,
  Edit,
  Trash,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';

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

interface Notification {
  id: string;
  type: 'trade' | 'alert' | 'system' | 'news' | 'performance' | 'risk';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface AlertRule {
  id: string;
  name: string;
  type: 'price' | 'indicator' | 'pattern' | 'risk' | 'performance' | 'news';
  symbol?: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface NotificationPreferences {
  tradeAlerts: boolean;
  priceAlerts: boolean;
  riskAlerts: boolean;
  performanceAlerts: boolean;
  newsAlerts: boolean;
  systemAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    tradeAlerts: true,
    priceAlerts: true,
    riskAlerts: true,
    performanceAlerts: true,
    newsAlerts: false,
    systemAlerts: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast: useToastToast } = useToast();

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

  const checkPriceAlerts = () => {
    // Check if any price alerts should be triggered
    const triggeredAlerts = alerts.filter(alert => {
      // For now, we'll use placeholder logic instead of real price checking
      const shouldTrigger = false; // Disabled live price checking
      
      if (shouldTrigger) {
        toast.info(`Price alert: ${alert.symbol} ${alert.condition} ${alert.value}`);
        return true;
      }
      return false;
    });

    if (triggeredAlerts.length > 0) {
      setAlerts(prev => prev.filter(alert => !triggeredAlerts.includes(alert)));
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
      const testMessage = '🤖 Qlarity: Telegram integration test successful!';
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

  // Mock data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'trade',
        title: 'Trade Executed',
        message: 'EUR/USD buy order executed at 1.0850',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        category: 'Trade Execution'
      },
      {
        id: '2',
        type: 'alert',
        title: 'Price Alert Triggered',
        message: 'BTC/USD has reached your target price of $45,000',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        category: 'Price Alert'
      },
      {
        id: '3',
        type: 'risk',
        title: 'Risk Warning',
        message: 'Your daily loss limit is approaching (85% used)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        priority: 'critical',
        category: 'Risk Management'
      },
      {
        id: '4',
        type: 'performance',
        title: 'Weekly Performance',
        message: 'Your portfolio is up 3.2% this week',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        category: 'Performance'
      },
      {
        id: '5',
        type: 'news',
        title: 'Market News',
        message: 'Federal Reserve announces interest rate decision',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium',
        category: 'Market News'
      }
    ];

    const mockAlertRules: AlertRule[] = [
      {
        id: '1',
        name: 'BTC Price Alert',
        type: 'price',
        symbol: 'BTC/USD',
        condition: 'above',
        threshold: 45000,
        enabled: true,
        notifications: {
          push: true,
          email: true,
          sms: false,
          inApp: true
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        triggerCount: 3
      },
      {
        id: '2',
        name: 'Daily Loss Limit',
        type: 'risk',
        condition: 'daily_loss',
        threshold: 500,
        enabled: true,
        notifications: {
          push: true,
          email: true,
          sms: true,
          inApp: true
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        triggerCount: 1
      },
      {
        id: '3',
        name: 'RSI Oversold',
        type: 'indicator',
        symbol: 'EUR/USD',
        condition: 'rsi_below',
        threshold: 30,
        enabled: false,
        notifications: {
          push: false,
          email: true,
          sms: false,
          inApp: true
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        triggerCount: 0
      }
    ];

    setNotifications(mockNotifications);
    setAlertRules(mockAlertRules);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <Zap className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'performance': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'news': return <Info className="h-4 w-4 text-blue-500" />;
      case 'system': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    useToastToast({
      title: "All notifications marked as read",
      description: "You've cleared all unread notifications."
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    useToastToast({
      title: "Notification deleted",
      description: "The notification has been removed."
    });
  };

  const toggleAlertRule = (id: string) => {
    setAlertRules(prev => 
      prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)
    );
  };

  const deleteAlertRule = (id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id));
    useToastToast({
      title: "Alert rule deleted",
      description: "The alert rule has been removed."
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAlertRules = alertRules.filter(rule => 
    rule.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Notifications & Alerts</span>
          </h2>
          <p className="text-slate-400">Stay informed with notifications and price alerts</p>
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

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Alert Rules</span>
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

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trade">Trades</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search alert rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Alert</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Alert Rule</DialogTitle>
                  <DialogDescription>
                    Set up a new alert rule to monitor market conditions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Alert Name</label>
                    <Input placeholder="e.g., BTC Price Alert" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alert Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price Alert</SelectItem>
                        <SelectItem value="indicator">Technical Indicator</SelectItem>
                        <SelectItem value="pattern">Chart Pattern</SelectItem>
                        <SelectItem value="risk">Risk Management</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Symbol (Optional)</label>
                    <Input placeholder="e.g., BTC/USD" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Condition</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="crosses">Crosses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Threshold</label>
                    <Input type="number" placeholder="Enter value" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateAlert(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateAlert(false)}>
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredAlertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleAlertRule(rule.id)}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-600">
                          {rule.symbol && `${rule.symbol} `}
                          {rule.condition} {rule.threshold}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Triggered {rule.triggerCount} times</span>
                          {rule.lastTriggered && (
                            <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlertRule(rule.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400">
                      {notification.category}
                    </Badge>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No notifications yet</p>
                    <p className="text-sm text-slate-500">Your notification history will appear here</p>
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