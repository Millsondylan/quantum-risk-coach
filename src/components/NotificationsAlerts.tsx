import React, { useState, useEffect, useCallback } from 'react';
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
  Search,
  Globe,
  Newspaper,
  Wallet,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import { pushNotificationService, NotificationPreferences as ServiceNotificationPreferences } from '@/lib/pushNotificationService';
import { useUser } from '@/contexts/UserContext';
import type { NotificationPreferences } from '@/types/user';
import { realDataService } from '@/lib/realDataService';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'browser' | 'telegram' | 'email' | 'sms'; // Extend types as needed
  enabled: boolean;
  icon: React.JSX.Element;
}

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

const NotificationsAlerts = () => {
  const { user, updatePreferences } = useUser();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
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
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    // Initialize with default preferences from service
    const defaultPrefs = pushNotificationService.getPreferences();
    // Merge with user's saved preferences if available
    const userPrefs = user?.preferences?.notifications;
    if (userPrefs) {
      return { ...defaultPrefs, ...userPrefs };
    }
    // Convert service preferences to user preferences format
    return {
      ...defaultPrefs,
      email: true,
      push: true,
      tradingStyle: 'day',
      riskTolerance: 'moderate',
      experience: 'intermediate'
    } as NotificationPreferences;
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast: useToastToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);

  // Declare channels state here
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'browser',
      name: 'Browser Push',
      type: 'browser',
      enabled: false,
      icon: <Globe className="w-4 h-4" />
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      type: 'telegram',
      enabled: false,
      icon: <MessageCircle className="w-4 h-4" />
    }
  ]);

  useEffect(() => {
    checkNotificationPermission();
    // Ensure preferences are loaded and updated when user context changes
    const currentPreferences = pushNotificationService.getPreferences();
    if (user?.preferences?.notifications) {
      const mergedPreferences = { ...currentPreferences, ...user.preferences.notifications };
      pushNotificationService.updatePreferences(mergedPreferences);
      setPreferences(mergedPreferences as NotificationPreferences);
    } else {
      setPreferences({
        ...currentPreferences,
        email: true,
        push: true,
        tradingStyle: 'day',
        riskTolerance: 'moderate',
        experience: 'intermediate'
      } as NotificationPreferences);
    }
  }, [user]);

  const checkNotificationPermission = () => {
    // Check notification permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const loadSavedData = () => {
    // Load settings from pushNotificationService
    const currentPreferences = pushNotificationService.getPreferences();
    setPreferences({
      ...currentPreferences,
      email: true,
      push: true,
      tradingStyle: 'day',
      riskTolerance: 'moderate',
      experience: 'intermediate'
    } as NotificationPreferences);

    // Load existing alerts from localStorage
    const storedAlerts = localStorage.getItem('priceAlerts');
    if (storedAlerts) {
      try {
        setAlerts(JSON.parse(storedAlerts));
      } catch (e) {
        console.error('Error parsing stored alerts:', e);
        setAlerts([]);
      }
    }

    // Load existing alert rules
    const storedRules = localStorage.getItem('alertRules');
    if (storedRules) {
      try {
        setAlertRules(JSON.parse(storedRules));
      } catch (e) {
        console.error('Error parsing stored alert rules:', e);
        setAlertRules([]);
      }
    }

    // Initialize channel status based on preferences
    setChannels(prev => prev.map(channel => {
      if (channel.id === 'browser') {
        return { ...channel, enabled: currentPreferences.pushNotifications };
      } else if (channel.id === 'telegram') {
        // Assuming there's a preference for Telegram enablement in ServiceNotificationPreferences or a related state
        // For now, linking to a placeholder check in telegramConfig.isConnected, adjust as needed
        return { ...channel, enabled: telegramConfig.isConnected };
      }
      return channel;
    }));
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
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await pushNotificationService.requestPermission();
      setPushPermission(permission as NotificationPermission);
      
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
        // Update the pushNotifications preference directly via saveUserPreferences
        saveUserPreferences({ ...preferences, pushNotifications: true });
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPriceAlerts = async () => {
    // Check if any price alerts should be triggered
    const activePriceAlerts = alerts.filter(alert => alert.isActive);

    for (const alert of activePriceAlerts) {
      try {
        const currentPriceData = await realDataService.getRealTimePrice(alert.symbol);
        if (!currentPriceData || currentPriceData.price === undefined) {
          console.warn(`Could not get real-time price for ${alert.symbol}`);
          continue;
        }

        const currentPrice = currentPriceData.price;
        let shouldTrigger = false;

        switch (alert.condition) {
          case 'above':
            shouldTrigger = currentPrice > alert.value;
            break;
          case 'below':
            shouldTrigger = currentPrice < alert.value;
            break;
          case 'crosses_up':
            // For 'crosses_up', we need to know the previous price.
            // This would typically involve more sophisticated state management
            // or backend logic to track historical prices.
            // For simplicity, we'll assume it triggers if it goes above the value.
            // A more robust solution would check if prevPrice < value && currentPrice >= value
            shouldTrigger = currentPrice >= alert.value;
            break;
          case 'crosses_down':
            // Similar to crosses_up, assumes it triggers if it goes below the value.
            // A more robust solution would check if prevPrice > value && currentPrice <= value
            shouldTrigger = currentPrice <= alert.value;
            break;
          default:
            break;
        }

        if (shouldTrigger) {
          await triggerAlert(alert, currentPrice);
          // After triggering, you might want to deactivate the alert or set a cooldown
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? { ...a, isActive: false, lastTriggered: new Date().toISOString() } : a
          ));
        }
      } catch (error) {
        console.error(`Error checking price for ${alert.symbol}:`, error);
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
    if (preferences.pushNotifications && pushPermission === 'granted') {
      await sendPushNotification('Price Alert Triggered', message);
    }

    if (preferences.telegram && telegramConfig.isConnected) {
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
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      toast.success('Telegram message sent!');
      setTelegramConfig(prev => ({ ...prev, lastMessage: new Date() }));
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      toast.error('Failed to send Telegram message');
    }
  };

  const testTelegramConnection = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      toast.error('Please enter Telegram Bot Token and Chat ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/getMe`);
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.ok) {
        setTelegramConfig(prev => ({ ...prev, isConnected: true }));
        toast.success(`Connected to Telegram bot: ${data.result.first_name}`);
        // Test sending a message to ensure chat ID is correct
        await sendTelegramMessage('🚀 Test message from Qlarity Quantum Risk Coach. If you received this, your Telegram connection is working!');
      } else {
        setTelegramConfig(prev => ({ ...prev, isConnected: false }));
        toast.error('Invalid Telegram Bot Token or Chat ID');
      }
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      setTelegramConfig(prev => ({ ...prev, isConnected: false }));
      toast.error('Failed to connect to Telegram');
    } finally {
      setIsLoading(false);
    }
  };

  const addPriceAlert = () => {
    if (!newAlert.symbol || newAlert.value <= 0) {
      toast.error('Please enter a valid symbol and value for the alert');
      return;
    }
    const id = `alert_${Date.now()}`;
    const alertToAdd = { ...newAlert, id, isActive: true, created: new Date(), triggerCount: 0 };
    setAlerts(prev => [...prev, alertToAdd]);
    localStorage.setItem('priceAlerts', JSON.stringify([...alerts, alertToAdd]));
    setNewAlert({ symbol: '', condition: 'above', value: 0 });
    toast.success('Price alert added!');
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    localStorage.setItem('priceAlerts', JSON.stringify(alerts.filter(alert => alert.id !== id)));
    toast.success('Price alert deleted!');
  };

  const getAlertTypeIcon = (condition: string) => {
    switch (condition) {
      case 'above': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'below': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'crosses_up': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'crosses_down': return <TrendingDown className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: 'browser' | 'telegram' | 'email' | 'sms') => {
    switch (type) {
      case 'browser': return <Smartphone className="w-4 h-4" />;
      case 'telegram': return <MessageCircle className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAlertRules = alertRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rule.symbol && rule.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'system': return <Info className="w-4 h-4 text-blue-500" />;
      case 'news': return <Newspaper className="w-4 h-4 text-purple-500" />;
      case 'performance': return <Activity className="w-4 h-4 text-cyan-500" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const toggleAlertRule = (id: string) => {
    setAlertRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const deleteAlertRule = (id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id));
    toast.success('Alert rule deleted!');
  };

  const sendTestNotification = async () => {
    if (pushPermission === 'granted') {
      await pushNotificationService.sendTestNotification();
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable browser notifications first');
    }
  };

  const saveUserPreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      // Update preferences in the pushNotificationService
      await pushNotificationService.updatePreferences(newPreferences);
      // Also update in UserContext to persist across sessions
      await updatePreferences({ notifications: newPreferences });

      setPreferences(newPreferences);
      toast.success('Notification preferences saved!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const updateChannelStatus = (channelId: string, enabled: boolean) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, enabled } : channel
    ));

    // Update pushNotificationService preferences directly for channel statuses
    if (channelId === 'browser') {
      saveUserPreferences({ ...preferences, pushNotifications: enabled });
    } else if (channelId === 'telegram') {
      // This assumes telegram channel status is directly tied to a preference
      // If not, it needs a specific preference for telegram enablement
      // For now, we'll map it to a generic 'telegram' preference if it exists
      // If 'telegram' is part of NotificationPreferences, it should be set here
      // Assuming it's not directly in NotificationPreferences but via `telegramConfig`
      // This might require more complex state management or an explicit preference for telegram
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    saveUserPreferences(newPreferences);
  };

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
          <Badge variant={pushPermission === 'granted' ? 'default' : 'destructive'}>
            {pushPermission === 'granted' ? 'Enabled' : 'Disabled'}
          </Badge>
          {pushPermission !== 'granted' && (
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
                  <span>Create New Alert</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Alert Rule</DialogTitle>
                  <DialogDescription>
                    Define conditions for a new alert to notify you about market changes.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ruleName" className="text-right">Name</Label>
                    <Input id="ruleName" value={editingRule?.name || ''} onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ruleType" className="text-right">Type</Label>
                    <Select value={editingRule?.type || 'price'} onValueChange={(value) => setEditingRule(prev => prev ? { ...prev, type: value as any } : null)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="indicator">Indicator</SelectItem>
                        <SelectItem value="pattern">Pattern</SelectItem>
                        <SelectItem value="risk">Risk</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingRule?.type === 'price' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="symbol" className="text-right">Symbol</Label>
                      <Input id="symbol" value={editingRule?.symbol || ''} onChange={(e) => setEditingRule(prev => prev ? { ...prev, symbol: e.target.value } : null)} className="col-span-3" />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="condition" className="text-right">Condition</Label>
                    <Input id="condition" value={editingRule?.condition || ''} onChange={(e) => setEditingRule(prev => prev ? { ...prev, condition: e.target.value } : null)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="threshold" className="text-right">Threshold</Label>
                    <Input id="threshold" type="number" value={editingRule?.threshold || 0} onChange={(e) => setEditingRule(prev => prev ? { ...prev, threshold: parseFloat(e.target.value) } : null)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateAlert(false)}>Cancel</Button>
                  <Button onClick={() => {
                    // Logic to save the new or updated alert rule
                    setShowCreateAlert(false);
                    toast.success('Alert rule saved!');
                  }}>Save Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {filteredAlertRules.map((rule) => (
              <Card key={rule.id} className="holo-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
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
                      checked={preferences.pushNotifications}
                      onCheckedChange={() => togglePreference('pushNotifications')}
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
                      checked={preferences.telegram}
                      onCheckedChange={() => togglePreference('telegram')}
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
                      checked={preferences.soundEnabled}
                      onCheckedChange={() => togglePreference('soundEnabled')}
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
                      checked={preferences.tradeSignals}
                      onCheckedChange={() => togglePreference('tradeSignals')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">Price Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.priceAlerts}
                      onCheckedChange={() => togglePreference('priceAlerts')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">AI Insights</span>
                    </div>
                    <Switch
                      checked={preferences.aiInsights}
                      onCheckedChange={() => togglePreference('aiInsights')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Newspaper className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">News Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.newsAlerts}
                      onCheckedChange={() => togglePreference('newsAlerts')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm text-white">Portfolio Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.portfolioAlerts}
                      onCheckedChange={() => togglePreference('portfolioAlerts')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">Economic Events</span>
                    </div>
                    <Switch
                      checked={preferences.economicEvents}
                      onCheckedChange={() => togglePreference('economicEvents')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white">Market Updates</span>
                    </div>
                    <Switch
                      checked={preferences.marketUpdates}
                      onCheckedChange={() => togglePreference('marketUpdates')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">Risk Warnings</span>
                    </div>
                    <Switch
                      checked={preferences.riskWarnings}
                      onCheckedChange={() => togglePreference('riskWarnings')}
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