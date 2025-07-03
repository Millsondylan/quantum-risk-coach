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
import { pushNotificationService } from '@/lib/pushNotificationService';

const Auth = () => {
  const navigate = useNavigate();
  const { createUser, completeOnboarding } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');

  // Form state - username only
  const [username, setUsername] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Username validation only
    if (!username.trim()) {
      toast.error('Please enter your username', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'error-toast'
      } as any);
      setIsLoading(false);
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'error-toast'
      } as any);
      setIsLoading(false);
      return;
    }

    try {
      // Create user with username only
      await createUser(username.trim());
      
      // Complete onboarding automatically with sensible defaults
      const defaultPreferences = {
        tradingStyle: 'day-trading' as const,
        riskTolerance: 'moderate' as const,
        preferredMarkets: ['Forex (FX)', 'Stocks'],
        experienceLevel: 'intermediate' as const,
        notifications: pushNotificationService.getPreferences(),
        theme: 'dark' as const,
        language: 'en',
      };
      
      await completeOnboarding(defaultPreferences);
      
      // Wait a moment for state to update before navigating
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(`Welcome, ${username}! Account created successfully.`, { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'success-toast'
      } as any);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error('Failed to create account. Please try again.', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'error-toast'
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username.trim()) {
      toast.error('Please enter your username', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'error-toast'
      } as any);
      setIsLoading(false);
      return;
    }

    try {
      // For sign in, create/load the user and complete onboarding
      await createUser(username.trim());
      
      // Auto-complete onboarding for existing users
      const defaultPreferences = {
        tradingStyle: 'day-trading' as const,
        riskTolerance: 'moderate' as const,
        preferredMarkets: ['Forex (FX)', 'Stocks'],
        experienceLevel: 'intermediate' as const,
        notifications: pushNotificationService.getPreferences(),
        theme: 'dark' as const,
        language: 'en',
      };
      
      await completeOnboarding(defaultPreferences);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success('Welcome back!', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'success-toast'
      } as any);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed. Please try again.', { 
        duration: 4000,
        className: 'sonner-toast',
        'data-testid': 'error-toast'
      } as any);
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
              Username-Only Access • No Email Required
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
                  Create Account
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
                    <Label htmlFor="signup-username" className="text-white">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        data-testid="signup-username-input"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      No email or password required. Just pick a username and start trading!
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                    data-testid="signup-submit-button"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-6" data-testid="signin-content">
                <form onSubmit={handleSignIn} className="space-y-4" data-testid="signin-form">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username" className="text-white">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        data-testid="signin-username-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                    data-testid="signin-submit-button"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-slate-600">
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  ✨ Privacy-first design • No personal data required
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Your trading data stays secure and anonymous
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth; 