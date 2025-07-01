
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Bell, Shield, Palette } from 'lucide-react';
import Header from '@/components/Header';

const Settings = () => {
  const navigate = useNavigate();

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
                  <User className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Profile Settings</span>
                </CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Profile settings coming soon...</p>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Notifications</span>
                </CardTitle>
                <CardDescription>Configure your alert preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Notification settings coming soon...</p>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Security</span>
                </CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Security settings coming soon...</p>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  <span className="text-white">Appearance</span>
                </CardTitle>
                <CardDescription>Customize your dashboard appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Theme settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
