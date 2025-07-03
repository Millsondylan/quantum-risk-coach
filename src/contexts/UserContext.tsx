import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyTheme } from '@/lib/theme';
import { localDatabase } from '@/lib/localStorage';

// Define notification preferences type locally
interface NotificationPreferences {
  priceAlerts: boolean;
  newsAlerts: boolean;
  aiInsights: boolean;
  tradeSignals: boolean;
  economicEvents: boolean;
  portfolioAlerts: boolean;
  riskWarnings: boolean;
  pushNotifications: boolean;
  telegram: boolean;
  soundEnabled: boolean;
  marketUpdates: boolean;
  tradeAlerts: boolean;
  marketSentiment: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  weekends: boolean;
  minimumImpact: string;
  frequency: string;
  personalizedSymbols: string[];
  tradingStyle: string;
  riskTolerance: string;
  experience: string;
}

export interface UserPreferences {
  tradingStyle: 'scalping' | 'day-trading' | 'swing-trading' | 'position-trading';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredMarkets: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface UserData {
  id: string;
  name: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  lastActive: string;
}

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

const getDefaultPreferences = (): UserPreferences => ({
  tradingStyle: 'day-trading',
  riskTolerance: 'moderate',
  preferredMarkets: [],
  experienceLevel: 'beginner',
  notifications: {
    priceAlerts: true,
    newsAlerts: true,
    aiInsights: true,
    tradeSignals: true,
    economicEvents: true,
    portfolioAlerts: true,
    riskWarnings: true,
    pushNotifications: true,
    telegram: false,
    soundEnabled: true,
    marketUpdates: true,
    tradeAlerts: true,
    marketSentiment: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    weekends: true,
    minimumImpact: 'medium',
    frequency: 'instant',
    personalizedSymbols: [],
    tradingStyle: 'day',
    riskTolerance: 'moderate',
    experience: 'intermediate'
  },
  theme: 'auto',
  language: 'en',
});

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
          applyTheme(userData.preferences?.theme || 'auto');
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

    // Update in local database
    await localDatabase.createUser(user.name, {
      id: updatedUser.id,
      preferences: updatedUser.preferences,
      onboardingCompleted: updatedUser.onboardingCompleted,
      createdAt: updatedUser.createdAt,
      lastActive: updatedUser.lastActive,
    });

    // Update in local storage
    await storage.set('user', updatedUser);
    setUser(updatedUser);
    if (newPreferences.theme) {
      applyTheme(newPreferences.theme as any);
    }
  };

  const completeOnboarding = async (preferences: UserPreferences) => {
    let baseUser = user;
    // If user doesn't exist yet (edge-case), create one first
    if (!baseUser) {
      baseUser = {
        id: `user_${Date.now()}`,
        name: 'Trader',
        preferences: getDefaultPreferences(),
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
    }

    const newUser: UserData = {
      ...baseUser,
      preferences,
      onboardingCompleted: true,
      lastActive: new Date().toISOString(),
    };

    // Update in local database
    await localDatabase.createUser(newUser.name, {
      id: newUser.id,
      preferences: newUser.preferences,
      onboardingCompleted: newUser.onboardingCompleted,
      createdAt: newUser.createdAt,
      lastActive: newUser.lastActive,
    });

    // Update in local storage
    await storage.set('user', newUser);
    setUser(newUser);
    applyTheme(preferences.theme || 'auto');
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

  const createUser = async (name: string) => {
    // Check if user already exists in local database
    const existingUser = await localDatabase.getUser(name);
    
    if (existingUser) {
      // User exists, load their data
      const userData: UserData = {
        id: existingUser.id || `user_${Date.now()}`,
        name: existingUser.username,
        preferences: existingUser.preferences || getDefaultPreferences(),
        onboardingCompleted: existingUser.onboardingCompleted || false,
        createdAt: existingUser.createdAt,
        lastActive: new Date().toISOString(),
      };
      
      await storage.set('user', userData);
      setUser(userData);
      return;
    }

    // Create new user in local database
    const newUser: UserData = {
      id: `user_${Date.now()}`,
      name,
      preferences: getDefaultPreferences(),
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    // Save to local database
    await localDatabase.createUser(name, {
      id: newUser.id,
      preferences: newUser.preferences,
      onboardingCompleted: newUser.onboardingCompleted,
      createdAt: newUser.createdAt,
      lastActive: newUser.lastActive,
    });

    // Also save to local storage for immediate access
    await storage.set('user', newUser);
    setUser(newUser);
  };

  const value: UserContextType = {
    user,
    isLoading,
    createUser,
    updatePreferences,
    completeOnboarding,
    updateLastActive,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 