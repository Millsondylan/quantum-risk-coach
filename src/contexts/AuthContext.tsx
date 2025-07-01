import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { setupTradingTables } from '@/lib/databaseSetup';
import { testAuthFlow, createUserProfile } from '@/lib/authTest';

interface AuthError {
  message: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signOut: (callback?: () => void) => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [initialized, setInitialized] = useState(false);

  // Initialize app function
  const initializeApp = useCallback(async () => {
    if (initialized) return;
    
    try {
      console.log('🚀 Initializing Quantum Risk Coach...');
      
      // Test authentication first
      const authTest = await testAuthFlow();
      if (authTest.errors.length > 0) {
        console.warn('⚠️ Auth setup issues:', authTest.errors);
      } else {
        console.log('✅ Auth test passed');
      }
      
      // Then test database
      const dbSetup = await setupTradingTables();
      if (dbSetup) {
        console.log('✅ Database setup verified');
      } else {
        console.warn('⚠️ Database setup issues detected');
      }
      
      setInitialized(true);
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setInitialized(true); // Still mark as initialized to prevent infinite loops
    }
  }, [initialized]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Get initial session and initialize app
    const getInitialSession = async () => {
      try {
        // Initialize database first
        await initializeApp();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('📋 Initial session:', session?.user?.email || 'No active session');
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
  }, [initializeApp]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 Attempting sign in for:', email);
      
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out before sign in failed, continuing...');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { error };
      }

      console.log('✅ Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in catch error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log('📝 Attempting sign up for:', email);
      
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
        console.error('❌ Sign up error:', signUpError);
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

      console.log('✅ Sign up successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up catch error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (callback?: () => void) => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('✅ Sign out successful');
      }
      
      // Clean up auth state
      cleanupAuthState();
      
      // Reset state
      setUser(null);
      setSession(null);
      
      // Execute callback if provided
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Sign out catch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: { username?: string; avatar_url?: string }) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { error };
      }

      console.log('✅ Profile updated successfully:', data);
      return { error: null };
    } catch (error) {
      console.error('Profile update catch error:', error);
      return { error: error as AuthError };
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook with better error handling
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
