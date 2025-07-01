import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { setupTradingTables } from '@/lib/databaseSetup';
import { testAuthFlow, createUserProfile, checkUserProfile } from '@/lib/authTest';

interface AuthError {
  message: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signOut: (callback?: () => void) => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth state cleanup utility
const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Verify database setup on app start
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Quantum Risk Coach...');
        
        // Test authentication first
        const authTest = await testAuthFlow();
        if (authTest.errors.length > 0) {
          console.error('⚠️ Auth setup issues:', authTest.errors);
        }
        
        // Then test database
        await setupTradingTables();
        
        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (mounted) {
        // Only update state if it's not a demo session
        if (!session || session.user?.email !== 'demo@quantumrisk.coach') {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    });

    // Then get initial session and verify database
    const getInitialSession = async () => {
      try {
        // Initialize database first
        await initializeApp();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error getting session', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is a demo login attempt
      if (email === 'demo@quantumrisk.coach' && password === 'demo123') {
        // Create a demo user session
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'demo@quantumrisk.coach',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          user_metadata: {
            username: 'Demo User',
            demo: true
          },
          identities: [],
          factors: []
        };

        const demoSession: Session = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: demoUser
        };

        // Set demo session
        setSession(demoSession);
        setUser(demoUser);
        
        console.log('Demo login successful');
        return { error: null };
      }

      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Sign out before sign in failed, continuing...');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return { error: signUpError };
      }

      // Create user profile after successful signup
      if (data.user) {
        try {
          const profileResult = await createUserProfile(data.user.id, {
            username,
            email
          });
          
          if (profileResult.success) {
            console.log('✅ User profile created automatically');
          } else {
            console.warn('⚠️ Profile creation failed, but signup successful');
          }
        } catch (profileError) {
          console.warn('Profile creation error:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }

      console.log('Sign up successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign up catch error:', error);
      return { error };
    }
  };

  const signOut = async (callback?: () => void) => {
    try {
      // Check if this is a demo session
      if (user?.email === 'demo@quantumrisk.coach') {
        // Clear demo session
        setSession(null);
        setUser(null);
        console.log('Demo session ended');
      } else {
        // Regular Supabase sign out
        cleanupAuthState();
        await supabase.auth.signOut({ scope: 'global' });
      }
      
      // Let React Router handle navigation instead of hard redirect
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still call callback even on error to ensure navigation
      if (callback) {
        callback();
      }
    }
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user) return { error: { message: 'No user logged in' } };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
