
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const MT4Connection = () => {
  const navigate = useNavigate();
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('MT4/5 connection configured successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to connect to MT4/5');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="holo-card">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center gradient-text">Connect MT4/5</CardTitle>
              <CardDescription className="text-center text-slate-400">
                Connect your MetaTrader account to sync live trading data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <Input
                    id="server"
                    type="text"
                    placeholder="e.g., YourBroker-Live"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="Your MT4/5 login number"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Investor Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Investor password (read-only)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-400">
                    Use your investor password for secure read-only access
                  </p>
                </div>
                <Button type="submit" className="w-full holo-button" disabled={loading}>
                  <Wifi className="w-4 h-4 mr-2" />
                  {loading ? 'Connecting...' : 'Connect Account'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                <h3 className="text-sm font-medium text-white mb-2">Security Notice</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We only use investor passwords for read-only access to your trading data. 
                  Your funds and trading capabilities remain completely secure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MT4Connection;
