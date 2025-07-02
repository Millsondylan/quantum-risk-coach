import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveUserData, getUserData } from '@/lib/localUserUtils';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData('user');
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

    await saveUserData('user', updatedUser);
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

    await saveUserData('user', newUser);
    setUser(newUser);
  };

  const updateLastActive = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    await saveUserData('user', updatedUser);
    setUser(updatedUser);
  };

  const value: UserContextType = {
    user,
    isLoading,
    updatePreferences,
    completeOnboarding,
    updateLastActive,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 