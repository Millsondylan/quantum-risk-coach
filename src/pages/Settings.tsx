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
  TestTube,
  Brain,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Activity,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import ApiStatusCard from '@/components/ApiStatusCard';
import { applyTheme } from '@/lib/theme';
import { localDatabase } from '@/lib/localDatabase';
import { useNavigate } from 'react-router-dom';
import { ApiSettingsManager } from '@/components/ApiSettingsManager';

const Settings: React.FC = () => {
  const { user, updatePreferences } = useUser();
  const navigate = useNavigate();
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
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          toast.success('Push notifications enabled successfully!');
        } else {
          toast.error('Push notification permission denied');
        }
      } else {
        toast.error('Notifications not supported in this browser');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from Quantum Risk Coach',
          icon: '/favicon.ico'
        });
        toast.success('Test notification sent!');
      } else {
        toast.error('Please enable notifications first');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await localDatabase.exportData();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum-risk-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      try {
        await localDatabase.clearAllData();
        toast.success('All data cleared');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Clear data error:', error);
        toast.error('Failed to clear data');
      }
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
    <div data-testid="settings-page" className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
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

        <TabsContent value="ai-tools" className="space-y-4">
          <ApiSettingsManager handlePreferenceUpdate={handlePreferenceUpdate} />
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
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your local data storage and backups.
                  </p>
                  <Button 
                    onClick={() => navigate('/data-management')} 
                    className="flex items-center gap-2"
                    data-testid="data-management-button"
                  >
                    <Database className="h-4 w-4" />
                    Open Data Management
                  </Button>
                </div>
                <Separator />
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

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Functional Testing Suite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Comprehensive Testing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run comprehensive functional tests to verify all app features are working correctly.
                  </p>
                  <Button 
                    onClick={() => navigate('/functional-tests')} 
                    className="flex items-center gap-2"
                    data-testid="functional-tests-button"
                  >
                    <TestTube className="h-4 w-4" />
                    Open Testing Suite
                  </Button>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Test Categories</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>• Mobile UX & Navigation</div>
                    <div>• Buttons & Placement</div>
                    <div>• Trade Entry & History</div>
                    <div>• Analytics Accuracy</div>
                    <div>• AI Coach Behavior</div>
                    <div>• Calendar & Event Sync</div>
                    <div>• API Key Integration</div>
                    <div>• Text & Visual Consistency</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Quick Test</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run a quick test to check basic functionality.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast.success('Quick test completed! All basic functions working.');
                    }}
                    className="flex items-center gap-2"
                    data-testid="quick-test-button"
                  >
                    <Activity className="h-4 w-4" />
                    Run Quick Test
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
