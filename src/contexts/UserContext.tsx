import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserPreferences {
  tradingStyle: 'scalping' | 'day-trading' | 'swing-trading' | 'position-trading';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredMarkets: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  notifications: {
    tradeAlerts: boolean;
    marketUpdates: boolean;
    riskWarnings: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface UserData {
  id: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  lastActive: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
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
      try {
        // Try Capacitor first
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: JSON.stringify(value) });
      } catch {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  },
  
  async get(key: string) {
    if (typeof window !== 'undefined') {
      try {
        // Try Capacitor first
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } catch {
        // Fallback to localStorage
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    }
    return null;
  },
  
  async remove(key: string) {
    if (typeof window !== 'undefined') {
      try {
        // Try Capacitor first
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
      } catch {
        // Fallback to localStorage
        localStorage.removeItem(key);
      }
    }
  },
  
  async clear() {
    if (typeof window !== 'undefined') {
      try {
        // Try Capacitor first
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.clear();
      } catch {
        // Fallback to localStorage
        localStorage.clear();
      }
    }
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await storage.get('user');
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...newPreferences },
      lastActive: new Date().toISOString(),
    };

    await storage.set('user', updatedUser);
    setUser(updatedUser);
  };

  const completeOnboarding = async (preferences: UserPreferences) => {
    const newUser: UserData = {
      id: `user_${Date.now()}`,
      preferences,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await storage.set('user', newUser);
    setUser(newUser);
  };

  const updateLastActive = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    await storage.set('user', updatedUser);
    setUser(updatedUser);
  };

  const clearUser = async () => {
    await storage.remove('user');
    setUser(null);
  };

  const value: UserContextType = {
    user,
    isLoading,
    updatePreferences,
    completeOnboarding,
    updateLastActive,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 