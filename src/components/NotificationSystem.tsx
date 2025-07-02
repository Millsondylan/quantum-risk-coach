import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Smartphone,
  Globe,
  MessageSquare,
  DollarSign,
  Clock,
  Activity,
  CheckCircle,
  X,
  Volume2,
  VolumeX,
  Filter,
  Zap,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Separator } from '@/components/ui/separator';
import { pushNotificationService } from '@/lib/pushNotificationService';
import { UserPreferences } from '@/contexts/UserContext';

type NotificationPreferences = UserPreferences['notifications'];

interface NotificationChannel {
  id: string;
  name: string;
  type: 'browser' | 'telegram' | 'email';
  enabled: boolean;
  icon: React.ReactNode;
}

interface NotificationFilter {
  impact: 'all' | 'high' | 'medium' | 'low';
  sources: string[];
  symbols: string[];
  minPriceChange: number;
  newsCategories: string[];
  timeRange: 'realtime' | '15min' | '1hour' | '4hour' | 'daily';
}

interface RecentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  icon: React.ReactNode;
}

const NotificationSystem = () => {
  const { user, updatePreferences } = useUser();
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => 
    user?.preferences.notifications || {
      tradeAlerts: true,
      marketUpdates: true,
      riskWarnings: true,
      priceAlerts: true,
      newsAlerts: true,
      aiInsights: true,
      tradeSignals: true,
      economicEvents: true,
      marketSentiment: true,
      portfolioAlerts: true,
    }
  );

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
      icon: <MessageSquare className="w-4 h-4" />
    }
  ]);

  const [filters, setFilters] = useState<NotificationFilter>({
    impact: 'all',
    sources: [],
    symbols: [],
    minPriceChange: 1.0,
    newsCategories: [],
    timeRange: 'realtime'
  });

  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([
    {
      id: '1',
      type: 'price_alert',
      title: 'BTC Price Alert',
      message: 'Bitcoin has increased by 5.2% in the last hour',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      priority: 'high',
      read: false,
      icon: <TrendingUp className="w-4 h-4 text-green-400" />
    },
    {
      id: '2',
      type: 'news_alert',
      title: 'Fed Rate Decision',
      message: 'Federal Reserve announces interest rate decision',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      priority: 'high',
      read: true,
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />
    },
    {
      id: '3',
      type: 'ai_insight',
      title: 'Market Analysis',
      message: 'AI detected potential breakout pattern in EUR/USD',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      priority: 'medium',
      read: true,
      icon: <Zap className="w-4 h-4 text-purple-400" />
    }
  ]);

  useEffect(() => {
    checkNotificationPermission();
    if (user?.preferences.notifications) {
      setPreferences(user.preferences.notifications);
    }
  }, [user]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await pushNotificationService.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
        updateChannelStatus('browser', true);
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

  const sendTestNotification = async () => {
    if (pushPermission === 'granted') {
      await pushNotificationService.sendNotification({
        title: 'Test Notification',
        body: 'Your Qlarity notifications are working!',
        icon: '/qlarity-icon.png',
        tag: 'test-notification'
      });
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable browser notifications first');
    }
  };

  const saveUserPreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
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
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    saveUserPreferences(newPreferences);
  };

  const markAsRead = (notificationId: string) => {
    setRecentNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setRecentNotifications([]);
    toast.success('All notifications cleared');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const unreadCount = recentNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-blue-400" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Smart Notifications</h2>
            <p className="text-sm text-slate-400">Manage your trading alerts and preferences</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={sendTestNotification}
            disabled={pushPermission !== 'granted'}
            className="border-slate-600 text-slate-300"
          >
            Test
          </Button>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllNotifications}
              className="border-slate-600 text-slate-300"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="preferences">Types</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span>Notification Channels</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Browser Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <Label className="text-white font-medium">Browser Push Notifications</Label>
                    <p className="text-sm text-slate-400">Real-time notifications in your browser</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {pushPermission === 'granted' && (
                    <Badge className="bg-green-400/20 text-green-400">Enabled</Badge>
                  )}
                  {pushPermission === 'denied' && (
                    <Badge className="bg-red-400/20 text-red-400">Blocked</Badge>
                  )}
                  {pushPermission === 'default' && (
                    <Button 
                      size="sm"
                      onClick={requestNotificationPermission}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Requesting...' : 'Enable'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Telegram Bot */}
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <div>
                    <Label className="text-white font-medium">Telegram Bot</Label>
                    <p className="text-sm text-slate-400">Get alerts via Telegram messenger</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-400/20 text-green-400">Available</Badge>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    Setup
                  </Button>
                </div>
              </div>

              {/* Sound Settings */}
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white font-medium">Sound Notifications</Label>
                    <p className="text-sm text-slate-400">Play sound for high priority alerts</p>
                  </div>
                  <Switch 
                    checked={preferences.riskWarnings}
                    onCheckedChange={() => togglePreference('riskWarnings')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Types */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>Notification Types</span>
              </CardTitle>
              <CardDescription>
                Choose which types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                priceAlerts: { 
                  label: 'Price Alerts', 
                  desc: 'Get notified when prices hit your targets',
                  icon: <DollarSign className="w-4 h-4 text-green-400" />
                },
                newsAlerts: { 
                  label: 'Market News', 
                  desc: 'Breaking news and market updates',
                  icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />
                },
                aiInsights: { 
                  label: 'AI Insights', 
                  desc: 'AI-powered market analysis and recommendations',
                  icon: <Zap className="w-4 h-4 text-purple-400" />
                },
                tradeSignals: { 
                  label: 'Trade Signals', 
                  desc: 'Buy/sell signals and trading opportunities',
                  icon: <TrendingUp className="w-4 h-4 text-blue-400" />
                },
                economicEvents: { 
                  label: 'Economic Events', 
                  desc: 'Economic calendar events and data releases',
                  icon: <Clock className="w-4 h-4 text-orange-400" />
                },
                marketSentiment: { 
                  label: 'Market Sentiment', 
                  desc: 'Overall market mood and sentiment changes',
                  icon: <Activity className="w-4 h-4 text-cyan-400" />
                },
                portfolioAlerts: { 
                  label: 'Portfolio Alerts', 
                  desc: 'Updates about your trading performance',
                  icon: <CheckCircle className="w-4 h-4 text-indigo-400" />
                },
                riskWarnings: { 
                  label: 'Risk Warnings', 
                  desc: 'Important risk and safety notifications',
                  icon: <AlertTriangle className="w-4 h-4 text-red-400" />
                }
              }).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {config.icon}
                    <div>
                      <Label className="text-white font-medium">{config.label}</Label>
                      <p className="text-sm text-slate-400">{config.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={preferences[key as keyof NotificationPreferences]}
                      onCheckedChange={() => togglePreference(key as keyof NotificationPreferences)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={async () => await pushNotificationService.sendNotification({
                        title: config.label,
                        body: config.desc
                      })}
                      className="h-8 w-8 p-0"
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Filters */}
        <TabsContent value="filters" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-400" />
                <span>Notification Filters</span>
              </CardTitle>
              <CardDescription>
                Fine-tune which notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Impact Level</Label>
                  <Select value={filters.impact} onValueChange={(value: any) => setFilters({...filters, impact: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Impact Levels</SelectItem>
                      <SelectItem value="high">High Impact Only</SelectItem>
                      <SelectItem value="medium">Medium & High Impact</SelectItem>
                      <SelectItem value="low">Low Impact & Above</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Time Range</Label>
                  <Select value={filters.timeRange} onValueChange={(value: any) => setFilters({...filters, timeRange: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="1hour">Hourly</SelectItem>
                      <SelectItem value="4hour">Every 4 hours</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Min Price Change (%)</Label>
                  <Select 
                    value={filters.minPriceChange.toString()} 
                    onValueChange={(value) => setFilters({...filters, minPriceChange: parseFloat(value)})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5%</SelectItem>
                      <SelectItem value="1.0">1.0%</SelectItem>
                      <SelectItem value="2.0">2.0%</SelectItem>
                      <SelectItem value="5.0">5.0%</SelectItem>
                      <SelectItem value="10.0">10.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Quiet Hours</Label>
                  <Select defaultValue="none">
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No quiet hours</SelectItem>
                      <SelectItem value="night">22:00 - 06:00</SelectItem>
                      <SelectItem value="weekend">Weekends only</SelectItem>
                      <SelectItem value="custom">Custom hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recent Notifications</span>
              </CardTitle>
              <CardDescription>
                Your latest notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      notification.read 
                        ? 'bg-slate-800/30 border-slate-700/50' 
                        : 'bg-blue-900/20 border-blue-600/30'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {notification.icon}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSystem; 