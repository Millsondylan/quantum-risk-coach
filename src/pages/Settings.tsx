
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Palette, Database } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [currency, setCurrency] = useState('USD');

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    setNotifications(true);
    setDarkMode(true);
    setAutoSync(true);
    setRiskLevel('medium');
    setCurrency('USD');
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="grid gap-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <SettingsIcon className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">General Settings</span>
                </CardTitle>
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
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-slate-400">Receive alerts for important trading events</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notifications} 
                    onCheckedChange={setNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSync">Auto Sync</Label>
                    <p className="text-sm text-slate-400">Automatically sync data from connected accounts</p>
                  </div>
                  <Switch 
                    id="autoSync" 
                    checked={autoSync} 
                    onCheckedChange={setAutoSync} 
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
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
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
              <Button onClick={handleSaveSettings} className="holo-button flex-1">
                Save Settings
              </Button>
              <Button variant="outline" onClick={handleResetSettings} className="flex-1">
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
