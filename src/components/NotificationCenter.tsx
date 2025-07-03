import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Info, Settings, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'price-alert' | 'trade-fill' | 'performance' | 'system';
  isRead: boolean;
  timestamp: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          title: 'EURUSD Price Alert',
          message: 'EURUSD has reached your target price of 1.0950',
          type: 'price-alert',
          isRead: false,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
        },
        {
          id: '2',
          title: 'Order Filled',
          message: 'Your buy order for BTC/USD at 52,400 has been filled',
          type: 'trade-fill',
          isRead: false,
          timestamp: new Date(Date.now() - 35 * 60000).toISOString() // 35 minutes ago
        },
        {
          id: '3',
          title: 'Daily Performance Summary',
          message: 'Your portfolio is up 2.3% today. View details...',
          type: 'performance',
          isRead: true,
          timestamp: new Date(Date.now() - 12 * 3600000).toISOString() // 12 hours ago
        },
        {
          id: '4',
          title: 'API Key Expiring',
          message: 'Your Binance API key will expire in 3 days',
          type: 'system',
          isRead: true,
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString() // 24 hours ago
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price-alert': return <Bell className="w-5 h-5 text-blue-400" />;
      case 'trade-fill': return <Bell className="w-5 h-5 text-green-400" />;
      case 'performance': return <Bell className="w-5 h-5 text-yellow-400" />;
      case 'system': return <Bell className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const filteredNotifications = selectedFilter 
    ? notifications.filter(n => n.type === selectedFilter) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <Badge variant="outline">{unreadCount} new</Badge>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2">
        <Button 
          variant={selectedFilter === null ? 'default' : 'outline'} 
          className="whitespace-nowrap"
          size="sm"
          onClick={() => setSelectedFilter(null)}
        >
          All
        </Button>
        <Button 
          variant={selectedFilter === 'price-alert' ? 'default' : 'outline'} 
          className="whitespace-nowrap"
          size="sm"
          onClick={() => setSelectedFilter('price-alert')}
        >
          Price Alerts
        </Button>
        <Button 
          variant={selectedFilter === 'trade-fill' ? 'default' : 'outline'} 
          className="whitespace-nowrap"
          size="sm"
          onClick={() => setSelectedFilter('trade-fill')}
        >
          Trade Fills
        </Button>
        <Button 
          variant={selectedFilter === 'performance' ? 'default' : 'outline'} 
          className="whitespace-nowrap"
          size="sm"
          onClick={() => setSelectedFilter('performance')}
        >
          Performance
        </Button>
        <Button 
          variant={selectedFilter === 'system' ? 'default' : 'outline'} 
          className="whitespace-nowrap"
          size="sm"
          onClick={() => setSelectedFilter('system')}
        >
          System
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-4 animate-pulse">
              <div className="h-5 w-1/2 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-slate-700 rounded mb-2"></div>
              <div className="flex justify-between">
                <div className="h-4 w-1/4 bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg p-6 text-center">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400">No notifications to display</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-[#1A1B1E] border ${notification.isRead ? 'border-[#2A2B2E]' : 'border-blue-500'} rounded-lg p-4 transition-colors`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex gap-3">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-white">{notification.title}</h3>
                    {!notification.isRead && <Badge variant="outline" className="bg-blue-500/20 text-blue-400">New</Badge>}
                  </div>
                  <p className="text-slate-300 mt-1">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">{getRelativeTime(notification.timestamp)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 hover:bg-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-between"
          onClick={() => window.location.href = '/settings'}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Notification Settings</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}; 