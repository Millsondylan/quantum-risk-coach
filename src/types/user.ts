export interface NotificationPreferences {
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
  email: boolean;
  push: boolean;
}

export interface TradingGoal {
  id: string;
  name: string;
  type: 'profit' | 'win_rate' | 'risk_reward' | 'trade_count';
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  progress: number;
}

export interface UserPreferences {
  tradingStyle: 'scalping' | 'day-trading' | 'swing-trading' | 'position-trading';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredMarkets: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  emotionTracking?: boolean;
  aiCoaching?: boolean;
  tradingPersona?: {
    type: 'scalper' | 'day-trader' | 'swing-trader' | 'position-trader';
    quizResults: {
      timeCommitment: string;
      riskAppetite: string;
      holdingPeriod: string;
      decisionStyle: string;
      marketFocus: string;
    };
    determinedAt: string;
  };
  dashboardLayout?: Array<{
    id: string;
    type: string;
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    isVisible: boolean;
    settings?: Record<string, any>;
  }>;
  tradingGoals?: TradingGoal[];
  watchlistGroups?: Array<{ id: string; name: string; symbols: string[]; isDefault: boolean }>;
  apiKeys?: {
    openaiApiKey?: string;
    groqApiKey?: string;
    geminiApiKey?: string;
    newsApiKey?: string;
    marketDataApiKey?: string;
  };
  enableAdvancedAnalytics?: boolean;
}

export interface UserData {
  id: string;
  name: string;
  username?: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  lastActive: string;
}

export function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'auto',
    language: 'en',
    currency: 'USD',
    tradingStyle: 'day-trading',
    riskTolerance: 'moderate',
    preferredMarkets: [],
    experienceLevel: 'beginner',
    emotionTracking: true,
    aiCoaching: true,
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
      experience: 'intermediate',
      email: true,
      push: true
    }
  };
} 