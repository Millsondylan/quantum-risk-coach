/**
 * User Initialization Service
 * Ensures new users start with clean, zero-state data
 */

import { UserData, UserPreferences, getDefaultPreferences } from '@/types/user';
import { localDatabase, Portfolio, Account } from '@/lib/localDatabase';

export interface CleanUserState {
  user: UserData;
  defaultPortfolio: Portfolio;
  defaultAccount: Account;
}

class UserInitializationService {
  /**
   * Create a completely clean user state with zero balances and empty data
   */
  async createCleanUser(name: string, username?: string): Promise<CleanUserState> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create user with clean preferences (no fake data)
    const cleanPreferences: UserPreferences = {
      ...getDefaultPreferences(),
      // Override any default values that might contain fake data
      preferredMarkets: [], // Empty until user selects
      tradingGoals: [], // Empty until user creates goals
      watchlistGroups: [
        {
          id: 'default',
          name: 'Default Watchlist',
          symbols: [], // Empty until user adds symbols
          isDefault: true
        }
      ],
      dashboardLayout: this.getCleanDashboardLayout(),
      apiKeys: {} // Empty until user configures
    };

    const newUser: UserData = {
      id: userId,
      name,
      username,
      preferences: cleanPreferences,
      onboardingCompleted: false,
      createdAt: timestamp,
      lastActive: timestamp,
    };

    // Create default portfolio with zero values
    const defaultPortfolio: Portfolio = {
      id: `portfolio_${userId}`,
      name: 'Default Portfolio',
      color: '#3B82F6',
      icon: 'TrendingUp',
      createdAt: timestamp,
    };

    // Create default account with zero balance
    const defaultAccount: Account = {
      id: `account_${userId}`,
      portfolioId: defaultPortfolio.id,
      name: 'Trading Account',
      type: 'manual',
      balance: 0, // Start with zero balance
      currency: 'USD',
      createdAt: timestamp,
    };

