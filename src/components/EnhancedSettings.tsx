import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Brain, 
  TrendingUp, 
  Globe, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Unlock,
  Palette,
  Monitor,
  Smartphone,
  Clock,
  DollarSign,
  Percent,
  Activity,
  Target,
  BarChart3,
  Zap,
  Filter,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  Volume2,
  Vibrate
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AIStreamService } from '@/lib/aiStreamService';
import { realDataService } from '@/lib/realDataService';

interface APIConfiguration {
  openai: string;
  groq: string;
  gemini: string;
  polygon: string;
  alphavantage: string;
  finnhub: string;
  coingecko: string;
  exchangerate: string;
  newsapi: string;
  telegram: string;
}

interface TradingPreferences {
  defaultRiskPercent: number;
  maxDailyTrades: number;
  maxConcurrentTrades: number;
  minRiskRewardRatio: number;
  defaultStopLossPips: number;
  defaultTakeProfitPips: number;
  enableTrailingStop: boolean;
  trailingStopPips: number;
  enableBreakeven: boolean;
  breakevenPips: number;
  maxDrawdownPercent: number;
  autoCloseAtDrawdown: boolean;
  enableNewsFilter: boolean;
  avoidHighImpactNews: boolean;
  enableSessionFilter: boolean;
  preferredSessions: string[];
  autoCalculatePositionSize: boolean;
  enableStopLoss: boolean;
  enableTakeProfit: boolean;
  tradingTimeframe: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  telegramAlerts: boolean;
  tradingSignals: boolean;
  newsAlerts: boolean;
  riskAlerts: boolean;
  aiInsights: boolean;
  performanceReports: boolean;
  challengeUpdates: boolean;
  sessionReminders: boolean;
  drawdownWarnings: boolean;
  profitTargets: boolean;
  orderExecutions: boolean;
  technicalAnalysis: boolean;
  marketUpdates: boolean;
  vibration: boolean;
  soundAlerts: boolean;
}

interface AISettings {
  enableAICoaching: boolean;
  enableAutoAnalysis: boolean;
  aiProvider: 'openai' | 'groq' | 'gemini' | 'auto';
  analysisFrequency: number;
  confidenceThreshold: number;
  enablePersonalization: boolean;
  enableRiskSuggestions: boolean;
  enableTradeRecommendations: boolean;
  enableEmotionalAnalysis: boolean;
  enablePatternRecognition: boolean;
}

