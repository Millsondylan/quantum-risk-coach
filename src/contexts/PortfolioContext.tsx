import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { localDatabase as database } from '@/lib/localDatabase';
import { Portfolio, Account } from '@/lib/localDatabase';

interface PortfolioContextType {
  portfolios: Portfolio[];
  currentPortfolio: (Portfolio & { totalPnL: number; accounts: Account[] }) | null;
  createPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt'>) => Promise<void>;
  switchPortfolio: (portfolioId: string) => Promise<void>;
  addAccountToPortfolio: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  refreshPortfolioBalances: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<(Portfolio & { totalPnL: number; accounts: Account[] }) | null>(null);

  useEffect(() => {
    initializePortfolios();
  }, []);

  const initializePortfolios = async () => {
    try {
      const existingPortfolios = await database.getPortfolios();
      
      if (existingPortfolios.length === 0) {
        await createDefaultPortfolio();
      }

      setPortfolios(existingPortfolios);
      
      // Set first portfolio as current if exists
      if (existingPortfolios.length > 0) {
        await switchPortfolio(existingPortfolios[0].id);
      }
    } catch (error) {
      console.error('Failed to initialize portfolios', error);
      
      // Create a default portfolio if initialization fails
      try {
        const defaultPortfolio = await createDefaultPortfolio();
        if (defaultPortfolio) {
          setPortfolios([defaultPortfolio]);
          await switchPortfolio(defaultPortfolio.id);
        }
      } catch (fallbackError) {
        console.error('Failed to create default portfolio', fallbackError);
        
        // Fallback to an in-memory portfolio
        const fallbackPortfolio: Portfolio = {
          id: `portfolio_fallback_${Date.now()}`,
          name: 'My First Portfolio',
          userId: 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setPortfolios([fallbackPortfolio]);
        setCurrentPortfolio({
          ...fallbackPortfolio,
          totalPnL: 0,
          accounts: []
        });
      }
    }
  };

  const createDefaultPortfolio = async (): Promise<Portfolio | null> => {
    try {
      const newPortfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const defaultPortfolio: Portfolio = {
        id: newPortfolioId,
        name: 'My First Portfolio',
        userId: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await database.createPortfolio(defaultPortfolio);
      return defaultPortfolio;
    } catch (error) {
      console.error('Failed to create default portfolio', error);
      return null;
    }
  };

  const createPortfolio = async (portfolioData: Omit<Portfolio, 'id' | 'createdAt'>) => {
    try {
      const newPortfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPortfolio: Portfolio = {
        id: newPortfolioId,
        ...portfolioData,
        createdAt: new Date().toISOString()
      };

      await database.createPortfolio(newPortfolio);

      const updatedPortfolios = await database.getPortfolios();
      setPortfolios(updatedPortfolios);
      
      // Automatically switch to new portfolio
      await switchPortfolio(newPortfolioId);
    } catch (error) {
      console.error('Failed to create portfolio', error);
      
      // Fallback: add to in-memory portfolios
      const fallbackPortfolio: Portfolio = {
        id: `portfolio_fallback_${Date.now()}`,
        ...portfolioData,
        createdAt: new Date().toISOString()
      };
      
      setPortfolios(prev => [...prev, fallbackPortfolio]);
      setCurrentPortfolio({
        ...fallbackPortfolio,
        totalPnL: 0,
        accounts: []
      });
    }
  };

  const switchPortfolio = async (portfolioId: string) => {
    try {
      const portfolio = portfolios.find(p => p.id === portfolioId);
      
      if (portfolio) {
        // Fetch accounts for this portfolio
        const accounts = await database.getAccountsByPortfolioId(portfolioId);
        
        setCurrentPortfolio({
          ...portfolio,
          accounts,
          totalPnL: accounts.reduce((sum, account) => sum + account.balance, 0)
        });
      }
    } catch (error) {
      console.error('Failed to switch portfolio', error);
      
      // Fallback to first portfolio or reset
      if (portfolios.length > 0) {
        const fallbackPortfolio = portfolios[0];
        setCurrentPortfolio({
          ...fallbackPortfolio,
          accounts: [],
          totalPnL: 0
        });
      } else {
        setCurrentPortfolio(null);
      }
    }
  };

  const addAccountToPortfolio = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    try {
      const newAccountId = `account_${Date.now()}`;
      
      const newAccount: Account = {
        id: newAccountId,
        ...accountData,
        createdAt: new Date().toISOString()
      };

      await database.createAccount(newAccount);

      // Refresh current portfolio to reflect new account
      if (currentPortfolio) {
        await switchPortfolio(currentPortfolio.id);
      }
    } catch (error) {
      console.error('Failed to add account to portfolio', error);
      
      // Fallback: add to current portfolio's in-memory accounts
      if (currentPortfolio) {
        const fallbackAccount: Account = {
          id: `account_fallback_${Date.now()}`,
          ...accountData,
          createdAt: new Date().toISOString()
        };
        
        setCurrentPortfolio(prev => prev ? {
          ...prev,
          accounts: [...prev.accounts, fallbackAccount],
          totalPnL: prev.totalPnL + (fallbackAccount.balance || 0)
        } : null);
      }
    }
  };

  const refreshPortfolioBalances = async () => {
    if (!currentPortfolio) return;

    try {
      // Re-fetch accounts for the current portfolio to get the latest balances
      const accounts = await database.getAccountsByPortfolioId(currentPortfolio.id);

      setCurrentPortfolio({
        ...currentPortfolio,
        accounts,
        totalPnL: accounts.reduce((sum, account) => sum + account.balance, 0)
      });
    } catch (error) {
      console.error('Failed to refresh portfolio balances', error);
      
      // Fallback: keep existing portfolio state
      if (currentPortfolio) {
        setCurrentPortfolio(prev => prev ? {
          ...prev,
          totalPnL: prev.accounts.reduce((sum, account) => sum + account.balance, 0)
        } : null);
      }
    }
  };

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      currentPortfolio,
      createPortfolio,
      switchPortfolio,
      addAccountToPortfolio,
      refreshPortfolioBalances
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
};

// Legacy export for backward compatibility
export const usePortfolios = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolios must be used within a PortfolioProvider');
  }
  return {
    selectedAccountId: context.currentPortfolio?.accounts?.[0]?.id || null,
    accounts: context.currentPortfolio?.accounts || []
  };
}; 