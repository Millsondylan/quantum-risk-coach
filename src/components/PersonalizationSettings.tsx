import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  Settings, 
  Bell,
  Target,
  TrendingUp,
  Brain,
  Clock,
  Shield,
  Zap,
  Heart,
  Globe,
  Palette,
  Volume2,
  Smartphone,
  Calendar,
  BarChart3,
  Trophy,
  BookOpen,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { pushNotificationService, NotificationPreferences, PersonalizationProfile } from '@/lib/pushNotificationService';

const PersonalizationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(pushNotificationService.getPreferences());
  const [profile, setProfile] = useState<PersonalizationProfile | null>(pushNotificationService.getPersonalization());
  const [isLoading, setIsLoading] = useState(false);
  
  // User profile settings
  const [userProfile, setUserProfile] = useState({
    displayName: user?.user_metadata?.display_name || '',
    tradingExperience: 'intermediate',
    riskTolerance: 'moderate',
    tradingStyle: 'day',
    primaryGoal: 'profit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredCurrency: 'USD',
    language: 'en'
  });

  // Personalization settings
  const [personalSettings, setPersonalSettings] = useState({
    dashboardLayout: 'compact',
    chartTheme: 'dark',
    soundEffects: true,
    animations: true,
    autoRefresh: true,
    refreshInterval: 30,
    aiPersonality: 'balanced',
    learningMode: true,
    showTips: true,
    confidenceThreshold: 70
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      // Load from localStorage
      const storedProfile = localStorage.getItem('userPersonalization');
      const storedSettings = localStorage.getItem('personalSettings');
      
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      
      if (storedSettings) {
        setPersonalSettings(JSON.parse(storedSettings));
      }

      // Initialize personalization profile if needed
      if (!profile && user) {
        const newProfile = await pushNotificationService.createPersonalizationProfile(user.id);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading personalization settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Save user profile
      localStorage.setItem('userPersonalization', JSON.stringify(userProfile));
      localStorage.setItem('personalSettings', JSON.stringify(personalSettings));
      
      // Update notification preferences
      await pushNotificationService.updatePreferences(preferences);
      
      // Update personalization profile
      if (profile) {
        await pushNotificationService.updatePersonalizationProfile({
          ...profile,
          preferences: preferences
        });
      }

      toast.success('Personalization settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setUserProfile({
      displayName: user?.user_metadata?.display_name || '',
      tradingExperience: 'intermediate',
      riskTolerance: 'moderate',
      tradingStyle: 'day',
      primaryGoal: 'profit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredCurrency: 'USD',
      language: 'en'
    });

    setPersonalSettings({
      dashboardLayout: 'compact',
      chartTheme: 'dark',
      soundEffects: true,
      animations: true,
      autoRefresh: true,
      refreshInterval: 30,
      aiPersonality: 'balanced',
      learningMode: true,
      showTips: true,
      confidenceThreshold: 70
    });

    toast.success('Settings reset to defaults');
  };

  const testPersonalization = async () => {
    // Send a test notification with personalization
    await pushNotificationService.sendTestNotification();
    
    // Show personalized message based on settings
    const personalizedMessage = `Welcome ${userProfile.displayName || 'Trader'}! Your ${userProfile.tradingStyle} trading setup is optimized for ${userProfile.riskTolerance} risk tolerance.`;
    toast.success(personalizedMessage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Personal Settings</h2>
            <p className="text-sm text-slate-400">Customize your trading experience</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testPersonalization}
            className="border-slate-600 text-slate-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToDefaults}
            className="border-slate-600 text-slate-300"
          >
            Reset
          </Button>
          <Button 
            size="sm"
            onClick={saveSettings}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="ai">AI Coach</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-400" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Configure your personal trading profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={userProfile.displayName}
                    onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
                    placeholder="Your trading name"
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select 
                    value={userProfile.timeZone} 
                    onValueChange={(value) => setUserProfile({...userProfile, timeZone: value})}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London Time</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin Time</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo Time</SelectItem>
                      <SelectItem value="Asia/Singapore">Singapore Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Preferences */}
        <TabsContent value="trading" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Trading Preferences</span>
              </CardTitle>
              <CardDescription>Set your trading style and risk preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trading Experience</Label>
                    <Select 
                      value={userProfile.tradingExperience} 
                      onValueChange={(value) => setUserProfile({...userProfile, tradingExperience: value})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Beginner (0-1 years)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Intermediate (1-3 years)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4" />
                            <span>Advanced (3+ years)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="professional">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Professional</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Trading Style</Label>
                    <Select 
                      value={userProfile.tradingStyle} 
                      onValueChange={(value) => setUserProfile({...userProfile, tradingStyle: value})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scalping">⚡ Scalping (seconds to minutes)</SelectItem>
                        <SelectItem value="day">📈 Day Trading (intraday)</SelectItem>
                        <SelectItem value="swing">📊 Swing Trading (days to weeks)</SelectItem>
                        <SelectItem value="position">🏗️ Position Trading (weeks to months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Risk Tolerance</Label>
                    <Select 
                      value={userProfile.riskTolerance} 
                      onValueChange={(value) => setUserProfile({...userProfile, riskTolerance: value})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span>Conservative</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="moderate">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-yellow-400" />
                            <span>Moderate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="aggressive">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Aggressive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Goal</Label>
                    <Select 
                      value={userProfile.primaryGoal} 
                      onValueChange={(value) => setUserProfile({...userProfile, primaryGoal: value})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">💰 Maximize Profit</SelectItem>
                        <SelectItem value="learning">📚 Learn & Improve</SelectItem>
                        <SelectItem value="income">💵 Steady Income</SelectItem>
                        <SelectItem value="preservation">🛡️ Capital Preservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-purple-400" />
                <span>Smart Notifications</span>
              </CardTitle>
              <CardDescription>Personalized notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">Notification Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    priceAlerts: { label: 'Price Alerts', icon: '📈' },
                    newsAlerts: { label: 'Market News', icon: '📰' },
                    aiInsights: { label: 'AI Insights', icon: '🤖' },
                    tradeSignals: { label: 'Trade Signals', icon: '⚡' },
                    economicEvents: { label: 'Economic Events', icon: '📅' },
                    portfolioAlerts: { label: 'Portfolio Updates', icon: '💼' },
                    riskWarnings: { label: 'Risk Warnings', icon: '⚠️' }
                  }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{config.icon}</span>
                        <Label className="text-white">{config.label}</Label>
                      </div>
                      <Switch
                        checked={preferences[key as keyof NotificationPreferences] as boolean}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, [key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">Quiet Hours</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Enable Quiet Hours</Label>
                    <Switch
                      checked={preferences.quietHours.enabled}
                      onCheckedChange={(checked) => 
                        setPreferences({
                          ...preferences, 
                          quietHours: {...preferences.quietHours, enabled: checked}
                        })
                      }
                    />
                  </div>
                  
                  {preferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: {...preferences.quietHours, start: e.target.value}
                          })}
                          className="bg-slate-800/50 border-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: {...preferences.quietHours, end: e.target.value}
                          })}
                          className="bg-slate-800/50 border-slate-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface Settings */}
        <TabsContent value="interface" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-pink-400" />
                <span>Interface Preferences</span>
              </CardTitle>
              <CardDescription>Customize your app's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dashboard Layout</Label>
                    <Select 
                      value={personalSettings.dashboardLayout} 
                      onValueChange={(value) => setPersonalSettings({...personalSettings, dashboardLayout: value})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Interface Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4" />
                          <Label className="text-slate-300">Sound Effects</Label>
                        </div>
                        <Switch
                          checked={personalSettings.soundEffects}
                          onCheckedChange={(checked) => 
                            setPersonalSettings({...personalSettings, soundEffects: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <Label className="text-slate-300">Animations</Label>
                        </div>
                        <Switch
                          checked={personalSettings.animations}
                          onCheckedChange={(checked) => 
                            setPersonalSettings({...personalSettings, animations: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Auto Refresh Interval (seconds)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[personalSettings.refreshInterval]}
                        onValueChange={(value) => 
                          setPersonalSettings({...personalSettings, refreshInterval: value[0]})
                        }
                        max={300}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>5s</span>
                        <span>{personalSettings.refreshInterval}s</span>
                        <span>5min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <Label className="text-slate-300">Auto Refresh</Label>
                    </div>
                    <Switch
                      checked={personalSettings.autoRefresh}
                      onCheckedChange={(checked) => 
                        setPersonalSettings({...personalSettings, autoRefresh: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Coach Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span>AI Coach Personalization</span>
              </CardTitle>
              <CardDescription>Customize your AI trading coach behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>AI Personality</Label>
                  <Select 
                    value={personalSettings.aiPersonality} 
                    onValueChange={(value) => setPersonalSettings({...personalSettings, aiPersonality: value})}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span>Conservative - Focus on risk management</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="balanced">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                          <span>Balanced - Mix of growth and safety</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="aggressive">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-red-400" />
                          <span>Aggressive - Focus on opportunities</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Confidence Threshold (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[personalSettings.confidenceThreshold]}
                      onValueChange={(value) => 
                        setPersonalSettings({...personalSettings, confidenceThreshold: value[0]})
                      }
                      max={95}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>50%</span>
                      <span>{personalSettings.confidenceThreshold}%</span>
                      <span>95%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Only show AI insights with confidence above this threshold
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <Label className="text-slate-300">Learning Mode</Label>
                    </div>
                    <Switch
                      checked={personalSettings.learningMode}
                      onCheckedChange={(checked) => 
                        setPersonalSettings({...personalSettings, learningMode: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <Label className="text-slate-300">Show Educational Tips</Label>
                    </div>
                    <Switch
                      checked={personalSettings.showTips}
                      onCheckedChange={(checked) => 
                        setPersonalSettings({...personalSettings, showTips: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizationSettings; 