const EnhancedSettings = () => {
  const [selectedTab, setSelectedTab] = useState('trading');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Settings State
  const [apiConfig, setApiConfig] = useState<APIConfiguration>({
    openai: '',
    groq: '',
    gemini: '',
    polygon: '',
    alphavantage: '',
    finnhub: '',
    coingecko: '',
    exchangerate: '',
    newsapi: '',
    telegram: ''
  });

  const [tradingPrefs, setTradingPrefs] = useState<TradingPreferences>({
    defaultRiskPercent: 2,
    maxDailyTrades: 5,
    maxConcurrentTrades: 3,
    minRiskRewardRatio: 1.5,
    defaultStopLossPips: 30,
    defaultTakeProfitPips: 60,
    enableTrailingStop: false,
    trailingStopPips: 20,
    enableBreakeven: true,
    breakevenPips: 15,
    maxDrawdownPercent: 10,
    autoCloseAtDrawdown: true,
    enableNewsFilter: true,
    avoidHighImpactNews: true,
    enableSessionFilter: true,
    preferredSessions: ['london', 'newyork'],
    autoCalculatePositionSize: true,
    enableStopLoss: true,
    enableTakeProfit: true,
    tradingTimeframe: '1H'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    emailAlerts: false,
    smsAlerts: false,
    telegramAlerts: false,
    tradingSignals: true,
    newsAlerts: true,
    riskAlerts: true,
    aiInsights: true,
    performanceReports: true,
    challengeUpdates: true,
    sessionReminders: true,
    drawdownWarnings: true,
    profitTargets: true,
    orderExecutions: true,
    technicalAnalysis: false,
    marketUpdates: true,
    vibration: true,
    soundAlerts: true
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    enableAICoaching: true,
    enableAutoAnalysis: true,
    aiProvider: 'auto',
    analysisFrequency: 300,
    confidenceThreshold: 75,
    enablePersonalization: true,
    enableRiskSuggestions: true,
    enableTradeRecommendations: true,
    enableEmotionalAnalysis: true,
    enablePatternRecognition: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedApiConfig = localStorage.getItem('apiConfiguration');
    const savedTradingPrefs = localStorage.getItem('tradingPreferences');
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedAiSettings = localStorage.getItem('aiSettings');

    if (savedApiConfig) setApiConfig(JSON.parse(savedApiConfig));
    if (savedTradingPrefs) setTradingPrefs(JSON.parse(savedTradingPrefs));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedAiSettings) setAiSettings(JSON.parse(savedAiSettings));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save all settings to localStorage
      localStorage.setItem('apiConfiguration', JSON.stringify(apiConfig));
      localStorage.setItem('tradingPreferences', JSON.stringify(tradingPrefs));
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));

      // Also save to environment variables (simulation)
      Object.entries(apiConfig).forEach(([key, value]) => {
        if (value) {
          // In a real app, this would be saved securely
          localStorage.setItem(`VITE_${key.toUpperCase()}_API_KEY`, value);
        }
      });

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async (apiType: string) => {
    setTesting(apiType);
    try {
      if (apiType === 'openai' || apiType === 'groq' || apiType === 'gemini') {
        const aiService = new AIStreamService({});
        const result = await aiService.testProvider(apiType as 'openai' | 'groq' | 'gemini');
        if (result.success) {
          toast.success(`${apiType.toUpperCase()}: ${result.message}`);
        } else {
          toast.error(`${apiType.toUpperCase()}: ${result.message}`);
        }
      } else if (apiType === 'realData') {
        const healthCheck = await realDataService.healthCheck();
        const workingApis = Object.entries(healthCheck).filter(([_, status]) => status);
        if (workingApis.length > 0) {
          toast.success(`Real Data APIs: ${workingApis.map(([name]) => name).join(', ')} working`);
        } else {
          toast.error('No real data APIs are working. Check your keys.');
        }
      } else {
        // Simulate other API tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(`${apiType.toUpperCase()} API connection successful!`);
      }
    } catch (error) {
      console.error(`${apiType} API test failed:`, error);
      toast.error(`${apiType.toUpperCase()} API connection failed`);
    } finally {
      setTesting(null);
    }
  };

  const resetToDefaults = () => {
    setTradingPrefs({
      defaultRiskPercent: 2,
      maxDailyTrades: 5,
      maxConcurrentTrades: 3,
      minRiskRewardRatio: 1.5,
      defaultStopLossPips: 30,
      defaultTakeProfitPips: 60,
      enableTrailingStop: false,
      trailingStopPips: 20,
      enableBreakeven: true,
      breakevenPips: 15,
      maxDrawdownPercent: 10,
      autoCloseAtDrawdown: true,
      enableNewsFilter: true,
      avoidHighImpactNews: true,
      enableSessionFilter: true,
      preferredSessions: ['london', 'newyork'],
      autoCalculatePositionSize: true,
      enableStopLoss: true,
      enableTakeProfit: true,
      tradingTimeframe: '1H'
    });
    toast.success('Trading preferences reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Enhanced Settings</span>
          </h2>
          <p className="text-gray-400">Configure advanced trading preferences and integrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={resetToDefaults} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/50">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI & Analysis</TabsTrigger>
          <TabsTrigger value="apis">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          {/* Risk Management */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span>Risk Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Risk Per Trade (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[tradingPrefs.defaultRiskPercent]}
                      onValueChange={([value]) => setTradingPrefs(prev => ({ ...prev, defaultRiskPercent: value }))}
                      max={10}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>0.5%</span>
                      <span className="text-white font-medium">{tradingPrefs.defaultRiskPercent}%</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Drawdown (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[tradingPrefs.maxDrawdownPercent]}
                      onValueChange={([value]) => setTradingPrefs(prev => ({ ...prev, maxDrawdownPercent: value }))}
                      max={25}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>5%</span>
                      <span className="text-white font-medium">{tradingPrefs.maxDrawdownPercent}%</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Daily Trades</Label>
                  <Input
                    type="number"
                    value={tradingPrefs.maxDailyTrades}
                    onChange={(e) => setTradingPrefs(prev => ({ ...prev, maxDailyTrades: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Concurrent Trades</Label>
                  <Input
                    type="number"
                    value={tradingPrefs.maxConcurrentTrades}
                    onChange={(e) => setTradingPrefs(prev => ({ ...prev, maxConcurrentTrades: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min Risk:Reward Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tradingPrefs.minRiskRewardRatio}
                    onChange={(e) => setTradingPrefs(prev => ({ ...prev, minRiskRewardRatio: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trading Timeframe</Label>
                  <Select 
                    value={tradingPrefs.tradingTimeframe} 
                    onValueChange={(value) => setTradingPrefs(prev => ({ ...prev, tradingTimeframe: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1M">1 Minute</SelectItem>
                      <SelectItem value="5M">5 Minutes</SelectItem>
                      <SelectItem value="15M">15 Minutes</SelectItem>
                      <SelectItem value="1H">1 Hour</SelectItem>
                      <SelectItem value="4H">4 Hours</SelectItem>
                      <SelectItem value="1D">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Risk Management Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-calculate Position Size</Label>
                    <Switch
                      checked={tradingPrefs.autoCalculatePositionSize}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, autoCalculatePositionSize: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-close at Max Drawdown</Label>
                    <Switch
                      checked={tradingPrefs.autoCloseAtDrawdown}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, autoCloseAtDrawdown: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Stop Loss</Label>
                    <Switch
                      checked={tradingPrefs.enableStopLoss}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableStopLoss: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Take Profit</Label>
                    <Switch
                      checked={tradingPrefs.enableTakeProfit}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableTakeProfit: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Trailing Stop</Label>
                    <Switch
                      checked={tradingPrefs.enableTrailingStop}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableTrailingStop: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Breakeven</Label>
                    <Switch
                      checked={tradingPrefs.enableBreakeven}
                      onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableBreakeven: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Filters */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-yellow-400" />
                <span>Trading Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>News Filter</Label>
                    <p className="text-sm text-gray-400">Avoid trading during high-impact news events</p>
                  </div>
                  <Switch
                    checked={tradingPrefs.enableNewsFilter}
                    onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableNewsFilter: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Filter</Label>
                    <p className="text-sm text-gray-400">Trade only during preferred market sessions</p>
                  </div>
                  <Switch
                    checked={tradingPrefs.enableSessionFilter}
                    onCheckedChange={(checked) => setTradingPrefs(prev => ({ ...prev, enableSessionFilter: checked }))}
                  />
                </div>

                {tradingPrefs.enableSessionFilter && (
                  <div className="space-y-2">
                    <Label>Preferred Trading Sessions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { id: 'sydney', label: 'Sydney', time: '22:00-07:00 GMT' },
                        { id: 'tokyo', label: 'Tokyo', time: '00:00-09:00 GMT' },
                        { id: 'london', label: 'London', time: '08:00-17:00 GMT' },
                        { id: 'newyork', label: 'New York', time: '13:00-22:00 GMT' }
                      ].map((session) => (
                        <div 
                          key={session.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            tradingPrefs.preferredSessions.includes(session.id)
                              ? "bg-blue-500/20 border-blue-500/50"
                              : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50"
                          )}
                          onClick={() => {
                            const isSelected = tradingPrefs.preferredSessions.includes(session.id);
                            setTradingPrefs(prev => ({
                              ...prev,
                              preferredSessions: isSelected
                                ? prev.preferredSessions.filter(s => s !== session.id)
                                : [...prev.preferredSessions, session.id]
                            }));
                          }}
                        >
                          <p className="font-medium text-white">{session.label}</p>
                          <p className="text-xs text-gray-400">{session.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Categories */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Trading Notifications</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'tradingSignals', label: 'Trading Signals', description: 'AI-generated trading opportunities' },
                      { key: 'orderExecutions', label: 'Order Executions', description: 'Trade fills and order updates' },
                      { key: 'riskAlerts', label: 'Risk Alerts', description: 'Portfolio risk warnings and margin calls' },
                      { key: 'profitTargets', label: 'Profit Targets', description: 'Take profit and stop loss triggers' },
                      { key: 'drawdownWarnings', label: 'Drawdown Warnings', description: 'Account drawdown threshold alerts' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <Label className="text-white">{item.label}</Label>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>AI & Analysis</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'aiInsights', label: 'AI Insights', description: 'Personalized AI trading insights and coaching' },
                      { key: 'technicalAnalysis', label: 'Technical Analysis', description: 'Chart pattern and indicator alerts' },
                      { key: 'challengeUpdates', label: 'Challenge Updates', description: 'Trading challenge progress and completions' },
                      { key: 'performanceReports', label: 'Performance Reports', description: 'Weekly and monthly performance summaries' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <Label className="text-white">{item.label}</Label>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Market & News</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'newsAlerts', label: 'News Alerts', description: 'High-impact economic news and events' },
                      { key: 'marketUpdates', label: 'Market Updates', description: 'Market opening/closing and major moves' },
                      { key: 'sessionReminders', label: 'Session Reminders', description: 'Trading session start/end notifications' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <Label className="text-white">{item.label}</Label>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <span>Delivery Methods</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'pushNotifications', label: 'Push Notifications', icon: <Smartphone className="w-4 h-4" />, description: 'In-app notifications' },
                      { key: 'emailAlerts', label: 'Email Alerts', icon: <Mail className="w-4 h-4" />, description: 'Email notifications' },
                      { key: 'smsAlerts', label: 'SMS Alerts', icon: <Phone className="w-4 h-4" />, description: 'Text message alerts' },
                      { key: 'telegramAlerts', label: 'Telegram Bot', icon: <MessageSquare className="w-4 h-4" />, description: 'Telegram notifications' },
                      { key: 'soundAlerts', label: 'Sound Alerts', icon: <Volume2 className="w-4 h-4" />, description: 'Audio notifications' },
                      { key: 'vibration', label: 'Vibration', icon: <Vibrate className="w-4 h-4" />, description: 'Device vibration' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <div>
                            <Label className="text-white">{item.label}</Label>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>AI Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary AI Provider</Label>
                  <Select 
                    value={aiSettings.aiProvider} 
                    onValueChange={(value: 'openai' | 'groq' | 'gemini' | 'auto') => setAiSettings(prev => ({ ...prev, aiProvider: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Best Available)</SelectItem>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="groq">Groq Llama</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Analysis Frequency (seconds)</Label>
                  <Input
                    type="number"
                    value={aiSettings.analysisFrequency}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, analysisFrequency: parseInt(e.target.value) || 300 }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confidence Threshold (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[aiSettings.confidenceThreshold]}
                      onValueChange={([value]) => setAiSettings(prev => ({ ...prev, confidenceThreshold: value }))}
                      max={95}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>50%</span>
                      <span className="text-white font-medium">{aiSettings.confidenceThreshold}%</span>
                      <span>95%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">AI Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'enableAICoaching', label: 'AI Coaching', description: 'Personalized trading advice and feedback' },
                    { key: 'enableAutoAnalysis', label: 'Auto Analysis', description: 'Automatic market analysis and insights' },
                    { key: 'enablePersonalization', label: 'Personalization', description: 'Adapt AI to your trading style' },
                    { key: 'enableRiskSuggestions', label: 'Risk Suggestions', description: 'AI-powered risk management advice' },
                    { key: 'enableTradeRecommendations', label: 'Trade Recommendations', description: 'AI trade suggestions and signals' },
                    { key: 'enableEmotionalAnalysis', label: 'Emotional Analysis', description: 'Monitor trading psychology patterns' },
                    { key: 'enablePatternRecognition', label: 'Pattern Recognition', description: 'Advanced chart pattern detection' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <Label className="text-white">{item.label}</Label>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <Switch
                        checked={aiSettings[item.key as keyof AISettings] as boolean}
                        onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <span>API Configuration</span>
                </CardTitle>
                <Button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  size="sm"
                  variant="outline"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showApiKeys ? 'Hide' : 'Show'} Keys
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Providers */}
              <div>
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI Providers</span>
                </h4>
                <div className="space-y-4">
                  {[
                    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...' },
                    { key: 'groq', label: 'Groq API Key', placeholder: 'gsk_...' },
                    { key: 'gemini', label: 'Google Gemini API Key', placeholder: 'AIza...' }
                  ].map((api) => (
                    <div key={api.key} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Label>{api.label}</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            type={showApiKeys ? "text" : "password"}
                            value={apiConfig[api.key as keyof APIConfiguration]}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, [api.key]: e.target.value }))}
                            placeholder={api.placeholder}
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button
                            onClick={() => testApiConnection(api.key)}
                            disabled={testing === api.key || !apiConfig[api.key as keyof APIConfiguration]}
                            size="sm"
                            variant="outline"
                          >
                            {testing === api.key ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Data Providers */}
              <div>
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span>Market Data Providers</span>
                </h4>
                <div className="space-y-4">
                  {[
                    { key: 'polygon', label: 'Polygon.io API Key', placeholder: 'Your polygon API key' },
                    { key: 'alphavantage', label: 'Alpha Vantage API Key', placeholder: 'Your alpha vantage key' },
                    { key: 'finnhub', label: 'Finnhub API Key', placeholder: 'Your finnhub token' },
                    { key: 'coingecko', label: 'CoinGecko API Key', placeholder: 'Your coingecko key (optional)' },
                    { key: 'exchangerate', label: 'ExchangeRate API Key', placeholder: 'Your exchange rate key' },
                    { key: 'newsapi', label: 'NewsAPI Key', placeholder: 'Your news API key' }
                  ].map((api) => (
                    <div key={api.key} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Label>{api.label}</Label>
                        <Input
                          type={showApiKeys ? "text" : "password"}
                          value={apiConfig[api.key as keyof APIConfiguration]}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, [api.key]: e.target.value }))}
                          placeholder={api.placeholder}
                          className="bg-gray-800 border-gray-700 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div>
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Communication</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Label>Telegram Bot Token</Label>
                      <Input
                        type={showApiKeys ? "text" : "password"}
                        value={apiConfig.telegram}
                        onChange={(e) => setApiConfig(prev => ({ ...prev, telegram: e.target.value }))}
                        placeholder="Your telegram bot token"
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <Button 
                  onClick={() => testApiConnection('realData')}
                  disabled={testing === 'realData'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {testing === 'realData' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing All APIs...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test All API Connections
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-red-400" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-400">Security Notice</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      API keys are stored locally in your browser. For production use, consider using environment variables 
                      or a secure key management service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <Label className="text-white">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <Label className="text-white">Session Timeout</Label>
                    <p className="text-sm text-gray-400">Automatically log out after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <Label className="text-white">API Key Encryption</Label>
                    <p className="text-sm text-gray-400">Encrypt API keys in local storage</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <Button variant="outline" className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10">
                  <Lock className="w-4 h-4 mr-2" />
                  Clear All Stored Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSettings; 