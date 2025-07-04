import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Settings,
  Bell,
  Globe,
  MessageSquare,
  Database,
  Lock,
  Unlock,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  X,
  Eye,
  EyeOff,
  Wifi,
  BarChart3,
  BookOpen,
  Target
} from 'lucide-react';
import type { UserPreferences } from '@/types/user';

interface OnboardingData {
  // User Profile
  name: string;
  email: string;
  tradingExperience: string;
  preferredMarkets: string[];
  riskTolerance: number;
  tradingGoals: string[];
  timeHorizon: string;
  accountSize: string;
  tradingStyle: string;
  motivation: string;
  
  // Broker Integration
  brokerConnections: BrokerConnection[];
  
  // Preferences
  notifications: {
    tradeAlerts: boolean;
    marketUpdates: boolean;
    riskWarnings: boolean;
    performanceReports: boolean;
    newsAlerts: boolean;
  };
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
}

interface BrokerConnection {
  id: string;
  name: string;
  type: 'mt4' | 'mt5' | 'binance' | 'bybit' | 'ctrader' | 'kucoin' | 'okx' | 'mexc';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  credentials: {
    apiKey?: string;
    secretKey?: string;
    passphrase?: string;
    server?: string;
    login?: string;
    password?: string;
  };
  settings: {
    autoSync: boolean;
    syncInterval: number;
    syncHistoricalData: boolean;
    historicalDataDays: number;
  };
}

const UltraTraderOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    name: user?.name || '',
    email: '',
    tradingExperience: '',
    preferredMarkets: [],
    riskTolerance: 5,
    tradingGoals: [],
    timeHorizon: '',
    accountSize: '',
    tradingStyle: '',
    motivation: '',
    brokerConnections: [],
    notifications: {
      tradeAlerts: true,
      marketUpdates: true,
      riskWarnings: true,
      performanceReports: true,
      newsAlerts: false,
    },
    theme: 'dark',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Supported brokers with logos and features
  const supportedBrokers = [
    { id: 'mt4', name: 'MetaTrader 4', requiresPassphrase: false },
    { id: 'mt5', name: 'MetaTrader 5', requiresPassphrase: false }
  ];

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to UltraTrader',
      description: 'Your journey to professional trading starts here',
      component: WelcomeStep
    },
    {
      id: 'profile',
      title: 'Your Trading Profile',
      description: 'Let\'s understand your trading background',
      component: ProfileStep
    },
    {
      id: 'preferences',
      title: 'Trading Preferences',
      description: 'Customize your trading experience',
      component: PreferencesStep
    },
    {
      id: 'broker-setup',
      title: 'Connect Your Brokers',
      description: 'Link your trading accounts for seamless sync',
      component: BrokerSetupStep
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      description: 'Stay informed with smart alerts',
      component: NotificationsStep
    },
    {
      id: 'completion',
      title: 'Setup Complete!',
      description: 'You\'re ready to start trading',
      component: CompletionStep
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const userPreferences: UserPreferences = {
        tradingStyle: data.tradingStyle as 'scalping' | 'day-trading' | 'swing-trading' | 'position-trading',
        riskTolerance: data.riskTolerance <= 3 ? 'conservative' : data.riskTolerance <= 7 ? 'moderate' : 'aggressive',
        preferredMarkets: data.preferredMarkets,
        experienceLevel: data.tradingExperience as 'beginner' | 'intermediate' | 'advanced',
        notifications: {
          priceAlerts: data.notifications.tradeAlerts,
          newsAlerts: data.notifications.newsAlerts,
          aiInsights: true,
          tradeSignals: true,
          economicEvents: true,
          portfolioAlerts: data.notifications.performanceReports,
          riskWarnings: data.notifications.riskWarnings,
          pushNotifications: true,
          telegram: false,
          soundEnabled: true,
          marketUpdates: data.notifications.marketUpdates,
          tradeAlerts: data.notifications.tradeAlerts,
          marketSentiment: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          },
          weekends: true,
          minimumImpact: 'medium',
          frequency: 'instant',
          personalizedSymbols: [],
          tradingStyle: data.tradingStyle,
          riskTolerance: data.riskTolerance <= 3 ? 'conservative' : data.riskTolerance <= 7 ? 'moderate' : 'aggressive',
          experience: data.tradingExperience,
          email: true,
          push: true
        },
        theme: data.theme,
        language: data.language,
        currency: 'USD'
      };
      
      await completeOnboarding(userPreferences);
      toast.success('UltraTrader setup completed successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to complete setup. Please try again.');
    }
  };

  // Welcome Step Component
  function WelcomeStep() {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to UltraTrader
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            The most advanced trading platform with AI-powered insights, real-time sync, 
            and professional-grade analytics. Let's get you set up in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-slate-300 text-sm">
                Bank-level encryption protects your data and trading credentials
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Sync</h3>
              <p className="text-slate-300 text-sm">
                Automatic trade synchronization with MT4, MT5, and major exchanges
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/10 to-green-800/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
              <p className="text-slate-300 text-sm">
                Advanced analytics and personalized coaching recommendations
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleNext}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Profile Step Component
  function ProfileStep() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-white font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <Label className="text-white font-medium">Trading Experience</Label>
          <Select value={data.tradingExperience} onValueChange={(value) => setData({ ...data, tradingExperience: value })}>
            <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
              <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
              <SelectItem value="expert">Expert (5+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white font-medium">Preferred Markets</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {['Forex', 'Crypto', 'Stocks', 'Commodities', 'Indices', 'Options'].map((market) => (
              <Button
                key={market}
                variant={data.preferredMarkets.includes(market) ? "default" : "outline"}
                onClick={() => {
                  const updated = data.preferredMarkets.includes(market)
                    ? data.preferredMarkets.filter(m => m !== market)
                    : [...data.preferredMarkets, market];
                  setData({ ...data, preferredMarkets: updated });
                }}
                className="justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                {market}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white font-medium">Risk Tolerance</Label>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-600 text-white">
                Level {data.riskTolerance}/10
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preferences Step Component
  function PreferencesStep() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-white font-medium">Trading Style</Label>
          <Select value={data.tradingStyle} onValueChange={(value) => setData({ ...data, tradingStyle: value })}>
            <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select your trading style" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="scalping">Scalping (seconds to minutes)</SelectItem>
              <SelectItem value="day">Day Trading (hours to 1 day)</SelectItem>
              <SelectItem value="swing">Swing Trading (days to weeks)</SelectItem>
              <SelectItem value="position">Position Trading (weeks to months)</SelectItem>
              <SelectItem value="long">Long-term (months to years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white font-medium">Account Size</Label>
          <Select value={data.accountSize} onValueChange={(value) => setData({ ...data, accountSize: value })}>
            <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select your account size" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="micro">Micro ($100 - $1,000)</SelectItem>
              <SelectItem value="small">Small ($1,000 - $10,000)</SelectItem>
              <SelectItem value="medium">Medium ($10,000 - $100,000)</SelectItem>
              <SelectItem value="large">Large ($100,000 - $1,000,000)</SelectItem>
              <SelectItem value="institutional">Institutional ($1M+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white font-medium">Trading Goals</Label>
          <div className="grid grid-cols-1 gap-3 mt-3">
            {[
              'Generate consistent income',
              'Build long-term wealth',
              'Learn and improve skills',
              'Beat market returns',
              'Preserve capital',
              'Achieve financial freedom'
            ].map((goal) => (
              <Button
                key={goal}
                variant={data.tradingGoals.includes(goal) ? "default" : "outline"}
                onClick={() => {
                  const updated = data.tradingGoals.includes(goal)
                    ? data.tradingGoals.filter(g => g !== goal)
                    : [...data.tradingGoals, goal];
                  setData({ ...data, tradingGoals: updated });
                }}
                className="justify-start h-auto p-4 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                {goal}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Broker Setup Step Component
  function BrokerSetupStep() {
    const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
    const [connectionForm, setConnectionForm] = useState({
      name: '',
      apiKey: '',
      secretKey: '',
      passphrase: '',
      server: '',
      login: '',
      password: '',
      autoSync: true,
      syncInterval: 30,
      syncHistoricalData: true,
      historicalDataDays: 30
    });

    const handleConnectBroker = async () => {
      if (!selectedBroker) return;

      setIsConnecting(true);
      try {
        const broker = supportedBrokers.find(b => b.id === selectedBroker);
        if (!broker) throw new Error('Broker not found');

        const connection: BrokerConnection = {
          id: `${selectedBroker}_${Date.now()}`,
          name: connectionForm.name || broker.name,
          type: selectedBroker as any,
          status: 'connected',
          credentials: {
            apiKey: connectionForm.apiKey,
            secretKey: connectionForm.secretKey,
            passphrase: connectionForm.passphrase,
            server: connectionForm.server,
            login: connectionForm.login,
            password: connectionForm.password,
          },
          settings: {
            autoSync: connectionForm.autoSync,
            syncInterval: connectionForm.syncInterval,
            syncHistoricalData: connectionForm.syncHistoricalData,
            historicalDataDays: connectionForm.historicalDataDays,
          }
        };

        // Simulate connection (replace with real broker service)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setData({
          ...data,
          brokerConnections: [...data.brokerConnections, connection]
        });

        toast.success(`Successfully connected to ${broker.name}!`);
        setSelectedBroker(null);
        setConnectionForm({
          name: '',
          apiKey: '',
          secretKey: '',
          passphrase: '',
          server: '',
          login: '',
          password: '',
          autoSync: true,
          syncInterval: 30,
          syncHistoricalData: true,
          historicalDataDays: 30
        });
      } catch (error) {
        toast.error('Failed to connect broker. Please check your credentials.');
      } finally {
        setIsConnecting(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Trading Accounts</h3>
          <p className="text-slate-300">
            Link your brokers for automatic trade synchronization and real-time data
          </p>
        </div>

        {/* Supported Brokers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedBrokers.map((broker) => (
            <Card
              key={broker.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                selectedBroker === broker.id 
                  ? "bg-blue-600/20 border-blue-500/50" 
                  : "bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
              )}
              onClick={() => setSelectedBroker(broker.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{broker.name}</div>
                  {selectedBroker === broker.id && (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection Form */}
        {selectedBroker && (
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">
                Connect to {supportedBrokers.find(b => b.id === selectedBroker)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white font-medium">Connection Name</Label>
                <Input
                  value={connectionForm.name}
                  onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="My MT4 Account"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium">Server</Label>
                  <Input
                    value={connectionForm.server}
                    onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., ICMarkets-Live01"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">Login</Label>
                    <Input
                      value={connectionForm.login}
                      onChange={(e) => setConnectionForm({ ...connectionForm, login: e.target.value })}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={connectionForm.password}
                        onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                        className="mt-2 bg-slate-700 border-slate-600 text-white pr-10"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Auto Sync</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={connectionForm.autoSync}
                      onCheckedChange={(checked) => setConnectionForm({ ...connectionForm, autoSync: checked })}
                    />
                    <span className="text-sm text-slate-300">Enable automatic synchronization</span>
                  </div>
                </div>
                <div>
                  <Label className="text-white font-medium">Sync Interval (minutes)</Label>
                  <Select 
                    value={connectionForm.syncInterval.toString()} 
                    onValueChange={(value) => setConnectionForm({ ...connectionForm, syncInterval: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBroker(null)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnectBroker}
                  disabled={isConnecting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Brokers */}
        {data.brokerConnections.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connected Accounts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.brokerConnections.map((connection) => (
                <Card key={connection.id} className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-white">{connection.name}</h5>
                        <p className="text-sm text-slate-300">
                          {supportedBrokers.find(b => b.id === connection.type)?.name}
                        </p>
                      </div>
                      <Badge 
                        variant={connection.status === 'connected' ? 'default' : 'secondary'}
                        className={cn(
                          connection.status === 'connected' ? 'bg-green-600' : 'bg-red-600'
                        )}
                      >
                        {connection.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Notifications Step Component
  function NotificationsStep() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Stay Informed</h3>
          <p className="text-slate-300">
            Choose what notifications you'd like to receive
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(data.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-slate-300">
                  {key === 'tradeAlerts' && 'Get notified when trades are executed'}
                  {key === 'marketUpdates' && 'Receive market news and updates'}
                  {key === 'riskWarnings' && 'Alerts for high-risk situations'}
                  {key === 'performanceReports' && 'Weekly and monthly performance summaries'}
                  {key === 'newsAlerts' && 'Breaking news and market events'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  setData({
                    ...data,
                    notifications: { ...data.notifications, [key]: checked }
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white font-medium">Theme</Label>
            <Select value={data.theme} onValueChange={(value) => setData({ ...data, theme: value as any })}>
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white font-medium">Language</Label>
            <Select value={data.language} onValueChange={(value) => setData({ ...data, language: value })}>
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // Completion Step Component
  function CompletionStep() {
    return (
      <div className="space-y-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to UltraTrader! 🚀
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Your setup is complete. You now have access to professional-grade trading tools, 
            AI-powered insights, and seamless broker integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-slate-300">
                View your performance metrics and trading insights
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Trading Journal</h3>
              <p className="text-sm text-slate-300">
                Log and analyze your trades with AI assistance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Trade Builder</h3>
              <p className="text-sm text-slate-300">
                Plan and execute trades with risk management
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleComplete}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            Start Trading
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-slate-400">
            You can always adjust your settings later in the preferences menu
          </p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center border-b border-white/10">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-400 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription className="text-white/70">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <CurrentStepComponent />
          
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="flex justify-between pt-8 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraTraderOnboarding; 