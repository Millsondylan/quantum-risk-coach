import { usePortfolios } from '@/contexts/PortfolioContext';
import { useTrades } from './useTrades';

export const useLocalTrades = () => {
  const { selectedAccountId } = usePortfolios();
  return useTrades(selectedAccountId || '');
}; 