    // Save to database
    try {
      await localDatabase.createPortfolio(defaultPortfolio);
      await localDatabase.createAccount(defaultAccount);
      
      return {
        user: newUser,
        defaultPortfolio,
        defaultAccount
      };
    } catch (error) {
      console.error('Error creating clean user state:', error);
      throw new Error('Failed to initialize user account');
    }
  }

  /**
   * Get clean dashboard layout without any fake data
   */
  private getCleanDashboardLayout() {
    return [
      {
        id: 'balance-overview',
        type: 'balance',
        title: 'Account Balance',
        x: 0,
        y: 0,
        w: 6,
        h: 3,
        minW: 4,
        minH: 2,
        isVisible: true,
        settings: {
          showPercentage: true,
          showChart: false,
          currency: 'USD'
        }
      },
      {
        id: 'trade-stats',
        type: 'stats',
        title: 'Trading Statistics',
        x: 6,
        y: 0,
        w: 6,
        h: 3,
        minW: 4,
        minH: 2,
        isVisible: true,
        settings: {
          period: '30d',
          showWinRate: true,
          showPnL: true
        }
      },
      {
        id: 'recent-trades',
        type: 'trades',
        title: 'Recent Trades',
        x: 0,
        y: 3,
        w: 12,
        h: 4,
        minW: 6,
        minH: 3,
        isVisible: true,
        settings: {
          limit: 5,
          showClosed: true,
          showOpen: true
        }
      },
      {
        id: 'performance-chart',
        type: 'chart',
        title: 'Performance Chart',
        x: 0,
        y: 7,
        w: 8,
        h: 4,
        minW: 6,
        minH: 3,
        isVisible: true,
        settings: {
          period: '30d',
          chartType: 'pnl',
          showGrid: true
        }
      },
      {
        id: 'quick-actions',
        type: 'actions',
        title: 'Quick Actions',
        x: 8,
        y: 7,
        w: 4,
        h: 4,
        minW: 3,
        minH: 2,
        isVisible: true,
        settings: {
          showAddTrade: true,
          showAnalytics: true,
          showAI: true
        }
      }
    ];
  }

  /**
   * Reset user data to clean state (useful for testing or data corruption recovery)
   */
  async resetUserToCleanState(userId: string): Promise<void> {
    try {
      // Clear all user's trades, portfolios, and accounts
      await localDatabase.clearAllData();
      
      console.log('User data reset to clean state');
    } catch (error) {
      console.error('Error resetting user data:', error);
      throw new Error('Failed to reset user data');
    }
  }

  /**
   * Validate that user data doesn't contain fake/demo data
   */
  validateCleanUserData(user: UserData): boolean {
    // Check for common fake data indicators
    const fakeIndicators = [
      'demo', 'test', 'fake', 'sample', 'example',
      'lorem', 'ipsum', 'placeholder', 'temp'
    ];

    const dataToCheck = [
      user.name.toLowerCase(),
      ...(user.preferences.preferredMarkets || []).map(m => m.toLowerCase()),
      ...(user.preferences.tradingGoals || []).map(g => g.name.toLowerCase()),
    ];

    return !dataToCheck.some(data => 
      fakeIndicators.some(indicator => data.includes(indicator))
    );
  }

  /**
   * Get initial account balance (should always be 0 for new users)
   */
  getInitialBalance(): number {
    return 0;
  }

  /**
   * Get initial trade count (should always be 0 for new users)
   */
  getInitialTradeCount(): number {
    return 0;
  }

  /**
   * Get initial PnL (should always be 0 for new users)
   */
  getInitialPnL(): number {
    return 0;
  }

  /**
   * Get clean statistics object for new users
   */
  getCleanStatistics() {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      averagePnL: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      averageWin: 0,
      averageLoss: 0,
      openTrades: 0,
      balance: 0,
      equity: 0,
      margin: 0,
      freeMargin: 0,
      marginLevel: 0
    };
  }

  /**
   * Check if user has inputted their own data
   */
  hasUserInputData(user: UserData, trades: any[] = [], accounts: any[] = []): boolean {
    const hasCustomBalance = accounts.some(account => account.balance > 0);
    const hasTrades = trades.length > 0;
    const hasCustomPreferences = user.onboardingCompleted;
    
    return hasCustomBalance || hasTrades || hasCustomPreferences;
  }

  /**
   * Generate clean welcome message for new users
   */
  getWelcomeMessage(userName: string): string {
    return `Welcome to Quantum Risk Coach, ${userName}! 

Your account has been created with a clean slate:
• Balance: $0 (Update in Settings)
• Trades: None (Add your first trade)
• Statistics: All zeros until you start trading

Get started by:
1. Setting your account balance in Settings
2. Adding your first trade
3. Exploring the AI Coach features`;
  }

  /**
   * Ensure no fake data is displayed in any component
   */
  sanitizeDisplayData(data: any): any {
    if (typeof data === 'number') {
      // Return 0 for any numeric fake data
      return isNaN(data) || !isFinite(data) ? 0 : data;
    }
    
    if (typeof data === 'string') {
      const fakeIndicators = ['demo', 'test', 'fake', 'sample', 'example'];
      const lowerData = data.toLowerCase();
      
      if (fakeIndicators.some(indicator => lowerData.includes(indicator))) {
        return '';
      }
    }
    
    if (Array.isArray(data)) {
      return data.filter(item => {
        if (typeof item === 'string') {
          const fakeIndicators = ['demo', 'test', 'fake', 'sample'];
          return !fakeIndicators.some(indicator => 
            item.toLowerCase().includes(indicator)
          );
        }
        return true;
      });
    }
    
    return data;
  }
}

// Export singleton instance
export const userInitializationService = new UserInitializationService();

// Helper functions for components
export const isCleanUserState = (
  totalTrades: number, 
  balance: number, 
  onboardingCompleted: boolean
): boolean => {
  return totalTrades === 0 && balance === 0 && !onboardingCompleted;
};

export const getEmptyStateMessage = (section: string): string => {
  const messages = {
    trades: 'No trades yet. Add your first trade to get started!',
    balance: 'Set your account balance in Settings to begin tracking your progress.',
    analytics: 'Analytics will appear once you add trades and set your balance.',
    history: 'Your trading history will show here as you add trades.',
    dashboard: 'Your dashboard will populate with data as you start trading.',
    watchlist: 'Add currency pairs to your watchlist to track their performance.',
    goals: 'Set trading goals to track your progress and stay motivated.',
    news: 'Market news and analysis will help inform your trading decisions.'
  };
  
  return messages[section as keyof typeof messages] || 'No data available yet.';
}; 