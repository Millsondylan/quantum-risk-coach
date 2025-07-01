import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthError {
  message: string;
  status?: number;
}

interface LocalUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  subscription_status: string;
  posts_remaining: number;
}

interface AuthContextType {
  user: User | LocalUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signOut: (callback?: () => void) => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const LOCAL_USER_KEY = 'quantum_risk_coach_user';
const LOCAL_SETTINGS_KEY = 'quantum_risk_coach_settings';

// Local user management
const localUserManager = {
  getUser(): LocalUser | null {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser(user: LocalUser): void {
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user locally:', error);
    }
  },

  clearUser(): void {
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to clear local user:', error);
    }
  },

  createUser(email: string, password: string, username: string): LocalUser {
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: userId,
      email,
      username: username || 'New User',
      created_at: new Date().toISOString(),
      subscription_status: 'unlimited',
      posts_remaining: 999999
    };
  },

  validateCredentials(email: string, password: string): boolean {
    // Simple validation - in a real app, you'd hash passwords
    const users = this.getAllUsers();
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      this.getStoredPassword(user.id) === password
    );
  },

  getAllUsers(): LocalUser[] {
    try {
      const stored = localStorage.getItem('quantum_risk_coach_all_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveUserToRegistry(user: LocalUser, password: string): void {
    try {
      const users = this.getAllUsers();
      const existingIndex = users.findIndex(u => u.email === user.email);
      
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      localStorage.setItem('quantum_risk_coach_all_users', JSON.stringify(users));
      localStorage.setItem(`quantum_risk_coach_password_${user.id}`, password);
    } catch (error) {
      console.error('Failed to save user to registry:', error);
    }
  },

  getStoredPassword(userId: string): string | null {
    try {
      return localStorage.getItem(`quantum_risk_coach_password_${userId}`);
    } catch {
      return null;
    }
  },

  findUserByEmail(email: string): LocalUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }
};

// Supabase sync utilities
const supabaseSync = {
  async syncUserToSupabase(localUser: LocalUser): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: localUser.id,
          username: localUser.username,
          email: localUser.email,
          subscription_status: 'unlimited',
          subscription_expires_at: '2099-12-31 23:59:59+00',
          posts_remaining: 999999,
          trial_used: false,
          created_at: localUser.created_at,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase sync failed:', error);
        return false;
      }

      console.log('✅ User synced to Supabase successfully');
      return true;
    } catch (error) {
      console.warn('Supabase sync error:', error);
      return false;
    }
  },

  async isOnline(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | LocalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  const checkOnlineStatus = useCallback(async () => {
    const online = await supabaseSync.isOnline();
    setIsOnline(online);
    return online;
  }, []);

  // Initialize app
  const initializeApp = useCallback(async () => {
    if (initialized) return;
    
    try {
      console.log('🚀 Initializing Quantum Risk Coach...');
      
      // Check if we have a local user
      const localUser = localUserManager.getUser();
      if (localUser) {
        setUser(localUser);
        console.log('✅ Local user found:', localUser.email);
      }

      // Check online status
      await checkOnlineStatus();

      // Try to get Supabase session if online
      if (isOnline) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setSession(session);
            setUser(session.user);
            console.log('✅ Supabase session found:', session.user.email);
          }
        } catch (error) {
          console.warn('Supabase session check failed:', error);
        }
      }

      setInitialized(true);
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [initialized, isOnline, checkOnlineStatus]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Set up Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Supabase auth state change:', event);
      
      if (session) {
        setSession(session);
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        // Keep local user if available
        const localUser = localUserManager.getUser();
        if (!localUser) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 Attempting sign in for:', email);
      
      // First try local authentication
      const localUser = localUserManager.findUserByEmail(email);
      if (localUser && localUserManager.validateCredentials(email, password)) {
        localUserManager.setUser(localUser);
        setUser(localUser);
        console.log('✅ Local sign in successful:', email);
        
        // Try to sync with Supabase in background
        if (await checkOnlineStatus()) {
          supabaseSync.syncUserToSupabase(localUser);
        }
        
        return { error: null };
      }

      // If online, try Supabase authentication
      if (await checkOnlineStatus()) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('❌ Supabase sign in error:', error);
            return { error };
          }

          if (data.user) {
            setSession(data.session);
            setUser(data.user);
            console.log('✅ Supabase sign in successful:', email);
            return { error: null };
          }
        } catch (error) {
          console.error('❌ Supabase sign in failed:', error);
        }
      }

      return { error: { message: 'Invalid email or password' } };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, [checkOnlineStatus]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log('📝 Attempting sign up for:', email);
      
      // Check if user already exists locally
      const existingUser = localUserManager.findUserByEmail(email);
      if (existingUser) {
        return { error: { message: 'User already exists' } };
      }

      // Create local user first (always works)
      const localUser = localUserManager.createUser(email, password, username);
      localUserManager.setUser(localUser);
      localUserManager.saveUserToRegistry(localUser, password);
      setUser(localUser);
      
      console.log('✅ Local user created:', email);

      // Try to sync with Supabase if online
      if (await checkOnlineStatus()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username }
            }
          });

          if (!error && data.user) {
            console.log('✅ Supabase account created:', email);
            await supabaseSync.syncUserToSupabase(localUser);
          }
        } catch (error) {
          console.warn('Supabase signup failed, but local account created:', error);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, [checkOnlineStatus]);

  const signOut = useCallback(async (callback?: () => void) => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      // Clear local storage
      localUserManager.clearUser();
      
      // Sign out from Supabase if online
      if (isOnline) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.warn('Supabase sign out failed:', error);
        }
      }
      
      setUser(null);
      setSession(null);
      
      if (callback) callback();
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const updateProfile = useCallback(async (updates: { username?: string; avatar_url?: string }) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      // Update local user
      const currentUser = localUserManager.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        localUserManager.setUser(updatedUser);
        setUser(updatedUser);
      }

      // Try to update Supabase if online
      if (isOnline) {
        try {
          await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
        } catch (error) {
          console.warn('Supabase profile update failed:', error);
        }
      }

      console.log('✅ Profile updated');
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as AuthError };
    }
  }, [user, isOnline]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    isOnline,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
