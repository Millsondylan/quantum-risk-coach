import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserPreferences, UserData, TradingGoal, NotificationPreferences } from '@/types/user';
import { getDefaultPreferences } from '@/types/user';

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  createUser: (name: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  completeOnboarding: (preferences: UserPreferences) => Promise<void>;
  updateLastActive: () => Promise<void>;
  clearUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Storage utilities that work in both browser and Capacitor
const storage = {
  async set(key: string, value: any) {
    if (typeof window !== 'undefined') {
      // Use localStorage for now to avoid Capacitor issues
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  
  async get(key: string) {
    if (typeof window !== 'undefined') {
      // Use localStorage for now to avoid Capacitor issues
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  },
  
  async remove(key: string) {
    if (typeof window !== 'undefined') {
      // Use localStorage for now to avoid Capacitor issues
      localStorage.removeItem(key);
    }
  },
  
  async clear() {
    if (typeof window !== 'undefined') {
      // Use localStorage for now to avoid Capacitor issues
      localStorage.clear();
    }
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modified useEffect to handle initialization more gracefully
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔍 Loading user data...');
      try {
        const userData = await storage.get('user') as UserData | null;
        
        console.log('🔍 User data loaded:', userData);
        
        if (userData) {
          setUser(userData);
        } else {
          // No user data found - don't create a default user
          // This will cause the app to redirect to auth page
          console.log('🔍 No user data found, will redirect to auth');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // Don't create a fallback user - let the app redirect to auth
        console.log('🔍 Error loading user data, will redirect to auth');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []); // Empty dependency array means this effect runs once on mount

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    console.log('🔍 Updating preferences...', newPreferences);
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        preferences: {
          ...prevUser.preferences,
          ...newPreferences,
        },
      };
      // Use setTimeout to avoid blocking UI
      setTimeout(() => storage.set('user', updatedUser), 0);
      console.log('🔍 Preferences updated and saved.', updatedUser);
      return updatedUser;
    });
  }, []);

  const completeOnboarding = useCallback(async (preferences: UserPreferences) => {
    console.log('🔍 Completing onboarding...', preferences);
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        preferences: {
          ...prevUser.preferences,
          ...preferences,
        },
        onboardingCompleted: true,
      };
      // Use setTimeout to avoid blocking UI
      setTimeout(() => storage.set('user', updatedUser), 0);
      console.log('🔍 Onboarding completed and user saved.', updatedUser);
      return updatedUser;
    });
  }, []);

  const updateLastActive = useCallback(async () => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        lastActive: new Date().toISOString(),
      };
      // Use setTimeout to avoid blocking UI
      setTimeout(() => storage.set('user', updatedUser), 0);
      return updatedUser;
    });
  }, []);

  const clearUser = useCallback(async () => {
    setUser(null);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => storage.remove('user'), 0);
    console.log('🔍 User data cleared.');
  }, []);

  const createUser = useCallback(async (name: string) => {
    try {
      const newUser: UserData = {
        id: `user_${Date.now()}`,
        name,
        preferences: getDefaultPreferences(),
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      
      setUser(newUser);
      
      // Save user to storage
      await storage.set('user', newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user. Please try again.');
    }
  }, []);

  // If there's an error and we're not loading, show error state
  if (error && !isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>🚨 Error Loading User Data</h1>
        <p>Something went wrong while loading your data:</p>
        <pre style={{ background: '#333', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
          {error}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Reload App
        </button>
      </div>
    );
  }

  const value: UserContextType = {
    user,
    isLoading,
    createUser,
    updatePreferences,
    completeOnboarding,
    updateLastActive,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 