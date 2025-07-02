import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Navigate, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, loading, isOnline } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingDemo, setLoadingDemo] = useState(false);

  const navigate = useNavigate();

  // Demo accounts
  const demoAccounts = [
    { email: 'demo@trader.com', password: 'demo123', username: 'Demo Trader' },
    { email: 'test@investor.com', password: 'test123', username: 'Test Investor' },
  ];

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (activeTab === 'signup' && !formData.username) {
      setError('Username is required for signup');
      return;
    }

    try {
      let result;
      
      if (activeTab === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.username);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(activeTab === 'signin' ? 'Welcome back!' : 'Account created successfully!');
        // Clear form
        setFormData({ email: '', password: '', username: '' });
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Auth error:', error);
    }
  };

  const handleDemoLogin = async (demoAccount: typeof demoAccounts[0]) => {
    setError('');
    setSuccess('');
    
    try {
      const result = await signIn(demoAccount.email, demoAccount.password);
      
      if (result.error) {
        // If login fails, create the demo account first
        const signupResult = await signUp(demoAccount.email, demoAccount.password, demoAccount.username);
        if (signupResult.error) {
          setError('Failed to create demo account');
        } else {
          setSuccess('Demo account created and logged in!');
        }
      } else {
        setSuccess('Demo login successful!');
      }
    } catch (error) {
      setError('Demo login failed');
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-400">
              <Wifi className="h-4 w-4" />
              <span>Online - Full Sync</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400">
              <WifiOff className="h-4 w-4" />
              <span>Offline - Local Mode</span>
            </div>
          )}
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>⚡ Fast Local Mode Active</span>
          </div>
        )}

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quantum Risk Coach
            </CardTitle>
            <CardDescription className="text-slate-400">
              Next-Gen Trading Intelligence
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Unlimited Access
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Or try demo accounts</span>
                </div>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              {demoAccounts.map((demo, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start border-slate-600 hover:bg-slate-700"
                  onClick={() => handleDemoLogin(demo)}
                  disabled={loading}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{demo.username}</span>
                    <span className="text-xs text-slate-400">{demo.email}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="text-center text-xs text-slate-400">
              {isOnline ? (
                <div>
                  <p>🌐 Connected to cloud database</p>
                  <p>All data will be synced and backed up</p>
                </div>
              ) : (
                <div>
                  <p>⚡ Lightning-fast local mode - no internet required</p>
                  <p>✨ All your data stays private on your device</p>
                  <p>🚀 Instant access to full trading platform</p>
                </div>
              )}
            </div>

            {/* Quick Demo Access Button */}
            <div className="space-y-4">
              <Button
                onClick={async () => {
                  setLoadingDemo(true);
                  setError(''); // Clear any previous errors
                  try {
                    console.log('🚀 Starting demo access...');
                    const result = await signUp('demo@quantumrisk.com', 'demo123', 'Demo User');
                    if (!result.error) {
                      console.log('✅ Demo user created/logged in successfully');
                      // Use React Router navigation instead of window.location
                      setTimeout(() => {
                        navigate('/');
                      }, 1000); // Small delay to show success
                    } else {
                      console.log('Demo login error:', result.error);
                      setError('Demo access failed. Please try again.');
                    }
                  } catch (error) {
                    console.error('Demo access error:', error);
                    setError('Demo access failed. Please try again.');
                  }
                  setLoadingDemo(false);
                }}
                disabled={loading || loadingDemo}
                className="w-full holo-button bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
              >
                {loadingDemo ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Demo Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Quick Demo Access</span>
                  </div>
                )}
              </Button>
              <div className="text-center text-xs text-slate-500">
                ↑ Instant access • No registration required • Ultra-fast local mode
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
