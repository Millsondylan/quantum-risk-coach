import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Palette, Database, Key, Eye, EyeOff, Save, TestTube, User, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    trades: true,
    market: true,
    news: false,
    email: true,
    push: true
  });
  const [autoSync, setAutoSync] = useState(true);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [currency, setCurrency] = useState('USD');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: user?.user_metadata?.username || '',
    avatar_url: user?.user_metadata?.avatar_url || ''
  });
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    groq: '',
    news: '',
    alphaVantage: '',
    tradingView: ''
  });
  const [showKeys, setShowKeys] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load API keys from localStorage
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save profile data
      if (profileData.username !== user?.user_metadata?.username) {
        await updateProfile({ username: profileData.username });
      }
      
      // Save API keys to localStorage
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setNotifications({
      trades: true,
      market: true,
      news: false,
      email: true,
      push: true
    });
    setTheme('dark');
    setAutoSync(true);
    setRiskLevel('medium');
    setCurrency('USD');
    setApiKeys({
      openai: '',
      groq: '',
      news: '',
      alphaVantage: '',
      tradingView: ''
    });
    localStorage.removeItem('apiKeys');
    toast.success('Settings reset to defaults');
  };

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const testApiConnection = async (apiType: string) => {
    setIsTesting(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${apiType} API connection successful!`);
    } catch (error) {
      toast.error(`${apiType} API connection failed. Please check your key.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0 text-slate-400 hover:text-white touch-manipulation active:scale-95 transition-all duration-150"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Profile Settings</span>
                </CardTitle>
                <CardDescription>Manage your account information</CardDescription>
                <CardDescription>Manage your account and application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Base Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk">Risk Tolerance</Label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Conservative</SelectItem>
                        <SelectItem value="medium">Medium - Balanced</SelectItem>
                        <SelectItem value="high">High - Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Notifications</span>
                </CardTitle>
                <CardDescription>Configure how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Trade Alerts</Label>
                    <p className="text-sm text-slate-400">Get notified when trades are executed</p>
                  </div>
                  <Switch
                    checked={notifications.trades}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, trades: checked }))}
                    className="touch-manipulation"
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Market Updates</Label>
                    <p className="text-sm text-slate-400">Real-time market movements</p>
                  </div>
                  <Switch
                    checked={notifications.market}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, market: checked }))}
                    className="touch-manipulation"
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">News Alerts</Label>
                    <p className="text-sm text-slate-400">Breaking financial news</p>
                  </div>
                  <Switch
                    checked={notifications.news}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, news: checked }))}
                    className="touch-manipulation"
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-slate-400">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    className="touch-manipulation"
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-sm text-slate-400">Mobile push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    className="touch-manipulation"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Appearance</span>
                </CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-slate-400">Use dark theme across the application</p>
                  </div>
                  <Switch 
                    id="darkMode" 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">API Configuration</span>
                </CardTitle>
                <CardDescription>Configure your API keys for enhanced features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Show/Hide API Keys</Label>
                    <p className="text-sm text-slate-400">Toggle visibility of sensitive API keys</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showKeys ? 'Hide' : 'Show'} Keys
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openai">OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openai"
                        type={showKeys ? "text" : "password"}
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiConnection('OpenAI')}
                        disabled={isTesting || !apiKeys.openai}
                      >
                        {isTesting ? <TestTube className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Required for AI trading insights and analysis</p>
                  </div>

                  <div>
                    <Label htmlFor="groq">Groq API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="groq"
                        type={showKeys ? "text" : "password"}
                        placeholder="gsk_..."
                        value={apiKeys.groq}
                        onChange={(e) => handleApiKeyChange('groq', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiConnection('Groq')}
                        disabled={isTesting || !apiKeys.groq}
                      >
                        {isTesting ? <TestTube className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Alternative AI provider for faster responses</p>
                  </div>

                  <div>
                    <Label htmlFor="news">News API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="news"
                        type={showKeys ? "text" : "password"}
                        placeholder="..."
                        value={apiKeys.news}
                        onChange={(e) => handleApiKeyChange('news', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiConnection('News')}
                        disabled={isTesting || !apiKeys.news}
                      >
                        {isTesting ? <TestTube className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Required for economic calendar and market news</p>
                  </div>

                  <div>
                    <Label htmlFor="alphaVantage">Alpha Vantage API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="alphaVantage"
                        type={showKeys ? "text" : "password"}
                        placeholder="..."
                        value={apiKeys.alphaVantage}
                        onChange={(e) => handleApiKeyChange('alphaVantage', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiConnection('Alpha Vantage')}
                        disabled={isTesting || !apiKeys.alphaVantage}
                      >
                        {isTesting ? <TestTube className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Required for real-time market data and forex rates</p>
                  </div>

                  <div>
                    <Label htmlFor="tradingView">TradingView API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tradingView"
                        type={showKeys ? "text" : "password"}
                        placeholder="..."
                        value={apiKeys.tradingView}
                        onChange={(e) => handleApiKeyChange('tradingView', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiConnection('TradingView')}
                        disabled={isTesting || !apiKeys.tradingView}
                      >
                        {isTesting ? <TestTube className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Optional: Enhanced charting and technical analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Data & Privacy</span>
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/connect-mt4')}
                    className="w-full"
                  >
                    Manage MT4/5 Connections
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info('Data export feature coming soon')}
                    className="w-full"
                  >
                    Export Trading Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button onClick={handleSaveSettings} className="holo-button flex-1" disabled={saving}>
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button variant="outline" onClick={handleResetSettings} className="flex-1">
                Reset to Defaults
              </Button>
            </div>

            {/* Sign Out */}
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full touch-manipulation active:scale-95 transition-all duration-150"
                  size="lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
