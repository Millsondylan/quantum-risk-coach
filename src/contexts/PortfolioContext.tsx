import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { database } from '@/lib/localDatabase';
import { realBrokerService } from '@/lib/realBrokerService';
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
  const brokerService = realBrokerService;

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
    }
  };

  const createDefaultPortfolio = async () => {
    await createPortfolio({
      name: 'My First Portfolio',
      color: '#007bff',
      icon: '📈'
    });
  };

  const createPortfolio = async (portfolioData: Omit<Portfolio, 'id' | 'createdAt'>) => {
    try {
      const newPortfolioId = `portfolio_${Date.now()}`;
      
      await database.createPortfolio({
        id: newPortfolioId,
        ...portfolioData,
        createdAt: new Date().toISOString()
      });

      const updatedPortfolios = await database.getPortfolios();
      setPortfolios(updatedPortfolios);
      
      // Automatically switch to new portfolio
      await switchPortfolio(newPortfolioId);
    } catch (error) {
      console.error('Failed to create portfolio', error);
    }
  };

  const switchPortfolio = async (portfolioId: string) => {
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
  };

  const addAccountToPortfolio = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    try {
      const newAccountId = `account_${Date.now()}`;
      
      await database.createAccount({
        id: newAccountId,
        ...accountData,
        createdAt: new Date().toISOString()
      });

      // Refresh current portfolio to reflect new account
      if (currentPortfolio) {
        await switchPortfolio(currentPortfolio.id);
      }
    } catch (error) {
      console.error('Failed to add account to portfolio', error);
    }
  };

  const refreshPortfolioBalances = async () => {
    if (!currentPortfolio) return;

    const brokerAccounts = currentPortfolio.accounts.filter(a => a.type === 'broker');
    
    for (const account of brokerAccounts) {
      try {
        const connection = brokerService.getConnection(account.id);
        if (connection) {
          const balance = await brokerService.getAccountBalance(connection.id);
          
          // Update account balance in database
          await database.updateAccountBalance(account.id, balance);
        }
      } catch (error) {
        console.error(`Failed to refresh balance for account ${account.id}`, error);
      }
    }

    // Refresh current portfolio view
    await switchPortfolio(currentPortfolio.id);
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