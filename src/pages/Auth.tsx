import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const Auth = () => {
  const navigate = useNavigate();
  const { createUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) {
      toast.error('Please enter your name');
      setIsLoading(false);
      return;
    }

    try {
      await createUser(name.trim());
      toast.success(`Welcome, ${name}!`);
      navigate('/');
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error('Failed to start. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // For testing purposes, simulate sign in
      await createUser(email.split('@')[0] || 'User');
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" data-testid="auth-page">
      <div className="w-full max-w-md">
        <Card className="holo-card border-slate-700 bg-slate-800/50 backdrop-blur-xl" data-testid="auth-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-400 mr-2" />
              <CardTitle className="text-2xl font-bold text-white" data-testid="auth-title">Quantum Risk Coach</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Next-Gen Trading Intelligence Platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full" 
              data-testid="auth-tabs"
              defaultValue="signup"
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  data-testid="signup-tab"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  data-testid="signin-tab"
                >
                  Sign In
                </TabsTrigger>
              </TabsList>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="mt-6" data-testid="signup-content">
                <form onSubmit={handleSignUp} className="space-y-4" data-testid="signup-form">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        data-testid="signup-username-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      data-testid="signup-email-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      data-testid="signup-password-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-white">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      data-testid="signup-confirm-password-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading}
                    data-testid="signup-button"
                  >
                    {isLoading ? 'Loading...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-6" data-testid="signin-content">
                <form onSubmit={handleSignIn} className="space-y-4" data-testid="signin-form">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      data-testid="signin-email-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      data-testid="signin-password-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading}
                    data-testid="signin-button"
                  >
                    {isLoading ? 'Loading...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth; 