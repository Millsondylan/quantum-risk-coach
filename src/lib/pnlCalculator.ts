/**
 * PNL Calculator for Quantum Risk Coach
 * Handles accurate forex, stocks, and crypto PNL calculations
 */

export interface TradeCalculation {
  pnl: number;
  pnlPips?: number;
  commission: number;
  netPnl: number;
  percentageGain: number;
  riskRewardRatio?: number;
}

export interface ForexPair {
  base: string;
  quote: string;
  pipValue: number;
  digitsPrecision: number;
}

// Standard forex pairs with pip values (for 1 standard lot = 100,000 units)
const FOREX_PAIRS: Record<string, ForexPair> = {
  'EURUSD': { base: 'EUR', quote: 'USD', pipValue: 10, digitsPrecision: 5 },
  'GBPUSD': { base: 'GBP', quote: 'USD', pipValue: 10, digitsPrecision: 5 },
  'USDJPY': { base: 'USD', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 }, // Approximation, varies with exchange rate
  'USDCHF': { base: 'USD', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'AUDUSD': { base: 'AUD', quote: 'USD', pipValue: 10, digitsPrecision: 5 },
  'NZDUSD': { base: 'NZD', quote: 'USD', pipValue: 10, digitsPrecision: 5 },
  'USDCAD': { base: 'USD', quote: 'CAD', pipValue: 7.46, digitsPrecision: 5 },
  'EURJPY': { base: 'EUR', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'GBPJPY': { base: 'GBP', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'CHFJPY': { base: 'CHF', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'EURGBP': { base: 'EUR', quote: 'GBP', pipValue: 12.5, digitsPrecision: 5 },
  'EURAUD': { base: 'EUR', quote: 'AUD', pipValue: 6.5, digitsPrecision: 5 },
  'EURCHF': { base: 'EUR', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'AUDCAD': { base: 'AUD', quote: 'CAD', pipValue: 7.46, digitsPrecision: 5 },
  'AUDCHF': { base: 'AUD', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'AUDJPY': { base: 'AUD', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'CADCHF': { base: 'CAD', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'CADJPY': { base: 'CAD', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'CHFSGD': { base: 'CHF', quote: 'SGD', pipValue: 7.35, digitsPrecision: 5 },
  'EURSGD': { base: 'EUR', quote: 'SGD', pipValue: 7.35, digitsPrecision: 5 },
  'GBPAUD': { base: 'GBP', quote: 'AUD', pipValue: 6.5, digitsPrecision: 5 },
  'GBPCAD': { base: 'GBP', quote: 'CAD', pipValue: 7.46, digitsPrecision: 5 },
  'GBPCHF': { base: 'GBP', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'GBPNZD': { base: 'GBP', quote: 'NZD', pipValue: 6.2, digitsPrecision: 5 },
  'NZDCAD': { base: 'NZD', quote: 'CAD', pipValue: 7.46, digitsPrecision: 5 },
  'NZDCHF': { base: 'NZD', quote: 'CHF', pipValue: 10.87, digitsPrecision: 5 },
  'NZDJPY': { base: 'NZD', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'SGDJPY': { base: 'SGD', quote: 'JPY', pipValue: 9.52, digitsPrecision: 3 },
  'USDHKD': { base: 'USD', quote: 'HKD', pipValue: 1.28, digitsPrecision: 5 },
  'USDSGD': { base: 'USD', quote: 'SGD', pipValue: 7.35, digitsPrecision: 5 },
};

class PnLCalculator {
  /**
   * Calculate PNL for forex trades
   * @param symbol - Currency pair (e.g., 'EURUSD')
   * @param entryPrice - Entry price
   * @param exitPrice - Exit price (optional for open trades)
   * @param lotSize - Lot size (1 = 100,000 units, 0.1 = 10,000 units)
   * @param side - 'buy' or 'sell'
   * @param commission - Commission in account currency
   * @param accountCurrency - Account currency (default: USD)
   */
  calculateForexPnL(
    symbol: string,
    entryPrice: number,
    exitPrice: number | null,
    lotSize: number,
    side: 'buy' | 'sell',
    commission: number = 0,
    accountCurrency: string = 'USD'
  ): TradeCalculation {
    const upperSymbol = symbol.toUpperCase();
    const pair = FOREX_PAIRS[upperSymbol];
    
    if (!pair) {
      // Handle unknown pairs with default calculation
      return this.calculateGenericPnL(entryPrice, exitPrice, lotSize * 100000, side, commission);
    }

    if (!exitPrice) {
      // Open trade - no PNL yet
      return {
        pnl: 0,
        pnlPips: 0,
        commission,
        netPnl: -commission,
        percentageGain: 0,
        riskRewardRatio: 0
      };
    }

    // Calculate pip difference
    const pipSize = pair.digitsPrecision === 3 ? 0.01 : 0.0001;
    const priceDiff = side === 'buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const pipsGained = priceDiff / pipSize;

    // Calculate PNL in account currency
    const pipValueInAccountCurrency = pair.pipValue * lotSize;
    const grossPnL = pipsGained * pipValueInAccountCurrency;
    const netPnL = grossPnL - commission;

    // Calculate percentage gain based on margin used (approximation)
    const notionalValue = lotSize * 100000 * entryPrice;
    const leverage = 50; // Assume 1:50 leverage
    const marginUsed = notionalValue / leverage;
    const percentageGain = marginUsed > 0 ? (netPnL / marginUsed) * 100 : 0;

    return {
      pnl: grossPnL,
      pnlPips: pipsGained,
      commission,
      netPnl: netPnL,
      percentageGain,
      riskRewardRatio: this.calculateRiskReward(entryPrice, exitPrice, side)
    };
  }

  /**
   * Calculate PNL for stocks
   */
  calculateStockPnL(
    entryPrice: number,
    exitPrice: number | null,
    shares: number,
    side: 'buy' | 'sell',
    commission: number = 0
  ): TradeCalculation {
    if (!exitPrice) {
      return {
        pnl: 0,
        commission,
        netPnl: -commission,
        percentageGain: 0
      };
    }

    const priceDiff = side === 'buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const grossPnL = priceDiff * shares;
    const netPnL = grossPnL - commission;
    
    const investment = entryPrice * shares;
    const percentageGain = investment > 0 ? (netPnL / investment) * 100 : 0;

    return {
      pnl: grossPnL,
      commission,
      netPnl: netPnL,
      percentageGain,
      riskRewardRatio: this.calculateRiskReward(entryPrice, exitPrice, side)
    };
  }

  /**
   * Calculate PNL for crypto
   */
  calculateCryptoPnL(
    entryPrice: number,
    exitPrice: number | null,
    quantity: number,
    side: 'buy' | 'sell',
    commission: number = 0
  ): TradeCalculation {
    if (!exitPrice) {
      return {
        pnl: 0,
        commission,
        netPnl: -commission,
        percentageGain: 0
      };
    }

    const priceDiff = side === 'buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const grossPnL = priceDiff * quantity;
    const netPnL = grossPnL - commission;
    
    const investment = entryPrice * quantity;
    const percentageGain = investment > 0 ? (netPnL / investment) * 100 : 0;

    return {
      pnl: grossPnL,
      commission,
      netPnl: netPnL,
      percentageGain,
      riskRewardRatio: this.calculateRiskReward(entryPrice, exitPrice, side)
    };
  }

  /**
   * Generic PNL calculation for unknown instruments
   */
  private calculateGenericPnL(
    entryPrice: number,
    exitPrice: number | null,
    quantity: number,
    side: 'buy' | 'sell',
    commission: number = 0
  ): TradeCalculation {
    if (!exitPrice) {
      return {
        pnl: 0,
        commission,
        netPnl: -commission,
        percentageGain: 0
      };
    }

    const priceDiff = side === 'buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const grossPnL = priceDiff * quantity;
    const netPnL = grossPnL - commission;
    
    const investment = entryPrice * quantity;
    const percentageGain = investment > 0 ? (netPnL / investment) * 100 : 0;

    return {
      pnl: grossPnL,
      commission,
      netPnl: netPnL,
      percentageGain,
      riskRewardRatio: this.calculateRiskReward(entryPrice, exitPrice, side)
    };
  }

  /**
   * Calculate risk/reward ratio
   */
  private calculateRiskReward(
    entryPrice: number,
    exitPrice: number,
    side: 'buy' | 'sell'
  ): number {
    const priceDiff = side === 'buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const percentageMove = Math.abs(priceDiff / entryPrice) * 100;
    return percentageMove;
  }

  /**
   * Auto-detect instrument type and calculate PNL
   */
  calculatePnL(
    symbol: string,
    entryPrice: number,
    exitPrice: number | null,
    quantity: number,
    side: 'buy' | 'sell',
    commission: number = 0
  ): TradeCalculation {
    const upperSymbol = symbol.toUpperCase();

    // Check if it's a forex pair
    if (FOREX_PAIRS[upperSymbol] || upperSymbol.length === 6) {
      // Assume quantity represents lot size for forex
      return this.calculateForexPnL(upperSymbol, entryPrice, exitPrice, quantity, side, commission);
    }
    
    // Check if it's crypto (common patterns)
    if (upperSymbol.includes('USD') || upperSymbol.includes('BTC') || upperSymbol.includes('ETH') || 
        upperSymbol.endsWith('USDT') || upperSymbol.endsWith('BUSD')) {
      return this.calculateCryptoPnL(entryPrice, exitPrice, quantity, side, commission);
    }
    
    // Default to stock calculation
    return this.calculateStockPnL(entryPrice, exitPrice, quantity, side, commission);
  }

  /**
   * Calculate required margin for a trade
   */
  calculateMargin(
    symbol: string,
    price: number,
    quantity: number,
    leverage: number = 50
  ): number {
    const upperSymbol = symbol.toUpperCase();
    
    if (FOREX_PAIRS[upperSymbol] || upperSymbol.length === 6) {
      // Forex: quantity is lot size, 1 lot = 100,000 units
      const notionalValue = quantity * 100000 * price;
      return notionalValue / leverage;
    }
    
    // Stocks/Crypto: full value unless leveraged
    const notionalValue = quantity * price;
    return leverage > 1 ? notionalValue / leverage : notionalValue;
  }

  /**
   * Calculate position size based on risk
   */
  calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number,
    symbol: string
  ): number {
    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    
    if (priceRisk === 0) return 0;
    
    const upperSymbol = symbol.toUpperCase();
    
    if (FOREX_PAIRS[upperSymbol] || upperSymbol.length === 6) {
      // For forex, calculate lot size
      const pair = FOREX_PAIRS[upperSymbol];
      if (pair) {
        const pipSize = pair.digitsPrecision === 3 ? 0.01 : 0.0001;
        const riskedPips = priceRisk / pipSize;
        const maxLotSize = riskAmount / (riskedPips * pair.pipValue);
        return Math.round(maxLotSize * 100) / 100; // Round to 2 decimal places
      }
    }
    
    // For stocks/crypto, calculate number of shares/units
    return Math.floor(riskAmount / priceRisk);
  }
}

// Export singleton instance
export const pnlCalculator = new PnLCalculator();

// Helper functions for components
export const formatPnL = (pnl: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(pnl);
};

export const formatPips = (pips: number): string => {
  return `${pips >= 0 ? '+' : ''}${pips.toFixed(1)} pips`;
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
}; 