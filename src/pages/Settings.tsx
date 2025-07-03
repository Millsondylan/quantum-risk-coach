import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Download, 
  Trash2,
  Save,
  Settings as SettingsIcon,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { pushNotificationService } from '@/lib/pushNotificationService';
import ApiStatusCard from '@/components/ApiStatusCard';
import { applyTheme } from '@/lib/theme';

const Settings: React.FC = () => {
  const { user, updatePreferences } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handlePreferenceUpdate = async (key: string, value: any) => {
    if (!user) return;
    
    const updates: Partial<typeof user.preferences> = {};
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (parent === 'notifications') {
        updates.notifications = { 
          ...user.preferences.notifications, 
          [child]: value 
        };
      }
    } else {
      (updates as any)[key] = value;
    }
    
    await updatePreferences(updates);
    toast.success('Settings updated successfully!');
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await pushNotificationService.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled successfully!');
      } else {
        toast.error('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const handleExportData = () => {
    // Export user data as JSON
    const data = {
      user: user,
      trades: localStorage.getItem('trades'),
      preferences: user?.preferences,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qlarity-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      toast.success('All data cleared');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="settings-page" className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Trading Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Trading Style</Label>
                  <Select 
                    value={user.preferences.tradingStyle} 
                    onValueChange={(value) => handlePreferenceUpdate('tradingStyle', value)}
                  >
                    <SelectTrigger data-testid="trading-style-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scalping">Scalping</SelectItem>
                      <SelectItem value="day-trading">Day Trading</SelectItem>
                      <SelectItem value="swing-trading">Swing Trading</SelectItem>
                      <SelectItem value="position-trading">Position Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Tolerance</Label>
                  <Select 
                    value={user.preferences.riskTolerance} 
                    onValueChange={(value) => handlePreferenceUpdate('riskTolerance', value)}
                  >
                    <SelectTrigger data-testid="risk-tolerance-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Select 
                    value={user.preferences.experienceLevel} 
                    onValueChange={(value) => handlePreferenceUpdate('experienceLevel', value)}
                  >
                    <SelectTrigger data-testid="experience-level-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select 
                    value={user.preferences.language} 
                    onValueChange={(value) => handlePreferenceUpdate('language', value)}
                  >
                    <SelectTrigger data-testid="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={() => toast.success('Profile updated!')} 
                className="flex items-center gap-2"
                data-testid="save-profile-button"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Browser Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {notificationPermission === 'granted' ? 'Enabled' : 
                             notificationPermission === 'denied' ? 'Blocked' : 'Not enabled'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {notificationPermission !== 'granted' && (
                    <Button 
                      onClick={handleEnableNotifications}
                      data-testid="enable-notifications-button"
                    >
                      Enable Notifications
                    </Button>
                  )}
                  {notificationPermission === 'granted' && (
                    <Button 
                      variant="outline"
                      onClick={handleTestNotification}
                      data-testid="test-notification-button"
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      Send Test
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trade Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about trade opportunities</p>
                  </div>
                  <Switch 
                    checked={user.preferences.notifications.tradeAlerts}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications.tradeAlerts', checked)}
                    data-testid="trade-alerts-switch"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Market Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive market news and updates</p>
                  </div>
                  <Switch 
                    checked={user.preferences.notifications.marketUpdates}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications.marketUpdates', checked)}
                    data-testid="market-updates-switch"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risk Warnings</Label>
                    <p className="text-sm text-muted-foreground">Get alerts about potential risks</p>
                  </div>
                  <Switch 
                    checked={user.preferences.notifications.riskWarnings}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications.riskWarnings', checked)}
                    data-testid="risk-warnings-switch"
                  />
                </div>
              </div>
              <Button 
                onClick={() => toast.success('Notification preferences saved!')} 
                className="w-full"
                data-testid="save-notifications-button"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select 
                  value={user.preferences.theme} 
                  onValueChange={(value) => {
                    handlePreferenceUpdate('theme', value);
                    // Apply theme immediately
                    applyTheme(value as any);
                    toast.success('Theme updated!');
                  }}
                >
                  <SelectTrigger data-testid="theme-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => toast.success('Settings saved!')} 
                data-testid="save-appearance-button"
                className="mt-4"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <ApiStatusCard />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your trading data, preferences, and settings as a JSON file.
                  </p>
                  <Button 
                    onClick={handleExportData} 
                    className="flex items-center gap-2"
                    data-testid="export-data-button"
                  >
                    <Download className="h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete all your data from this device. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                    className="flex items-center gap-2"
                    data-testid="clear-data-button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Qlarity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Qlarity is a comprehensive trading journal and risk management platform designed to help traders improve their performance through data-driven insights and AI-powered coaching.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version 1.0.0</Badge>
                  <Badge variant="outline">Local Storage</Badge>
                  <Badge variant="outline">Push Notifications</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time market data from multiple sources</li>
                  <li>• AI-powered trading insights and coaching</li>
                  <li>• Comprehensive trade journal and analytics</li>
                  <li>• Risk management tools and alerts</li>
                  <li>• Performance tracking and optimization</li>
                  <li>• Live trade monitoring and alerts</li>
                  <li>• Push notification system</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
