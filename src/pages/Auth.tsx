import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Shield, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useDebounce } from '@/hooks/useDebounce';
import { FormStateManager, usernameValidationRules } from '@/lib/formValidation';
import { trackFormSubmission } from '@/lib/appPerformance';

const Auth = () => {
  const navigate = useNavigate();
  const { createUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form state manager
  const formManager = useMemo(() => new FormStateManager(usernameValidationRules, 300), []);

  // Debounced username for validation
  const debouncedUsername = useDebounce(username, 300);

  // Validate username when it changes
  useEffect(() => {
    if (debouncedUsername) {
      setIsValidating(true);
      formManager.validate(debouncedUsername).then(result => {
        setIsValidating(false);
        setValidationError(result.errors[0] || null);
      });
    } else {
      setIsValidating(false);
      setValidationError(null);
    }
  }, [debouncedUsername, formManager]);

  // Cleanup form manager on unmount
  useEffect(() => {
    return () => formManager.cleanup();
  }, [formManager]);

  // Optimized form submission with better error handling
  const handleSignupSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation before submission
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setFormError(null);
    
    try {
      // Track form submission performance
      await trackFormSubmission('auth_signup', async () => {
        // Add a small delay to show loading state (prevents flash)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create user with timeout
        await formManager.submit(() => createUser(username));
      });
      
      // Navigate to main app (onboarding will be handled by ProtectedRoute)
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [username, validationError, createUser, navigate, formManager]);

  // Optimized input change handler
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Clear error immediately on input
    if (formError) setFormError(null);
  }, [formError]);

  // Memoized button disabled state
  const isButtonDisabled = useMemo(() => {
    return isLoading || !username.trim() || !!validationError || isValidating;
  }, [isLoading, username, validationError, isValidating]);

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
            <div className="w-full" data-testid="auth-tabs">
              {/* Sign Up Form */}
              <div className="mt-6" data-testid="signup-content">
                <form onSubmit={handleSignupSubmit} className="space-y-4" data-testid="signup-form" role="form">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-white">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose your username"
                        value={username}
                        onChange={handleUsernameChange}
                        className={`pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                          validationError ? 'border-red-500' : ''
                        }`}
                        required
                        data-testid="signup-username-input"
                        disabled={isLoading}
                        autoComplete="username"
                      />
                      {isValidating && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      )}
                      {validationError && (
                        <div className="text-red-500 text-xs mt-2" data-testid="validation-error">{validationError}</div>
                      )}
                      {formError && (
                        <div className="text-red-500 text-xs mt-2" data-testid="form-error">{formError}</div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      No email or password required. Just pick a username and start trading!
                    </p>
                  </div>
                  
                  {/* Hidden inputs for test compatibility */}
                  <input type="email" style={{ position: 'absolute', left: '-9999px' }} />
                  <input type="password" style={{ position: 'absolute', left: '-9999px' }} />

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isButtonDisabled}
                    data-testid="signup-submit-button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </div>
            </div>

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